import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models.campaign import Campaign, CampaignStatus
from reports.pdf_generator import PDFReportGenerator

router = APIRouter(prefix="/report", tags=["reports"])

@router.get("/{campaign_id}")
async def get_report(campaign_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if campaign.status != CampaignStatus.COMPLETED:
        raise HTTPException(
            status_code=409,
            detail=f"Report not available. Campaign status: {campaign.status}",
        )

    if campaign.report_path and os.path.exists(campaign.report_path):
        return FileResponse(
            campaign.report_path,
            media_type="application/pdf",
            filename=f"report_{campaign.business_name.replace(' ', '_')}.pdf",
        )

    generator = PDFReportGenerator()
    campaign_dict = {
        "id": campaign.id,
        "business_name": campaign.business_name,
        "industry": campaign.industry,
        "location": campaign.location,
        "goal": campaign.goal,
    }
    report_path = generator.generate(campaign_dict, campaign.agent_outputs or {})

    campaign.report_path = report_path
    db.commit()

    return FileResponse(
        report_path,
        media_type="application/pdf",
        filename=f"report_{campaign.business_name.replace(' ', '_')}.pdf",
    )

@router.post("/{campaign_id}/generate")
async def generate_report(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    generator = PDFReportGenerator()
    campaign_dict = {
        "id": campaign.id,
        "business_name": campaign.business_name,
        "industry": campaign.industry,
        "location": campaign.location,
        "goal": campaign.goal,
    }
    report_path = generator.generate(campaign_dict, campaign.agent_outputs or {})
    campaign.report_path = report_path
    db.commit()

    return {"message": "Report generated", "path": report_path, "campaign_id": campaign_id}
