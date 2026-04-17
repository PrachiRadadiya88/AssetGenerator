/**
 * HomePage.jsx — Landing page for the Play Store Asset Generator.
 * 
 * Features a hero section with gradient background, feature highlights,
 * and CTA to navigate to the generator.
 */

import { Link } from 'react-router-dom';
import {
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Download,
  Palette,
  Smartphone,
  Layers,
  ArrowRight,
  Zap,
  Shield,
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

export default function HomePage() {
  return (
    <div className="page-enter">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-accentGold/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-accentTerracotta/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Asset Generation
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-textPrimary leading-tight mb-6 animate-slide-up">
              Create Stunning{' '}
              <span className="gradient-text">Play Store</span>{' '}
              Screenshots in Seconds
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-textSecondary leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Generate professional, high-quality screenshot assets for your app listing.
              Powered by AI to create unique visuals and compelling copy that converts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/generator" className="btn-primary text-base px-8 py-4" id="hero-cta">
                <Zap className="w-5 h-5" />
                Start Generating
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="btn-ghost text-base">
                See How It Works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-12 text-textSecondary/60 text-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>No login required</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-textSecondary/30" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>Results in ~30s</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-textSecondary/30" />
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>Free to use</span>
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
            Built with ❤️ using Gemini AI · Play Store Screenshot Asset Generator
          </p>
        </div>
      </footer>
    </div>
  );
}
