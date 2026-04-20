"""
scrape_service.py — Service for fetching app details from Google Play Store
and analyzing them with Gemini for rebranding context.
"""

import os
import re
import uuid
import logging
import asyncio
import json
import requests
from urllib.parse import urlparse, parse_qs
from google_play_scraper import app
from app.services.gemini_service import _get_client
from google.genai import types

logger = logging.getLogger(__name__)

# Absolute paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

def extract_package_id(url_or_id: str) -> str:
    """Extract package ID from a Play Store URL or return the ID if already provided."""
    if not url_or_id:
        return ""
    
    # Check if it's a URL
    if "play.google.com" in url_or_id:
        parsed = urlparse(url_or_id)
        qs = parse_qs(parsed.query)
        if 'id' in qs:
            return qs['id'][0]
    
    # Fallback: simple regex for package-looking strings if it's just the ID
    # Package IDs are usually lowercase and separated by dots
    match = re.match(r'^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$', url_or_id.strip())
    if match:
        return url_or_id.strip()
    
    return url_or_id.strip()

async def download_image(url: str, session_id: str) -> str:
    """Download an image from a URL and save it to the uploads directory."""
    try:
        # Create a unique filename
        ext = ".png"
        if ".jpg" in url.lower() or ".jpeg" in url.lower():
            ext = ".jpg"
        elif ".webp" in url.lower():
            ext = ".webp"
            
        filename = f"scraped_{uuid.uuid4().hex}{ext}"
        upload_session_dir = os.path.join(UPLOADS_DIR, session_id)
        os.makedirs(upload_session_dir, exist_ok=True)
        
        filepath = os.path.join(upload_session_dir, filename)
        
        # Download in a thread to not block
        def _do_download():
            response = requests.get(url, stream=True, timeout=10)
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                return filepath
            return None

        result = await asyncio.to_thread(_do_download)
        if result:
            # Map back to a relative-looking path starting with uploads/ for frontend compatibility if needed, 
            # or just return the full path if analyze_app_with_gemini uses it.
            # However, the frontend needs to download it via /uploads/...
            # Let's return the path relative to BASE_DIR for the service layer.
            return os.path.relpath(result, BASE_DIR).replace("\\", "/")
        return None
    except Exception as e:
        logger.error(f"Failed to download image from {url}: {e}")
        return ""

async def analyze_app_with_gemini(app_name: str, description: str, category: str, icon_path: str = None, debug_log_path: str = None):
    """Use Gemini to suggest brand style, audience, and color theme based on app details and logo."""
    client = _get_client()
    
    prompt = (
        f"You are a branding expert. Analyze this Play Store app data:\n"
        f"Name: {app_name}\n"
        f"Category: {category}\n"
        f"Description: {description[:1000]}\n\n"
        f"Based on this data AND the provided app logo (if available), suggest:\n"
        f"1. Target Audience: A concise description (e.g., 'Freelance designers and small agencies')\n"
        f"2. Brand Style: A creative visual style (e.g., 'Minimalist & Sophisticated' or 'Vibrant & High-Energy')\n"
        f"3. Color Theme: A single hex color code (e.g., '#2D5AFE') that fits this app's vibe. IMPORTANT: The color MUST be derived directly from the dominant or primary colors in the provided logo image to ensure brand consistency.\n\n"
        f"Return ONLY a JSON object with keys: 'suggested_audience', 'suggested_style', 'suggested_color'. No explanation."
    )

    contents = [prompt]
    # Convert relative path back to absolute for analysis
    abs_icon_path = os.path.join(BASE_DIR, icon_path) if icon_path else None
    
    if abs_icon_path and os.path.exists(abs_icon_path):
        try:
            with open(abs_icon_path, "rb") as f:
                image_bytes = f.read()
            # Determine mime type
            ext = os.path.splitext(abs_icon_path)[1].lower()
            mime_map = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
            mime_type = mime_map.get(ext, "image/png")
            
            # Put image first as it's often more effective for vision-language models
            contents = [
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ]
            logger.info(f"Successfully attached app logo to Gemini analysis: {abs_icon_path}")
        except Exception as e:
            logger.error(f"Failed to read icon for Gemini analysis: {e}")

    try:
        # Reverting to gemini-2.0-flash as it was original
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash-lite",
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=0.7,
                response_mime_type="application/json",
            )
        )
        
        result = json.loads(response.text)
        logger.info(f"Gemini suggested color: {result.get('suggested_color')}")
        return result
    except Exception as e:
        logger.error(f"Gemini analysis of app failed: {e}")
        if debug_log_path:
            with open(debug_log_path, "a") as f:
                f.write(f"GEMINI ERROR: {str(e)}\n")
        
        return {
            "suggested_audience": "General Public",
            "suggested_style": "Modern & Minimal",
            "suggested_color": "#CCCCCC"  # Another fallback color for detection
        }

