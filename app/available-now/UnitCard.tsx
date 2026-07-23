'use client';

import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AMENITY_ICONS, cityName } from './shared';
import type { Unit } from './shared';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/unit-photos/${path}`;
}

function UnitCarousel({ photos, title }: { photos: Unit['unit_photos']; title: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [idx, setIdx] = useState(0);

  const scrollPrev = useCallback((e: React.MouseEvent) => { e.preventDefault(); emblaApi?.scrollPrev(); }, [emblaApi]);
  const scrollNext = useCallback((e: React.MouseEvent) => { e.preventDefault(); emblaApi?.scrollNext(); }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIdx(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
  }, [emblaApi]);

  if (photos.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-white/5 flex items-center justify-center rounded-t-2xl">
        <span className="text-white/40 text-sm">Photos coming soon</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-t-2xl aspect-[4/3]">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {photos.map(p => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={p.id}
              src={photoUrl(p.storage_path)}
              alt={title}
              className="flex-[0_0_100%] min-w-0 h-full w-full object-cover"
            />
          ))}
        </div>
      </div>
      {photos.length > 1 && (
        <>
          <button onClick={scrollPrev} aria-label="Previous photo"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={scrollNext} aria-label="Next photo"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <span key={i} className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function UnitCard({ unit, availableDate }: { unit: Unit; availableDate?: string }) {
  const sorted = [...unit.unit_photos].sort((a, b) => a.sort_order - b.sort_order);
  const city = cityName(unit.city);

  return (
    <div className="bg-[#161d2b] rounded-2xl ring-1 ring-white/10 overflow-hidden flex flex-col hover:-translate-y-1 hover:ring-brand-500/40 hover:shadow-[0_12px_40px_rgba(201,75,12,0.15)] transition-all duration-200">

      {/* Photo carousel */}
      <UnitCarousel photos={sorted} title={unit.title} />

      {/* Status pill */}
      <div className="px-4 pt-3 flex items-center gap-2 flex-wrap">
        {availableDate ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Available {availableDate}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 border border-green-400/30 text-green-300 text-[11px] font-semibold px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
            Available Now
          </span>
        )}
        {unit.special && (
          <span className="inline-flex items-center rounded-full bg-brand-500/20 border border-brand-400/40 text-brand-200 text-[11px] font-semibold px-2.5 py-1">
            ★ {unit.special}
          </span>
        )}
      </div>

      {/* Details */}
      <div className="px-4 pt-2 pb-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-display font-bold text-white text-base uppercase tracking-wide leading-tight">
            {unit.title}
          </h3>
          <p className="text-white/50 text-xs mt-0.5">
            {city} · {unit.bedrooms}BR / {unit.bathrooms}BA
          </p>
        </div>

        <p className="text-brand-400 text-2xl font-bold leading-none">
          ${unit.weekly_price.toLocaleString()}<span className="text-white/40 text-sm font-normal"> / week</span>
        </p>
        <p className="text-[11.5px] font-semibold text-white/75 -mt-1">
          All utilities included · Fully furnished · No long-term lease
        </p>

        {/* Amenity chips */}
        {unit.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {unit.amenities.map(a => {
              const Icon = AMENITY_ICONS[a];
              return (
                <span key={a} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 text-white/70 text-[11px] font-medium px-2.5 py-1">
                  {Icon && <Icon size={11} />} {a}
                </span>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/book?utm_source=inventory&unit=${unit.id}`}
          className="mt-auto block w-full text-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-3 text-sm font-semibold text-white uppercase tracking-wide shadow-[0_4px_18px_rgba(201,75,12,0.3)] hover:shadow-[0_6px_24px_rgba(201,75,12,0.45)] hover:-translate-y-0.5 transition-all"
        >
          Book a Free 15-Min Call
        </Link>
      </div>
    </div>
  );
}
