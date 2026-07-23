// Recurring tenant email blasts — runs hourly on Netlify (prod only).
// Reads settings.recurring_blasts: [{ template_key, name, day, hour }] (Phoenix time,
// day 0=Sun…6=Sat). When the current Phoenix day+hour matches, sends that template
// to every active tenant, personalized. One cron tick per hour = one send per match.
import type { Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export default async () => {
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  const { data: setting } = await db.from('settings').select('value').eq('key', 'recurring_blasts').single();
  const recurring: { template_key: string; day: number; hour: number }[] = setting?.value ?? [];
  if (recurring.length === 0) return new Response('no recurring blasts');

  // Phoenix = UTC-7 year-round
  const phx = new Date(Date.now() - 7 * 3600 * 1000);
  const due = recurring.filter(r => r.day === phx.getUTCDay() && r.hour === phx.getUTCHours());
  if (due.length === 0) return new Response('nothing due this hour');

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = process.env.RESEND_FROM_MGMT || 'Canyon Apartments <management@canyon-advisors.com>';
  const fill = (t: string, v: Record<string, string>) => t.replace(/\{\{(\w+)\}\}/g, (_, k) => v[k] ?? '');

  const { data: tenancies } = await db.from('tenancies')
    .select('id, weekly_rate, tenants(is_primary, name, email), units(title, complex_name, unit_number)')
    .eq('status', 'active');

  // Monday of the current Phoenix week, for {{week}}
  const dow = phx.getUTCDay();
  const mon = new Date(phx);
  mon.setUTCDate(phx.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
  const weekLabel = mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  let sent = 0;
  for (const job of due) {
    // Idempotency: skip if this template already blasted within this Phoenix hour
    // (guards against the hourly cron firing twice / a retry after partial failure).
    const hourStartUTC = new Date(Math.floor(Date.now() / 3600000) * 3600000).toISOString();
    const { data: already } = await db.from('message_log')
      .select('id').eq('type', job.template_key).gte('sent_at', hourStartUTC)
      .contains('meta', { automated: true }).limit(1);
    if (already && already.length > 0) continue;

    const { data: tpl } = await db.from('email_templates').select('subject, body').eq('key', job.template_key).single();
    if (!tpl) continue;
    for (const t of tenancies ?? []) {
      const people = t.tenants as { is_primary: boolean; name: string; email: string | null }[];
      const p = people.find(x => x.is_primary) ?? people[0];
      if (!p?.email) continue;
      const u = t.units as unknown as { title: string; complex_name: string | null; unit_number: string | null } | null;
      const vars = {
        name: p.name.split(' ')[0],
        amount: '$' + Number(t.weekly_rate).toLocaleString(),
        total: '$' + (Number(t.weekly_rate) + 50).toLocaleString(),
        unit: u ? `${u.complex_name || u.title}${u.unit_number ? ' #' + u.unit_number : ''}` : '',
        week: weekLabel,
      };
      const subject = fill(tpl.subject, vars);
      const bodyHtml = fill(tpl.body, vars).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
      const { error } = await resend.emails.send({ from, to: p.email, subject, html: `<p style="font-family:Helvetica,Arial,sans-serif;color:#374151;font-size:15px;line-height:1.7;">${bodyHtml}</p>` });
      if (!error) {
        sent++;
        try { await db.from('message_log').insert({ type: job.template_key, channel: 'email', recipient: p.email, meta: { tenancy_id: t.id, subject, blast: true, automated: true } }); } catch {}
      }
    }
  }
  return new Response(`sent ${sent}`);
};

export const config: Config = { schedule: '0 * * * *' };
