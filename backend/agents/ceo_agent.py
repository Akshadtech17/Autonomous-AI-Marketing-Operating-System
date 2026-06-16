import logging
from datetime import datetime
from typing import Any
from services.ollama_service import ollama_service
from core.dag_engine import DAGEngine, DAGExecutionPlan

logger = logging.getLogger(__name__)

class CEOAgent:
    """Pure orchestrator — never executes content tasks."""
    name = "ceo_agent"
    role = "Chief Executive Orchestrator"

    SYSTEM_PROMPT = (
        "You are the CEO of a world-class AI marketing agency. "
        "Your ONLY job is strategic planning and DAG orchestration. "
        "You NEVER write content, SEO, or social media posts. "
        "You analyse the campaign brief and produce a structured execution plan. "
        "Return ONLY valid JSON."
    )

    def __init__(self):
        self._dag_engine = DAGEngine()

    async def plan(self, campaign: dict) -> DAGExecutionPlan:
        logger.info("[CEO] Planning campaign: %s", campaign.get("id"))

        prompt = (
            f"CAMPAIGN BRIEF:\n{self._json_safe(campaign)}\n\n"
            "Produce a brief strategic plan for this marketing campaign. "
            "Return JSON with fields: strategy_summary, key_objectives (list), "
            "target_channels (list), timeline_estimate, risk_factors (list)."
        )

        try:
            raw, _ = await ollama_service.generate(self.SYSTEM_PROMPT, prompt)
            strategy = ollama_service.extract_json(raw)
            logger.info("[CEO] Strategy generated: %s", strategy.get("strategy_summary", "")[:80])
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

    @staticmethod
    def _json_safe(obj: Any) -> str:
        import json
        try:
            return json.dumps(obj, indent=2, default=str)
        except Exception:
            return str(obj)
