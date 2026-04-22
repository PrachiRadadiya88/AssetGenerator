"""
gemini_service.py — Gemini API integration for text and image generation.

Uses the google-genai SDK to communicate with Google's Gemini models.
Uses the async client (client.aio) to avoid blocking the FastAPI event loop.
"""

import json
import os
import re
import logging
import asyncio
from google import genai
from google.genai import types
from app.prompts.prompts import (
    GENERATE_HEADLINE_PROMPT,
    GENERATE_HERO_HEADLINE_PROMPT,
    GENERATE_FEATURE_LIST_PROMPT,
    IMAGE_GENERATION_BLANK_PROMPT_V3,
    IMAGE_GENERATION_LANDSCAPE_PROMPT,
    IMAGE_ENHANCE_PROMPT_V3,
    EMOJI_INCLUDE,
    EMOJI_EXCLUDE,
    BACKGROUND_CONSISTENT,
    BACKGROUND_VARIED,
    MOCKUP_STYLES,
    GENERATE_ADS_PROMPT,
    AD_IMAGE_PROMPT,
    AD_CREATIVE_STYLES,
    GENERATE_PLAY_STORE_DESCRIPTION_PROMPT,
)
from app.models.schemas import FeatureContent, AdItem, AppDescriptionResponse
from app.services.image_service import _hex_to_rgb

logger = logging.getLogger(__name__)


def _get_text_color(bg_hex: str) -> str:
    """Determine if white or dark text is better for a background color."""
    try:
        rgb = _hex_to_rgb(bg_hex)
        # Standard relative luminance formula
        luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255
        return "#FFFFFF" if luminance < 0.55 else "#1A1A1A"
    except:
        return "#FFFFFF"

# ─────────────────────────────────────────────
# Client Initialization
# ─────────────────────────────────────────────

