import json
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, field_validator

class AgentOutput(BaseModel):
    agent: str
    task_id: str
    input_summary: str
    output: str
    key_insights: List[str] = Field(default_factory=list)
    confidence_score: float = Field(ge=0.0, le=1.0)
    dependencies: List[str] = Field(default_factory=list)
    memory_updates: List[Dict[str, Any]] = Field(default_factory=list)
    timestamp: str

    @field_validator("output", mode="before")
    @classmethod
    def coerce_output_to_str(cls, v: Any) -> str:
        if isinstance(v, str):
            return v
        if isinstance(v, (dict, list)):
            return json.dumps(v, indent=2)
        return str(v)

    @field_validator("input_summary", mode="before")
    @classmethod
    def coerce_input_summary(cls, v: Any) -> str:
        if isinstance(v, str):
            return v
        return str(v) if v else "Task received"

    @field_validator("key_insights", mode="before")
    @classmethod
    def coerce_insights(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return [str(i) for i in v]
        if isinstance(v, str):
            return [v]
        return ["Analysis complete"]

    @field_validator("dependencies", mode="before")
    @classmethod
    def coerce_dependencies(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return [json.dumps(i) if isinstance(i, (dict, list)) else str(i) for i in v]
        if isinstance(v, str):
            return [v]
        return []

    @field_validator("memory_updates", mode="before")
    @classmethod
    def coerce_memory_updates(cls, v: Any) -> List[Dict[str, Any]]:
        if isinstance(v, list):
            return [i if isinstance(i, dict) else {"value": str(i)} for i in v]
        return []

    @field_validator("timestamp", mode="before")
    @classmethod
    def coerce_timestamp(cls, v: Any) -> str:
        if v is None or v == "":
            from datetime import datetime
            return datetime.utcnow().isoformat()
        return str(v)

    @field_validator("confidence_score", mode="before")
    @classmethod
    def clamp_confidence(cls, v: Any) -> float:
        try:
            f = float(v)
            return max(0.0, min(1.0, f))
        except (TypeError, ValueError):
            return 0.7

class AgentLogResponse(BaseModel):
    id: str
    campaign_id: str
    agent_name: str
    task_id: str
    state: str
    confidence_score: Optional[float]
    retry_count: int
    error_message: Optional[str]
    duration_ms: Optional[int]
    model_used: Optional[str]
    timestamp: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
