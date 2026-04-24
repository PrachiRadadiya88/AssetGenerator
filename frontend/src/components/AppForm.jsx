/**
 * AppForm.jsx — Collects app details for Play Store asset generation.
 * Clean, guided UX with helper text and visual grouping.
 */

import { useState, useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';
import { Wand2, Info, Sparkles, Loader2, Smartphone } from 'lucide-react';
import FeatureInputList from './FeatureInputList';
import ScreenshotUploader from './ScreenshotUploader';
import { generateFeaturesList } from '../services/api';
import { CATEGORIES, TARGET_AUDIENCES, LANGUAGES, BRAND_STYLES } from '../utils/constants';



const PORTRAIT_SIZES = [
  { label: '1080 × 1920 (Standard Vertical)', value: '1080x1920' },
  { label: '1440 × 2560 (QHD Vertical)', value: '1440x2560' },
  { label: '1242 × 2688 (iPhone Max / 6.5")', value: '1242x2688' },
  { label: '1242 × 2208 (iPhone Plus / 5.5")', value: '1242x2208' },
];

const LANDSCAPE_SIZES = [
  { label: '1920 × 1080 (Standard Desktop)', value: '1920x1080' },
  { label: '2560 × 1440 (QHD Desktop)', value: '2560x1440' },
  { label: '1024 × 768 (Tablet Landscape)', value: '1024x768' },
];

const SQUARE_SIZES = [
  { label: '1080 × 1080 (High Res Square)', value: '1080x1080' },
  { label: '512 × 512 (Standard Icon)', value: '512x512' },
  { label: '384 × 384 (Wear OS)', value: '384x384' },
];

function FieldHint({ children }) {
  return <p className="mt-1 text-[11px] text-textSecondary leading-relaxed">{children}</p>;
}

function SectionHeader({ step, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {step}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
        {subtitle && <p className="text-[11px] text-textSecondary mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function SizeSelector({ label, selectedSize, options, onChange, isLoading }) {
  const [isOther, setIsOther] = useState(() => {
    return selectedSize && !options.some(opt => opt.value === selectedSize);
  });
  
  const [customWidth, setCustomWidth] = useState(() => {
    if (isOther && selectedSize.includes('x')) return selectedSize.split('x')[0];
    return '';
  });
  
  const [customHeight, setCustomHeight] = useState(() => {
    if (isOther && selectedSize.includes('x')) return selectedSize.split('x')[1];
    return '';
  });

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'Other') {
      setIsOther(true);
      // Don't call onChange yet, wait for width/height
    } else {
      setIsOther(false);
      onChange(val);
    }
  };

  const handleCustomChange = (w, h) => {
    setCustomWidth(w);
    setCustomHeight(h);
    if (w && h) {
      onChange(`${w}x${h}`);
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-primary/5 text-left">
      <label className="ml-0 block text-[10px] font-bold text-textSecondary uppercase mb-1.5 leading-none">{label}</label>
      <select
        value={isOther ? 'Other' : selectedSize}
        onChange={handleSelectChange}
        disabled={isLoading}
        className="w-full bg-white border border-primary/10 rounded-lg px-3 py-2 text-xs font-semibold text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/20 mb-2"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
        <option value="Other">Other (Custom...)</option>
      </select>

      {isOther && (
        <div className="flex items-center gap-2 animate-fade-in">
          <input
            type="number"
            placeholder="W"
            value={customWidth}
            onChange={(e) => handleCustomChange(e.target.value, customHeight)}
            className="w-full bg-white border border-primary/10 rounded-lg px-2 py-1.5 text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
          <span className="text-[10px] text-textSecondary font-bold">×</span>
          <input
            type="number"
            placeholder="H"
            value={customHeight}
            onChange={(e) => handleCustomChange(customWidth, e.target.value)}
            className="w-full bg-white border border-primary/10 rounded-lg px-2 py-1.5 text-xs text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}

export default function AppForm({ onSubmit, isLoading, screenshots, setScreenshots, initialData }) {
  const navType = useNavigationType();
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      appName: '',
      appDescription: '',
      targetAudience: '',
      brandStyle: '',
      appCategory: 'Productivity',
      colorTheme: '#8B5E3C',
      colorMode: 'solid',
      colorEnd: '#D4A574',
      targetOs: 'iOS',
      numPortrait: 4,
      numLandscape: 0,
      numSquare: 0,
      includeBanner: true,
      features: [],
      includeSubtext: false,
      useRawFeatures: false,
      includeEmojis: true,
      genPortrait: true,
      genLandscape: false,
      genSquare: false,
      portraitSize: '1080x1920',
      landscapeSize: '1920x1080',
      squareSize: '1080x1080',
      consistentBackground: true,
      language: 'English',
      userVision: '',
    };

    if (initialData) {
      return { ...defaultData, ...initialData };
    }

    const navEntries = window.performance.getEntriesByType('navigation');
    const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';
    const shouldRestore = navType === 'POP' && !isReload;

    if (shouldRestore) {
      const saved = sessionStorage.getItem('ps_gen_form_data');
      if (saved) {
        try { return JSON.parse(saved); }
        catch (e) { console.error("Failed to parse saved form data", e); }
      }
    } else {
      sessionStorage.removeItem('ps_gen_form_data');
    }

    return defaultData;
  });

  // If initialData is provided later, update form
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const [isGeneratingFeatures, setIsGeneratingFeatures] = useState(false);

  // Track if "Other" is selected in dropdowns (even if text is empty)
  const [isOtherAudience, setIsOtherAudience] = useState(() => 
    formData.targetAudience !== '' && !TARGET_AUDIENCES.includes(formData.targetAudience)
  );
  const [isOtherBrandStyle, setIsOtherBrandStyle] = useState(() => 
    formData.brandStyle !== '' && !BRAND_STYLES.includes(formData.brandStyle)
  );

  useEffect(() => {
    sessionStorage.setItem('ps_gen_form_data', JSON.stringify(formData));
  }, [formData]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.appName.trim()) newErrors.appName = 'App name is required';
    if (!formData.targetAudience.trim()) newErrors.targetAudience = 'Tell us who your app is for';
    if (!formData.brandStyle.trim()) newErrors.brandStyle = 'Describe your visual tone';
    if (formData.features.length < 2) newErrors.features = 'Add at least 2 features to generate assets';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const submitData = { 
      ...formData,
      numPortrait: formData.genPortrait ? formData.numPortrait : 0,
      numLandscape: formData.genLandscape ? formData.numLandscape : 0,
      numSquare: formData.genSquare ? formData.numSquare : 0,
      screenshots: screenshots.map(s => s.file),
    };

    if (formData.colorMode === 'gradient') {
      submitData.colorTheme = `gradient from ${formData.colorTheme} to ${formData.colorEnd}`;
    }
    
    onSubmit(submitData);
  };

  const handleGenerateFeatures = async () => {
    if (!formData.appDescription) {
      setErrors(prev => ({ ...prev, appDescription: 'Please enter an app description first' }));
      return;
    }
    setIsGeneratingFeatures(true);
    try {
      const result = await generateFeaturesList({
        appName: formData.appName || 'My App',
        appCategory: formData.appCategory,
        targetAudience: formData.targetAudience,
        brandStyle: formData.brandStyle,
        appDescription: formData.appDescription,
        language: formData.language,
      });
      if (result && result.length > 0) {
        setFormData(prev => ({
          ...prev,
          features: result.map(f => typeof f === 'string' ? f : f.toString())
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to generate features. Make sure the backend is running.");
    } finally {
      setIsGeneratingFeatures(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0" id="asset-form">

      {/* ──────────────── SECTION 1: App Identity ──────────────── */}
      <div className="pb-5">
        <SectionHeader step="1" title="App Identity" subtitle="Basic info about your application" />

        {/* App Name */}
        <div className="mb-4">
          <label htmlFor="app-name" className="block text-sm font-semibold text-textPrimary mb-1">
            App Name <span className="text-accentTerracotta">*</span>
          </label>
          <input
            id="app-name"
            type="text"
            className={`input-field ${errors.appName ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="e.g. Zedge, Swiggy, Notion"
            value={formData.appName}
            onChange={(e) => handleChange('appName', e.target.value)}
            disabled={isLoading}
          />
          <FieldHint>The name that will appear on your screenshots.</FieldHint>
          {errors.appName && <p className="mt-1 text-xs text-red-500">{errors.appName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* App Category */}
          <div>
            <label htmlFor="app-category" className="block text-sm font-semibold text-textPrimary mb-1">
              App Category <span className="text-accentTerracotta">*</span>
            </label>
            <select
              id="app-category"
              className="input-field appearance-none cursor-pointer"
              value={formData.appCategory}
              onChange={(e) => handleChange('appCategory', e.target.value)}
              disabled={isLoading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Language Selection */}
          <div>
            <label htmlFor="language" className="block text-sm font-semibold text-textPrimary mb-1">
              Output Language <span className="text-accentTerracotta">*</span>
            </label>
            <select
              id="language"
              className="input-field appearance-none cursor-pointer"
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
              disabled={isLoading}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- App Description & Feature Generator --- */}
        <div className="mt-6 pt-4 border-t border-primary/5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="app-description" className="text-sm font-semibold text-textPrimary flex items-center gap-2">
              App Description
            </label>
          </div>
          <textarea
            id="app-description"
            rows="3"
            value={formData.appDescription}
            onChange={(e) => handleChange('appDescription', e.target.value)}
            disabled={isLoading || isGeneratingFeatures}
            className={`input-field resize-y min-h-[90px] ${errors.appDescription ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="Tell us what your app does, its core value proposition, and why users love it..."
          />
          <FieldHint>The AI will analyze your description to automatically fill the Features list below.</FieldHint>
        </div>

        {/* --- User Vision (Optional) --- */}
        <div className="mt-6 pt-4 border-t border-primary/5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="user-vision" className="text-sm font-semibold text-textPrimary flex items-center gap-2">
              User Vision (Optional)
            </label>
          </div>
          <textarea
            id="user-vision"
            rows="3"
            value={formData.userVision}
            onChange={(e) => handleChange('userVision', e.target.value)}
            disabled={isLoading}
            className={`input-field resize-y min-h-[90px]`}
            placeholder="Describe your creative vision, specific styles, or concepts you want the AI to incorporate into the assets..."
          />
          <FieldHint>Additional context, constraints, or creative direction to guide the asset generation.</FieldHint>
        </div>

        {/* --- Features --- */}
        <div className="mt-8 pt-6 border-t border-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3" />
              </div>
              <h3 className="text-sm font-semibold text-textPrimary">App Features</h3>
            </div>
            <button
              type="button"
              onClick={handleGenerateFeatures}
              disabled={isGeneratingFeatures || isLoading}
              className="px-3 py-1.5 bg-accentTerracotta/10 hover:bg-accentTerracotta/20 text-accentTerracotta rounded-lg text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingFeatures ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Extract Features from Description
            </button>
          </div>

          <div className="mb-4 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-700 leading-relaxed">
              <strong>Tip:</strong> Write features as short phrases describing what the user can do.
              <br />
              Examples: <em>"Track daily calories"</em>, <em>"Chat with AI assistant"</em>, <em>"Browse trending wallpapers"</em>
            </div>
          </div>

          <FeatureInputList
            features={formData.features}
            setFeatures={(features) => handleChange('features', features)}
          />
          {errors.features && <p className="mt-1.5 text-xs text-red-500">{errors.features}</p>}

          {/* --- AI Headlines Toggle --- */}
          <div className="mt-6 pt-4 border-t border-primary/5">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-primary/10 bg-white hover:border-primary/20 cursor-pointer transition-all">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-primary/20 text-primary focus:ring-primary/20 cursor-pointer"
                checked={!formData.useRawFeatures}
                onChange={(e) => handleChange('useRawFeatures', !e.target.checked)}
                disabled={isLoading}
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-textPrimary">AI-Enhanced Headlines</div>
                <div className="text-[11px] text-textSecondary mt-0.5">When enabled, AssetGen will transform your features into punchy marketing headlines.</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-primary/8" />

      {/* ──────────────── SECTION 2: Target & Style ──────────────── */}
      <div className="py-5">
        <SectionHeader step="2" title="Audience & Style" subtitle="Helps AI tailor the design tone and messaging" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Audience */}
          <div>
            <label htmlFor="target-audience" className="block text-sm font-semibold text-textPrimary mb-1">
              Target Audience {formData.targetAudience === ' ' ? '' : <span className="text-accentTerracotta">*</span>}
            </label>
            <select
              id="target-audience-select"
              className="input-field appearance-none cursor-pointer mb-2"
              value={isOtherAudience ? 'Other' : (formData.targetAudience || '')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'Other') {
                  setIsOtherAudience(true);
                  handleChange('targetAudience', '');
                } else {
                  setIsOtherAudience(false);
                  handleChange('targetAudience', val);
                }
              }}
              disabled={isLoading}
            >
              <option value="" disabled>Select target audience...</option>
              {TARGET_AUDIENCES.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              <option value="Other">Other (Custom...)</option>
            </select>

            {isOtherAudience && (
              <input
                id="target-audience-custom"
                type="text"
                className={`input-field animate-fade-in ${errors.targetAudience ? 'border-red-400 focus:ring-red-200' : ''}`}
                placeholder="Describe your audience (e.g. Pet owners, Yoga fans)"
                value={formData.targetAudience}
                onChange={(e) => handleChange('targetAudience', e.target.value)}
                autoFocus
                disabled={isLoading}
              />
            )}
            <FieldHint>Who is your app for? Be specific — age, role, interest.</FieldHint>
            {errors.targetAudience && <p className="mt-1 text-xs text-red-500">{errors.targetAudience}</p>}
          </div>

          {/* Brand Style */}
          <div>
            <label htmlFor="brand-style" className="block text-sm font-semibold text-textPrimary mb-1">
              Brand Style {formData.brandStyle === ' ' ? '' : <span className="text-accentTerracotta">*</span>}
            </label>
            <select
              id="brand-style-select"
              className="input-field appearance-none cursor-pointer mb-2"
              value={isOtherBrandStyle ? 'Other' : (formData.brandStyle || '')}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'Other') {
                  setIsOtherBrandStyle(true);
                  handleChange('brandStyle', '');
                } else {
                  setIsOtherBrandStyle(false);
                  handleChange('brandStyle', val);
                }
              }}
              disabled={isLoading}
            >
              <option value="" disabled>Select brand style...</option>
              {BRAND_STYLES.map((style) => (
                <option key={style} value={style}>{style}</option>
              ))}
              <option value="Other">Other (Custom...)</option>
            </select>

            {isOtherBrandStyle && (
              <input
                id="brand-style-custom"
                type="text"
                className={`input-field animate-fade-in ${errors.brandStyle ? 'border-red-400 focus:ring-red-200' : ''}`}
                placeholder="Describe visuals (e.g. Cyberpunk, Pastel, Grid-based)"
                value={formData.brandStyle}
                onChange={(e) => handleChange('brandStyle', e.target.value)}
                autoFocus
                disabled={isLoading}
              />
            )}
            <FieldHint>Describe the visual feel — e.g. playful, corporate, premium.</FieldHint>
            {errors.brandStyle && <p className="mt-1 text-xs text-red-500">{errors.brandStyle}</p>}
          </div>
        </div>
      </div>

      <div className="border-t border-primary/8" />

      {/* ──────────────── SECTION 3: Visual Config ──────────────── */}
      <div className="py-5">
        <SectionHeader step="3" title="Visual Settings" subtitle="Colors, orientation, and asset count" />

        {/* Color Theme */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-textPrimary mb-1.5">
            Color Theme
          </label>

          {/* Solid / Gradient Toggle */}
          <div className="flex items-center gap-1 mb-2.5 bg-primary/5 rounded-lg p-1 w-fit">
            {['solid', 'gradient'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleChange('colorMode', mode)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 capitalize ${formData.colorMode === mode
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-textSecondary hover:text-textPrimary'
                  }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Color Pickers */}
          <div className="flex items-center gap-3">
            {/* Preview Swatch */}
            <div
              className="w-10 h-10 rounded-lg border border-primary/15 flex-shrink-0 shadow-sm"
              style={{
                background: formData.colorMode === 'gradient'
                  ? `linear-gradient(135deg, ${formData.colorTheme}, ${formData.colorEnd})`
                  : formData.colorTheme,
              }}
            />
            {/* Primary Color */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                id="color-theme"
                type="color"
                className="w-8 h-8 rounded-md border border-primary/15 cursor-pointer p-0.5 flex-shrink-0"
                value={formData.colorTheme}
                onChange={(e) => handleChange('colorTheme', e.target.value)}
                disabled={isLoading}
              />
              <input
                type="text"
                className="input-field font-mono text-xs min-w-0 flex-1"
                value={formData.colorTheme}
                onChange={(e) => handleChange('colorTheme', e.target.value)}
                disabled={isLoading}
                maxLength={7}
                placeholder="#8B5E3C"
              />
            </div>
            {/* Second Color (gradient only) */}
            {formData.colorMode === 'gradient' && (
              <div className="flex items-center gap-2 flex-1 min-w-0 animate-fade-in">
                <span className="text-textSecondary text-xs font-medium">→</span>
                <input
                  type="color"
                  className="w-8 h-8 rounded-md border border-primary/15 cursor-pointer p-0.5 flex-shrink-0"
                  value={formData.colorEnd}
                  onChange={(e) => handleChange('colorEnd', e.target.value)}
                  disabled={isLoading}
                />
                <input
                  type="text"
                  className="input-field font-mono text-xs min-w-0 flex-1"
                  value={formData.colorEnd}
                  onChange={(e) => handleChange('colorEnd', e.target.value)}
                  disabled={isLoading}
                  maxLength={7}
                  placeholder="#D4A574"
                />
              </div>
            )}
          </div>
          <FieldHint>
            {formData.colorMode === 'solid'
              ? 'Pick your app\'s primary brand color. Used for backgrounds, accents, and UI highlights.'
              : 'Choose start and end colors for a gradient background across your assets.'}
          </FieldHint>
        </div>

        {/* Target Device (OS) Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-textPrimary mb-1.5 leading-none">
            Target Device Mockup
          </label>
          <div className="flex items-center gap-1 bg-primary/5 rounded-lg p-1 w-full max-w-[200px]">
            {['iOS', 'Android'].map((os) => (
              <button
                key={os}
                type="button"
                onClick={() => handleChange('targetOs', os)}
                disabled={isLoading}
                className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                  formData.targetOs === os
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                {os}
              </button>
            ))}
          </div>
          <FieldHint>Choose the phone frame style for your screenshots.</FieldHint>
        </div>

        {/* --- Include Subtext Toggle --- */}
        <div className="mb-4">
          <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-primary/10 bg-white hover:border-primary/20 cursor-pointer transition-all">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-primary/20 text-primary focus:ring-primary/20 cursor-pointer"
              checked={formData.includeSubtext}
              onChange={(e) => handleChange('includeSubtext', e.target.checked)}
              disabled={isLoading}
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-textPrimary">Include Subtext</div>
              <div className="text-[11px] text-textSecondary mt-0.5">Adds a secondary benefit-focused text below the main headline.</div>
            </div>
          </label>
        </div>

        {/* --- Emojis Toggle --- */}
        <div className="mb-4">
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
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
            <div className="flex-1 pl-1">
              <div className="text-sm font-semibold text-textPrimary">Include Visual Emojis</div>
              <div className="text-[11px] text-textSecondary mt-0.5">Scatters relevant 3D emojis around the design for visual depth.</div>
            </div>
          </label>
        </div>

        {/* --- Consistent Background Toggle --- */}
        <div className="mb-4">
          <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
            formData.consistentBackground 
              ? 'border-primary/50 bg-primary/5' 
              : 'border-primary/10 bg-white hover:border-primary/20'
          }`}>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.consistentBackground}
                onChange={(e) => handleChange('consistentBackground', e.target.checked)}
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
            <div className="flex-1 pl-1">
              <div className="text-sm font-semibold text-textPrimary">Consistent Background</div>
              <div className="text-[11px] text-textSecondary mt-0.5">Enforce the full color theme across all assets. Disable for layout variety.</div>
            </div>
          </label>
        </div>


        {/* --- Include Banner Toggle --- */}
        <div className="mb-6">
          <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
            formData.includeBanner 
              ? 'border-primary/50 bg-primary/5' 
              : 'border-primary/10 bg-white hover:border-primary/20'
          }`}>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.includeBanner}
                onChange={(e) => handleChange('includeBanner', e.target.checked)}
                disabled={isLoading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
            <div className="flex-1 pl-1">
              <div className="text-sm font-semibold text-textPrimary">Include Banner</div>
              <div className="text-[11px] text-textSecondary mt-0.5">Generate a dedicated 1024x500 landscape marketing banner.</div>
            </div>
          </label>
        </div>

        {/* Orientation & Counts Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-textPrimary">
            Screenshots Orientations
          </label>
          
          <div className="grid grid-cols-3 gap-2.5">
            {/* Portrait Box */}
            <button
              type="button"
              onClick={() => handleChange('genPortrait', !formData.genPortrait)}
              disabled={isLoading}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                formData.genPortrait 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-primary/10 bg-white text-textSecondary hover:border-primary/20'
              }`}
            >
              <div className={`w-5 h-8 rounded border-2 mb-2 ${formData.genPortrait ? 'border-primary' : 'border-textSecondary/30'}`} />
              <div className="font-semibold text-[10px] sm:text-xs">Portrait</div>
              <div className="text-[9px] opacity-60">1080×1920</div>
            </button>

            {/* Landscape Box */}
            <button
              type="button"
              onClick={() => {
                const newValue = !formData.genLandscape;
                handleChange('genLandscape', newValue);
                if (newValue && formData.numLandscape === 0) handleChange('numLandscape', 2);
              }}
              disabled={isLoading}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                formData.genLandscape 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-primary/10 bg-white text-textSecondary hover:border-primary/20'
              }`}
            >
              <div className={`w-8 h-5 rounded border-2 mb-2 ${formData.genLandscape ? 'border-primary' : 'border-textSecondary/30'}`} />
              <div className="font-semibold text-[10px] sm:text-xs">Landscape</div>
              <div className="text-[9px] opacity-60">1920×1080</div>
            </button>

            {/* Square Box */}
            <button
              type="button"
              onClick={() => {
                const newValue = !formData.genSquare;
                handleChange('genSquare', newValue);
                if (newValue && formData.numSquare === 0) handleChange('numSquare', 2);
              }}
              disabled={isLoading}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                formData.genSquare 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-primary/10 bg-white text-textSecondary hover:border-primary/20'
              }`}
            >
              <div className={`w-6 h-6 rounded border-2 mb-2 ${formData.genSquare ? 'border-primary' : 'border-textSecondary/30'}`} />
              <div className="font-semibold text-[10px] sm:text-xs">Square</div>
              <div className="text-[9px] opacity-60">1080×1080</div>
            </button>
          </div>

          {/* Conditional Portrait Picker */}
          {formData.genPortrait && (
            <div className="animate-fade-in p-4 rounded-xl bg-backgroundSoft/50 border border-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-textPrimary uppercase">Number of Portrait Assets</span>
                <span className="text-[10px] text-primary font-medium">{formData.numPortrait} assets ({formData.portraitSize})</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleChange('numPortrait', n)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-lg border-2 font-bold text-[11px] transition-all duration-200 ${
                      formData.numPortrait === n
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-primary/10 bg-white text-textSecondary hover:border-primary/20'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <SizeSelector
                label="Portrait Dimensions"
                selectedSize={formData.portraitSize}
                options={PORTRAIT_SIZES}
                onChange={(val) => handleChange('portraitSize', val)}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Conditional Landscape Picker */}
          {formData.genLandscape && (
            <div className="animate-fade-in p-4 rounded-xl bg-backgroundSoft/50 border border-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-textPrimary uppercase">Number of Landscape Assets</span>
                <span className="text-[10px] text-primary font-medium">{formData.numLandscape} assets ({formData.landscapeSize})</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleChange('numLandscape', n)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-lg border-2 font-bold text-[11px] transition-all duration-200 ${
                      formData.numLandscape === n
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-primary/10 bg-white text-textSecondary hover:border-primary/20'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <SizeSelector
                label="Landscape Dimensions"
                selectedSize={formData.landscapeSize}
                options={LANDSCAPE_SIZES}
                onChange={(val) => handleChange('landscapeSize', val)}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Conditional Square Picker */}
          {formData.genSquare && (
            <div className="animate-fade-in p-4 rounded-xl bg-backgroundSoft/50 border border-primary/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-textPrimary uppercase">Number of Square Assets</span>
                <span className="text-[10px] text-primary font-medium">{formData.numSquare} assets ({formData.squareSize})</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleChange('numSquare', n)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-lg border-2 font-bold text-[11px] transition-all duration-200 ${
                      formData.numSquare === n
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-primary/10 bg-white text-textSecondary hover:border-primary/20'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <SizeSelector
                label="Square Dimensions"
                selectedSize={formData.squareSize}
                options={SQUARE_SIZES}
                onChange={(val) => handleChange('squareSize', val)}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-primary/8" />

      {/* ──────────────── SECTION 4: Screenshots ──────────────── */}
      <div className="pt-5 pb-2">
        <SectionHeader
          step="4"
          title="Upload Screenshots"
          subtitle="Optional: Provide real app screenshots to enhance AI generation."
        />
        <ScreenshotUploader
          files={screenshots}
          onChange={setScreenshots}
          disabled={isLoading}
        />
      </div>

      <div className="border-t border-primary/8" />

      {/* ──────────────── Submit ──────────────── */}
      <div className="pt-4">
        <button
          type="submit"
          className="btn-primary w-full text-base py-3.5"
          disabled={isLoading}
          id="generate-button"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Assets...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Assets
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-textSecondary mt-2.5">
          Takes ~30–90 seconds depending on the number of assets.
        </p>
      </div>
    </form>
  );
}
