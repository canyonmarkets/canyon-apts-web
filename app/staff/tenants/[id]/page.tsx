'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Phone, Mail, Plus, X, KeyRound, Hash, Pencil, Banknote, Send, Zap } from 'lucide-react';
import { CITIES } from '@/lib/cities';
import { RecordPaymentModal, MoveInWizard } from '@/app/staff/_components/RecordPayment';
import { EmailModal, type EmailVars } from '@/app/staff/_components/EmailModal';
import { AgreementWizard } from '@/app/staff/_components/AgreementWizard';
import { currentMonday, fmtWeek } from '@/lib/rent';

interface Person { id: string; is_primary: boolean; name: string; phone: string | null; email: string | null; }
interface Unit {
  id: string; title: string; complex_name: string | null; unit_number: string | null;
  city: string; bedrooms: number; entry_type: string | null; keypad_code: string | null;
  utility_credit_monthly: number | null; street_address: string | null;
}
interface Payment { id: string; week_due: string | null; type: string; amount: number; method: string | null; paid_at: string; late: boolean; note: string | null; }
interface UtilityCharge { id: string; month: string; bill_amount: number | null; credit: number | null; overage: number; status: string; emailed_at: string | null; created_at: string; }
interface TenancyEvent { id: string; type: string; note: string | null; created_at: string; }
interface Doc { id: string; name: string; created_at: string; }
interface MessageRow { id: string; type: string; recipient: string | null; sent_at: string; meta: { subject?: string; automated?: boolean } | null; }
interface Tenancy {
  id: string; weekly_rate: number; status: 'active' | 'moved_out';
  move_in: string | null; move_out: string | null; notice_given_at: string | null;
  deposit_total: number; deposit_status: 'holding' | 'returned' | 'kept'; deposit_returned_amount: number | null;
  kids: number | null; pets: string | null; notes: string | null;
  tenants: Person[]; units: Unit | null;
}

const PAY_LABELS: Record<string, string> = {
  rent: 'Rent', late_fee: 'Late fee', deposit: 'Deposit', application_fee: 'App fee',
  prorate: 'Prorate', buffer_day: 'Buffer day', utility_overage: 'Utility overage', other: 'Other',
};
const METHOD_LABELS: Record<string, string> = { zelle: 'Zelle', venmo: 'Venmo', cash: 'Cash', cashapp: 'CashApp', other: 'Other' };

