const CALENDLY = 'https://calendly.com/canyonaz/apartment-call?month=2026-05';
const INVENTORY = 'https://docs.google.com/document/d/1WzosuTy5dRP1OoL5GROj5aP8jsY132h6Vmd9cVLiccw/edit?pli=1&tab=t.0';

export default function CTABanner() {
  return (
    <section id="contact" className="bg-iron-300 px-6 py-24">
      <div className="max-w-4xl mx-auto text-center">

        <p className="text-brand-600 font-mono text-base tracking-[0.3em] uppercase mb-4">
          Ready to Get Started?
        </p>
        <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-stone-900 leading-tight mb-6">
          A Furnished Home Is<br />
          <span className="text-brand-600">Waiting for You</span>
        </h2>
        <p className="text-stone-900 text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Browse our live inventory to see what is available right now, or book a free
          15-minute call and we will walk you through everything — no pressure, no obligation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer"
            className="btn-pulse inline-flex items-center justify-center rounded-lg bg-brand-600 px-10 py-4 text-base font-semibold text-white uppercase tracking-wide hover:bg-brand-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.97] active:translate-y-0 transition-all duration-200">
            Book a Free 15-Min Call
          </a>
          <a href={INVENTORY} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border-2 border-stone-400 px-10 py-4 text-base font-semibold text-stone-900 uppercase tracking-wide hover:border-brand-500 hover:text-brand-600 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] active:translate-y-0 transition-all duration-200">
            View Inventory & Rates
          </a>
        </div>

        <p className="mt-8 text-stone-600 text-sm">
          No credit check · No long-term lease · Move in this week
        </p>

      </div>
    </section>
  );
}
