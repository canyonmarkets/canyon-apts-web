import { Metadata } from 'next';
import Link from 'next/link';
import BookCallButton from '@/components/BookCallButton';
import { CheckCircle, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Weekly Apartment Rentals Phoenix AZ | From $495/Week',
  description: 'Weekly apartment rentals in Phoenix, AZ starting at $495/week. Fully furnished, utilities included, no credit check. Flexible week-to-week leases with same-day move-in available. Canyon Apartments.',
  alternates: { canonical: '/weekly-rentals-phoenix' },
};

const USE_CASES = [
  { title: 'Home Renovation', body: 'Your contractor said 3 weeks — it\'s been 6. Stay somewhere comfortable while the work gets done.' },
  { title: 'Job Relocation', body: 'Starting a new job in Phoenix but haven\'t found a permanent place yet. Bridge the gap without signing a lease.' },
  { title: 'Insurance Displacement', body: 'Your home had damage and insurance is covering temporary housing. We work with most insurance carriers.' },
  { title: 'Divorce or Separation', body: 'You need a fully furnished place fast with no long application process. Move in this week.' },
  { title: 'Travel or Contract Work', body: 'Working a 4-8 week assignment in Phoenix. Need a real apartment, not a hotel.' },
  { title: 'Between Leases', body: 'Your new apartment isn\'t ready yet and your old one is done. A weekly rental bridges the gap perfectly.' },
];

export default function WeeklyRentalsPage() {
  return (
    <div className="bg-white">

      {/* ── Hero ── */}
      <section className="bg-stone-900 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">
            Phoenix Metro, AZ
          </p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
            Weekly Apartment Rentals in Phoenix, AZ
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Canyon Apartments rents fully furnished weekly apartments across Phoenix, Tempe, Mesa,
            Gilbert, and Chandler. Starting at $495 per week — utilities included, no credit check,
            same-day move-in often available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BookCallButton
              label="Check Weekly Availability"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/40"
            />
            <a
              href="tel:+16029356830"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:border-brand-500 transition-colors duration-200"
            >
              <Phone size={16} strokeWidth={1.5} />
              (602) 935-6830
            </a>
          </div>
        </div>
      </section>

      {/* ── Why Weekly ── */}
      <section className="px-6 py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3 text-center">
            Who Weekly Rentals Are For
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
            Phoenix Weekly Rentals — Common Situations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {USE_CASES.map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-2 p-6 rounded-xl border border-stone-200 bg-white">
                <h3 className="font-display font-bold text-base uppercase tracking-wide text-stone-900">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How Weekly Works ── */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3 text-center">
            Simple
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
            How Our Phoenix Weekly Rentals Work
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Book a Free Call', body: 'A 15-minute call to check availability, answer your questions, and match you with the right unit.' },
              { step: '02', title: 'Sign & Pay First Week', body: 'Simple week-to-week agreement. Pay the first week\'s rate. That\'s the whole process.' },
              { step: '03', title: 'Move In', body: 'Pick up your keys. The apartment is fully furnished and ready. Many residents move in same-day.' },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex flex-col gap-3">
                <span className="font-mono text-4xl font-bold text-brand-200 leading-none">{step}</span>
                <h3 className="font-display font-bold text-lg uppercase tracking-wide text-stone-900">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Facts ── */}
      <section className="px-6 py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
            Everything You Need to Know
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Weekly rate starts at $495 — all utilities included',
              'No credit check, no rental history required',
              'Fully furnished — bring only your personal items',
              'Week-to-week lease — stay as long as you need',
              'Same-day move-in often available',
              'Serving Phoenix, Tempe, Mesa, Gilbert, and Chandler',
              'No security deposit battles — simple and straightforward',
              'No hidden fees — what we quote is what you pay',
            ].map((fact) => (
              <li key={fact} className="flex items-start gap-3">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-brand-600" strokeWidth={1.5} />
                <span className="text-stone-700 text-sm leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Internal Links ── */}
      <section className="px-6 py-12 bg-white border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-stone-500 text-sm mb-6 font-mono tracking-wide uppercase">Explore More</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/no-credit-check-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">No Credit Check Apartments</Link>
            <Link href="/furnished-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Furnished Apartments Phoenix</Link>
            <Link href="/corporate-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Corporate Housing Phoenix</Link>
            <Link href="/traveling-nurse-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Traveling Nurse Housing</Link>
            <Link href="/" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">← Canyon Apartments Home</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 bg-brand-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white">
            Ready for a Weekly Rental in Phoenix?
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">
            Book your free 15-minute call. We&apos;ll check availability and often have you
            moved in the same day.
          </p>
          <div className="flex justify-center">
            <BookCallButton
              label="Book a Free 15-Min Call"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-brand-800 uppercase tracking-wide hover:bg-brand-50 transition-colors duration-200"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:info@canyon-markets.com" className="inline-flex items-center gap-2 text-sm text-brand-200 hover:text-white transition-colors"><Mail size={14} strokeWidth={1.5} />info@canyon-markets.com</a>
            <a href="tel:+16029356830" className="inline-flex items-center gap-2 text-sm text-brand-200 hover:text-white transition-colors"><Phone size={14} strokeWidth={1.5} />(602) 935-6830</a>
          </div>
        </div>
      </section>

    </div>
  );
}
