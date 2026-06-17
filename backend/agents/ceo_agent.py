import asyncio
import logging
import time
from datetime import datetime
from typing import Any, Callable, Optional
from services.ollama_service import ollama_service
from core.dag_engine import DAGEngine, DAGExecutionPlan, NodeStatus

logger = logging.getLogger(__name__)


class CEOAgent:
    """Boss orchestrator — plans the campaign and directly drives all specialist agents."""
    name = "ceo_agent"
    role = "Chief Executive Orchestrator"

    SYSTEM_PROMPT = (
        "You are the Chief Executive Officer and visionary leader of a world-class, award-winning AI-powered marketing agency "
        "that serves businesses across every industry and geography. You have over two decades of experience building "
        "multi-million dollar marketing campaigns for Fortune 500 companies, emerging startups, and local businesses alike. "
        "Your strategic mind operates at the highest altitude — you see the big picture, identify market opportunities, "
        "and translate complex business goals into clear, actionable, and measurable marketing execution plans. "
        "You are an expert in brand strategy, go-to-market planning, competitive positioning, audience segmentation, "
        "channel orchestration, budget allocation, and risk management. "
        "Your ONLY responsibility in this system is strategic planning and DAG (Directed Acyclic Graph) orchestration — "
        "you define the plan, assign specialist agents to their tasks, and ensure every workstream aligns with the overarching "
        "campaign objective. You NEVER write content, social media posts, SEO copy, or creative briefs yourself — those tasks "
        "belong to the specialist agents beneath you. "
        "When given a campaign brief, you analyse the business context deeply: the industry dynamics, competitive landscape, "
        "target audience psychology, available budget, geographic focus, and desired business outcomes. "
        "You then craft a precise, data-informed strategic execution plan that gives every downstream agent the clarity "
        "they need to perform at the highest level. "
        "You think in terms of 30-60-90 day horizons, prioritise high-impact activities, and always ground your strategy "
        "in measurable objectives and key results (OKRs). "
        "You communicate with authority, precision, and clarity. Every word in your plan carries strategic weight. "
        "You MUST return ONLY valid JSON — no preamble, no explanation, no markdown. Raw JSON only."
    )

    def __init__(self):
        from agents.research_agent import ResearchAgent
        from agents.seo_agent import SEOAgent
        from agents.content_agent import ContentAgent
        from agents.social_agent import SocialMediaAgent
        from agents.analytics_agent import AnalyticsAgent
        from agents.creative_agent import CreativeDirectorAgent
        from agents.report_agent import ReportAgent

        self._dag_engine = DAGEngine()

        # CEO owns and manages all specialist agents
        self._agents = {
            "research_agent":        ResearchAgent(),
            "seo_agent":             SEOAgent(),
            "content_agent":         ContentAgent(),
            "social_agent":          SocialMediaAgent(),
            "analytics_agent":       AnalyticsAgent(),
            "creative_director_agent": CreativeDirectorAgent(),
            "report_agent":          ReportAgent(),
        }
        logger.info("[CEO] Initialised with %d specialist agents", len(self._agents))

    # ------------------------------------------------------------------
    # Phase 1: Strategic planning
    # ------------------------------------------------------------------

    async def plan(self, campaign: dict) -> DAGExecutionPlan:
        logger.info("[CEO] Planning campaign: %s", campaign.get("id"))

        prompt = (
            f"CAMPAIGN BRIEF:\n{self._json_safe(campaign)}\n\n"
            "Produce a strategic plan for this marketing campaign. "
            "Return JSON with fields: strategy_summary, key_objectives (list), "
            "target_channels (list), timeline_estimate, risk_factors (list)."
        )

        try:
            raw, _ = await ollama_service.generate(self.SYSTEM_PROMPT, prompt)
            strategy = ollama_service.extract_json(raw)
            logger.info("[CEO] Strategy: %s", strategy.get("strategy_summary", "")[:80])
        except Exception as exc:
            logger.warning("[CEO] Strategy generation failed, using defaults: %s", exc)
            strategy = {
                "strategy_summary": f"Full-stack marketing campaign for {campaign.get('business_name')}",
                "key_objectives": [campaign.get("goal", "Grow brand awareness")],
                "target_channels": ["SEO", "Social Media", "Content Marketing"],
                "timeline_estimate": "30 days",
                "risk_factors": ["Market competition", "Budget constraints"],
            }

        plan = self._dag_engine.build_plan(campaign["id"])
        plan.nodes["research_task"].output = {"ceo_strategy": strategy}
        return plan

    # ------------------------------------------------------------------
    # Phase 2: Orchestration — CEO drives every specialist agent
    # ------------------------------------------------------------------

    async def orchestrate(
        self,
        campaign,
        memory,
        on_node_start: Optional[Callable] = None,
        on_node_complete: Optional[Callable] = None,
        on_node_failed: Optional[Callable] = None,
    ) -> dict:
        """
        CEO runs the full campaign end-to-end.
        Calls each specialist agent in DAG order and passes results downstream.
        """
        campaign_dict = {
            "id": campaign.id,
            "business_name": campaign.business_name,
            "industry": campaign.industry,
            "location": campaign.location,
            "goal": campaign.goal,
            "target_audience": campaign.target_audience,
            "budget": campaign.budget,
        }

        logger.info("[CEO] Orchestrating campaign %s with %d agents",
                    campaign.id, len(self._agents))

        plan = await self.plan(campaign_dict)
        previous_outputs: list = []
        all_outputs: dict = {}

        for level in plan.execution_order:
            logger.info("[CEO] Dispatching level: %s", level)

            level_tasks = [
                self._run_node(
                    plan, task_id, campaign, memory, previous_outputs,
                    on_node_start, on_node_complete, on_node_failed,
                )
                for task_id in level
            ]
            results = await asyncio.gather(*level_tasks, return_exceptions=True)

            for task_id, result in zip(level, results):
                if isinstance(result, Exception):
                    logger.error("[CEO] Agent failed at task %s: %s", task_id, result)
                    raise result

            for task_id in level:
                node = plan.nodes[task_id]
                if node.status == NodeStatus.COMPLETED and isinstance(node.output, dict):
                    if "agent" in node.output:
                        previous_outputs.append(node.output)
                    all_outputs[node.agent_name] = node.output

        logger.info("[CEO] All agents completed for campaign %s", campaign.id)
        return {"plan": plan.to_dict(), "agent_outputs": all_outputs}

    # ------------------------------------------------------------------
    # Internal: run a single DAG node
    # ------------------------------------------------------------------

    async def _run_node(
        self,
        plan: DAGExecutionPlan,
        task_id: str,
        campaign,
        memory,
        previous_outputs: list,
        on_start: Optional[Callable],
        on_complete: Optional[Callable],
        on_failed: Optional[Callable],
    ):
        node = plan.nodes[task_id]
        agent = self._agents.get(node.agent_name)
        if not agent:
            raise ValueError(f"[CEO] Unknown agent: {node.agent_name}")

        logger.info("[CEO] → Dispatching %s", node.agent_name)

        if on_start:
            await on_start(task_id, node.agent_name)

        start = time.monotonic()
        try:
            mem_context = memory.build_agent_context(campaign, previous_outputs)
            task_input = {
                "task_id": task_id,
                "agent_name": node.agent_name,
                "campaign_id": campaign.id,
            }

            output = await agent.execute(task_input, mem_context, mem_context)
            elapsed = int((time.monotonic() - start) * 1000)
            output_dict = output.model_dump()

            plan.nodes[task_id].status = NodeStatus.COMPLETED
            plan.nodes[task_id].output = output_dict

            logger.info("[CEO] ✓ %s done in %dms (confidence=%.0f%%)",
                        node.agent_name, elapsed, output.confidence_score * 100)

            if on_complete:
                await on_complete(task_id, node.agent_name, output_dict,
                                  output.confidence_score, elapsed)

            return output_dict

        except Exception as exc:
            elapsed = int((time.monotonic() - start) * 1000)
            plan.nodes[task_id].status = NodeStatus.FAILED
            plan.nodes[task_id].error = str(exc)
            logger.error("[CEO] ✗ %s failed: %s", node.agent_name, exc)

            if on_failed:
                await on_failed(task_id, node.agent_name, str(exc), elapsed)
            raise

    # ------------------------------------------------------------------

    @staticmethod
    def _json_safe(obj: Any) -> str:
        import json
        try:
            return json.dumps(obj, indent=2, default=str)
        except Exception:
            return str(obj)
