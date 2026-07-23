'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Clock, AlertCircle, Flame } from 'lucide-react';
import { PIPELINE_LABELS, type PipelineStage } from '@/lib/booking';
import { CITIES } from '@/lib/cities';

interface Booking { id: string; slot_start: string; pipeline_stage: PipelineStage; leads: { name: string; desired_city: string; bedrooms: number } }
interface FollowUp { id: string; due_at: string; note: string | null; leads: { name: string; phone: string } }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone: 'America/Phoenix', hour: 'numeric', minute: '2-digit' });
}
function cityName(slug: string) { return CITIES.find(c => c.slug === slug)?.name ?? slug; }

const STAGE_COLORS: Record<PipelineStage, string> = {
  new: 'bg-iron-100 text-iron-600',
  called: 'bg-blue-50 text-blue-700',
  photos_sent: 'bg-purple-50 text-purple-700',
  following_up: 'bg-amber-50 text-amber-700',
  toured_applied: 'bg-green-50 text-green-700',
  leased: 'bg-green-100 text-green-800',
  lost: 'bg-red-50 text-red-600',
};

export default function StaffTodayPage() {
  const router = useRouter();
  const [data, setData] = useState<{ bookings: Booking[]; followUps: FollowUp[]; waitlistCount: number; hotLeads: Booking[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<{ subscribed: boolean; muted: string[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/staff/today');
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    fetch('/api/push/subscribe').then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setAlerts({ subscribed: d.subscribed, muted: d.muted_topics }); })
      .catch(() => {});
  }, []);

  const toggleBookingAlerts = async () => {
    if (!alerts) return;
    const muted = alerts.muted.includes('bookings')
      ? alerts.muted.filter(t => t !== 'bookings')
      : [...alerts.muted, 'bookings'];
    setAlerts({ ...alerts, muted });
    await fetch('/api/push/subscribe', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ muted_topics: muted }),
    });
  };

  const today = new Date().toLocaleDateString('en-US', { timeZone: 'America/Phoenix', weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Today</h1>
          <p className="text-iron-800 text-xs mt-0.5">{today}</p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-xl text-iron-800 hover:text-iron-700 hover:bg-iron-100 transition-colors disabled:opacity-40">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Waitlist badge */}
      {(data?.waitlistCount ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <p className="text-amber-700 text-sm font-medium">{data!.waitlistCount} prospect{data!.waitlistCount !== 1 ? 's' : ''} on waitlist</p>
        </div>
      )}

      {/* Today's calls */}
      <section>
        <h2 className="font-mono text-xs tracking-[0.15em] uppercase text-iron-800 mb-2 flex items-center gap-1.5">
          <Clock size={12} /> Today&apos;s Calls ({data?.bookings.length ?? 0})
        </h2>
        {loading && <div className="bg-white rounded-2xl border border-iron-100 h-20 animate-pulse" />}
        {!loading && data?.bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-iron-100 px-5 py-6 text-center text-iron-800 text-sm">No calls scheduled today</div>
        )}
        <div className="space-y-2">
          {data?.bookings.map(b => (
            <button key={b.id} onClick={() => router.push(`/staff/bookings/${b.id}`)}
              className="w-full bg-white rounded-2xl border border-iron-100 px-4 py-3.5 text-left flex items-center gap-3 hover:border-brand-200 hover:shadow-sm transition-all active:scale-[0.99]">
              <div className="bg-brand-50 rounded-xl px-2.5 py-1.5 text-center shrink-0">
                <p className="font-display text-sm font-bold text-brand-600">{fmtTime(b.slot_start)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-iron-900 text-sm truncate">{b.leads.name}</p>
                <p className="text-iron-800 text-xs">{b.leads.bedrooms}BR · {cityName(b.leads.desired_city)}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-1 rounded-lg shrink-0 ${STAGE_COLORS[b.pipeline_stage]}`}>
                {PIPELINE_LABELS[b.pipeline_stage]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Follow-ups due */}
      {(data?.followUps.length ?? 0) > 0 && (
        <section>
          <h2 className="font-mono text-xs tracking-[0.15em] uppercase text-iron-800 mb-2">Follow-Ups Due</h2>
          <div className="space-y-2">
            {data!.followUps.map(f => (
              <div key={f.id} className="bg-white rounded-2xl border border-iron-100 px-4 py-3.5 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-iron-900 text-sm">{f.leads.name}</p>
                  {f.note && <p className="text-iron-800 text-xs mt-0.5 truncate">{f.note}</p>}
                </div>
                <a href={`tel:${f.leads.phone}`} className="shrink-0 text-xs font-medium text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">Call</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hot leads */}
      {(data?.hotLeads.length ?? 0) > 0 && (
        <section>
          <h2 className="font-mono text-xs tracking-[0.15em] uppercase text-iron-800 mb-2 flex items-center gap-1.5">
            <Flame size={12} /> Hot Leads
          </h2>
          <div className="space-y-2">
            {data!.hotLeads.map(b => (
              <button key={b.id} onClick={() => router.push(`/staff/bookings/${b.id}`)}
                className="w-full bg-white rounded-2xl border border-iron-100 px-4 py-3.5 text-left flex items-center gap-3 hover:border-brand-200 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-iron-900 text-sm truncate">{b.leads.name}</p>
                  <p className="text-iron-800 text-xs">{b.leads.bedrooms}BR · {cityName(b.leads.desired_city)}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-1 rounded-lg shrink-0 ${STAGE_COLORS[b.pipeline_stage]}`}>
                  {PIPELINE_LABELS[b.pipeline_stage]}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Alert settings — per person, per phone */}
      {alerts?.subscribed && (
        <div className="bg-white rounded-2xl border border-iron-100 px-4 py-3.5 flex items-center gap-3">
          <span className="text-lg">{alerts.muted.includes('bookings') ? '🔕' : '🔔'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-iron-900">New-booking alerts</p>
            <p className="text-[11px] text-iron-800">Push notification on your phone when someone books a call. Just you — everyone sets their own.</p>
          </div>
          <button onClick={toggleBookingAlerts}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${alerts.muted.includes('bookings') ? 'bg-iron-100 text-iron-600' : 'bg-green-600 text-white'}`}>
            {alerts.muted.includes('bookings') ? 'Off' : 'On'}
          </button>
        </div>
      )}
    </div>
  );
}
