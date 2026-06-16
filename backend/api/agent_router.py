from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.agent_log import AgentLog
from schemas.agent import AgentLogResponse

router = APIRouter(prefix="/agents", tags=["agents"])

AGENT_NAMES = [
    "ceo_agent", "research_agent", "seo_agent",
    "content_agent", "social_agent", "analytics_agent",
    "creative_director_agent", "report_agent",
]

@router.get("/status")
def agents_status():
    return {
        "agents": [
            {
                "name": name,
                "role": _agent_role(name),
                "type": "orchestrator" if name == "ceo_agent" else "executor",
            }
            for name in AGENT_NAMES
        ]
    }

@router.get("/logs/{campaign_id}", response_model=list[AgentLogResponse])
def agent_logs(campaign_id: str, db: Session = Depends(get_db)):
    logs = (
        db.query(AgentLog)
        .filter(AgentLog.campaign_id == campaign_id)
        .order_by(AgentLog.timestamp)
        .all()
    )
    return [AgentLogResponse.model_validate(log) for log in logs]

def _agent_role(name: str) -> str:
    roles = {
        "ceo_agent": "Chief Executive Orchestrator",
        "research_agent": "Market Research Specialist",
        "seo_agent": "SEO Strategy Specialist",
        "content_agent": "Content Strategy Director",
        "social_agent": "Social Media Strategy Manager",
        "analytics_agent": "Marketing Analytics Specialist",
        "creative_director_agent": "Creative Director",
        "report_agent": "Executive Report Compiler",
    }
    return roles.get(name, "Unknown")
