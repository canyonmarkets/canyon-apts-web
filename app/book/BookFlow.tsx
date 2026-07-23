'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, ChevronLeft, ArrowRight, Clock, Calendar } from 'lucide-react';
import { SCREENING_ITEMS, type LeadSource } from '@/lib/booking';
import { CITIES } from '@/lib/cities';
import type { Slot } from '@/lib/availability';

// ── Shared style tokens (dark "Immersive" theme) ─────────────────────────────
const inputCls =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white ' +
  'placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-400 ' +
  'focus:border-transparent focus:bg-white/10 transition-all duration-150';
const labelCls = 'block text-xs font-semibold text-white/55 mb-1.5 tracking-wide';
const chevron = (
  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
);

// ── Photo panel content ───────────────────────────────────────────────────────
const PHOTOS = [
  { src: '/apt-12.webp', alt: 'Furnished Canyon Apartments living room' },
  { src: '/apt-03.webp', alt: 'Furnished Canyon Apartments bedroom with king bed' },
  { src: '/apt-16.webp', alt: 'Canyon Apartments kitchen and dining area' },
  { src: '/apt-19.webp', alt: 'Canyon Apartments furnished interior' },
];
const CAPTIONS = [
  {
    tag: 'Fully furnished · Move-in ready',
    big: 'Your next place is waiting',
    sm: 'King beds, in-unit laundry, pool & gym, covered parking.',
  },
  {
    tag: 'No credit check · Weekly terms',
    big: 'Move in this week',
    sm: '4,000+ guests hosted since 2017 across 5 Valley cities.',
  },
  {
    tag: 'Live availability',
    big: 'When should we call you?',
    sm: 'A free 15-minute call — we call you, no pressure.',
  },
  {
    tag: "You're almost there",
    big: "We'll call you",
    sm: 'A 15-minute call — then photos of your matched unit.',
  },
];

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
  pets: string;
  heard_about: string;
  sms_opt_in: boolean;
}

// ── Lead source capture ───────────────────────────────────────────────────────
function deriveLeadSource(utmSource: string, referrer: string): LeadSource {
  const u = utmSource.toLowerCase();
  const r = referrer.toLowerCase();
  if (u.includes('facebook') || u.includes('fb') || r.includes('facebook')) return 'facebook';
  if (u.includes('craigslist') || r.includes('craigslist')) return 'craigslist';
  return 'organic';
}

