'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Do you really not run a credit check?',
    a: 'Correct — we do not run credit checks of any kind. No hard pull, no soft pull. Past evictions, bankruptcies, or low credit scores will not disqualify you. We look at your ability to pay the weekly or monthly rate going forward.',
  },
  {
    q: 'How much does it cost? What is included?',
    a: 'Rates start at $495 per week for studio units. The rate includes the furnished apartment, all utilities (water, electric, gas), and parking. There are no hidden fees or add-ons — what we quote is what you pay.',
  },
  {
    q: 'How long can I stay?',
    a: 'As long as you need. We offer week-to-week and month-to-month arrangements. There is no minimum or maximum stay requirement. Some residents stay a week during a home renovation; others have been with us for over a year.',
  },
  {
    q: 'How quickly can I move in?',
    a: 'Many residents are able to move in within 2 to 3 days of their first call. Once you book a call, we will walk through availability and can usually get paperwork done and keys handed over very quickly.',
  },
  {
    q: 'What does "fully furnished" mean exactly?',
    a: 'Every unit comes with a bed and bedding, living room furniture, a fully equipped kitchen (dishes, pots, pans, utensils), towels, and at least one TV. You literally just need your clothes and personal items.',
  },
  {
    q: 'Do you accept felony records?',
    a: 'We consider non-violent felony records on a case-by-case basis. The best thing to do is book a 15-minute call and have an honest conversation with us. We work with a wide range of situations that traditional landlords turn away.',
  },
  {
    q: 'Are pets allowed?',
    a: 'Pet policies vary by property. Some of our communities are pet-friendly. Mention this on your call and we will match you with a pet-friendly unit if available.',
  },
  {
    q: 'What areas do you serve?',
    a: 'We currently have units in Phoenix, Tempe, Mesa, Gilbert, and Chandler. We are actively adding new locations — ask about upcoming availability when you call.',
  },
] as const;

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-iron-800 px-6 py-24">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-brand-500 font-mono text-base tracking-[0.3em] uppercase mb-4">
            FAQ
          </p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl uppercase tracking-wide text-white">
            Common Questions
          </h2>
          <p className="mt-5 text-white text-base leading-relaxed max-w-lg mx-auto">
            Still wondering about something? Book a free call and ask us directly.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map(({ q, a }, i) => (
            <div key={i}
              className="rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-200">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors duration-200">
                <span className="font-display font-bold text-lg uppercase tracking-wide text-white leading-snug">
                  {q}
                </span>
                <ChevronDown
                  size={20} strokeWidth={2}
                  className={`flex-shrink-0 text-brand-500 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-96' : 'max-h-0'}`}>
                <p className="px-6 pb-6 text-white text-sm leading-relaxed">{a}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
