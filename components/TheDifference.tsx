import { ShieldCheck, Sofa, Zap, CalendarCheck } from 'lucide-react';

const CARDS = [
  {
    icon: ShieldCheck,
    title: 'No Credit Check',
    body: 'We never run your credit. Evictions, bad credit, no rental history — none of it disqualifies you here. Everyone deserves a comfortable place to land.',
  },
  {
    icon: Sofa,
    title: 'Fully Furnished',
    body: 'Every apartment comes move-in ready with furniture, bedding, towels, kitchenware, and TVs. Just bring your suitcase.',
  },
  {
    icon: Zap,
    title: 'Utilities Included',
    body: 'Water, electricity, and gas are all included in your weekly rate. No surprise bills, no setup hassle.',
  },
  {
    icon: CalendarCheck,
    title: 'Move In This Week',
    body: 'No lengthy applications or waiting periods. Book a quick call, choose your unit, and move in — often within days.',
  },
] as const;

export default function TheDifference() {
  return (
    <section id="difference" className="bg-white px-6 py-24">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-brand-600 font-mono text-base tracking-[0.3em] uppercase mb-4">
            Why Canyon Apts
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-stone-900">
            A Different Kind of Rental
          </h2>
          <p className="mt-5 text-stone-900 text-base leading-relaxed max-w-xl mx-auto">
            We cut out everything that makes renting hard — credit checks, long leases,
            furniture shopping — and kept everything that matters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CARDS.map(({ icon: Icon, title, body }) => (
            <div key={title}
              className="group flex flex-col gap-5 rounded-2xl border border-stone-200 bg-stone-50 p-7 transition-all duration-300 hover:border-brand-300 hover:bg-white hover:shadow-lg hover:shadow-brand-500/5 hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors duration-300">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl uppercase tracking-wide text-stone-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-stone-900">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
