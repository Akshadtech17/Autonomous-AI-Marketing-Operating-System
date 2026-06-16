import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Enum as SAEnum, Text, Float, Integer, ForeignKey
from database import Base

class AgentState(str, enum.Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRYING = "RETRYING"

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    agent_name = Column(String, nullable=False)
    task_id = Column(String, nullable=False)
    input = Column(JSON, nullable=True)
    output = Column(JSON, nullable=True)
    state = Column(SAEnum(AgentState), default=AgentState.PENDING, nullable=False)
    confidence_score = Column(Float, nullable=True)
    retry_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    model_used = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
