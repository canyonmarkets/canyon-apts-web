'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, AlertTriangle, Clock, Send } from 'lucide-react';
import { currentMonday, shiftMonday, fmtWeek, fmtWeekLong, weekPhase } from '@/lib/rent';
import { RecordPaymentModal } from '@/app/staff/_components/RecordPayment';
import { EmailModal } from '@/app/staff/_components/EmailModal';

interface Person { id: string; is_primary: boolean; name: string; phone: string | null; email?: string | null; }
interface Unit { id: string; title: string; complex_name: string | null; unit_number: string | null; }
interface Tenancy { id: string; weekly_rate: number; move_in: string | null; tenants: Person[]; units: Unit | null; }
interface Payment { id: string; tenancy_id: string; type: string; amount: number; method: string | null; late: boolean; }
interface Overage { id: string; tenancy_id: string; month: string; overage: number; }

type RowStatus = 'paid' | 'partial' | 'due';

function fmtMoney(n: number) { return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }); }

export default function RentDayPage() {
  const router = useRouter();
  const [week, setWeek] = useState(currentMonday());
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [overages, setOverages] = useState<Overage[]>([]);
  const [loading, setLoading] = useState(true);
  const [payFor, setPayFor] = useState<Tenancy | null>(null);
  const [emailFor, setEmailFor] = useState<Tenancy | null>(null);

  const load = useCallback(async (w: string) => {
    setLoading(true);
    const res = await fetch(`/api/staff/rent?week=${w}`);
    if (res.ok) {
      const d = await res.json();
      setTenancies(d.tenancies);
      setPayments(d.payments);
      setOverages(d.pending_overages);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(week); }, [week, load]);

  const isCurrentWeek = week === currentMonday();
  const phase = weekPhase(week);

  // Per-tenancy math for this week
  const rows = tenancies
    // A tenancy only owes for weeks on/after its move-in week
    .filter(t => !t.move_in || t.move_in <= week)
    .map(t => {
      const pays = payments.filter(p => p.tenancy_id === t.id);
      const rentPaid = pays.filter(p => p.type === 'rent').reduce((s, p) => s + Number(p.amount), 0);
      const feesPaid = pays.filter(p => p.type === 'late_fee').reduce((s, p) => s + Number(p.amount), 0);
      const overagePaid = pays.filter(p => p.type === 'utility_overage').reduce((s, p) => s + Number(p.amount), 0);
      const pendingOverage = overages.filter(o => o.tenancy_id === t.id).reduce((s, o) => s + Number(o.overage), 0);
      const wasLate = pays.some(p => p.late);
      const status: RowStatus = rentPaid >= t.weekly_rate && t.weekly_rate > 0 ? 'paid'
        : rentPaid > 0 ? 'partial' : 'due';
      return { t, rentPaid, feesPaid, overagePaid, pendingOverage, wasLate, status };
    })
    .sort((a, b) => {
      const rank: Record<RowStatus, number> = { due: 0, partial: 1, paid: 2 };
      return rank[a.status] - rank[b.status];
    });

  const totals = {
    rent: rows.reduce((s, r) => s + r.rentPaid, 0),
    fees: rows.reduce((s, r) => s + r.feesPaid, 0),
    overages: rows.reduce((s, r) => s + r.overagePaid, 0),
    expected: rows.reduce((s, r) => s + Number(r.t.weekly_rate), 0),
    paidCount: rows.filter(r => r.status === 'paid').length,
  };
  const unpaid = rows.filter(r => r.status !== 'paid');

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Rent</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setWeek(shiftMonday(week, -1))} className="p-2 rounded-xl border border-iron-200 text-iron-800 hover:border-brand-300 hover:text-brand-600"><ChevronLeft size={16} /></button>
          <button onClick={() => setWeek(currentMonday())}
            className={`px-3 py-2 rounded-xl text-xs font-bold ${isCurrentWeek ? 'bg-brand-600 text-white' : 'border border-iron-200 text-iron-600 hover:border-brand-300'}`}>
            {isCurrentWeek ? 'This week' : 'Today'}
          </button>
          <button onClick={() => setWeek(shiftMonday(week, 1))} className="p-2 rounded-xl border border-iron-200 text-iron-800 hover:border-brand-300 hover:text-brand-600"><ChevronRight size={16} /></button>
        </div>
      </div>
      <p className="text-iron-800 text-sm -mt-2">Week of <b className="text-iron-900">{fmtWeekLong(week)}</b> · due Monday 10 AM MST</p>

      {/* Collected summary */}
      <div className="bg-iron-900 rounded-2xl px-5 py-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-brand-400">Collected this week</p>
            <p className="text-white text-2xl font-extrabold mt-0.5">{fmtMoney(totals.rent + totals.fees + totals.overages)}</p>
          </div>
          <p className="text-iron-300 text-xs text-right">
            {totals.paidCount} of {rows.length} paid<br />
            expected {fmtMoney(totals.expected)}
          </p>
        </div>
        {(totals.fees > 0 || totals.overages > 0) && (
          <p className="text-iron-300 text-[11px] mt-2">
            Rent {fmtMoney(totals.rent)}{totals.fees > 0 ? ` · Late fees ${fmtMoney(totals.fees)}` : ''}{totals.overages > 0 ? ` · Overages ${fmtMoney(totals.overages)}` : ''}
          </p>
        )}
      </div>

      {/* Buffer-night / late-window banners (current week only) */}
      {isCurrentWeek && phase === 'buffer_night' && unpaid.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="flex items-center gap-1.5 text-sm font-bold text-red-700"><AlertTriangle size={14} /> On buffer night — out tomorrow 10 AM unless paid</p>
          <p className="text-red-600 text-xs mt-1">{unpaid.map(r => (r.t.tenants.find(p => p.is_primary) ?? r.t.tenants[0])?.name).join(' · ')}</p>
        </div>
      )}
      {isCurrentWeek && phase === 'late_window' && unpaid.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="flex items-center gap-1.5 text-sm font-bold text-amber-700"><Clock size={14} /> Late window — $50 fee applies, payment due by 5 PM</p>
          <p className="text-amber-600 text-xs mt-1">{unpaid.length} still unpaid</p>
        </div>
      )}

      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-iron-100 h-16 animate-pulse" />)}</div>}

      {!loading && rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-iron-100 px-5 py-10 text-center text-iron-800 text-sm">No active tenants for this week</div>
      )}

      {/* Tenant rows */}
      <div className="space-y-2">
        {!loading && rows.map(({ t, rentPaid, pendingOverage, wasLate, status }) => {
          const primary = t.tenants.find(p => p.is_primary) ?? t.tenants[0];
          const unitLabel = t.units ? `${t.units.complex_name || t.units.title}${t.units.unit_number ? ' #' + t.units.unit_number : ''}` : 'No unit';
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-iron-100 px-4 py-3 flex items-center gap-3">
              <button onClick={() => router.push(`/staff/tenants/${t.id}`)} className="flex-1 min-w-0 text-left">
                <p className="font-semibold text-iron-900 text-sm truncate">{primary?.name ?? '—'}</p>
                <p className="text-iron-800 text-xs truncate">
                  {unitLabel} · {fmtMoney(t.weekly_rate)}/wk
                  {pendingOverage > 0 && <span className="text-purple-600 font-medium"> · +{fmtMoney(pendingOverage)} overage due</span>}
                </p>
              </button>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                status === 'paid' ? 'bg-green-50 text-green-700'
                : status === 'partial' ? 'bg-amber-50 text-amber-700'
                : isCurrentWeek && (phase === 'late_window' || phase === 'buffer_night' || phase === 'past_due') ? 'bg-red-50 text-red-600'
                : 'bg-iron-100 text-iron-800'}`}>
                {status === 'paid' ? (wasLate ? 'PAID LATE' : 'PAID')
                  : status === 'partial' ? `${fmtMoney(t.weekly_rate - rentPaid)} LEFT`
                  : 'DUE'}
              </span>
              {status !== 'paid' && (
                <>
                  {isCurrentWeek && (phase === 'late_window' || phase === 'buffer_night' || phase === 'past_due') && (
                    <button onClick={() => setEmailFor(t)}
                      title={phase === 'late_window' ? 'Send late-payment notice' : 'Send checkout instructions'}
                      className={`shrink-0 flex items-center justify-center rounded-xl border px-2.5 py-2 transition-colors ${phase === 'late_window' ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'border-red-300 text-red-500 hover:bg-red-50'}`}>
                      <Send size={14} />
                    </button>
                  )}
                  <button onClick={() => setPayFor(t)}
                    className="shrink-0 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition-colors">
                    Record
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {payFor && (
        <RecordPaymentModal
          tenancyId={payFor.id}
          weeklyRate={Number(payFor.weekly_rate)}
          defaultWeek={week}
          defaultLate={isCurrentWeek && (phase === 'late_window' || phase === 'buffer_night')}
          onDone={() => load(week)}
          onClose={() => setPayFor(null)}
        />
      )}
      {emailFor && (() => {
        const p = emailFor.tenants.find(x => x.is_primary) ?? emailFor.tenants[0];
        return (
          <EmailModal
            tenancyId={emailFor.id}
            defaultTo={p?.email ?? ''}
            defaultTemplateKey={phase === 'late_window' ? 'late_fee' : 'checkout_instructions'}
            vars={{
              name: p?.name?.split(' ')[0] ?? 'there',
              amount: fmtMoney(Number(emailFor.weekly_rate)),
              total: fmtMoney(Number(emailFor.weekly_rate) + 50),
              unit: emailFor.units ? `${emailFor.units.complex_name || emailFor.units.title}${emailFor.units.unit_number ? ' #' + emailFor.units.unit_number : ''}` : '',
              week: fmtWeek(week),
            }}
            onClose={() => setEmailFor(null)}
          />
        );
      })()}
    </div>
  );
}
