from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from models.campaign import CampaignStatus

class CampaignCreate(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=200)
    industry: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    goal: str = Field(..., min_length=10, max_length=2000)
    target_audience: Optional[str] = Field(None, max_length=500)
    budget: Optional[str] = Field(None, max_length=100)

class CampaignResponse(BaseModel):
    id: str
    business_name: str
    industry: str
    location: str
    goal: str
    target_audience: Optional[str]
    budget: Optional[str]
    status: CampaignStatus
    dag: Optional[Dict[str, Any]]
    agent_outputs: Optional[Dict[str, Any]]
    report_path: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class CampaignSummary(BaseModel):
    id: str
    business_name: str
    industry: str
    status: CampaignStatus
    created_at: datetime

    class Config:
        from_attributes = True
