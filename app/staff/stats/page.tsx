'use client';

import { useEffect, useState } from 'react';
import { BarChart2, Users, Calendar, TrendingUp, MapPin, BedDouble } from 'lucide-react';

type Range = '7' | '30' | '90' | '0';

interface StatsData {
  leads: number;
  bookings: number;
  noShowRate: number;
  conversionRate: number;
  topCity: string | null;
  topBeds: string | null;
  leadSources: { label: string; count: number }[];
  bookingsPerWeek: { week: string; count: number }[];
  stageCounts: Record<string, number>;
}

const RANGE_LABELS: Record<Range, string> = {
  '7': 'Last 7 days',
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  '0': 'All time',
};

const STAGE_LABELS: Record<string, string> = {
  new: 'New',
  photos_sent: 'Photos Sent',
  application: 'Application',
  approved: 'Approved',
  move_in: 'Moved In',
};

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 text-right text-xs text-iron-800 truncate shrink-0">{label}</span>
      <div className="flex-1 h-5 bg-iron-100 rounded overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-xs text-iron-700 font-medium">{count}</span>
    </div>
  );
}

function WeekBar({ week, count, max }: { week: string; count: number; max: number }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  const label = new Date(week + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-8 flex flex-col justify-end" style={{ height: 64 }}>
        <div
          className="w-full bg-brand-400 rounded-t transition-all duration-500"
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-iron-800 text-center">{label}</span>
      <span className="text-[10px] text-iron-600 font-medium">{count}</span>
    </div>
  );
}

export default function StatsPage() {
  const [range, setRange] = useState<Range>('30');
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/staff/stats?days=${range}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [range]);

  const maxSource = data ? Math.max(...data.leadSources.map(s => s.count), 1) : 1;
  const maxWeek = data ? Math.max(...data.bookingsPerWeek.map(w => w.count), 1) : 1;

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-28">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-brand-600" />
        <h1 className="text-lg font-semibold text-iron-900">Stats</h1>
      </div>

      {/* Range selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(Object.entries(RANGE_LABELS) as [Range, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              range === key
                ? 'bg-brand-600 text-white'
                : 'bg-iron-100 text-iron-600 hover:bg-iron-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-iron-800">Loading…</div>
      ) : !data ? (
        <div className="text-center py-16 text-red-500">Failed to load stats</div>
      ) : (
        <div className="space-y-6">
          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-iron-800" />
                <span className="text-xs text-iron-800">Leads</span>
              </div>
              <p className="text-2xl font-bold text-iron-900">{data.leads}</p>
            </div>
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-iron-800" />
                <span className="text-xs text-iron-800">Bookings</span>
              </div>
              <p className="text-2xl font-bold text-iron-900">{data.bookings}</p>
            </div>
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-iron-800" />
                <span className="text-xs text-iron-800">No-show rate</span>
              </div>
              <p className="text-2xl font-bold text-iron-900">{data.noShowRate}%</p>
            </div>
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <span className="text-xs text-iron-800">Photos sent</span>
              </div>
              <p className="text-2xl font-bold text-brand-600">{data.conversionRate}%</p>
            </div>
          </div>

          {/* Top city / beds */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-iron-800" />
                <span className="text-xs text-iron-800">Top city</span>
              </div>
              <p className="text-base font-semibold text-iron-800 capitalize">{data.topCity ?? '—'}</p>
            </div>
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <div className="flex items-center gap-2 mb-1">
                <BedDouble className="w-4 h-4 text-iron-800" />
                <span className="text-xs text-iron-800">Top beds</span>
              </div>
              <p className="text-base font-semibold text-iron-800">{data.topBeds ? `${data.topBeds} bed` : '—'}</p>
            </div>
          </div>

          {/* Lead sources */}
          {data.leadSources.length > 0 && (
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <h2 className="text-sm font-semibold text-iron-700 mb-3">Lead sources</h2>
              <div className="space-y-2">
                {data.leadSources.map(s => (
                  <Bar key={s.label} label={s.label} count={s.count} max={maxSource} />
                ))}
              </div>
            </div>
          )}

          {/* Bookings per week */}
          {data.bookingsPerWeek.length > 0 && (
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <h2 className="text-sm font-semibold text-iron-700 mb-4">Bookings per week</h2>
              <div className="flex items-end gap-2 justify-center">
                {data.bookingsPerWeek.map(w => (
                  <WeekBar key={w.week} week={w.week} count={w.count} max={maxWeek} />
                ))}
              </div>
            </div>
          )}

          {/* Pipeline stages */}
          {Object.keys(data.stageCounts).length > 0 && (
            <div className="bg-white rounded-xl border border-iron-200 p-4">
              <h2 className="text-sm font-semibold text-iron-700 mb-3">Pipeline stages</h2>
              <div className="space-y-2">
                {Object.entries(data.stageCounts).map(([stage, count]) => (
                  <Bar
                    key={stage}
                    label={STAGE_LABELS[stage] ?? stage}
                    count={count}
                    max={Math.max(...Object.values(data.stageCounts), 1)}
                  />
                ))}
              </div>
            </div>
          )}

          {data.leads === 0 && data.bookings === 0 && (
            <div className="text-center py-8 text-iron-800 text-sm">
              No data yet for this period.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
