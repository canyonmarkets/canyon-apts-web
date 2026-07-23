import { Metadata } from 'next';
import Link from 'next/link';
import BookCallButton from '@/components/BookCallButton';
import HeroCTAButtons from '@/components/HeroCTAButtons';
import { CheckCircle, Mail } from 'lucide-react';
import { moneyPageJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Traveling Nurse Housing Phoenix AZ | Furnished Weekly',
  description: 'Traveling nurse housing in Phoenix, AZ. Fully furnished apartments for travel nurses on weekly and monthly contracts. Utilities included, flexible terms, fast move-in. Canyon Apartments.',
  alternates: { canonical: '/traveling-nurse-housing-phoenix' },
};

const jsonLd = moneyPageJsonLd({
  name: 'Traveling Nurse Housing Phoenix',
  path: '/traveling-nurse-housing-phoenix',
  description:
    'Furnished traveling nurse housing in Phoenix, AZ. Weekly and monthly terms near major hospitals, utilities included, flexible check-out, fast move-in.',
});

const HOSPITALS = [
  'Banner University Medical Center Phoenix',
  'Dignity Health St. Joseph\'s Hospital',
  'Valleywise Health Medical Center',
  'Mayo Clinic Hospital Phoenix',
  'Phoenix Children\'s Hospital',
  'Banner Desert Medical Center Mesa',
  'Chandler Regional Medical Center',
];

export default function TravelingNursePage() {
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-stone-900 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">Phoenix Metro, AZ</p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
            Traveling Nurse Housing in Phoenix, AZ
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Canyon Apartments provides fully furnished housing for travel nurses on assignment in the Phoenix metro.
            Week-to-week and month-to-month leases that flex with your contract. Utilities included.
            Move in fast — often same week you call.
          </p>
          <HeroCTAButtons />
        </div>
      </section>

      <section className="px-6 py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
            Why Travel Nurses Choose Canyon Apartments
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Week-to-week or month-to-month — matches your assignment length',
              'Fully furnished — unpack and you\'re home',
              'All utilities included — no setup headaches',
              'No credit check — great for nurses between permanent addresses',
              'Fast move-in — often same week as your assignment starts',
              'Locations near major Phoenix metro hospitals',
              'Flexible check-out — no penalty if your contract ends early',
              'Real apartment — not a hotel, not a shared room',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-brand-600" strokeWidth={1.5} />
                <span className="text-stone-700 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-4">
            Hospitals Near Our Phoenix Metro Locations
          </h2>
          <p className="text-stone-600 text-sm text-center max-w-2xl mx-auto mb-10 leading-relaxed">
            We have furnished apartments available near Phoenix&apos;s major medical centers
            across the metro. Call us and we&apos;ll find the unit closest to your assignment.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {HOSPITALS.map((h) => (
              <span key={h} className="px-4 py-2 rounded-full border border-stone-200 bg-stone-50 text-stone-700 text-sm">{h}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-stone-50 border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/furnished-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Furnished Apartments Phoenix</Link>
            <Link href="/weekly-rentals-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Weekly Rentals Phoenix</Link>
            <Link href="/corporate-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Corporate Housing Phoenix</Link>
            <Link href="/no-credit-check-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">No Credit Check Apartments</Link>
            <Link href="/guides/traveling-nurse-housing-phoenix-guide" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Travel Nurse Housing Guide</Link>
            <Link href="/guides" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">All Housing Guides</Link>
            <Link href="/" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">← Canyon Apartments</Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-brand-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white">
            Starting a Phoenix Assignment? Let&apos;s Get You Settled.
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">Book a free 15-minute call. We&apos;ll match you with a furnished unit near your hospital and often have you moved in the same week.</p>
          <div className="flex justify-center">
            <BookCallButton label="Book a Free 15-Min Call" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-brand-800 uppercase tracking-wide hover:bg-brand-50 transition-colors duration-200" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="mailto:properties@canyon-advisors.com" className="inline-flex items-center gap-2 text-sm text-brand-200 hover:text-white transition-colors"><Mail size={14} strokeWidth={1.5} />properties@canyon-advisors.com</a>
          </div>
        </div>
      </section>

    </div>
  );
}
