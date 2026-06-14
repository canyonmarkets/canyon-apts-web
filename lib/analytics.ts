/**
 * GA4 event helper. Safe to call anywhere — no-ops if gtag is not loaded
 * (e.g. env var not set, ad blocker, or server-side render).
 *
 * Add NEXT_PUBLIC_GA_ID to Netlify environment variables (format: G-XXXXXXXXXX).
 * After setting the var, trigger a new Netlify deploy — the script is embedded
 * at build time.
 */

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

type EventParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params ?? {});
}
