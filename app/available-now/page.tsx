import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE } from '@/lib/site';
import UnitCard from './UnitCard';
import type { Unit } from './shared';
import { cityName } from './shared';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Available Furnished Apartments in Phoenix — Updated Weekly | Canyon Apartments',
  description:
    "Browse Canyon Apartments’ live inventory of furnished weekly and monthly rentals across Phoenix, Mesa, Tempe, Gilbert, and Chandler. Updated in real time — no Google Doc, no guessing.",
  alternates: { canonical: '/available-now' },
  openGraph: {
    title: 'Available Furnished Apartments — Canyon Apartments',
    description: 'Live availability. Browse furnished rentals across the Phoenix metro, updated weekly.',
    url: `${SITE.baseUrl}/available-now`,
    siteName: SITE.name,
    type: 'website',
  },
};

async function getUnits(): Promise<Unit[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from('units')
    // Explicit columns only — staff-only fields (keypad_code, mgmt_notes, unit_number) must never reach a public page.
    .select('id, title, area, city, bedrooms, bathrooms, weekly_price, amenities, special, status, available_date, sort_order, unit_photos(*)')
    .in('status', ['available', 'available_on'])
    .order('sort_order', { ascending: true });
  if (error || !data) return [];
  return data as Unit[];
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    timeZone: 'America/Phoenix', month: 'long', day: 'numeric',
  });
}

export default async function AvailableNowPage() {
  const units = await getUnits();
  const available = units.filter(u => u.status === 'available');
  const availableSoon = units.filter(u => u.status === 'available_on');

  const jsonLd = units.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Canyon Apartments — Available Units',
    numberOfItems: units.length,
    itemListElement: units.map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Apartment',
        name: `${u.bedrooms}BR Furnished Apartment — ${cityName(u.city)}`,
        description: `Furnished ${u.bedrooms}BR/${u.bathrooms}BA apartment in ${cityName(u.city)}, AZ`,
        offers: {
          '@type': 'Offer',
          price: u.weekly_price,
          priceCurrency: 'USD',
          priceSpecification: { '@type': 'UnitPriceSpecification', unitCode: 'WEE' },
          availability: u.status === 'available'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/PreOrder',
        },
      },
    })),
  } : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}

      {/* Hero */}
      <section className="bg-iron-900 px-5 pt-16 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-brand-400 text-xs tracking-[0.25em] uppercase mb-4">Live Availability</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-wide text-white leading-tight mb-4">
            Available<br className="sm:hidden" /> <span className="text-brand-400">Right Now</span>
          </h1>
          <p className="text-iron-300 text-lg max-w-xl mx-auto leading-relaxed">
            Furnished apartments across Phoenix, Mesa, Tempe, Gilbert & Chandler.
            Weekly and monthly — move in this week.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[['4,000+', 'guests hosted'], ['Since 2017', ''], ['From $495', '/wk'], ['No credit check', '']].map(([b, rest]) => (
              <span key={b} className="rounded-full bg-white/5 backdrop-blur border border-white/15 px-4 py-1.5 text-[12px] font-semibold text-white">
                <b className="text-brand-200">{b}</b>{rest ? ` ${rest}` : ''}
              </span>
            ))}
          </div>
        </div>
      </section>

      <main className="bg-iron-900 min-h-screen px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-14">

          {units.length === 0 && (
            <div className="text-center py-20">
              <p className="font-display text-2xl font-bold uppercase text-white mb-3">
                New Units Drop Weekly
              </p>
              <p className="text-iron-400 text-base mb-8 max-w-sm mx-auto leading-relaxed">
                Nothing is listed right now, but we match residents to units directly.
                Book a free call and we&apos;ll find your fit.
              </p>
              <Link
                href="/book?utm_source=inventory_empty"
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-700 transition-colors"
              >
                Book a Free 15-Min Call
              </Link>
            </div>
          )}

          {/* Available Now */}
          {available.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  Available Now
                </h2>
                <span className="text-iron-400 text-sm font-medium">({available.length} unit{available.length !== 1 ? 's' : ''})</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {available.map(unit => (
                  <UnitCard key={unit.id} unit={unit} />
                ))}
              </div>
            </section>
          )}

          {/* Available Soon */}
          {availableSoon.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
                  Available Soon
                </h2>
                <span className="text-iron-400 text-sm font-medium">({availableSoon.length} unit{availableSoon.length !== 1 ? 's' : ''})</span>
              </div>
              <p className="text-iron-500 text-sm mb-6 -mt-2">
                These units are turning over soon. Book a call now to secure your spot before they go live.
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {availableSoon.map(unit => (
                  <UnitCard key={unit.id} unit={unit} availableDate={unit.available_date ? fmtDate(unit.available_date) : undefined} />
                ))}
              </div>
            </section>
          )}

          {/* Bottom CTA */}
          {units.length > 0 && (
            <div className="rounded-3xl px-8 py-12 text-center bg-gradient-to-br from-[#161d2b] to-iron-900 ring-1 ring-white/10">
              <p className="font-mono text-brand-400 text-xs tracking-[0.25em] uppercase mb-3">Not sure which fits?</p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white mb-4">
                Talk to Us — It&apos;s Free
              </h3>
              <p className="text-iron-300 text-base max-w-md mx-auto mb-8 leading-relaxed">
                15 minutes. We&apos;ll match you to the right unit, answer every question, and hold it for you — no paperwork yet.
              </p>
              <Link
                href="/book?utm_source=inventory_bottom_cta"
                className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-10 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-700 transition-colors"
              >
                Book a Free 15-Min Call
              </Link>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
