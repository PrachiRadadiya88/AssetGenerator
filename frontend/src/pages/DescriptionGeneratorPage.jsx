import { useState } from 'react';
import { Sparkles, AlertCircle, X, Copy, Check, Info, FileText, Send } from 'lucide-react';
import { generatePlayStoreDescription } from '../services/api';
import FeatureInputList from '../components/FeatureInputList';
import { CATEGORIES, TARGET_AUDIENCES, LANGUAGES, BRAND_STYLES } from '../utils/constants';



export default function DescriptionGeneratorPage() {
  const [formData, setFormData] = useState({
    appName: '',
    appCategory: 'Productivity',
    targetAudience: '',
    brandStyle: '',
    features: [],
    appDescription: '',
    includeEmojis: true,
    language: 'English',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const [isOtherAudience, setIsOtherAudience] = useState(false);
  const [isOtherBrandStyle, setIsOtherBrandStyle] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.appName || formData.features.length < 1) {
      setError('Please provide at least an app name and one feature.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const data = await generatePlayStoreDescription(formData);
      setResult(data);
      // scroll to result
      setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate description');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-enter min-h-[calc(100vh-65px)] bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accentTerracotta/10 text-accentTerracotta text-sm font-medium mb-4 animate-fade-in">
            <FileText className="w-4 h-4" />
            Play Store Description Generator
          </div>
          <h1 className="text-4xl font-bold text-textPrimary tracking-tight">
            Craft Your <span className="gradient-text">App's Story</span>
          </h1>
          <p className="text-base text-textSecondary mt-3 max-w-2xl mx-auto">
            Generate high-converting, SEO-optimized Play Store descriptions that turn visitors into users.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3 animate-fade-in shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900">Oops! Something went wrong</p>
              <p className="text-sm text-red-700 mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Form Section */}
          <div className="card-base p-8 shadow-xl border-primary/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-textPrimary mb-2">App Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. FocusQuest, CleanEats"
                  value={formData.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-2">Category</label>
                  <select
                    className="input-field appearance-none"
                    value={formData.appCategory}
                    onChange={(e) => handleChange('appCategory', e.target.value)}
                    disabled={isGenerating}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-textPrimary mb-2">Language</label>
                  <select
                    className="input-field appearance-none"
                    value={formData.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    disabled={isGenerating}
                  >
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-textPrimary mb-2">Target Audience</label>
                <select
                  className="input-field appearance-none mb-2"
                  value={isOtherAudience ? 'Other' : formData.targetAudience}
                  onChange={(e) => {
                    if (e.target.value === 'Other') {
                      setIsOtherAudience(true);
                      handleChange('targetAudience', '');
                    } else {
                      setIsOtherAudience(false);
                      handleChange('targetAudience', e.target.value);
                    }
                  }}
                  disabled={isGenerating}
                >
                  <option value="">Select Audience...</option>
                  {TARGET_AUDIENCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  <option value="Other">Other...</option>
                </select>
                {isOtherAudience && (
                  <input
                    type="text"
                    className="input-field animate-fade-in"
                    placeholder="Specify audience..."
                    value={formData.targetAudience}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                    disabled={isGenerating}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-textPrimary mb-2">App Description</label>
                <textarea
                  className="input-field min-h-[100px] resize-y"
                  placeholder="Describe your app's core value, functionality, and unique selling points..."
                  value={formData.appDescription}
                  onChange={(e) => handleChange('appDescription', e.target.value)}
                  disabled={isGenerating}
                />
                <p className="text-[10px] text-textSecondary mt-1">This helps the AI understand the context and purpose of your app.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-textPrimary mb-2">Brand Style</label>
                <select
                    className="input-field appearance-none mb-2"
                    value={isOtherBrandStyle ? 'Other' : formData.brandStyle}
                    onChange={(e) => {
                        if (e.target.value === 'Other') {
                            setIsOtherBrandStyle(true);
                            handleChange('brandStyle', '');
                        } else {
                            setIsOtherBrandStyle(false);
                            handleChange('brandStyle', e.target.value);
                        }
                    }}
                    disabled={isGenerating}
                >
                    <option value="">Select Style...</option>
                    {BRAND_STYLES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    <option value="Other">Other...</option>
                </select>
                {isOtherBrandStyle && (
                    <input
                        type="text"
                        className="input-field animate-fade-in"
                        placeholder="Specify style..."
                        value={formData.brandStyle}
                        onChange={(e) => handleChange('brandStyle', e.target.value)}
                        disabled={isGenerating}
                    />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-textPrimary mb-2 flex items-center gap-2">
                    Key Features
                    <span className="text-[10px] font-normal text-textSecondary px-2 py-0.5 rounded-full bg-primary/5">Min 1</span>
                </label>
                <FeatureInputList
                    features={formData.features}
                    setFeatures={(feats) => handleChange('features', feats)}
                    minRequired={1}
                />
              </div>

              {/* Emoji Toggle */}
              <div className="pt-2">
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.includeEmojis 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-primary/10 bg-white hover:border-primary/20'
                }`}>
                    <div className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.includeEmojis}
                        onChange={(e) => handleChange('includeEmojis', e.target.checked)}
                        disabled={isGenerating}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <div className="flex-1 pl-1">
                    <div className="text-sm font-semibold text-textPrimary">Include Story Emojis</div>
                    <div className="text-[11px] text-textSecondary mt-0.5">Use emojis to make the description more engaging and visual.</div>
                    </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary w-full py-4 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Description
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Preview Section */}
          <div id="results-section" className="space-y-6 min-h-[500px]">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center p-10 bg-primary/5 rounded-3xl border-2 border-dashed border-primary/20">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                        <Wand2 className="w-8 h-8 text-primary animate-bounce" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-textPrimary">Writing with AssetGen...</h3>
                <p className="text-sm text-textSecondary text-center mt-2 max-w-[250px]">
                  Analyzing your app and crafting the perfect Play Store copy. This takes about 10-15 seconds.
                </p>
              </div>
            ) : result ? (
              <div className="animate-fade-in space-y-6">
                
                {/* Short Description Card */}
                <div className="card-base p-6 bg-white border-l-4 border-l-accentTerracotta">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded bg-accentTerracotta/10 text-accentTerracotta text-[10px] font-bold uppercase tracking-wider">Short Description</span>
                            <span className={`text-[10px] font-medium ${result.short_description.length > 80 ? 'text-red-500' : 'text-textSecondary'}`}>
                                {result.short_description.length}/80
                            </span>
                        </div>
                        <button 
                            onClick={() => handleCopy(result.short_description, 'short')}
                            className="p-2 hover:bg-backgroundSoft rounded-lg transition-colors text-textSecondary"
                            title="Copy to clipboard"
                        >
                            {copiedField === 'short' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-lg font-semibold text-textPrimary leading-relaxed italic">
                        "{result.short_description}"
                    </p>
                </div>

                {/* Long Description Card */}
                <div className="card-base p-6 bg-white relative">
                    <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-1">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">Full Listing Description</span>
                        <button 
                            onClick={() => handleCopy(result.full_description, 'full')}
                            className="p-2 hover:bg-backgroundSoft rounded-lg transition-colors text-textSecondary"
                            title="Copy Full Description"
                        >
                            {copiedField === 'full' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <div className="prose prose-sm max-w-none prose-p:text-textSecondary prose-headings:text-textPrimary prose-strong:text-textPrimary whitespace-pre-line text-sm leading-relaxed max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
                        {result.full_description}
                    </div>
                    <div className="mt-4 pt-4 border-t border-primary/5 bg-accentGreen/5 rounded-b-xl -mx-6 -mb-6 p-4 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-accentGreen flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-accentGreen/80">
                            This description is formatted with markdown and emojis for maximum engagement on the Play Store app listing.
                        </p>
                    </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 bg-backgroundSoft/50 rounded-3xl border-2 border-dashed border-primary/10 opacity-60">
                <Send className="w-10 h-10 text-textSecondary mb-4" />
                <p className="text-sm font-medium text-textSecondary text-center">
                  Fill the form to see your <br /> AssetGen description here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Small Wand icon for the empty state
function Wand2(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72Z" />
            <path d="m14 7 3 3" />
            <path d="M5 6v4" />
            <path d="M19 14v4" />
            <path d="M10 2v2" />
            <path d="M7 8H3" />
            <path d="M21 16h-4" />
            <path d="M11 3H9" />
        </svg>
    )
}
