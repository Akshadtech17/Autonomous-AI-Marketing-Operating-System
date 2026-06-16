import asyncio
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from core.event_emitter import event_emitter

router = APIRouter(prefix="/ws", tags=["websocket"])
logger = logging.getLogger(__name__)

@router.websocket("/campaign/{campaign_id}")
async def campaign_websocket(websocket: WebSocket, campaign_id: str):
    await event_emitter.connect(websocket, campaign_id=campaign_id)
    logger.info("WS connected: campaign=%s", campaign_id)
    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                await websocket.send_text('{"type":"HEARTBEAT"}')
    except WebSocketDisconnect:
        event_emitter.disconnect(websocket, campaign_id=campaign_id)
        logger.info("WS disconnected: campaign=%s", campaign_id)
    except Exception as exc:
        event_emitter.disconnect(websocket, campaign_id=campaign_id)
        logger.warning("WS error (campaign=%s): %s", campaign_id, exc)

@router.websocket("/global")
async def global_websocket(websocket: WebSocket):
    await event_emitter.connect(websocket, campaign_id=None)
    logger.info("WS global connected")
    try:
        while True:
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=30)
            except asyncio.TimeoutError:
                await websocket.send_text('{"type":"HEARTBEAT"}')
    except WebSocketDisconnect:
        event_emitter.disconnect(websocket)
        logger.info("WS global disconnected")
    except Exception as exc:
        event_emitter.disconnect(websocket)
        logger.warning("WS global error: %s", exc)
