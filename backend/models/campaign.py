import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Enum as SAEnum, Text
from database import Base

class CampaignStatus(str, enum.Enum):
    CREATED = "CREATED"
    PLANNING = "PLANNING"
    RUNNING_RESEARCH = "RUNNING_RESEARCH"
    RUNNING_SEO = "RUNNING_SEO"
    RUNNING_CONTENT = "RUNNING_CONTENT"
    RUNNING_SOCIAL = "RUNNING_SOCIAL"
    RUNNING_ANALYTICS = "RUNNING_ANALYTICS"
    REVIEW = "REVIEW"
    REPORT_GENERATION = "REPORT_GENERATION"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

VALID_TRANSITIONS = {
    CampaignStatus.CREATED: [CampaignStatus.PLANNING],
    CampaignStatus.PLANNING: [CampaignStatus.RUNNING_RESEARCH, CampaignStatus.FAILED],
    CampaignStatus.RUNNING_RESEARCH: [CampaignStatus.RUNNING_SEO, CampaignStatus.FAILED],
    CampaignStatus.RUNNING_SEO: [CampaignStatus.RUNNING_CONTENT, CampaignStatus.FAILED],
    CampaignStatus.RUNNING_CONTENT: [CampaignStatus.RUNNING_SOCIAL, CampaignStatus.FAILED],
    CampaignStatus.RUNNING_SOCIAL: [CampaignStatus.RUNNING_ANALYTICS, CampaignStatus.FAILED],
    CampaignStatus.RUNNING_ANALYTICS: [CampaignStatus.REVIEW, CampaignStatus.FAILED],
    CampaignStatus.REVIEW: [CampaignStatus.REPORT_GENERATION, CampaignStatus.FAILED],
    CampaignStatus.REPORT_GENERATION: [CampaignStatus.COMPLETED, CampaignStatus.FAILED],
    CampaignStatus.COMPLETED: [],
    CampaignStatus.FAILED: [],
}

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    business_name = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    location = Column(String, nullable=False)
    goal = Column(Text, nullable=False)
    target_audience = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    status = Column(SAEnum(CampaignStatus), default=CampaignStatus.CREATED, nullable=False)
    dag = Column(JSON, nullable=True)
    agent_outputs = Column(JSON, default=dict)
    report_path = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
