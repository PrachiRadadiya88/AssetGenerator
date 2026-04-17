import { useState, useEffect } from 'react';
import { Download, Eye, RotateCw, X, Loader2 } from 'lucide-react';
import { fetchImageAsBlob } from '../services/api';

export default function AssetCard({ asset, index, orientation, onRemove, onRegenerate, isRegenerating }) {
  const isPortrait = orientation === 'portrait';
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSecureImg = async () => {
      setIsLoadingImage(true);
      const url = await fetchImageAsBlob(asset.image_url);
      if (isMounted) {
        setBlobUrl(url);
        setIsLoadingImage(false);
      }
    };
    loadSecureImg();
    return () => {
      isMounted = false;
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
    };
  }, [asset.image_url, isRegenerating]); // Reload if regenerating finishes

  const handleDownload = async () => {
    if (!blobUrl) return;
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${asset.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handlePreview = () => {
    if (blobUrl) window.open(blobUrl, '_blank');
  };

  return (
    <div
      className={`card-base card-hover overflow-hidden animate-slide-up group relative ${isRegenerating ? 'opacity-70 grayscale' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
      id={`asset-card-${asset.id}`}
    >
      {/* Remove Button (X) */}
      <button 
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-md rounded-full text-textSecondary hover:text-red-500 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Remove Asset"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Image Preview */}
      <div className="relative overflow-hidden bg-backgroundSoft">
        <div
          className="w-full"
          style={{ aspectRatio: isPortrait ? '9/16' : '16/9' }}
        >
          {isRegenerating || isLoadingImage ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-secondary/10">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-xs font-bold text-primary animate-pulse">
                {isRegenerating ? 'Regenerating...' : 'Loading image...'}
              </span>
            </div>
          ) : (
            <img
              src={blobUrl}
              alt={asset.headline}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </div>

        {/* Overlay actions on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          {!isRegenerating && (
            <div className="flex flex-wrap items-center justify-center gap-2 px-2">
              <button
                onClick={handlePreview}
                className="px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-bold text-textPrimary hover:bg-white transition-colors flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={onRegenerate}
                className="px-2.5 py-1.5 bg-accentTerracotta/90 backdrop-blur-sm rounded-lg text-[11px] font-bold text-white hover:bg-accentTerracotta transition-colors flex items-center gap-1"
                title="Regenerate this specific asset"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Regenerate
              </button>
              <button
                onClick={handleDownload}
                className="px-2.5 py-1.5 bg-primary/90 backdrop-blur-sm rounded-lg text-[11px] font-bold text-white hover:bg-primary transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          )}
        </div>

        {/* Asset number badge */}
        <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center">
          <span className="text-xs font-bold text-white">{index + 1}</span>
        </div>
      </div>
    </div>
  );
}
