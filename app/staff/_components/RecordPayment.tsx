'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { currentMonday, nextMondayAfter, fmtWeek } from '@/lib/rent';

const METHODS = [
  { value: 'zelle', label: 'Zelle' },
  { value: 'venmo', label: 'Venmo' },
  { value: 'cash', label: 'Cash' },
  { value: 'cashapp', label: 'CashApp' },
] as const;

const TYPES = [
  { value: 'rent', label: 'Rent' },
  { value: 'application_fee', label: 'App fee' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'late_fee', label: 'Late fee' },
  { value: 'utility_overage', label: 'Overage' },
  { value: 'other', label: 'Other' },
] as const;

const inputCls = 'w-full rounded-xl border border-iron-200 px-4 py-3 text-sm text-iron-900 placeholder:text-iron-400 focus:outline-none focus:ring-2 focus:ring-brand-500';

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all ${on ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-brand-50 border border-brand-100 text-brand-700 hover:border-brand-300'}`}>
      {children}
    </button>
  );
}

// ── Single payment ─────────────────────────────────────────────────────────────
export function RecordPaymentModal({
  tenancyId, weeklyRate, defaultWeek, defaultType, defaultLate, onDone, onClose,
}: {
  tenancyId: string;
  weeklyRate: number;
  defaultWeek?: string;
  defaultType?: string;
  defaultLate?: boolean;
  onDone: () => void;
  onClose: () => void;
}) {
  const [type, setType] = useState(defaultType ?? 'rent');
  const [amount, setAmount] = useState(defaultType === 'late_fee' ? '50' : String(weeklyRate || ''));
  const [method, setMethod] = useState('zelle');
  const [week, setWeek] = useState(defaultWeek ?? currentMonday());
  const [late, setLate] = useState(defaultLate ?? false);
  const [addLateFee, setAddLateFee] = useState(false);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const pickType = (t: string) => {
    setType(t);
    if (t === 'rent') setAmount(String(weeklyRate || ''));
    else if (t === 'late_fee') setAmount('50');
    else if (t === 'application_fee') setAmount('25');
    else if (t === 'deposit') setAmount('200');
    else setAmount('');
  };

  const submit = async () => {
    if (saving) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) { setErr('Enter a valid amount.'); return; }
    setSaving(true);
    setErr('');
    const items: Record<string, unknown>[] = [{
      type, amount: amt, method,
      week_due: ['rent', 'late_fee', 'utility_overage'].includes(type) ? week : null,
      late, note: note || undefined,
    }];
    if (type === 'rent' && addLateFee) {
      items.push({ type: 'late_fee', amount: 50, method, week_due: week, late: true });
    }
    const res = await fetch('/api/staff/payments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenancy_id: tenancyId, items }),
    });
    setSaving(false);
    if (res.ok) { onDone(); onClose(); }
    else { const d = await res.json().catch(() => ({})); setErr(d.error ?? 'Something went wrong.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-iron-100">
          <p className="font-semibold text-iron-900 text-sm">Record Payment</p>
          <button onClick={onClose} className="text-iron-800 hover:text-iron-600"><X size={18} /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map(t => <Chip key={t.value} on={type === t.value} onClick={() => pickType(t.value)}>{t.label}</Chip>)}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-iron-800">$</span>
            <input type="number" inputMode="decimal" autoFocus value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 min-w-0 w-full rounded-xl border border-iron-200 px-4 py-3 text-2xl font-bold text-iron-900 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          {type === 'rent' && Number(amount) > 0 && Number(amount) < weeklyRate && (
            <p className="text-xs text-amber-600 font-medium">Partial payment — ${weeklyRate - Number(amount)} will remain due for this week.</p>
          )}

          <div>
            <p className="text-xs font-semibold text-iron-800 mb-1.5">Paid by</p>
            <div className="flex flex-wrap gap-1.5">
              {METHODS.map(m => <Chip key={m.value} on={method === m.value} onClick={() => setMethod(m.value)}>{m.label}</Chip>)}
            </div>
          </div>

          {['rent', 'late_fee', 'utility_overage'].includes(type) && (
            <div>
              <p className="text-xs font-semibold text-iron-800 mb-1.5">For the week of</p>
              <input type="date" value={week} onChange={e => setWeek(e.target.value)} className={inputCls} />
            </div>
          )}

          {type === 'rent' && (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 text-sm text-iron-700">
                <input type="checkbox" checked={late} onChange={e => setLate(e.target.checked)} className="w-4 h-4 accent-[#B84309]" />
                Paid late (after Monday 10 AM)
              </label>
              <label className="flex items-center gap-2.5 text-sm text-iron-700">
                <input type="checkbox" checked={addLateFee} onChange={e => { setAddLateFee(e.target.checked); if (e.target.checked) setLate(true); }} className="w-4 h-4 accent-[#B84309]" />
                Also record the $50 late fee
              </label>
            </div>
          )}

          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)" className={inputCls} />

          {err && <p className="text-red-600 text-xs">{err}</p>}
          <button onClick={submit} disabled={saving}
            className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
            {saving ? 'Saving…' : `Record ${addLateFee && type === 'rent' ? `$${Number(amount) || 0} + $50 fee` : `$${Number(amount) || 0}`}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Move-in charges wizard ─────────────────────────────────────────────────────
interface LineItem { type: string; label: string; hint: string; amount: string; include: boolean }

export function MoveInWizard({
  tenancyId, weeklyRate, moveIn, alreadyPaid, onDone, onClose,
}: {
  tenancyId: string;
  weeklyRate: number;
  moveIn: string | null;
  alreadyPaid?: { appFee: number; hold: number };
  onDone: () => void;
  onClose: () => void;
}) {
  const appFeeDone = (alreadyPaid?.appFee ?? 0) > 0;
  const holdDone = (alreadyPaid?.hold ?? 0) > 0;
  const firstWeek = nextMondayAfter(moveIn ?? currentMonday());
  const dailyRate = weeklyRate > 0 ? weeklyRate / 7 : 0;
  // Default prorated days: move-in day through Sunday (Mon=7 … Sun=1)
  const defaultDays = (() => {
    if (!moveIn) return 7;
    const d = new Date(`${moveIn}T12:00:00`).getDay(); // Sun=0 … Sat=6
    return d === 0 ? 1 : 8 - d;
  })();
  const [prorateDays, setProrateDays] = useState(defaultDays);
  const [items, setItems] = useState<LineItem[]>([
    { type: 'application_fee', label: 'Application fee', hint: appFeeDone ? '✓ Already recorded — leave unchecked' : 'Standard $25', amount: '25', include: !appFeeDone },
    { type: 'deposit', label: 'Hold payment', hint: holdDone ? '✓ Already recorded — leave unchecked' : 'Applies toward the deposit', amount: '200', include: !holdDone },
    { type: 'prorate', label: 'Prorated days', hint: 'Move-in day through Sunday', amount: '', include: true },
    { type: 'buffer_day', label: 'Buffer day', hint: 'The prepaid extra night — 1/7 of the weekly rate', amount: '', include: true },
    { type: 'rent', label: 'First weekly payment', hint: `Week of ${fmtWeek(firstWeek)}`, amount: String(weeklyRate || ''), include: false },
  ]);
  const [method, setMethod] = useState('cash');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const prorateAmount = Math.ceil(dailyRate * prorateDays);
  const bufferAmount = Math.ceil(dailyRate);
  const amountFor = (it: LineItem) =>
    it.type === 'prorate' ? prorateAmount : it.type === 'buffer_day' ? bufferAmount : Number(it.amount);

  const total = items.filter(i => i.include && amountFor(i) > 0).reduce((s, i) => s + amountFor(i), 0);

  const submit = async () => {
    if (saving) return;
    const chosen = items.filter(i => i.include && amountFor(i) > 0);
    if (chosen.length === 0) { setErr('Nothing to record — set at least one amount.'); return; }
    setSaving(true);
    setErr('');
    const res = await fetch('/api/staff/payments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenancy_id: tenancyId,
        items: chosen.map(i => ({
          type: i.type, amount: amountFor(i), method,
          week_due: i.type === 'rent' ? firstWeek : null,
          note: i.type === 'deposit' ? 'Hold payment at move-in'
            : i.type === 'prorate' ? `${prorateDays} day${prorateDays === 1 ? '' : 's'} @ $${Math.ceil(dailyRate)}/day`
            : undefined,
        })),
      }),
    });
    setSaving(false);
    if (res.ok) { onDone(); onClose(); }
    else { const d = await res.json().catch(() => ({})); setErr(d.error ?? 'Something went wrong.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-iron-100">
          <div>
            <p className="font-semibold text-iron-900 text-sm">Move-In Charges</p>
            <p className="text-iron-800 text-xs mt-0.5">Uncheck anything not collected today — you can record it later.</p>
          </div>
          <button onClick={onClose} className="text-iron-800 hover:text-iron-600"><X size={18} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {items.map((it, i) => (
            <div key={it.type} className={`rounded-xl border p-3 flex items-center gap-3 transition-opacity ${it.include ? 'border-iron-200' : 'border-iron-100 opacity-50'}`}>
              <input type="checkbox" checked={it.include}
                onChange={e => setItems(prev => prev.map((p, j) => j === i ? { ...p, include: e.target.checked } : p))}
                className="w-4 h-4 accent-[#B84309] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-iron-900">{it.label}</p>
                <p className="text-[11px] text-iron-800">
                  {it.type === 'prorate' ? `${prorateDays} day${prorateDays === 1 ? '' : 's'} × $${Math.ceil(dailyRate)}/day` : it.hint}
                </p>
              </div>
              {it.type === 'prorate' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-lg border border-iron-200 overflow-hidden">
                    <button onClick={() => setProrateDays(d => Math.max(1, d - 1))} disabled={!it.include}
                      className="px-2.5 py-2 text-iron-800 font-bold hover:bg-iron-50 disabled:opacity-40">−</button>
                    <span className="w-6 text-center text-sm font-bold text-iron-900">{prorateDays}</span>
                    <button onClick={() => setProrateDays(d => Math.min(7, d + 1))} disabled={!it.include}
                      className="px-2.5 py-2 text-iron-800 font-bold hover:bg-iron-50 disabled:opacity-40">+</button>
                  </div>
                  <span className="w-14 text-right text-sm font-bold text-iron-900">${prorateAmount}</span>
                </div>
              ) : it.type === 'buffer_day' ? (
                <span className="w-20 text-right text-sm font-bold text-iron-900 shrink-0">${bufferAmount}</span>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-iron-800 text-sm">$</span>
                  <input type="number" inputMode="decimal" value={it.amount} placeholder="0"
                    onChange={e => setItems(prev => prev.map((p, j) => j === i ? { ...p, amount: e.target.value } : p))}
                    disabled={!it.include}
                    className="w-20 rounded-lg border border-iron-200 px-2 py-2 text-sm font-bold text-right text-iron-900 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-iron-50" />
                </div>
              )}
            </div>
          ))}

          <div>
            <p className="text-xs font-semibold text-iron-800 mb-1.5">Paid by</p>
            <div className="flex flex-wrap gap-1.5">
              {METHODS.map(m => <Chip key={m.value} on={method === m.value} onClick={() => setMethod(m.value)}>{m.label}</Chip>)}
            </div>
            <p className="text-[11px] text-iron-800 mt-1.5">New folks often pay the first bit in cash while they set up Zelle/Venmo.</p>
          </div>

          {err && <p className="text-red-600 text-xs">{err}</p>}
          <button onClick={submit} disabled={saving}
            className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
            {saving ? 'Saving…' : `Record move-in — $${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
