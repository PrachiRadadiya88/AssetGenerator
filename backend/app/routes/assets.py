"""
assets.py — API routes for screenshot asset generation.

Endpoints:
  POST /generate-assets  — Generate initial batch of assets
  POST /add-asset         — Generate one additional unique asset
  GET  /download-all/{session_id} — Download all assets as ZIP
"""

import os
import uuid
import zipfile
import logging
import asyncio
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse

from app.models.schemas import (
    AssetItem,
    GenerateAssetsResponse,
    AddAssetRequest,
    AddAssetResponse,
    GenerateAdsRequest,
    GenerateAdsResponse,
    AddAdRequest,
    AddAdResponse,
    GenerateFeaturesRequest,
    GenerateFeaturesResponse,
    RegenerateAssetRequest,
    FeatureContent,
    GenerateDescriptionRequest,
    AppDescriptionResponse,
    ScrapePlayStoreRequest,
    ScrapedAppData,
)
from app.services.gemini_service import (
    generate_feature_copy,
    generate_asset_image,
    generate_ad_creatives_text,
    generate_ad_image,
    extract_features_list,
    generate_subtext,
    generate_app_description,
)
from app.services.scrape_service import scrape_app_details
from app.services.image_service import compose_asset, compose_ad_asset

logger = logging.getLogger(__name__)
router = APIRouter()

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GENERATED_DIR = os.path.join(BASE_DIR, "generated")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

# Ensure directories exist
os.makedirs(GENERATED_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)


def _get_dimensions(orientation: str, custom_size: str = None):
    """Get width and height based on orientation or custom size string."""
    if custom_size and "x" in custom_size:
        try:
            w, h = map(int, custom_size.split("x"))
            return w, h
        except:
            pass

    if orientation == "landscape":
        return 1920, 1080
    if orientation == "banner":
        return 1024, 500
    if orientation == "square":
        return 1080, 1080
    return 1080, 1920  # portrait (default)