function fmtMoney(n: number) { return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso.includes('T') ? iso : iso + 'T12:00:00').toLocaleDateString('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tenancy, setTenancy] = useState<Tenancy | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [utility, setUtility] = useState<UtilityCharge[]>([]);
  const [editRate, setEditRate] = useState(false);
  const [rateVal, setRateVal] = useState('');
  const [addPerson, setAddPerson] = useState(false);
  const [personForm, setPersonForm] = useState({ name: '', phone: '', email: '' });
  const [notesVal, setNotesVal] = useState('');
  const [notesDirty, setNotesDirty] = useState(false);
  const [showMoveOut, setShowMoveOut] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [showMoveIn, setShowMoveIn] = useState(false);
  const [events, setEvents] = useState<TenancyEvent[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [grantingExt, setGrantingExt] = useState(false);
  const [showEmail, setShowEmail] = useState<string | null>(null); // template key or '' for scratch
  const [emailBillVars, setEmailBillVars] = useState<{ bill?: string; credit?: string; overage?: string }>({});
  const [showBill, setShowBill] = useState(false);
  const [billForm, setBillForm] = useState({ month: '', bill: '', credit: '' });
  const [showAgreement, setShowAgreement] = useState(false);
  const [showAutoEmails, setShowAutoEmails] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/staff/tenants/${id}`);
    if (!res.ok) { router.push('/staff/tenants'); return; }
    const d = await res.json();
    setTenancy(d.tenancy);
    setPayments(d.payments);
    setUtility(d.utility_charges);
    setEvents(d.events ?? []);
    setMessages(d.messages ?? []);
    setDocs(d.documents ?? []);
    setNotesVal(d.tenancy.notes ?? '');
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/staff/tenants/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) await load();
  };

  if (!tenancy) {
    return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" /></div>;
  }

  const primary = tenancy.tenants.find(p => p.is_primary) ?? tenancy.tenants[0];
  const unit = tenancy.units;
  const cityName = unit ? (CITIES.find(c => c.slug === unit.city)?.name ?? unit.city) : null;
  const depositPaid = payments.filter(p => p.type === 'deposit').reduce((s, p) => s + Number(p.amount), 0);
  const appFeePaid = payments.filter(p => p.type === 'application_fee').reduce((s, p) => s + Number(p.amount), 0);
  const extensionsUsed = events.filter(e => e.type === 'extension_used');
  const noticeHours = tenancy.notice_given_at && tenancy.move_out
    ? (new Date(tenancy.move_out + 'T10:00:00-07:00').getTime() - new Date(tenancy.notice_given_at).getTime()) / 36e5
    : null;

  return (
    <div className="space-y-4">
      <button onClick={() => router.push('/staff/tenants')} className="flex items-center gap-1 text-sm text-iron-800 hover:text-iron-700">
        <ChevronLeft size={16} /> Tenants
      </button>

      {/* Header */}
      <div className="bg-iron-900 rounded-2xl px-5 py-4 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-white">{primary?.name ?? '—'}</h1>
          {tenancy.status === 'moved_out'
            ? <span className="text-xs font-medium px-2 py-1 rounded-lg bg-iron-700 text-iron-300 shrink-0">Moved out {fmtDate(tenancy.move_out)}</span>
            : <span className="text-xs font-medium px-2 py-1 rounded-lg bg-green-500/20 text-green-300 shrink-0">Active</span>}
        </div>
        <p className="text-iron-300 text-xs">
          {unit ? `${unit.complex_name || unit.title}${unit.unit_number ? ' #' + unit.unit_number : ''} · ${unit.bedrooms}BR · ${cityName}` : 'No unit assigned'}
          {tenancy.move_in ? ` · since ${fmtDate(tenancy.move_in)}` : ''}
        </p>
        {extensionsUsed.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300">
            ⚡ {extensionsUsed.length === 1 ? 'One-time extension USED' : `${extensionsUsed.length} extensions used`} · last {fmtDate(extensionsUsed[0].created_at)}
          </span>
        )}
        <div className="flex items-center gap-2 pt-1">
          {editRate ? (
            <span className="flex items-center gap-2">
              <input autoFocus type="number" value={rateVal} onChange={e => setRateVal(e.target.value)}
                className="w-24 rounded-lg bg-white/10 border border-white/20 px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <button onClick={async () => { await patch({ weekly_rate: Number(rateVal) || 0 }); setEditRate(false); }}
                className="text-xs font-bold text-white bg-brand-600 rounded-lg px-2.5 py-1.5 hover:bg-brand-500">Save</button>
              <button onClick={() => setEditRate(false)} className="text-xs text-iron-300 hover:text-white">Cancel</button>
            </span>
          ) : (
            <button onClick={() => { setRateVal(String(tenancy.weekly_rate)); setEditRate(true); }}
              className="flex items-center gap-1.5 text-brand-400 font-bold text-lg hover:text-brand-300">
              {fmtMoney(tenancy.weekly_rate)}<span className="text-xs font-normal text-iron-300">/wk</span>
              <Pencil size={12} className="text-iron-300" />
            </button>
          )}
        </div>
      </div>

      {/* People */}
      <div className="bg-white rounded-2xl border border-iron-100 divide-y divide-iron-50">
        {tenancy.tenants.map(p => (
          <div key={p.id} className="px-4 py-3 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-iron-900 text-sm truncate">
                {p.name} {p.is_primary && <span className="text-[10px] font-medium text-brand-600 bg-brand-50 rounded px-1.5 py-0.5 ml-1">PRIMARY</span>}
              </p>
              {p.email && <p className="text-iron-800 text-xs truncate">{p.email}</p>}
            </div>
            {p.phone && (
              <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 rounded-lg border border-iron-200 px-3 py-2 text-xs font-medium text-iron-700 hover:border-brand-300 hover:text-brand-700 shrink-0">
                <Phone size={13} /> {p.phone}
              </a>
            )}
            {p.email && (
              <a href={`mailto:${p.email}`} className="flex items-center justify-center rounded-lg border border-iron-200 px-2.5 py-2 text-iron-600 hover:border-brand-300 shrink-0">
                <Mail size={13} />
              </a>
            )}
            {!p.is_primary && (
              <button onClick={async () => {
                if (!window.confirm(`Remove ${p.name}?`)) return;
                await fetch(`/api/staff/tenants/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenant_id: p.id }) });
                await load();
              }} className="text-iron-600 hover:text-red-500 shrink-0 px-1"><X size={14} /></button>
            )}
          </div>
        ))}
        <div className="px-4 py-3">
          {addPerson ? (
            <div className="space-y-2">
              <input className="w-full rounded-xl border border-iron-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Name"
                value={personForm.name} onChange={e => setPersonForm(f => ({ ...f, name: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="w-full rounded-xl border border-iron-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Phone (optional)"
                  value={personForm.phone} onChange={e => setPersonForm(f => ({ ...f, phone: e.target.value }))} />
                <input className="w-full rounded-xl border border-iron-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Email (optional)"
                  value={personForm.email} onChange={e => setPersonForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <button onClick={async () => {
                  if (!personForm.name.trim()) return;
                  await fetch(`/api/staff/tenants/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(personForm) });
                  setPersonForm({ name: '', phone: '', email: '' });
                  setAddPerson(false);
                  await load();
                }} className="flex-1 rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white hover:bg-brand-700">Add person</button>
                <button onClick={() => setAddPerson(false)} className="rounded-xl border border-iron-200 px-4 text-xs text-iron-800">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddPerson(true)} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700">
              <Plus size={13} /> Add person staying
            </button>
          )}
        </div>
      </div>

      {/* Unit access info */}
      {unit && (
        <div className="bg-white rounded-2xl border border-iron-100 px-4 py-3 flex items-center gap-3">
          {unit.entry_type === 'keypad'
            ? <Hash size={16} className="text-brand-500 shrink-0" />
            : <KeyRound size={16} className="text-brand-500 shrink-0" />}
          <div className="flex-1 text-sm">
            <span className="text-iron-800">Entry: </span>
            <span className="font-semibold text-iron-900">
              {unit.entry_type === 'keypad' ? `Keypad${unit.keypad_code ? ' · code ' + unit.keypad_code : ''}` : unit.entry_type === 'key' ? 'Metal key' : 'Not set'}
            </span>
            {unit.utility_credit_monthly != null && <span className="text-iron-800 text-xs"> · {fmtMoney(unit.utility_credit_monthly)}/mo utility credit</span>}
          </div>
          <button onClick={() => router.push(`/staff/inventory/${unit.id}`)} className="text-xs font-semibold text-brand-600 hover:text-brand-700 shrink-0">Edit unit</button>
        </div>
      )}

      {/* Deposit */}
      <div className="bg-white rounded-2xl border border-iron-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide">Deposit</p>
          <p className="text-sm font-bold text-iron-900">{fmtMoney(depositPaid)} <span className="text-iron-800 font-normal">of {fmtMoney(tenancy.deposit_total)}</span></p>
        </div>
        <div className="h-2 rounded-full bg-iron-100 overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${Math.min(100, (depositPaid / (tenancy.deposit_total || 1)) * 100)}%` }} />
        </div>
        <div className="flex gap-1.5">
          {([['holding', 'Holding'], ['returned', 'Returned'], ['kept', 'Kept (default)']] as const).map(([value, label]) => (
            <button key={value} onClick={() => patch({ deposit_status: value })}
              className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${tenancy.deposit_status === value
                ? value === 'kept' ? 'bg-red-600 text-white' : value === 'returned' ? 'bg-green-600 text-white' : 'bg-brand-600 text-white'
                : 'bg-iron-50 text-iron-800 hover:bg-iron-100'}`}>
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-iron-800">Deposit return requires 72-hour notice + 4-week minimum stay. Splitting into two payments is fine — the bar fills as deposit payments are recorded.</p>
      </div>

      {/* Money collected so far — derived from the ledger, feeds the agreement wizard */}
      <div className="flex gap-2">
        <span className={`flex-1 text-center rounded-xl px-3 py-2 text-xs font-semibold ${appFeePaid > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-iron-50 text-iron-500 border border-iron-100'}`}>
          {appFeePaid > 0 ? `✓ App fee paid — ${fmtMoney(appFeePaid)}` : 'App fee not paid yet'}
        </span>
        <span className={`flex-1 text-center rounded-xl px-3 py-2 text-xs font-semibold ${depositPaid > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-iron-50 text-iron-500 border border-iron-100'}`}>
          {depositPaid > 0 ? `✓ Hold/deposit paid — ${fmtMoney(depositPaid)}` : 'Hold not paid yet'}
        </span>
      </div>

      {/* Record payment / send email / move-in charges */}
      {tenancy.status === 'active' && (
        <>
          <div className="flex gap-2">
            <button onClick={() => setShowPay(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white hover:bg-brand-700 transition-colors">
              <Banknote size={16} /> Record Payment
            </button>
            <button onClick={() => { setEmailBillVars({}); setShowEmail(''); }}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-iron-200 py-3.5 text-sm font-bold text-iron-700 hover:border-brand-300 hover:text-brand-700 transition-colors">
              <Send size={15} /> Send Email
            </button>
          </div>
          {!payments.some(p => p.type === 'prorate' || p.type === 'buffer_day') && (
            <button onClick={() => setShowMoveIn(true)}
              className="w-full rounded-xl border-2 border-brand-200 bg-brand-50 py-3.5 text-sm font-bold text-brand-700 hover:bg-brand-100 transition-colors">
              Record Move-In Charges
            </button>
          )}
          <button onClick={() => { setEmailBillVars({}); setGrantingExt(true); setShowEmail('late_extension'); }}
            className="w-full rounded-xl border-2 border-amber-300 bg-amber-50 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition-colors">
            ⚡ Grant Late Extension {extensionsUsed.length > 0 && <span className="font-normal">(already used {extensionsUsed.length}×)</span>}
          </button>
          <button onClick={() => setShowAgreement(true)}
            className="w-full rounded-xl border-2 border-iron-300 bg-iron-50 py-3 text-sm font-bold text-iron-800 hover:bg-iron-100 transition-colors">
            📄 Send Rental Agreement
          </button>
          {showAgreement && (
            <AgreementWizard
              tenancyId={id}
              address={unit?.street_address || (unit ? `${unit.title}, ${unit.city.charAt(0).toUpperCase() + unit.city.slice(1)}, AZ` : '')}
              people={tenancy.tenants.map(p => ({ name: p.name, email: p.email, phone: p.phone }))}
              weeklyRate={Number(tenancy.weekly_rate)}
              pets={tenancy.pets}
              alreadyPaid={{ appFee: appFeePaid, hold: depositPaid }}
              onClose={() => setShowAgreement(false)}
              onSent={load}
            />
          )}
        </>
      )}
      {showPay && (
        <RecordPaymentModal tenancyId={id} weeklyRate={tenancy.weekly_rate} onDone={load} onClose={() => setShowPay(false)} />
      )}
      {showMoveIn && (
        <MoveInWizard tenancyId={id} weeklyRate={tenancy.weekly_rate} moveIn={tenancy.move_in} alreadyPaid={{ appFee: appFeePaid, hold: depositPaid }} onDone={load} onClose={() => setShowMoveIn(false)} />
      )}
      {showEmail !== null && (
        <EmailModal
          tenancyId={id}
          defaultTo={primary?.email ?? ''}
          defaultTemplateKey={showEmail || undefined}
          vars={{
            name: primary?.name?.split(' ')[0] ?? 'there',
            amount: fmtMoney(tenancy.weekly_rate),
            total: fmtMoney(Number(tenancy.weekly_rate) + 50),
            credit: emailBillVars.credit ?? fmtMoney(unit?.utility_credit_monthly ?? (unit && unit.bedrooms >= 2 ? 150 : 100)),
            bill: emailBillVars.bill,
            overage: emailBillVars.overage,
            unit: unit ? `${unit.complex_name || unit.title}${unit.unit_number ? ' #' + unit.unit_number : ''}` : '',
            week: fmtWeek(currentMonday()),
          } as EmailVars}
          onSent={grantingExt ? async () => {
            await fetch('/api/staff/tenant-events', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tenancy_id: id, type: 'extension_used', note: `Granted for the week of ${fmtWeek(currentMonday())}` }),
            });
            await load();
          } : undefined}
          onClose={() => { setShowEmail(null); setGrantingExt(false); }}
        />
      )}

      {/* Activity Log — payments, emails, extensions, bills, lifecycle, all in one */}
      {(() => {
        const MSG_LABELS: Record<string, string> = {
          late_fee: 'Late payment notice sent', utility_overage: 'Overage notice sent',
          checkout_instructions: 'Checkout instructions sent', late_extension: 'Extension confirmation sent',
          tenant_custom: 'Email sent',
        };
        interface FeedItem { key: string; ts: string; badge: string; badgeCls: string; text: string; amount?: number; paymentId?: string; }
        const feed: FeedItem[] = [
          ...payments.map(p => ({
            key: 'p' + p.id, ts: p.paid_at,
            badge: PAY_LABELS[p.type] ?? p.type,
            badgeCls: p.type === 'rent' ? 'bg-brand-50 text-brand-700' : p.type === 'late_fee' ? 'bg-red-50 text-red-600' : p.type === 'deposit' ? 'bg-green-50 text-green-700' : p.type === 'utility_overage' ? 'bg-purple-50 text-purple-700' : p.type === 'application_fee' ? 'bg-blue-50 text-blue-700' : p.type === 'prorate' || p.type === 'buffer_day' ? 'bg-teal-50 text-teal-700' : 'bg-iron-100 text-iron-600',
            text: `${p.week_due ? `wk of ${fmtDate(p.week_due)}` : fmtDate(p.paid_at)}${p.method ? ` · ${METHOD_LABELS[p.method] ?? p.method}` : ''}${p.late ? ' · LATE' : ''}${p.note ? ` · ${p.note}` : ''}`,
            amount: Number(p.amount),
            paymentId: p.id,
          })),
          ...events.map(ev => {
            const n = ev.note ?? '';
            const [badge, badgeCls] =
              ev.type === 'extension_used' ? ['⚡ Extension', 'bg-amber-50 text-amber-700']
              : n.startsWith('📄') ? ['📄 Agreement', 'bg-blue-50 text-blue-700']
              : n.startsWith('✍️') ? ['✍️ Signed', 'bg-green-50 text-green-700']
              : n.startsWith('🪪') ? ['🪪 Photo ID', 'bg-teal-50 text-teal-700']
              : n.startsWith('🤳') ? ['🤳 Selfie', 'bg-teal-50 text-teal-700']
              : ['Event', 'bg-amber-50 text-amber-700'];
            return {
              key: 'e' + ev.id, ts: ev.created_at,
              badge, badgeCls,
              text: ev.type === 'extension_used' ? `One-time extension granted${ev.note ? ` · ${ev.note}` : ''}` : (ev.note ?? ev.type),
            };
          }),
          ...messages.filter(m => !m.meta?.automated).map(m => ({
            key: 'm' + m.id, ts: m.sent_at,
            badge: '✉ Email',
            badgeCls: 'bg-blue-50 text-blue-700',
            text: `${MSG_LABELS[m.type] ?? 'Email sent'}${m.meta?.subject ? ` · “${m.meta.subject}”` : ''}`,
          })),
          ...utility.map(u => ({
            key: 'u' + u.id, ts: u.created_at,
            badge: 'Utility bill',
            badgeCls: 'bg-purple-50 text-purple-700',
            text: `${new Date(u.month + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — overage ${fmtMoney(u.overage)} (${u.status})`,
          })),
        ];
        // Automated emails (rent reminders, blasts) collapse into one expandable row
        const autoMsgs = messages.filter(m => m.meta?.automated).sort((a, b) => b.sent_at.localeCompare(a.sent_at));
        if (autoMsgs.length > 0) {
          feed.push({ key: 'autogrp', ts: autoMsgs[0].sent_at, badge: '🤖 Auto-email', badgeCls: 'bg-iron-100 text-iron-600', text: `${autoMsgs.length} automated email${autoMsgs.length === 1 ? '' : 's'} — reminders & blasts` });
        }
        if (tenancy.move_in) feed.push({ key: 'mi', ts: tenancy.move_in + 'T12:00:00Z', badge: '🏠 Move-in', badgeCls: 'bg-green-50 text-green-700', text: `Moved in at ${fmtMoney(tenancy.weekly_rate)}/wk` });
        if (tenancy.notice_given_at) feed.push({ key: 'ng', ts: tenancy.notice_given_at, badge: 'Notice', badgeCls: 'bg-amber-50 text-amber-700', text: 'Notice of vacancy recorded (72-hour clock started)' });
        if (tenancy.move_out) feed.push({ key: 'mo', ts: tenancy.move_out + 'T12:00:00Z', badge: 'Move-out', badgeCls: 'bg-iron-100 text-iron-600', text: `Moved out · deposit ${tenancy.deposit_status}` });
        feed.sort((a, b) => b.ts.localeCompare(a.ts));

        return (
          <div className="bg-white rounded-2xl border border-iron-100">
            <div className="px-4 py-3 border-b border-iron-50 flex items-center justify-between">
              <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide">Activity Log</p>
              <span className="text-[11px] text-iron-800">{feed.length} entries</span>
            </div>
            {feed.length === 0 && <p className="px-4 py-6 text-center text-iron-800 text-sm">Nothing recorded yet</p>}
            <div className="divide-y divide-iron-50 max-h-80 overflow-y-auto">
              {feed.map(item => item.key === 'autogrp' ? (
                <div key={item.key}>
                  <button onClick={() => setShowAutoEmails(v => !v)} className="w-full px-4 py-2.5 flex items-center gap-2 text-sm hover:bg-iron-50 transition-colors">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg shrink-0 ${item.badgeCls}`}>{item.badge}</span>
                    <span className="flex-1 text-xs text-iron-800 truncate text-left">
                      <span className="text-iron-800">{fmtDate(item.ts)} · </span>{item.text}
                    </span>
                    <span className="text-iron-600 font-bold text-base leading-none shrink-0">{showAutoEmails ? '−' : '+'}</span>
                  </button>
                  {showAutoEmails && autoMsgs.map(m => (
                    <div key={m.id} className="px-4 py-2 pl-12 text-[11px] text-iron-700 bg-iron-50/60">
                      {fmtDate(m.sent_at)} · {MSG_LABELS[m.type] ?? 'Email sent'}{m.meta?.subject ? ` · “${m.meta.subject}”` : ''}
                    </div>
                  ))}
                </div>
              ) : (
                <div key={item.key} className="px-4 py-2.5 flex items-center gap-2 text-sm">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg shrink-0 ${item.badgeCls}`}>{item.badge}</span>
                  <span className="flex-1 text-xs text-iron-800 truncate">
                    <span className="text-iron-800">{fmtDate(item.ts)} · </span>{item.text}
                  </span>
                  {item.amount != null && <span className="font-semibold text-iron-900 shrink-0">{fmtMoney(item.amount)}</span>}
                  {item.paymentId && (
                    <button onClick={async () => {
                      if (!window.confirm(`Delete this ${fmtMoney(item.amount ?? 0)} payment? This removes it from the ledger and all reports.`)) return;
                      await fetch('/api/staff/payments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.paymentId }) });
                      await load();
                    }} className="text-iron-400 hover:text-red-500 shrink-0 px-0.5" title="Delete payment"><X size={13} /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Utility overages */}
      {tenancy.status === 'active' && (
        <div className="bg-white rounded-2xl border border-iron-100">
          <div className="px-4 py-3 border-b border-iron-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide flex items-center gap-1.5"><Zap size={12} className="text-purple-500" /> Utility overages</p>
            <button onClick={() => {
              const prev = new Date(); prev.setMonth(prev.getMonth() - 1);
              const defaultCredit = unit?.utility_credit_monthly ?? (unit && unit.bedrooms >= 2 ? 150 : 100);
              setBillForm({ month: prev.toISOString().slice(0, 7), bill: '', credit: String(defaultCredit) });
              setShowBill(v => !v);
            }} className="text-xs font-semibold text-brand-600 hover:text-brand-700">+ Enter bill</button>
          </div>
          {showBill && (
            <div className="px-4 py-3 border-b border-iron-50 space-y-2 bg-iron-50/50">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] font-semibold text-iron-800 mb-1">Month</p>
                  <input type="month" value={billForm.month} onChange={e => setBillForm(f => ({ ...f, month: e.target.value }))}
                    className="w-full rounded-lg border border-iron-200 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-iron-800 mb-1">Bill ($)</p>
                  <input type="number" inputMode="decimal" placeholder="175" value={billForm.bill} onChange={e => setBillForm(f => ({ ...f, bill: e.target.value }))}
                    className="w-full rounded-lg border border-iron-200 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-iron-800 mb-1">Credit ($)</p>
                  <input type="number" inputMode="decimal" value={billForm.credit} onChange={e => setBillForm(f => ({ ...f, credit: e.target.value }))}
                    className="w-full rounded-lg border border-iron-200 px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              {Number(billForm.bill) > 0 && (
                <p className="text-xs font-medium text-iron-600">
                  Overage: <b className={Number(billForm.bill) - Number(billForm.credit) > 0 ? 'text-purple-700' : 'text-green-700'}>
                    {fmtMoney(Math.max(0, Number(billForm.bill) - Number(billForm.credit)))}
                  </b>
                  {Number(billForm.bill) <= Number(billForm.credit) && ' — under the credit, nothing owed'}
                </p>
              )}
              <button onClick={async () => {
                const res = await fetch('/api/staff/utility', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tenancy_id: id, month: billForm.month, bill_amount: billForm.bill, credit: billForm.credit }),
                });
                if (res.ok) { setShowBill(false); await load(); }
              }} disabled={!billForm.month || billForm.bill === ''}
                className="w-full rounded-xl bg-brand-600 py-2.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
                Save bill
              </button>
            </div>
          )}
          {utility.length === 0 && !showBill && (
            <p className="px-4 py-4 text-center text-iron-800 text-xs">No bills entered — tap &quot;+ Enter bill&quot; when the monthly utility bill arrives. The overage math happens automatically.</p>
          )}
          <div className="divide-y divide-iron-50">
            {utility.map(u => (
              <div key={u.id} className="px-4 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-iron-600 font-medium">{new Date(u.month + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    <span className="text-iron-800 font-normal"> · bill {fmtMoney(u.bill_amount ?? 0)} − credit {fmtMoney(u.credit ?? 0)}</span>
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${u.status === 'collected' ? 'bg-green-50 text-green-700' : u.status === 'waived' ? 'bg-iron-100 text-iron-800' : 'bg-amber-50 text-amber-700'}`}>{u.status}</span>
                  <span className="font-semibold text-iron-900">{fmtMoney(u.overage)}</span>
                </div>
                {u.status === 'pending' && (
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => {
                      setEmailBillVars({ bill: fmtMoney(u.bill_amount ?? 0), credit: fmtMoney(u.credit ?? 0), overage: fmtMoney(u.overage) });
                      setShowEmail('utility_overage');
                      fetch('/api/staff/utility', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, action: 'mark_emailed' }) });
                    }} className="flex-1 rounded-lg bg-purple-50 border border-purple-200 py-2 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors">
                      {u.emailed_at ? 'Email again' : 'Send overage email'}
                    </button>
                    <button onClick={async () => {
                      await fetch('/api/staff/utility', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, action: 'collect', week_due: currentMonday(), method: 'zelle' }) });
                      await load();
                    }} className="flex-1 rounded-lg bg-green-50 border border-green-200 py-2 text-[11px] font-semibold text-green-700 hover:bg-green-100 transition-colors">
                      Mark collected
                    </button>
                    <button onClick={async () => {
                      await fetch('/api/staff/utility', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: u.id, action: 'waive' }) });
                      await load();
                    }} className="rounded-lg border border-iron-200 px-3 py-2 text-[11px] font-medium text-iron-800 hover:bg-iron-50 transition-colors">
                      Waive
                    </button>
                  </div>
                )}
                {u.emailed_at && <p className="text-[10px] text-iron-800 mt-1">Emailed {fmtDate(u.emailed_at)}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-iron-100">
        <div className="px-4 py-3 border-b border-iron-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide">Documents</p>
          <label className={`text-xs font-semibold cursor-pointer ${uploadingDoc ? 'text-iron-800' : 'text-brand-600 hover:text-brand-700'}`}>
            {uploadingDoc ? 'Uploading…' : '+ Upload'}
            <input type="file" className="hidden" disabled={uploadingDoc} onChange={async e => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingDoc(true);
              const fd = new FormData();
              fd.append('file', file);
              fd.append('tenancy_id', id);
              fd.append('tenant_name', primary?.name ?? '');
              await fetch('/api/staff/documents', { method: 'POST', body: fd });
              setUploadingDoc(false);
              e.target.value = '';
              await load();
            }} />
          </label>
        </div>
        {docs.length === 0 && <p className="px-4 py-4 text-center text-iron-800 text-xs">No documents — upload the rental agreement here. It also appears in the main Documents vault, searchable by name.</p>}
        <div className="divide-y divide-iron-50">
          {docs.map(doc => (
            <div key={doc.id} className="px-4 py-2.5 flex items-center gap-2 text-sm">
              <button onClick={async () => {
                const res = await fetch('/api/staff/documents', {
                  method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: doc.id, action: 'sign' }),
                });
                if (res.ok) { const d = await res.json(); window.open(d.url, '_blank'); }
              }} className="flex-1 min-w-0 text-left">
                <p className="font-medium text-iron-900 text-sm truncate underline-offset-2 hover:underline">{doc.name}</p>
              </button>
              <span className="text-[11px] text-iron-800 shrink-0">{fmtDate(doc.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-iron-100 p-4 space-y-2">
        <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide">Notes</p>
        <textarea value={notesVal} onChange={e => { setNotesVal(e.target.value); setNotesDirty(true); }}
          rows={3} placeholder="Anything worth remembering about this tenancy…"
          className="w-full rounded-xl border border-iron-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
        {notesDirty && (
          <button onClick={async () => { await patch({ notes: notesVal }); setNotesDirty(false); }}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700">Save notes</button>
        )}
      </div>

      {/* Move-out flow */}
      {tenancy.status === 'active' && (
        <div className="bg-white rounded-2xl border border-iron-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide">Move-out</p>
          {tenancy.notice_given_at
            ? <p className="text-sm text-iron-700 flex items-center justify-between gap-2">
                <span>✓ Notice given <b>{fmtDate(tenancy.notice_given_at)}</b> at {new Date(tenancy.notice_given_at).toLocaleTimeString('en-US', { timeZone: 'America/Phoenix', hour: 'numeric', minute: '2-digit' })}</span>
                <button onClick={async () => {
                  if (!window.confirm('Clear the notice of vacancy? The 72-hour clock resets as if it was never recorded.')) return;
                  await patch({ notice_given_at: null });
                }} className="text-xs font-semibold text-iron-500 hover:text-red-600 shrink-0">✕ undo</button>
              </p>
            : <button onClick={() => patch({ notice_given_at: new Date().toISOString() })}
                className="w-full rounded-xl bg-iron-100 py-3 text-sm font-semibold text-iron-700 hover:bg-iron-200 transition-colors">
                Record notice of vacancy (starts the 72-hour clock)
              </button>}
          {!showMoveOut ? (
            <button onClick={() => setShowMoveOut(true)}
              className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              Mark moved out…
            </button>
          ) : (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 space-y-2">
              <p className="text-xs text-red-700">
                This marks the tenancy over as of today and flips the unit back to <b>Available</b> on the inventory.
                {tenancy.notice_given_at
                  ? ' Notice was given — check the 72-hour math before returning the deposit.'
                  : ' No notice was recorded — deposit is typically kept.'}
              </p>
              <div className="flex gap-2">
                <button onClick={async () => {
                  await patch({ status: 'moved_out', move_out: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' }) });
                  setShowMoveOut(false);
                }} className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700">Confirm move-out</button>
                <button onClick={() => setShowMoveOut(false)} className="rounded-xl border border-iron-200 bg-white px-4 text-xs text-iron-800">Cancel</button>
              </div>
              <button onClick={async () => {
                const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
                const forfeited = [appFeePaid > 0 ? `${fmtMoney(appFeePaid)} app fee` : '', depositPaid > 0 ? `${fmtMoney(depositPaid)} hold` : ''].filter(Boolean).join(' + ');
                await patch({
                  status: 'moved_out', move_out: today, deposit_status: 'kept',
                  notes: `${tenancy.notes ? tenancy.notes + '\n' : ''}🚫 Never moved in (${fmtDate(today)})${forfeited ? ` — forfeited ${forfeited}, kept as income` : ''}.`,
                });
                setShowMoveOut(false);
              }} className="w-full rounded-xl border border-red-300 bg-white py-2.5 text-xs font-bold text-red-600 hover:bg-red-100">
                🚫 Never moved in — keep {appFeePaid + depositPaid > 0 ? fmtMoney(appFeePaid + depositPaid) : 'fees'} as forfeited income
              </button>
            </div>
          )}
          {noticeHours !== null && (
            <p className="text-[11px] text-iron-800">Notice-to-move-out window: {Math.round(noticeHours)} hours {noticeHours >= 72 ? '— qualifies for deposit return ✓' : '— under 72 hours'}</p>
          )}
        </div>
      )}
    </div>
  );
}
