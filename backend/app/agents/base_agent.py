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
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find the first JSON object or array
        try:
            # Find the start of JSON
            match = re.search(r'[\{\[]', text)
            if not match:
                raise ValueError("No JSON structure found")
            
            start_index = match.start()
            # Use raw_decode to find the end of the first valid JSON object
            decoder = json.JSONDecoder()
            obj, end_index = decoder.raw_decode(text[start_index:])
            return obj
        except (json.JSONDecodeError, ValueError) as e:
            # Final fallback: regex search (last resort)
            match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except:
                    pass
            raise ValueError(f"Could not parse JSON: {str(e)}. Original text: {text[:200]}...")


async def call_agent(prompt: str, agent_name: str, max_retries: int = 3, image_path: str = None) -> dict | list:
    """Call an agent via Gemini with retry logic for transient errors.
    
    Can optionally accept an image_path for multi-modal analysis.
    """
    client = get_client()
    logger.info(f"[{agent_name}] Starting...")

    contents = [prompt]
    if image_path and os.path.exists(image_path):
        try:
            contents.append(types.Part.from_image(types.Image.from_file(location=image_path)))
            logger.info(f"[{agent_name}] Attached image reference: {os.path.basename(image_path)}")
        except Exception as e:
            logger.warning(f"[{agent_name}] Failed to attach image: {e}")

    for attempt in range(1, max_retries + 1):
        try:
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model="gemini-3-flash-preview",
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
            is_transient = any(k in err for k in ("503", "UNAVAILABLE", "429", "overloaded"))
            if is_transient and attempt < max_retries:
                wait = 5 * attempt
                logger.warning(f"[{agent_name}] Transient error, retry in {wait}s: {e}")
                await asyncio.sleep(wait)
            else:
                logger.error(f"[{agent_name}] Failed: {e}")
                raise
