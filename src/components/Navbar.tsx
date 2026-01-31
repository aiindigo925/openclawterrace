'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { href: '/problems', label: 'Problems' },
  { href: '/agents', label: 'Agents' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHome = pathname === '/';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isHome 
        ? 'bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/50' 
        : 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">🦞</span>
            <span className="font-bold text-lg sm:text-xl tracking-tight hidden sm:block">OpenClawTerrace</span>
            <span className="font-bold text-lg tracking-tight sm:hidden">Terrace</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-orange-400 bg-orange-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/problems/new"
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Post Problem
            </Link>
            <Link 
              href="/login" 
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'text-orange-400 bg-orange-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-slate-800" />
              <Link
                href="/problems/new"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              >
                Post Problem
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mx-4 mt-2 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
