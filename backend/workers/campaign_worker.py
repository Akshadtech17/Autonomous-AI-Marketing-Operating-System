import asyncio
import logging
from database import SessionLocal
from orchestrator.workflow_engine import WorkflowEngine

logger = logging.getLogger(__name__)

class CampaignWorker:
    def __init__(self):
        self._queue: asyncio.Queue = asyncio.Queue()
        self._running = False

    async def enqueue(self, campaign_id: str):
        await self._queue.put(campaign_id)
        logger.info("Campaign %s enqueued", campaign_id)

    def enqueue_sync(self, campaign_id: str):
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(self.enqueue(campaign_id))
            else:
                loop.run_until_complete(self.enqueue(campaign_id))
        except RuntimeError:
            asyncio.run(self.enqueue(campaign_id))

    async def start(self):
        self._running = True
        logger.info("Campaign worker started")
        while self._running:
            try:
                campaign_id = await asyncio.wait_for(self._queue.get(), timeout=1.0)
                asyncio.create_task(self._process(campaign_id))
            except asyncio.TimeoutError:
                continue
            except Exception as exc:
                logger.error("Worker error: %s", exc)

    async def stop(self):
        self._running = False
        logger.info("Campaign worker stopped")

    async def _process(self, campaign_id: str):
        logger.info("Processing campaign %s", campaign_id)
        db = SessionLocal()
        try:
            engine = WorkflowEngine(db)
            await engine.run_campaign(campaign_id)
        except Exception as exc:
            logger.error("Campaign %s processing failed: %s", campaign_id, exc, exc_info=True)
        finally:
            db.close()

campaign_worker = CampaignWorker()
