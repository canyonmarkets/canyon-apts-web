const CALENDLY = 'https://calendly.com/canyonaz/apartment-call?month=2026-05';
const INVENTORY = 'https://docs.google.com/document/d/1WzosuTy5dRP1OoL5GROj5aP8jsY132h6Vmd9cVLiccw/edit?pli=1&tab=t.0';

export default function Hero() {
  return (
    <section id="home" className="relative bg-iron-900 min-h-screen flex items-center pt-16 overflow-hidden">

      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src="/HeroVideo.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-iron-900/70" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="max-w-3xl">

          <p className="text-brand-500 font-mono text-base tracking-[0.3em] uppercase mb-6">
            Phoenix Metro Area · Starting at $495 / Week
          </p>

          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl uppercase tracking-wide text-white leading-none mb-8">
            Furnished Apartments<br />
            <span className="text-brand-500">No Credit Check</span><br />
            Required
          </h1>

          <p className="text-white text-lg sm:text-xl leading-relaxed max-w-2xl mb-4">
            Fully furnished weekly and monthly rentals across the Phoenix metro.
            Utilities included. Move-in ready. No credit checks, no rental history,
            no long-term commitment.
          </p>

          <p className="text-iron-300 text-base leading-relaxed max-w-xl mb-10">
            Phoenix · Tempe · Mesa · Gilbert · Chandler
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer"
              className="btn-pulse inline-flex items-center justify-center rounded-lg bg-brand-500 px-8 py-4 text-base font-semibold text-white uppercase tracking-wide hover:bg-brand-600 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/40 active:scale-[0.97] active:translate-y-0 transition-all duration-200">
              Book a Free 15-Min Call
            </a>
            <a href={INVENTORY} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-8 py-4 text-base font-semibold text-white uppercase tracking-wide hover:border-brand-500/60 hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97] active:translate-y-0 transition-all duration-200">
              View Inventory & Rates
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