async def scrape_app_details(url_or_id: str, session_id: str):
    """Main function to scrape and analyze app details."""
    package_id = extract_package_id(url_or_id)
    if not package_id:
        raise ValueError("Invalid Play Store URL or Package ID")

    try:
        # Fetch from Play Store (sync library, run in thread)
        raw_data = await asyncio.to_thread(app, package_id)
        
        app_name = raw_data.get('title', 'Unknown App')
        description = raw_data.get('description', '')
        category = raw_data.get('genre', 'Productivity')
        icon_url = raw_data.get('icon', '')

        screenshot_urls = raw_data.get('screenshots', [])
        if not screenshot_urls:
            screenshot_urls = raw_data.get('screenshotUrls', [])
        
        # screenshot_urls = screenshot_urls[:4] # Removed limit to fetch all available screenshots
        
        logger.info(f"Scraped {len(screenshot_urls)} screenshots for {app_name}")
        
        # Download icon first for Gemini analysis
        icon_path = ""
        debug_log_path = os.path.join(UPLOADS_DIR, session_id, "scrape_debug.log")
        os.makedirs(os.path.dirname(debug_log_path), exist_ok=True)

        if icon_url:
            icon_path = await download_image(icon_url, session_id)
            logger.info(f"Icon downloaded for analysis: {icon_path}")
            # Log to a file we can read
            with open(debug_log_path, "a") as f:
                f.write(f"Scraped {app_name}, Category: {category}\n")
                f.write(f"Icon URL: {icon_url}\n")
                f.write(f"Local Icon Path: {icon_path}\n")

        # Analyze with Gemini (using icon if available)
        analysis = await analyze_app_with_gemini(app_name, description, category, icon_path, debug_log_path)
        
        # Log analysis result
        if icon_path:
            debug_log_path = os.path.join(UPLOADS_DIR, session_id, "scrape_debug.log")
            with open(debug_log_path, "a") as f:
                f.write(f"Analysis Result: {analysis}\n")
        
        # Download screenshots (remaining images)
        download_tasks = []
        for s_url in screenshot_urls:
            download_tasks.append(download_image(s_url, session_id))
            
        downloaded_screenshots = await asyncio.gather(*download_tasks)
        
        # Filter out failed downloads
        screenshots_to_return = [p for p in downloaded_screenshots if p]
            
        # Ensure first path is icon if we have it
        logger.info(f"Returning {len(screenshots_to_return)} downloaded screenshot paths")

        # Prepare response
        return {
            "app_name": app_name,
            "app_description": description,
            "app_category": category,
            "screenshots": screenshots_to_return,
            "icon": icon_path,
            "suggested_audience": analysis.get("suggested_audience", ""),
            "suggested_style": analysis.get("suggested_style", ""),
            "suggested_color": analysis.get("suggested_color", "#EEEEEE")
        }
        
    except Exception as e:
        logger.error(f"Play Store scraping failed for {package_id}: {e}")
        raise ValueError(f"Failed to fetch app details: {str(e)}")