@router.post("/generate-assets", response_model=GenerateAssetsResponse)
async def generate_assets(
    app_name: str = Form(...),
    target_audience: str = Form(""),
    brand_style: str = Form(""),
    app_category: str = Form(...),
    color_theme: str = Form("#8B5E3C"),
    target_os: str = Form("iOS"),
    num_portrait: int = Form(4),
    num_landscape: int = Form(0),
    num_square: int = Form(0),
    include_banner: bool = Form(True),
    portrait_size: str = Form("1080x1920"),
    landscape_size: str = Form("1920x1080"),
    square_size: str = Form("1080x1080"),
    features: str = Form("[]"),
    include_subtext: bool = Form(False),
    use_raw_features: bool = Form(False),
    include_emojis: bool = Form(True),
    consistent_background: bool = Form(True),
    language: str = Form("English"),
    screenshots: Optional[list[UploadFile]] = File(None),
):
    """
    Generate initial batch of Play Store screenshot assets.
    
    Accepts app details via form data and optional screenshot uploads.
    Returns 2 unique assets with AI-generated headlines and images.
    """
    # Create a unique session
    session_id = str(uuid.uuid4())[:8]
    session_dir = os.path.join(GENERATED_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)

    # Save uploaded screenshots if provided
    uploaded_paths = []
    if screenshots:
        upload_session_dir = os.path.join(UPLOADS_DIR, session_id)
        os.makedirs(upload_session_dir, exist_ok=True)
        for i, file in enumerate(screenshots):
            if file.filename and file.size > 0:
                ext = os.path.splitext(file.filename)[1] or ".png"
                save_path = os.path.join(upload_session_dir, f"upload_{i}{ext}")
                content = await file.read()
                with open(save_path, "wb") as f:
                    f.write(content)
                uploaded_paths.append(save_path)
                logger.info(f"Saved uploaded screenshot: {save_path}")

    import json
    try:
        feature_list = json.loads(features)
        if not feature_list:
            feature_list = ["Core Feature 1", "Core Feature 2"]
    except:
        feature_list = ["Core Feature 1", "Core Feature 2"]
        
    # Build the list of requirements for this batch
    asset_requirements = [] # list of (orientation, feature_concept, index)
    
    current_index = 0
    
    # 1. Feature Graphic (Banner)
    if include_banner:
        asset_requirements.append(("banner", feature_list[0], current_index, "1024x500"))
        current_index += 1
        
    # 2. Portrait Screenshots
    num_portrait = max(0, min(8, num_portrait))
    for i in range(num_portrait):
        feat = feature_list[current_index % len(feature_list)]
        asset_requirements.append(("portrait", feat, current_index, portrait_size))
        current_index += 1
        
    # 3. Landscape Screenshots
    num_landscape = max(0, min(8, num_landscape))
    for i in range(num_landscape):
        feat = feature_list[current_index % len(feature_list)]
        asset_requirements.append(("landscape", feat, current_index, landscape_size))
        current_index += 1
        
    # 4. Square Screenshots
    num_square = max(0, min(8, num_square))
    for i in range(num_square):
        feat = feature_list[current_index % len(feature_list)]
        asset_requirements.append(("square", feat, current_index, square_size))
        current_index += 1

    # Clamp total assets if needed (e.g. max 12 total)
    asset_requirements = asset_requirements[:12]

    # Step 1: Generate feature content (headlines + subtext) via Gemini
    try:
        initial_features_concepts = [req[1] for req in asset_requirements]
        
        if use_raw_features:
            generated_features = []
            for feat in initial_features_concepts:
                subtext = None
                if include_subtext:
                    subtext = await generate_subtext(
                        app_name=app_name,
                        app_category=app_category,
                        feature_concept=feat,
                        headline=feat
                    )
                generated_features.append(FeatureContent(feature=feat, headline=feat, subtext=subtext))
        else:
            tasks = [
                generate_feature_copy(
                    app_name=app_name,
                    app_category=app_category,
                    target_audience=target_audience,
                    brand_style=brand_style,
                    feature_concept=feat_concept,
                    is_hero=(i == 0),
                    include_subtext=include_subtext,
                    language=language,
                ) for i, feat_concept in enumerate(initial_features_concepts)
            ]
            generated_features = await asyncio.gather(*tasks)
    except Exception as e:
        logger.error(f"Feature generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI text generation failed: {str(e)}")

    # Step 2: Generate images for each feature concurrently
    async def process_asset(i, feature):
        asset_id = f"asset-{i + 1}"
        bg_path = os.path.join(session_dir, f"{asset_id}_bg.png")
        final_path = os.path.join(session_dir, f"{asset_id}.png")

        # Determine if we should use an uploaded screenshot (only for portrait/landscape, not banner usually but we'll follow indices)
        uploaded_path = uploaded_paths[i] if i < len(uploaded_paths) else None
        
        # Get dimensions for this specific asset's orientation
        asset_orientation, _, _, asset_size_str = asset_requirements[i]
        asset_width, asset_height = _get_dimensions(asset_orientation, asset_size_str)

        # Retry up to 3 attempts for AI image generation
        max_retries = 3
        success = False
        for attempt in range(1, max_retries + 1):
            try:
                logger.info(f"Image generation attempt {attempt}/{max_retries} for {asset_id} ({asset_orientation})")
                await generate_asset_image(
                    app_name=app_name,
                    app_category=app_category,
                    feature=feature.feature,
                    headline=feature.headline,
                    color_theme=color_theme,
                    width=asset_width,
                    height=asset_height,
                    output_path=bg_path,
                    orientation=asset_orientation,
                    uploaded_image_path=uploaded_path,
                    asset_index=i,
                    target_os=target_os,
                    subtext=feature.subtext,
                    include_emojis=include_emojis,
                    consistent_background=consistent_background,
                )
                success = True
                break  # Success, exit retry loop
            except Exception as e:
                logger.warning(f"Image generation attempt {attempt}/{max_retries} failed for {asset_id}: {e}")
                if attempt < max_retries:
                    await asyncio.sleep(2)  # Brief pause before retry
                else:
                    logger.error(f"All {max_retries} attempts failed for {asset_id}.")

        if not success:
            logger.error(f"Skipping {asset_id} completely due to AI image generation failure.")
            return None # Instead of fallback, ignore this failed image entirely

        # Compose final asset with text overlay
        try:
            compose_asset(
                headline=feature.headline,
                color_theme=color_theme,
                orientation=asset_orientation,
                ai_generated_path=bg_path,
                uploaded_path=uploaded_path,
                output_path=final_path,
                target_width=asset_width,
                target_height=asset_height,
            )
        except Exception as e:
            logger.error(f"Image composition failed for {asset_id}: {e}")
            return None

        return AssetItem(
            id=asset_id,
            headline=feature.headline,
            subtext=feature.subtext,
            image_url=f"/generated/{session_id}/{asset_id}.png",
            orientation=asset_orientation,
            width=asset_width,
            height=asset_height,
        )

    tasks = [process_asset(i, feature) for i, feature in enumerate(generated_features)]
    results = await asyncio.gather(*tasks)
    assets = [r for r in results if r is not None]

    if not assets:
        raise HTTPException(status_code=500, detail="Failed to generate valid assets. AI generation timeout.")

    return GenerateAssetsResponse(session_id=session_id, assets=assets)


