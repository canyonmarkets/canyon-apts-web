import BookCallButton from '@/components/BookCallButton';
import Reveal from '@/components/Reveal';
import { SITE } from '@/lib/site';

export default function CTABanner() {
  return (
    <section id="contact" className="relative bg-gradient-to-b from-iron-800 to-iron-900 px-6 py-24 overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[52rem] max-w-full rounded-full bg-brand-500/15 blur-3xl" aria-hidden="true" />
      <Reveal className="relative max-w-4xl mx-auto text-center">

        <p className="text-brand-400 font-mono text-base tracking-[0.3em] uppercase mb-4">
          Ready to Get Started?
        </p>
        <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
          A Furnished Home Is<br />
          <span className="text-gradient-animate">Waiting for You</span>
        </h2>
        <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Browse our live inventory to see what is available right now, or book a free
          15-minute call and we will walk you through everything — no pressure, no obligation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <BookCallButton
            label="Book a Free 15-Min Call"
            className="btn-pulse shimmer-sweep relative overflow-hidden inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-10 py-4 text-base font-semibold text-white uppercase tracking-wide shadow-[0_8px_28px_rgba(201,75,12,0.4)] hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(201,75,12,0.6)] active:scale-[0.97] active:translate-y-0 transition-all duration-200"
          />
          <a href={SITE.availabilityPath}
            className="inline-flex items-center justify-center rounded-xl border-2 border-white/25 bg-white/5 backdrop-blur-sm px-10 py-4 text-base font-semibold text-white uppercase tracking-wide hover:border-brand-400/70 hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] active:translate-y-0 transition-all duration-200">
            View Inventory & Rates
          </a>
        </div>

        <p className="mt-8 text-white/50 text-sm">
          No credit check · No long-term lease · Move in this week
        </p>

      </Reveal>
    </section>
  );
}
