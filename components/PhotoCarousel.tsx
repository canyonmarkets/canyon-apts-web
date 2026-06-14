'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Reveal from '@/components/Reveal';

const PHOTOS = [
  { src: '/apt-01.webp', alt: 'Furnished living room with sofa and TV' },
  { src: '/apt-02.webp', alt: 'Furnished apartment interior' },
  { src: '/apt-03.webp', alt: 'Furnished living and dining area' },
  { src: '/apt-04.webp', alt: 'Apartment living room' },
  { src: '/apt-05.webp', alt: 'Furnished apartment space' },
  { src: '/apt-06.webp', alt: 'Apartment interior view' },
  { src: '/apt-07.webp', alt: 'Furnished living room' },
  { src: '/apt-08.webp', alt: 'Apartment dining and kitchen' },
  { src: '/apt-09.webp', alt: 'Open living and kitchen area' },
  { src: '/apt-10.webp', alt: 'Furnished apartment unit' },
  { src: '/apt-11.webp', alt: 'Apartment interior' },
  { src: '/apt-12.webp', alt: 'Furnished rental unit' },
  { src: '/apt-13.webp', alt: 'Living room with furniture' },
  { src: '/apt-14.webp', alt: 'Apartment living space' },
  { src: '/apt-15.webp', alt: 'Furnished apartment' },
  { src: '/apt-16.webp', alt: 'Apartment interior view' },
  { src: '/apt-17.webp', alt: 'Furnished rental' },
  { src: '/apt-18.webp', alt: 'Apartment space' },
  { src: '/apt-19.webp', alt: 'Furnished unit' },
  { src: '/apt-20.webp', alt: 'Apartment interior' },
  { src: '/apt-21.webp', alt: 'Furnished living area' },
  { src: '/apt-22.webp', alt: 'Apartment room' },
  { src: '/apt-23.webp', alt: 'Furnished apartment space' },
  { src: '/apt-24.webp', alt: 'Apartment interior' },
];

export default function PhotoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo  = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi]);

  // Close lightbox on Escape
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((n) => (n === null ? n : (n + 1) % PHOTOS.length));
      if (e.key === 'ArrowLeft') setLightbox((n) => (n === null ? n : (n - 1 + PHOTOS.length) % PHOTOS.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  return (
    <section id="gallery" className="bg-iron-900 px-6 py-24">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <Reveal className="text-center mb-12">
          <p className="text-brand-500 font-mono text-base tracking-[0.3em] uppercase mb-4">
            See Inside
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-white">
            Our Furnished Units
          </h2>
          <p className="mt-5 text-white text-base leading-relaxed max-w-xl mx-auto">
            Every unit is move-in ready. Browse through our available apartments
            and see exactly what you will be walking into.
          </p>
        </Reveal>

        {/* Carousel */}
        <div className="relative">

          {/* Slide viewport */}
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {PHOTOS.map(({ src, alt }, i) => (
                <div key={i} className="relative flex-[0_0_100%] min-w-0 sm:flex-[0_0_80%] lg:flex-[0_0_60%] mr-4">
                  <button
                    onClick={() => setLightbox(i)}
                    aria-label={`View ${alt} full screen`}
                    className={`relative block w-full aspect-[4/3] rounded-xl overflow-hidden cursor-zoom-in transition-all duration-500 ${
                      i === selectedIndex
                        ? 'opacity-100 scale-100'
                        : 'opacity-40 scale-[0.92]'
                    }`}
                  >
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw"
                      priority={i < 3}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Prev button */}
          <button
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-iron-900/80 text-white border border-white/20 hover:bg-brand-600 hover:border-brand-500 hover:scale-110 transition-all duration-200"
            aria-label="Previous photo"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>

          {/* Next button */}
          <button
            onClick={scrollNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-iron-900/80 text-white border border-white/20 hover:bg-brand-600 hover:border-brand-500 hover:scale-110 transition-all duration-200"
            aria-label="Next photo"
          >
            <ChevronRight size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6 flex-wrap">
          {scrollSnaps.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedIndex
                  ? 'bg-brand-500 w-6'
                  : 'bg-white/30 w-2 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Photo counter */}
        <p className="text-center text-iron-400 font-mono text-xs tracking-widest uppercase mt-4">
          {selectedIndex + 1} / {PHOTOS.length} · Tap a photo to enlarge
        </p>

      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-10"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute top-5 right-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white border border-white/20 hover:bg-brand-600 transition-colors duration-200"
          >
            <X size={22} strokeWidth={2} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((n) => (n === null ? n : (n - 1 + PHOTOS.length) % PHOTOS.length)); }}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white border border-white/20 hover:bg-brand-600 transition-colors duration-200"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          <div
            className="relative w-full max-w-5xl aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={PHOTOS[lightbox].src}
              alt={PHOTOS[lightbox].alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((n) => (n === null ? n : (n + 1) % PHOTOS.length)); }}
            aria-label="Next photo"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white border border-white/20 hover:bg-brand-600 transition-colors duration-200"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 font-mono text-xs tracking-widest">
            {lightbox + 1} / {PHOTOS.length}
          </p>
        </div>
      )}
    </section>
  );
}
