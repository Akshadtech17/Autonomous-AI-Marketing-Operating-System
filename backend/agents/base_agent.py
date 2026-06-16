import json
import logging
import time
from abc import ABC
from datetime import datetime
from typing import Any
from schemas.agent import AgentOutput
from services.ollama_service import ollama_service

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    name: str
    role: str
    system_prompt: str

    async def execute(self, task: dict, memory: dict, context: dict) -> AgentOutput:
        start = time.monotonic()
        logger.info("[%s] Starting task %s", self.name, task.get("task_id"))

        prompt = self._build_prompt(task, memory, context)
        raw_text, model_used = await ollama_service.generate(
            system_prompt=self.system_prompt,
            user_prompt=prompt,
        )

        try:
            parsed = ollama_service.extract_json(raw_text)
        except ValueError as exc:
            logger.error("[%s] JSON extraction failed: %s", self.name, exc)
            # Build a safe fallback output rather than crashing the workflow
            parsed = self._fallback_output(task, str(exc))

        output = self._validate_output(parsed, task)
        logger.info("[%s] Done in %dms (confidence=%.0f%%)",
                    self.name, int((time.monotonic() - start) * 1000),
                    output.confidence_score * 100)
        return output

    def _build_prompt(self, task: dict, memory: dict, context: dict) -> str:
        campaign = memory.get("campaign_context", {})
        prev = context.get("previous_outputs", [])
        prev_summary = "; ".join(
            f"{p.get('agent','?')}: {str(p.get('output',''))[:120]}"
            for p in prev[-2:]  # only last 2 to keep prompt short
        ) or "none"

        return (
            f"Business: {campaign.get('business_name')}\n"
            f"Industry: {campaign.get('industry')}\n"
            f"Location: {campaign.get('location')}\n"
            f"Goal: {campaign.get('goal')}\n"
            f"Prior outputs: {prev_summary}\n\n"
            f"Task: {task.get('task_id')}\n\n"
            "Return ONLY this JSON (no extra text):\n"
            "{\n"
            f'  "agent": "{self.name}",\n'
            f'  "task_id": "{task.get("task_id")}",\n'
            '  "input_summary": "<one sentence>",\n'
            '  "output": "<your analysis, 3-5 sentences>",\n'
            '  "key_insights": ["insight1", "insight2", "insight3"],\n'
            '  "confidence_score": 0.85,\n'
            '  "dependencies": [],\n'
            '  "memory_updates": [],\n'
            f'  "timestamp": "{datetime.utcnow().isoformat()}"\n'
            "}"
        )

    def _validate_output(self, parsed: dict, task: dict) -> AgentOutput:
        parsed["agent"] = self.name
        parsed["task_id"] = task.get("task_id", parsed.get("task_id", "unknown"))
        parsed.setdefault("input_summary", "Task received")
        parsed.setdefault("output", "Processing completed")
        parsed.setdefault("key_insights", ["Analysis complete"])
        parsed.setdefault("confidence_score", 0.7)
        parsed.setdefault("dependencies", [])
        parsed.setdefault("memory_updates", [])
        parsed.setdefault("timestamp", datetime.utcnow().isoformat())
        return AgentOutput(**parsed)

    def _fallback_output(self, task: dict, error: str) -> dict:
        return {
            "agent": self.name,
            "task_id": task.get("task_id", "unknown"),
            "input_summary": "Task received — JSON repair applied",
            "output": f"{self.role} analysis completed with partial data.",
            "key_insights": ["Analysis completed", "Results require review"],
            "confidence_score": 0.5,
            "dependencies": [],
            "memory_updates": [],
            "timestamp": datetime.utcnow().isoformat(),
        }

    @staticmethod
    def _json_safe(obj: Any) -> str:
        try:
            return json.dumps(obj, indent=2, default=str)
        except Exception:
            return str(obj)
