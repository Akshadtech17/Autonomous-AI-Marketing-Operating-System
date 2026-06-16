from agents.base_agent import BaseAgent

class SocialMediaAgent(BaseAgent):
    name = "social_agent"
    role = "Social Media Strategy Manager"
    system_prompt = (
        "You are a social media strategist. "
        "Return a focused social media plan as valid JSON only."
    )

    def _build_prompt(self, task: dict, memory: dict, context: dict) -> str:
        campaign = memory.get("campaign_context", {})
        base = super()._build_prompt(task, memory, context)
        return (
            f"Create social media strategy for: {campaign.get('business_name')} ({campaign.get('industry')})\n"
            f"Audience: {campaign.get('target_audience','General')} | Budget: {campaign.get('budget','unspecified')}\n\n"
            "Cover: best platforms, posting frequency, 3 sample post ideas, paid social budget split, key KPIs.\n\n"
            + base
        )
