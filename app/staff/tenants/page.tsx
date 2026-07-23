'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, DoorOpen, Send } from 'lucide-react';
import { BlastModal } from '@/app/staff/_components/BlastModal';

interface Person { id: string; is_primary: boolean; name: string; phone: string | null; email: string | null; }
interface Unit { id: string; title: string; complex_name: string | null; unit_number: string | null; city: string; bedrooms: number; }
interface Tenancy {
  id: string; weekly_rate: number; status: 'active' | 'moved_out';
  move_in: string | null; move_out: string | null;
  deposit_status: string; kids: number | null; pets: string | null;
  tenants: Person[]; units: Unit | null;
}

function complexOf(t: Tenancy): string {
  return t.units?.complex_name || t.units?.title || 'No unit assigned';
}

export default function TenantsPage() {
  const router = useRouter();
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [showBlast, setShowBlast] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/staff/tenants');
    if (res.ok) { const d = await res.json(); setTenancies(d.tenancies); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = tenancies.filter(t => t.status === 'active');
  const past = tenancies.filter(t => t.status === 'moved_out');
  const shown = showPast ? past : active;

  // Group by complex, alphabetical
  const grouped = shown.reduce<Record<string, Tenancy[]>>((acc, t) => {
    (acc[complexOf(t)] ??= []).push(t);
    return acc;
  }, {});
  const complexNames = Object.keys(grouped).sort();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Tenants</h1>
          <span className="bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{active.length}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBlast(true)}
            className="flex items-center gap-1.5 bg-iron-900 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-iron-700 transition-colors">
            <Send size={13} /> Email All
          </button>
          <button onClick={() => router.push('/staff/tenants/new')}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand-700 transition-colors">
            <Plus size={13} /> New Tenant
          </button>
        </div>
      </div>
      {showBlast && <BlastModal onClose={() => setShowBlast(false)} />}

      {/* Active / Past toggle */}
      <div className="flex bg-brand-50 border border-brand-100 rounded-xl p-1 gap-1">
        {([['active', `Current (${active.length})`], ['past', `Moved Out (${past.length})`]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setShowPast(key === 'past')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${(key === 'past') === showPast ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-700/70 hover:bg-brand-100'}`}>
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-iron-100 h-20 animate-pulse" />)}</div>}

      {!loading && shown.length === 0 && (
        <div className="bg-white rounded-2xl border border-iron-100 px-5 py-12 text-center">
          <Users size={32} className="text-iron-600 mx-auto mb-3" />
          <p className="text-iron-800 text-sm mb-4">{showPast ? 'No past tenants yet' : 'No tenants yet'}</p>
          {!showPast && (
            <button onClick={() => router.push('/staff/tenants/new')}
              className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-brand-700 transition-colors">
              <Plus size={16} /> Add your first tenant
            </button>
          )}
        </div>
      )}

      {!loading && complexNames.map(cx => (
        <section key={cx}>
          <h2 className="font-mono text-[11px] tracking-[0.15em] uppercase text-iron-800 mb-2 px-1">{cx} ({grouped[cx].length})</h2>
          <div className="space-y-2">
            {grouped[cx].map(t => {
              const primary = t.tenants.find(p => p.is_primary) ?? t.tenants[0];
              const others = t.tenants.length - 1;
              return (
                <button key={t.id} onClick={() => router.push(`/staff/tenants/${t.id}`)}
                  className="w-full bg-white rounded-2xl border border-iron-100 px-4 py-3.5 text-left flex items-center gap-3 hover:border-brand-200 hover:shadow-sm transition-all active:scale-[0.99]">
                  <div className="bg-brand-50 rounded-xl px-2.5 py-1.5 text-center shrink-0 min-w-[56px]">
                    <p className="text-lg font-extrabold text-brand-600 leading-tight tracking-tight">{t.units?.unit_number ?? '—'}</p>
                    <p className="text-[9px] text-iron-800 uppercase">{t.units ? `${t.units.bedrooms}BR` : 'unit'}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-iron-900 text-sm truncate">
                      {primary?.name ?? '—'}{others > 0 && <span className="text-iron-800 font-normal"> +{others}</span>}
                    </p>
                    <p className="text-iron-800 text-xs">
                      ${t.weekly_rate}/wk{t.move_in ? ` · since ${new Date(t.move_in + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}` : ''}
                    </p>
                  </div>
                  {t.status === 'moved_out'
                    ? <span className="shrink-0 text-[10px] font-medium px-2 py-1 rounded-lg bg-iron-100 text-iron-800 flex items-center gap-1"><DoorOpen size={11}/> Moved out</span>
                    : <span className={`shrink-0 text-[10px] font-medium px-2 py-1 rounded-lg ${t.deposit_status === 'holding' ? 'bg-green-50 text-green-700' : 'bg-iron-100 text-iron-800'}`}>
                        {t.deposit_status === 'holding' ? 'Active' : t.deposit_status === 'kept' ? 'Deposit kept' : 'Deposit returned'}
                      </span>}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
