'use client';

import { useEffect, useState } from 'react';
import { mondayOf, currentMonday, shiftMonday, fmtWeek } from '@/lib/rent';

interface Payment { tenancy_id: string; type: string; amount: number; week_due: string | null; paid_at: string; late: boolean; }
interface Tenancy { id: string; status: string; weekly_rate: number; move_in: string | null; move_out: string | null; deposit_total: number; deposit_status: string; deposit_returned_amount: number | null; unit_id: string | null; notes: string | null; tenants: { is_primary: boolean; name: string }[]; }
interface Unit { id: string; status: string; }

type Range = '4w' | '3m' | 'ytd';

function fmtMoney(n: number) { return '$' + Math.round(n).toLocaleString(); }

const TYPE_LABELS: Record<string, string> = {
  rent: 'Weekly rent', late_fee: 'Late fees', deposit: 'Deposits collected',
  application_fee: 'Application fees', prorate: 'Prorated days', buffer_day: 'Buffer days',
  utility_overage: 'Utility overages', other: 'Other',
};

export default function ReportsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [range, setRange] = useState<Range>('4w');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/staff/reports').then(r => r.ok ? r.json() : null).then(d => {
      if (d) { setPayments(d.payments); setTenancies(d.tenancies); setUnits(d.units); }
      setLoading(false);
    });
  }, []);

  // Range window
  const now = new Date();
  const since = range === '4w' ? shiftMonday(currentMonday(), -3)
    : range === '3m' ? new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().slice(0, 10)
    : now.getFullYear() + '-01-01';
  const inRange = payments.filter(p => p.paid_at.slice(0, 10) >= since);

  // Totals by type
  const byType: Record<string, number> = {};
  for (const p of inRange) byType[p.type] = (byType[p.type] ?? 0) + Number(p.amount);
  const grandTotal = Object.values(byType).reduce((s, v) => s + v, 0);

  // Weekly bars (by Monday of paid_at)
  const byWeek: Record<string, number> = {};
  for (const p of inRange) {
    const wk = p.week_due ?? mondayOf(new Date(new Date(p.paid_at).getTime() - 7 * 3600 * 1000));
    byWeek[wk] = (byWeek[wk] ?? 0) + Number(p.amount);
  }
  const weeks = Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0])).slice(-16);
  const maxWeek = Math.max(1, ...weeks.map(([, v]) => v));

  // Deposits outcome (all-time — the number Jeff asked to see)
  const kept = tenancies.filter(t => t.deposit_status === 'kept');
  const returned = tenancies.filter(t => t.deposit_status === 'returned');
  const keptTotal = kept.reduce((s, t) => s + Number(t.deposit_total), 0);
  const returnedTotal = returned.reduce((s, t) => s + Number(t.deposit_returned_amount ?? t.deposit_total), 0);

  // Forfeited by no-shows — people who paid the app fee / hold but never moved in
  const noShowIds = new Set(tenancies.filter(t => t.notes?.includes('Never moved in')).map(t => t.id));
  const forfeitedTotal = payments
    .filter(p => noShowIds.has(p.tenancy_id) && ['application_fee', 'deposit'].includes(p.type))
    .reduce((s, p) => s + Number(p.amount), 0);

  // Vacancy (live)
  const activeWithUnit = new Set(tenancies.filter(t => t.status === 'active' && t.unit_id).map(t => t.unit_id));
  const totalUnits = units.length;
  const vacant = totalUnits - activeWithUnit.size;
  const vacancyRate = totalUnits > 0 ? Math.round((vacant / totalUnits) * 100) : 0;
  const weeklyRunRate = tenancies.filter(t => t.status === 'active').reduce((s, t) => s + Number(t.weekly_rate), 0);

  // Late leaderboard (in range)
  const lateBy: Record<string, number> = {};
  for (const p of inRange.filter(p => p.late)) lateBy[p.tenancy_id] = (lateBy[p.tenancy_id] ?? 0) + 1;
  const lateRows = Object.entries(lateBy)
    .map(([tid, count]) => {
      const t = tenancies.find(x => x.id === tid);
      const name = t?.tenants.find(p => p.is_primary)?.name ?? t?.tenants[0]?.name ?? '—';
      return { name, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Avg stay length (completed tenancies)
  const stays = tenancies.filter(t => t.move_in && t.move_out)
    .map(t => (new Date(t.move_out!).getTime() - new Date(t.move_in!).getTime()) / (7 * 864e5));
  const avgStayWeeks = stays.length ? Math.round(stays.reduce((s, v) => s + v, 0) / stays.length) : null;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Reports</h1>

      {/* Range tabs */}
      <div className="flex bg-brand-50 border border-brand-100 rounded-xl p-1 gap-1">
        {([['4w', 'Last 4 weeks'], ['3m', '3 months'], ['ytd', 'Year to date']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setRange(key)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${range === key ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-700/70 hover:bg-brand-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-iron-100 h-24 animate-pulse" />)}</div>}

      {!loading && (
        <>
          {/* Collected */}
          <div className="bg-iron-900 rounded-2xl px-5 py-4">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-brand-400">Collected</p>
            <p className="text-white text-3xl font-extrabold mt-0.5">{fmtMoney(grandTotal)}</p>
            <div className="mt-3 space-y-1">
              {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, amt]) => (
                <div key={type} className="flex justify-between text-xs">
                  <span className="text-iron-300">{TYPE_LABELS[type] ?? type}</span>
                  <span className="text-white font-semibold">{fmtMoney(amt)}</span>
                </div>
              ))}
              {grandTotal === 0 && <p className="text-iron-300 text-xs">No payments in this range yet</p>}
            </div>
          </div>

          {/* Weekly trend */}
          {weeks.length > 0 && (
            <div className="bg-white rounded-2xl border border-iron-100 p-4">
              <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide mb-3">By week</p>
              <div className="flex items-end gap-1.5 h-28">
                {weeks.map(([wk, amt]) => (
                  <div key={wk} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-[9px] text-iron-800 font-semibold">{fmtMoney(amt)}</span>
                    <div className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400" style={{ height: `${Math.max(4, (amt / maxWeek) * 80)}px` }} />
                    <span className="text-[9px] text-iron-800 truncate">{fmtWeek(wk)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Occupancy + run rate */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-2xl border border-iron-100 p-4 text-center">
              <p className="text-2xl font-extrabold text-iron-900">{activeWithUnit.size}<span className="text-iron-600 text-base">/{totalUnits}</span></p>
              <p className="text-[11px] text-iron-800 mt-1">units occupied</p>
            </div>
            <div className="bg-white rounded-2xl border border-iron-100 p-4 text-center">
              <p className={`text-2xl font-extrabold ${vacancyRate > 20 ? 'text-red-600' : 'text-green-600'}`}>{vacancyRate}%</p>
              <p className="text-[11px] text-iron-800 mt-1">vacancy rate</p>
            </div>
            <div className="bg-white rounded-2xl border border-iron-100 p-4 text-center">
              <p className="text-2xl font-extrabold text-brand-600">{fmtMoney(weeklyRunRate)}</p>
              <p className="text-[11px] text-iron-800 mt-1">weekly run rate</p>
            </div>
          </div>

          {/* Deposits */}
          <div className="bg-white rounded-2xl border border-iron-100 p-4">
            <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide mb-3">Deposits (all time)</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
                <p className="text-lg font-extrabold text-red-600">{fmtMoney(keptTotal)}</p>
                <p className="text-[11px] text-red-500">kept / defaulted ({kept.length})</p>
              </div>
              <div className="rounded-xl bg-green-50 border border-green-100 p-3 text-center">
                <p className="text-lg font-extrabold text-green-700">{fmtMoney(returnedTotal)}</p>
                <p className="text-[11px] text-green-600">returned ({returned.length})</p>
              </div>
            </div>
            {noShowIds.size > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-center mt-2">
                <p className="text-lg font-extrabold text-amber-700">{fmtMoney(forfeitedTotal)}</p>
                <p className="text-[11px] text-amber-600">forfeited by no-shows this year — paid fees but never moved in ({noShowIds.size})</p>
              </div>
            )}
            {avgStayWeeks !== null && <p className="text-[11px] text-iron-800 mt-2 text-center">Average completed stay: <b className="text-iron-700">{avgStayWeeks} weeks</b></p>}
          </div>

          {/* Year export — for the accountant at tax time */}
          <div className="bg-white rounded-2xl border border-iron-100 p-4">
            <p className="text-xs font-semibold text-iron-800 uppercase tracking-wide mb-1">Export for taxes</p>
            <p className="text-[11px] text-iron-800 mb-3">Downloads the complete payment ledger for a year as a spreadsheet (CSV) — every payment with tenant, unit, type, and amount. Opens in Excel; hand it straight to the accountant.</p>
            <div className="flex gap-2">
              {[now.getFullYear(), now.getFullYear() - 1].map(y => (
                <a key={y} href={`/api/staff/reports/export?year=${y}`} download
                  className="flex-1 text-center rounded-xl border-2 border-iron-200 py-2.5 text-xs font-bold text-iron-700 hover:border-brand-300 hover:text-brand-700 transition-colors">
                  ⬇ {y} ledger
                </a>
              ))}
            </div>
          </div>

          {/* Late leaderboard */}
          {lateRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-iron-100">
              <p className="px-4 py-3 border-b border-iron-50 text-xs font-semibold text-iron-800 uppercase tracking-wide">Late payments in range</p>
              <div className="divide-y divide-iron-50">
                {lateRows.map(r => (
                  <div key={r.name} className="px-4 py-2.5 flex justify-between text-sm">
                    <span className="text-iron-800 font-medium">{r.name}</span>
                    <span className="text-red-600 font-bold">{r.count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
