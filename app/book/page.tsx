'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckSquare, Square, ArrowRight, X, ChevronLeft, Clock, Calendar } from 'lucide-react';
import { SCREENING_ITEMS, type LeadSource } from '@/lib/booking';
import { CITIES } from '@/lib/cities';
import type { Slot } from '@/lib/availability';

// ── Shared style tokens (match app/leads/page.tsx) ───────────────────────────
const inputCls =
  'w-full rounded-xl border border-iron-200 bg-white px-4 py-3 text-base text-iron-900 ' +
  'placeholder:text-iron-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ' +
  'focus:border-transparent transition-all duration-150';
const labelCls = 'block text-sm font-medium text-iron-700 mb-1.5';
const chevron = (
  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-iron-400">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5;
type GatingPopup = 'city' | 'bedrooms' | 'date' | null;

interface FormData {
  name: string;
  phone: string;
  email: string;
  party_size: string;
  desired_city: string;
  bedrooms: '1' | '2';
  move_in_date: string;
  heard_about: string;
}

// ── Lead source capture ───────────────────────────────────────────────────────
function deriveLeadSource(utmSource: string, referrer: string): LeadSource {
  const u = utmSource.toLowerCase();
  const r = referrer.toLowerCase();
  if (u.includes('facebook') || u.includes('fb') || r.includes('facebook')) return 'facebook';
  if (u.includes('craigslist') || r.includes('craigslist')) return 'craigslist';
  return 'organic';
}

// ── Stepper header ────────────────────────────────────────────────────────────
const STEPS = ['Confirm', 'Your Info', 'Availability', 'Pick a Time', 'Review'];

function StepHeader({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-iron-100">
      {STEPS.map((label, i) => {
        const s = (i + 1) as Step;
        const active = s === step;
        const done = s < step;
        return (
          <div key={s} className="flex flex-col items-center gap-0.5 flex-1">
            <div className={[
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all',
              active ? 'bg-brand-600 text-white' : done ? 'bg-brand-100 text-brand-700' : 'bg-iron-100 text-iron-400',
            ].join(' ')}>
              {done ? '✓' : s}
            </div>
            <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-brand-600' : 'text-iron-400'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Gating popup ──────────────────────────────────────────────────────────────
function GatingModal({
  type, city, bedrooms, onBook, onWaitlist, onClose,
}: {
  type: GatingPopup;
  city: string;
  bedrooms: string;
  onBook: () => void;
  onWaitlist: (reason: string) => void;
  onClose: () => void;
}) {
  if (!type) return null;
  const cityName = CITIES.find(c => c.slug === city)?.name ?? city;

  const content = {
    city: {
      title: `No availability in ${cityName}`,
      body: `We don't currently have anything available in ${cityName}. You're welcome to still book a call — we may have something soon — or join the waitlist and we'll reach out the moment something opens up.`,
      waitlistReason: 'city_unavailable',
      waitlistLabel: `Join ${cityName} waitlist`,
    },
    bedrooms: {
      title: `No ${bedrooms}BR units available`,
      body: `We have units in your city but no ${bedrooms}-bedroom options right now. You can still book a call to discuss your options, or join our ${bedrooms}BR waitlist.`,
      waitlistReason: 'beds_unavailable',
      waitlistLabel: `Join ${bedrooms}BR waitlist`,
    },
    date: {
      title: 'Move-in date is far out',
      body: "Our inventory changes every week — we don't know what we'll have a month or more from now. We recommend booking a call now to get on our radar, or we can add you to our waitlist and reach out closer to your date.",
      waitlistReason: 'date_too_far',
      waitlistLabel: 'Notify me closer to my date',
    },
  }[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-iron-800 rounded-t-2xl px-6 py-4 flex items-start justify-between gap-4">
          <h3 className="font-display font-bold text-lg uppercase tracking-wide text-white leading-tight">
            {content.title}
          </h3>
          <button onClick={onClose} className="text-iron-400 hover:text-white mt-0.5 shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-iron-600 text-sm leading-relaxed mb-5">{content.body}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onBook}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              Still book the call
            </button>
            <button
              onClick={() => onWaitlist(content.waitlistReason)}
              className="w-full rounded-xl border-2 border-iron-200 py-3 text-sm font-medium text-iron-700 hover:border-brand-300 hover:text-brand-700 transition-colors"
            >
              {content.waitlistLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Lead source (captured on mount)
  const [leadSource, setLeadSource] = useState<LeadSource>('organic');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [referrer, setReferrer] = useState('');

  useEffect(() => {
    const us = searchParams.get('utm_source') ?? '';
    const um = searchParams.get('utm_medium') ?? '';
    const uc = searchParams.get('utm_campaign') ?? '';
    const ref = typeof document !== 'undefined' ? document.referrer : '';
    setUtmSource(us);
    setUtmMedium(um);
    setUtmCampaign(uc);
    setReferrer(ref);
    setLeadSource(deriveLeadSource(us, ref));
  }, [searchParams]);

  // Step state
  const [step, setStep] = useState<Step>(1);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  // Form data
  const [form, setForm] = useState<FormData>({
    name: '', phone: '', email: '', party_size: '1',
    desired_city: 'phoenix', bedrooms: '1', move_in_date: '', heard_about: '',
  });

  // Gating
  const [gatingPopup, setGatingPopup] = useState<GatingPopup>(null);

  // Slots
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [slotTaken, setSlotTaken] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Step 1: acknowledgements ──────────────────────────────────────────────
  const allChecked = SCREENING_ITEMS.every(item => checked[item.id]);

  // ── Load slots ─────────────────────────────────────────────────────────────
  const loadSlots = useCallback(async () => {
    setSlotsLoading(true);
    try {
      const res = await fetch('/api/book/availability');
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  // ── Step 3: inventory / gating check (triggered by useEffect when step=3) ──
  useEffect(() => {
    if (step !== 3) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await fetch(
          `/api/book/inventory-check?city=${form.desired_city}&bedrooms=${form.bedrooms}`,
        );
        const data = await res.json();
        if (cancelled) return;

        // Move-in date check (>4 weeks out)
        if (form.move_in_date) {
          const moveIn = new Date(form.move_in_date);
          const weeksOut = (moveIn.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000);
          if (weeksOut > 4) {
            setGatingPopup('date');
            return;
          }
        }

        if (!data.cityHasUnits) {
          setGatingPopup('city');
          return;
        }
        if (!data.bedroomsHasUnits) {
          setGatingPopup('bedrooms');
          return;
        }

        // All clear — load slots and advance
        loadSlots();
        setStep(4);
      } catch {
        if (!cancelled) {
          loadSlots();
          setStep(4);
        }
      }
    };

    run();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Waitlist ───────────────────────────────────────────────────────────────
  const joinWaitlist = async (reason: string) => {
    setGatingPopup(null);
    await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name, phone: form.phone, email: form.email,
        desired_city: form.desired_city, bedrooms: Number(form.bedrooms),
        reason, lead_source: leadSource,
      }),
    }).catch(() => {});
    router.push('/book/confirmed?waitlist=1');
  };

  // ── Submit booking ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSlotTaken(false);
    setSubmitError('');

    try {
      const res = await fetch('/api/book/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          bedrooms: Number(form.bedrooms),
          party_size: Number(form.party_size),
          lead_source: leadSource,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          referrer,
          screening_answers: Object.fromEntries(
            SCREENING_ITEMS.map(i => [i.id, !!checked[i.id]]),
          ),
          slot_start: selectedSlot.startISO,
          slot_end: selectedSlot.endISO,
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.error === 'slot_taken') {
        setSlotTaken(true);
        setSelectedSlot(null);
        await loadSlots();
        setStep(4);
        return;
      }

      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      router.push('/book/confirmed');
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Group slots by day ─────────────────────────────────────────────────────
  const slotsByDay = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = new Date(slot.startISO).toLocaleDateString('en-US', {
      timeZone: 'America/Phoenix', weekday: 'long', month: 'long', day: 'numeric',
    });
    (acc[day] ??= []).push(slot);
    return acc;
  }, {});

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-iron-100">
      {/* Gating popup */}
      <GatingModal
        type={gatingPopup}
        city={form.desired_city}
        bedrooms={form.bedrooms}
        onBook={() => { setGatingPopup(null); loadSlots(); setStep(4); }}
        onWaitlist={joinWaitlist}
        onClose={() => { setGatingPopup(null); loadSlots(); setStep(4); }}
      />

      {/* Page header */}
      <header className="bg-iron-900 px-5">
        <div className="max-w-xl mx-auto h-16 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Canyon%20PNG.png" alt="Canyon Apartments" className="h-10 w-auto" />
          <div className="leading-none">
            <p className="font-display text-base font-bold uppercase tracking-widest text-white">
              Book a Call
            </p>
            <p className="text-[11px] text-iron-400 mt-0.5">Free 15-minute call · No pressure</p>
          </div>
        </div>
      </header>

      <StepHeader step={step} />

      <main className="max-w-xl mx-auto px-4 py-6">

        {/* ── STEP 1: Acknowledge ───────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-iron-100 overflow-hidden">
              <div className="px-6 pt-6 pb-4 border-b border-iron-100">
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-brand-500 mb-1">Before You Book</p>
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">
                  Please Confirm You Understand
                </h2>
                <p className="text-iron-500 text-sm mt-2 leading-relaxed">
                  Check each box to confirm. All {SCREENING_ITEMS.length} must be checked to continue.
                </p>
              </div>
              <div className="px-6 py-4 flex flex-col gap-3">
                {SCREENING_ITEMS.map(({ id, heading, text }) => (
                  <button
                    key={id}
                    onClick={() => setChecked(prev => ({ ...prev, [id]: !prev[id] }))}
                    className="flex items-start gap-3 text-left group"
                  >
                    <span className="shrink-0 mt-0.5">
                      {checked[id]
                        ? <CheckSquare size={22} strokeWidth={1.5} className="text-brand-600" />
                        : <Square size={22} strokeWidth={1.5} className="text-iron-300 group-hover:text-brand-400 transition-colors" />
                      }
                    </span>
                    <span>
                      <span className={`block text-sm font-semibold leading-snug mb-0.5 transition-colors ${checked[id] ? 'text-brand-700' : 'text-iron-800'}`}>
                        {heading}
                      </span>
                      <span className="block text-xs text-iron-500 leading-relaxed">{text}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="px-6 pb-6 pt-2 border-t border-iron-100 flex items-center justify-between gap-4">
                <p className="text-xs text-iron-400">
                  {SCREENING_ITEMS.filter(i => checked[i.id]).length} of {SCREENING_ITEMS.length} confirmed
                  {allChecked && <span className="text-brand-600 font-semibold"> — Ready!</span>}
                </p>
                <button
                  onClick={() => setStep(2)}
                  disabled={!allChecked}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all ${allChecked ? 'bg-brand-600 hover:bg-brand-700' : 'bg-iron-200 text-iron-400 cursor-not-allowed'}`}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Application form ──────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-iron-500 hover:text-iron-700 mb-4">
              <ChevronLeft size={16} /> Back
            </button>
            <div className="bg-white rounded-2xl shadow-sm border border-iron-100 p-6 space-y-4">
              <h2 className="font-display text-lg font-bold uppercase tracking-wide text-iron-900">Your Information</h2>

              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" required placeholder="First and last name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Phone Number</label>
                <input type="tel" required placeholder="(602) 555-1234" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" required placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>People Staying</label>
                  <div className="relative">
                    <select value={form.party_size} onChange={e => setForm(f => ({ ...f, party_size: e.target.value }))} className={`${inputCls} appearance-none pr-8`}>
                      {['1','2','3','4','5','6+'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    {chevron}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Bedrooms</label>
                  <div className="relative">
                    <select value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value as '1'|'2' }))} className={`${inputCls} appearance-none pr-8`}>
                      <option value="1">1 Bedroom</option>
                      <option value="2">2 Bedrooms</option>
                    </select>
                    {chevron}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Preferred City</label>
                <div className="relative">
                  <select value={form.desired_city} onChange={e => setForm(f => ({ ...f, desired_city: e.target.value }))} className={`${inputCls} appearance-none pr-8`}>
                    {CITIES.map(c => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}{c.comingSoon ? ' (Coming Soon)' : ''}
                      </option>
                    ))}
                  </select>
                  {chevron}
                </div>
              </div>

              <div>
                <label className={labelCls}>Desired Move-In Date <span className="text-iron-400 font-normal">(optional)</span></label>
                <input type="date" value={form.move_in_date}
                  onChange={e => setForm(f => ({ ...f, move_in_date: e.target.value }))} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>How did you hear about us? <span className="text-iron-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <select value={form.heard_about} onChange={e => setForm(f => ({ ...f, heard_about: e.target.value }))} className={`${inputCls} appearance-none pr-8`}>
                    <option value="">Select one…</option>
                    <option value="facebook">Facebook Marketplace</option>
                    <option value="craigslist">Craigslist</option>
                    <option value="google">Google search</option>
                    <option value="referral">Friend / referral</option>
                    <option value="other">Other</option>
                  </select>
                  {chevron}
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!form.name.trim() || !form.phone.trim() || !form.email.trim()}
                className={`w-full rounded-xl py-4 text-sm font-semibold text-white transition-all inline-flex items-center justify-center gap-2 ${form.name.trim() && form.phone.trim() && form.email.trim() ? 'bg-brand-600 hover:bg-brand-700' : 'bg-iron-200 text-iron-400 cursor-not-allowed'}`}
              >
                Check Availability <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Checking availability (brief transition state) ─────────── */}
        {step === 3 && !gatingPopup && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-iron-500 text-sm">Checking availability…</p>
          </div>
        )}

        {/* ── STEP 4: Pick a time ───────────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-sm text-iron-500 hover:text-iron-700 mb-4">
              <ChevronLeft size={16} /> Back
            </button>

            {slotTaken && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">
                That time was just taken by someone else. Please pick another slot.
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-iron-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-iron-100">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-iron-900">Pick a Time</h2>
                <p className="text-iron-500 text-xs mt-1 flex items-center gap-1">
                  <Clock size={12} /> All times in MST · Phoenix, Arizona
                </p>
              </div>

              {slotsLoading && (
                <div className="flex items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                  <p className="text-iron-500 text-sm">Loading available times…</p>
                </div>
              )}

              {!slotsLoading && slots.length === 0 && (
                <div className="flex flex-col items-center py-16 px-6 text-center gap-3">
                  <Calendar size={36} className="text-iron-300" />
                  <p className="text-iron-500 font-medium text-sm">No available times in the next 2 weeks.</p>
                  <p className="text-iron-400 text-xs">Call us directly at <a href="tel:+16232307020" className="text-brand-500 font-medium">(623) 230-7020</a></p>
                </div>
              )}

              {!slotsLoading && slots.length > 0 && (
                <div className="divide-y divide-iron-100">
                  {Object.entries(slotsByDay).map(([day, daySlots]) => (
                    <div key={day} className="px-6 py-4">
                      <p className="text-xs font-semibold text-iron-500 uppercase tracking-wider mb-3">{day}</p>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map(slot => {
                          const timeOnly = new Date(slot.startISO).toLocaleString('en-US', {
                            timeZone: 'America/Phoenix', hour: 'numeric', minute: '2-digit',
                          });
                          const isSelected = selectedSlot?.startISO === slot.startISO;
                          return (
                            <button
                              key={slot.startISO}
                              onClick={() => setSelectedSlot(slot)}
                              className={[
                                'rounded-lg px-4 py-2 text-sm font-medium border transition-all',
                                isSelected
                                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                  : 'bg-white text-iron-700 border-iron-200 hover:border-brand-400 hover:text-brand-700',
                              ].join(' ')}
                            >
                              {timeOnly}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedSlot && (
              <button
                onClick={() => setStep(5)}
                className="mt-4 w-full rounded-xl bg-brand-600 py-4 text-sm font-semibold text-white hover:bg-brand-700 transition-all inline-flex items-center justify-center gap-2"
              >
                Review & Confirm <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* ── STEP 5: Review & confirm ──────────────────────────────────────── */}
        {step === 5 && selectedSlot && (
          <div>
            <button onClick={() => setStep(4)} className="flex items-center gap-1.5 text-sm text-iron-500 hover:text-iron-700 mb-4">
              <ChevronLeft size={16} /> Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-iron-100 overflow-hidden mb-4">
              <div className="bg-iron-800 px-6 py-4">
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-brand-500 mb-1">Your Booking</p>
                <p className="text-white font-bold text-xl">{selectedSlot.label}</p>
                <p className="text-iron-400 text-xs mt-1">MST · Phoenix, Arizona</p>
              </div>
              <div className="px-6 py-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-iron-500">Name</span>
                  <span className="text-iron-900 font-medium">{form.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-iron-500">Phone</span>
                  <span className="text-iron-900 font-medium">{form.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-iron-500">Email</span>
                  <span className="text-iron-900 font-medium">{form.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-iron-500">Looking for</span>
                  <span className="text-iron-900 font-medium">{form.bedrooms}BR in {CITIES.find(c=>c.slug===form.desired_city)?.name}</span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                {submitError}
              </div>
            )}

            <p className="text-iron-500 text-xs text-center mb-3 leading-relaxed">
              We'll call you at <strong>{form.phone}</strong>. A calendar invite will be emailed to {form.email}.
            </p>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-xl bg-brand-600 py-4 text-base font-semibold text-white hover:bg-brand-700 active:scale-[0.98] transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {submitting ? 'Booking…' : 'Book My Call'}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
