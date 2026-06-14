import { MapPin } from 'lucide-react';
import Reveal from '@/components/Reveal';
import TiltCard from '@/components/TiltCard';

const LOCATIONS = [
  {
    city: 'Phoenix',
    description: 'Multiple units across the greater Phoenix area, close to major employers, hospitals, and the I-10 and I-17 corridors.',
  },
  {
    city: 'Tempe',
    description: 'Centrally located with quick access to Sky Harbor Airport, ASU, and the Loop 101 and US-60.',
  },
  {
    city: 'Mesa',
    description: 'East Valley locations convenient for Banner Health, Boeing, and the growing Mesa tech corridor.',
  },
  {
    city: 'Gilbert',
    description: 'Family-friendly communities in the heart of the Southeast Valley near Dignity Health and Chandler Regional.',
  },
  {
    city: 'Chandler',
    description: 'Close to Intel, PayPal, and the Price Road Corridor — ideal for corporate and tech assignment workers.',
  },
] as const;

export default function Locations() {
  return (
    <section id="locations" className="bg-stone-50 px-6 py-24">
      <div className="max-w-6xl mx-auto">

        <Reveal className="text-center mb-16">
          <p className="text-brand-600 font-mono text-base tracking-[0.3em] uppercase mb-4">
            Service Area
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-stone-900">
            Where We Operate
          </h2>
          <p className="mt-5 text-stone-900 text-base leading-relaxed max-w-xl mx-auto">
            We maintain furnished units across five Phoenix metro communities.
            New locations are added regularly — ask about current availability on your call.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LOCATIONS.map(({ city, description }, i) => (
            <Reveal key={city} delay={(i % 3) * 80} className="h-full">
              <TiltCard
                className="group h-full flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-7 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-colors duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    <MapPin size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-stone-900">
                    {city}
                  </h3>
                </div>
                <p className="text-stone-900 text-sm leading-relaxed">{description}</p>
              </TiltCard>
            </Reveal>
          ))}

          {/* Coming soon card */}
          <Reveal delay={160} className="rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 p-7 flex flex-col items-center justify-center text-center gap-3">
            <MapPin size={28} strokeWidth={1.5} className="text-stone-400" />
            <p className="font-display font-bold text-xl uppercase tracking-wide text-stone-400">
              More Coming Soon
            </p>
            <p className="text-stone-500 text-sm leading-relaxed">
              We are actively expanding. Ask about new locations on your call.
            </p>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
