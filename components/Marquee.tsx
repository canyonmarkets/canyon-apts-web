const ITEMS = [
  'No Credit Check',
  'Utilities Included',
  'Fully Furnished',
  'Move In This Week',
  'Weekly & Monthly',
  'Pet-Friendly Options',
  'Evictions OK',
  'In-Unit Laundry',
  'Free Parking',
  'Phoenix Metro',
] as const;

/**
 * Infinite scrolling band of value props. The list is rendered twice so the
 * CSS translateX(-50%) loop is seamless. Pauses for reduced-motion users.
 */
export default function Marquee() {
  return (
    <div className="marquee-mask bg-brand-700 py-4 overflow-hidden border-y border-brand-600/40">
      <div className="marquee-track">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
            {ITEMS.map((item) => (
              <span key={item} className="flex items-center">
                <span className="font-display font-bold text-base sm:text-lg uppercase tracking-widest text-white/90 px-6">
                  {item}
                </span>
                <span className="text-brand-300 text-xl select-none">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
