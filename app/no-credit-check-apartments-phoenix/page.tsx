import { Metadata } from 'next';
import Link from 'next/link';
import BookCallButton from '@/components/BookCallButton';
import { CheckCircle, Mail } from 'lucide-react';
import { moneyPageJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'No Credit Check Apartments Phoenix AZ | From $495/Week',
  description: 'Looking for no credit check apartments in Phoenix, AZ? Canyon Apartments rents fully furnished weekly and monthly apartments with no credit check, no rental history required. Move in this week from $495.',
  alternates: { canonical: '/no-credit-check-apartments-phoenix' },
};

const jsonLd = moneyPageJsonLd({
  name: 'No Credit Check Apartments Phoenix',
  path: '/no-credit-check-apartments-phoenix',
  description:
    'Furnished no-credit-check apartments in Phoenix, AZ. No hard or soft credit pull, evictions and bad credit welcome, utilities included, move in this week from $495.',
});

const QUALIFIES = [
  'Bad credit or no credit history',
  'Past evictions on your record',
  'Bankruptcy — discharged or current',
  'Non-traditional income (1099, cash, gig work)',
  'Recently divorced or separated',
  'Relocating from out of state',
  'Between leases or in a housing transition',
  'Non-violent felony background',
];

export default function NoCreditCheckPage() {
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ── */}
      <section className="bg-stone-900 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">
            Phoenix, AZ
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
            No Credit Check Apartments in Phoenix, AZ
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Canyon Apartments rents fully furnished weekly and monthly apartments across the Phoenix metro
            with absolutely no credit check. No hard pull, no soft pull, no rental history required.
            Rates start at $495 per week — utilities included.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BookCallButton
              label="Book a Free 15-Min Call"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/40"
            />
          </div>
        </div>
      </section>

      {/* ── Who Qualifies ── */}
      <section className="px-6 py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3 text-center">
            No Judgment
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-4">
            Who Qualifies for Our No Credit Check Apartments
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed text-center max-w-2xl mx-auto mb-10">
            Traditional landlords in Phoenix turn away thousands of people who can absolutely afford rent.
            We don&apos;t. If you can pay the weekly rate going forward, you can move in.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUALIFIES.map((q) => (
              <li key={q} className="flex items-start gap-3">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-brand-600" strokeWidth={1.5} />
                <span className="text-stone-700 text-sm leading-relaxed">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── What's Included ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3 text-center">
            Everything Included
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
            What You Get Starting at $495/Week
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { title: 'Fully Furnished', body: 'Bed, bedding, sofa, kitchen table, fully equipped kitchen, towels, and TV. Bring your bags — nothing else required.' },
              { title: 'All Utilities Included', body: 'Electric, water, gas, and parking are all included in your weekly rate. No surprise bills at the end of the month.' },
              { title: 'Week-to-Week Flexibility', body: 'No annual lease. No minimum stay. Stay as long as you need — some residents stay a week, others stay over a year.' },
            ].map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-3 p-6 rounded-xl border border-stone-200 bg-stone-50">
                <h3 className="font-display font-bold text-lg uppercase tracking-wide text-stone-900">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Internal links ── */}
      <section className="px-6 py-12 bg-stone-50 border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-stone-500 text-sm mb-6 font-mono tracking-wide uppercase">More About Canyon Apartments</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/furnished-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Furnished Apartments Phoenix
            </Link>
            <Link href="/weekly-rentals-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Weekly Rentals Phoenix
            </Link>
            <Link href="/corporate-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Corporate Housing Phoenix
            </Link>
            <Link href="/traveling-nurse-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Traveling Nurse Housing
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
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white leading-tight">
            Ready to Move In? Let&apos;s Talk.
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">
            Book a free 15-minute call. We&apos;ll answer your questions, check availability,
            and often get you moved in the same week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BookCallButton
              label="Book a Free 15-Min Call"
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
