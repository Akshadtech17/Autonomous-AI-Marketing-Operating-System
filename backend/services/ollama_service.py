import asyncio
import json
import logging
import re
import anthropic
from config import settings

logger = logging.getLogger(__name__)

class OllamaService:
    """Thin wrapper around the Anthropic API, preserving the original interface."""

    def __init__(self):
        self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        self.model = settings.ANTHROPIC_MODEL
        self.max_retries = settings.MAX_RETRIES
        self.backoff_base = settings.RETRY_BACKOFF_BASE

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
    ) -> tuple[str, str]:
        target_model = model or self.model

        for attempt in range(self.max_retries + 1):
            try:
                message = await self._client.messages.create(
                    model=target_model,
                    max_tokens=2048,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                )
                text = next(
                    (block.text for block in message.content if block.type == "text"),
                    "",
                )
                return text, target_model
            except Exception as exc:
                logger.warning(
                    "Anthropic attempt %d/%d failed (model=%s): %s",
                    attempt + 1, self.max_retries + 1, target_model, exc,
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(self.backoff_base ** attempt)
                else:
                    raise RuntimeError(
                        f"Anthropic API failed after {self.max_retries + 1} attempts: {exc}"
                    )

    def extract_json(self, text: str) -> dict:
        text = text.strip()
        # Strip <think>...</think> blocks
        text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

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

        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        try:
            return json.loads(self._repair_truncated(text))
        except json.JSONDecodeError:
            pass

        raise ValueError(f"Cannot extract valid JSON from LLM response: {text[:300]}")

    @staticmethod
    def _repair_truncated(text: str) -> str:
        text = text.rstrip()

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

        text = re.sub(r',\s*"[^"]*"\s*:\s*$', '', text)
        text = re.sub(r',\s*"[^"]*"\s*$', '', text)

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

        text += ''.join(reversed(stack))
        return text


ollama_service = OllamaService()
