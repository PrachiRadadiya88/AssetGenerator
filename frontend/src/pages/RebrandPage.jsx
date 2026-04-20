/**
 * RebrandPage.jsx — Starting point for rebranding existing Play Store apps.
 * 
 * Features a URL/PackageID input, scraping logic, and transitions into 
 * the generator form pre-filled with the scraped metadata.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Search, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  Monitor,
  X
} from 'lucide-react';
import { scrapePlayStore, fetchImageFile, generateAssets } from '../services/api';
import AppForm from '../components/AppForm';
import Loader from '../components/Loader';

export default function RebrandPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [scrapeError, setScapeError] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [orientation, setOrientation] = useState('portrait');

  const [screenshots, setScreenshots] = useState([]);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setScapeError(null);
    setIsScraping(true);
    try {
      const data = await scrapePlayStore(url);
      
      setScrapedData({
        appName: data.app_name,
        appDescription: data.app_description,
        appCategory: data.app_category,
        targetAudience: data.suggested_audience,
        brandStyle: data.suggested_style,
        colorTheme: data.suggested_color,
        colorMode: 'solid' // Ensure solid mode for single hex color
      });

      // Handle screenshots: Fetch them as File objects and populate the uploader
      if (data.screenshots && data.screenshots.length > 0) {
        const screenshotFiles = await Promise.all(
          data.screenshots.map(async (path, index) => {
            return await fetchImageFile(path, `scraped_${index}.png`);
          })
        );
        setScreenshots(screenshotFiles.filter(file => file !== null));
      }
    } catch (err) {
      console.error(err);
      setScapeError(err.response?.data?.detail || "Failed to fetch app details. Check the URL or connection.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsGenerating(true);
    setGenError(null);
    setOrientation(formData.orientation);
    
    try {
      const response = await generateAssets({
        ...formData,
        screenshots,
      });

      // Navigate to results page passing the assets and original formData
      navigate('/results', {
        state: {
          assets: response.assets,
          sessionId: response.session_id,
          appDetails: formData,
        }
      });
    } catch (err) {
      setGenError(err.response?.data?.detail || err.message || 'Failed to generate assets');
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setScrapedData(null);
    setUrl('');
    setScreenshots([]);
    setGenError(null);
  };


  return (
    <div className="page-enter min-h-[calc(100vh-65px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
            <Monitor className="w-4 h-4" />
            Rebrand Existing App
          </div>
          <h1 className="text-3xl font-bold text-textPrimary flex items-center justify-center gap-2">
            {scrapedData ? 'Configure Your Redesign' : 'Enter App Details'}
          </h1>
          <p className="text-sm text-textSecondary mt-2">
            {scrapedData 
              ? "Review the scraped details and adjust as needed to generate your new assets."
              : "Enter a Play Store URL to instantly scrape its identity and start redesigning its marketing visual stack."
            }
          </p>
        </div>

        {!scrapedData ? (
          /* ─── URL Input Phase ─── */
          <div className="animate-slide-up ">
            <div className="card-base p-8 shadow-2xl border-primary/5">
              <form onSubmit={handleScrape} className="space-y-6">
                <div>
                  <label htmlFor="playstore-url" className="block text-sm font-bold text-textPrimary mb-2 uppercase tracking-tight">
                    Play Store URL or Package ID
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className="w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      id="playstore-url"
                      type="text"
                      className="w-full bg-white border-2 border-primary/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none"
                      placeholder="e.g. https://play.google.com/store/apps/details?id=com.notion"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      disabled={isScraping}
                    />
                  </div>
                  <p className="mt-3 text-[11px] text-textSecondary flex items-center gap-1.5 opacity-80">
                    <Globe className="w-3 h-3" />
                    Supports both full browser URLs and standard package names (e.g. com.example.app)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isScraping || !url.trim()}
                  className="w-full btn-primary py-4 text-base font-bold shadow-[0_15px_30px_-10px_rgba(139,94,60,0.3)] disabled:opacity-50"
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Fetching App Context...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Scrape App Details
                    </>
                  )}
                </button>

                {scrapeError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium">{scrapeError}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Hint Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 opacity-60">
                <div className="p-4 rounded-xl border border-primary/10 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-accentGold" />
                    <span className="text-xs font-semibold text-textPrimary">Autofills features & audience</span>
                </div>
                <div className="p-4 rounded-xl border border-primary/10 flex items-center gap-3">
                    <Monitor className="w-5 h-5 text-accentTerracotta" />
                    <span className="text-xs font-semibold text-textPrimary">Seamless rebranding workflow</span>
                </div>
            </div>
          </div>
        ) : (
          /* ─── Configuration Phase ─── */
          <div className="animate-fade-in space-y-6">
            {/* Error Banner */}
            {genError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Generation Failed</p>
                  <p className="text-sm text-red-600 mt-0.5">{genError}</p>
                </div>
                <button onClick={() => setGenError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {isGenerating ? (
              <div className="card-base p-10 flex flex-col items-center justify-center min-h-[400px]">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-base font-medium text-textPrimary">
                    Generating rebranded assets...
                  </p>
                </div>
                <Loader count={2} orientation={orientation} />
              </div>
            ) : (
              <div className="card-base p-8 relative">
                <button 
                  onClick={handleReset} 
                  className="absolute top-6 right-6 p-2 hover:bg-backgroundSoft rounded-lg transition-colors text-textSecondary"
                  title="Start Over"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <AppForm
                  onSubmit={handleSubmit}
                  isLoading={isGenerating}
                  screenshots={screenshots}
                  setScreenshots={setScreenshots}
                  initialData={scrapedData}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
