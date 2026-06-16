from pydantic import field_validator
from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).parent

class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/lif_production.db"
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        # Render provides postgres:// but SQLAlchemy 2.x requires postgresql://
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    OLLAMA_PRIMARY_MODEL: str = "qwen2.5:0.5b"
    OLLAMA_FALLBACK_MODEL: str = "qwen2.5:0.5b"
    OLLAMA_TIMEOUT: int = 120
    MAX_RETRIES: int = 2
    RETRY_BACKOFF_BASE: float = 2.0
    WEBSOCKET_HEARTBEAT: int = 30
    REPORT_OUTPUT_DIR: str = str(BASE_DIR / "reports" / "output")
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
