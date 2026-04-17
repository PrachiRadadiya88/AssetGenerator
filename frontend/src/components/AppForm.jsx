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

const CATEGORIES = [
  'Social', 'Productivity', 'Entertainment', 'Education',
  'Health & Fitness', 'Finance', 'Shopping', 'Travel',
  'Food & Drink', 'Music & Audio', 'Photography', 'Communication',
  'Business', 'News', 'Weather', 'Tools', 'Lifestyle',
  'Games', 'Sports', 'Medical',
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

export default function AppForm({ onSubmit, isLoading, screenshots, setScreenshots }) {
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
      orientation: 'portrait',
      targetOs: 'iOS',
      numAssets: 4,
      features: [],
      includeSubtext: false,
    };

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

  const [isGeneratingFeatures, setIsGeneratingFeatures] = useState(false);

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
    const submitData = { ...formData };
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
      });
      if (result.features && result.features.length > 0) {
        setFormData(prev => ({
          ...prev,
          features: result.features.map(f => typeof f === 'string' ? f : f.toString())
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
          <FieldHint>Your app's name as it appears on the Play Store.</FieldHint>
          {errors.appName && <p className="mt-1 text-xs text-red-500">{errors.appName}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="app-category" className="block text-sm font-semibold text-textPrimary mb-1">
            Category
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
          <FieldHint>Select the Play Store category that best fits your app.</FieldHint>
        </div>

        {/* --- App Description & Feature Generator --- */}
        <div className="mt-6 pt-4 border-t border-primary/5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="app-description" className="text-sm font-semibold text-textPrimary flex items-center gap-2">
              App Description
            </label>
            <button
              type="button"
              onClick={handleGenerateFeatures}
              disabled={isGeneratingFeatures || isLoading}
              className="px-3 py-1.5 bg-accentTerracotta/10 hover:bg-accentTerracotta/20 text-accentTerracotta rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingFeatures ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Extract AI Features
            </button>
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
      </div>

      <div className="border-t border-primary/8" />

      {/* ──────────────── SECTION 2: Target & Style ──────────────── */}
      <div className="py-5">
        <SectionHeader step="2" title="Audience & Style" subtitle="Helps AI tailor the design tone and messaging" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Audience */}
          <div>
            <label htmlFor="target-audience" className="block text-sm font-semibold text-textPrimary mb-1">
              Target Audience <span className="text-accentTerracotta">*</span>
            </label>
            <input
              id="target-audience"
              type="text"
              className={`input-field ${errors.targetAudience ? 'border-red-400 focus:ring-red-200' : ''}`}
              placeholder="e.g. Young professionals, students"
              value={formData.targetAudience}
              onChange={(e) => handleChange('targetAudience', e.target.value)}
              disabled={isLoading}
            />
            <FieldHint>Who is your app for? Be specific — age, role, interest.</FieldHint>
            {errors.targetAudience && <p className="mt-1 text-xs text-red-500">{errors.targetAudience}</p>}
          </div>

          {/* Brand Style */}
          <div>
            <label htmlFor="brand-style" className="block text-sm font-semibold text-textPrimary mb-1">
              Brand Style <span className="text-accentTerracotta">*</span>
            </label>
            <input
              id="brand-style"
              type="text"
              className={`input-field ${errors.brandStyle ? 'border-red-400 focus:ring-red-200' : ''}`}
              placeholder="e.g. Modern & minimal, Bold & vibrant"
              value={formData.brandStyle}
              onChange={(e) => handleChange('brandStyle', e.target.value)}
              disabled={isLoading}
            />
            <FieldHint>Describe the visual feel — e.g. playful, corporate, premium, neon, clean.</FieldHint>
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
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 capitalize ${
                  formData.colorMode === mode
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

        {/* --- Include Subtext Toggle --- */}
        <div className="mb-6">
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

        {/* --- Target OS --- */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-textPrimary mb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" /> Target Platform
          </label>
          <div className="flex gap-2">
            {['iOS', 'Android'].map((os) => (
              <button
                key={os}
                type="button"
                onClick={() => handleChange('targetOs', os)}
                disabled={isLoading}
                className={`flex-1 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                  formData.targetOs === os
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-primary/10 bg-white text-textSecondary hover:border-primary/20'
                }`}
              >
                {os === 'iOS' ? 'iPhone (iOS)' : 'Samsung / Pixel (Android)'}
              </button>
            ))}
          </div>
          <FieldHint>The AI will use {formData.targetOs === 'iOS' ? 'iPhone' : 'Android'} mockups for your screenshots.</FieldHint>
        </div>

        {/* Orientation */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-textPrimary mb-1.5">
            Asset Orientation
          </label>
          <div className="flex flex-col xl:flex-row gap-2.5">
            {[
              { value: 'portrait', label: 'Portrait', size: '1080×1920', desc: 'Standard screenshot' },
              { value: 'landscape', label: 'Landscape', size: '1920×1080', desc: 'Feature graphic' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('orientation', opt.value)}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  formData.orientation === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-primary/10 bg-white text-textSecondary hover:border-primary/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded border-2 flex-shrink-0 ${
                      formData.orientation === opt.value ? 'border-primary' : 'border-textSecondary/30'
                    }`}
                    style={{
                      width: opt.value === 'portrait' ? 14 : 22,
                      height: opt.value === 'portrait' ? 22 : 14,
                    }}
                  />
                  <div>
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-[11px] opacity-60">{opt.size} · {opt.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Number of Screenshots */}
        <div>
          <label className="block text-sm font-semibold text-textPrimary mb-1.5">
            Number of Screenshots
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleChange('numAssets', n)}
                disabled={isLoading}
                className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all duration-200 ${
                  formData.numAssets === n
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-primary/10 bg-white text-textSecondary hover:border-primary/30'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <FieldHint>How many screenshot assets to generate. Each one highlights a different feature.</FieldHint>
        </div>
      </div>

      <div className="border-t border-primary/8" />

      {/* ──────────────── SECTION 4: Features ──────────────── */}
      <div className="pt-5 pb-2">
        <SectionHeader
          step="4"
          title="App Features"
          subtitle="Each feature becomes one screenshot asset. Add at least 2."
        />

        {/* Tip Box */}
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
      </div>

      <div className="border-t border-primary/8" />

      {/* ──────────────── SECTION 5: Screenshots ──────────────── */}
      <div className="pt-5 pb-2">
        <SectionHeader
          step="5"
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
              Generating {formData.numAssets} Assets...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate {formData.numAssets} Assets
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
