/**
 * followups — runs every hour.
 * Handles: 4-hour photo follow-up email + manual follow-up push notifications.
 */
import type { Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import webpush from 'web-push';
import { followupHTML, errorAlertHTML } from '../../lib/email/templates.js';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_KEY    = process.env.RESEND_API_KEY!;
const FROM          = process.env.RESEND_FROM || 'Canyon Apartments <properties@canyon-advisors.com>';
const ALERT_EMAIL   = process.env.ERROR_ALERT_EMAIL || 'jeff.martin.az@gmail.com';

const FOLLOWUP_DELAY = 4 * 60 * 60 * 1000; // 4 hours after recap

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'jeff.martin.az@gmail.com'}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

async function sendAlert(resend: Resend, ctx: string, err: unknown) {
  await resend.emails.send({
    from: FROM, to: ALERT_EMAIL,
    subject: '⚠️ Canyon followups.mts error',
    html: errorAlertHTML(ctx, err),
  }).catch(() => {});
}

async function pushToAll(sb: ReturnType<typeof createClient>, payload: object) {
  const { data: subs } = await sb.from('push_subscriptions').select('id, subscription');
  if (!subs?.length) return;
  for (const row of subs) {
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify(payload));
    } catch (e: unknown) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 410 || status === 404) {
        await sb.from('push_subscriptions').delete().eq('id', row.id);
      }
    }
  }
}

export default async function handler() {
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const resend = new Resend(RESEND_KEY);
  const now = Date.now();
  const cutoff = new Date(now - FOLLOWUP_DELAY).toISOString();

  // ── 4-hour photo follow-up ────────────────────────────────────────────────
  try {
    const { data: bookings } = await sb
      .from('bookings')
      .select('*, leads(name, email)')
      .eq('recap_sent', true)
      .eq('followup_sent', false)
      .lte('recap_sent_at', cutoff);

    for (const b of bookings ?? []) {
      const lead = b.leads as { name: string; email: string };
      if (!lead?.email) continue;
      try {
        await resend.emails.send({
          from: FROM, to: lead.email,
          subject: 'Did you get the photos? — Canyon Apartments',
          html: followupHTML(lead),
        });
        await sb.from('bookings').update({ followup_sent: true }).eq('id', b.id);
        await sb.from('message_log').insert({
          booking_id: b.id, lead_id: b.lead_id, type: 'followup', recipient: lead.email,
        });
      } catch (e) { await sendAlert(resend, `followups: photo followup booking ${b.id}`, e); }
    }
  } catch (e) { await sendAlert(resend, 'followups: fetch recap bookings', e); }

  // ── Manual follow-up push notifications ──────────────────────────────────
  try {
    const { data: due } = await sb
      .from('follow_ups')
      .select('*, leads(name)')
      .eq('done', false)
      .lte('due_at', new Date(now).toISOString());

    for (const fu of due ?? []) {
      const leadName = fu.leads?.name ?? 'a lead';
      try {
        await pushToAll(sb, {
          title: 'Follow-up due',
          body: `Follow up with ${leadName}`,
          url: fu.booking_id ? `/staff/bookings/${fu.booking_id}` : '/staff',
        });
        await sb.from('follow_ups').update({ done: true }).eq('id', fu.id);
      } catch (e) { await sendAlert(resend, `followups: push follow-up ${fu.id}`, e); }
    }
  } catch (e) { await sendAlert(resend, 'followups: fetch follow_ups', e); }
}

export const config: Config = {
  schedule: '0 * * * *',
};