@router.post("/add-asset", response_model=AddAssetResponse)
async def add_asset(request: AddAssetRequest):
    """
    Generate one additional unique asset.
    
    Takes existing headlines to ensure the new asset is unique.
    """
    session_dir = os.path.join(GENERATED_DIR, request.session_id)
    os.makedirs(session_dir, exist_ok=True)

    orientation = request.orientation
    size_str = getattr(request, 'size', None)
    width, height = _get_dimensions(orientation, size_str)
    
    existing_files = _get_generated_screenshots(session_dir)
    next_num = len(existing_files) + 1
    asset_id = f"asset-{next_num}"

    # Step 1: Generate unique feature content
    try:
        if request.use_raw_features:
            subtext = None
            if request.include_subtext:
                subtext = await generate_subtext(
                    app_name=request.app_name,
                    app_category=request.app_category,
                    feature_concept=request.target_feature,
                    headline=request.target_feature
                )
            feature = FeatureContent(feature=request.target_feature, headline=request.target_feature, subtext=subtext)
        else:
            feature = await generate_feature_copy(
                app_name=request.app_name,
                app_category=request.app_category,
                target_audience=request.target_audience,
                brand_style=request.brand_style,
                feature_concept=request.target_feature,
                include_subtext=request.include_subtext,
            )
    except Exception as e:
        logger.error(f"Single feature generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI text generation failed: {str(e)}")

    # Step 2: Generate image
    bg_path = os.path.join(session_dir, f"{asset_id}_bg.png")
    final_path = os.path.join(session_dir, f"{asset_id}.png")

    # Retry up to 3 attempts for AI image generation
    max_retries = 3
    success = False
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Image generation attempt {attempt}/{max_retries} for {asset_id}")
            await generate_asset_image(
                app_name=request.app_name,
                app_category=request.app_category,
                feature=feature.feature,
                headline=feature.headline,
                color_theme=request.color_theme,
                width=width,
                height=height,
                output_path=bg_path,
                orientation=request.orientation,
                asset_index=next_num - 1,
                target_os=request.target_os,
                subtext=feature.subtext,
                include_emojis=request.include_emojis,
                consistent_background=request.consistent_background,
            )
            success = True
            break  # Success
        except Exception as e:
            logger.warning(f"Image generation attempt {attempt}/{max_retries} failed for {asset_id}: {e}")
            if attempt < max_retries:
                await asyncio.sleep(2)
            else:
                logger.error(f"All {max_retries} attempts failed for {asset_id}.")

    if not success:
        raise HTTPException(status_code=500, detail="AI image generation failed due to high demand. Please try adding the asset again.")

    # Step 3: Compose final asset
    try:
        compose_asset(
            headline=feature.headline,
            color_theme=request.color_theme,
            orientation=request.orientation,
            ai_generated_path=bg_path,
            uploaded_path=None, # Only initial batch takes uploads
            output_path=final_path,
            target_width=width,
            target_height=height,
        )
    except Exception as e:
        logger.error(f"Image composition failed for {asset_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Image composition failed: {str(e)}")

    return AddAssetResponse(
        asset=AssetItem(
            id=asset_id,
            headline=feature.headline,
            subtext=feature.subtext,
            image_url=f"/generated/{request.session_id}/{asset_id}.png",
            orientation=orientation,
            width=width,
            height=height,
        )
    )


