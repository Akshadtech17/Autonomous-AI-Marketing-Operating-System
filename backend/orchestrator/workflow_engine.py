import asyncio
import logging
import time
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from models.campaign import Campaign, CampaignStatus
from models.agent_log import AgentLog, AgentState
from core.state_machine import StateMachine, StateTransitionError
from core.dag_engine import DAGEngine, NodeStatus
from core.event_emitter import event_emitter
from schemas.event import SystemEvent, EventType
from memory.memory_manager import MemoryManager
from agents.ceo_agent import CEOAgent
from agents.research_agent import ResearchAgent
from agents.seo_agent import SEOAgent
from agents.content_agent import ContentAgent
from agents.social_agent import SocialMediaAgent
from agents.analytics_agent import AnalyticsAgent
from agents.creative_agent import CreativeDirectorAgent
from agents.report_agent import ReportAgent

logger = logging.getLogger(__name__)

AGENT_STATE_MAP = {
    "research_agent": CampaignStatus.RUNNING_RESEARCH,
    "seo_agent": CampaignStatus.RUNNING_SEO,
    "content_agent": CampaignStatus.RUNNING_CONTENT,
    "social_agent": CampaignStatus.RUNNING_SOCIAL,
    "analytics_agent": CampaignStatus.RUNNING_ANALYTICS,
    "creative_director_agent": CampaignStatus.RUNNING_ANALYTICS,
    "report_agent": CampaignStatus.REPORT_GENERATION,
}

AGENTS = {
    "research_agent": ResearchAgent(),
    "seo_agent": SEOAgent(),
    "content_agent": ContentAgent(),
    "social_agent": SocialMediaAgent(),
    "analytics_agent": AnalyticsAgent(),
    "creative_director_agent": CreativeDirectorAgent(),
    "report_agent": ReportAgent(),
}

class WorkflowEngine:
    def __init__(self, db: Session):
        self.db = db
        self.memory = MemoryManager(db)
        self.ceo = CEOAgent()
        self.dag_engine = DAGEngine()

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
                message="CEO Agent: analysing campaign brief and building execution plan",
            )

            _ceo_start = time.monotonic()
            plan = await self.ceo.plan({
                "id": campaign.id,
                "business_name": campaign.business_name,
                "industry": campaign.industry,
                "location": campaign.location,
                "goal": campaign.goal,
                "target_audience": campaign.target_audience,
                "budget": campaign.budget,
            })
            _ceo_elapsed = int((time.monotonic() - _ceo_start) * 1000)

            campaign.dag = plan.to_dict()
            self.db.commit()

            await event_emitter.emit_agent_update(
                campaign_id=campaign_id,
                agent="ceo_agent",
                state="COMPLETED",
                progress=100,
                message=f"CEO Agent: DAG execution plan ready ({len(plan.nodes)} agents queued)",
                data={"confidence_score": 0.95, "duration_ms": _ceo_elapsed},
            )

            previous_outputs = []

            for level in plan.execution_order:
                tasks = [self._execute_node(campaign, sm, plan, tid, previous_outputs)
                         for tid in level]
                results = await asyncio.gather(*tasks, return_exceptions=True)

                for tid, result in zip(level, results):
                    if isinstance(result, Exception):
                        raise result

                for tid in level:
                    node = plan.nodes[tid]
                    if node.status == NodeStatus.COMPLETED and node.output:
                        output_data = node.output if isinstance(node.output, dict) else {}
                        if output_data and "agent" in output_data:
                            previous_outputs.append(output_data)
                            self.memory.store_agent_output(
                                campaign_id, node.agent_name, output_data
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

    async def _execute_node(self, campaign, sm, plan, task_id: str, previous_outputs: list):
        node = plan.nodes[task_id]
        agent = AGENTS.get(node.agent_name)
        if not agent:
            raise ValueError(f"Unknown agent: {node.agent_name}")

        target_state = AGENT_STATE_MAP.get(node.agent_name)
        if target_state and sm.can_transition(target_state):
            await self._transition(campaign, sm, target_state)

        log = AgentLog(
            campaign_id=campaign.id,
            agent_name=node.agent_name,
            task_id=task_id,
            state=AgentState.RUNNING,
        )
        self.db.add(log)
        self.db.commit()

        await event_emitter.emit_agent_update(
            campaign_id=campaign.id,
            agent=node.agent_name,
            state="RUNNING",
            progress=10,
            message=f"{node.agent_name} started",
        )

        start = time.monotonic()
        try:
            mem_context = self.memory.build_agent_context(campaign, previous_outputs)
            task_input = {
                "task_id": task_id,
                "agent_name": node.agent_name,
                "campaign_id": campaign.id,
            }

            output = await agent.execute(task_input, mem_context, mem_context)

            elapsed = int((time.monotonic() - start) * 1000)
            log.state = AgentState.COMPLETED
            log.output = output.model_dump()
            log.confidence_score = output.confidence_score
            log.duration_ms = elapsed
            log.completed_at = datetime.utcnow()
            self.db.commit()

            output_dict = output.model_dump()
            plan.nodes[task_id].status = NodeStatus.COMPLETED
            plan.nodes[task_id].output = output_dict

            existing = dict(campaign.agent_outputs or {})
            existing[node.agent_name] = output_dict
            campaign.agent_outputs = existing
            flag_modified(campaign, "agent_outputs")
            self.db.commit()

            await event_emitter.emit_agent_update(
                campaign_id=campaign.id,
                agent=node.agent_name,
                state="COMPLETED",
                progress=100,
                message=f"{node.agent_name} completed",
                data={"confidence_score": output.confidence_score},
            )

            return output_dict

        except Exception as exc:
            elapsed = int((time.monotonic() - start) * 1000)
            log.state = AgentState.FAILED
            log.error_message = str(exc)
            log.duration_ms = elapsed
            self.db.commit()

            self.dag_engine.mark_failed(plan, task_id, str(exc))

            await event_emitter.emit(SystemEvent(
                campaign_id=campaign.id,
                type=EventType.AGENT_FAILED,
                agent=node.agent_name,
                state="FAILED",
                message=str(exc),
            ))
            raise

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
