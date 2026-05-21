import { Stethoscope, CreditCard, Truck, Briefcase, Clock, Scale } from 'lucide-react';
import BookCallButton from '@/components/BookCallButton';

const SEGMENTS = [
  {
    icon: Stethoscope,
    label: 'Healthcare & Travel Workers',
    headline: 'Housing That Moves With Your Assignment',
    body: 'Traveling nurses, contract workers, and healthcare professionals need flexible housing that matches their assignment length — not a 12-month lease. Our weekly and monthly options fit your schedule perfectly, and we can have you set up before your first shift.',
    tags: ['Traveling Nurses', 'Contract Employees', 'Assignment-Length Stays'],
  },
  {
    icon: CreditCard,
    label: 'Credit Challenges Welcome',
    headline: 'Bad Credit or Evictions? No Problem.',
    body: 'We never run your credit or check your rental history. Past evictions, low credit scores, bankruptcies — none of it matters here. What matters is that you have a safe, comfortable place to live. We provide that, period.',
    tags: ['No Credit Check', 'Evictions OK', 'Fresh Start Welcome'],
  },
  {
    icon: Truck,
    label: 'Relocating Families & Individuals',
    headline: 'A Comfortable Base While You Get Settled',
    body: 'Moving to Phoenix? Finding a permanent home takes time. Our fully furnished apartments give you a comfortable, fully equipped place to stay while you house-hunt, sort out your new job, and get your bearings — with no pressure and no long-term commitment.',
    tags: ['Relocation Stays', 'Fully Furnished', 'Flexible Length'],
  },
  {
    icon: Briefcase,
    label: 'Non-Traditional Backgrounds',
    headline: 'We Work With Your Situation',
    body: 'Self-employed, cash income, gig workers, non-traditional employment history — the standard rental process often leaves these applicants out. We look at your ability to pay, not your paperwork. Non-violent felony records are considered on a case-by-case basis.',
    tags: ['Self-Employed', 'Cash Income OK', 'Flexible Eligibility'],
  },
  {
    icon: Clock,
    label: 'Short-Term & Flexible Stays',
    headline: 'Stay a Week. Stay Six Months. Your Call.',
    body: 'Remodeling your house, going through a divorce, here for a project, or just need a break from your living situation? Our flexible weekly and monthly leases mean you stay exactly as long as you need — nothing more, nothing less.',
    tags: ['Week-to-Week', 'Month-to-Month', 'No Long Leases'],
  },
  {
    icon: Scale,
    label: 'Non-Violent Criminal Records',
    headline: 'A Record Does Not Have to Define Your Housing.',
    body: 'We work with many residents who have non-violent felonies or misdemeanors on their record and have been turned away by traditional landlords. We evaluate each situation individually and give people a fair chance. The only records we cannot work with are violent crimes and sexual offenses — everything else is worth a conversation.',
    tags: ['Non-Violent Felonies Considered', 'Case-by-Case Basis', 'Fresh Start Welcome'],
  },
] as const;

export default function WhoWeHelp() {
  return (
    <section id="who-we-help" className="bg-iron-300 px-6 py-24">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-brand-600 font-mono text-base tracking-[0.3em] uppercase mb-4">
            Our Residents
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-stone-900">
            Who We Help
          </h2>
          <p className="mt-5 text-stone-900 text-base leading-relaxed max-w-xl mx-auto">
            We work with people the traditional rental market often turns away.
            If you need a furnished place to stay in the Phoenix area, chances are we can help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {SEGMENTS.map(({ icon: Icon, label, headline, body, tags }) => (
            <div key={label}
              className="group flex flex-col gap-6 rounded-2xl border border-iron-200 bg-white p-8 hover:border-brand-400 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600 text-white group-hover:bg-brand-700 transition-colors duration-300">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-brand-600 font-semibold">
                  {label}
                </p>
              </div>
              <div>
                <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-stone-900 mb-3">
                  {headline}
                </h3>
                <p className="text-stone-900 text-sm leading-relaxed">{body}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto pt-2">
                {tags.map((tag) => (
                  <span key={tag}
                    className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 font-mono text-xs tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {/* Wide CTA card */}
          <div className="lg:col-span-2 rounded-2xl bg-brand-800 border border-brand-600 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-white mb-2">
                Not Sure If You Qualify?
              </h3>
              <p className="text-brand-100 text-sm leading-relaxed max-w-lg">
                Book a free 15-minute call. We will walk through your situation, answer every question,
                and tell you exactly what we have available. No pressure, no obligation.
              </p>
            </div>
            <BookCallButton
              label="Book a Free Call"
              className="flex-shrink-0 rounded-lg bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-400 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.97] transition-all duration-200"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
