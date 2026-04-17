import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertCircle, X } from 'lucide-react';
import { generateAssets } from '../services/api';
import AppForm from '../components/AppForm';
import ScreenshotUploader from '../components/ScreenshotUploader';
import Loader from '../components/Loader';

export default function InputPage() {
  const navigate = useNavigate();
  const [screenshots, setScreenshots] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [orientation, setOrientation] = useState('portrait');

  const handleSubmit = async (formData) => {
    setIsGenerating(true);
    setError(null);
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
      setError(err.response?.data?.detail || err.message || 'Failed to generate assets');
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-enter min-h-[calc(100vh-65px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Asset Generation
          </div>
          <h1 className="text-3xl font-bold text-textPrimary flex items-center justify-center gap-2">
            Configure Your Assets
          </h1>
          <p className="text-sm text-textSecondary mt-2">
            Fill in your app details and strictly define features to generate tailored Play Store screenshots.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Generation Failed</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isGenerating ? (
          <div className="card-base p-10 flex flex-col items-center justify-center min-h-[400px]">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-base font-medium text-textPrimary">
                  Generating initial layout...
                </p>
              </div>
              <Loader count={2} orientation={orientation} />
          </div>
        ) : (
          <div className="card-base p-8">
            <AppForm
              onSubmit={handleSubmit}
              isLoading={isGenerating}
              screenshots={screenshots}
              setScreenshots={setScreenshots}
            />
          </div>
        )}
      </div>
    </div>
  );
}
