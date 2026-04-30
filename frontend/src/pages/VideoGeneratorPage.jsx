/**
 * VideoGeneratorPage.jsx — Agentic Video Generation UI
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Video, Upload, Sparkles, Play, CheckCircle2, AlertCircle,
  Loader2, Film, Clapperboard, Eye, BookOpen, Zap, ArrowLeftRight,
  ChevronDown, ChevronUp, X, Image as ImageIcon,
  Target, Smile, PenTool, Layers, BarChart3, Drama, Gem, Repeat, Megaphone, Scale,
} from 'lucide-react';
import { generateVideo, getImageUrl, fetchImageAsBlob, generateFeaturesList, generateVideoVision } from '../services/api';
import {
  CATEGORIES,
  TARGET_AUDIENCES,
  LANGUAGES,
  BRAND_STYLES,
} from '../utils/constants';

const VIDEO_TYPES = [
  { key: 'problem_solution', label: 'Problem → Solution', icon: <Target className="w-6 h-6" />, description: 'Show a pain point, then reveal how the app solves it dramatically.', focus: 'pain, reveal, transformation', scenes: 4 },
  { key: 'walkthrough', label: 'App Demo / Walkthrough', icon: <Eye className="w-6 h-6" />, description: 'Clean screen-by-screen tour of the top 3 features.', focus: 'UI, gestures, features', scenes: 4 },
  { key: 'lifestyle', label: 'Lifestyle / Real-World', icon: <Smile className="w-6 h-6" />, description: 'Person uses the app naturally in a real-life setting. Soft-sell.', focus: 'emotion, aspiration', scenes: 3 },
  { key: 'explainer', label: 'Explainer Animation', icon: <PenTool className="w-6 h-6" />, description: 'Animated illustrations explain the problem, then transition to real UI.', focus: 'clarity, motion graphics', scenes: 3 },
  { key: 'feature_highlight', label: 'Feature Highlight', icon: <Zap className="w-6 h-6" />, description: 'Fast-paced, beat-synced cuts showcasing features rapidly.', focus: 'speed, bold captions', scenes: 3 },
  { key: 'before_after', label: 'Before vs After', icon: <ArrowLeftRight className="w-6 h-6" />, description: 'Split-screen: struggling without the app vs seamless with it.', focus: 'contrast, transformation', scenes: 3 },
  { key: 'social_proof', label: 'Social Proof', icon: <BarChart3 className="w-6 h-6" />, description: 'User testimonials, star ratings, and stats build trust.', focus: 'trust, credibility', scenes: 3 },
  { key: 'narrative', label: 'Story Narrative', icon: <Drama className="w-6 h-6" />, description: 'Cinematic mini-story: protagonist discovers the app, life transforms.', focus: 'storytelling, emotion', scenes: 3 },
  { key: 'minimalist', label: 'Minimalist Premium', icon: <Gem className="w-6 h-6" />, description: 'Elegant, slow-paced showcase on clean white background.', focus: 'elegance, simplicity', scenes: 3 },
  { key: 'loopable', label: 'Loopable Micro', icon: <Repeat className="w-6 h-6" />, description: 'Seamless 15s loop. No CTA, no logo. Pure motion.', focus: 'seamless loop', scenes: 2 },
  { key: 'hook_first', label: 'Hook-First Short', icon: <Megaphone className="w-6 h-6" />, description: 'Scroll-stopping hook, then proof and CTA. 3 hook variations.', focus: 'attention, urgency', scenes: 4 },
  { key: 'comparison', label: 'Comparison', icon: <Scale className="w-6 h-6" />, description: 'Tasteful side-by-side: generic "other apps" vs your app.', focus: 'differentiation', scenes: 3 },
];

const AGENTS = [
  { name: 'Studio Manager', emoji: '🎬', role: 'Creating Creative Brief' },
  { name: 'Director', emoji: '🎥', role: 'Setting Artistic Direction' },
  { name: 'Screenwriter', emoji: '✍️', role: 'Writing Storyboard' },
  { name: 'Visual Designer', emoji: '🎨', role: 'Designing Scene Visuals' },
  { name: 'Producer', emoji: '📋', role: 'Checking Compliance' },
  { name: 'Editor', emoji: '✂️', role: 'Assembling Final Spec' },
  { name: 'Music Composer', emoji: '🎵', role: 'Generating Background Music' },
];

export default function VideoGeneratorPage() {
  const [form, setForm] = useState({
    appName: '', appCategory: '', targetAudience: '', brandStyle: '',
    colorTheme: '#8B5E3C', colorMode: 'solid', colorEnd: '#D4A574',
    targetOs: 'Android', language: 'English',
    videoType: 'problem_solution', userDescription: '', appDescription: '', features: [''],
  });
  const [isGeneratingFeatures, setIsGeneratingFeatures] = useState(false);
  const [isGeneratingVision, setIsGeneratingVision] = useState(false);
  const [screenshots, setScreenshots] = useState([]);
  const [appLogo, setAppLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeAgent, setActiveAgent] = useState(-1);
  const [expandedSections, setExpandedSections] = useState({});
  const [isOtherAudience, setIsOtherAudience] = useState(false);
  const [isOtherBrandStyle, setIsOtherBrandStyle] = useState(false);
  const fileRef = useRef(null);
  const logoFileRef = useRef(null);
  const navigate = useNavigate();

  // Handle browser Back button: if results are shown, go back to form instead of leaving the page
  const goBackToForm = useCallback(() => {
    setResult(null);
    setActiveAgent(-1);
    setSceneBlobUrls({});
  }, []);

  useEffect(() => {
    if (result) {
      // Push a state so pressing Back goes to form, not away from the page
      window.history.pushState({ videoResult: true }, '');

      const handlePopState = (e) => {
        if (result) {
          goBackToForm();
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [result, goBackToForm]);

  const updateForm = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const updateFeature = (i, val) => {
    const f = [...form.features]; f[i] = val; updateForm('features', f);
  };
  const addFeature = () => updateForm('features', [...form.features, '']);
  const removeFeature = (i) => updateForm('features', form.features.filter((_, idx) => idx !== i));

  const handleScreenshots = (e) => {
    const files = Array.from(e.target.files);
    setScreenshots(prev => [...prev, ...files].slice(0, 8));
  };
  const removeScreenshot = (i) => setScreenshots(prev => prev.filter((_, idx) => idx !== i));

  const toggleSection = (key) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  const handleGenerate = async () => {
    if (!form.appName || !form.appCategory) {
      setError('App Name and Category are required.'); return;
    }
    setError(''); setLoading(true); setResult(null); setActiveAgent(0);

    // Simulate agent progress
    const agentTimer = setInterval(() => {
      setActiveAgent(prev => (prev < AGENTS.length - 1 ? prev + 1 : prev));
    }, 12000);

    try {
      // Build color_theme — if gradient mode, combine both colors
      let colorTheme = form.colorTheme;
      if (form.colorMode === 'gradient') {
        colorTheme = `gradient from ${form.colorTheme} to ${form.colorEnd}`;
      }

      const data = await generateVideo({
        appName: form.appName, appCategory: form.appCategory,
        targetAudience: form.targetAudience, brandStyle: form.brandStyle,
        colorTheme, targetOs: form.targetOs,
        features: form.features.filter(f => f.trim()),
        language: form.language, videoType: form.videoType,
        userDescription: form.userDescription, appDescription: form.appDescription,
        screenshots,
        logo: appLogo,
      });
      setResult(data);
      setActiveAgent(AGENTS.length);
    } catch (e) {
      setError(e.response?.data?.detail || 'Video generation failed. Please try again.');
    } finally {
      clearInterval(agentTimer); setLoading(false);
    }
  };

  const [sceneBlobUrls, setSceneBlobUrls] = useState({});
  const loadSceneImage = async (url, idx) => {
    if (sceneBlobUrls[idx]) return;
    const blob = await fetchImageAsBlob(url);
    if (blob) setSceneBlobUrls(p => ({ ...p, [idx]: blob }));
  };

  return (
    <div className="page-enter bg-backgroundMain min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Video className="w-4 h-4" /> Video Studio
          </div>
          <h1 className="text-4xl font-black text-textPrimary mb-3">
            AI <span className="gradient-text">Video</span> Generator
          </h1>
          <p className="text-textSecondary max-w-xl mx-auto">
            Generate Play Store ready promotional videos using our multi-agent AI studio. 
            Each agent collaborates to produce a cinematic storyboard with scene visuals.
          </p>
          <p className="text-xs text-textSecondary/60 mt-2">
            16:9 Landscape · 1920×1080 · 15–30 seconds · Play Store Compliant
          </p>
        </div>

        {!result ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* App Details */}
              <div className="card-base p-6">
                <h2 className="text-lg font-bold text-textPrimary mb-4">App Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-1">
                      App Name <span className="text-accentTerracotta">*</span>
                    </label>
                    <input className="input-field" placeholder="My Amazing App" value={form.appName} onChange={e => updateForm('appName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-1">
                      Category <span className="text-accentTerracotta">*</span>
                    </label>
                    <select 
                      className="input-field appearance-none cursor-pointer" 
                      value={form.appCategory} 
                      onChange={e => updateForm('appCategory', e.target.value)}
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-1">
                      Target Audience <span className="text-accentTerracotta">*</span>
                    </label>
                    <select 
                      className="input-field appearance-none cursor-pointer mb-2" 
                      value={isOtherAudience ? 'Other' : form.targetAudience} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setIsOtherAudience(true);
                          updateForm('targetAudience', '');
                        } else {
                          setIsOtherAudience(false);
                          updateForm('targetAudience', val);
                        }
                      }}
                    >
                      <option value="" disabled>Select target audience...</option>
                      {TARGET_AUDIENCES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      <option value="Other">Other (Custom...)</option>
                    </select>
                    {isOtherAudience && (
                      <input 
                        className="input-field animate-fade-in" 
                        placeholder="Describe your audience..." 
                        value={form.targetAudience} 
                        onChange={e => updateForm('targetAudience', e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-1">
                      Brand Style <span className="text-accentTerracotta">*</span>
                    </label>
                    <select 
                      className="input-field appearance-none cursor-pointer mb-2" 
                      value={isOtherBrandStyle ? 'Other' : form.brandStyle} 
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'Other') {
                          setIsOtherBrandStyle(true);
                          updateForm('brandStyle', '');
                        } else {
                          setIsOtherBrandStyle(false);
                          updateForm('brandStyle', val);
                        }
                      }}
                    >
                      <option value="" disabled>Select brand style...</option>
                      {BRAND_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                      <option value="Other">Other (Custom...)</option>
                    </select>
                    {isOtherBrandStyle && (
                      <input 
                        className="input-field animate-fade-in" 
                        placeholder="Describe visual style..." 
                        value={form.brandStyle} 
                        onChange={e => updateForm('brandStyle', e.target.value)}
                        autoFocus
                      />
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-textPrimary mb-1.5">Brand Color</label>
                    {/* Solid / Gradient Toggle */}
                    <div className="flex items-center gap-1 mb-2.5 bg-primary/5 rounded-lg p-1 w-fit">
                      {['solid', 'gradient'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => updateForm('colorMode', mode)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 capitalize ${form.colorMode === mode
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-textSecondary hover:text-textPrimary'
                            }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    {/* Color preview swatch + pickers */}
                    <div className="flex items-center gap-3">
                      {/* Preview Swatch */}
                      <div
                        className="w-10 h-10 rounded-lg border border-primary/15 flex-shrink-0 shadow-sm"
                        style={{
                          background: form.colorMode === 'gradient'
                            ? `linear-gradient(135deg, ${form.colorTheme}, ${form.colorEnd})`
                            : form.colorTheme,
                        }}
                      />
                      {/* Primary Color */}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <input
                          type="color"
                          className="w-8 h-8 rounded-md border border-primary/15 cursor-pointer p-0.5 flex-shrink-0"
                          value={form.colorTheme}
                          onChange={(e) => updateForm('colorTheme', e.target.value)}
                        />
                        <input
                          type="text"
                          className="input-field font-mono text-xs min-w-0 flex-1"
                          value={form.colorTheme}
                          onChange={(e) => updateForm('colorTheme', e.target.value)}
                          maxLength={7}
                          placeholder="#8B5E3C"
                        />
                      </div>
                      {/* Second Color (gradient only) */}
                      {form.colorMode === 'gradient' && (
                        <div className="flex items-center gap-2 flex-1 min-w-0 animate-fade-in">
                          <span className="text-textSecondary text-xs font-medium">→</span>
                          <input
                            type="color"
                            className="w-8 h-8 rounded-md border border-primary/15 cursor-pointer p-0.5 flex-shrink-0"
                            value={form.colorEnd}
                            onChange={(e) => updateForm('colorEnd', e.target.value)}
                          />
                          <input
                            type="text"
                            className="input-field font-mono text-xs min-w-0 flex-1"
                            value={form.colorEnd}
                            onChange={(e) => updateForm('colorEnd', e.target.value)}
                            maxLength={7}
                            placeholder="#D4A574"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-textSecondary mt-1.5">
                      {form.colorMode === 'solid'
                        ? "Pick your app's primary brand color. Used for backgrounds, accents, and UI highlights."
                        : 'Choose start and end colors for a gradient background across your assets.'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-1.5 leading-none">Target Device Mockup</label>
                    <div className="flex items-center gap-1 bg-primary/5 rounded-lg p-1 w-full max-w-[200px]">
                      {['iOS', 'Android'].map((os) => (
                        <button
                          key={os}
                          type="button"
                          onClick={() => updateForm('targetOs', os)}
                          className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                            form.targetOs === os
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-textSecondary hover:text-textPrimary'
                          }`}
                        >
                          {os}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-textPrimary mb-1.5">Language *</label>
                    <select 
                      className="input-field appearance-none cursor-pointer" 
                      value={form.language} 
                      onChange={e => updateForm('language', e.target.value)}
                    >
                      {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* App Description */}
              <div className="card-base p-6">
                <h2 className="text-lg font-bold text-textPrimary mb-2">App Description *</h2>
                <p className="text-sm text-textSecondary mb-3">Describe what your app does — this helps AI understand the actual features and scenarios to show in the video.</p>
                <textarea
                  className="input-field min-h-[120px] resize-y"
                  placeholder="e.g., A fitness tracking app that helps users log workouts, track calories, set daily goals, and view progress charts. Users can create custom exercise routines and get AI-powered workout suggestions..."
                  value={form.appDescription}
                  onChange={e => updateForm('appDescription', e.target.value)}
                />
              </div>

              {/* Features — Auto-extracted from description */}
              <div className="card-base p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-textPrimary">Key Features</h2>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!form.appDescription) { alert('Please enter an app description first'); return; }
                      setIsGeneratingFeatures(true);
                      try {
                        const result = await generateFeaturesList({
                          appName: form.appName || 'My App',
                          appCategory: form.appCategory,
                          targetAudience: form.targetAudience,
                          brandStyle: form.brandStyle,
                          appDescription: form.appDescription,
                          language: form.language,
                        });
                        if (result && result.length > 0) {
                          updateForm('features', result.map(f => typeof f === 'string' ? f : String(f)));
                        }
                      } catch (err) { console.error(err); alert('Failed to extract features.'); }
                      finally { setIsGeneratingFeatures(false); }
                    }}
                    disabled={isGeneratingFeatures || !form.appDescription}
                    className="btn-ghost text-sm text-primary flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isGeneratingFeatures ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting...</> : <><Sparkles className="w-3.5 h-3.5" /> AI Extract from Description</>}
                  </button>
                </div>
                <div className="space-y-2">
                  {form.features.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input className="input-field flex-1" placeholder={`Feature ${i + 1}`} value={f} onChange={e => updateFeature(i, e.target.value)} />
                      {form.features.length > 1 && (
                        <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600 p-2"><X className="w-4 h-4" /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={addFeature} className="btn-ghost text-sm text-primary">+ Add Feature</button>
                </div>
              </div>

              {/* Video Vision — Visual Scenario */}
              <div className="card-base p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-textPrimary mb-2">Video Vision <span className="text-xs font-normal text-textSecondary">(Optional)</span></h2>
                    <p className="text-sm text-textSecondary mb-3">Describe the visual scenario you want — how people use your app, the setting, mood, etc.</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!form.appDescription) { alert('Please enter an app description first'); return; }
                      setIsGeneratingVision(true);
                      try {
                        const result = await generateVideoVision({
                          appName: form.appName || 'My App',
                          appCategory: form.appCategory,
                          targetAudience: form.targetAudience,
                          appDescription: form.appDescription,
                          features: form.features.filter(f => f.trim()),
                          videoType: form.videoType,
                          language: form.language,
                        });
                        if (result) {
                          updateForm('userDescription', result);
                        }
                      } catch (err) { console.error(err); alert('Failed to generate video vision.'); }
                      finally { setIsGeneratingVision(false); }
                    }}
                    disabled={isGeneratingVision || !form.appDescription}
                    className="btn-ghost text-sm text-primary flex items-center gap-1.5 disabled:opacity-40"
                  >
                    {isGeneratingVision ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> AI Generate Vision</>}
                  </button>
                </div>
                <textarea
                  className="input-field min-h-[100px] resize-y"
                  placeholder="e.g., Show someone at a gym using the app to track their workout, then at home reviewing their progress charts on the couch..."
                  value={form.userDescription}
                  onChange={e => updateForm('userDescription', e.target.value)}
                />
              </div>

              {/* Screenshots */}
              <div className="card-base p-6">
                <h2 className="text-lg font-bold text-textPrimary mb-2">App Screenshots</h2>
                <p className="text-sm text-textSecondary mb-3">Upload screenshots to be used as visual references in video scenes.</p>
                <input type="file" ref={fileRef} multiple accept="image/*" onChange={handleScreenshots} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm mb-4">
                  <Upload className="w-4 h-4" /> Upload Screenshots
                </button>
                {screenshots.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {screenshots.map((f, i) => (
                      <div key={i} className="relative group">
                        <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 object-cover rounded-xl border border-primary/10" />
                        <button onClick={() => removeScreenshot(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* App Logo */}
              <div className="card-base p-6">
                <h2 className="text-lg font-bold text-textPrimary mb-2">App Logo</h2>
                <p className="text-sm text-textSecondary mb-3">Upload your app logo for a professional branding end-card.</p>
                <input type="file" ref={logoFileRef} accept="image/*" onChange={(e) => setAppLogo(e.target.files[0])} className="hidden" />
                <div className="flex items-center gap-4">
                  <button onClick={() => logoFileRef.current?.click()} className="btn-secondary text-sm">
                    <Upload className="w-4 h-4" /> {appLogo ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  {appLogo && (
                    <div className="flex items-center gap-2 bg-backgroundSoft px-3 py-1.5 rounded-xl border border-primary/10 animate-in fade-in zoom-in duration-300">
                      <img src={URL.createObjectURL(appLogo)} alt="Logo" className="w-8 h-8 object-contain" />
                      <span className="text-xs text-textSecondary max-w-[100px] truncate">{appLogo.name}</span>
                      <button onClick={() => setAppLogo(null)} className="text-red-400 hover:text-red-600 ml-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Video Type + Generate */}
            <div className="space-y-6">
              <div className="card-base p-6">
                <h2 className="text-lg font-bold text-textPrimary mb-4">Video Type</h2>
                <div className="grid grid-cols-2 gap-2">
                  {VIDEO_TYPES.map(vt => (
                    <button
                      key={vt.key}
                      onClick={() => updateForm('videoType', vt.key)}
                      className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                        form.videoType === vt.key
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-primary/10 hover:border-primary/30 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`flex-shrink-0 ${form.videoType === vt.key ? 'text-primary' : 'text-textSecondary'}`}>{vt.icon}</span>
                        <span className="font-semibold text-xs text-textPrimary leading-tight">{vt.label}</span>
                      </div>
                      <p className="text-[10px] text-textSecondary line-clamp-2 ml-8">{vt.description}</p>
                      <p className="text-[10px] text-primary/60 ml-8 mt-0.5">{vt.scenes} scenes</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Pipeline Preview */}
              <div className="card-base p-6">
                <h2 className="text-lg font-bold text-textPrimary mb-4">AI Agent Pipeline</h2>
                <div className="space-y-3">
                  {AGENTS.map((a, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      loading && activeAgent === i ? 'bg-primary/10 border border-primary/20' :
                      loading && activeAgent > i ? 'bg-green-50 border border-green-200' :
                      'bg-backgroundSoft border border-transparent'
                    }`}>
                      <span className="text-xl">{a.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-textPrimary">{a.name}</p>
                        <p className="text-xs text-textSecondary">{a.role}</p>
                      </div>
                      {loading && activeAgent === i && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                      {loading && activeAgent > i && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
                </div>
              )}

              <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full text-lg py-5">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Agents Working...</> : <><Clapperboard className="w-5 h-5" /> Generate Video</>}
              </button>
            </div>
          </div>
        ) : (
          /* ═══ RESULTS ═══ */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section: Final Video */}
            {result.final_video_url ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-textPrimary tracking-tight">
                      {result.creative_brief?.video_title || 'Video Production Complete'}
                    </h2>
                    <p className="text-textSecondary flex items-center gap-2 mt-1">
                      <Sparkles className="w-4 h-4 text-primary" /> {result.video_type_label} · {result.storyboard?.length || 0} Professional Scenes
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a 
                      href={getImageUrl(result.final_video_url)} 
                      download={`${form.appName.replace(/\s+/g, '_')}_promo.mp4`}
                      className="btn-primary px-8 py-3 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      <Upload className="w-5 h-5 rotate-180" /> Download Final Master
                    </a>
                    <button onClick={() => { window.history.back(); }} className="btn-secondary px-6">
                      New Production
                    </button>
                  </div>
                </div>

                {/* Final Master Preview */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative card-base p-2 bg-black border-white/5 rounded-[2rem] shadow-2xl overflow-hidden">
                    <div className="aspect-video bg-gray-950 flex items-center justify-center relative overflow-hidden rounded-[1.5rem]">
                      <video 
                        src={getImageUrl(result.final_video_url)} 
                        controls 
                        className="w-full h-full relative z-10"
                        autoPlay
                      />
                      {/* Ambient background glow */}
                      <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-textPrimary">
                    {result.creative_brief?.video_title || 'Video Generated'}
                  </h2>
                  <p className="text-textSecondary">{result.video_type_label} · {result.storyboard?.length || 0} scenes</p>
                </div>
                <button onClick={() => { window.history.back(); }} className="btn-secondary">
                  ← New Video
                </button>
              </div>
            )}

            {/* Agent Pipeline Status */}
            <div className="card-base p-6">
              <h3 className="font-bold text-textPrimary mb-4">Agent Pipeline Status</h3>
              <div className="flex flex-wrap gap-3">
                {(result.agent_steps || []).map((step, i) => (
                  <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                    step.status === 'done' ? 'bg-green-50 text-green-700 border border-green-200' :
                    step.status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                    'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    {step.status === 'done' ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.status === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : null}
                    {AGENTS[i]?.emoji} {step.agent_name}
                  </div>
                ))}
              </div>
            </div>

            {/* Creative Brief */}
            {result.creative_brief && (
              <div className="card-base p-6">
                <button onClick={() => toggleSection('brief')} className="w-full flex items-center justify-between">
                  <h3 className="font-bold text-textPrimary flex items-center gap-2">🎬 Creative Brief</h3>
                  {expandedSections.brief ? <ChevronUp className="w-5 h-5 text-textSecondary" /> : <ChevronDown className="w-5 h-5 text-textSecondary" />}
                </button>
                {expandedSections.brief && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(result.creative_brief).map(([k, v]) => (
                      <div key={k} className="p-3 bg-backgroundSoft rounded-xl">
                        <p className="text-xs text-textSecondary font-medium mb-1">{k.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-sm text-textPrimary">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Artistic Direction */}
            {result.artistic_direction && (
              <div className="card-base p-6">
                <button onClick={() => toggleSection('direction')} className="w-full flex items-center justify-between">
                  <h3 className="font-bold text-textPrimary flex items-center gap-2">🎥 Artistic Direction</h3>
                  {expandedSections.direction ? <ChevronUp className="w-5 h-5 text-textSecondary" /> : <ChevronDown className="w-5 h-5 text-textSecondary" />}
                </button>
                {expandedSections.direction && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(result.artistic_direction).map(([k, v]) => (
                      <div key={k} className="p-3 bg-backgroundSoft rounded-xl">
                        <p className="text-xs text-textSecondary font-medium mb-1">{k.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-sm text-textPrimary">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Storyboard + Scene Videos */}
            <div className="card-base p-6">
              <h3 className="font-bold text-textPrimary mb-4 flex items-center gap-2">✍️ Storyboard & Generated Clips</h3>
              <div className="space-y-6">
                {(result.storyboard || []).map((scene, i) => {
                  const videoUrl = result.generated_videos?.[i];
                  if (videoUrl && !sceneBlobUrls[i]) loadSceneImage(videoUrl, i);
                  return (
                    <div key={i} className="bg-backgroundSoft rounded-2xl p-5 border border-primary/5">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{scene.scene_number || i + 1}</span>
                        <div>
                          <h4 className="font-semibold text-textPrimary capitalize">{scene.scene_title || scene.scene_type || `Scene ${scene.scene_number || i + 1}`}</h4>
                          <p className="text-xs text-textSecondary">{scene.duration_seconds || 4}s</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-4">
                        {Object.entries(scene).map(([k, v]) => {
                          if (['scene_number', 'duration_seconds', 'use_screenshot_index', 'scene_title', 'scene_type', 'is_final_logo_frame', 'time_range'].includes(k)) return null;
                          if (typeof v !== 'string' && typeof v !== 'number') return null;
                          if (!v) return null;
                          
                          // highlight text overlays
                          if (k.includes('text') || k.includes('caption') || k.includes('quote')) {
                            return (
                              <div key={k} className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium mt-1 mb-1 mr-2">
                                {k.replace(/_/g, ' ')}: "{v}"
                              </div>
                            );
                          }

                          return (
                            <div key={k} className="text-sm">
                              <span className="font-semibold text-textSecondary capitalize">{k.replace(/_/g, ' ')}: </span>
                              <span className="text-textPrimary">{v}</span>
                            </div>
                          );
                        })}
                      </div>
                      {sceneBlobUrls[i] ? (
                        <div className="mt-3 rounded-xl overflow-hidden border border-primary/10 shadow-card bg-black aspect-video">
                          <video 
                            src={sceneBlobUrls[i]} 
                            controls 
                            className="w-full h-full"
                            poster={screenshots[scene.use_screenshot_index] ? URL.createObjectURL(screenshots[scene.use_screenshot_index]) : null}
                          />
                        </div>
                      ) : (
                        videoUrl && (
                          <div className="mt-3 aspect-video bg-black/5 rounded-xl flex items-center justify-center border border-dashed border-primary/20">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-6 h-6 text-primary animate-spin" />
                              <span className="text-xs text-textSecondary">Loading video...</span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compliance */}
            {result.compliance_report && (
              <div className="card-base p-6">
                <button onClick={() => toggleSection('compliance')} className="w-full flex items-center justify-between">
                  <h3 className="font-bold text-textPrimary flex items-center gap-2">
                    📋 Compliance Report
                    {result.compliance_report.approved
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
                      : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Issues Found</span>
                    }
                  </h3>
                  {expandedSections.compliance ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.compliance && (
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-4 text-sm">
                      <span className="text-textSecondary">Duration: <strong className="text-textPrimary">{result.compliance_report.total_duration_seconds}s</strong></span>
                      <span className="text-textSecondary">App Content: <strong className="text-textPrimary">{result.compliance_report.app_content_percentage}%</strong></span>
                    </div>
                    {(result.compliance_report.issues || []).map((issue, i) => (
                      <div key={i} className="p-3 bg-red-50 rounded-xl text-sm">
                        <p className="text-red-700 font-medium">Scene {issue.scene_number}: {issue.issue}</p>
                        <p className="text-red-500 text-xs mt-1">Fix: {issue.fix_suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Editing Spec */}
            {result.editing_spec && (
              <div className="card-base p-6">
                <button onClick={() => toggleSection('editing')} className="w-full flex items-center justify-between">
                  <h3 className="font-bold text-textPrimary flex items-center gap-2">✂️ Editing Specification</h3>
                  {expandedSections.editing ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                {expandedSections.editing && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="px-3 py-1 bg-backgroundSoft rounded-lg text-sm text-textSecondary">{result.editing_spec.resolution}</span>
                      <span className="px-3 py-1 bg-backgroundSoft rounded-lg text-sm text-textSecondary">{result.editing_spec.aspect_ratio}</span>
                      <span className="px-3 py-1 bg-backgroundSoft rounded-lg text-sm text-textSecondary">{result.editing_spec.fps} FPS</span>
                      <span className="px-3 py-1 bg-backgroundSoft rounded-lg text-sm text-textSecondary">{result.editing_spec.total_duration_seconds}s</span>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto max-h-80">
                      {JSON.stringify(result.editing_spec, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
