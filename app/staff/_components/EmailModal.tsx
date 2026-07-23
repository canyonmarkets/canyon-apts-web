'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Send } from 'lucide-react';

interface Template { id: string; key: string; name: string; subject: string; body: string; }

export interface EmailVars {
  name?: string;
  amount?: string;   // weekly rate
  total?: string;    // rate + $50 late fee
  credit?: string;   // monthly utility credit
  bill?: string;     // this month's utility bill
  overage?: string;  // bill - credit
  unit?: string;
  week?: string;
}

function fill(text: string, vars: EmailVars): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (vars as Record<string, string | undefined>)[k] ?? `{{${k}}}`);
}

const inputCls = 'w-full rounded-xl border border-iron-200 px-4 py-3 text-sm text-iron-900 placeholder:text-iron-400 focus:outline-none focus:ring-2 focus:ring-brand-500';

// One modal for every tenant email: pick a template (or write from scratch),
// the numbers pre-fill, everything stays editable, one tap saves the wording
// back as the template, one tap sends from management@.
export function EmailModal({
  tenancyId, defaultTo, defaultTemplateKey, vars, onSent, onClose,
}: {
  tenancyId: string;
  defaultTo: string;
  defaultTemplateKey?: string;
  vars: EmailVars;
  onSent?: () => void;
  onClose: () => void;
}) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateKey, setTemplateKey] = useState(defaultTemplateKey ?? '');
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [savingTpl, setSavingTpl] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const applyTemplate = useCallback((key: string, list: Template[]) => {
    const t = list.find(x => x.key === key);
    if (!t) { setSubject(''); setBody(''); return; }
    setSubject(fill(t.subject, vars));
    setBody(fill(t.body, vars));
  }, [vars]);

  useEffect(() => {
    fetch('/api/staff/templates').then(r => r.ok ? r.json() : { templates: [] }).then(d => {
      setTemplates(d.templates ?? []);
      if (defaultTemplateKey) applyTemplate(defaultTemplateKey, d.templates ?? []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveAsTemplate = async () => {
    if (!templateKey || savingTpl) return;
    setSavingTpl(true);
    setErr('');
    // Save the wording with the numbers turned back into placeholders where they match.
    let tplSubject = subject, tplBody = body;
    for (const [k, v] of Object.entries(vars)) {
      if (v) {
        tplSubject = tplSubject.split(v).join(`{{${k}}}`);
        tplBody = tplBody.split(v).join(`{{${k}}}`);
      }
    }
    const res = await fetch('/api/staff/templates', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: templateKey, subject: tplSubject, body: tplBody }),
    });
    setSavingTpl(false);
    if (res.ok) {
      setMsg('Saved — this wording is now the template.');
      const d = await res.json();
      setTemplates(prev => prev.map(t => t.key === templateKey ? d.template : t));
    } else setErr('Could not save template.');
  };

  const send = async () => {
    if (sending) return;
    if (!to.trim() || !subject.trim() || !body.trim()) { setErr('To, subject, and message are all needed.'); return; }
    setSending(true);
    setErr('');
    const res = await fetch('/api/staff/send-tenant-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenancy_id: tenancyId, to, subject, body, template_key: templateKey || undefined }),
    });
    setSending(false);
    if (res.ok) { onSent?.(); onClose(); }
    else { const d = await res.json().catch(() => ({})); setErr(d.error ?? 'Send failed.'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-iron-100">
          <div>
            <p className="font-semibold text-iron-900 text-sm">Send Email</p>
            <p className="text-iron-800 text-xs mt-0.5">Sends from management@canyon-advisors.com</p>
          </div>
          <button onClick={onClose} className="text-iron-800 hover:text-iron-600"><X size={18} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-iron-800 mb-1.5">Template</p>
            <select value={templateKey}
              onChange={e => { setTemplateKey(e.target.value); applyTemplate(e.target.value, templates); setMsg(''); }}
              className={inputCls}>
              <option value="">Write from scratch…</option>
              {templates.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-semibold text-iron-800 mb-1.5">To</p>
            <input className={inputCls} type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="tenant@email.com" />
          </div>
          <div>
            <p className="text-xs font-semibold text-iron-800 mb-1.5">Subject</p>
            <input className={inputCls} value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
          <div>
            <p className="text-xs font-semibold text-iron-800 mb-1.5">Message <span className="font-normal text-iron-800">— edit anything before sending</span></p>
            <textarea className={`${inputCls} resize-y`} rows={9} value={body} onChange={e => setBody(e.target.value)} />
          </div>

          {msg && <p className="text-green-700 text-xs font-medium">{msg}</p>}
          {err && <p className="text-red-600 text-xs">{err}</p>}

          <div className="flex gap-2">
            {templateKey && (
              <button onClick={saveAsTemplate} disabled={savingTpl}
                className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-40 transition-colors">
                {savingTpl ? 'Saving…' : 'Save as template'}
              </button>
            )}
            <button onClick={send} disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white disabled:opacity-40 hover:bg-brand-700 transition-colors">
              <Send size={14} /> {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