@router.get("/download-all/{session_id}")
async def download_all(session_id: str):
    """
    Download all generated assets for a session as a ZIP file.
    """
    session_dir = os.path.join(GENERATED_DIR, session_id)

    if not os.path.exists(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")

    # Collect final asset files (exclude _bg files)
    asset_files = [
        f for f in os.listdir(session_dir)
        if f.endswith(".png") and not f.endswith("_bg.png")
    ]

    if not asset_files:
        raise HTTPException(status_code=404, detail="No assets found for this session")

    # Create ZIP in memory
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename in sorted(asset_files):
            filepath = os.path.join(session_dir, filename)
            zf.write(filepath, filename)

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename=playstore-assets-{session_id}.zip"
        },
    )


def _get_generated_screenshots(session_dir: str) -> list[str]:
    """Get paths to already-generated Play Store screenshot assets in this session."""
    if not os.path.exists(session_dir):
        return []
    return sorted([
        os.path.join(session_dir, f)
        for f in os.listdir(session_dir)
        if f.startswith("asset-") and f.endswith(".png") and "_bg" not in f
    ])


async def _compose_single_ad(request_data: dict, ad, session_dir: str, screenshot_path: str | None, ad_index: int = 0) -> bool:
    """Generate image and compose a single ad creative. Returns True if successful."""
    bg_path = os.path.join(session_dir, f"{ad.id}_bg.png")
    final_path = os.path.join(session_dir, f"{ad.id}_final.png")

    max_retries = 2
    success = False
    for attempt in range(1, max_retries + 1):
        try:
            await generate_ad_image(
                app_name=request_data["app_name"],
                app_category=request_data["app_category"],
                hook=ad.hook,
                headline=ad.headline,
                color_theme=request_data["color_theme"],
                output_path=bg_path,
                uploaded_image_path=screenshot_path,
                target_audience=request_data.get("target_audience", ""),
                target_os=request_data.get("target_os", "iOS"),
                ad_index=ad_index,
            )
            success = True
            break
        except Exception as e:
            logger.warning(f"Ad image gen attempt {attempt} failed for {ad.id}: {e}")
            if attempt < max_retries:
                await asyncio.sleep(2)

    if not success:
        logger.error(f"AI image gen entirely failed for {ad.id}, skipping fallback.")
        return False

    try:
        compose_ad_asset(
            hook=ad.hook,
            headline=ad.headline,
            primary_text=ad.primary_text,
            cta=ad.cta,
            color_theme=request_data["color_theme"],
            ai_generated_path=bg_path,
            output_path=final_path,
        )
        ad.image_url = f"/generated/{request_data['session_id']}/{os.path.basename(final_path)}"
        return True
    except Exception as e:
        logger.error(f"Ad composition failed for {ad.id}: {e}")
        return False


@router.post("/generate-ads", response_model=GenerateAdsResponse)
async def generate_ads(request: GenerateAdsRequest):
    """
    Generate initial batch of 2 ad visuals.
    Uses already-generated screenshot assets as image references.
    """
    session_dir = os.path.join(GENERATED_DIR, request.session_id)
    os.makedirs(session_dir, exist_ok=True)

    # Build context strings
    asset_headlines_and_features = ""
    if request.existing_asset_keys:
        asset_headlines_and_features = "\n".join([f"- Feature covered: {k}" for k in request.existing_asset_keys])
    else:
        asset_headlines_and_features = "No existing screenshots provided as context."

    features_str = "\n".join([f"- {f}" for f in request.features])

    # Generate exactly 2 ad creatives
    try:
        ads = await generate_ad_creatives_text(
            app_name=request.app_name,
            target_audience=request.target_audience,
            features_list=features_str,
            asset_headlines_and_features=asset_headlines_and_features,
            num_ads=2,
            existing_ad_hooks=request.existing_ad_hooks if request.existing_ad_hooks else None,
        )
    except Exception as e:
        logger.error(f"Failed to generate ad copy: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate ad copy")

    # Use generated screenshot assets as image references
    screenshots = _get_generated_screenshots(session_dir)

    request_data = {
        "session_id": request.session_id,
        "app_name": request.app_name,
        "app_category": request.app_category,
        "color_theme": request.color_theme,
        "target_audience": request.target_audience,
        "target_os": request.target_os if hasattr(request, 'target_os') else "iOS",
    }

    async def process_ad(i, ad):
        screenshot_path = screenshots[i % len(screenshots)] if screenshots else None
        try:
            success = await _compose_single_ad(request_data, ad, session_dir, screenshot_path, ad_index=i)
            if success:
                return ad
        except Exception as e:
            logger.error(f"Image composition for ad {ad.id} failed: {e}")
        return None

    tasks = [process_ad(i, ad) for i, ad in enumerate(ads)]
    results = await asyncio.gather(*tasks)
    successful_ads = [r for r in results if r is not None]

    if not successful_ads:
        raise HTTPException(status_code=500, detail="Failed to generate any valid ads due to AI image generation timeouts/limits.")

    return GenerateAdsResponse(ads=successful_ads)


