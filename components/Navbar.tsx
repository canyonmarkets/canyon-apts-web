'use client';

import { useState, useEffect } from 'react';
import BookCallButton from '@/components/BookCallButton';

const NAV_LINKS = [
  { label: 'How It Works',  href: '#how-it-works' },
  { label: 'Who We Help',   href: '#who-we-help' },
  { label: 'Amenities',     href: '#amenities' },
  { label: 'Locations',     href: '#locations' },
  { label: 'FAQ',           href: '#faq' },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLink = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white shadow-sm border-b border-stone-200' : 'bg-white/95',
    ].join(' ')}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="#home" onClick={(e) => { e.preventDefault(); handleLink('#home'); }}
          className="flex items-center gap-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Canyon Apts" className="h-10 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <span className="font-display font-bold text-lg tracking-wide uppercase text-iron-800 group-hover:text-brand-500 transition-colors duration-200">
            Canyon Apts
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href}
              onClick={(e) => { e.preventDefault(); handleLink(href); }}
              className="text-sm font-medium text-stone-600 hover:text-brand-600 transition-colors duration-200">
              {label}
            </a>
          ))}
          <BookCallButton
            label="Book a Call"
            className="ml-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.97] transition-all duration-200"
          />
        </nav>

        {/* Mobile hamburger */}
        <button className="lg:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={`block h-0.5 w-6 bg-stone-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-6 bg-stone-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-stone-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <nav className="bg-white border-t border-stone-100 px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={href} href={href}
              onClick={(e) => { e.preventDefault(); handleLink(href); }}
              className="py-3 text-sm font-medium text-stone-600 hover:text-brand-600 border-b border-stone-100 last:border-0 transition-colors duration-200">
              {label}
            </a>
          ))}
          <BookCallButton
            label="Book a Call"
            className="mt-3 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white text-center hover:bg-brand-700 transition-colors duration-200 w-full"
          />
        </nav>
      </div>
    </header>
  );
}
