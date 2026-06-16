import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Enum as SAEnum, ForeignKey
from database import Base

class MemoryType(str, enum.Enum):
    SESSION = "session"
    CAMPAIGN = "campaign"
    BUSINESS = "business"
    GLOBAL = "global"

class MemoryStore(Base):
    __tablename__ = "memory_store"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=True)
    memory_type = Column(SAEnum(MemoryType), nullable=False)
    key = Column(String, nullable=False)
    data = Column(JSON, nullable=False)
    version = Column(String, default="1")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
