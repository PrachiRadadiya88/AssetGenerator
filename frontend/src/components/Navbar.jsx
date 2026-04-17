/**
 * Navbar.jsx — Top navigation bar component.
 * 
 * Features app branding and navigation links.
 */

import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutGrid } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isGenerator = location.pathname === '/generator';

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accentTerracotta flex items-center justify-center shadow-card group-hover:shadow-card-hover transition-shadow duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-textPrimary tracking-tight">
              Asset<span className="gradient-text">Gen</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {!isGenerator ? (
              <Link to="/generator" className="btn-primary text-sm">
                <LayoutGrid className="w-4 h-4" />
                Open Generator
              </Link>
            ) : (
              <Link to="/" className="btn-ghost text-sm">
                ← Back to Home
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
