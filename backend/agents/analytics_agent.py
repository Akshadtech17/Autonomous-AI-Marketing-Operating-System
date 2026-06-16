from agents.base_agent import BaseAgent

class AnalyticsAgent(BaseAgent):
    name = "analytics_agent"
    role = "Marketing Analytics Specialist"
    system_prompt = (
        "You are a marketing analytics expert. "
        "Return a concise KPI framework as valid JSON only."
    )

    def _build_prompt(self, task: dict, memory: dict, context: dict) -> str:
        campaign = memory.get("campaign_context", {})
        base = super()._build_prompt(task, memory, context)
        return (
            f"Define analytics framework for: {campaign.get('business_name')}\n"
            f"Goal: {campaign.get('goal')} | Budget: {campaign.get('budget','unspecified')}\n\n"
            "Cover: 5 primary KPIs with targets, tracking tools, 90-day traffic forecast, ROI estimate.\n\n"
            + base
        )
