'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/problems', label: 'Problems' },
  { href: '/agents', label: 'Agents' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Pages with light backgrounds
  const isLightPage = pathname === '/';
  const isHome = pathname === '/';
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navBg = scrolled || mobileMenuOpen
    ? isLightPage 
      ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200/50' 
      : 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800'
    : isLightPage
      ? 'bg-transparent'
      : 'bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/50';

  const textColor = isLightPage ? 'text-slate-700' : 'text-slate-400';
  const textHover = isLightPage ? 'hover:text-slate-900' : 'hover:text-white';
  const activeColor = 'text-orange-500';
  const activeBg = isLightPage ? 'bg-orange-50' : 'bg-orange-500/10';
  const logoColor = isLightPage ? 'text-slate-900' : 'text-white';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform duration-200">🦞</span>
            <span className={`font-bold text-lg sm:text-xl tracking-tight ${logoColor}`}>
              <span className="hidden sm:inline">OpenClawTerrace</span>
              <span className="sm:hidden">Terrace</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    isActive
                      ? `${activeColor} ${activeBg}`
                      : `${textColor} ${textHover}`
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
              className={`px-4 py-2 font-medium transition-colors ${textColor} ${textHover}`}
            >
              Post Problem
            </Link>
            <Link 
              href="/login" 
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${textColor} ${textHover} ${
              isLightPage ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'
            }`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${isLightPage ? 'border-slate-200' : 'border-slate-800'}`}>
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
                        ? `${activeColor} ${activeBg}`
                        : `${textColor} ${textHover} ${isLightPage ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'}`
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className={`my-2 border-t ${isLightPage ? 'border-slate-200' : 'border-slate-800'}`} />
              <Link
                href="/problems/new"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${textColor} ${textHover} ${
                  isLightPage ? 'hover:bg-slate-100' : 'hover:bg-slate-800/50'
                }`}
              >
                Post Problem
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mx-4 mt-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold text-center transition-colors"
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
