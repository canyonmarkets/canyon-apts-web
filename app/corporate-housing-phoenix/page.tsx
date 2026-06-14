import { Metadata } from 'next';
import Link from 'next/link';
import BookCallButton from '@/components/BookCallButton';
import { CheckCircle, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Corporate Housing Phoenix AZ | Furnished Monthly Rentals',
  description: 'Corporate housing in Phoenix, AZ. Fully furnished monthly apartments for business travelers, relocating employees, and project-based assignments. Utilities included, no credit check, fast move-in.',
  alternates: { canonical: '/corporate-housing-phoenix' },
};

export default function CorporateHousingPage() {
  return (
    <div className="bg-white">

      <section className="bg-stone-900 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">Phoenix Metro, AZ</p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
            Corporate Housing in Phoenix, AZ
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Canyon Apartments provides furnished corporate housing across the Phoenix metro for relocating employees,
            extended business assignments, and project-based stays. Monthly rates from $1,980 — utilities, furniture,
            and parking all included. No long-term leases required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BookCallButton
              label="Check Corporate Availability"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/40"
            />
            <a href="tel:+16029356830" className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:border-brand-500 transition-colors duration-200">
              <Phone size={16} strokeWidth={1.5} />(602) 935-6830
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
            Corporate Housing That Works the Way Business Works
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Month-to-month terms — no 12-month commitment',
              'Fully furnished — employee arrives to a move-in ready home',
              'All utilities included — predictable single monthly cost',
              'Locations across Phoenix, Scottsdale, Tempe, Chandler, Mesa, and Gilbert',
              'Fast setup — often available within 48 hours of request',
              'No credit check required for employee placement',
              'Flexible early termination — no penalties if the project ends early',
              'Direct invoicing available for corporate accounts',
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
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
            Common Corporate Housing Situations We Handle
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Employee Relocation', body: 'Your company is relocating an employee to Phoenix. They need a furnished apartment immediately while house-hunting.' },
              { title: 'Project-Based Assignment', body: 'A team member is on a 60 to 90 day project in the Phoenix market. Hotel costs add up fast — a furnished apartment is smarter.' },
              { title: 'Executive Extended Stay', body: 'Senior leadership needs furnished housing in Scottsdale or North Phoenix for a quarter or longer.' },
              { title: 'Training or Onboarding', body: 'New hires coming through Phoenix for an extended onboarding program need comfortable, professional housing.' },
              { title: 'Consultant Placements', body: 'Consultants on multi-month engagements need a real apartment, not a hotel.' },
              { title: 'Insurance Housing', body: 'An employee\'s home is being repaired and they need furnished corporate-style housing covered by insurance.' },
            ].map(({ title, body }) => (
              <div key={title} className="flex flex-col gap-2 p-6 rounded-xl border border-stone-200 bg-stone-50">
                <h3 className="font-display font-bold text-base uppercase tracking-wide text-stone-900">{title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 bg-stone-50 border-t border-stone-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/furnished-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Furnished Apartments Phoenix</Link>
            <Link href="/weekly-rentals-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Weekly Rentals Phoenix</Link>
            <Link href="/traveling-nurse-housing-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">Traveling Nurse Housing</Link>
            <Link href="/no-credit-check-apartments-phoenix" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">No Credit Check Apartments</Link>
            <Link href="/" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">← Canyon Apartments</Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-brand-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white">
            Need Corporate Housing in Phoenix?
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">Call or book a quick conversation. We&apos;ll match your employee with a furnished Phoenix apartment that&apos;s ready when they are.</p>
          <div className="flex justify-center">
            <BookCallButton label="Talk to Us Today" className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-brand-800 uppercase tracking-wide hover:bg-brand-50 transition-colors duration-200" />
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
