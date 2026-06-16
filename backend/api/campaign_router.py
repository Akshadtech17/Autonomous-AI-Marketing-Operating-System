import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models.campaign import Campaign, CampaignStatus
from schemas.campaign import CampaignCreate, CampaignResponse, CampaignSummary
from schemas.event import SystemEvent, EventType
from core.event_emitter import event_emitter
from workers.campaign_worker import campaign_worker

router = APIRouter(prefix="/campaign", tags=["campaigns"])

@router.post("/create", response_model=CampaignResponse, status_code=201)
async def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    campaign = Campaign(
        id=str(uuid.uuid4()),
        business_name=payload.business_name,
        industry=payload.industry,
        location=payload.location,
        goal=payload.goal,
        target_audience=payload.target_audience,
        budget=payload.budget,
        status=CampaignStatus.CREATED,
        agent_outputs={},
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    await event_emitter.emit(SystemEvent(
        campaign_id=campaign.id,
        type=EventType.CAMPAIGN_CREATED,
        message=f"Campaign '{campaign.business_name}' created",
    ))

    return campaign

@router.post("/{campaign_id}/run", status_code=202)
async def run_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.status not in (CampaignStatus.CREATED, CampaignStatus.FAILED):
        raise HTTPException(
            status_code=409,
            detail=f"Campaign cannot be run from status: {campaign.status}",
        )
    campaign.status = CampaignStatus.CREATED
    db.commit()

    await campaign_worker.enqueue(campaign_id)
    return {"message": "Campaign queued for execution", "campaign_id": campaign_id}

@router.get("/{campaign_id}/status", response_model=CampaignResponse)
def get_campaign_status(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

@router.get("/{campaign_id}/logs")
def get_campaign_logs(campaign_id: str, db: Session = Depends(get_db)):
    from models.agent_log import AgentLog
    from schemas.agent import AgentLogResponse
    logs = db.query(AgentLog).filter(AgentLog.campaign_id == campaign_id).all()
    return [AgentLogResponse.model_validate(log) for log in logs]

@router.get("/", response_model=list[CampaignSummary])
def list_campaigns(db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).order_by(Campaign.created_at.desc()).limit(50).all()
    return campaigns
