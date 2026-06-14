'use client';

import BookCallButton from '@/components/BookCallButton';
import { SITE } from '@/lib/site';
import { trackEvent } from '@/lib/analytics';

/**
 * Standard hero call-to-action pair used across all landing pages, matching the
 * homepage Hero:
 *   1. "Book a Free 15-Min Call" — opens the pre-screening quiz → Calendly.
 *   2. "View Inventory & Rates"  — opens the live Google Doc inventory list.
 *
 * Styled for the dark (stone-900) hero background. Pass `callLabel` to override
 * the primary button text.
 */
export default function HeroCTAButtons({
  callLabel = 'Book a Free 15-Min Call',
}: {
  callLabel?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <BookCallButton
        label={callLabel}
        className="btn-shine inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/40"
      />
      <a
        href={SITE.inventoryUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('view_inventory', { lead_source: 'hero_inventory_button' })}
        className="btn-shine inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:border-brand-500/60 hover:bg-white/5 hover:-translate-y-0.5 transition-all duration-200"
      >
        View Inventory &amp; Rates
      </a>
    </div>
  );
}
