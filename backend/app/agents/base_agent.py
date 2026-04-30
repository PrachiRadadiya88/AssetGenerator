"""
base_agent.py — Shared utilities for all video agents.
"""

import json
import re
import os
import logging
import asyncio
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

AGENT_TIMEOUT = 120


def get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)


def parse_json_response(text: str) -> dict | list:
    """Robustly parse JSON from an LLM response."""
    text = text.strip()
    # Remove markdown code blocks if present
    text = re.sub(r'^```json\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'^```\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    text = text.strip()

    try:
        # Try full parse first
        return json.loads(text, strict=False)
    except json.JSONDecodeError:
        # Try to find the first JSON object or array
        try:
            # Find the start of JSON
            match = re.search(r'[\{\[]', text)
            if not match:
                raise ValueError("No JSON structure found")
            
            start_index = match.start()
            # Use raw_decode to find the end of the first valid JSON object
            decoder = json.JSONDecoder(strict=False)
            obj, end_index = decoder.raw_decode(text[start_index:])
            return obj
        except (json.JSONDecodeError, ValueError) as e:
            # Final fallback: regex search (last resort)
            match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1), strict=False)
                except:
                    pass
            raise ValueError(f"Could not parse JSON: {str(e)}. Original text: {text[:200]}...")


async def call_agent(prompt: str, agent_name: str, max_retries: int = 5, image_path: str = None) -> dict | list:
    """Call an agent via Gemini with retry logic for transient errors.
    
    Can optionally accept an image_path for multi-modal analysis.
    """
    client = get_client()
    logger.info(f"[{agent_name}] Starting...")

    contents = [prompt]
    if image_path and os.path.exists(image_path):
        try:
            with open(image_path, "rb") as f:
                image_bytes = f.read()
            
            # Use from_bytes which is supported by the google-genai SDK
            mime_type = "image/jpeg" if image_path.lower().endswith((".jpg", ".jpeg")) else "image/png"
            contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
            logger.info(f"[{agent_name}] Attached image reference: {os.path.basename(image_path)}")
        except Exception as e:
            logger.warning(f"[{agent_name}] Failed to attach image: {e}")

    for attempt in range(1, max_retries + 1):
        try:
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model="gemini-2.5-flash-lite",
                    contents=contents,
                    config=types.GenerateContentConfig(
                        temperature=0.7,
                        response_mime_type="application/json",
                    ),
                ),
                timeout=AGENT_TIMEOUT,
            )
            text = response.text or ""
            result = parse_json_response(text)
            logger.info(f"[{agent_name}] Completed successfully.")
            return result

        except asyncio.TimeoutError:
            logger.error(f"[{agent_name}] Timed out (attempt {attempt}/{max_retries})")
            if attempt == max_retries:
                raise TimeoutError(f"{agent_name} timed out")
        except Exception as e:
            err = str(e)
            # Catch transient errors (503, 429, etc.) and JSON parsing hallucinations
            is_transient = any(k in err for k in ("503", "UNAVAILABLE", "429", "overloaded", "demand", "deadline", "Could not parse JSON", "Expecting", "JSON"))
            if is_transient and attempt < max_retries:
                # Use exponential backoff for retries
                wait = min(2 ** attempt, 30)
                logger.warning(f"[{agent_name}] Transient error/JSON parse failure (attempt {attempt}/{max_retries}), retrying in {wait}s: {e}")
                await asyncio.sleep(wait)
            else:
                logger.error(f"[{agent_name}] Failed after {attempt} attempts: {e}")
                raise
