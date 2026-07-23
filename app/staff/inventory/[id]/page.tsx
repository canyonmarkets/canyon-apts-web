'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, Upload, X } from 'lucide-react';
import { CITIES } from '@/lib/cities';

interface UnitPhoto { id: string; storage_path: string; sort_order: number; }
interface Unit {
  id: string; title: string; area: string; city: string; bedrooms: number; bathrooms: number;
  weekly_price: number; amenities: string[]; special: string | null;
  status: 'available' | 'available_on' | 'taken'; available_date: string | null;
  sort_order: number; notes: string | null; complex_name: string | null;
  unit_number: string | null; utility_credit_monthly: number | null;
  entry_type: 'keypad' | 'key' | null; keypad_code: string | null;
  street_address: string | null;
  unit_photos: UnitPhoto[];
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
function photoUrl(path: string) { return `${SUPABASE_URL}/storage/v1/object/public/unit-photos/${path}`; }

const AMENITY_OPTIONS = ['Pool', 'Gym', 'Covered parking', 'King beds', 'In-unit W/D', 'Pet friendly', 'WiFi included', 'Utilities included'];

const inputCls = 'w-full rounded-xl border border-iron-200 bg-white px-4 py-3 text-base text-iron-900 placeholder:text-iron-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';
const labelCls = 'block text-sm font-medium text-iron-700 mb-1.5';

export default function InventoryEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();

