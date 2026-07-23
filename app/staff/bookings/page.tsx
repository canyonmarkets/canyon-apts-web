'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ACTIVE_PIPELINE_STAGES, PIPELINE_LABELS, LEAD_SOURCES, type PipelineStage, type LeadSource } from '@/lib/booking';
import { CITIES } from '@/lib/cities';

interface Booking {
  id: string; slot_start: string; slot_end: string; pipeline_stage: PipelineStage; status: string;
  leads: { name: string; desired_city: string; bedrooms: number; lead_source: LeadSource };
}

type Filter = 'today' | 'upcoming' | 'all';

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: 'America/Phoenix', weekday: 'short', month: 'short', day: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone: 'America/Phoenix', hour: 'numeric', minute: '2-digit' });
}
function cityName(slug: string) { return CITIES.find(c => c.slug === slug)?.name ?? slug; }

const STAGE_COLORS: Record<PipelineStage, string> = {
  new: 'bg-iron-100 text-iron-600', called: 'bg-blue-50 text-blue-700',
  photos_sent: 'bg-purple-50 text-purple-700', following_up: 'bg-amber-50 text-amber-700',
  toured_applied: 'bg-green-50 text-green-700', leased: 'bg-green-100 text-green-800', lost: 'bg-red-50 text-red-600',
};
const SOURCE_LABELS: Record<LeadSource, string> = { facebook: 'FB', craigslist: 'CL', organic: 'Organic', other: 'Other' };

export default function BookingsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'all' | 'no_show'>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Picking a stage bucket looks across ALL bookings, not just upcoming ones —
  // a "Leased" or "Following Up" person's call is usually in the past.
  const pickStage = (s: PipelineStage | 'all' | 'no_show') => {
    setStageFilter(s);
    if (s !== 'all' && filter !== 'all') setFilter('all');
  };

  const load = useCallback(async (f: Filter) => {
    setLoading(true);
    const res = await fetch(`/api/staff/bookings?filter=${f}`);
    if (res.ok) { const d = await res.json(); setBookings(d.bookings); }
    setLoading(false);
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const visible = stageFilter === 'all' ? bookings
    : stageFilter === 'no_show' ? bookings.filter(b => b.status === 'no_show')
    : bookings.filter(b => b.pipeline_stage === stageFilter);

  // Group by day
  const byDay = visible.reduce<Record<string, Booking[]>>((acc, b) => {
    const day = fmtDay(b.slot_start);
    (acc[day] ??= []).push(b);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Bookings</h1>

      {/* Filter tabs */}
      <div className="flex bg-brand-50 border border-brand-100 rounded-xl p-1 gap-1">
        {(['today', 'upcoming', 'all'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${filter === f ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-700/70 hover:text-brand-700 hover:bg-brand-100'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Pipeline stage buckets */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <button onClick={() => pickStage('all')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${stageFilter === 'all' ? 'bg-iron-900 text-white shadow-sm' : 'bg-brand-50 border border-brand-100 text-brand-700 hover:border-brand-300'}`}>
          All stages
        </button>
        {ACTIVE_PIPELINE_STAGES.map(s => (
          <button key={s} onClick={() => pickStage(s)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${stageFilter === s ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25' : 'bg-brand-50 border border-brand-100 text-brand-700 hover:border-brand-300'}`}>
            {PIPELINE_LABELS[s]}
          </button>
        ))}
        <button onClick={() => pickStage('no_show')}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${stageFilter === 'no_show' ? 'bg-red-600 text-white shadow-md shadow-red-600/25' : 'bg-red-50 border border-red-100 text-red-600 hover:border-red-300'}`}>
          No-shows
        </button>
      </div>

      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-iron-100 h-20 animate-pulse" />)}</div>}

      {!loading && visible.length === 0 && (
        <div className="bg-white rounded-2xl border border-iron-100 px-5 py-10 text-center text-iron-800 text-sm">
          {stageFilter === 'all' ? 'No bookings found' : stageFilter === 'no_show' ? 'No no-shows — nice!' : `No one in "${PIPELINE_LABELS[stageFilter]}" yet`}
        </div>
      )}

      {!loading && Object.entries(byDay).map(([day, list]) => (
        <div key={day}>
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-iron-800 mb-2 px-1">{day}</p>
          <div className="space-y-2">
            {list.map(b => (
              <button key={b.id} onClick={() => router.push(`/staff/bookings/${b.id}`)}
                className="w-full bg-white rounded-2xl border border-iron-100 px-4 py-3.5 text-left hover:border-brand-200 hover:shadow-sm transition-all active:scale-[0.99]">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-50 rounded-xl px-2.5 py-1.5 text-center shrink-0">
                    <p className="font-display text-sm font-bold text-brand-600 leading-tight">{fmtTime(b.slot_start)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-iron-900 text-sm truncate">{b.leads.name}</p>
                    <p className="text-iron-800 text-xs">{b.leads.bedrooms}BR · {cityName(b.leads.desired_city)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {b.status === 'no_show'
                      ? <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-red-100 text-red-700">No-show</span>
                      : <span className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${STAGE_COLORS[b.pipeline_stage]}`}>
                          {PIPELINE_LABELS[b.pipeline_stage]}
                        </span>}
                    <span className="text-[10px] text-iron-800">{SOURCE_LABELS[b.leads.lead_source] ?? b.leads.lead_source}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
