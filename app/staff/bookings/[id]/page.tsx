'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Phone, Mail, Send, ImageIcon, X } from 'lucide-react';
import { ACTIVE_PIPELINE_STAGES, PIPELINE_LABELS, type PipelineStage } from '@/lib/booking';
import { CITIES } from '@/lib/cities';

interface Lead {
  name: string; phone: string; email: string; party_size: number; desired_city: string;
  bedrooms: number; move_in_date: string | null; pets: string | null; lead_source: string; heard_about: string | null;
  screening_answers: Record<string, boolean>;
}
interface Booking {
  id: string; lead_id: string; slot_start: string; slot_end: string;
  status: string; pipeline_stage: PipelineStage; opened_at: string | null;
  recap_sent: boolean; recap_unit_id: string | null;
  leads: Lead;
}
interface AvailableUnit { id: string; title: string; area: string; city: string; bedrooms: number; bathrooms: number; weekly_price: number; }
interface Note { id: string; author: string; body: string; created_at: string; }

function fmtSlot(iso: string) {
  return new Date(iso).toLocaleString('en-US', { timeZone: 'America/Phoenix', weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const STAGE_COLORS: Record<PipelineStage, string> = {
  new: 'bg-iron-100 text-iron-700', called: 'bg-blue-100 text-blue-700',
  photos_sent: 'bg-purple-100 text-purple-700', following_up: 'bg-amber-100 text-amber-700',
  toured_applied: 'bg-green-100 text-green-800', leased: 'bg-green-200 text-green-900', lost: 'bg-red-100 text-red-700',
};

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tab, setTab] = useState<'details' | 'notes'>('details');
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [recapUnits, setRecapUnits] = useState<AvailableUnit[]>([]);
  const [sendingRecap, setSendingRecap] = useState(false);
  const [recapNote, setRecapNote] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/staff/bookings/${id}`);
    if (!res.ok) { router.push('/staff/bookings'); return; }
    const d = await res.json();
    setBooking(d.booking);
    setNotes(d.notes);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  // Write opened_at if within the calling window
  useEffect(() => {
    if (!booking) return;
    const slotMs = new Date(booking.slot_start).getTime();
    const nowMs = Date.now();
    const windowOpen = slotMs - 15 * 60 * 1000;
    const windowClose = slotMs + 60 * 60 * 1000;
    if (nowMs >= windowOpen && nowMs <= windowClose && !booking.opened_at) {
      fetch(`/api/staff/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opened_at: new Date().toISOString() }),
      });
    }
  }, [booking, id]);

  const updateStage = async (stage: PipelineStage) => {
    await fetch(`/api/staff/bookings/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipeline_stage: stage }),
    });
    setBooking(prev => prev ? { ...prev, pipeline_stage: stage } : prev);
  };

  const toggleNoShow = async () => {
    if (!booking) return;
    const next = booking.status === 'no_show' ? 'scheduled' : 'no_show';
    setBooking(prev => prev ? { ...prev, status: next } : prev);
    await fetch(`/api/staff/bookings/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
  };

  // Add this person to the waitlist (e.g. their form answers were wrong)
  const [showWaitlistAdd, setShowWaitlistAdd] = useState(false);
  const [wlReason, setWlReason] = useState('date_too_far');
  const [wlSaving, setWlSaving] = useState(false);
  const [wlAdded, setWlAdded] = useState(false);

  const addToWaitlist = async () => {
    if (!booking || wlSaving) return;
    setWlSaving(true);
    const res = await fetch('/api/staff/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead_id: booking.lead_id,
        desired_city: booking.leads.desired_city,
        bedrooms: booking.leads.bedrooms,
        reason: wlReason,
      }),
    });
    setWlSaving(false);
    if (res.ok) { setWlAdded(true); setShowWaitlistAdd(false); }
  };

  const addNote = async () => {
    if (!noteText.trim() || !booking) return;
    setSavingNote(true);
    const res = await fetch('/api/staff/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: id, lead_id: booking.lead_id, body: noteText.trim() }),
    });
    if (res.ok) {
      const d = await res.json();
      setNotes(prev => [d.note, ...prev]);
      setNoteText('');
    }
    setSavingNote(false);
  };

  const bookFollowUp = async () => {
    if (!followUpDate || !booking) return;
    await fetch('/api/staff/follow-ups', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: booking.lead_id, due_at: new Date(followUpDate).toISOString(), note: `Follow up with ${booking.leads.name}` }),
    });
    setShowFollowUp(false);
    setFollowUpDate('');
  };

  const openRecap = async () => {
    setShowRecap(true);
    if (recapUnits.length > 0) return;
    const res = await fetch('/api/staff/inventory');
    if (res.ok) {
      const d = await res.json();
      setRecapUnits(d.units ?? []);
    }
  };

  const sendRecap = async (unitId: string) => {
    if (!booking || sendingRecap) return;
    setSendingRecap(true);
    const res = await fetch('/api/recap', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: id, unit_id: unitId, note: recapNote.trim() || undefined }),
    });
    if (res.ok) {
      setBooking(prev => prev ? { ...prev, recap_sent: true, recap_unit_id: unitId, pipeline_stage: 'photos_sent' } : prev);
      setRecapNote('');
    }
    setSendingRecap(false);
    setShowRecap(false);
  };

  if (!booking) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }

  const lead = booking.leads;
  const cityName = CITIES.find(c => c.slug === lead.desired_city)?.name ?? lead.desired_city;

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-iron-800 hover:text-iron-700">
        <ChevronLeft size={16} /> Bookings
      </button>

      {/* Header card */}
      <div className="bg-iron-900 rounded-2xl px-5 py-4 space-y-1">
        <p className="text-iron-300 text-xs">{fmtSlot(booking.slot_start)}</p>
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-white">{lead.name}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${STAGE_COLORS[booking.pipeline_stage]}`}>
            {PIPELINE_LABELS[booking.pipeline_stage]}
          </span>
          {booking.status === 'no_show' && <span className="text-xs font-medium px-2 py-0.5 rounded-lg bg-red-100 text-red-700">No-show</span>}
          <span className="text-iron-300 text-xs">{lead.bedrooms}BR · {cityName}</span>
        </div>
      </div>

      {/* Contact quick-dial */}
      <div className="flex gap-2">
        <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-white rounded-xl border border-iron-200 py-3 text-sm font-semibold text-iron-800 hover:border-brand-300 transition-colors">
          <Phone size={15} /> {lead.phone}
        </a>
        <a href={`mailto:${lead.email}`} className="flex items-center justify-center gap-2 bg-white rounded-xl border border-iron-200 px-4 py-3 text-sm font-medium text-iron-600 hover:border-brand-300 transition-colors">
          <Mail size={15} />
        </a>
      </div>

      {/* Pipeline stage */}
      <div className="bg-white rounded-2xl border border-iron-100 p-4">
        <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide mb-3">Pipeline Stage</p>
        <div className="grid grid-cols-2 gap-1.5">
          {ACTIVE_PIPELINE_STAGES.map(s => (
            <button key={s} onClick={() => updateStage(s)}
              className={`rounded-xl py-2.5 text-xs font-semibold text-center transition-all ${booking.pipeline_stage === s ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-brand-50 border border-brand-100 text-brand-700 hover:bg-brand-100'}`}>
              {PIPELINE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-iron-100 rounded-xl p-1 gap-1">
        {(['details', 'notes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${tab === t ? 'bg-white text-iron-900 shadow-sm' : 'text-iron-800'}`}>
            {t} {t === 'notes' && notes.length > 0 ? `(${notes.length})` : ''}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {tab === 'details' && (
        <div className="bg-white rounded-2xl border border-iron-100 divide-y divide-iron-50">
          {[
            ['Email', lead.email],
            ['Party size', lead.party_size],
            ['Bedrooms', lead.bedrooms],
            ['City', cityName],
            ['Move-in', lead.move_in_date ?? '—'],
            ['Pets', lead.pets ?? '—'],
            ['Source', lead.lead_source],
            ['Heard about', lead.heard_about ?? '—'],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-iron-800">{label}</span>
              <span className="text-iron-900 font-medium text-right max-w-[60%]">{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Notes tab */}
      {tab === 'notes' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-iron-100 p-4 flex gap-2">
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note…"
              rows={3}
              className="flex-1 text-sm text-iron-900 placeholder:text-iron-400 resize-none outline-none"
            />
            <button onClick={addNote} disabled={savingNote || !noteText.trim()}
              className="self-end p-2 rounded-xl bg-brand-600 text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
              <Send size={16} />
            </button>
          </div>
          {notes.length === 0 && <p className="text-center text-iron-800 text-sm py-6">No notes yet</p>}
          {notes.map(n => (
            <div key={n.id} className="bg-white rounded-2xl border border-iron-100 px-4 py-3">
              <p className="text-iron-900 text-sm leading-relaxed">{n.body}</p>
              <p className="text-iron-800 text-xs mt-1.5">{n.author} · {new Date(n.created_at).toLocaleString('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions row */}
      <div className="flex gap-2">
        <button onClick={toggleNoShow}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${booking.status === 'no_show'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'border border-iron-200 font-medium text-iron-600 hover:border-red-300 hover:text-red-600'}`}>
          {booking.status === 'no_show' ? '✓ No-show — tap to undo' : 'No-show'}
        </button>
        <button onClick={() => setShowFollowUp(v => !v)}
          className="flex-1 rounded-xl bg-iron-100 py-3 text-sm font-semibold text-iron-700 hover:bg-iron-200 transition-colors">
          Follow-up
        </button>
        <button onClick={() => setShowWaitlistAdd(v => !v)} disabled={wlAdded}
          className={`flex-1 rounded-xl py-3 text-sm font-semibold transition-colors ${wlAdded
            ? 'bg-amber-100 text-amber-700 border border-amber-200'
            : 'bg-iron-100 text-iron-700 hover:bg-iron-200'}`}>
          {wlAdded ? '✓ Waitlisted' : 'Waitlist'}
        </button>
      </div>

      {/* Add-to-waitlist picker */}
      {showWaitlistAdd && (
        <div className="bg-white rounded-2xl border border-iron-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-iron-700">Add {lead.name} to the waitlist</p>
          <p className="text-xs text-iron-800">They keep their {lead.bedrooms}BR · {cityName} preferences. Pick why they&apos;re waiting:</p>
          <div className="flex flex-col gap-1.5">
            {([['date_too_far', 'Move-in date is further out'], ['city_unavailable', 'Waiting on their city'], ['beds_unavailable', 'Waiting on bedroom size']] as const).map(([value, label]) => (
              <button key={value} onClick={() => setWlReason(value)}
                className={`rounded-xl px-4 py-2.5 text-sm text-left font-medium transition-colors ${wlReason === value ? 'bg-brand-600 text-white' : 'bg-iron-50 text-iron-600 hover:bg-iron-100'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={addToWaitlist} disabled={wlSaving}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
            {wlSaving ? 'Adding…' : 'Add to Waitlist'}
          </button>
        </div>
      )}

      {/* Moved In → hand off to the tenant side */}
      <button
        onClick={() => {
          const q = new URLSearchParams({
            lead_id: booking.lead_id,
            name: lead.name ?? '',
            phone: lead.phone ?? '',
            email: lead.email ?? '',
            pets: lead.pets ?? '',
          });
          router.push(`/staff/tenants/new?${q.toString()}`);
        }}
        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-green-600 bg-green-50 py-3.5 text-sm font-bold text-green-700 hover:bg-green-100 transition-colors"
      >
        🏠 Moved In — Create Tenant
      </button>

      {/* Send Recap button */}
      <button
        onClick={openRecap}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors ${booking.recap_sent ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
      >
        <ImageIcon size={16} />
        {booking.recap_sent ? 'Recap Sent — Send Again' : 'Send Photo Recap'}
      </button>

      {/* Follow-up picker */}
      {showFollowUp && (
        <div className="bg-white rounded-2xl border border-iron-100 p-4 space-y-3">
          <p className="text-sm font-semibold text-iron-700">Follow-up date</p>
          <input type="datetime-local" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
            className="w-full rounded-xl border border-iron-200 px-4 py-3 text-sm text-iron-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <button onClick={bookFollowUp} disabled={!followUpDate}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
            Schedule Follow-up
          </button>
        </div>
      )}

      {/* Recap unit picker modal */}
      {showRecap && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-iron-100">
              <p className="font-semibold text-iron-900 text-sm">Pick a unit to send</p>
              <button onClick={() => setShowRecap(false)} className="text-iron-800 hover:text-iron-600">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-iron-100">
              <p className="text-xs font-semibold text-iron-800 mb-1.5">Personal note (optional — appears at the top of the email)</p>
              <textarea
                value={recapNote}
                onChange={e => setRecapNote(e.target.value)}
                placeholder="e.g. Great talking with you! This is the one with the balcony I mentioned."
                rows={2}
                className="w-full rounded-xl border border-iron-200 px-3 py-2 text-sm text-iron-900 placeholder:text-iron-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="overflow-y-auto divide-y divide-iron-50">
              {recapUnits.length === 0 && (
                <p className="px-5 py-8 text-center text-iron-800 text-sm">No units in inventory</p>
              )}
              {recapUnits.map(u => (
                <button key={u.id} onClick={() => sendRecap(u.id)} disabled={sendingRecap}
                  className="w-full text-left px-5 py-3.5 hover:bg-iron-50 disabled:opacity-50 transition-colors">
                  <p className="font-semibold text-iron-900 text-sm">{u.title}</p>
                  <p className="text-iron-800 text-xs mt-0.5">
                    {u.bedrooms}BR · {CITIES.find(c => c.slug === u.city)?.name ?? u.city} · ${u.weekly_price}/wk
                  </p>
                </button>
              ))}
            </div>
            {sendingRecap && (
              <div className="px-5 py-4 border-t border-iron-100 text-center text-iron-800 text-sm">Sending recap…</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
