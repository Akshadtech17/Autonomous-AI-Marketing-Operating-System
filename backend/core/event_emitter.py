import asyncio
import json
import logging
from typing import Dict, Set
from fastapi import WebSocket
from schemas.event import SystemEvent, EventType

logger = logging.getLogger(__name__)

class EventEmitter:
    def __init__(self):
        self._connections: Dict[str, Set[WebSocket]] = {}
        self._global_connections: Set[WebSocket] = set()
        self._history: Dict[str, list] = {}
        self._max_history = 200

    async def connect(self, websocket: WebSocket, campaign_id: str | None = None):
        await websocket.accept()
        if campaign_id:
            self._connections.setdefault(campaign_id, set()).add(websocket)
            for event in self._history.get(campaign_id, []):
                try:
                    await websocket.send_text(event)
                except Exception:
                    pass
        else:
            self._global_connections.add(websocket)
        logger.debug("WebSocket connected: campaign=%s", campaign_id)

    def disconnect(self, websocket: WebSocket, campaign_id: str | None = None):
        if campaign_id:
            self._connections.get(campaign_id, set()).discard(websocket)
        else:
            self._global_connections.discard(websocket)

    async def emit(self, event: SystemEvent):
        payload = event.model_dump_json()
        if event.campaign_id:
            history = self._history.setdefault(event.campaign_id, [])
            history.append(payload)
            if len(history) > self._max_history:
                history.pop(0)

        targets: Set[WebSocket] = set()
        if event.campaign_id:
            targets.update(self._connections.get(event.campaign_id, set()))
        targets.update(self._global_connections)

        dead = set()
        for ws in targets:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.add(ws)

        for ws in dead:
            self.disconnect(ws, event.campaign_id)

    async def emit_agent_update(
        self,
        campaign_id: str,
        agent: str,
        state: str,
        progress: int,
        message: str,
        data: dict | None = None,
    ):
        event = SystemEvent(
            campaign_id=campaign_id,
            type=EventType.AGENT_UPDATE,
            agent=agent,
            state=state,
            progress=progress,
            message=message,
            data=data,
        )
        await self.emit(event)

    async def emit_state_change(self, campaign_id: str, new_state: str):
        event = SystemEvent(
            campaign_id=campaign_id,
            type=EventType.STATE_CHANGED,
            state=new_state,
            message=f"Campaign state → {new_state}",
        )
        await self.emit(event)

    def emit_sync(self, event: SystemEvent):
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(self.emit(event))
            else:
                loop.run_until_complete(self.emit(event))
        except RuntimeError:
            asyncio.run(self.emit(event))

event_emitter = EventEmitter()
