from agents.base_agent import BaseAgent

class CreativeDirectorAgent(BaseAgent):
    name = "creative_director_agent"
    role = "Creative Director"
    system_prompt = (
        "You are a creative director. "
        "Return a concise brand and creative strategy as valid JSON only."
    )

    def _build_prompt(self, task: dict, memory: dict, context: dict) -> str:
        campaign = memory.get("campaign_context", {})
        base = super()._build_prompt(task, memory, context)
        return (
            f"Create brand direction for: {campaign.get('business_name')} ({campaign.get('industry')})\n"
            f"Goal: {campaign.get('goal')}\n\n"
            "Cover: brand positioning statement, visual identity (colours, tone), campaign big idea, 2 creative concepts.\n\n"
            + base
        )
