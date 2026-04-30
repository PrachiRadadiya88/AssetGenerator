/**
 * HomePage.jsx — Landing page for the Play Store Asset Generator.
 * 
 * Features a hero section with gradient background, feature highlights,
 * and CTA to navigate to the generator.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Download,
  Palette,
  Smartphone,
  Layers,
  FileText,
  CheckCircle,
  Users,
  CheckCircle2,
  HelpCircle,
  Quote,
  Plus,
  Timer,
  ChevronDown,
  ArrowRight,
  Zap,
  Shield,
  Megaphone,
  RotateCcw,
// Video,
} from 'lucide-react';

const features = [
  {
    icon: <Wand2 className="w-5 h-5" />,
    title: 'AI-Powered Copy',
    description: 'Generate compelling headlines and subtext tailored to your app\'s unique features.',
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: 'Dynamic Mockup Layouts',
    description: 'Generates 2 to 8 unique screenshot layouts including varied phone angles, split screens, and floating 3D mockups.',
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: 'Solid & Gradient Themes',
    description: 'Match your brand identity precisely by selecting from solid hex colors or vibrant modern gradients.',
  },
  {
    icon: <ImageIcon className="w-5 h-5" />,
    title: 'Smart Image Generation',
    description: 'Upload your own screenshots or let AI hallucinate polished, premium UI directly into the phone mockups.',
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: 'Play Store Ready',
    description: 'Perfect dimensions (1080×1920 portrait or 1920×1080 landscape) meeting all Play Store requirements.',
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: 'One-Click Download',
    description: 'Download all your generated assets at once as a ZIP file, ready for immediate upload to the Play Console.',
  },
  {
    icon: <Megaphone className="w-5 h-5" />,
    title: 'Ad Campaign Creatives',
    description: 'Generate scroll-stopping Instagram and Facebook ad visuals tailored to your app\'s unique features.',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: 'ASO-Optimized Copy',
    description: 'Generate high-converting Play Store descriptions with the perfect balance of keywords and engagement.',
  },
  {
    icon: <RotateCcw className="w-5 h-5" />,
    title: 'Instant App Rebranding',
    description: 'Scrape any Play Store URL to automatically extract metadata and screenshots for a seamless redesign.',
  },
  /* {
    icon: <Video className="w-5 h-5" />,
    title: 'AI Video Studio',
    description: 'Generate Play Store promotional videos using a multi-agent AI pipeline with cinematic storyboards.',
  }, */
];

const steps = [
  {
    num: '01',
    title: 'Configure Your App',
    description: 'Define your audience, style, colors, and the number of screenshots (2-8).',
  },
  {
    num: '02',
    title: 'Add Your Features',
    description: 'List 2+ features. The AI will design a unique layout for each one.',
  },
  {
    num: '03',
    title: 'Generate & Download',
    description: 'Watch the AI build stunning Play Store assets in seconds.',
  },
];

