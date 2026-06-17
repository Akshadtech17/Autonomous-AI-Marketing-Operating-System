import asyncio
import logging
import time
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from models.campaign import Campaign, CampaignStatus
from models.agent_log import AgentLog, AgentState
from core.state_machine import StateMachine, StateTransitionError
from core.event_emitter import event_emitter
from schemas.event import SystemEvent, EventType
from memory.memory_manager import MemoryManager
from agents.ceo_agent import CEOAgent

logger = logging.getLogger(__name__)

AGENT_STATE_MAP = {
    "research_agent":          CampaignStatus.RUNNING_RESEARCH,
    "seo_agent":               CampaignStatus.RUNNING_SEO,
    "content_agent":           CampaignStatus.RUNNING_CONTENT,
    "social_agent":            CampaignStatus.RUNNING_SOCIAL,
    "analytics_agent":         CampaignStatus.RUNNING_ANALYTICS,
    "creative_director_agent": CampaignStatus.RUNNING_ANALYTICS,
    "report_agent":            CampaignStatus.REPORT_GENERATION,
}


class WorkflowEngine:
    def __init__(self, db: Session):
        self.db = db
        self.memory = MemoryManager(db)
        self.ceo = CEOAgent()   # CEO owns and manages all specialist agents

    async def run_campaign(self, campaign_id: str):
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            raise ValueError(f"Campaign {campaign_id} not found")

        sm = StateMachine(campaign.status)

        try:
            await self._transition(campaign, sm, CampaignStatus.PLANNING)
            await event_emitter.emit(SystemEvent(
                campaign_id=campaign_id,
                type=EventType.CAMPAIGN_CREATED,
                message=f"Campaign '{campaign.business_name}' planning started",
            ))

            await event_emitter.emit_agent_update(
                campaign_id=campaign_id,
                agent="ceo_agent",
                state="RUNNING",
                progress=10,
                message="CEO Agent: analysing campaign brief and orchestrating all specialist agents",
            )

            ceo_start = time.monotonic()

            # CEO takes full control — plans and drives every agent
            result = await self.ceo.orchestrate(
                campaign=campaign,
                memory=self.memory,
                on_node_start=self._make_start_handler(campaign, sm),
                on_node_complete=self._make_complete_handler(campaign),
                on_node_failed=self._make_failed_handler(campaign),
            )

            ceo_elapsed = int((time.monotonic() - ceo_start) * 1000)

            campaign.dag = result["plan"]
            existing = dict(campaign.agent_outputs or {})
            existing.update(result["agent_outputs"])
            campaign.agent_outputs = existing
            flag_modified(campaign, "agent_outputs")
            self.db.commit()

            await event_emitter.emit_agent_update(
                campaign_id=campaign_id,
                agent="ceo_agent",
                state="COMPLETED",
                progress=100,
                message=f"CEO Agent: all {len(result['agent_outputs'])} specialist agents completed",
                data={"confidence_score": 0.95, "duration_ms": ceo_elapsed},
            )

            await self._transition(campaign, sm, CampaignStatus.REVIEW)
            await asyncio.sleep(0.3)
            await self._transition(campaign, sm, CampaignStatus.REPORT_GENERATION)
            await asyncio.sleep(0.3)

            campaign.completed_at = datetime.utcnow()
            await self._transition(campaign, sm, CampaignStatus.COMPLETED)

            await event_emitter.emit(SystemEvent(
                campaign_id=campaign_id,
                type=EventType.STATE_CHANGED,
                state="COMPLETED",
                message="Campaign completed successfully",
                progress=100,
            ))

        except StateTransitionError as exc:
            logger.critical("State machine violation: %s", exc)
            await self._fail_campaign(campaign, str(exc))
            raise
        except Exception as exc:
            logger.error("Campaign %s failed: %s", campaign_id, exc, exc_info=True)
            await self._fail_campaign(campaign, str(exc))
            raise

    # ------------------------------------------------------------------
    # Callbacks: CEO calls these; WorkflowEngine handles DB + WebSocket
    # ------------------------------------------------------------------

    def _make_start_handler(self, campaign: Campaign, sm: StateMachine):
        async def handler(task_id: str, agent_name: str):
            target_state = AGENT_STATE_MAP.get(agent_name)
            if target_state and sm.can_transition(target_state):
                await self._transition(campaign, sm, target_state)

            log = AgentLog(
                campaign_id=campaign.id,
                agent_name=agent_name,
                task_id=task_id,
                state=AgentState.RUNNING,
            )
            self.db.add(log)
            self.db.commit()

            await event_emitter.emit_agent_update(
                campaign_id=campaign.id,
                agent=agent_name,
                state="RUNNING",
                progress=10,
                message=f"{agent_name} dispatched by CEO",
            )
        return handler

    def _make_complete_handler(self, campaign: Campaign):
        async def handler(task_id: str, agent_name: str, output: dict,
                          confidence: float, elapsed_ms: int):
            log = (
                self.db.query(AgentLog)
                .filter(AgentLog.campaign_id == campaign.id, AgentLog.task_id == task_id)
                .first()
            )
            if log:
                log.state = AgentState.COMPLETED
                log.output = output
                log.confidence_score = confidence
                log.duration_ms = elapsed_ms
                log.completed_at = datetime.utcnow()
                self.db.commit()

            self.memory.store_agent_output(campaign.id, agent_name, output)

            await event_emitter.emit_agent_update(
                campaign_id=campaign.id,
                agent=agent_name,
                state="COMPLETED",
                progress=100,
                message=f"{agent_name} completed",
                data={"confidence_score": confidence, "duration_ms": elapsed_ms},
            )
        return handler

    def _make_failed_handler(self, campaign: Campaign):
        async def handler(task_id: str, agent_name: str, error: str, elapsed_ms: int):
            log = (
                self.db.query(AgentLog)
                .filter(AgentLog.campaign_id == campaign.id, AgentLog.task_id == task_id)
                .first()
            )
            if log:
                log.state = AgentState.FAILED
                log.error_message = error
                log.duration_ms = elapsed_ms
                self.db.commit()

            await event_emitter.emit(SystemEvent(
                campaign_id=campaign.id,
                type=EventType.AGENT_FAILED,
                agent=agent_name,
                state="FAILED",
                message=error,
            ))
        return handler

    # ------------------------------------------------------------------

    async def _transition(self, campaign: Campaign, sm: StateMachine, target: CampaignStatus):
        sm.transition(target)
        campaign.status = target
        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        await event_emitter.emit_state_change(campaign.id, target.value)

    async def _fail_campaign(self, campaign: Campaign, error: str):
        campaign.status = CampaignStatus.FAILED
        campaign.error_message = error
        campaign.updated_at = datetime.utcnow()
        self.db.commit()
        await event_emitter.emit(SystemEvent(
            campaign_id=campaign.id,
            type=EventType.STATE_CHANGED,
            state="FAILED",
            message=error,
        ))