@router.post("/add-ad", response_model=AddAdResponse)
async def add_ad(request: AddAdRequest):
    """
    Generate one additional unique ad creative.
    Ensures uniqueness by passing existing ad hooks to the AI.
    """
    session_dir = os.path.join(GENERATED_DIR, request.session_id)
    os.makedirs(session_dir, exist_ok=True)

    # Build context
    asset_headlines_and_features = ""
    if request.existing_asset_keys:
        asset_headlines_and_features = "\n".join([f"- Feature covered: {k}" for k in request.existing_asset_keys])
    else:
        asset_headlines_and_features = "No existing screenshots provided as context."

    features_str = "\n".join([f"- {f}" for f in request.features])

    # Generate exactly 1 new unique ad
    try:
        ads = await generate_ad_creatives_text(
            app_name=request.app_name,
            target_audience=request.target_audience,
            features_list=features_str,
            asset_headlines_and_features=asset_headlines_and_features,
            num_ads=1,
            existing_ad_hooks=request.existing_ad_hooks if request.existing_ad_hooks else None,
        )
    except Exception as e:
        logger.error(f"Failed to generate single ad: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate ad copy")

    if not ads:
        raise HTTPException(status_code=500, detail="AI returned no ad creatives")

    ad = ads[0]
    # Assign a unique ID based on existing ad count
    existing_ad_files = [f for f in os.listdir(session_dir) if f.startswith("ad-") and f.endswith("_final.png")]
    next_num = len(existing_ad_files) + 1
    ad.id = f"ad-{next_num}"

    # Use generated screenshots as reference
    screenshots = _get_generated_screenshots(session_dir)
    screenshot_path = screenshots[next_num % len(screenshots)] if screenshots else None

    request_data = {
        "session_id": request.session_id,
        "app_name": request.app_name,
        "app_category": request.app_category,
        "color_theme": request.color_theme,
        "target_audience": request.target_audience,
        "target_os": request.target_os if hasattr(request, 'target_os') else "iOS",
    }

    try:
        success = await _compose_single_ad(request_data, ad, session_dir, screenshot_path, ad_index=next_num)
        if not success:
            raise HTTPException(status_code=500, detail="AI image generation failed due to high demand. Please try again.")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        logger.error(f"Image composition for ad {ad.id} failed: {e}")
        raise HTTPException(status_code=500, detail=f"Image composition failed for {ad.id}")

    return AddAdResponse(ad=ad)


@router.post("/generate-features-list", response_model=GenerateFeaturesResponse)
async def generate_features_list(request: GenerateFeaturesRequest):
    """Generate a list of features based on an app description."""
    try:
        features = await extract_features_list(
            app_name=request.app_name,
            app_category=request.app_category,
            target_audience=request.target_audience,
            brand_style=request.brand_style,
            app_description=request.app_description,
            language=request.language,
        )
        return GenerateFeaturesResponse(features=features)
    except Exception as e:
        logger.error(f"Generate features failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate features from description")


