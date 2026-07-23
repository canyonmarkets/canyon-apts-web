'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Mail, PhoneCall, ArrowRight } from 'lucide-react';

export default function ConfirmedContent() {
  const searchParams = useSearchParams();
  const isWaitlist = searchParams.get('waitlist') === '1';

  const steps = isWaitlist
    ? [
        {
          icon: Clock,
          title: 'What happens next?',
          text: "Our inventory changes weekly. The moment something matching your preferences opens up, you'll hear from us — usually with photos and the weekly rate.",
        },
        {
          icon: Mail,
          title: 'Watch your inbox',
          text: 'Our emails come from canyon-advisors.com. Add us to your contacts so nothing lands in spam.',
        },
      ]
    : [
        {
          icon: PhoneCall,
          title: 'We call you',
          text: "At your scheduled time, our team calls the number you provided. Make sure you're available — the call is quick.",
        },
        {
          icon: Mail,
          title: 'Check your email',
          text: 'A confirmation with a calendar invite just went out. Add it to your calendar so the call doesn’t sneak up on you.',
        },
        {
          icon: Clock,
          title: '15 minutes, no pressure',
          text: "We'll answer your questions, confirm the fit, and if it's right — photos of your unit follow the same day.",
        },
      ];

  return (
    <div className="min-h-screen bg-iron-900 px-3 py-6 sm:px-5 sm:py-12">
      <div className="mx-auto max-w-lg overflow-hidden rounded-3xl bg-[#161d2b] ring-1 ring-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-8 pt-10 pb-9 text-center relative overflow-hidden">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40 shadow-[0_0_40px_rgba(255,255,255,0.25)]">
            <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-brand-100 mb-2">
            {isWaitlist ? 'Waitlist confirmed' : 'Booking confirmed'}
          </p>
          <h1 className="font-display text-3xl uppercase tracking-wide text-white leading-tight">
            {isWaitlist ? "You're on the list!" : "You're booked!"}
          </h1>
          <p className="mt-3 text-sm text-brand-100">
            {isWaitlist
              ? "We'll reach out the moment something opens up."
              : 'Check your email for the calendar invite.'}
          </p>
        </div>

        {/* Steps */}
        <div className="px-7 py-7 space-y-5">
          {steps.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-500/30">
                <Icon size={16} className="text-brand-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">{text}</p>
              </div>
            </div>
          ))}

          {/* Browse while you wait */}
          <Link
            href="/available-now?utm_source=confirmed"
            className="relative overflow-hidden mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-sm font-bold text-white shadow-[0_8px_28px_rgba(201,75,12,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(201,75,12,0.5)] shimmer-sweep"
          >
            {isWaitlist ? 'See what is available right now' : 'Browse the units while you wait'} <ArrowRight size={16} />
          </Link>
          <Link href="/" className="block text-center text-xs text-white/40 hover:text-white/70 transition-colors">
            Back to Canyon Apartments
          </Link>
        </div>
      </div>
    </div>
  );
}