  const [form, setForm] = useState<Omit<Unit, 'id' | 'unit_photos'>>({
    title: '', area: '', city: 'phoenix', bedrooms: 1, bathrooms: 1,
    weekly_price: 495, amenities: [], special: null,
    status: 'available', available_date: null, sort_order: 0, notes: null, complex_name: null,
    unit_number: null, utility_credit_monthly: null, entry_type: null, keypad_code: null,
    street_address: null,
  });
  const [photos, setPhotos] = useState<UnitPhoto[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (isNew) return;
    const res = await fetch(`/api/staff/inventory/${id}`);
    if (!res.ok) { router.push('/staff/inventory'); return; }
    const { unit } = await res.json();
    const { unit_photos, id: _id, ...rest } = unit;
    setForm(rest);
    setPhotos(unit_photos ?? []);
  }, [id, isNew, router]);

  useEffect(() => { load(); }, [load]);

  const f = (key: keyof typeof form, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  const save = async () => {
    setSaving(true);
    const url = isNew ? '/api/staff/inventory' : `/api/staff/inventory/${id}`;
    const method = isNew ? 'POST' : 'PATCH';
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), weekly_price: Number(form.weekly_price) }),
    });
    setSaving(false);
    if (res.ok) {
      const d = await res.json();
      if (isNew) router.replace(`/staff/inventory/${d.unit.id}`);
    }
  };

  const deleteUnit = async () => {
    if (!confirm('Delete this unit?')) return;
    setDeleting(true);
    await fetch(`/api/staff/inventory/${id}`, { method: 'DELETE' });
    router.push('/staff/inventory');
  };

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isNew) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`/api/staff/inventory/${id}/photos`, { method: 'POST', body: form });
    if (res.ok) { const d = await res.json(); setPhotos(prev => [...prev, d.photo]); }
    setUploading(false);
    e.target.value = '';
  };

  const deletePhoto = async (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
    await fetch(`/api/staff/inventory/${id}/photos?photoId=${photoId}`, { method: 'DELETE' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-iron-800 hover:text-iron-700">
          <ChevronLeft size={16} /> Inventory
        </button>
        {!isNew && (
          <button onClick={deleteUnit} disabled={deleting} className="text-red-500 hover:text-red-700 p-1">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">
        {isNew ? 'Add Unit' : 'Edit Unit'}
      </h1>

      <div className="bg-white rounded-2xl border border-iron-100 p-5 space-y-4">
        <div>
          <label className={labelCls}>Cross-street / Title</label>
          <input type="text" placeholder="Gilbert Rd & Baseline" value={form.title} onChange={e => f('title', e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>City</label>
          <div className="relative">
            <select value={form.city} onChange={e => f('city', e.target.value)} className={`${inputCls} appearance-none pr-8`}>
              {CITIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Beds</label>
            <select value={form.bedrooms} onChange={e => f('bedrooms', Number(e.target.value))} className={`${inputCls} appearance-none`}>
              <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Baths</label>
            <select value={form.bathrooms} onChange={e => f('bathrooms', Number(e.target.value))} className={`${inputCls} appearance-none`}>
              <option value={1}>1</option><option value={1.5}>1.5</option><option value={2}>2</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>$/wk</label>
            <input type="number" value={form.weekly_price} onChange={e => f('weekly_price', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['available', 'available_on', 'taken'] as const).map(s => (
              <button key={s} onClick={() => f('status', s)}
                className={`rounded-xl py-2.5 text-xs font-semibold transition-all ${form.status === s ? 'bg-brand-600 text-white' : 'bg-iron-50 text-iron-600 hover:bg-iron-100'}`}>
                {s === 'available' ? 'Available' : s === 'available_on' ? 'Avail. On' : 'Taken'}
              </button>
            ))}
          </div>
          {form.status === 'available_on' && (
            <input type="date" value={form.available_date ?? ''} onChange={e => f('available_date', e.target.value)} className={`${inputCls} mt-2`} />
          )}
        </div>

        <div>
          <label className={labelCls}>Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map(a => (
              <button key={a} onClick={() => f('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a])}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${form.amenities.includes(a) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-iron-600 border-iron-200 hover:border-brand-300'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Special note <span className="text-iron-800 font-normal">(optional)</span></label>
          <input type="text" placeholder="Quiet complex, great natural light…" value={form.special ?? ''} onChange={e => f('special', e.target.value || null)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Apartment complex name <span className="text-iron-800 font-normal">(staff only — included in recap emails)</span></label>
          <input type="text" placeholder="The Reserve at Gilbert" value={form.complex_name ?? ''} onChange={e => f('complex_name', e.target.value || null)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Street address <span className="text-iron-800 font-normal">(staff only — used on the rental agreement)</span></label>
          <input type="text" placeholder="909 E Camelback Rd #3126, Phoenix, AZ 85014" value={form.street_address ?? ''} onChange={e => f('street_address', e.target.value || null)} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Unit # <span className="text-iron-800 font-normal">(staff only)</span></label>
            <input type="text" placeholder="319" value={form.unit_number ?? ''} onChange={e => f('unit_number', e.target.value || null)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Utility credit / mo <span className="text-iron-800 font-normal">($)</span></label>
            <input type="number" placeholder={form.bedrooms >= 2 ? '150' : '100'} value={form.utility_credit_monthly ?? ''} onChange={e => f('utility_credit_monthly', e.target.value === '' ? null : Number(e.target.value))} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Entry <span className="text-iron-800 font-normal">(staff only)</span></label>
            <select value={form.entry_type ?? ''} onChange={e => f('entry_type', e.target.value || null)} className={inputCls}>
              <option value="">Not set</option>
              <option value="keypad">Keypad / deadbolt code</option>
              <option value="key">Metal key</option>
            </select>
          </div>
          {form.entry_type === 'keypad' && (
            <div>
              <label className={labelCls}>Code <span className="text-iron-800 font-normal">(never shown publicly)</span></label>
              <input type="text" placeholder="4482" value={form.keypad_code ?? ''} onChange={e => f('keypad_code', e.target.value || null)} className={inputCls} />
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Internal notes <span className="text-iron-800 font-normal">(staff only)</span></label>
          <textarea rows={2} value={form.notes ?? ''} onChange={e => f('notes', e.target.value || null)} className={`${inputCls} resize-none`} />
        </div>
      </div>

      {/* Photos */}
      {!isNew && (
        <div className="bg-white rounded-2xl border border-iron-100 p-5 space-y-3">
          <p className={labelCls}>Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map(p => (
              <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-iron-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl(p.storage_path)} alt="" className="w-full h-full object-cover" />
                <button onClick={() => deletePhoto(p.id)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80">
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className={`aspect-square rounded-xl border-2 border-dashed border-iron-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-400 transition-colors ${uploading ? 'opacity-50' : ''}`}>
              <Upload size={20} className="text-iron-800 mb-1" />
              <span className="text-iron-800 text-[11px]">{uploading ? 'Uploading…' : 'Add photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} disabled={uploading} />
            </label>
          </div>
        </div>
      )}
      {isNew && <p className="text-iron-800 text-xs text-center">Save unit first, then add photos</p>}

      <button onClick={save} disabled={saving || !form.title.trim()}
        className="w-full rounded-xl bg-brand-600 py-4 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
        {saving ? 'Saving…' : isNew ? 'Create Unit' : 'Save Changes'}
      </button>
    </div>
  );
}
