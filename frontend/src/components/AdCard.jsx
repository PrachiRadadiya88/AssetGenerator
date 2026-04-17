import { useState, useEffect } from 'react';
import { Download, Eye, X, Loader2 } from 'lucide-react';
import { fetchImageAsBlob } from '../services/api';

export default function AdCard({ ad }) {
  const [showPreview, setShowPreview] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSecureImg = async () => {
      setIsLoadingImage(true);
      const url = await fetchImageAsBlob(ad.image_url);
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
  }, [ad.image_url]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!blobUrl) return;
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ad.id}-ad.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download individual ad:", err);
    }
  };

  return (
    <>
      {/* Card */}
      <div className="card-base overflow-hidden flex flex-col h-full hover:shadow-lg transition-all duration-300">
        {/* Image Preview — constrained height */}
        <div className="relative group w-full bg-slate-100 border-b border-primary/10 flex-shrink-0 min-h-[250px] flex items-center justify-center">
          {isLoadingImage ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
              <span className="text-[10px] font-bold text-primary animate-pulse">Loading ad...</span>
            </div>
          ) : (
            <img
              src={blobUrl}
              alt={ad.headline}
              className="w-full h-auto block"
              loading="lazy"
            />
          )}
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => setShowPreview(true)}
              className="bg-white text-textPrimary px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/5 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="bg-white text-textPrimary px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/5 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* Ad Details */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="mb-1.5">
            <span className="inline-block px-2 py-0.5 bg-accentTerracotta/10 text-accentTerracotta text-[10px] font-bold uppercase tracking-wider rounded-md">
              {ad.hook}
            </span>
          </div>
          <h3 className="text-sm font-bold text-textPrimary mb-1.5 leading-snug">
            {ad.headline}
          </h3>
          <p className="text-xs text-textSecondary flex-grow mb-3 line-clamp-2">
            {ad.primary_text}
          </p>
          <div className="mt-auto flex justify-between items-center border-t border-primary/10 pt-3">
            <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-widest">
              CTA:
            </span>
            <span className="text-xs font-bold text-primary">
              {ad.cta}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Full Image */}
            <div className="min-h-[300px] flex items-center justify-center bg-gray-50">
              {isLoadingImage ? (
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              ) : (
                <img
                  src={blobUrl}
                  alt={ad.headline}
                  className="w-full h-auto"
                />
              )}
            </div>

            {/* Info Bar */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-xs text-textSecondary font-medium uppercase tracking-wider mb-0.5">{ad.hook}</p>
                  <p className="text-sm font-bold text-textPrimary truncate">{ad.headline}</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex-shrink-0 bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
