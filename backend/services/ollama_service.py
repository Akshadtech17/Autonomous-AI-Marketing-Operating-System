import asyncio
import json
import logging
import re
import httpx
from config import settings

logger = logging.getLogger(__name__)

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.primary_model = settings.OLLAMA_PRIMARY_MODEL
        self.fallback_model = settings.OLLAMA_FALLBACK_MODEL
        self.timeout = settings.OLLAMA_TIMEOUT
        self.max_retries = settings.MAX_RETRIES
        self.backoff_base = settings.RETRY_BACKOFF_BASE

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
    ) -> tuple[str, str]:
        target_model = model or self.primary_model

        for attempt in range(self.max_retries + 1):
            try:
                result = await self._call(system_prompt, user_prompt, target_model)
                return result, target_model
            except Exception as exc:
                logger.warning(
                    "Ollama attempt %d/%d failed (model=%s): %s",
                    attempt + 1, self.max_retries + 1, target_model, exc,
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(self.backoff_base ** attempt)
                    if attempt == self.max_retries - 1 and target_model == self.primary_model:
                        target_model = self.fallback_model
                        logger.info("Switching to fallback model: %s", target_model)
                else:
                    raise RuntimeError(
                        f"Ollama failed after {self.max_retries + 1} attempts: {exc}"
                    )

    async def _call(self, system_prompt: str, user_prompt: str, model: str) -> str:
        payload = {
            "model": model,
            "prompt": f"SYSTEM: {system_prompt}\n\nUSER: {user_prompt}",
            "stream": False,
            "options": {
                "temperature": 0.4,
                "num_predict": 2048,
                "num_ctx": 4096,
            },
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/generate",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            raw = data.get("response", "")
            done_reason = data.get("done_reason", "")
            if done_reason == "length":
                logger.warning("Response truncated by token limit — attempting JSON repair")
                raw = self._repair_truncated(raw)
            return raw

    def extract_json(self, text: str) -> dict:
        text = text.strip()
        # Strip <think>...</think> blocks (Qwen reasoning mode)
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

        # Try direct parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Extract JSON object from surrounding text
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            candidate = match.group()
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                repaired = self._repair_truncated(candidate)
                try:
                    return json.loads(repaired)
                except json.JSONDecodeError:
                    pass

        # Extract from code fence
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # Last resort: repair whatever we have
        try:
            return json.loads(self._repair_truncated(text))
        except json.JSONDecodeError:
            pass

        raise ValueError(f"Cannot extract valid JSON from LLM response: {text[:300]}")

    @staticmethod
    def _repair_truncated(text: str) -> str:
        """Close unclosed JSON strings, arrays, and objects caused by token truncation."""
        text = text.rstrip()

        # If mid-string, close it
        # Count unescaped quotes to detect open string
        in_string = False
        escape_next = False
        for ch in text:
            if escape_next:
                escape_next = False
                continue
            if ch == "\\":
                escape_next = True
                continue
            if ch == '"':
                in_string = not in_string
        if in_string:
            text += '"'

        # Strip trailing incomplete key (e.g. `"key": ` with no value yet)
        text = re.sub(r',\s*"[^"]*"\s*:\s*$', '', text)
        text = re.sub(r',\s*"[^"]*"\s*$', '', text)

        # Close open arrays and objects by counting brackets
        stack = []
        in_str = False
        esc = False
        for ch in text:
            if esc:
                esc = False
                continue
            if ch == "\\":
                esc = True
                continue
            if ch == '"':
                in_str = not in_str
                continue
            if in_str:
                continue
            if ch in ('{', '['):
                stack.append('}' if ch == '{' else ']')
            elif ch in ('}', ']') and stack:
                stack.pop()

        # Close in reverse order
        text += ''.join(reversed(stack))
        return text

ollama_service = OllamaService()