def _get_client() -> genai.Client:
    """Get a configured Gemini API client."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)


async def generate_feature_copy(
    app_name: str,
    app_category: str,
    target_audience: str,
    brand_style: str,
    feature_concept: str,
    is_hero: bool = False,
    include_subtext: bool = False,
    language: str = "English",
) -> FeatureContent:
    """
    Generate a punchy headline tailored specifically to the given user feature.
    Returns headline only as per new requirements.
    """
    client = _get_client()

    prompt_template = GENERATE_HERO_HEADLINE_PROMPT if is_hero else GENERATE_HEADLINE_PROMPT
    
    # ALWAYS generate headline in plain text mode to avoid JSON confusion
    prompt = prompt_template.format(
        app_name=app_name,
        app_category=app_category,
        target_audience=target_audience,
        brand_style=brand_style,
        feature_concept=feature_concept,
        language=language,
    )

    try:
        logger.info(f"Generating feature copy for feature: {feature_concept}")
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=100,
            ),
        )

        # Robust text extraction
        headline = ""
        if response.text:
            headline = response.text.strip()
        elif response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'text') and part.text:
                    headline += part.text
            headline = headline.strip()

        if not headline:
            logger.warning("Gemini returned no text, falling back to feature concept as headline.")
            headline = feature_concept

        # Aggressive cleanup: strip quotes, intros, JSON artifacts
        headline = re.sub(r'^["\']|["\']$', '', headline).strip()
        headline = re.sub(r'^(Here is|Here\'s|Your headline[:\s]|Headline[:\s])', '', headline, flags=re.IGNORECASE).strip()
        headline = re.sub(r'^["\']|["\']$', '', headline).strip()  # Strip again after removal
        # Take only the first line if multiple lines
        headline = headline.split('\n')[0].strip()

        # --- Generate subtext separately if requested ---
        subtext = None
        if include_subtext:
            subtext = await generate_subtext(
                app_name=app_name,
                app_category=app_category,
                feature_concept=feature_concept,
                headline=headline,
                language=language
            )

        return FeatureContent(
            feature=feature_concept,
            headline=headline,
            subtext=subtext,
        )

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        raise ValueError(f"AI returned invalid JSON: {e}")
    except Exception as e:
        logger.error(f"Gemini text generation failed: {e}")
        raise


async def generate_subtext(
    app_name: str,
    app_category: str,
    feature_concept: str,
    headline: str,
    language: str = "English",
) -> str | None:
    """Generate a short supporting tagline for a given headline."""
    client = _get_client()
    try:
        subtext_prompt = (
            f"You are a copywriter. Given this app headline: \"{headline}\" for the app \"{app_name}\" "
            f"(a {app_category} app, feature: {feature_concept}), "
            f"write ONE short supporting tagline (6-12 words) that reinforces the benefit. "
            f"MUST BE WRITTEN IN THIS LANGUAGE: {language}. "
            f"Output ONLY the tagline text, nothing else. No quotes, no labels, no explanation."
        )
        sub_response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=subtext_prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=60,
            ),
        )
        if sub_response.text:
            subtext = sub_response.text.strip()
            subtext = re.sub(r'^["\']|["\']$', '', subtext).strip()
            subtext = re.sub(r'^(Here is|Here\'s|Subtext[:\s]|Tagline[:\s])', '', subtext, flags=re.IGNORECASE).strip()
            subtext = subtext.split('\n')[0].strip()
            return subtext
    except Exception as e:
        logger.warning(f"Subtext generation failed: {e}")
    return None


# ─────────────────────────────────────────────
# Image Generation
# ─────────────────────────────────────────────

# Timeout for image generation API calls (seconds)
IMAGE_GENERATION_TIMEOUT = 300

# Supported aspect ratios by Gemini image generation
_SUPPORTED_RATIOS = {
    (1, 1): "1:1",
    (3, 4): "3:4",
    (4, 3): "4:3",
    (9, 16): "9:16",
    (16, 9): "16:9",
}


def _calculate_aspect_ratio(width: int, height: int) -> str:
    """
    Calculate the closest Gemini-supported aspect ratio from pixel dimensions.
    Supported values: 1:1, 3:4, 4:3, 9:16, 16:9.
    """
    from math import gcd
    divisor = gcd(width, height)
    simplified_w = width // divisor
    simplified_h = height // divisor

    # Check for exact match first
    exact = _SUPPORTED_RATIOS.get((simplified_w, simplified_h))
    if exact:
        return exact

    # Find closest supported ratio by comparing decimal values
    target_ratio = width / height
    best_match = "9:16"  # Default fallback for portrait
    best_diff = float("inf")

    for (rw, rh), label in _SUPPORTED_RATIOS.items():
        diff = abs(target_ratio - (rw / rh))
        if diff < best_diff:
            best_diff = diff
            best_match = label
            
    return best_match

async def generate_asset_image(
    app_name: str,
    app_category: str,
    feature: str,
    headline: str,
    color_theme: str,
    width: int,
    height: int,
    output_path: str,
    orientation: str = "portrait",
    uploaded_image_path: str | None = None,
    asset_index: int = 0,
    target_os: str = "iOS",
    subtext: str | None = None,
    include_emojis: bool = True,
    consistent_background: bool = True,
    language: str = "English",
) -> str:
    """
    Generate an image using Gemini's experimental imagen-3.0-generate-002 model.
    Applies diverse mockup layouts based on asset_index.
    """
    client = _get_client()

    # Calculate aspect ratio from the requested dimensions
    aspect_ratio = _calculate_aspect_ratio(width, height)
    logger.info(f"Calculated aspect ratio: {aspect_ratio} from {width}x{height}")

    # Use the provided flag to choose between including and excluding emojis
    emoji_instruction = EMOJI_INCLUDE if include_emojis else EMOJI_EXCLUDE
    
    # Background instruction
    bg_instruction = BACKGROUND_CONSISTENT.format(color_theme=color_theme) if consistent_background else BACKGROUND_VARIED.format(color_theme=color_theme)
    
    subtext_val = subtext if subtext else ""

    # Choose best text color for contrast
    text_color = _get_text_color(color_theme)

    # Enhance target OS description to provide stronger visual cues for the AI model
    if target_os.lower() == "android":
        os_description = "Use a modern flagship ANDROID phone with a centered small hole-punch camera and symmetric bezels. STRICTLY NO Apple notches or Dynamic Islands."
    else:
        os_description = "Use the latest IPHONE style with the Dynamic Island pill-shaped cutout and premium rounded screen corners. STRICTLY NO Android features."

    if orientation == "landscape":
        # Landscape: Redesigned layout with portrait phone
        prompt = IMAGE_GENERATION_LANDSCAPE_PROMPT.format(
            app_name=app_name,
            app_category=app_category,
            feature=feature,
            headline=headline,
            color_theme=color_theme,
            width=width,
            height=height,
            include_emoji=emoji_instruction,
            target_os=target_os,
            os_details=os_description,
            text_color=text_color,
            subtext=subtext_val,
            background_instruction=bg_instruction,
            language=language,
        )
        contents = prompt
    elif uploaded_image_path and os.path.exists(uploaded_image_path):
        # Portrait with uploaded screenshot
        style_idx = asset_index % len(MOCKUP_STYLES)
        mockup_style_str = MOCKUP_STYLES[style_idx].replace("{target_os}", target_os)
        prompt = IMAGE_ENHANCE_PROMPT_V3.format(
            app_name=app_name,
            app_category=app_category,
            color_theme=color_theme,
            headline=headline,
            feature=feature,
            include_emoji=emoji_instruction,
            mockup_style=mockup_style_str,
            width=width,
            height=height,
            target_os=target_os,
            os_details=os_description,
            text_color=text_color,
            subtext=subtext_val,
            background_instruction=bg_instruction,
            language=language,
        )
        
        # Read the uploaded image
        with open(uploaded_image_path, "rb") as f:
            image_bytes = f.read()
        
        # Determine mime type
        ext = os.path.splitext(uploaded_image_path)[1].lower()
        mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
        mime_type = mime_map.get(ext, "image/png")
        
        contents = [
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt,
        ]
    else:
        # Portrait from scratch — pick a unique mockup style based on asset index
        prompt_template = IMAGE_GENERATION_BLANK_PROMPT_V3
        style_idx = asset_index % len(MOCKUP_STYLES)
        mockup_style_str = MOCKUP_STYLES[style_idx].replace("{target_os}", target_os)

        prompt = prompt_template.format(
            app_name=app_name,
            app_category=app_category,
            feature=feature,
            headline=headline,
            color_theme=color_theme,
            width=width,
            height=height,
            include_emoji=emoji_instruction,
            mockup_style=mockup_style_str,
            target_os=target_os,
            os_details=os_description,
            text_color=text_color,
            subtext=subtext_val,
            background_instruction=bg_instruction,
            language=language,
        )
        contents = prompt

    # Log the prompt for debugging
    prompt_text = prompt if isinstance(prompt, str) else "[image + text prompt]"
    logger.info(f"Image prompt (first 300 chars): {prompt_text[:300]}...")

    try:
        # Use async client with timeout to avoid hanging forever
        logger.info(
            f"Generating asset image for '{feature}' with headline '{headline}' "
            f"using model 'gemini-3.1-flash-image-preview' (timeout: {IMAGE_GENERATION_TIMEOUT}s) "
        )
        
        response = await asyncio.wait_for(
            client.aio.models.generate_content(
                model="gemini-3.1-flash-image-preview",
                contents=contents,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                    temperature=1.0,
                    image_config=types.ImageConfig(
                        aspect_ratio=aspect_ratio,
                        image_size="2K",
                    )
                ),
            ),
            timeout=IMAGE_GENERATION_TIMEOUT,
        )

        logger.info("Received response from Gemini image generation API")

        # Extract the generated image from the response
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                    # Save the generated image
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, "wb") as f:
                        f.write(part.inline_data.data)
                    logger.info(f"Generated image saved to: {output_path}")
                    return output_path
                elif hasattr(part, 'text') and part.text:
                    logger.info(f"Gemini text response: {part.text[:200]}")

        raise ValueError("No image was generated in the Gemini response")

    except asyncio.TimeoutError:
        logger.error(f"Image generation timed out after {IMAGE_GENERATION_TIMEOUT}s for feature: {feature}")
        raise TimeoutError(f"Image generation timed out after {IMAGE_GENERATION_TIMEOUT} seconds")
    except Exception as e:
        logger.error(f"Gemini image generation failed: {e}")
        raise


async def generate_ad_creatives_text(
    app_name: str,
    target_audience: str,
    features_list: str,
    asset_headlines_and_features: str,
    num_ads: int = 2,
    existing_ad_hooks: list[str] | None = None,
) -> list[AdItem]:
    """Generates ad creatives as JSON. num_ads controls how many are returned."""
    client = _get_client()

    # Build uniqueness constraint if we already have ads
    hooks_section = ""
    if existing_ad_hooks:
        hooks_list = "\n".join([f"  - \"{h}\"" for h in existing_ad_hooks])
        hooks_section = f"ALREADY USED AD HOOKS (DO NOT REUSE OR PARAPHRASE THESE):\n{hooks_list}\nYour new ads MUST use completely different angles and hooks."

    prompt = GENERATE_ADS_PROMPT.format(
        app_name=app_name,
        target_audience=target_audience,
        features_list=features_list,
        asset_headlines_and_features=asset_headlines_and_features,
        num_ads=num_ads,
        existing_ad_hooks=hooks_section,
    )

    try:
        logger.info(f"Generating {num_ads} ad creatives text...")
        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json",
            )
        )
        
        text_resp = response.text or ""
        text_resp = text_resp.strip()
        
        try:
            parsed = json.loads(text_resp)
        except json.JSONDecodeError:
            # Try to strip markdown if present
            if text_resp.startswith("```json"):
                text_resp = text_resp[7:-3].strip()
            parsed = json.loads(text_resp)
        
        ads = []
        for i, item in enumerate(parsed):
            ads.append(AdItem(
                id=f"ad-{i+1}",
                hook=item.get("hook", ""),
                headline=item.get("headline", ""),
                primary_text=item.get("primary_text", ""),
                cta=item.get("cta", ""),
                image_url=""
            ))
        return ads[:num_ads]
    except Exception as e:
        logger.error(f"Gemini ad text generation failed: {e}")
        raise


async def generate_ad_image(
    app_name: str,
    app_category: str,
    hook: str,
    headline: str,
    color_theme: str,
    output_path: str,
    uploaded_image_path: str | None = None,
    target_audience: str = "",
    target_os: str = "iOS",
    ad_index: int = 0,
    language: str = "English",
) -> str:
    """Generate the background/base image for an ad using Gemini."""
    client = _get_client()

    # Build asset context description
    asset_context = "No pre-generated assets available."
    uploaded_screenshots = "No uploaded screenshots available."

    if uploaded_image_path and os.path.exists(uploaded_image_path):
        asset_context = f"A generated Play Store screenshot asset is attached as image input. Use it as reference for the app's UI inside a phone mockup."
        uploaded_screenshots = f"Screenshot file: {os.path.basename(uploaded_image_path)}"

    # Cycle through diverse ad creative styles
    style_template = AD_CREATIVE_STYLES[ad_index % len(AD_CREATIVE_STYLES)]
    ad_style = style_template.format(target_os=target_os, color_theme=color_theme)

    # Calculate text color for ads too
    text_color = _get_text_color(color_theme)

    prompt = AD_IMAGE_PROMPT.format(
        app_name=app_name,
        app_category=app_category,
        target_audience=target_audience,
        hook=hook,
        headline=headline,
        color_theme=color_theme,
        target_os=target_os,
        text_color=text_color,
        asset_context=asset_context,
        uploaded_screenshots=uploaded_screenshots,
        ad_style=ad_style,
        language=language,
    )

    contents = []
    if uploaded_image_path and os.path.exists(uploaded_image_path):
        with open(uploaded_image_path, "rb") as f:
            image_bytes = f.read()
        ext = os.path.splitext(uploaded_image_path)[1].lower()
        mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
        mime_type = mime_map.get(ext, "image/png")
        contents = [
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt,
        ]
    else:
        contents = prompt

    try:
        logger.info(f"Generating ad image for headline '{headline}' using 'gemini-3.1-flash-image-preview'")
        response = await asyncio.wait_for(
            client.aio.models.generate_content(
                model="gemini-3.1-flash-image-preview",
                contents=contents,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE", "TEXT"],
                    temperature=1.0,
                ),
            ),
            timeout=IMAGE_GENERATION_TIMEOUT,
        )

        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                    os.makedirs(os.path.dirname(output_path), exist_ok=True)
                    with open(output_path, "wb") as f:
                        f.write(part.inline_data.data)
                    logger.info(f"Generated ad image saved to: {output_path}")
                    return output_path

        raise ValueError("No ad image was generated in the Gemini response")
    except asyncio.TimeoutError:
        logger.error(f"Ad image generation timed out after {IMAGE_GENERATION_TIMEOUT}s")
        raise TimeoutError(f"Ad image generation timed out after {IMAGE_GENERATION_TIMEOUT} seconds")
    except Exception as e:
        logger.error(f"Gemini ad image generation failed: {e}")
        raise
    
# ─────────────────────────────────────────────
# Feature Extraction (from App Description)
# ─────────────────────────────────────────────

async def extract_features_list(
    app_name: str,
    app_category: str,
    target_audience: str,
    brand_style: str,
    app_description: str,
    language: str = "English",
) -> list[str]:
    """
    Analyze the app description and generate an array of 5 feature highlights.
    """
    client = _get_client()

    prompt = GENERATE_FEATURE_LIST_PROMPT.format(
        app_name=app_name,
        app_category=app_category,
        target_audience=target_audience,
        brand_style=brand_style,
        app_description=app_description,
        language=language,
    )

    try:
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        text = response.text.strip()
        
        # Robust parsing: Try direct JSON first, then try regex extraction
        try:
            features = json.loads(text)
        except json.JSONDecodeError:
            # Fallback: Extract first JSON array [...] found in text
            match = re.search(r'\[.*\]', text, re.DOTALL)
            if match:
                features = json.loads(match.group(0))
            else:
                raise ValueError("Could not find JSON array in response")

        if not isinstance(features, list) or len(features) == 0:
            raise ValueError("AI returned invalid feature list format")
            
        return [str(f) for f in features[:8]] 
    except Exception as e:
        logger.error(f"Failed to generate feature list from description: {e}")
        return ["Core Experience", "Seamless Navigation", "Smart Analytics", "Quick Sync", "Cloud Backup"]

async def generate_app_description(
    app_name: str,
    app_category: str,
    target_audience: str,
    brand_style: str,
    features: list[str],
    app_description: str = "",
    include_emojis: bool = True,
    language: str = "English",
) -> AppDescriptionResponse:
    """Generate a Play Store app description using Gemini."""
    client = _get_client()

    features_list = "\n".join([f"- {f}" for f in features])
    emoji_instruction = "Include relevant emojis for engagement." if include_emojis else "Do NOT include any emojis. Keep the text clean."

    prompt = GENERATE_PLAY_STORE_DESCRIPTION_PROMPT.format(
        app_name=app_name,
        app_category=app_category,
        target_audience=target_audience,
        brand_style=brand_style,
        features_list=features_list,
        app_description=app_description,
        emoji_instruction=emoji_instruction,
        language=language,
    )

    try:
        logger.info(f"Generating Play Store description for {app_name}...")
        response = await client.aio.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.8,
                response_mime_type="application/json",
            )
        )
        
        text_resp = response.text or ""
        text_resp = text_resp.strip()
        
        try:
            parsed = json.loads(text_resp)
        except json.JSONDecodeError:
            if text_resp.startswith("```json"):
                text_resp = text_resp[7:-3].strip()
            parsed = json.loads(text_resp)
            
        return AppDescriptionResponse(
            short_description=parsed.get("short_description", "")[:80],
            full_description=parsed.get("full_description", "")
        )
    except Exception as e:
        logger.error(f"Gemini description generation failed: {e}")
        raise
