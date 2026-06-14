import { Shield, UtensilsCrossed, WashingMachine, Zap, Car, Waves, Sofa, MapPin } from 'lucide-react';
import Reveal from '@/components/Reveal';
import TiltCard from '@/components/TiltCard';

const AMENITIES = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    body: 'All properties are located in gated communities with controlled access. You can rest easy knowing your home is secure.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Fully Equipped Kitchen',
    body: 'Every unit includes pots, pans, utensils, dishes, and everything you need to cook a full meal. No takeout required.',
  },
  {
    icon: WashingMachine,
    title: 'In-Unit Washer & Dryer',
    body: 'Full-size washer and dryer inside every apartment. No laundromat runs, no shared machines, no quarters.',
  },
  {
    icon: Zap,
    title: 'Utilities Included',
    body: 'Water, electricity, and gas are all bundled into your weekly rate. One simple payment covers everything.',
  },
  {
    icon: Car,
    title: 'Free Parking',
    body: 'Dedicated parking is included with every unit — covered or surface depending on the property. No permits, no fees.',
  },
  {
    icon: Waves,
    title: 'Community Amenities',
    body: 'Enjoy resort-style pools, hot tubs, fitness centers, and pet-friendly dog parks at our partner communities.',
  },
  {
    icon: Sofa,
    title: 'Move-In Ready',
    body: 'Furniture, beds, bedding, towels, and TVs are all set up before you arrive. Bring your suitcase — everything else is handled.',
  },
  {
    icon: MapPin,
    title: 'Easy Freeway Access',
    body: 'Every location is within minutes of major Phoenix metro freeways — getting to work, the airport, or anywhere in the valley is a breeze.',
  },
] as const;

export default function Amenities() {
  return (
    <section id="amenities" className="bg-white px-6 py-24">
      <div className="max-w-6xl mx-auto">

        <Reveal className="text-center mb-16">
          <p className="text-brand-600 font-mono text-base tracking-[0.3em] uppercase mb-4">
            Everything Included
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-stone-900">
            What Comes With Every Unit
          </h2>
          <p className="mt-5 text-stone-900 text-base leading-relaxed max-w-xl mx-auto">
            Every Canyon Apts unit is set up so you can walk in and start living immediately —
            no setup, no shopping, no surprises.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AMENITIES.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={(i % 4) * 80} className="h-full">
              <TiltCard
                className="group h-full flex flex-col gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-6 transition-colors duration-300 hover:border-brand-300 hover:bg-white hover:shadow-lg hover:shadow-brand-500/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg uppercase tracking-wide text-stone-900 mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-900">{body}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
