/**
 * api.js — API service layer for communicating with the FastAPI backend.
 * 
 * All API calls to the backend are centralized here.
 */

import axios from 'axios';

// const API_BASE = 'http://localhost:8001';
// const API_BASE = 'https://plural-muster-treading.ngrok-free.dev';
const API_BASE = 'https://asset-gen.rejoicehub.com';
const API_URL = `${API_BASE}/api`;

const api = axios.create({
  baseURL: API_URL,
  timeout: 0, // No timeout — wait for backend response, only error on actual failure
});

// Always send ngrok skip warning so fetch requests don't hit the HTML page
api.interceptors.request.use(config => {
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

/**
 * Generate initial batch of Play Store screenshot assets.
 * 
 * @param {Object} params
 * @param {string} params.appName
 * @param {string} params.appDescription
 * @param {string} params.appCategory
 * @param {string} params.colorTheme
 * @param {string} params.orientation
 * @param {File[]} params.screenshots - Optional uploaded screenshots
 * @returns {Promise<{session_id: string, assets: Array}>}
 */
export const generateAssets = async ({
  appName,
  targetAudience,
  brandStyle,
  appCategory,
  colorTheme,
  numPortrait,
  numLandscape,
  numSquare,
  portraitSize,
  landscapeSize,
  squareSize,
  includeBanner,
  features,
  includeSubtext,
  useRawFeatures,
  includeEmojis,
  screenshots,
  targetOs = 'iOS',
}) => {
  const formData = new FormData();
  formData.append('app_name', appName);
  formData.append('target_audience', targetAudience);
  formData.append('brand_style', brandStyle);
  formData.append('app_category', appCategory);
  formData.append('color_theme', colorTheme);
  formData.append('num_portrait', numPortrait);
  formData.append('num_landscape', numLandscape);
  formData.append('num_square', numSquare);
  formData.append('portrait_size', portraitSize);
  formData.append('landscape_size', landscapeSize);
  formData.append('square_size', squareSize);
  formData.append('include_banner', includeBanner);
  formData.append('features', JSON.stringify(features));
  formData.append('include_subtext', includeSubtext);
  formData.append('use_raw_features', useRawFeatures);
  formData.append('include_emojis', includeEmojis);
  formData.append('target_os', targetOs);

  // Append screenshots if provided
  if (screenshots && screenshots.length > 0) {
    screenshots.forEach((file) => {
      formData.append('screenshots', file);
    });
  }

  const response = await api.post('/generate-assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

/**
 * Generate one additional unique asset.
 * 
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {string} params.appName
 * @param {string} params.appDescription
 * @param {string} params.appCategory
 * @param {string} params.colorTheme
 * @param {string} params.orientation
 * @param {string[]} params.existingHeadlines - Headlines already generated
 * @returns {Promise<{asset: Object}>}
 */
export async function addAsset({
  sessionId,
  appName,
  targetAudience = '',
  brandStyle = '',
  appCategory,
  colorTheme = '#8B5E3C',
  orientation = 'portrait',
  targetOs = 'iOS',
  targetFeature,
  includeSubtext = false,
  useRawFeatures = false,
  includeEmojis = true,
  existingHeadlines = [],
  size = '1080x1920',
}) {
  const payload = {
    session_id: sessionId,
    app_name: appName,
    target_audience: targetAudience,
    brand_style: brandStyle,
    app_category: appCategory,
    color_theme: colorTheme,
    orientation: orientation,
    target_os: targetOs,
    target_feature: targetFeature,
    include_subtext: includeSubtext,
    use_raw_features: useRawFeatures,
    include_emojis: includeEmojis,
    existing_headlines: existingHeadlines,
    size: size,
  };

  const response = await api.post('/add-asset', payload);

  return response.data;
}

/**
 * Get the full URL for a generated asset image.
 * 
 * @param {string} imagePath - Relative path like /generated/abc123/asset-1.png
 * @returns {string} Full URL
 */
export function getImageUrl(imagePath) {
  if (imagePath.startsWith('/')) return `${API_BASE}${imagePath}`;
  return `${API_BASE}/${imagePath}`;
}

/**
 * Get the download URL for all assets as ZIP.
 * 
 * @param {string} sessionId
 * @returns {string} Full download URL
 */
export function getDownloadAllUrl(sessionId) {
  return `${API_URL}/download-all/${sessionId}`;
}

/**
 * Fetch an image securely and convert it to a local Blob URL, bypassing Ngrok HTML warnings.
 * 
 * @param {string} imagePath 
 * @returns {Promise<string>} Blob URL
 */
export async function fetchImageAsBlob(imagePath) {
  try {
    const url = imagePath.startsWith('http') ? imagePath : `${API_BASE}${imagePath}`;
    const response = await axios.get(url, {
      responseType: 'blob',
      headers: {
        'ngrok-skip-browser-warning': 'true' // Bypass ngrok warning page
      }
    });
    return window.URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Failed to fetch image as blob", error);
    return null;
  }
}

/**
 * Fetch an image and convert it to a File object.
 * 
 * @param {string} imagePath 
 * @param {string} fileName 
 * @returns {Promise<File>}
 */
export async function fetchImageFile(imagePath, fileName = 'screenshot.png') {
  try {
    const url = imagePath.startsWith('http') ? imagePath : (imagePath.startsWith('/') ? `${API_BASE}${imagePath}` : `${API_BASE}/${imagePath}`);
    const response = await axios.get(url, {
      responseType: 'blob',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    // Create a File from the blob
    return new File([response.data], fileName, { type: response.data.type });
  } catch (error) {
    console.error("Failed to fetch image as file", error);
    return null;
  }
}

/**
 * Fetch and trigger a ZIP download securely, bypassing Ngrok warnings.
 * 
 * @param {string} sessionId 
 */
export async function downloadZip(sessionId) {
  try {
    const url = `${API_URL}/download-all/${sessionId}`;
    const response = await axios.get(url, {
      responseType: 'blob',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    const blobUrl = window.URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `playstore-assets-${sessionId}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Failed to download ZIP securely", error);
    throw error;
  }
}

/**
 * Generate initial batch of 2 Ad Creatives for the session.
 * 
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {string} params.appName
 * @param {string} params.targetAudience
 * @param {string} params.brandStyle
 * @param {string} params.appCategory
 * @param {string} params.colorTheme
 * @param {string[]} params.features
 * @param {string[]} params.existingAssetKeys
 * @param {string[]} params.existingAdHooks
 * @returns {Promise<{ads: Array}>}
 */
export async function generateAds({
  sessionId,
  appName,
  targetAudience = '',
  brandStyle = '',
  appCategory,
  colorTheme = '#8B5E3C',
  targetOs = 'iOS',
  features = [],
  existingAssetKeys = [],
  existingAdHooks = [],
}) {
  const response = await api.post('/generate-ads', {
    session_id: sessionId,
    app_name: appName,
    target_audience: targetAudience,
    brand_style: brandStyle,
    app_category: appCategory,
    color_theme: colorTheme,
    target_os: targetOs,
    features: features,
    existing_asset_keys: existingAssetKeys,
    existing_ad_hooks: existingAdHooks,
  });

  return response.data;
}

/**
 * Generate one additional unique ad creative.
 * 
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {string} params.appName
 * @param {string} params.targetAudience
 * @param {string} params.brandStyle
 * @param {string} params.appCategory
 * @param {string} params.colorTheme
 * @param {string[]} params.features
 * @param {string[]} params.existingAssetKeys
 * @param {string[]} params.existingAdHooks - Hooks from already generated ads (for uniqueness)
 * @returns {Promise<{ad: Object}>}
 */
export async function addAdCreative({
  sessionId,
  appName,
  targetAudience = '',
  brandStyle = '',
  appCategory,
  colorTheme = '#8B5E3C',
  targetOs = 'iOS',
  features = [],
  existingAssetKeys = [],
  existingAdHooks = [],
}) {
  const response = await api.post('/add-ad', {
    session_id: sessionId,
    app_name: appName,
    target_audience: targetAudience,
    brand_style: brandStyle,
    app_category: appCategory,
    color_theme: colorTheme,
    target_os: targetOs,
    features: features,
    existing_asset_keys: existingAssetKeys,
    existing_ad_hooks: existingAdHooks,
  });

  return response.data;
}

export async function generateFeaturesList({
  appName,
  appCategory,
  targetAudience = '',
  brandStyle = '',
  appDescription,
}) {
  const response = await api.post('/generate-features-list', {
    app_name: appName,
    app_category: appCategory,
    target_audience: targetAudience,
    brand_style: brandStyle,
    app_description: appDescription,
  });
  return response.data;
}

export async function regenerateAsset({
  sessionId,
  assetId,
  appName,
  appCategory,
  targetAudience = '',
  brandStyle = '',
  colorTheme = '#8B5E3C',
  orientation = 'portrait',
  targetOs = 'iOS',
  featureConcept,
  includeSubtext = false,
  useRawFeatures = false,
  includeEmojis = true,
  isHero = false,
  assetIndex = 0,
  size = '1080x1920',
}) {
  const response = await api.post('/regenerate-asset', {
    session_id: sessionId,
    asset_id: assetId,
    app_name: appName,
    app_category: appCategory,
    target_audience: targetAudience,
    brand_style: brandStyle,
    color_theme: colorTheme,
    orientation: orientation,
    target_os: targetOs,
    feature_concept: featureConcept,
    include_subtext: includeSubtext,
    use_raw_features: useRawFeatures,
    include_emojis: includeEmojis,
    is_hero: isHero,
    asset_index: assetIndex,
    size: size,
  });
  return response.data;
}

/**
 * Generate Play Store short and full descriptions.
 * 
 * @param {Object} params
 * @param {string} params.appName
 * @param {string} params.appCategory
 * @param {string} params.targetAudience
 * @param {string} params.brandStyle
 * @param {string[]} params.features
 * @returns {Promise<{short_description: string, full_description: string}>}
 */
export async function generatePlayStoreDescription({
  appName,
  appCategory,
  targetAudience = '',
  brandStyle = '',
  features = [],
}) {
  const response = await api.post('/generate-play-store-description', {
    app_name: appName,
    app_category: appCategory,
    target_audience: targetAudience,
    brand_style: brandStyle,
    features: features,
  });

  return response.data;
}

/**
 * Scrape app details from Play Store.
 * 
 * @param {string} url - Play Store URL or package ID
 * @returns {Promise<Object>} Scraped app data and AI suggestions
 */
export async function scrapePlayStore(url) {
  const response = await api.post('/scrape-playstore', { url });
  return response.data;
}
