'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckSquare, Square, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// No `?month=` param: it pins the calendar to a fixed month. It was hardcoded to
// 2026-05, which has zero available days now that month is in the past, so anyone
// who got this far landed on an empty calendar and had to click forward to find a
// slot. Without the param Calendly opens on the next month that has availability.
const CALENDLY = 'https://calendly.com/canyonaz/apartment-call';

const ITEMS = [
  {
    id: 'weekly',
    heading: 'This is a weekly rental.',
    text: 'I can stay as many weeks as I need, but the lease renews each week. This is NOT a month-to-month or annual lease.',
  },
  {
    id: 'price',
    heading: 'The $495 rate is per week — not per month.',
    text: 'The starting rate of $495 is charged every week. A 4-week stay would be approximately $1,980, not $495.',
  },
  {
    id: 'credit',
    heading: 'No credit check is required.',
    text: 'Past evictions, low credit scores, non-traditional income, and most background issues do not disqualify me.',
  },
  {
    id: 'faq',
    heading: 'I have read the Frequently Asked Questions.',
    text: 'I have reviewed the FAQ section on this website and am ready to speak with someone about my specific situation.',
  },
] as const;

type Props = {
  label?: string;
  className?: string;
};

export default function BookCallButton({
  label = 'Book a Free 15-Min Call',
  className = '',
}: Props) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const checkedCount = ITEMS.filter((item) => checked[item.id]).length;
  const allChecked = checkedCount === ITEMS.length;

  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleProceed = () => {
    if (!allChecked) return;
    // Strongest conversion signal: user read + checked all 4 items, then clicked Book
    trackEvent('generate_lead', { method: 'calendly', lead_source: 'book_call_button' });
    setOpen(false);
    setChecked({});
    window.open(CALENDLY, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setOpen(false);
    setChecked({});
  };

  // While the modal is up, freeze the page behind it so a touch-drag scrolls the
  // checklist instead of the homepage. Escape closes.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setChecked({});
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // IMPORTANT: this modal must be rendered through a portal into <body>.
  //
  // Rendered inline, it sits inside <div class="hero-rise …">, and .hero-rise runs
  // a `transform` keyframe animation with `forwards` fill. A filling transform
  // animation makes that element the *containing block* for `position: fixed`
  // descendants — so `fixed inset-0` resolved to the hero's 132px-tall CTA row
  // instead of the viewport. The card then centred inside that little box and hung
  // ~200px below the bottom of a phone screen, with the hero's `overflow-hidden`
  // clipping it, so only the first checkbox was reachable. Adding internal
  // scrolling (attempted in 4f5c30f) cannot fix that — internal scroll can't
  // rescue a card that is positioned off-screen. Portalling to <body> takes every
  // ancestor out of the equation.
  const modal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain p-4"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop — `fixed` so it covers the viewport even if the wrapper scrolls */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

            {/* Modal card — flex column with max height so it never overflows */}
            <div
              className="relative z-10 my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90dvh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Sticky header ── */}
              <div className="flex-shrink-0 bg-iron-800 rounded-t-2xl px-6 py-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-brand-500 font-mono text-xs tracking-[0.2em] uppercase mb-0.5">
                    Before You Book
                  </p>
                  <h3 className="font-display font-bold text-xl uppercase tracking-wide text-white leading-tight">
                    Please Confirm You Understand
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="flex-shrink-0 text-iron-400 hover:text-white transition-colors duration-200 mt-0.5"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>

              {/* ── Scrollable checklist ── */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Check each box to confirm you have read and understood the following.
                  All {ITEMS.length} must be checked before you can book your call.
                </p>

                <div className="flex flex-col gap-3">
                  {ITEMS.map(({ id, heading, text }) => (
                    <button
                      key={id}
                      onClick={() => toggle(id)}
                      aria-pressed={!!checked[id]}
                      className="flex items-start gap-3 text-left group"
                    >
                      <span className="flex-shrink-0 mt-0.5">
                        {checked[id] ? (
                          <CheckSquare size={22} strokeWidth={1.5} className="text-brand-600" />
                        ) : (
                          <Square size={22} strokeWidth={1.5} className="text-stone-300 group-hover:text-brand-400 transition-colors duration-200" />
                        )}
                      </span>
                      <span>
                        <span className={`block text-sm font-semibold leading-snug mb-0.5 transition-colors duration-200 ${checked[id] ? 'text-brand-700' : 'text-stone-800'}`}>
                          {heading}
                        </span>
                        <span className="block text-xs leading-relaxed text-stone-500">
                          {text}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Sticky footer with button ── */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-stone-100 bg-white rounded-b-2xl">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-stone-400">
                    {checkedCount} of {ITEMS.length} confirmed
                    {allChecked && <span className="text-brand-600 font-semibold"> — Ready!</span>}
                  </p>
                  <button
                    onClick={handleProceed}
                    disabled={!allChecked}
                    className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white uppercase tracking-wide transition-all duration-200 ${
                      allChecked
                        ? 'bg-brand-600 hover:bg-brand-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/30 active:scale-[0.97]'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    Proceed to Book
                    <ArrowRight size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => {
          setOpen(true);
          trackEvent('booking_modal_open');
        }}
        className={className}
      >
        {label}
      </button>

      {modal}
    </>
  );
}
