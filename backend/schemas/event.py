import enum
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, Field
import uuid

class EventType(str, enum.Enum):
    CAMPAIGN_CREATED = "CAMPAIGN_CREATED"
    STATE_CHANGED = "STATE_CHANGED"
    AGENT_STARTED = "AGENT_STARTED"
    AGENT_UPDATE = "AGENT_UPDATE"
    AGENT_COMPLETED = "AGENT_COMPLETED"
    AGENT_FAILED = "AGENT_FAILED"
    MEMORY_UPDATED = "MEMORY_UPDATED"
    REPORT_GENERATED = "REPORT_GENERATED"
    SYSTEM_ERROR = "SYSTEM_ERROR"
    HEARTBEAT = "HEARTBEAT"

class SystemEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    campaign_id: Optional[str] = None
    type: EventType
    agent: Optional[str] = None
    state: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    message: str = ""
    data: Optional[Any] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
