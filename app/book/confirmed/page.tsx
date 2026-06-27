'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Phone, Mail } from 'lucide-react';

export default function BookConfirmedPage() {
  const searchParams = useSearchParams();
  const isWaitlist = searchParams.get('waitlist') === '1';

  return (
    <div className="min-h-screen bg-iron-100 flex flex-col">
      {/* Header */}
      <header className="bg-iron-900 px-5">
        <div className="max-w-xl mx-auto h-16 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Canyon%20PNG.png" alt="Canyon Apartments" className="h-10 w-auto" />
          <p className="font-display text-base font-bold uppercase tracking-widest text-white">
            Canyon Apartments
          </p>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full px-4 py-10 flex flex-col gap-6">
        {/* Success card */}
        <div className="bg-white rounded-2xl shadow-sm border border-iron-100 overflow-hidden text-center">
          <div className="bg-brand-600 px-6 py-8">
            <CheckCircle size={48} className="text-white mx-auto mb-3" strokeWidth={1.5} />
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
              {isWaitlist ? "You're on the waitlist!" : "You're booked!"}
            </h1>
            <p className="text-brand-100 text-sm mt-2">
              {isWaitlist
                ? "We'll reach out as soon as something becomes available."
                : 'Check your email for a calendar invite.'}
            </p>
          </div>

          <div className="px-6 py-6 space-y-4">
            {!isWaitlist && (
              <>
                <div className="flex items-start gap-3 text-left">
                  <Phone size={18} className="text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-iron-800 text-sm">We call you</p>
                    <p className="text-iron-500 text-xs leading-relaxed">
                      At your scheduled time, our team will call the number you provided. Make sure you're available!
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <Mail size={18} className="text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-iron-800 text-sm">Check your email</p>
                    <p className="text-iron-500 text-xs leading-relaxed">
                      A confirmation with a .ics calendar invite was sent to your email. Add it to your calendar so you don't forget.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-left">
                  <Clock size={18} className="text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-iron-800 text-sm">15 minutes, no pressure</p>
                    <p className="text-iron-500 text-xs leading-relaxed">
                      Our calls are short and straightforward. We'll answer your questions and see if we have a good fit.
                    </p>
                  </div>
                </div>
              </>
            )}

            {isWaitlist && (
              <div className="flex items-start gap-3 text-left">
                <Clock size={18} className="text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-iron-800 text-sm">What happens next?</p>
                  <p className="text-iron-500 text-xs leading-relaxed">
                    Our inventory changes weekly. We'll contact you as soon as something matching your preferences becomes available.
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-iron-100">
              <p className="text-iron-500 text-xs mb-3">Questions? Reach us directly:</p>
              <a
                href="tel:+16232307020"
                className="inline-flex items-center gap-2 rounded-xl bg-iron-100 px-4 py-2.5 text-sm font-semibold text-iron-800 hover:bg-iron-200 transition-colors"
              >
                <Phone size={14} /> (623) 230-7020
              </a>
            </div>
          </div>
        </div>

        {/* Back to site */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-iron-500 hover:text-iron-700 underline underline-offset-4"
          >
            Back to Canyon Apartments
          </Link>
        </div>
      </main>
    </div>
  );
}
