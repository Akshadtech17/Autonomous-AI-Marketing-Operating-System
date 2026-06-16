from agents.base_agent import BaseAgent

class ResearchAgent(BaseAgent):
    name = "research_agent"
    role = "Market Research Specialist"
    system_prompt = (
        "You are a market research analyst. "
        "Analyse the business and return concise, data-driven insights as valid JSON only."
    )

    def _build_prompt(self, task: dict, memory: dict, context: dict) -> str:
        campaign = memory.get("campaign_context", {})
        base = super()._build_prompt(task, memory, context)
        return (
            f"Conduct market research for:\n"
            f"Business: {campaign.get('business_name')} | Industry: {campaign.get('industry')} | "
            f"Location: {campaign.get('location')} | Audience: {campaign.get('target_audience','General')}\n\n"
            "Cover: industry trends, target audience profile, top 3 competitors, key opportunities.\n\n"
            + base
        )
