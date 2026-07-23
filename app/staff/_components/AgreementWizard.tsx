'use client';

import { useMemo, useState } from 'react';
import { X, FileSignature, RefreshCw } from 'lucide-react';
import { composeSpecialTerms, type AgreementGuest, type AgreementChild } from '@/lib/agreement/content';
import { nextMondayAfter } from '@/lib/rent';

const inputCls = 'w-full rounded-xl border border-iron-200 px-3 py-2.5 text-sm text-iron-900 focus:outline-none focus:ring-2 focus:ring-brand-500';
const lblCls = 'block text-[11px] font-bold text-iron-700 mt-3 mb-1';

function fmtShort(iso: string) { // 2026-07-11 → 7/11/26
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${Number(m)}/${Number(d)}/${y.slice(2)}`;
}
function plusDays(iso: string, days: number) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysThroughSunday(iso: string) { // move-in day through Sunday: Mon=7 … Sun=1
  const d = new Date(iso + 'T12:00:00').getDay(); // Sun=0 … Sat=6
  return d === 0 ? 1 : 8 - d;
}

export function AgreementWizard({
  tenancyId, address, people, weeklyRate, pets, alreadyPaid, onClose, onSent,
}: {
  tenancyId: string;
  address: string;
  people: { name: string; email: string | null; phone: string | null }[];
  weeklyRate: number;
  pets: string | null;
  alreadyPaid?: { appFee: number; hold: number };
  onClose: () => void;
  onSent: () => void;
}) {
  const appFeeOnLedger = (alreadyPaid?.appFee ?? 0) > 0;
  const holdOnLedger = (alreadyPaid?.hold ?? 0) > 0;
  const today = new Date(Date.now() - 7 * 3600 * 1000).toISOString().slice(0, 10); // Phoenix
  const [addr, setAddr] = useState(address);
  const [guests, setGuests] = useState<AgreementGuest[]>(
    people.slice(0, 4).map(p => ({ name: p.name, email: p.email ?? '', phone: p.phone ?? '' }))
  );
  const [children, setChildren] = useState<AgreementChild[]>([]);
  const [maxOcc, setMaxOcc] = useState(String(people.length));
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(plusDays(today, 7));
  const [weekly, setWeekly] = useState(String(weeklyRate || ''));
  const [deposit, setDeposit] = useState('500');
  const [cleaning, setCleaning] = useState('150');
  const [petFee, setPetFee] = useState(pets && pets.toLowerCase() !== 'none' ? '200' : '0');
  const [appFee, setAppFee] = useState(appFeeOnLedger ? String(alreadyPaid!.appFee) : '25');
  const [holdPaid, setHoldPaid] = useState(holdOnLedger ? String(alreadyPaid!.hold) : '200');
  const [prorateDays, setProrateDays] = useState(daysThroughSunday(today));
  const [special, setSpecial] = useState('');
  const [recipients, setRecipients] = useState<string[]>(
    people.slice(0, 4).filter(p => p.email?.trim()).map(p => p.email!.trim())
  );
  const [repName, setRepName] = useState('Joleen Martin, M.B.A.');
  const [sending, setSending] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [result, setResult] = useState<{ link: string; emailed: boolean } | null>(null);
  const [err, setErr] = useState('');

  const totals = useMemo(() => {
    const t = (Number(weekly) || 0) + (Number(deposit) || 0) + (Number(cleaning) || 0) + (Number(petFee) || 0);
    return { total: t, due: t, balance: t };
  }, [weekly, deposit, cleaning, petFee]);

  // Prorate + buffer auto-math (Joleen rounds up to the nearest dollar)
  const dailyRate = (Number(weekly) || 0) / 7;
  const prorateAmt = Math.ceil(dailyRate * prorateDays);
  const bufferAmt = Math.ceil(dailyRate);

  const regenSpecial = () => {
    setSpecial(composeSpecialTerms({
      applicationFee: Number(appFee) || 0,
      holdPaid: Number(holdPaid) || 0,
      deposit: Number(deposit) || 0,
      prorateAndBuffer: prorateAmt + bufferAmt,
      cleaningFee: Number(cleaning) || 0,
      petFee: Number(petFee) || 0,
      weeklyPayment: Number(weekly) || 0,
      checkIn: fmtShort(checkIn),
      firstMonday: fmtShort(nextMondayAfter(checkIn)),
      petDeclared: pets && pets.toLowerCase() !== 'none' ? pets : undefined,
    }));
  };

  const buildData = () => ({
    address: addr.trim(),
    guests: guests.filter(g => g.name.trim()),
    children: children.filter(c => c.name.trim()),
    maxOccupancy: maxOcc,
    checkIn: fmtShort(checkIn), checkOut: fmtShort(checkOut),
    weeklyPayment: Number(weekly) || 0, securityDeposit: Number(deposit) || 0,
    cleaningFee: Number(cleaning) || 0, petFee: Number(petFee) || 0,
    total: totals.total, dueUponOccupancy: totals.due, balanceDue: totals.balance,
    specialTerms: special,
    repName, repDate: fmtShort(today),
  });

  const preview = async () => {
    if (previewing) return;
    setPreviewing(true);
    setErr('');
    const res = await fetch('/api/staff/agreements/preview', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: buildData() }),
    });
    setPreviewing(false);
    if (res.ok) {
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } else setErr('Preview failed — check the fields.');
  };

  const send = async () => {
    if (sending) return;
    if (!addr.trim()) { setErr('The unit needs a street address — set it in Inventory → unit → Street address, or type it here.'); return; }
    if (!guests[0]?.name.trim() || !guests[0]?.email.trim()) { setErr('The primary guest needs a name and email.'); return; }
    if (recipients.length === 0) { setErr('Pick at least one person to email the signing link to.'); return; }
    setSending(true);
    setErr('');
    const res = await fetch('/api/staff/agreements', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenancy_id: tenancyId, data: buildData(), recipients }),
    });
    if (!res.ok) {
      setSending(false);
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? 'Something went wrong.');
      return;
    }
    setSending(false);
    setResult(await res.json());
    onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-iron-100 sticky top-0 bg-white z-10">
          <div>
            <p className="font-semibold text-iron-900 text-sm flex items-center gap-1.5"><FileSignature size={15} className="text-brand-600" /> Send Rental Agreement</p>
            <p className="text-iron-800 text-xs mt-0.5">Pre-filled — check every field, then send for signature</p>
          </div>
          <button onClick={onClose} className="text-iron-800 hover:text-iron-600"><X size={18} /></button>
        </div>

        {result ? (
          <div className="px-5 py-6 space-y-3">
            <p className="text-green-700 font-semibold text-sm">
              ✓ Agreement created{result.emailed ? ' and emailed to the guest' : ' — but the email failed to send'}.
            </p>
            <p className="text-xs text-iron-800">Signing link (also works if you text it to them):</p>
            <p className="text-xs font-mono bg-iron-50 rounded-lg p-2 break-all select-all">{result.link}</p>
            <p className="text-xs text-iron-800">When they sign, the finished PDF lands in their Documents automatically and you get an email. On move-in day, record the prorate + buffer with the Record Move-In Charges button.</p>
            <button onClick={onClose} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700">Done</button>
          </div>
        ) : (
          <div className="px-5 py-4">
            <label className={lblCls}>Premises address (from the unit)</label>
            <input className={inputCls} value={addr} onChange={e => setAddr(e.target.value)} placeholder="909 E Camelback Rd #3126, Phoenix, AZ 85014" />

            <label className={lblCls}>Guests (adults who will sign)</label>
            {guests.map((g, i) => (
              <div key={i} className="rounded-xl bg-iron-50 p-2.5 mt-2 space-y-2">
                <input className={inputCls} placeholder="Full name" value={g.name} onChange={e => setGuests(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <div className="grid grid-cols-2 gap-2">
                  <input className={inputCls} placeholder="Email" value={g.email} onChange={e => setGuests(prev => prev.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} />
                  <input className={inputCls} placeholder="Phone" value={g.phone} onChange={e => setGuests(prev => prev.map((x, j) => j === i ? { ...x, phone: e.target.value } : x))} />
                </div>
              </div>
            ))}
            {guests.length < 4 && (
              <button onClick={() => setGuests(prev => [...prev, { name: '', email: '', phone: '' }])} className="mt-2 text-xs font-semibold text-brand-600">+ Add guest</button>
            )}

            <label className={lblCls}>Children (optional, up to 3)</label>
            {children.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px] gap-2 mt-2">
                <input className={inputCls} placeholder="Child name" value={c.name} onChange={e => setChildren(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                <input className={inputCls} placeholder="Age" value={c.age} onChange={e => setChildren(prev => prev.map((x, j) => j === i ? { ...x, age: e.target.value } : x))} />
              </div>
            ))}
            {children.length < 3 && (
              <button onClick={() => setChildren(prev => [...prev, { name: '', age: '' }])} className="mt-2 text-xs font-semibold text-brand-600">+ Add child</button>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div><label className={lblCls}>Max occupancy</label><input className={inputCls} value={maxOcc} onChange={e => setMaxOcc(e.target.value)} /></div>
              <div><label className={lblCls}>Check-in</label><input type="date" className={inputCls} value={checkIn} onChange={e => { setCheckIn(e.target.value); setCheckOut(plusDays(e.target.value, 7)); setProrateDays(daysThroughSunday(e.target.value)); }} /></div>
              <div><label className={lblCls}>Check-out</label><input type="date" className={inputCls} value={checkOut} onChange={e => setCheckOut(e.target.value)} /></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div><label className={lblCls}>Weekly payment ($)</label><input type="number" className={inputCls} value={weekly} onChange={e => setWeekly(e.target.value)} /></div>
              <div><label className={lblCls}>Security deposit ($)</label><input type="number" className={inputCls} value={deposit} onChange={e => setDeposit(e.target.value)} /></div>
              <div><label className={lblCls}>Cleaning fee ($)</label><input type="number" className={inputCls} value={cleaning} onChange={e => setCleaning(e.target.value)} /></div>
              <div><label className={lblCls}>Pet fee ($)</label><input type="number" className={inputCls} value={petFee} onChange={e => setPetFee(e.target.value)} /></div>
            </div>
            <p className="mt-2 text-sm font-bold text-iron-900">TOTAL: ${totals.total.toLocaleString()} <span className="text-iron-800 font-normal text-xs">(due upon occupancy / balance due)</span></p>

            <div className="mt-3 rounded-xl border border-iron-200 bg-iron-50 p-3">
              <p className="text-[11px] font-bold text-iron-700">✓ Included automatically in every agreement:</p>
              <ul className="mt-1.5 space-y-1">
                <li className="text-[10.5px] text-iron-800 leading-snug">• 4-week minimum stay + 72-hour notice for full deposit refund</li>
                <li className="text-[10.5px] text-iron-800 leading-snug">• $200 fine for smoking or unauthorized animal/fish/pet</li>
                <li className="text-[10.5px] text-iron-800 leading-snug">• $200 fine per item hung on or attached to the walls</li>
              </ul>
            </div>

            <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50/60 p-3">
              <p className="text-[11px] font-bold text-iron-700">Move-in money — auto-calculated from the numbers above</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-[10px] font-semibold text-iron-700">App fee ($) {appFeeOnLedger && <span className="text-green-700">✓ paid</span>}</label>
                  <input type="number" className={inputCls} value={appFee} onChange={e => setAppFee(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-iron-700">Hold paid ($) {holdOnLedger && <span className="text-green-700">✓ paid</span>}</label>
                  <input type="number" className={inputCls} value={holdPaid} onChange={e => setHoldPaid(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 rounded-lg bg-white/70 border border-iron-200 px-3 py-2">
                <div>
                  <p className="text-[10px] font-semibold text-iron-700">Prorated days</p>
                  <p className="text-[10.5px] text-iron-800">{prorateDays} day{prorateDays === 1 ? '' : 's'} × ${Math.ceil(dailyRate)}/day</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-iron-200 bg-white overflow-hidden">
                    <button onClick={() => setProrateDays(d => Math.max(1, d - 1))} className="px-2.5 py-1.5 text-iron-800 font-bold hover:bg-iron-50">−</button>
                    <span className="w-6 text-center text-sm font-bold text-iron-900">{prorateDays}</span>
                    <button onClick={() => setProrateDays(d => Math.min(7, d + 1))} className="px-2.5 py-1.5 text-iron-800 font-bold hover:bg-iron-50">+</button>
                  </div>
                  <span className="w-12 text-right text-sm font-bold text-iron-900">${prorateAmt}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5 rounded-lg bg-white/70 border border-iron-200 px-3 py-2">
                <div>
                  <p className="text-[10px] font-semibold text-iron-700">Buffer day</p>
                  <p className="text-[10.5px] text-iron-800">1/7 of the weekly rate</p>
                </div>
                <span className="text-sm font-bold text-iron-900">${bufferAmt}</span>
              </div>
              <p className="mt-2 text-xs font-bold text-iron-900">Due at move-in (prorate + buffer): ${(prorateAmt + bufferAmt).toLocaleString()} <span className="font-normal text-iron-800">— record it on move-in day, not here</span></p>
              <button onClick={regenSpecial} className="mt-2 flex items-center gap-1.5 text-xs font-bold text-brand-700"><RefreshCw size={12} /> Write it for me</button>
              <textarea className={`${inputCls} mt-2 resize-y`} rows={6} value={special} onChange={e => setSpecial(e.target.value)}
                placeholder='Tap "Write it for me" to auto-compose the move-in money story from the numbers above.' />
            </div>

            <label className={lblCls}>Canyon representative</label>
            <input className={inputCls} value={repName} onChange={e => setRepName(e.target.value)} />

            <label className={lblCls}>Email the signing link to</label>
            <div className="rounded-xl border border-iron-200 divide-y divide-iron-100">
              {guests.filter(g => g.name.trim() && g.email.trim()).map(g => {
                const email = g.email.trim();
                const on = recipients.includes(email);
                return (
                  <label key={email} className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={on}
                      onChange={e => setRecipients(prev => e.target.checked ? [...prev, email] : prev.filter(r => r !== email))}
                      className="w-4 h-4 accent-[#B84309]" />
                    <span className="font-semibold text-iron-900">{g.name}</span>
                    <span className="text-xs text-iron-800 truncate">{email}</span>
                  </label>
                );
              })}
              {guests.filter(g => g.name.trim() && g.email.trim()).length === 0 && (
                <p className="px-3 py-2.5 text-xs text-iron-800">Add an email to at least one guest above.</p>
              )}
            </div>
            <p className="mt-1 text-[10.5px] text-iron-800">Everyone checked gets the same link — each adult signs on it in turn. When the last one signs, all of them are emailed the finished copy.</p>

            {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
            <button onClick={preview} disabled={previewing}
              className="mt-4 w-full rounded-xl border-2 border-iron-300 py-3 text-sm font-bold text-iron-800 hover:bg-iron-50 disabled:opacity-50 transition-colors">
              {previewing ? 'Building preview…' : '👁 Preview the PDF first'}
            </button>
            <button onClick={send} disabled={sending}
              className="mt-2 mb-2 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-sm font-bold text-white shadow-lg disabled:opacity-50">
              {sending ? 'Sending…' : `Send for signature → ${recipients.length || 'no'} recipient${recipients.length === 1 ? '' : 's'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
