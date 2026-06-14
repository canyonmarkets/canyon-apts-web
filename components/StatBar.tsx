import CountUp from '@/components/CountUp';
import Reveal from '@/components/Reveal';

/*
 * Real, defensible credibility numbers (per Jeff): Canyon started as an Airbnb
 * operation in 2017 with several thousand stays pre-COVID, then pivoted to the
 * corporate-housing model — ~4–5k bookings total. 4,000+ is deliberately
 * conservative. These also feed the trust signals + schema.
 */
type Stat = { end: number; label: string; suffix?: string; prefix?: string };

const STATS: Stat[] = [
  { end: 4000, suffix: '+', label: 'Guests Hosted' },
  { end: 9, suffix: '+', label: 'Years in Business' },
  { end: 5, label: 'Cities Served' },
  { end: 495, prefix: '$', label: 'Starting Weekly Rate' },
];

export default function StatBar() {
  return (
    <section className="bg-iron-900 border-y border-white/10 px-6 py-14">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map(({ end, suffix, prefix, label }, i) => (
          <Reveal key={label} delay={i * 90} className="text-center">
            <p className="font-display font-bold text-4xl sm:text-5xl text-brand-500 tracking-wide">
              <CountUp end={end} suffix={suffix} prefix={prefix} />
            </p>
            <p className="mt-2 font-mono text-xs sm:text-sm tracking-[0.2em] uppercase text-iron-300">
              {label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