// Map the 5 internal steps onto 4 visual progress segments (3 = checking, folds into 3).
function segOf(step: Step): number {
  if (step <= 2) return step;
  if (step <= 4) return 3;
  return 4;
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
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-md rounded-2xl bg-[#1b2436] ring-1 ring-white/10 shadow-2xl step-rise"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-t-2xl px-6 py-4 flex items-start justify-between gap-4">
          <h3 className="font-display font-bold text-lg uppercase tracking-wide text-white leading-tight">
            {content.title}
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white mt-0.5 shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-white/65 text-sm leading-relaxed mb-5">{content.body}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onBook}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
            >
              Still book the call
            </button>
            <button
              onClick={() => onWaitlist(content.waitlistReason)}
              className="w-full rounded-xl border-2 border-white/15 py-3 text-sm font-medium text-white/80 hover:border-brand-400 hover:text-white transition-colors"
            >
              {content.waitlistLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Photo panel ───────────────────────────────────────────────────────────────
function PhotoPanel({ seg }: { seg: number }) {
  const cap = CAPTIONS[Math.min(seg, 4) - 1];
  return (
    <div className="relative overflow-hidden h-60 sm:h-72 lg:h-auto lg:min-h-full">
      {PHOTOS.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.src}
          src={p.src}
          alt={p.alt}
          className={`book-photo absolute inset-0 h-full w-full object-cover ${i === (seg - 1) % PHOTOS.length ? 'show' : ''}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-iron-900/10 via-transparent to-iron-900/90" />
      <div className="absolute top-5 left-6 right-6 z-10 flex flex-wrap gap-2">
        <span className="rounded-full bg-iron-900/55 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11.5px] font-semibold text-white">
          <b className="text-brand-200 font-bold">4,000+</b> guests
        </span>
        <span className="rounded-full bg-iron-900/55 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11.5px] font-semibold text-white">
          Since <b className="text-brand-200 font-bold">2017</b>
        </span>
        <span className="rounded-full bg-iron-900/55 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11.5px] font-semibold text-white">
          From <b className="text-brand-200 font-bold">$495</b>/wk
        </span>
      </div>
      <div className="absolute left-6 right-6 bottom-5 z-10">
        <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-brand-200">{cap.tag}</p>
        <p className="font-display text-xl sm:text-2xl uppercase tracking-wide text-white mt-1.5 leading-tight">{cap.big}</p>
        <p className="text-[12.5px] text-white/75 mt-1.5">{cap.sm}</p>
      </div>
    </div>
  );
}

// ── Main flow ─────────────────────────────────────────────────────────────────
export default function BookFlow() {
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
    desired_city: 'phoenix', bedrooms: '1', move_in_date: '', pets: '', heard_about: '', sms_opt_in: false,
  });

  // Gating
  const [gatingPopup, setGatingPopup] = useState<GatingPopup>(null);

  // Slots
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [slotTaken, setSlotTaken] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Step 1: acknowledgements ──────────────────────────────────────────────
  const allChecked = SCREENING_ITEMS.every(item => checked[item.id]);

  // ── Step 2: form validation (every field required + format-checked) ───────
  const phoneValid = form.phone.replace(/\D/g, '').length >= 10;
  const emailValid = /^\S+@\S+\.\S+$/.test(form.email.trim());
  const step2Valid =
    form.name.trim().length >= 2 &&
    phoneValid &&
    emailValid &&
    form.move_in_date &&
    form.pets &&
    form.heard_about;

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

  // ── Group slots by Phoenix-local day ───────────────────────────────────────
  interface DayGroup { key: string; weekday: string; dayNum: string; month: string; slots: Slot[] }
  const dayGroups: DayGroup[] = [];
  {
    const byKey: Record<string, DayGroup> = {};
    for (const slot of slots) {
      const d = new Date(slot.startISO);
      const key = d.toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
      if (!byKey[key]) {
        byKey[key] = {
          key,
          weekday: d.toLocaleDateString('en-US', { timeZone: 'America/Phoenix', weekday: 'short' }),
          dayNum: d.toLocaleDateString('en-US', { timeZone: 'America/Phoenix', day: 'numeric' }),
          month: d.toLocaleDateString('en-US', { timeZone: 'America/Phoenix', month: 'short' }),
          slots: [],
        };
        dayGroups.push(byKey[key]);
      }
      byKey[key].slots.push(slot);
    }
  }
  const activeDayKey = selectedDayKey && dayGroups.some(g => g.key === selectedDayKey)
    ? selectedDayKey
    : dayGroups[0]?.key ?? null;
  const activeDay = dayGroups.find(g => g.key === activeDayKey) ?? null;

  const fmtSlotDay = (slot: Slot) =>
    new Date(slot.startISO).toLocaleDateString('en-US', {
      timeZone: 'America/Phoenix', weekday: 'long', month: 'long', day: 'numeric',
    });
  const fmtSlotTime = (slot: Slot) =>
    new Date(slot.startISO).toLocaleString('en-US', {
      timeZone: 'America/Phoenix', hour: 'numeric', minute: '2-digit',
    });

  const seg = segOf(step);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-iron-900 px-3 py-4 sm:px-5 sm:py-8 lg:py-12">
      {/* Gating popup */}
      <GatingModal
        type={gatingPopup}
        city={form.desired_city}
        bedrooms={form.bedrooms}
        onBook={() => { setGatingPopup(null); loadSlots(); setStep(4); }}
        onWaitlist={joinWaitlist}
        onClose={() => { setGatingPopup(null); loadSlots(); setStep(4); }}
      />

      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#161d2b] ring-1 ring-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.5)] grid lg:grid-cols-[44%_56%] lg:min-h-[660px]">
        <PhotoPanel seg={seg} />

        <div className="flex flex-col p-6 sm:p-9 lg:p-11">
          {/* Top bar: logo + progress */}
          <div className="mb-6 flex items-center justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Canyon_Logo-removebg-preview.png" alt="Canyon Apartments" className="h-9 w-auto sm:h-10" />
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(n => (
                <span
                  key={n}
                  className={[
                    'h-1 w-8 rounded-full transition-all duration-500',
                    n < seg ? 'bg-brand-500'
                      : n === seg ? 'bg-gradient-to-r from-brand-500 to-brand-400 shadow-[0_0_12px_rgba(201,75,12,0.7)]'
                      : 'bg-white/15',
                  ].join(' ')}
                />
              ))}
            </div>
          </div>

          {/* Back button */}
          {step > 1 && step !== 3 && (
            <button
              onClick={() => setStep(step === 4 ? 2 : (step - 1) as Step)}
              className="mb-3 inline-flex items-center gap-1 self-start text-sm text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft size={15} /> Back
            </button>
          )}

          {/* ── STEP 1: Acknowledge ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="step-rise flex flex-1 flex-col">
              <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-brand-400 mb-2">
                Step 1 of 4 · The straight talk
              </p>
              <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight">
                Four things<br />to know first
              </h1>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-white/60">
                We&apos;re upfront so your 15 minutes actually count. Tap each one to confirm.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                {SCREENING_ITEMS.map(({ id, heading, text }) => (
                  <button
                    key={id}
                    onClick={() => setChecked(prev => ({ ...prev, [id]: !prev[id] }))}
                    className={[
                      'flex items-start gap-3.5 rounded-2xl border-[1.5px] px-4 py-3.5 text-left transition-all duration-200',
                      checked[id]
                        ? 'border-brand-500 bg-brand-500/15 shadow-[0_0_24px_rgba(201,75,12,0.12)]'
                        : 'border-white/10 bg-white/[0.045] hover:border-brand-400/40 hover:bg-white/[0.07]',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'mt-0.5 flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-md border-2 text-[12px] font-extrabold transition-all',
                        checked[id] ? 'border-brand-500 bg-brand-500 text-white' : 'border-white/30 text-transparent',
                      ].join(' ')}
                    >
                      ✓
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white leading-snug">{heading}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-white/55">{text}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-6">
                <button
                  onClick={() => setStep(2)}
                  disabled={!allChecked}
                  className={[
                    'relative w-full overflow-hidden rounded-2xl py-4 text-[15px] font-bold text-white transition-all duration-200 inline-flex items-center justify-center gap-2',
                    allChecked
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 shadow-[0_8px_28px_rgba(201,75,12,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(201,75,12,0.5)] shimmer-sweep'
                      : 'cursor-not-allowed bg-white/10 text-white/30',
                  ].join(' ')}
                >
                  I understand — continue {allChecked && <ArrowRight size={17} />}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Application form ────────────────────────────────────── */}
          {step === 2 && (
            <div className="step-rise flex flex-1 flex-col">
              <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-brand-400 mb-2">
                Step 2 of 4 · About you
              </p>
              <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight">
                Who are we calling?
              </h1>
              <div className="mt-6 flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input type="text" required placeholder="First and last name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input type="tel" required placeholder="(602) 555-1234" value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
                    {form.phone.trim() !== '' && !phoneValid && (
                      <p className="mt-1 text-[11px] text-red-300">Please enter a 10-digit phone number.</p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" required placeholder="you@example.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
                    {form.email.trim() !== '' && !emailValid && (
                      <p className="mt-1 text-[11px] text-red-300">Please enter a valid email address.</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>People staying</label>
                    <div className="relative">
                      <select value={form.party_size} onChange={e => setForm(f => ({ ...f, party_size: e.target.value }))}
                        className={`${inputCls} appearance-none pr-8 [&>option]:bg-iron-800`}>
                        {['1','2','3','4','5','6+'].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                      {chevron}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Bedrooms</label>
                    <div className="relative">
                      <select value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value as '1'|'2' }))}
                        className={`${inputCls} appearance-none pr-8 [&>option]:bg-iron-800`}>
                        <option value="1">1 Bedroom</option>
                        <option value="2">2 Bedrooms</option>
                      </select>
                      {chevron}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                  <div>
                    <label className={labelCls}>Preferred city</label>
                    <div className="relative">
                      <select value={form.desired_city} onChange={e => setForm(f => ({ ...f, desired_city: e.target.value }))}
                        className={`${inputCls} appearance-none pr-8 [&>option]:bg-iron-800`}>
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
                    <label className={labelCls}>Move-in date</label>
                    <input type="date" required value={form.move_in_date} style={{ colorScheme: 'dark' }}
                      onChange={e => setForm(f => ({ ...f, move_in_date: e.target.value }))} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Do you have any pets?</label>
                  <div className="relative">
                    <select required value={form.pets} onChange={e => setForm(f => ({ ...f, pets: e.target.value }))}
                      className={`${inputCls} appearance-none pr-8 [&>option]:bg-iron-800`}>
                      <option value="">Select one…</option>
                      <option value="No pets">No pets</option>
                      <option value="Dog(s)">Yes — dog(s)</option>
                      <option value="Cat(s)">Yes — cat(s)</option>
                      <option value="Dogs & cats">Yes — dogs &amp; cats</option>
                      <option value="Other">Yes — other</option>
                    </select>
                    {chevron}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>How did you hear about us?</label>
                  <div className="relative">
                    <select required value={form.heard_about} onChange={e => setForm(f => ({ ...f, heard_about: e.target.value }))}
                      className={`${inputCls} appearance-none pr-8 [&>option]:bg-iron-800`}>
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
              </div>
              <div className="mt-auto pt-6">
                <button
                  onClick={() => setStep(3)}
                  disabled={!step2Valid}
                  className={[
                    'relative w-full overflow-hidden rounded-2xl py-4 text-[15px] font-bold text-white transition-all duration-200 inline-flex items-center justify-center gap-2',
                    step2Valid
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 shadow-[0_8px_28px_rgba(201,75,12,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(201,75,12,0.5)] shimmer-sweep'
                      : 'cursor-not-allowed bg-white/10 text-white/30',
                  ].join(' ')}
                >
                  Check availability {step2Valid && <ArrowRight size={17} />}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Checking availability (brief transition state) ───────── */}
          {step === 3 && !gatingPopup && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500/25 border-t-brand-500" />
              <p className="text-sm text-white/55">Checking availability…</p>
            </div>
          )}

          {/* ── STEP 4: Pick a time ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="step-rise flex flex-1 flex-col">
              <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-brand-400 mb-2">
                Step 3 of 4 · Pick your time
              </p>
              <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight">
                When should we call you?
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-white/55">
                <Clock size={12} /> All times MST — Phoenix, Arizona. Calls are 15 minutes.
              </p>

              {slotTaken && (
                <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-200">
                  That time was just taken by someone else. Please pick another slot.
                </div>
              )}

              {slotsLoading && (
                <div className="flex flex-1 items-center justify-center gap-3 py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500/25 border-t-brand-500" />
                  <p className="text-sm text-white/55">Loading available times…</p>
                </div>
              )}

              {!slotsLoading && dayGroups.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <Calendar size={36} className="text-white/25" />
                  <p className="text-sm font-medium text-white/60">No available times in the next 2 weeks.</p>
                  <p className="text-xs text-white/40">Please check back soon — new times are added weekly.</p>
                </div>
              )}

              {!slotsLoading && dayGroups.length > 0 && (
                <>
                  <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
                    {dayGroups.map(g => {
                      const isSel = g.key === activeDayKey;
                      return (
                        <button
                          key={g.key}
                          onClick={() => { setSelectedDayKey(g.key); setSelectedSlot(null); }}
                          className={[
                            'flex-none w-[72px] rounded-2xl border-[1.5px] px-1 py-3 text-center transition-all duration-200',
                            isSel
                              ? 'border-brand-500 bg-brand-600 shadow-[0_6px_24px_rgba(201,75,12,0.45)] -translate-y-0.5'
                              : 'border-white/10 bg-white/[0.045] hover:border-brand-400/50',
                          ].join(' ')}
                        >
                          <span className={`block font-mono text-[10px] uppercase tracking-[0.14em] ${isSel ? 'text-brand-100' : 'text-white/50'}`}>
                            {g.weekday}
                          </span>
                          <span className="mt-0.5 block text-[20px] font-extrabold text-white">{g.dayNum}</span>
                          <span className={`block text-[10.5px] ${isSel ? 'text-brand-100' : 'text-white/50'}`}>{g.month}</span>
                        </button>
                      );
                    })}
                  </div>
                  {activeDay && (
                    <div className="mt-3 grid max-h-[230px] grid-cols-3 gap-2 overflow-y-auto p-0.5 sm:grid-cols-4 [scrollbar-width:thin]">
                      {activeDay.slots.map(slot => {
                        const isSelected = selectedSlot?.startISO === slot.startISO;
                        return (
                          <button
                            key={slot.startISO}
                            onClick={() => setSelectedSlot(slot)}
                            className={[
                              'rounded-xl border-[1.5px] py-2.5 text-center text-[13.5px] font-semibold text-white transition-all duration-150',
                              isSelected
                                ? 'border-brand-400 bg-brand-600 shadow-[0_0_18px_rgba(201,75,12,0.5)]'
                                : 'border-white/10 bg-white/[0.045] hover:border-brand-400 hover:bg-brand-500/15',
                            ].join(' ')}
                          >
                            {fmtSlotTime(slot)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <div className="mt-auto pt-6">
                <button
                  onClick={() => setStep(5)}
                  disabled={!selectedSlot}
                  className={[
                    'relative w-full overflow-hidden rounded-2xl py-4 text-[15px] font-bold text-white transition-all duration-200 inline-flex items-center justify-center gap-2',
                    selectedSlot
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 shadow-[0_8px_28px_rgba(201,75,12,0.35)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(201,75,12,0.5)] shimmer-sweep'
                      : 'cursor-not-allowed bg-white/10 text-white/30',
                  ].join(' ')}
                >
                  Review &amp; confirm {selectedSlot && <ArrowRight size={17} />}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Review & confirm ────────────────────────────────────── */}
          {step === 5 && selectedSlot && (
            <div className="step-rise flex flex-1 flex-col">
              <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-brand-400 mb-2">
                Step 4 of 4 · Lock it in
              </p>
              <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white leading-tight">
                Review &amp; book
              </h1>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <div className="bg-gradient-to-r from-brand-700 to-brand-500 px-6 py-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand-100">Your call</p>
                  <p className="mt-1 text-xl font-extrabold text-white">
                    {fmtSlotDay(selectedSlot)} · {fmtSlotTime(selectedSlot)}
                  </p>
                  <p className="mt-1 text-xs text-brand-100">15 minutes · MST · We call you</p>
                </div>
                <div className="divide-y divide-white/[0.07] bg-white/[0.03]">
                  <div className="flex justify-between px-6 py-3 text-sm">
                    <span className="text-white/50">Name</span>
                    <span className="font-semibold text-white">{form.name}</span>
                  </div>
                  <div className="flex justify-between px-6 py-3 text-sm">
                    <span className="text-white/50">Phone</span>
                    <span className="font-semibold text-white">{form.phone}</span>
                  </div>
                  <div className="flex justify-between px-6 py-3 text-sm">
                    <span className="text-white/50">Email</span>
                    <span className="font-semibold text-white">{form.email}</span>
                  </div>
                  <div className="flex justify-between px-6 py-3 text-sm">
                    <span className="text-white/50">Looking for</span>
                    <span className="font-semibold text-white">
                      {form.bedrooms}BR in {CITIES.find(c => c.slug === form.desired_city)?.name}
                    </span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                  {submitError}
                </div>
              )}

              <p className="mt-4 text-center text-xs leading-relaxed text-white/50">
                We&apos;ll call you at the number above. A confirmation email and calendar invite arrive instantly.
              </p>

              <div className="mt-auto pt-5">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-base font-bold text-white shadow-[0_8px_28px_rgba(201,75,12,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(201,75,12,0.5)] active:scale-[0.99] disabled:opacity-60 disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2 shimmer-sweep"
                >
                  {submitting ? 'Booking…' : 'Book my call'}
                  {!submitting && <ArrowRight size={17} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
