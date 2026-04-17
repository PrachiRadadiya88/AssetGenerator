import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, AlertCircle, X, Megaphone, Loader2, Plus, RotateCw } from 'lucide-react';
import { addAsset, generateAds, addAdCreative, regenerateAsset } from '../services/api';
import AssetGrid from '../components/AssetGrid';
import AddAssetButton from '../components/AddAssetButton';
import DownloadButton from '../components/DownloadButton';
import AdCard from '../components/AdCard';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [assets, setAssets] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [appDetails, setAppDetails] = useState(null);
  
  const [isAddingMore, setIsAddingMore] = useState(false);
  const [error, setError] = useState(null);
  
  const [ads, setAds] = useState([]);
  const [isGeneratingAds, setIsGeneratingAds] = useState(false);
  const [isAddingAd, setIsAddingAd] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState(null);

  // Initialize from router state
  useEffect(() => {
    if (!location.state || !location.state.assets) {
      // If no state, we shouldn't be here
      navigate('/generator');
      return;
    }
    setAssets(location.state.assets);
    setAds(location.state.ads || []);
    setSessionId(location.state.sessionId);
    setAppDetails(location.state.appDetails);
  }, [location, navigate]);

  const handleAddMore = async () => {
    if (!sessionId || !appDetails) return;
    setIsAddingMore(true);
    setError(null);

    // Determine the next feature to use based on modulo of current length
    const totalFeatures = appDetails.features.length;
    const nextFeatureIndex = assets.length % totalFeatures;
    const targetFeature = appDetails.features[nextFeatureIndex];

    try {
      const result = await addAsset({
        sessionId,
        appName: appDetails.appName,
        tagline: appDetails.tagline,
        targetAudience: appDetails.targetAudience,
        appDescription: appDetails.appDescription,
        brandStyle: appDetails.brandStyle,
        appCategory: appDetails.appCategory,
        colorTheme: appDetails.colorTheme,
        orientation: appDetails.orientation,
        targetOs: appDetails.targetOs,
        includeSubtext: appDetails.includeSubtext,
        targetFeature: targetFeature,
      });
      const newAssets = [...assets, result.asset];
      setAssets(newAssets);
      navigate('.', { replace: true, state: { ...location.state, assets: newAssets } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add asset');
    } finally {
      setIsAddingMore(false);
    }
  };

  const handleGenerateAds = async () => {
    if (!sessionId || !appDetails) return;
    setIsGeneratingAds(true);
    setError(null);

    const existingKeys = assets.map(a => a.headline);

    try {
      const result = await generateAds({
        sessionId,
        appName: appDetails.appName,
        targetAudience: appDetails.targetAudience,
        brandStyle: appDetails.brandStyle,
        appCategory: appDetails.appCategory,
        colorTheme: appDetails.colorTheme,
        targetOs: appDetails.targetOs,
        features: appDetails.features,
        existingAssetKeys: existingKeys,
        existingAdHooks: [],
      });
      setAds(result.ads);
      navigate('.', { replace: true, state: { ...location.state, ads: result.ads } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate ad visuals');
    } finally {
      setIsGeneratingAds(false);
    }
  };

  const handleAddMoreAd = async () => {
    if (!sessionId || !appDetails) return;
    setIsAddingAd(true);
    setError(null);

    const existingKeys = assets.map(a => a.headline);
    const existingHooks = ads.map(a => a.hook);

    try {
      const result = await addAdCreative({
        sessionId,
        appName: appDetails.appName,
        targetAudience: appDetails.targetAudience,
        brandStyle: appDetails.brandStyle,
        appCategory: appDetails.appCategory,
        colorTheme: appDetails.colorTheme,
        targetOs: appDetails.targetOs,
        features: appDetails.features,
        existingAssetKeys: existingKeys,
        existingAdHooks: existingHooks,
      });
      const newAds = [...ads, result.ad];
      setAds(newAds);
      navigate('.', { replace: true, state: { ...location.state, ads: newAds } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add ad creative');
    } finally {
      setIsAddingAd(false);
    }
  };

  const handleRemoveAsset = (id) => {
    const newAssets = assets.filter((a) => a.id !== id);
    setAssets(newAssets);
    navigate('.', { replace: true, state: { ...location.state, assets: newAssets } });
  };

  const handleRegenerateAsset = async (asset, index) => {
    if (!sessionId || !appDetails) return;
    setRegeneratingId(asset.id);
    setError(null);

    const totalFeatures = appDetails.features.length;
    const isHero = index === 0;
    const targetFeature = isHero ? "Main App Overview" : (appDetails.features[index % totalFeatures] || "App Feature");

    try {
      const result = await regenerateAsset({
        sessionId,
        assetId: asset.id,
        appName: appDetails.appName,
        appCategory: appDetails.appCategory,
        targetAudience: appDetails.targetAudience,
        brandStyle: appDetails.brandStyle,
        colorTheme: appDetails.colorTheme,
        orientation: orientation,
        targetOs: appDetails.targetOs,
        featureConcept: targetFeature,
        includeSubtext: appDetails.includeSubtext,
        isHero: isHero,
        assetIndex: index,
      });
      
      const newAssets = assets.map((a) => a.id === asset.id ? result : a);
      setAssets(newAssets);
      navigate('.', { replace: true, state: { ...location.state, assets: newAssets } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to regenerate asset');
    } finally {
      setRegeneratingId(null);
    }
  };

  if (!appDetails) return null; // Wait for redirect or mount

  const orientation = appDetails.orientation || 'portrait';

  return (
    <div className="page-enter min-h-[calc(100vh-65px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => navigate('/generator')} 
              className="text-textSecondary hover:text-primary flex items-center gap-1.5 text-sm font-medium mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Start Over
            </button>
            <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accentTerracotta" />
              Generated Assets
            </h1>
            <p className="text-sm text-textSecondary mt-1">
              Your custom Play Store assets, beautifully drafted from your features.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <DownloadButton sessionId={sessionId} assetCount={assets.length} />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Addition Failed</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Assets List */}
        <div className="space-y-6">
          <AssetGrid 
            assets={assets} 
            orientation={orientation} 
            onRemove={handleRemoveAsset}
            onRegenerate={handleRegenerateAsset}
            isRegeneratingId={regeneratingId}
          />

          {/* Add More */}
          <div className="flex items-center gap-4 pt-6 border-t border-primary/10">
            <AddAssetButton
              onClick={handleAddMore}
              isLoading={isAddingMore}
              disabled={isAddingMore}
            />
            {isAddingMore && (
              <span className="text-xs text-textSecondary animate-pulse-soft">
                Orchestrating design and copy for new feature...
              </span>
            )}
          </div>
        </div>

        {/* Ad Visuals Section */}
        <div className="mt-16 pt-12 border-t border-primary/20">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-indigo-500" />
                Ad Visuals
              </h2>
              <p className="text-sm text-textSecondary mt-1">
                Create high-converting social media creatives based on your app features.
              </p>
            </div>
            {!isGeneratingAds && ads.length === 0 && (
              <button
                onClick={handleGenerateAds}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Create Ad Visuals
              </button>
            )}
          </div>

          {isGeneratingAds && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
              <h3 className="text-lg font-medium text-textPrimary">Drafting your ad creatives...</h3>
              <p className="text-sm text-textSecondary mt-2">This may take up to 60 seconds as our AI designs 2 unique marketing angles.</p>
            </div>
          )}

          {!isGeneratingAds && ads.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map((ad, idx) => (
                <div key={ad.id || idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 150}ms` }}>
                  <AdCard ad={ad} />
                </div>
              ))}
            </div>
          )}
          
          {!isGeneratingAds && ads.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={handleAddMoreAd}
                disabled={isAddingAd}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                {isAddingAd ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Add More Ads</>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
