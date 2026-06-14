type DividerProps = {
  /** Tailwind bg class of the section ABOVE (the band's background). */
  fromClass: string;
  /** Tailwind text-color class of the section BELOW (fills the shape). */
  toClass: string;
  variant?: 'angle' | 'wave';
  flip?: boolean;
};

/**
 * A full-width shaped transition placed between two stacked sections.
 * The container paints the upper section's color; the SVG shape paints the
 * lower section's color (via fill-current + toClass), creating a clean slope
 * or wave seam between them.
 */
export default function SectionDivider({
  fromClass,
  toClass,
  variant = 'angle',
  flip = false,
}: DividerProps) {
  const path =
    variant === 'wave'
      ? 'M0,40 C300,90 600,0 900,40 C1050,60 1150,30 1200,40 L1200,80 L0,80 Z'
      : flip
        ? 'M0,0 L1200,80 L0,80 Z'
        : 'M0,80 L1200,0 L1200,80 Z';

  return (
    <div className={`relative leading-[0] ${fromClass}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 80"
        preserveAspectRatio="none"
        className={`block w-full h-10 sm:h-16 ${toClass}`}
      >
        <path d={path} fill="currentColor" />
      </svg>
    </div>
  );
}
