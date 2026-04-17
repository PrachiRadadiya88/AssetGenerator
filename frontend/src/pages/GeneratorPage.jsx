/**
 * GeneratorPage.jsx — Main generator dashboard page.
 * 
 * Two-column layout: Form (left) + Asset grid (right).
 * Manages state via useAssets hook and coordinates all generation actions.
 */

import { useState } from 'react';
import { AlertCircle, X, Sparkles, RotateCcw } from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import AppForm from '../components/AppForm';
import ScreenshotUploader from '../components/ScreenshotUploader';
import AssetGrid from '../components/AssetGrid';
import AddAssetButton from '../components/AddAssetButton';
import DownloadButton from '../components/DownloadButton';
import Loader from '../components/Loader';

export default function GeneratorPage() {
  const {
    sessionId,
    assets,
    isGenerating,
    isAddingMore,
    error,
    appDetails,
    generate,
    addMore,
    clearError,
    reset,
  } = useAssets();

  const [screenshots, setScreenshots] = useState([]);

  const handleSubmit = async (formData) => {
    await generate({
      ...formData,
      screenshots,
    });
  };

  const handleAddMore = async () => {
    await addMore();
  };

  const handleReset = () => {
    reset();
    setScreenshots([]);
  };

  const hasAssets = assets.length > 0;
  const orientation = appDetails?.orientation || 'portrait';

  return (
    <div className="page-enter min-h-[calc(100vh-65px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accentTerracotta" />
                Asset Generator
              </h1>
              <p className="text-sm text-textSecondary mt-1">
                Fill in your app details and let AI generate professional Play Store screenshots
              </p>
            </div>
            {hasAssets && (
              <button onClick={handleReset} className="btn-ghost text-sm">
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Generation Failed</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── Left Column: Form ─── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="card-base p-6 sticky top-24 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-textPrimary mb-1">App Details</h2>
                <p className="text-xs text-textSecondary">Enter your app information to generate assets</p>
              </div>

              <AppForm
                onSubmit={handleSubmit}
                isLoading={isGenerating}
                screenshots={screenshots}
                setScreenshots={setScreenshots}
              />
            </div>
          </div>

          {/* ─── Right Column: Results ─── */}
          <div className="lg:col-span-7 xl:col-span-8">
            {/* Loading State */}
            {isGenerating && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm font-medium text-textPrimary">
                    Generating your Play Store assets...
                  </p>
                  <span className="text-xs text-textSecondary">This may take up to a minute</span>
                </div>
                <Loader count={appDetails?.numAssets || 4} orientation={orientation} />
              </div>
            )}

            {/* Generated Assets */}
            {!isGenerating && hasAssets && (
              <div className="space-y-6">
                {/* Results Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-textPrimary">
                      Generated Assets
                      <span className="ml-2 text-sm font-normal text-textSecondary">
                        ({assets.length} {assets.length === 1 ? 'asset' : 'assets'})
                      </span>
                    </h2>
                    <p className="text-xs text-textSecondary mt-0.5">
                      Click on any asset to preview or download
                    </p>
                  </div>
                  <DownloadButton sessionId={sessionId} assetCount={assets.length} />
                </div>

                {/* Asset Grid */}
                <AssetGrid assets={assets} orientation={orientation} />

                {/* Add More */}
                <div className="flex items-center gap-4 pt-4 border-t border-primary/10">
                  <AddAssetButton
                    onClick={handleAddMore}
                    isLoading={isAddingMore}
                    disabled={isGenerating}
                  />
                  {isAddingMore && (
                    <span className="text-xs text-textSecondary animate-pulse-soft">
                      AI is crafting a unique new asset...
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isGenerating && !hasAssets && (
              <div className="flex items-center justify-center min-h-[500px]">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accentGold/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-accentGold/60" />
                  </div>
                  <h3 className="text-xl font-semibold text-textPrimary mb-2">
                    No Assets Generated Yet
                  </h3>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    Fill in your app details on the left and click{' '}
                    <span className="font-medium text-primary">"Generate Assets"</span>{' '}
                    to create professional Play Store screenshots with AI.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
