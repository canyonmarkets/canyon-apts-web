import { Metadata } from 'next';
import Link from 'next/link';
import BookCallButton from '@/components/BookCallButton';
import HeroCTAButtons from '@/components/HeroCTAButtons';
import { CheckCircle, Mail } from 'lucide-react';
import { moneyPageJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Furnished Apartments Phoenix AZ | Weekly & Monthly',
  description: 'Fully furnished apartments for rent in Phoenix, AZ. Week-to-week and month-to-month leases. Utilities included. No credit check required. Move in ready from $495/week. Canyon Apartments.',
  alternates: { canonical: '/furnished-apartments-phoenix' },
};

const jsonLd = moneyPageJsonLd({
  name: 'Furnished Apartments Phoenix',
  path: '/furnished-apartments-phoenix',
  description:
    'Fully furnished apartments for rent in Phoenix, AZ on weekly and monthly terms. Utilities included, no credit check, move-in ready from $495/week.',
});

const INCLUDED = [
  'Bed, pillows, and all bedding',
  'Sofa and living room furniture',
  'Fully equipped kitchen — dishes, pots, pans, utensils',
  'Towels and bathroom essentials',
  'TV in living room',
  'Electric, water, gas utilities',
  'Free parking',
  'In-unit or on-site laundry',
];

export default function FurnishedApartmentsPage() {
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <section className="bg-stone-900 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">
            Phoenix Metro, AZ
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
            Furnished Apartments for Rent in Phoenix, AZ
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Canyon Apartments rents fully furnished units across Phoenix, Tempe, Mesa, Gilbert, and Chandler
            on flexible week-to-week and month-to-month terms. Utilities included. No credit check.
            Bring your bags — everything else is already there.
          </p>
          <HeroCTAButtons />
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="px-6 py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3 text-center">
            Move-In Ready
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-4">
            Everything Included in Your Furnished Phoenix Apartment
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed text-center max-w-2xl mx-auto mb-10">
            When we say &quot;fully furnished,&quot; we mean it. Every Canyon Apartments unit is move-in
            ready from day one — no trips to IKEA, no setting up utilities, no security deposit negotiations.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-brand-600" strokeWidth={1.5} />
                <span className="text-stone-700 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Lease Options ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3 text-center">
            Flexible Terms
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
            Rent a Furnished Phoenix Apartment Your Way
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[
              { title: 'Weekly Furnished Rentals', price: 'From $495/week', body: 'Stay as few as one week with no long-term commitment. Perfect for relocations, home renovations, insurance placements, or any situation that needs immediate flexible housing.' },
              { title: 'Monthly Furnished Rentals', price: 'From $1,980/month', body: 'Extended stay without an annual lease. Great for traveling professionals, contract workers, or anyone who needs a furnished home base across the Phoenix metro for a few months.' },
            ].map(({ title, price, body }) => (
              <div key={title} className="flex flex-col gap-3 p-8 rounded-xl border-2 border-stone-200 hover:border-brand-500 transition-colors duration-200">
                <h3 className="font-display font-bold text-xl uppercase tracking-wide text-stone-900">{title}</h3>
                <p className="text-brand-600 font-semibold text-base">{price}</p>
                <p className="text-stone-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Internal Links ── */}
      <section className="px-6 py-12 bg-stone-50 border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-stone-500 text-sm mb-6 font-mono tracking-wide uppercase">Explore More</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/no-credit-check-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              No Credit Check Apartments
            </Link>
            <Link href="/weekly-rentals-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Weekly Rentals Phoenix
            </Link>
            <Link href="/traveling-nurse-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Traveling Nurse Housing
            </Link>
            <Link href="/corporate-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Corporate Housing Phoenix
            </Link>
            <Link href="/guides/furnished-vs-unfurnished-short-term-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Furnished vs. Unfurnished Guide
            </Link>
            <Link href="/guides" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              All Housing Guides
            </Link>
            <Link href="/" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              ← Back to Canyon Apartments
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 bg-brand-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white">
            Find Your Furnished Phoenix Apartment
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">
            Book a free 15-minute call and we&apos;ll check availability, walk you through your options,
            and often get you moved in the same week you call.
          </p>
          <div className="flex justify-center">
            <BookCallButton
              label="Check Availability Now"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-brand-800 uppercase tracking-wide hover:bg-brand-50 transition-colors duration-200"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <a href="mailto:info@canyon-markets.com" className="inline-flex items-center gap-2 text-sm text-brand-200 hover:text-white transition-colors">
              <Mail size={14} strokeWidth={1.5} />
              info@canyon-markets.com
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
