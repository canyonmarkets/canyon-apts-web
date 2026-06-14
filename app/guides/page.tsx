import { Metadata } from 'next';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import BookCallButton from '@/components/BookCallButton';
import { GUIDES } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Phoenix Furnished Housing Guides',
  description:
    'Practical guides on furnished apartments, travel nurse housing, no-credit-check rentals, and short-term stays in Phoenix, AZ — from Canyon Apartments.',
  alternates: { canonical: '/guides' },
};

const CATEGORY_ORDER = ['Travel Nursing', 'No Credit Check', 'Housing Guides'];

export default function GuidesPage() {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    guides: GUIDES.filter((g) => g.category === cat),
  }));

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-stone-900 px-6 py-24">
        <Reveal className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">Knowledge Base</p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
            Phoenix Housing Guides
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Practical answers to the questions we hear most — for travel nurses, people with credit challenges, corporate relocations, and anyone navigating a short-term Phoenix stay.
          </p>
        </Reveal>
      </section>

      {/* Guide cards by category */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col gap-20">
          {grouped.map(({ category, guides }) =>
            guides.length === 0 ? null : (
              <div key={category}>
                <Reveal>
                  <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3">{category}</p>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase tracking-wide text-stone-900 mb-10">
                    {category === 'Travel Nursing' && 'Traveling Nurse Housing'}
                    {category === 'No Credit Check' && 'Credit & Background Guides'}
                    {category === 'Housing Guides' && 'Short-Term & Relocation Guides'}
                  </h2>
                </Reveal>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {guides.map((guide) => (
                    <Reveal key={guide.slug}>
                      <Link
                        href={`/guides/${guide.slug}`}
                        className="group flex flex-col gap-3 p-6 rounded-xl border-2 border-stone-200 bg-stone-50 hover:border-brand-500 hover:bg-white transition-colors duration-200 h-full"
                      >
                        <h3 className="font-display font-bold text-base uppercase tracking-wide text-stone-900 group-hover:text-brand-600 transition-colors duration-200 leading-snug">
                          {guide.title}
                        </h3>
                        <p className="text-stone-500 text-sm leading-relaxed flex-1">
                          {guide.intro.slice(0, 155).trim()}&hellip;
                        </p>
                        <span className="text-brand-600 text-xs font-semibold uppercase tracking-wide">Read guide →</span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* Internal links */}
      <section className="px-6 py-12 bg-stone-50 border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-stone-500 mb-4">Browse by Need</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/furnished-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Furnished Apartments
            </Link>
            <Link href="/no-credit-check-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              No Credit Check
            </Link>
            <Link href="/traveling-nurse-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Traveling Nurse Housing
            </Link>
            <Link href="/weekly-rentals-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Weekly Rentals
            </Link>
            <Link href="/corporate-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              Corporate Housing
            </Link>
            <Link href="/" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              ← Canyon Apartments
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-brand-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white">
            Ready to Find a Unit?
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">
            Book a free 15-minute call. We&apos;ll walk through availability and can usually have you moved in within the same week.
          </p>
          <div className="flex justify-center">
            <BookCallButton
              label="Book a Free 15-Min Call"
              className="btn-shine inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-brand-800 uppercase tracking-wide hover:bg-brand-50 transition-colors duration-200"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
