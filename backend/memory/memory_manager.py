import logging
from typing import Any, Optional
from sqlalchemy.orm import Session
from models.memory_store import MemoryStore, MemoryType

logger = logging.getLogger(__name__)

class MemoryManager:
    def __init__(self, db: Session):
        self.db = db

    def write(
        self,
        memory_type: MemoryType,
        key: str,
        data: Any,
        campaign_id: Optional[str] = None,
    ) -> MemoryStore:
        existing = self.db.query(MemoryStore).filter(
            MemoryStore.campaign_id == campaign_id,
            MemoryStore.memory_type == memory_type,
            MemoryStore.key == key,
        ).first()

        if existing:
            existing.data = data
            self.db.commit()
            self.db.refresh(existing)
            return existing

        record = MemoryStore(
            campaign_id=campaign_id,
            memory_type=memory_type,
            key=key,
            data=data,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        logger.debug("Memory written: %s/%s (campaign=%s)", memory_type, key, campaign_id)
        return record

    def read(
        self,
        memory_type: MemoryType,
        key: str,
        campaign_id: Optional[str] = None,
    ) -> Optional[Any]:
        record = self.db.query(MemoryStore).filter(
            MemoryStore.campaign_id == campaign_id,
            MemoryStore.memory_type == memory_type,
            MemoryStore.key == key,
        ).first()
        return record.data if record else None

    def build_agent_context(self, campaign: Any, previous_outputs: list) -> dict:
        """Build the standard memory injection payload for every agent."""
        global_mem = self.read(MemoryType.GLOBAL, "industry_knowledge") or {}
        business_mem = self.read(
            MemoryType.BUSINESS,
            "profile",
            campaign_id=campaign.id,
        ) or {}

        return {
            "campaign_context": {
                "id": campaign.id,
                "business_name": campaign.business_name,
                "industry": campaign.industry,
                "location": campaign.location,
                "goal": campaign.goal,
                "target_audience": campaign.target_audience,
                "budget": campaign.budget,
            },
            "previous_outputs": previous_outputs,
            "global_memory": global_mem,
            "business_memory": business_mem,
        }

    def store_agent_output(self, campaign_id: str, agent_name: str, output: dict):
        session_key = f"agent_output_{agent_name}"
        self.write(
            MemoryType.SESSION,
            session_key,
            output,
            campaign_id=campaign_id,
        )

    def get_all_session_outputs(self, campaign_id: str) -> list:
        records = self.db.query(MemoryStore).filter(
            MemoryStore.campaign_id == campaign_id,
            MemoryStore.memory_type == MemoryType.SESSION,
            MemoryStore.key.like("agent_output_%"),
        ).all()
        return [r.data for r in records]