@router.post("/regenerate-asset", response_model=AssetItem)
async def regenerate_asset(request: RegenerateAssetRequest):
    """Regenerate a single specific asset within a session, replacing the old file."""
    session_dir = os.path.join(GENERATED_DIR, request.session_id)
    if not os.path.exists(session_dir):
        raise HTTPException(status_code=404, detail="Session not found")

    asset_id = request.asset_id
    bg_path = os.path.join(session_dir, f"{asset_id}_bg.png")
    final_path = os.path.join(session_dir, f"{asset_id}.png")

    try:
        if request.existing_headline:
            feature_data = FeatureContent(
                feature=request.feature_concept,
                headline=request.existing_headline,
                subtext=request.existing_subtext
            )
            logger.info(f"Preserving existing headline for regeneration: {request.existing_headline}")
        elif request.use_raw_features:
            subtext = None
            if request.include_subtext:
                subtext = await generate_subtext(
                    app_name=request.app_name,
                    app_category=request.app_category,
                    feature_concept=request.feature_concept,
                    headline=request.feature_concept,
                    language=request.language
                )
            feature_data = FeatureContent(feature=request.feature_concept, headline=request.feature_concept, subtext=subtext)
        else:
            feature_data = await generate_feature_copy(
                app_name=request.app_name,
                app_category=request.app_category,
                target_audience=request.target_audience,
                brand_style=request.brand_style,
                feature_concept=request.feature_concept,
                is_hero=request.is_hero,
                include_subtext=request.include_subtext,
                language=request.language
            )
    except Exception as e:
        logger.error(f"Feature copy regeneration failed: {e}")
        raise HTTPException(status_code=500, detail="AI text generation failed")

    orientation = request.orientation
    size_str = getattr(request, 'size', None)
    width, height = _get_dimensions(orientation, size_str)
    
    max_retries = 3
    success = False
    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Regenerating image {attempt}/{max_retries} for {asset_id}")
            await generate_asset_image(
                app_name=request.app_name,
                app_category=request.app_category,
                feature=feature_data.feature,
                headline=feature_data.headline,
                color_theme=request.color_theme,
                width=width,
                height=height,
                output_path=bg_path,
                orientation=request.orientation,
                asset_index=request.asset_index,
                target_os=request.target_os,
                subtext=feature_data.subtext,
                include_emojis=request.include_emojis,
                consistent_background=request.consistent_background,
            )
            success = True
            break
        except Exception as e:
            if attempt < max_retries:
                await asyncio.sleep(2)

    if not success:
        raise HTTPException(status_code=500, detail="Image regeneration failed due to high demand.")

    try:
        compose_asset(
            headline=feature_data.headline,
            color_theme=request.color_theme,
            orientation=request.orientation,
            ai_generated_path=bg_path,
            uploaded_path=None,  # We don't support passing uploaded file for single regeneration yet
            output_path=final_path,
            target_width=width,
            target_height=height,
        )
    except Exception as e:
        logger.error(f"Image composition failed: {e}")
        raise HTTPException(status_code=500, detail="Image composition failed")

    return AssetItem(
        id=asset_id,
        headline=feature_data.headline,
        subtext=feature_data.subtext,
        image_url=f"/generated/{request.session_id}/{asset_id}.png",
        orientation=orientation,
        width=width,
        height=height,
    )

@router.post("/generate-play-store-description", response_model=AppDescriptionResponse)
async def generate_play_store_description(request: GenerateDescriptionRequest):
    """Generate Play Store short and full descriptions based on app details."""
    try:
        description = await generate_app_description(
            app_name=request.app_name,
            app_category=request.app_category,
            target_audience=request.target_audience,
            brand_style=request.brand_style,
            features=request.features,
            app_description=request.app_description,
            include_emojis=request.include_emojis,
            language=request.language,
        )
        return description
    except Exception as e:
        logger.error(f"Description generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate app description")

@router.post("/scrape-playstore", response_model=ScrapedAppData)
async def scrape_playstore(request: ScrapePlayStoreRequest):
    """
    Scrape app details from Play Store and analyze them.
    Assigns a temporary session ID for downloaded images.
    """
    session_id = str(uuid.uuid4())
    try:
        data = await scrape_app_details(request.url, session_id)
        return ScrapedAppData(**data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Play Store scrape failed: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while scraping Play Store")
