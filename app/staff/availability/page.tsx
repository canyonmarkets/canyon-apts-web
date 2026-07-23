'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Rule { id: string; day_of_week: number; start_time: string; end_time: string; slot_minutes: number; buffer_minutes: number; active: boolean; }
interface Block { id: string; start_at: string; end_at: string; reason: string | null; }

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtBlock(iso: string) {
  return new Date(iso).toLocaleString('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function AvailabilityPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newBlock, setNewBlock] = useState({ start_at: '', end_at: '', reason: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/staff/availability');
    if (res.ok) { const d = await res.json(); setRules(d.rules); setBlocks(d.blocks); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateRule = (id: string, key: keyof Rule, val: unknown) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [key]: val } : r));
  };

  const saveRules = async () => {
    setSaving(true);
    await fetch('/api/staff/availability', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rules }),
    });
    setSaving(false);
  };

  const addBlock = async () => {
    if (!newBlock.start_at || !newBlock.end_at) return;
    const res = await fetch('/api/staff/availability/blocks', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_at: newBlock.start_at, end_at: newBlock.end_at, reason: newBlock.reason || null }),
    });
    if (res.ok) { const d = await res.json(); setBlocks(prev => [...prev, d.block]); }
    setShowAddBlock(false);
    setNewBlock({ start_at: '', end_at: '', reason: '' });
  };

  const deleteBlock = async (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    await fetch(`/api/staff/availability/blocks?id=${id}`, { method: 'DELETE' });
  };

  const inputCls = 'w-full rounded-xl border border-iron-200 px-4 py-3 text-sm text-iron-900 focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Schedule</h1>

      {/* Weekly rules */}
      <div className="bg-white rounded-2xl border border-iron-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-iron-100">
          <h2 className="font-semibold text-iron-800 text-sm">Weekly Availability</h2>
          <p className="text-iron-800 text-xs mt-0.5">Set hours for each day. Inactive days have no slots.</p>
        </div>
        {loading && <div className="px-5 py-8 space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-iron-100 rounded-xl animate-pulse" />)}</div>}
        <div className="divide-y divide-iron-50">
          {rules.map(r => (
            <div key={r.id} className="px-4 py-3 flex items-center gap-3">
              <button onClick={() => updateRule(r.id, 'active', !r.active)}
                className={`w-10 h-6 rounded-full transition-colors shrink-0 ${r.active ? 'bg-brand-600' : 'bg-iron-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${r.active ? 'translate-x-4' : ''}`} />
              </button>
              <span className="w-8 text-xs font-semibold text-iron-700 shrink-0">{DAYS[r.day_of_week]}</span>
              {r.active ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <input type="time" value={r.start_time} onChange={e => updateRule(r.id, 'start_time', e.target.value)}
                    className="rounded-lg border border-iron-200 px-2 py-1.5 text-xs text-iron-900 focus:outline-none focus:ring-1 focus:ring-brand-500 flex-1" />
                  <span className="text-iron-800 text-xs">–</span>
                  <input type="time" value={r.end_time} onChange={e => updateRule(r.id, 'end_time', e.target.value)}
                    className="rounded-lg border border-iron-200 px-2 py-1.5 text-xs text-iron-900 focus:outline-none focus:ring-1 focus:ring-brand-500 flex-1" />
                </div>
              ) : (
                <span className="text-iron-600 text-xs italic flex-1">Off</span>
              )}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-iron-100">
          <button onClick={saveRules} disabled={saving}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
            {saving ? 'Saving…' : 'Save Hours'}
          </button>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-iron-800 text-sm">Time Blocks (out-of-office)</h2>
          <button onClick={() => setShowAddBlock(v => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors">
            <Plus size={14} /> Block off time
          </button>
        </div>

        {showAddBlock && (
          <div className="bg-white rounded-2xl border border-iron-100 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-iron-600 mb-1">From</label>
                <input type="datetime-local" value={newBlock.start_at} onChange={e => setNewBlock(p => ({ ...p, start_at: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-iron-600 mb-1">To</label>
                <input type="datetime-local" value={newBlock.end_at} onChange={e => setNewBlock(p => ({ ...p, end_at: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <input type="text" placeholder="Reason (optional)" value={newBlock.reason} onChange={e => setNewBlock(p => ({ ...p, reason: e.target.value }))} className={inputCls} />
            <button onClick={addBlock} disabled={!newBlock.start_at || !newBlock.end_at}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
              Add Block
            </button>
          </div>
        )}

        {blocks.length === 0 && !showAddBlock && (
          <div className="bg-white rounded-2xl border border-iron-100 px-5 py-4 text-center text-iron-800 text-sm">No upcoming blocks</div>
        )}

        {blocks.map(b => (
          <div key={b.id} className="bg-white rounded-2xl border border-iron-100 px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-iron-900 text-sm font-medium">{fmtBlock(b.start_at)} → {fmtBlock(b.end_at)}</p>
              {b.reason && <p className="text-iron-800 text-xs mt-0.5">{b.reason}</p>}
            </div>
            <button onClick={() => deleteBlock(b.id)} className="text-iron-600 hover:text-red-500 transition-colors shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