const faqs = []; // Removed content

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="page-enter bg-backgroundMain selection:bg-primary/20">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden py-20">
        {/* Modern Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-accentGold/15 rounded-full blur-[100px]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accentTerracotta/10 rounded-full blur-[80px]" />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-textPrimary leading-[1.1] mb-8 animate-slide-up tracking-tight">
              Ship Faster. <br />
              <span className="gradient-text">Convert Higher.</span>
            </h1>

            {/* Subtext */}
            <p className="text-xl text-textSecondary leading-relaxed mb-12 animate-slide-up max-w-2xl mx-auto" style={{ animationDelay: '100ms' }}>
              The all-in-one AI toolkit to generate premium Play Store screenshots, high-converting ad creatives, and optimized descriptions in seconds.
            </p>

            {/* CTA Container */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/generator" className="group relative btn-primary text-lg px-8 py-5 bg-primary shadow-[0_20px_40px_-15px_rgba(139,94,60,0.4)] overflow-hidden w-full sm:w-auto">
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <ImageIcon className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Generate Assets</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>
              
              <Link to="/rebrand" className="group btn-secondary text-lg px-8 py-5 border-2 border-primary/10 hover:border-primary/30 bg-white/60 backdrop-blur-md w-full sm:w-auto">
                <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
                <span>Rebrand App</span>
              </Link>

              <Link to="/description-generator" className="group btn-secondary text-lg px-8 py-5 border-2 border-primary/10 hover:border-primary/30 bg-white/60 backdrop-blur-md w-full sm:w-auto">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Write Copy</span>
              </Link>

              {/* <Link to="/video-generator" className="group btn-secondary text-lg px-8 py-5 border-2 border-primary/10 hover:border-primary/30 bg-white/60 backdrop-blur-md w-full sm:w-auto">
                <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Video Studio</span>
              </Link> */}
            </div>

          </div>
        </div>
      </section>

      {/* ─── toolkit Selection — Revamped ─── */}
      <section className="py-24 relative overflow-hidden bg-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-textPrimary">Your Marketing Stack</h2>
                <div className="w-12 h-1 bg-primary/20 mx-auto mt-4 rounded-full" />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Tool Card 1 */}
            <Link to="/generator" className="group relative block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/5 bg-white">
                <div className="aspect-video overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1551651639-927b595f815c?auto=format&fit=crop&q=80&w=1000" alt="Screenshots" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-8 text-white">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Screenshot Generator</h3>
                        <p className="text-white/80 max-w-sm mb-4">Transform raw app captures into high-converting store assets.</p>
                        <div className="flex items-center gap-2 font-bold text-sm">
                            Open Tool <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Tool Card 2 */}
            <Link to="/description-generator" className="group relative block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/5 bg-white">
                <div className="aspect-video overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=1000" alt="Copywriting" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-accentTerracotta/80 to-transparent flex flex-col justify-end p-8 text-white">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                            <FileText className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Description Generator</h3>
                        <p className="text-white/80 max-w-sm mb-4">Write professional, SEO-friendly listings with AssetGen.</p>
                        <div className="flex items-center gap-2 font-bold text-sm">
                            Start Writing <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Tool Card 3 */}
            <Link to="/rebrand" className="group relative block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/5 bg-white">
                <div className="aspect-video overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1000" alt="Analytics/Rebrand" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-accentGold/80 to-transparent flex flex-col justify-end p-8 text-white">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                            <RotateCcw className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Rebrand Module</h3>
                        <p className="text-white/80 max-w-sm mb-4">Input a Play Store URL to redesign existing app assets instantly.</p>
                        <div className="flex items-center gap-2 font-bold text-sm">
                            Try Rebrand <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Tool Card 4: Video Studio */}
            {/* <Link to="/video-generator" className="group relative block rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-primary/5 bg-white">
                <div className="aspect-video overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=1000" alt="Video Production" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 to-transparent flex flex-col justify-end p-8 text-white">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                            <Video className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Video Studio</h3>
                        <p className="text-white/80 max-w-sm mb-4">Generate cinematic Play Store videos with our multi-agent AI pipeline.</p>
                        <div className="flex items-center gap-2 font-bold text-sm">
                            Create Video <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link> */}
          </div>
        </div>
      </section>

      {/* ─── Live Preview Section ─── */}
      <section className="py-24 bg-backgroundSoft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-4xl font-black text-textPrimary leading-tight mb-6">
                        Assets that <br />
                        <span className="text-primary italic">Demand Attention.</span>
                    </h2>
                    <p className="text-lg text-textSecondary mb-8 leading-relaxed">
                        Don't settle for generic app store pages. Our AI understands your app's value and creates visuals that highlight exactly why users should hit "Install".
                    </p>
                    <ul className="space-y-4">
                        {[
                            'High-fidelity 3D phone mockups',
                            'Benefit-focused AI headlines',
                            'Customizable brand colors & styles',
                            'Single-click ZIP export'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 font-semibold text-textPrimary">
                                <CheckCircle2 className="w-5 h-5 text-accentGreen" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl -rotate-6" />
                    <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-primary/5">
                        <img 
                            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800" 
                            alt="Preview" 
                            className="rounded-[2rem] w-full shadow-inner"
                        />
                        {/* Interactive overlay elements */}
                        <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl animate-bounce">
                            <Sparkles className="w-8 h-8 text-accentGold" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-primary p-4 rounded-2xl shadow-xl text-white font-bold">
                            <Layers className="w-6 h-6 inline mr-2" />
                            Premium Layers
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>


      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-20 bg-backgroundSoft/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-textPrimary mb-3">
              How It Works
            </h2>
            <p className="text-textSecondary max-w-xl mx-auto">
              Three simple steps to create professional Play Store assets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.num} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accentTerracotta/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accentTerracotta/20 transition-all duration-300">
                  <span className="text-xl font-bold gradient-text">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-textPrimary mb-2">{step.title}</h3>
                <p className="text-sm text-textSecondary">{step.description}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute">
                    <ArrowRight className="w-5 h-5 text-accentGold/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-textPrimary mb-3">
              Everything You Need
            </h2>
            <p className="text-textSecondary max-w-xl mx-auto">
              Professional-grade tools to create assets that stand out in the Play Store
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card-base card-hover p-6 group"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-accentGold/10 flex items-center justify-center text-primary mb-4 group-hover:from-primary/20 group-hover:to-accentGold/20 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-textPrimary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-textSecondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-base p-12 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accentGold/10 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accentTerracotta/10 blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl font-bold text-textPrimary mb-4">
                Ready to Create Amazing Assets?
              </h2>
              <p className="text-textSecondary mb-8 max-w-lg mx-auto">
                Join developers who are creating professional Play Store listings in minutes, not hours.
              </p>
              <Link to="/generator" className="btn-primary text-base px-8 py-4">
                <Sparkles className="w-5 h-5" />
                Get Started — It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-textSecondary">
            Built with ❤️ using AssetGen · Play Store Screenshot Asset Generator
          </p>
        </div>
      </footer>
    </div>
  );
}
