'use client';

import { useState } from 'react';
import { X, CheckSquare, Square, ArrowRight } from 'lucide-react';

const CALENDLY = 'https://calendly.com/canyonaz/apartment-call?month=2026-05';

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
    id: 'utilities',
    heading: 'Utilities are included in my weekly rate.',
    text: 'Water, electricity, gas, and WiFi are all bundled into my weekly payment. There are no separate utility bills.',
  },
  {
    id: 'credit',
    heading: 'No credit check is required.',
    text: 'Past evictions, low credit scores, non-traditional income, and most background issues do not disqualify me.',
  },
  {
    id: 'ready',
    heading: 'I am genuinely interested in housing.',
    text: 'I am ready to have a real conversation about availability and a move-in timeline — not just browsing.',
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
    setOpen(false);
    setChecked({});
    window.open(CALENDLY, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setOpen(false);
    setChecked({});
  };

  return (
    <>
      {/* Trigger button — inherits all classes from parent */}
      <button onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal card */}
          <div
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-iron-800 px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-brand-500 font-mono text-xs tracking-[0.2em] uppercase mb-1">
                  Before You Book
                </p>
                <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-white leading-tight">
                  Please Confirm You Understand
                </h3>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="flex-shrink-0 text-iron-400 hover:text-white transition-colors duration-200 mt-1"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Checklist */}
            <div className="px-6 py-6">
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Check each box to confirm you have read and understood the following.
                All five must be checked before you can book your call.
              </p>

              <div className="flex flex-col gap-5">
                {ITEMS.map(({ id, heading, text }) => (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
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
                      <span className={`block text-xs leading-relaxed transition-colors duration-200 ${checked[id] ? 'text-stone-500' : 'text-stone-500'}`}>
                        {text}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <div className="h-px bg-stone-100 mb-5" />
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-stone-400">
                  {checkedCount} of {ITEMS.length} confirmed
                  {allChecked && <span className="text-brand-600 font-semibold"> — Ready!</span>}
                </p>
                <button
                  onClick={handleProceed}
                  disabled={!allChecked}
                  className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white uppercase tracking-wide transition-all duration-200 ${
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
        </div>
      )}
    </>
  );
}
