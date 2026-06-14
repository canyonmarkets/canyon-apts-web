'use client';

import { useEffect, useRef, useState } from 'react';

type CountUpProps = {
  end: number;
  /** Text appended after the number, e.g. "+" or "k". */
  suffix?: string;
  /** Text shown before the number, e.g. "$". */
  prefix?: string;
  durationMs?: number;
};

/**
 * Counts from 0 up to `end` the first time it scrolls into view.
 * Uses requestAnimationFrame with an ease-out curve. Respects
 * prefers-reduced-motion by snapping straight to the final value.
 */
export default function CountUp({
  end,
  suffix = '',
  prefix = '',
  durationMs = 1800,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return;
          started.current = true;
          observer.unobserve(entry.target);

          if (reduced) {
            setValue(end);
            return;
          }

          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setValue(Math.round(eased * end));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, durationMs]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
