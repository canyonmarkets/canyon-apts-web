'use client';

import { useEffect, useState } from 'react';
import { X, Send, Repeat, Trash2 } from 'lucide-react';

interface Template { key: string; name: string; subject: string; body: string; }
interface RecurringJob { template_key: string; name: string; day: number; hour: number; }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const inputCls = 'w-full rounded-xl border border-iron-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

export function BlastModal({ onClose }: { onClose: () => void }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [tplKey, setTplKey] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recurring, setRecurring] = useState<RecurringJob[]>([]);
  const [day, setDay] = useState(0);
  const [hour, setHour] = useState(18);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/staff/templates').then(r => r.json()).then(d => setTemplates(d.templates ?? []));
    fetch('/api/staff/tenant-blast').then(r => r.json()).then(d => setRecurring(d.recurring ?? []));
  }, []);

  const pick = (key: string) => {
    setTplKey(key);
    const t = templates.find(x => x.key === key);
    setSubject(t?.subject ?? '');
    setBody(t?.body ?? '');
  };

  const sendNow = async () => {
    if (sending || !subject.trim() || !body.trim()) return;
    if (!window.confirm('Send this to EVERY current tenant right now?')) return;
    setSending(true);
    const res = await fetch('/api/staff/tenant-blast', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body, template_key: tplKey || undefined }),
    });
    setSending(false);
    if (res.ok) { const d = await res.json(); setMsg(`Sent to ${d.sent} tenant${d.sent !== 1 ? 's' : ''}${d.skipped ? ` (${d.skipped} skipped — no email)` : ''}.`); }
    else setMsg('Blast failed — check the templates and try again.');
  };

  const saveRecurring = async (list: RecurringJob[]) => {
    setRecurring(list);
    await fetch('/api/staff/tenant-blast', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recurring: list }),
    });
  };

  const addRecurring = () => {
    if (!tplKey) { setMsg('Pick a template first — recurring blasts always send the saved template.'); return; }
    const t = templates.find(x => x.key === tplKey);
    saveRecurring([...recurring.filter(r => r.template_key !== tplKey), { template_key: tplKey, name: t?.name ?? tplKey, day, hour }]);
    setMsg(`Scheduled: "${t?.name}" every ${DAYS[day]} at ${hour > 12 ? hour - 12 + ' PM' : hour + ' AM'}.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-iron-100">
          <div>
            <p className="font-semibold text-iron-900 text-sm">Email All Tenants</p>
            <p className="text-iron-800 text-xs mt-0.5">Personalized per person — {'{{name}}'} and {'{{amount}}'} fill in automatically</p>
          </div>
          <button onClick={onClose} className="text-iron-800 hover:text-iron-600"><X size={18} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <select value={tplKey} onChange={e => pick(e.target.value)} className={inputCls}>
            <option value="">Pick a template…</option>
            {templates.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
          </select>
          <input className={inputCls} value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
          <textarea className={`${inputCls} resize-y`} rows={7} value={body} onChange={e => setBody(e.target.value)} placeholder="Message — placeholders like {{name}} fill per tenant" />

          <button onClick={sendNow} disabled={sending}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
            <Send size={14} /> {sending ? 'Sending…' : 'Send to all current tenants now'}
          </button>

          {/* Recurring */}
          <div className="rounded-xl border border-iron-200 p-3 space-y-2">
            <p className="text-xs font-semibold text-iron-700 flex items-center gap-1.5"><Repeat size={13} className="text-brand-600" /> Make it recurring</p>
            <div className="flex gap-2">
              <select value={day} onChange={e => setDay(Number(e.target.value))} className="flex-1 rounded-lg border border-iron-200 px-2 py-2 text-xs">
                {DAYS.map((d, i) => <option key={d} value={i}>Every {d}</option>)}
              </select>
              <select value={hour} onChange={e => setHour(Number(e.target.value))} className="flex-1 rounded-lg border border-iron-200 px-2 py-2 text-xs">
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{h === 0 ? '12 AM' : h < 12 ? h + ' AM' : h === 12 ? '12 PM' : (h - 12) + ' PM'}</option>)}
              </select>
              <button onClick={addRecurring} className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700">Schedule</button>
            </div>
            {recurring.length > 0 && (
              <div className="divide-y divide-iron-50">
                {recurring.map(r => (
                  <div key={r.template_key} className="flex items-center gap-2 py-2 text-xs">
                    <span className="flex-1 text-iron-700"><b>{r.name}</b> · every {DAYS[r.day]} at {r.hour === 0 ? '12 AM' : r.hour < 12 ? r.hour + ' AM' : r.hour === 12 ? '12 PM' : (r.hour - 12) + ' PM'}</span>
                    <button onClick={() => saveRecurring(recurring.filter(x => x.template_key !== r.template_key))}
                      className="text-iron-800 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10.5px] text-iron-800">Recurring blasts always send the template&apos;s SAVED wording — to change what they say, update the template (edit the text on a tenant card&apos;s email and tap &quot;Save as template&quot;). Automated sending begins once the site is live on Netlify.</p>
          </div>

          {msg && <p className="text-green-700 text-xs font-medium">{msg}</p>}
        </div>
      </div>
    </div>
  );
}
