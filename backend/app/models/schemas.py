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


class AddAdResponse(BaseModel):
    """Response from POST /add-ad."""
    ad: AdItem

class GenerateFeaturesRequest(BaseModel):
    app_name: str
    app_category: str
    target_audience: str
    brand_style: str
    app_description: str

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
