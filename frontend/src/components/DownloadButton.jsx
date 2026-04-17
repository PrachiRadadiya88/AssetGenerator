/**
 * DownloadButton.jsx — Download all generated assets as a ZIP file.
 */

import { useState } from 'react';
import { Download, Package, Loader2 } from 'lucide-react';
import { downloadZip } from '../services/api';

export default function DownloadButton({ sessionId, assetCount }) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!sessionId || assetCount === 0) return null;

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      await downloadZip(sessionId);
    } catch (e) {
      console.error(e);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadAll}
      className={`btn-primary text-sm py-2.5 px-5 ${isDownloading ? 'opacity-80 cursor-wait' : ''}`}
      id="download-all-button"
      disabled={isDownloading}
    >
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
      {isDownloading ? 'Downloading ZIP...' : `Download All (${assetCount}) as ZIP`}
    </button>
  );
}
