import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from workers.campaign_worker import campaign_worker
from api import campaign_router, agent_router, report_router, ws_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Lost In Frame Production system...")
    init_db()
    logger.info("Database initialized")

    worker_task = asyncio.create_task(campaign_worker.start())
    logger.info("Campaign worker started")

    yield

    await campaign_worker.stop()
    worker_task.cancel()
    logger.info("System shutdown complete")

app = FastAPI(
    title="Lost In Frame Production",
    description="Autonomous AI Marketing Operating System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campaign_router)
app.include_router(agent_router)
app.include_router(report_router)
app.include_router(ws_router)

@app.get("/", tags=["health"])
def root():
    return {
        "system": "Lost In Frame Production",
        "status": "operational",
        "version": "1.0.0",
        "description": "Autonomous AI Marketing Operating System",
    }

@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy", "worker": "running"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )
