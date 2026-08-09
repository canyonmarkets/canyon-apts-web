'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import BookCallButton from '@/components/BookCallButton';
import { SITE } from '@/lib/site';

export default function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Subtle scroll parallax: content drifts up + fades, video drifts slower.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > window.innerHeight) return; // only while hero is on screen
        if (contentRef.current) {
          contentRef.current.style.transform = `translateY(${y * 0.25}px)`;
          contentRef.current.style.opacity = `${Math.max(0, 1 - y / 600)}`;
        }
        if (videoRef.current) {
          videoRef.current.style.transform = `translateY(${y * 0.12}px) scale(1.05)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="home" className="relative bg-iron-900 min-h-screen flex items-center pt-16 overflow-hidden">

      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
        className="ken-burns absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src="/HeroVideo.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay + brand vignette */}
      <div className="absolute inset-0 bg-iron-900/70" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/30 via-transparent to-transparent" aria-hidden="true" />

      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-24 w-full">
        <div className="max-w-3xl">

          <p className="hero-rise text-brand-500 font-mono text-xs sm:text-base tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-6" style={{ animationDelay: '0.1s' }}>
            Phoenix Metro Area · Starting at $495 / Week
          </p>

          <h1 className="hero-rise font-display font-bold text-[1.6rem] sm:text-6xl lg:text-7xl uppercase tracking-normal sm:tracking-wide text-white leading-tight sm:leading-none mb-6 sm:mb-8" style={{ animationDelay: '0.25s' }}>
            Furnished Apartments<br />
            <span className="text-gradient-animate">No Credit Check</span><br />
            Required
          </h1>

          <p className="hero-rise text-white text-sm sm:text-xl leading-relaxed max-w-2xl mb-4" style={{ animationDelay: '0.4s' }}>
            Fully furnished weekly and monthly rentals across the Phoenix metro.
            Utilities included. Move-in ready. No credit checks, no rental history,
            no long-term commitment.
          </p>

          <p className="hero-rise text-iron-300 text-sm sm:text-base leading-relaxed max-w-xl mb-10" style={{ animationDelay: '0.5s' }}>
            Phoenix · Tempe · Mesa · Gilbert · Chandler
          </p>

          <div className="hero-rise flex flex-col sm:flex-row gap-4" style={{ animationDelay: '0.6s' }}>
            <BookCallButton
              label="Book a Free 15-Min Call"
              className="btn-pulse btn-shine inline-flex items-center justify-center rounded-lg bg-brand-500 px-8 py-4 text-base font-semibold text-white uppercase tracking-wide hover:bg-brand-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.97] active:translate-y-0 transition-all duration-200"
            />
            <a href={SITE.inventoryUrl} target="_blank" rel="noopener noreferrer"
              className="btn-shine inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-4 text-base font-semibold text-white uppercase tracking-wide hover:border-brand-500/60 hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] active:translate-y-0 transition-all duration-200">
              View Inventory & Rates
            </a>
          </div>

        </div>
      </div>

      {/* Scroll-down indicator */}
      <a
        href="#difference"
        aria-label="Scroll to learn more"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-1 text-white/70 hover:text-brand-500 transition-colors duration-200"
      >
        <span className="font-mono text-[0.65rem] tracking-[0.3em] uppercase">Scroll</span>
        <ChevronDown size={22} strokeWidth={2} className="float-bob" />
      </a>
    </section>
  );
}
