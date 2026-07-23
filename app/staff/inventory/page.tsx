'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { CITIES } from '@/lib/cities';

interface UnitPhoto { id: string; storage_path: string; sort_order: number; }
interface Unit {
  id: string; title: string; area: string; city: string; bedrooms: number; bathrooms: number;
  weekly_price: number; status: 'available' | 'available_on' | 'taken'; available_date: string | null;
  special: string | null; amenities: string[]; sort_order: number;
  unit_photos: UnitPhoto[];
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
function photoUrl(path: string) { return `${SUPABASE_URL}/storage/v1/object/public/unit-photos/${path}`; }

const STATUS_CONFIG = {
  available:    { label: 'Available Now',      icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  available_on: { label: 'Available on Date',  icon: Clock,       color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  taken:        { label: 'Taken',              icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200' },
};

export default function InventoryPage() {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/staff/inventory');
    if (res.ok) { const d = await res.json(); setUnits(d.units); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (unit: Unit) => {
    const next: Unit['status'] = unit.status === 'taken' ? 'available' : 'taken';
    setUnits(prev => prev.map(u => u.id === unit.id ? { ...u, status: next } : u));
    await fetch(`/api/staff/inventory/${unit.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
  };

  const grouped = {
    available:    units.filter(u => u.status === 'available'),
    available_on: units.filter(u => u.status === 'available_on'),
    taken:        units.filter(u => u.status === 'taken'),
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Inventory</h1>
        <button onClick={() => router.push('/staff/inventory/new')}
          className="flex items-center gap-1.5 bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-700 transition-colors">
          <Plus size={16} /> Add Unit
        </button>
      </div>

      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-iron-100 h-24 animate-pulse" />)}</div>}

      {(['available', 'available_on', 'taken'] as const).map(status => {
        const list = grouped[status];
        const { label, icon: Icon, color, bg, border } = STATUS_CONFIG[status];
        return (
          <section key={status}>
            <h2 className={`font-mono text-[11px] tracking-[0.15em] uppercase mb-2 flex items-center gap-1.5 ${color}`}>
              <Icon size={12} /> {label} ({list.length})
            </h2>
            {list.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-iron-200 px-5 py-4 text-center text-iron-800 text-xs leading-relaxed">
                {status === 'taken'
                  ? 'Occupied units live here — photos and details stay saved. Tap "Mark Taken" on any unit when a tenant moves in.'
                  : 'None right now'}
              </div>
            )}
            <div className="space-y-2">
              {list.map(unit => {
                const thumb = unit.unit_photos?.[0];
                const city = CITIES.find(c => c.slug === unit.city)?.name ?? unit.city;
                return (
                  <div key={unit.id}
                    onClick={() => router.push(`/staff/inventory/${unit.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') router.push(`/staff/inventory/${unit.id}`); }}
                    className={`bg-white rounded-2xl border ${border} overflow-hidden flex cursor-pointer transition-all duration-100 hover:shadow-md active:scale-[0.985] active:bg-iron-50`}>
                    {/* Thumbnail */}
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl(thumb.storage_path)} alt={unit.title} className="w-20 h-20 object-cover shrink-0" />
                    ) : (
                      <div className={`w-20 h-20 ${bg} flex items-center justify-center shrink-0`}>
                        <Icon size={24} className={`${color} opacity-50`} />
                      </div>
                    )}
                    {/* Info */}
                    <div className="flex-1 text-left px-3 py-2.5 min-w-0">
                      <p className="font-semibold text-iron-900 text-sm truncate">{unit.title}</p>
                      <p className="text-iron-800 text-xs">{unit.bedrooms}BR / {unit.bathrooms}BA · {city}</p>
                      <p className="text-brand-600 text-xs font-semibold mt-0.5">${unit.weekly_price}/wk</p>
                      {unit.special && <p className="text-iron-800 text-[11px] truncate mt-0.5">{unit.special}</p>}
                      {unit.status === 'available_on' && unit.available_date && (
                        <p className="text-amber-600 text-[11px] mt-0.5">Available {unit.available_date}</p>
                      )}
                    </div>
                    {/* Status toggle — stops the tile click so it never opens the editor */}
                    <button onClick={e => { e.stopPropagation(); toggleStatus(unit); }}
                      className={`shrink-0 flex flex-col items-center justify-center px-3 gap-0.5 ${bg} hover:opacity-80 transition-opacity`}>
                      <Icon size={18} className={color} />
                      <span className={`text-[9px] font-semibold uppercase ${color}`}>
                        {unit.status === 'taken' ? 'Mark\nOpen' : 'Mark\nTaken'}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {!loading && units.length === 0 && (
        <div className="bg-white rounded-2xl border border-iron-100 px-5 py-12 text-center">
          <p className="text-iron-800 text-sm mb-4">No units yet</p>
          <button onClick={() => router.push('/staff/inventory/new')}
            className="inline-flex items-center gap-2 bg-brand-600 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-brand-700 transition-colors">
            <Plus size={16} /> Add your first unit
          </button>
        </div>
      )}
    </div>
  );
}
