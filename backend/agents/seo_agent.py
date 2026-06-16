from agents.base_agent import BaseAgent

class SEOAgent(BaseAgent):
    name = "seo_agent"
    role = "SEO Strategy Specialist"
    system_prompt = (
        "You are an SEO strategist. "
        "Return a focused SEO plan as valid JSON only."
    )

    def _build_prompt(self, task: dict, memory: dict, context: dict) -> str:
        campaign = memory.get("campaign_context", {})
        prev = context.get("previous_outputs", [])
        research = next((p.get("output","") for p in prev if p.get("agent") == "research_agent"), "")
        base = super()._build_prompt(task, memory, context)
        return (
            f"Create SEO strategy for: {campaign.get('business_name')} ({campaign.get('industry')}, {campaign.get('location')})\n"
            f"Research summary: {str(research)[:200]}\n\n"
            "Cover: 5 primary keywords, on-page recommendations, local SEO tactics, 90-day ranking goal.\n\n"
            + base
        )
