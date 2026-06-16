import json
from agents.base_agent import BaseAgent

class ReportAgent(BaseAgent):
    name = "report_agent"
    role = "Executive Report Compiler"
    system_prompt = (
        "You are an executive marketing strategist. "
        "Synthesise agent outputs into a concise report as valid JSON only."
    )

    def _build_prompt(self, task: dict, memory: dict, context: dict) -> str:
        campaign = memory.get("campaign_context", {})
        prev = context.get("previous_outputs", [])
        base = super()._build_prompt(task, memory, context)

        summaries = "\n".join(
            f"- {p.get('agent','?')}: {str(p.get('output',''))[:150]}"
            for p in prev
        )

        return (
            f"Compile executive report for: {campaign.get('business_name')} ({campaign.get('industry')})\n"
            f"Goal: {campaign.get('goal')}\n\n"
            f"Agent summaries:\n{summaries}\n\n"
            "Cover: executive summary, top 3 strategic priorities, 90-day action plan, expected ROI.\n\n"
            + base
        )
