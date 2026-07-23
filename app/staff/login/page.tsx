'use client';

import { useState, useEffect } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function StaffLoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'link') {
      setErr('That sign-in link expired or was already used. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErr('');
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/staff` },
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-iron-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Canyon_Logo-removebg-preview.png" alt="Canyon" className="h-12 w-auto mx-auto mb-3" />
          <h1 className="font-display text-xl font-bold uppercase tracking-widest text-white">Staff Access</h1>
          <p className="text-iron-400 text-sm mt-1">Canyon Apartments</p>
        </div>

        {sent ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-iron-900 mb-2">Check Your Email</h2>
            <p className="text-iron-500 text-sm leading-relaxed">
              We sent a magic link to <strong>{email}</strong>.<br />
              Tap it to sign in — no password needed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <label className="block text-sm font-medium text-iron-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                autoFocus
                placeholder="joleen@canyon-advisors.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-iron-200 px-4 py-3 text-base text-iron-900 placeholder:text-iron-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            {err && <p className="text-red-600 text-sm">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Sending…' : 'Send Magic Link'}
            </button>
            <p className="text-center text-xs text-iron-400">No password required. Link expires in 1 hour.</p>
          </form>
        )}
      </div>
    </div>
  );
}
