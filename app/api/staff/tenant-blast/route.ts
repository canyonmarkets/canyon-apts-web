import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { tenantPlainHTML } from '@/lib/email/templates';
import { currentMonday, fmtWeek } from '@/lib/rent';

function fill(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? `{{${k}}}`);
}

// POST { subject, body, template_key? } — send to every ACTIVE tenant with an
// email, personalized per person ({{name}}, {{amount}}, {{total}}, {{unit}}, {{week}}).
export async function POST(req: Request) {
  const { error } = await requireManager();
  if (error) return error;

  const { subject, body, template_key } = await req.json();
  if (!subject?.trim() || !body?.trim()) return NextResponse.json({ error: 'subject and body required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: tenancies } = await db.from('tenancies')
    .select('id, weekly_rate, tenants(is_primary, name, email), units(title, complex_name, unit_number)')
    .eq('status', 'active');

  let sent = 0, skipped = 0;
  for (const t of tenancies ?? []) {
    const tenantsArr = t.tenants as { is_primary: boolean; name: string; email: string | null }[];
    const p = tenantsArr.find(x => x.is_primary) ?? tenantsArr[0];
    if (!p?.email) { skipped++; continue; }
    const u = t.units as unknown as { title: string; complex_name: string | null; unit_number: string | null } | null;
    const vars = {
      name: p.name.split(' ')[0],
      amount: '$' + Number(t.weekly_rate).toLocaleString(),
      total: '$' + (Number(t.weekly_rate) + 50).toLocaleString(),
      unit: u ? `${u.complex_name || u.title}${u.unit_number ? ' #' + u.unit_number : ''}` : '',
      week: fmtWeek(currentMonday()),
    };
    const subj = fill(subject.trim(), vars);
    const { ok } = await sendEmail({ to: p.email, subject: subj, html: tenantPlainHTML(subj, fill(body.trim(), vars)), voice: 'management' });
    if (ok) {
      sent++;
      try { await db.from('message_log').insert({ type: template_key || 'tenant_blast', channel: 'email', recipient: p.email, meta: { tenancy_id: t.id, subject: subj, blast: true } }); } catch {}
    } else skipped++;
  }
  return NextResponse.json({ sent, skipped, total: (tenancies ?? []).length });
}

// GET — current recurring blast schedules (stored in settings, no migration needed).
export async function GET() {
  const { error } = await requireManager();
  if (error) return error;
  const db = supabaseAdmin();
  const { data } = await db.from('settings').select('value').eq('key', 'recurring_blasts').single();
  return NextResponse.json({ recurring: data?.value ?? [] });
}

// PUT { recurring: [{ template_key, name, day, hour }] } — replace the schedule list.
// day: 0=Sun…6=Sat · hour: 0–23 Phoenix time. The hourly Netlify job matches and sends.
export async function PUT(req: Request) {
  const { error } = await requireManager();
  if (error) return error;
  const { recurring } = await req.json();
  if (!Array.isArray(recurring)) return NextResponse.json({ error: 'recurring array required' }, { status: 400 });
  const db = supabaseAdmin();
  const { error: err } = await db.from('settings').upsert({ key: 'recurring_blasts', value: recurring });
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
