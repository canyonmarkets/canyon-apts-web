import BookCallButton from '@/components/BookCallButton';
import Reveal from '@/components/Reveal';
import { SITE } from '@/lib/site';

const STEPS = [
  {
    step: '01',
    title: 'Browse Available Units',
    body: 'Check our live inventory list to see what\'s available right now — unit sizes, locations, and weekly rates. Everything is updated in real time so you always see accurate availability.',
  },
  {
    step: '02',
    title: 'Book a Free 15-Min Call',
    body: 'Pick a time on our calendar and we\'ll walk through your situation, answer your questions, and match you to the right unit. No application, no paperwork — just a conversation.',
  },
  {
    step: '03',
    title: 'Move In — Often Same Day',
    body: 'Once you\'re ready, we handle the paperwork quickly and get your keys in your hand. Many residents are able to move in the same day they call.',
  },
] as const;

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-iron-800 px-6 py-24 overflow-hidden">
      {/* Subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="relative max-w-6xl mx-auto">

        <Reveal className="text-center mb-20">
          <p className="text-brand-500 font-mono text-base tracking-[0.3em] uppercase mb-4">
            The Process
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-white">
            How It Works
          </h2>
          <p className="mt-5 text-white text-base leading-relaxed max-w-lg mx-auto">
            From first look to move-in day — can be done same day.
          </p>
          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {STEPS.map(({ step, title, body }, i) => (
            <Reveal key={step} delay={i * 110}>
              <div className="group h-full rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-10 flex flex-col gap-6 transition-all duration-300 hover:ring-brand-500/40 hover:bg-white/[0.07] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(201,75,12,0.15)]">
                <span className="font-mono text-7xl font-bold leading-none text-brand-500/20 select-none transition-all duration-300 group-hover:text-brand-500/70 group-hover:-translate-y-1">
                  {step}
                </span>
                <div className="transition-transform duration-300 group-hover:translate-x-1">
                  <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-white mb-3">
                    {title}
                  </h3>
                  <p className="text-white text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={SITE.availabilityPath}
            className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white uppercase tracking-wide hover:border-brand-500/60 hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] transition-all duration-200">
            View Inventory & Rates
          </a>
          <BookCallButton
            label="Book a Free 15-Min Call"
            className="shimmer-sweep relative overflow-hidden inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3.5 text-sm font-semibold text-white uppercase tracking-wide shadow-[0_6px_24px_rgba(201,75,12,0.3)] hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(201,75,12,0.5)] active:scale-[0.97] transition-all duration-200"
          />
        </div>

      </div>
    </section>
  );
}
