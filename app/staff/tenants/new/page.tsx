'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { CITIES } from '@/lib/cities';

interface Unit { id: string; title: string; complex_name: string | null; unit_number: string | null; city: string; bedrooms: number; status: string; }
interface Occupant { name: string; phone: string; email: string; }

const inputCls = 'w-full rounded-xl border border-iron-200 px-4 py-3 text-sm text-iron-900 placeholder:text-iron-400 focus:outline-none focus:ring-2 focus:ring-brand-500';
const labelCls = 'block text-xs font-semibold text-iron-800 mb-1.5';

function NewTenantForm() {
  const router = useRouter();
  const sp = useSearchParams();

  // Prefill from a booking handoff (lead → tenant)
  const [form, setForm] = useState({
    name: sp.get('name') ?? '',
    phone: sp.get('phone') ?? '',
    email: sp.get('email') ?? '',
    lead_id: sp.get('lead_id') ?? '',
    unit_id: '',
    weekly_rate: '',
    move_in: '',
    deposit_total: '500',
    kids: '0',
    pets: sp.get('pets') ?? '',
    notes: '',
  });
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // Type-ahead: recent booked leads pop up as you type the name
  interface RecentLead { id: string; name: string; phone: string | null; email: string | null; pets: string | null; }
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestions = form.name.trim().length >= 2 && showSuggest
    ? recentLeads.filter(l => l.name.toLowerCase().includes(form.name.trim().toLowerCase())).slice(0, 6)
    : [];
  const pickLead = (l: RecentLead) => {
    setForm(f => ({ ...f, name: l.name, phone: l.phone ?? '', email: l.email ?? '', pets: l.pets ?? f.pets, lead_id: l.id }));
    setShowSuggest(false);
  };

  useEffect(() => {
    fetch('/api/staff/inventory').then(r => r.ok ? r.json() : { units: [] }).then(d => setUnits(d.units ?? []));
    fetch('/api/staff/recent-leads').then(r => r.ok ? r.json() : { leads: [] }).then(d => setRecentLeads(d.leads ?? []));
  }, []);

  const unitLabel = (u: Unit) =>
    `${u.complex_name || u.title}${u.unit_number ? ' #' + u.unit_number : ''} · ${u.bedrooms}BR · ${CITIES.find(c => c.slug === u.city)?.name ?? u.city}${u.status === 'taken' ? ' (occupied)' : ''}`;

  const submit = async () => {
    if (saving) return;
    if (!form.name.trim()) { setErr('Tenant name is required.'); return; }
    setSaving(true);
    setErr('');
    const res = await fetch('/api/staff/tenants', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unit_id: form.unit_id || null,
        weekly_rate: form.weekly_rate || 0,
        move_in: form.move_in || null,
        deposit_total: form.deposit_total,
        kids: form.kids,
        pets: form.pets,
        notes: form.notes,
        primary: { name: form.name, phone: form.phone, email: form.email, lead_id: form.lead_id || null },
        occupants,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      router.push(`/staff/tenants/${d.tenancy_id}`);
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? 'Something went wrong.');
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-iron-800 hover:text-iron-700">
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">
        New Tenant {form.lead_id && <span className="text-brand-600 text-sm normal-case tracking-normal font-sans font-semibold">· from booking</span>}
      </h1>

      {/* Person */}
      <div className="bg-white rounded-2xl border border-iron-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide">Primary tenant</p>
        <div className="relative"><label className={labelCls}>Full name <span className="font-normal text-iron-800">— start typing to pull from recent bookings</span></label>
          <input className={inputCls} placeholder="First and last name" value={form.name}
            onChange={e => { setForm(f => ({ ...f, name: e.target.value, lead_id: '' })); setShowSuggest(true); }}
            onFocus={() => setShowSuggest(true)}
            onBlur={() => setTimeout(() => setShowSuggest(false), 150)} />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl bg-white shadow-xl border border-iron-200 divide-y divide-iron-50 overflow-hidden">
              {suggestions.map(l => (
                <button key={l.id} type="button" onMouseDown={() => pickLead(l)}
                  className="w-full text-left px-4 py-2.5 hover:bg-brand-50 transition-colors">
                  <p className="text-sm font-semibold text-iron-900">{l.name}</p>
                  <p className="text-xs text-iron-800">{l.phone ?? '—'} · {l.email ?? '—'}{l.pets ? ` · ${l.pets}` : ''}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>Phone</label>
            <input className={inputCls} type="tel" placeholder="(602) 555-1234" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className={labelCls}>Email</label>
            <input className={inputCls} type="email" placeholder="them@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        </div>

        {occupants.map((o, i) => (
          <div key={i} className="rounded-xl bg-iron-50 p-3 space-y-2 relative">
            <button onClick={() => setOccupants(prev => prev.filter((_, j) => j !== i))}
              className="absolute top-2 right-2 text-iron-800 hover:text-red-500"><X size={14} /></button>
            <p className="text-[11px] font-semibold text-iron-800 uppercase">Also staying</p>
            <input className={inputCls} placeholder="Name" value={o.name}
              onChange={e => setOccupants(prev => prev.map((p, j) => j === i ? { ...p, name: e.target.value } : p))} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="Phone (optional)" value={o.phone}
                onChange={e => setOccupants(prev => prev.map((p, j) => j === i ? { ...p, phone: e.target.value } : p))} />
              <input className={inputCls} placeholder="Email (optional)" value={o.email}
                onChange={e => setOccupants(prev => prev.map((p, j) => j === i ? { ...p, email: e.target.value } : p))} />
            </div>
          </div>
        ))}
        <button onClick={() => setOccupants(prev => [...prev, { name: '', phone: '', email: '' }])}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
          <Plus size={13} /> Add another person staying
        </button>
      </div>

      {/* Apartment + terms */}
      <div className="bg-white rounded-2xl border border-iron-100 p-4 space-y-3">
        <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide">Apartment &amp; terms</p>
        <div><label className={labelCls}>Unit</label>
          <select className={inputCls} value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}>
            <option value="">Assign later…</option>
            {units.map(u => <option key={u.id} value={u.id}>{unitLabel(u)}</option>)}
          </select></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>Weekly rate ($)</label>
            <input className={inputCls} type="number" placeholder="525" value={form.weekly_rate} onChange={e => setForm(f => ({ ...f, weekly_rate: e.target.value }))} /></div>
          <div><label className={labelCls}>Move-in date</label>
            <input className={inputCls} type="date" value={form.move_in} onChange={e => setForm(f => ({ ...f, move_in: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div><label className={labelCls}>Deposit ($)</label>
            <input className={inputCls} type="number" value={form.deposit_total} onChange={e => setForm(f => ({ ...f, deposit_total: e.target.value }))} /></div>
          <div><label className={labelCls}>Kids</label>
            <input className={inputCls} type="number" value={form.kids} onChange={e => setForm(f => ({ ...f, kids: e.target.value }))} /></div>
          <div><label className={labelCls}>Pets</label>
            <input className={inputCls} placeholder="None" value={form.pets} onChange={e => setForm(f => ({ ...f, pets: e.target.value }))} /></div>
        </div>
        <div><label className={labelCls}>Notes</label>
          <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Anything worth remembering…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
      </div>

      {err && <p className="text-red-600 text-sm">{err}</p>}

      <button onClick={submit} disabled={saving}
        className="w-full rounded-xl bg-brand-600 py-4 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
        {saving ? 'Creating…' : 'Create Tenant'}
      </button>
      <p className="text-center text-xs text-iron-800 pb-2">
        Next step after creating: record their move-in charges (app fee, hold, prorate, buffer day) from their card.
      </p>
    </div>
  );
}

export default function NewTenantPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>}>
      <NewTenantForm />
    </Suspense>
  );
}
