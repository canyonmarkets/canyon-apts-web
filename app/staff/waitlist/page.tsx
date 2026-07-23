'use client';

import { useEffect, useState, useCallback } from 'react';
import { Phone, Mail, MapPin, Bed, Calendar, Zap, X, Trash2, Plus } from 'lucide-react';
import { CITIES } from '@/lib/cities';

interface WaitlistEntry {
  id: string; reason: string; notified_at: string | null; created_at: string;
  leads: { name: string; phone: string; email: string; desired_city: string; bedrooms: number };
}
interface BlastUnit { id: string; title: string; city: string; bedrooms: number; weekly_price: number; }

const REASON_CONFIG = {
  city_unavailable:  { label: 'City Unavailable',  icon: MapPin,     color: 'text-blue-600',  bg: 'bg-blue-50' },
  beds_unavailable:  { label: 'Bedrooms Unavailable', icon: Bed,      color: 'text-purple-600', bg: 'bg-purple-50' },
  date_too_far:      { label: 'Move-in Date Far Out', icon: Calendar, color: 'text-amber-600',  bg: 'bg-amber-50' },
};

function cityName(slug: string) { return CITIES.find(c => c.slug === slug)?.name ?? slug; }
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric' });
}

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlast, setShowBlast] = useState(false);
  const [blastUnits, setBlastUnits] = useState<BlastUnit[]>([]);
  const [blasting, setBlasting] = useState(false);
  const [blastResult, setBlastResult] = useState<string | null>(null);
  const [blastNote, setBlastNote] = useState('');

  // Manual add (phone-in / Facebook leads, or people whose form answers were wrong)
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '', email: '', city: 'phoenix', beds: '1', reason: 'city_unavailable' });
  const [addSaving, setAddSaving] = useState(false);
  const [addErr, setAddErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/staff/waitlist');
    if (res.ok) { const d = await res.json(); setWaitlist(d.waitlist); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openBlast = async () => {
    setShowBlast(true);
    setBlastResult(null);
    if (blastUnits.length > 0) return;
    const res = await fetch('/api/staff/inventory');
    if (res.ok) { const d = await res.json(); setBlastUnits(d.units ?? []); }
  };

  const sendBlast = async (unitId: string) => {
    setBlasting(true);
    const res = await fetch('/api/waitlist/blast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit_id: unitId, note: blastNote.trim() || undefined }),
    });
    if (res.ok) {
      const d = await res.json();
      setBlastResult(`Sent to ${d.sent} of ${d.total} matching contacts.`);
      setBlastNote('');
      await load();
    } else {
      setBlastResult('Something went wrong — check the server logs.');
    }
    setBlasting(false);
  };

  const submitAdd = async () => {
    if (addSaving) return;
    if (!addForm.name.trim() || !addForm.phone.trim() || !addForm.email.trim()) {
      setAddErr('Name, phone, and email are all needed (email is what the Blast uses).');
      return;
    }
    setAddSaving(true);
    setAddErr('');
    const res = await fetch('/api/staff/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: addForm.name, phone: addForm.phone, email: addForm.email,
        desired_city: addForm.city, bedrooms: Number(addForm.beds), reason: addForm.reason,
      }),
    });
    setAddSaving(false);
    if (res.ok) {
      setShowAdd(false);
      setAddForm({ name: '', phone: '', email: '', city: 'phoenix', beds: '1', reason: 'city_unavailable' });
      await load();
    } else {
      const d = await res.json().catch(() => ({}));
      setAddErr(d.error ?? 'Something went wrong.');
    }
  };

  const removeEntry = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from the waitlist? This can't be undone.`)) return;
    setWaitlist(prev => prev.filter(e => e.id !== id));
    await fetch('/api/staff/waitlist', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const markNotified = async (id: string) => {
    setWaitlist(prev => prev.map(e => e.id === id ? { ...e, notified_at: new Date().toISOString() } : e));
    await fetch('/api/staff/waitlist', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  const groups = Object.entries(REASON_CONFIG).map(([key, config]) => ({
    key, config,
    entries: waitlist.filter(e => e.reason === key),
  }));

  const total = waitlist.filter(e => !e.notified_at).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Waitlist</h1>
          {total > 0 && (
            <span className="bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{total} pending</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowAdd(true); setAddErr(''); }}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand-700 transition-colors">
            <Plus size={13} /> Add
          </button>
          <button onClick={openBlast}
            className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-amber-600 transition-colors">
            <Zap size={13} /> Blast
          </button>
        </div>
      </div>

      {/* Manual add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-iron-100">
              <div>
                <p className="font-semibold text-iron-900 text-sm">Add to Waitlist</p>
                <p className="text-iron-800 text-xs mt-0.5">For phone-in or Facebook leads</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="text-iron-800 hover:text-iron-600"><X size={18} /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
                className="w-full rounded-xl border border-iron-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Phone" type="tel"
                className="w-full rounded-xl border border-iron-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Email (needed for Blast emails)" type="email"
                className="w-full rounded-xl border border-iron-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <div className="grid grid-cols-2 gap-2">
                <select value={addForm.city} onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full rounded-xl border border-iron-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
                <select value={addForm.beds} onChange={e => setAddForm(f => ({ ...f, beds: e.target.value }))}
                  className="w-full rounded-xl border border-iron-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                {([['city_unavailable', 'Waiting on their city'], ['beds_unavailable', 'Waiting on bedroom size'], ['date_too_far', 'Move-in date is further out']] as const).map(([value, label]) => (
                  <button key={value} onClick={() => setAddForm(f => ({ ...f, reason: value }))}
                    className={`rounded-xl px-4 py-2.5 text-sm text-left font-medium transition-colors ${addForm.reason === value ? 'bg-brand-600 text-white' : 'bg-iron-50 text-iron-600 hover:bg-iron-100'}`}>
                    {label}
                  </button>
                ))}
              </div>
              {addErr && <p className="text-red-600 text-xs">{addErr}</p>}
              <button onClick={submitAdd} disabled={addSaving}
                className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
                {addSaving ? 'Adding…' : 'Add to Waitlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blast unit picker modal */}
      {showBlast && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-iron-100">
              <div>
                <p className="font-semibold text-iron-900 text-sm">Waitlist Blast</p>
                <p className="text-iron-800 text-xs mt-0.5">Pick a unit — all matching waitlist contacts will be emailed</p>
              </div>
              <button onClick={() => setShowBlast(false)} className="text-iron-800 hover:text-iron-600"><X size={18} /></button>
            </div>
            <div className="px-5 py-3 border-b border-iron-100">
              <p className="text-xs font-semibold text-iron-800 mb-1.5">Personal note (optional — appears at the top of every email in this blast)</p>
              <textarea
                value={blastNote}
                onChange={e => setBlastNote(e.target.value)}
                placeholder="e.g. This one goes fast — call me today if you want it."
                rows={2}
                className="w-full rounded-xl border border-iron-200 px-3 py-2 text-sm text-iron-900 placeholder:text-iron-400 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="overflow-y-auto divide-y divide-iron-50">
              {blastUnits.length === 0 && <p className="px-5 py-8 text-center text-iron-800 text-sm">No available units in inventory</p>}
              {blastUnits.map(u => (
                <button key={u.id} onClick={() => sendBlast(u.id)} disabled={blasting}
                  className="w-full text-left px-5 py-3.5 hover:bg-iron-50 disabled:opacity-50 transition-colors">
                  <p className="font-semibold text-iron-900 text-sm">{u.title}</p>
                  <p className="text-iron-800 text-xs mt-0.5">
                    {u.bedrooms}BR · {CITIES.find(c => c.slug === u.city)?.name ?? u.city} · ${u.weekly_price}/wk
                  </p>
                </button>
              ))}
            </div>
            {blastResult && (
              <div className="px-5 py-4 border-t border-iron-100 text-center text-sm font-medium text-green-700 bg-green-50">
                {blastResult}
              </div>
            )}
            {blasting && <div className="px-5 py-4 border-t border-iron-100 text-center text-iron-800 text-sm">Sending blast…</div>}
          </div>
        </div>
      )}

      {loading && <div className="space-y-2">{[1,2].map(i => <div key={i} className="bg-white rounded-2xl border border-iron-100 h-20 animate-pulse" />)}</div>}

      {!loading && waitlist.length === 0 && (
        <div className="bg-white rounded-2xl border border-iron-100 px-5 py-12 text-center text-iron-800 text-sm">Waitlist is empty</div>
      )}

      {groups.map(({ key, config: { label, icon: Icon, color, bg }, entries }) => {
        if (entries.length === 0) return null;
        const pending = entries.filter(e => !e.notified_at).length;
        return (
          <section key={key}>
            <h2 className={`font-mono text-[11px] tracking-[0.15em] uppercase mb-2 flex items-center gap-1.5 ${color}`}>
              <Icon size={12} /> {label} ({entries.length}{pending > 0 ? `, ${pending} uncontacted` : ''})
            </h2>
            <div className="space-y-2">
              {entries.map(entry => (
                <div key={entry.id} className={`bg-white rounded-2xl border border-iron-100 overflow-hidden ${entry.notified_at ? 'opacity-60' : ''}`}>
                  <div className="px-4 py-3.5 flex items-start gap-3">
                    <div className={`${bg} rounded-xl p-2 shrink-0`}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-iron-900 text-sm">{entry.leads.name}</p>
                      <p className="text-iron-800 text-xs mt-0.5">
                        {entry.leads.bedrooms}BR · {cityName(entry.leads.desired_city)} · Added {fmtDate(entry.created_at)}
                      </p>
                      {entry.notified_at && <p className="text-green-600 text-xs mt-0.5">Contacted {fmtDate(entry.notified_at)}</p>}
                    </div>
                  </div>
                  <div className="px-4 pb-3.5 flex gap-2">
                    <a href={`tel:${entry.leads.phone}`} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-iron-200 py-2.5 text-xs font-medium text-iron-700 hover:border-brand-300 hover:text-brand-700 transition-colors">
                      <Phone size={13} /> {entry.leads.phone}
                    </a>
                    <a href={`mailto:${entry.leads.email}`} className="flex items-center justify-center gap-1.5 rounded-lg border border-iron-200 px-3 py-2.5 text-xs font-medium text-iron-600 hover:border-brand-300 transition-colors">
                      <Mail size={13} />
                    </a>
                    {!entry.notified_at && (
                      <button onClick={() => markNotified(entry.id)} className="rounded-lg bg-brand-50 border border-brand-200 px-3 py-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition-colors">
                        Mark contacted
                      </button>
                    )}
                    <button onClick={() => removeEntry(entry.id, entry.leads.name)}
                      aria-label={`Remove ${entry.leads.name} from waitlist`}
                      className="flex items-center justify-center rounded-lg border border-iron-200 px-3 py-2.5 text-iron-800 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
