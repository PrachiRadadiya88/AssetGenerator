"""
schemas.py — Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional


class AssetItem(BaseModel):
    """Single generated asset returned to the client."""
    id: str
    headline: str
    subtext: Optional[str] = None
    image_url: str
    orientation: str = "portrait"
    width: int
    height: int


class GenerateAssetsResponse(BaseModel):
    """Response from POST /generate-assets."""
    session_id: str
    assets: list[AssetItem]


class AddAssetRequest(BaseModel):
    """Request body for POST /add-asset."""
    session_id: str
    app_name: str
    target_audience: str
    brand_style: str
    app_category: str
    color_theme: str = "#8B5E3C"
    primary_colors: list[str] = Field(default_factory=lambda: ["#8B5E3C"])
    orientation: str = "portrait"
    target_feature: str
    include_subtext: bool = False
    target_os: str = "iOS"
    existing_headlines: list[str] = Field(default_factory=list)
    use_raw_features: bool = False
    include_emojis: bool = True
    size: str = "1080x1920"
    consistent_background: bool = True
    language: str = "English"
    user_vision: str = ""


class AddAssetResponse(BaseModel):
    """Response from POST /add-asset."""
    asset: AssetItem


class FeatureContent(BaseModel):
    """Parsed AI-generated feature content."""
    feature: str
    headline: str
    subtext: Optional[str] = None


class AdItem(BaseModel):
    """Single generated ad creative returned to the client."""
    id: str
    hook: str
    headline: str
    primary_text: str
    cta: str
    image_url: str


class GenerateAdsRequest(BaseModel):
    """Request body for POST /generate-ads."""
    session_id: str
    app_name: str
    target_audience: str
    brand_style: str
    app_category: str
    color_theme: str
    target_os: str = "iOS"
    features: list[str] = Field(default_factory=list)
    existing_asset_keys: list[str] = Field(default_factory=list)
    existing_ad_hooks: list[str] = Field(default_factory=list)
    language: str = "English"


class GenerateAdsResponse(BaseModel):
    """Response from POST /generate-ads."""
    ads: list[AdItem]


class AddAdRequest(BaseModel):
    """Request body for POST /add-ad (generate one more unique ad)."""
    session_id: str
    app_name: str
    target_audience: str
    brand_style: str
    app_category: str
    color_theme: str
    target_os: str = "iOS"
    features: list[str] = Field(default_factory=list)
    existing_asset_keys: list[str] = Field(default_factory=list)
    existing_ad_hooks: list[str] = Field(default_factory=list)
    consistent_background: bool = True
    language: str = "English"


class AddAdResponse(BaseModel):
    """Response from POST /add-ad."""
    ad: AdItem

class GenerateFeaturesRequest(BaseModel):
    app_name: str
    app_category: str
    target_audience: str
    brand_style: str
    app_description: str
    language: str = "English"

class GenerateFeaturesResponse(BaseModel):
    features: list[str]

class GenerateDescriptionRequest(BaseModel):
    app_name: str
    app_category: str
    target_audience: str
    brand_style: str
    features: list[str]
    app_description: Optional[str] = ""
    include_emojis: bool = True
    language: str = "English"

class AppDescriptionResponse(BaseModel):
    short_description: str
    full_description: str

class RegenerateAssetRequest(BaseModel):
    session_id: str
    asset_id: str
    app_name: str
    app_category: str
    target_audience: str
    brand_style: str
    color_theme: str
    orientation: str = "portrait"
    target_os: str = "iOS"
    feature_concept: str
    include_subtext: bool = False
    is_hero: bool = False
    asset_index: int = 0
    use_raw_features: bool = False
    include_emojis: bool = True
    size: str = "1080x1920"
    existing_headline: Optional[str] = None
    existing_subtext: Optional[str] = None
    consistent_background: bool = True
    language: str = "English"
    user_vision: str = ""

class ScrapePlayStoreRequest(BaseModel):
    url: str

class ScrapedAppData(BaseModel):
    app_name: str
    app_description: str
    app_category: str
    screenshots: list[str]
    icon: str
    suggested_audience: str
    suggested_style: str
    suggested_color: str


"""
# ═════════════════════════════════════════════════════════════════
# VIDEO GENERATION SCHEMAS (COMMENTED OUT)
# ═════════════════════════════════════════════════════════════════

class VideoTextOverlaySpec(BaseModel):
    # Text overlay specification for a video scene.
    text: str = ""
    position: str = "bottom-center"
    font_style: str = "bold"
    font_size: str = "large"
    color: str = "#FFFFFF"


class VideoScene(BaseModel):
    # A single scene in the video storyboard.
    scene_number: int
    duration_seconds: int = 4
    scene_title: str = ""
    visual_description: str = ""
    text_overlay: str = ""
    screen_content: str = ""
    transition_in: str = "fade_in"
    transition_out: str = "morph"
    use_screenshot_index: Optional[int] = None


class VideoSceneVisual(BaseModel):
    # Visual Designer output for a single scene.
    scene_number: int
    video_generation_prompt: str
    text_overlay_spec: Optional[VideoTextOverlaySpec] = None
    motion_direction: str = ""
    scene_image_url: Optional[str] = None
    scene_video_url: Optional[str] = None


class GenerateVideoRequest(BaseModel):
    # Request body for POST /generate-video.
    session_id: Optional[str] = None
    app_name: str
    app_category: str
    target_audience: str = ""
    brand_style: str = ""
    color_theme: str = "#8B5E3C"
    target_os: str = "Android"
    features: list[str] = Field(default_factory=list)
    language: str = "English"
    video_type: str = "problem_solution"
    user_description: str = ""
    screenshot_ids: list[str] = Field(default_factory=list)


class VideoAgentStep(BaseModel):
    # Status of an individual agent in the pipeline.
    agent_name: str
    status: str = "pending"
    output_summary: str = ""


class GenerateVideoResponse(BaseModel):
    # Response from POST /generate-video.
    session_id: str
    video_type: str
    video_type_label: str
    creative_brief: dict = Field(default_factory=dict)
    artistic_direction: dict = Field(default_factory=dict)
    storyboard: list[dict] = Field(default_factory=list)
    scene_visuals: list[dict] = Field(default_factory=list)
    compliance_report: dict = Field(default_factory=dict)
    editing_spec: dict = Field(default_factory=dict)
    scene_images: list[str] = Field(default_factory=list)
    generated_videos: list[str] = Field(default_factory=list)
    final_video_url: Optional[str] = None
    agent_steps: list[VideoAgentStep] = Field(default_factory=list)


class VideoTypeInfo(BaseModel):
    # Info about a single video type.
    key: str
    label: str
    description: str
    scene_count: int
    focus: str


class VideoTypesResponse(BaseModel):
    # Response from GET /video-types.
    video_types: list[VideoTypeInfo]
"""

