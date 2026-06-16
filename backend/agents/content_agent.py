from agents.base_agent import BaseAgent

class ContentAgent(BaseAgent):
    name = "content_agent"
    role = "Content Strategy Director"
    system_prompt = (
        "You are a content strategist. "
        "Return a concise content plan as valid JSON only."
    )

    def _build_prompt(self, task: dict, memory: dict, context: dict) -> str:
        campaign = memory.get("campaign_context", {})
        prev = context.get("previous_outputs", [])
        seo = next((p.get("output","") for p in prev if p.get("agent") == "seo_agent"), "")
        base = super()._build_prompt(task, memory, context)
        return (
            f"Create content strategy for: {campaign.get('business_name')} | Goal: {campaign.get('goal')}\n"
            f"SEO keywords: {str(seo)[:150]}\n\n"
            "Cover: brand voice, 4-week editorial calendar themes, 3 blog ideas, email series concept.\n\n"
            + base
        )
