'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import BookCallButton from '@/components/BookCallButton';

/**
 * Site-wide chrome layered above the page content:
 *  - a thin scroll-progress bar pinned to the very top
 *  - a back-to-top button that fades in after scrolling
 *  - a sticky "Book a Call" bar on mobile (drives the existing booking modal)
 */
export default function PageChrome() {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (scrollTop / height) * 100 : 0);
      setScrolled(scrollTop > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent pointer-events-none">
        <div
          className="h-full bg-brand-500 transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back-to-top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`hidden sm:flex fixed bottom-6 right-6 z-50 h-12 w-12 items-center justify-center rounded-full bg-iron-900/90 text-white border border-white/15 shadow-lg backdrop-blur hover:bg-brand-600 hover:border-brand-500 transition-all duration-300 ${
          scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp size={20} strokeWidth={2} />
      </button>

      {/* Sticky mobile CTA bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <BookCallButton
          label="Book a Free Call"
          className="block w-full rounded-lg bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white uppercase tracking-wide active:scale-[0.98] transition-transform duration-150"
        />
      </div>
    </>
  );
}
