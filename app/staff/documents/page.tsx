'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, Upload, FileText, Trash2, ExternalLink, X } from 'lucide-react';

interface Doc { id: string; tenancy_id: string | null; tenant_name: string | null; name: string; mime: string | null; created_at: string; }
interface TenancyOpt { id: string; label: string; }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [tenancyOpts, setTenancyOpts] = useState<TenancyOpt[]>([]);
  const [upTenancy, setUpTenancy] = useState('');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    const res = await fetch(`/api/staff/documents?q=${encodeURIComponent(query)}`);
    if (res.ok) { const d = await res.json(); setDocs(d.documents); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, load]);

  const openUpload = async () => {
    setShowUpload(true);
    setErr('');
    if (tenancyOpts.length > 0) return;
    const res = await fetch('/api/staff/tenants');
    if (res.ok) {
      const d = await res.json();
      interface T { id: string; status: string; tenants: { is_primary: boolean; name: string }[]; units: { complex_name: string | null; title: string; unit_number: string | null } | null }
      setTenancyOpts((d.tenancies as T[]).map(t => {
        const p = t.tenants.find(x => x.is_primary) ?? t.tenants[0];
        const u = t.units ? `${t.units.complex_name || t.units.title}${t.units.unit_number ? ' #' + t.units.unit_number : ''}` : 'no unit';
        return { id: t.id, label: `${p?.name ?? '—'} (${u})${t.status === 'moved_out' ? ' — past' : ''}` };
      }));
    }
  };

  const doUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || uploading) { if (!file) setErr('Pick a file first.'); return; }
    setUploading(true);
    setErr('');
    const form = new FormData();
    form.append('file', file);
    if (upTenancy) {
      form.append('tenancy_id', upTenancy);
      const opt = tenancyOpts.find(o => o.id === upTenancy);
      if (opt) form.append('tenant_name', opt.label.split(' (')[0]);
    }
    const res = await fetch('/api/staff/documents', { method: 'POST', body: form });
    setUploading(false);
    if (res.ok) {
      setShowUpload(false);
      setUpTenancy('');
      if (fileRef.current) fileRef.current.value = '';
      await load(q);
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? 'Upload failed.');
    }
  };

  const openDoc = async (id: string) => {
    const res = await fetch('/api/staff/documents', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'sign' }),
    });
    if (res.ok) { const d = await res.json(); window.open(d.url, '_blank'); }
  };

  const remove = async (doc: Doc) => {
    if (!window.confirm(`Delete "${doc.name}"? This can't be undone.`)) return;
    setDocs(prev => prev.filter(d => d.id !== doc.id));
    await fetch('/api/staff/documents', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc.id }),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-iron-900">Documents</h1>
        <button onClick={openUpload}
          className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand-700 transition-colors">
          <Upload size={13} /> Upload
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iron-800" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by tenant or file name…"
          className="w-full rounded-xl border border-iron-200 bg-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="bg-white rounded-2xl border border-brand-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-iron-900">Upload a document</p>
            <button onClick={() => setShowUpload(false)} className="text-iron-800 hover:text-iron-600"><X size={16} /></button>
          </div>
          <input ref={fileRef} type="file" className="w-full text-sm text-iron-600 file:mr-3 file:rounded-xl file:border-0 file:bg-brand-50 file:px-4 file:py-2.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100" />
          <div>
            <p className="text-xs font-semibold text-iron-800 mb-1.5">Belongs to (makes it searchable by name)</p>
            <select value={upTenancy} onChange={e => setUpTenancy(e.target.value)}
              className="w-full rounded-xl border border-iron-200 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
              <option value="">No one specific / general</option>
              {tenancyOpts.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          {err && <p className="text-red-600 text-xs">{err}</p>}
          <button onClick={doUpload} disabled={uploading}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      )}

      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-iron-100 h-16 animate-pulse" />)}</div>}

      {!loading && docs.length === 0 && (
        <div className="bg-white rounded-2xl border border-iron-100 px-5 py-12 text-center">
          <FileText size={30} className="text-iron-600 mx-auto mb-3" />
          <p className="text-iron-800 text-sm">{q ? `Nothing found for "${q}"` : 'No documents yet — rental agreements live here, searchable by tenant name.'}</p>
        </div>
      )}

      <div className="space-y-2">
        {!loading && docs.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl border border-iron-100 px-4 py-3 flex items-center gap-3">
            <div className="bg-brand-50 rounded-xl p-2.5 shrink-0"><FileText size={16} className="text-brand-600" /></div>
            <button onClick={() => openDoc(doc.id)} className="flex-1 min-w-0 text-left">
              <p className="font-semibold text-iron-900 text-sm truncate">{doc.name}</p>
              <p className="text-iron-800 text-xs truncate">
                {doc.tenant_name ?? 'General'} · {fmtDate(doc.created_at)}
              </p>
            </button>
            <button onClick={() => openDoc(doc.id)} className="shrink-0 rounded-lg border border-iron-200 p-2 text-iron-800 hover:border-brand-300 hover:text-brand-600 transition-colors" aria-label="Open">
              <ExternalLink size={14} />
            </button>
            <button onClick={() => remove(doc)} className="shrink-0 rounded-lg border border-iron-200 p-2 text-iron-800 hover:border-red-300 hover:text-red-500 transition-colors" aria-label="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
