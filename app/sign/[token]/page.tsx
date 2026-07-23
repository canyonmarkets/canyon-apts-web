'use client';

import { useEffect, useRef, useState, use } from 'react';
import {
  AGREEMENT_TITLE, INTRO_PARAGRAPHS, OCCUPANCY_PERIOD_TEXT, SECTIONS, END_MARK,
  SPECIAL_TERMS_BULLETS, SIGNING_STATEMENT, type AgreementData,
} from '@/lib/agreement/content';

interface SignedInfo { guest: string; at: string; }

function money(n: number) { return '$' + Number(n || 0).toLocaleString(); }

// Plain-canvas signature pad (finger or mouse)
function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const drawn = useRef(false);

  useEffect(() => {
    const c = ref.current!;
    const dpr = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * dpr;
    c.height = 160 * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111827';
  }, []);

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <div>
      <canvas
        ref={ref}
        className="w-full h-40 rounded-xl border-2 border-dashed border-stone-300 bg-white touch-none"
        onPointerDown={e => { drawing.current = true; const p = pos(e); const ctx = ref.current!.getContext('2d')!; ctx.beginPath(); ctx.moveTo(p.x, p.y); (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={e => { if (!drawing.current) return; const p = pos(e); const ctx = ref.current!.getContext('2d')!; ctx.lineTo(p.x, p.y); ctx.stroke(); drawn.current = true; }}
        onPointerUp={() => { drawing.current = false; if (drawn.current) onChange(ref.current!.toDataURL('image/png')); }}
      />
      <button type="button" onClick={() => { const c = ref.current!; c.getContext('2d')!.clearRect(0, 0, c.width, c.height); drawn.current = false; onChange(null); }}
        className="mt-2 text-xs font-semibold text-stone-500 underline underline-offset-2">
        Clear and sign again
      </button>
    </div>
  );
}

export default function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<AgreementData | null>(null);
  const [signed, setSigned] = useState<SignedInfo[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [guest, setGuest] = useState('');
  const [nameTyped, setNameTyped] = useState('');
  const [sigImage, setSigImage] = useState<string | null>(null);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doneMsg, setDoneMsg] = useState('');
  const [err, setErr] = useState('');
  const [justSignedGuest, setJustSignedGuest] = useState('');
  const [uploading, setUploading] = useState<'' | 'id' | 'selfie'>('');
  const [idDone, setIdDone] = useState(false);
  const [selfieDone, setSelfieDone] = useState(false);

  useEffect(() => {
    fetch(`/api/sign/${token}`).then(async r => {
      if (!r.ok) { setNotFound(true); return; }
      const d = await r.json();
      setData(d.data);
      setSigned(d.signed ?? []);
      const unsigned = (d.data.guests ?? []).find((g: { name: string }) => !(d.signed ?? []).some((s: SignedInfo) => s.guest === g.name));
      if (unsigned) { setGuest(unsigned.name); setNameTyped(unsigned.name); }
      // If someone already signed but hasn't finished their ID/selfie, re-show the upload box
      const idBy: string[] = d.uploads?.id ?? [];
      const selfieBy: string[] = d.uploads?.selfie ?? [];
      const needsUploads = (d.signed ?? []).find((s: SignedInfo) => !idBy.includes(s.guest) || !selfieBy.includes(s.guest));
      if (needsUploads) {
        setJustSignedGuest(needsUploads.guest);
        setIdDone(idBy.includes(needsUploads.guest));
        setSelfieDone(selfieBy.includes(needsUploads.guest));
      }
    }).catch(() => setNotFound(true));
  }, [token]);

  const submit = async () => {
    if (submitting) return;
    if (!agreeChecked) { setErr('Please check the agreement box first.'); return; }
    if (!nameTyped.trim()) { setErr('Please type your full name.'); return; }
    if (!sigImage) { setErr('Please sign in the signature box.'); return; }
    setSubmitting(true);
    setErr('');
    const res = await fetch(`/api/sign/${token}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest, nameTyped, image: sigImage }),
    });
    setSubmitting(false);
    if (res.ok) {
      const d = await res.json();
      setSigned(prev => [...prev, { guest, at: new Date().toISOString() }]);
      setDoneMsg(d.allSigned ? 'All set — every guest has signed. A copy is on file with Canyon Apartments.' : 'Your signature is recorded. Thank you!');
      setJustSignedGuest(guest);
      setIdDone(false);
      setSigImage(null);
      setAgreeChecked(false);
      const next = (data?.guests ?? []).find(g => g.name !== guest && !signed.some(s => s.guest === g.name));
      if (next) { setGuest(next.name); setNameTyped(next.name); }
    } else {
      const d = await res.json().catch(() => ({}));
      setErr(d.error ?? 'Something went wrong — try again.');
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
        <p className="text-stone-500 text-sm">This signing link is no longer valid. Please contact Canyon Apartments.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const unsignedGuests = data.guests.filter(g => !signed.some(s => s.guest === g.name));

  return (
    <div className="min-h-screen bg-stone-200 py-6 px-3 sm:px-6">
      <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Brand header */}
        <div className="flex items-center gap-3 border-b-4 border-iron-900 px-6 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Canyon_Logo-removebg-preview.png" alt="Canyon Apartments" className="h-10 w-auto" />
          <span className="font-display text-sm sm:text-base font-bold uppercase tracking-widest text-iron-900">Canyon Apartments</span>
          <span className="ml-auto text-right text-[11px] sm:text-sm font-bold text-iron-900 max-w-[45%]">{AGREEMENT_TITLE}</span>
        </div>

        <div className="px-6 py-5 text-[13px] leading-relaxed text-iron-900">
          {/* Parties */}
          <p><b className="text-brand-600">Address:</b> <b>{data.address}</b></p>
          {data.guests.map((g, i) => (
            <p key={i} className="mt-1.5">
              <b className="text-brand-600">Guest:</b> <b>{g.name}</b>
              <span className="block text-[12px] text-iron-700">{g.email || '—'} · {g.phone || '—'}</span>
            </p>
          ))}
          {data.children.length > 0 && (
            <p className="mt-1.5 text-[12px]">
              <b className="text-brand-600">Children:</b> {data.children.map(c => `${c.name} (${c.age})`).join(' · ')}
            </p>
          )}
          <p className="mt-1.5"><b className="text-brand-600">Maximum Occupancy (Including Children):</b> <b>{data.maxOccupancy}</b></p>

          <hr className="my-4 border-iron-300" />
          <p><b className="text-brand-600">Check-In Date:</b> <b>{data.checkIn}</b> &nbsp;&nbsp; <b className="text-brand-600">Check-Out Date:</b> <b>{data.checkOut}</b></p>
          <p className="mt-1.5 text-[12px]">{OCCUPANCY_PERIOD_TEXT}</p>

          <hr className="my-4 border-iron-300" />
          <table className="text-[13px]">
            <tbody>
              {([
                ['Weekly Payment:', data.weeklyPayment], ['Security Deposit (Refundable):', data.securityDeposit],
                ['Cleaning Fee (Non-Refundable):', data.cleaningFee], ['Pet Fee (Non-Refundable):', data.petFee],
                ['TOTAL:', data.total], ['Total Due Upon Occupancy:', data.dueUponOccupancy], ['Balance Due:', data.balanceDue],
              ] as [string, number][]).map(([l, v]) => (
                <tr key={l}><td className="pr-6 py-0.5 font-bold text-brand-600">{l}</td><td className="font-bold">{money(v)}</td></tr>
              ))}
            </tbody>
          </table>

          <hr className="my-4 border-iron-300" />
          {INTRO_PARAGRAPHS.map((p, i) => (
            <p key={i} className="mt-3 text-[12.5px]">{'label' in p && p.label ? <b className="text-brand-600">{p.label} </b> : null}{p.text}</p>
          ))}

          {/* Clauses */}
          {SECTIONS.map(sec => (
            <div key={sec.heading}>
              <p className="mt-5 font-bold text-brand-600 underline">{sec.heading}</p>
              {sec.clauses.map((c, ci) => (
                <div key={ci} className="mt-2.5 text-[12.5px]">
                  <p>{c.n ? <b>{c.n}. </b> : null}{c.title ? <b className="text-brand-600">{c.title} </b> : null}{c.body}</p>
                  {(c.subs ?? []).map((sub, si) => (
                    <p key={si} className="mt-1.5 ml-4">
                      <b>{sub.n}. </b>{sub.title ? <b className="text-brand-600">{sub.title} </b> : null}{sub.body}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ))}
          <p className="mt-5 text-center text-[12px] font-bold text-iron-500">{END_MARK}</p>

          {/* Special terms */}
          <div className="mt-6 rounded-xl bg-stone-100 p-4">
            <p className="text-center font-bold text-brand-600 mb-2">SPECIAL TERMS</p>
            {SPECIAL_TERMS_BULLETS.map((b, i) => <p key={i} className="mt-2 text-[12.5px]">• {b}</p>)}
            {data.specialTerms && (
              <div className="mt-3 rounded-lg bg-white border border-stone-300 p-3 text-[12.5px] whitespace-pre-line">{data.specialTerms}</div>
            )}
          </div>

          <hr className="my-4 border-iron-300" />
          <p className="text-[12.5px]">{SIGNING_STATEMENT}</p>

          {/* Rep block */}
          <style>{`@font-face { font-family: 'CanyonScript'; src: url('/fonts/GreatVibes-Regular.ttf') format('truetype'); font-display: swap; }`}</style>
          <p className="mt-4"><b className="text-brand-600">CANYON ADVISORS, INC. REPRESENTATIVE:</b> <span style={{ fontFamily: "'CanyonScript', cursive", fontSize: 26 }}>{data.repName}</span></p>
          <p className="text-[12px] text-iron-700">Name: {data.repName} · Date: {data.repDate}</p>

          {/* Already signed */}
          {signed.map(sig => (
            <p key={sig.guest} className="mt-3 text-[13px] text-green-700 font-semibold">✓ Signed by {sig.guest} — {new Date(sig.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          ))}

          {/* Signing box */}
          {doneMsg && <div className="mt-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-800">{doneMsg}</div>}

          {/* ID + selfie upload — appears right after signing, while the license is in reach */}
          {justSignedGuest && (
            <div className="mt-4 rounded-2xl border-2 border-iron-300 bg-stone-50 p-5">
              <p className="font-bold text-iron-900">🪪 Two last things — your ID and a quick selfie</p>
              <p className="mt-1 text-[12.5px] text-iron-700">Snap a photo of your driver&apos;s license or state ID, then a quick selfie so we can match the two. Canyon keeps both on file with your agreement.</p>
              {([
                { kind: 'id' as const, done: idDone, label: '1 · Photo of your ID', btn: '📷 Take a photo of your ID', doneMsg: '✓ ID received', capture: 'environment' as const, accept: 'image/*,application/pdf' },
                { kind: 'selfie' as const, done: selfieDone, label: '2 · A quick selfie', btn: '🤳 Take a selfie', doneMsg: '✓ Selfie received', capture: 'user' as const, accept: 'image/*' },
              ]).map(step => (
                <div key={step.kind} className="mt-3">
                  {step.done ? (
                    <p className="text-sm font-semibold text-green-700">{step.doneMsg}</p>
                  ) : (
                    <label className={`flex items-center justify-center rounded-xl border-2 border-dashed border-iron-400 bg-white py-5 text-sm font-semibold ${uploading === step.kind ? 'text-iron-400' : 'text-brand-700 cursor-pointer hover:border-brand-400'}`}>
                      {uploading === step.kind ? 'Uploading…' : step.btn}
                      <input type="file" accept={step.accept} capture={step.capture} className="hidden" disabled={uploading !== ''}
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(step.kind);
                          const fd = new FormData();
                          fd.append('file', file);
                          fd.append('guest', justSignedGuest);
                          fd.append('kind', step.kind);
                          const r = await fetch(`/api/sign/${token}`, { method: 'PUT', body: fd });
                          setUploading('');
                          if (r.ok) (step.kind === 'id' ? setIdDone : setSelfieDone)(true);
                          e.target.value = '';
                        }} />
                    </label>
                  )}
                </div>
              ))}
              {idDone && selfieDone && <p className="mt-3 text-sm font-bold text-green-700">All set — you&apos;re completely done! 🎉</p>}
            </div>
          )}
          {unsignedGuests.length > 0 && (
            <div className="mt-6 rounded-2xl border-2 border-brand-500 p-5 bg-brand-50/50">
              <p className="font-bold text-iron-900">Sign here</p>
              {unsignedGuests.length > 1 && (
                <select value={guest} onChange={e => { setGuest(e.target.value); setNameTyped(e.target.value); }}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white">
                  {unsignedGuests.map(g => <option key={g.name} value={g.name}>{g.name}</option>)}
                </select>
              )}
              <label className="mt-3 flex items-start gap-2.5 text-[13px]">
                <input type="checkbox" checked={agreeChecked} onChange={e => setAgreeChecked(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#B84309]" />
                <span>I, <b>{guest}</b>, have read this Rental Agreement and agree to its terms, and I intend my electronic signature below to be legally binding.</span>
              </label>
              <p className="mt-3 text-xs font-semibold text-iron-700">Type your full legal name</p>
              <input value={nameTyped} onChange={e => setNameTyped(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white" />
              <p className="mt-3 text-xs font-semibold text-iron-700">Draw your signature (finger or mouse)</p>
              <div className="mt-1"><SignaturePad onChange={setSigImage} /></div>
              {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
              <button onClick={submit} disabled={submitting}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 py-4 text-base font-bold text-white shadow-lg disabled:opacity-50">
                {submitting ? 'Saving your signature…' : 'Agree & Sign'}
              </button>
            </div>
          )}

          <p className="mt-6 mb-2 text-center text-[11px] text-iron-500">
            Questions? Reply to the email this link arrived in, or email management@canyon-advisors.com
          </p>
        </div>
      </div>
    </div>
  );
}
