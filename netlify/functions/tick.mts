/**
 * tick — runs every minute.
 * Handles: 2-hour reminder, 1-hour reminder, running-behind email.
 *
 * Running-behind window: opened_at must fall within [slot_start - 60min, slot_start + 10min]
 * to suppress the late email. Opening the card earlier in the day does NOT count.
 */
import type { Config } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { reminderHTML, runningBehindHTML, errorAlertHTML } from '../../lib/email/templates.js';
import { sendSMS } from '../../lib/sms.js';

const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_KEY      = process.env.RESEND_API_KEY!;
const FROM            = process.env.RESEND_FROM || 'Canyon Apartments <properties@canyon-advisors.com>';
const STAFF_EMAIL     = process.env.STAFF_EMAIL || 'properties@canyon-advisors.com';
const ALERT_EMAIL     = process.env.ERROR_ALERT_EMAIL || 'jeff.martin.az@gmail.com';
const SITE_URL        = process.env.URL || 'https://canyon-apts.com';

const REMINDER_2H_WINDOW = 2 * 60 * 60 * 1000 + 5 * 60 * 1000;  // 2h5m ahead
const REMINDER_1H_WINDOW = 1 * 60 * 60 * 1000 + 5 * 60 * 1000;  // 1h5m ahead
const LATE_FIRE_AFTER    = 10 * 60 * 1000;   // fire at slot + 10min
const LATE_WIN_BEFORE    = 60 * 60 * 1000;   // window opens 60min before slot
const LATE_WIN_AFTER     = 10 * 60 * 1000;   // window closes 10min after slot

function slotLabel(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Phoenix',
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

async function sendAlert(resend: Resend, ctx: string, err: unknown) {
  await resend.emails.send({
    from: FROM, to: ALERT_EMAIL, subject: '⚠️ Canyon tick.mts error',
    html: errorAlertHTML(ctx, err),
  }).catch(() => {});
}

export default async function handler() {
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const resend = new Resend(RESEND_KEY);
  const now = Date.now();

  // ── Fetch all scheduled bookings that may need action ─────────────────────
  const windowStart = new Date(now - LATE_FIRE_AFTER - 60_000).toISOString(); // oldest we care about
  const windowEnd   = new Date(now + REMINDER_2H_WINDOW).toISOString();

  const { data: bookings, error: fetchErr } = await sb
    .from('bookings')
    .select('*, leads(name, phone, email, sms_opt_in)')
    .eq('status', 'scheduled')
    .gte('slot_start', windowStart)
    .lte('slot_start', windowEnd);

  if (fetchErr) {
    await sendAlert(resend, 'tick: fetch bookings', fetchErr);
    return;
  }
  if (!bookings?.length) return;

  for (const b of bookings) {
    const lead = b.leads as { name: string; phone: string; email: string };
    if (!lead?.email) continue;
    const slotMs = new Date(b.slot_start).getTime();
    const msUntilSlot = slotMs - now;
    const msSinceSlot = now - slotMs;

    // ── 2-hour reminder ───────────────────────────────────────────────────────
    if (!b.reminder_sent && msUntilSlot > 0 && msUntilSlot <= REMINDER_2H_WINDOW) {
      try {
        await resend.emails.send({
          from: FROM, to: lead.email,
          subject: `Your Canyon Apartments call is in 2 hours — ${slotLabel(b.slot_start)}`,
          html: reminderHTML(lead, slotLabel(b.slot_start), 2),
        });
        await sb.from('bookings').update({ reminder_sent: true }).eq('id', b.id);
        await sb.from('message_log').insert({
          booking_id: b.id, lead_id: b.lead_id, type: 'reminder_2h', recipient: lead.email,
        });
        if (b.leads?.sms_opt_in) {
          const ok = (await sendSMS(lead.phone, `Reminder: Your Canyon Apartments call is in 2 hours. We will call you at this number. - Canyon Apts`)).ok;
          if (ok) await sb.from('message_log').insert({ booking_id: b.id, lead_id: b.lead_id, type: 'reminder_2h', channel: 'sms', recipient: lead.phone });
        }
      } catch (e) { await sendAlert(resend, `tick: 2h reminder booking ${b.id}`, e); }
    }

    // ── 1-hour reminder ───────────────────────────────────────────────────────
    if (!b.reminder_1h_sent && msUntilSlot > 0 && msUntilSlot <= REMINDER_1H_WINDOW) {
      try {
        await resend.emails.send({
          from: FROM, to: lead.email,
          subject: `Your Canyon Apartments call is in 1 hour`,
          html: reminderHTML(lead, slotLabel(b.slot_start), 1),
        });
        await sb.from('bookings').update({ reminder_1h_sent: true }).eq('id', b.id);
        await sb.from('message_log').insert({
          booking_id: b.id, lead_id: b.lead_id, type: 'reminder_1h', recipient: lead.email,
        });
        if (b.leads?.sms_opt_in) {
          const ok = (await sendSMS(lead.phone, `Reminder: Your Canyon Apartments call is in 1 hour. We will call you at this number. - Canyon Apts`)).ok;
          if (ok) await sb.from('message_log').insert({ booking_id: b.id, lead_id: b.lead_id, type: 'reminder_1h', channel: 'sms', recipient: lead.phone });
        }
      } catch (e) { await sendAlert(resend, `tick: 1h reminder booking ${b.id}`, e); }
    }

    // ── Running-behind email ──────────────────────────────────────────────────
    if (!b.late_email_sent && msSinceSlot >= LATE_FIRE_AFTER) {
      // Check if opened_at falls within the qualifying window [slot-60min, slot+10min]
      const winStart = slotMs - LATE_WIN_BEFORE;
      const winEnd   = slotMs + LATE_WIN_AFTER;
      const openedAt = b.opened_at ? new Date(b.opened_at).getTime() : null;
      const openedInWindow = openedAt !== null && openedAt >= winStart && openedAt <= winEnd;

      if (!openedInWindow) {
        try {
          await resend.emails.send({
            from: FROM, to: lead.email, replyTo: STAFF_EMAIL,
            subject: 'Running a few minutes behind — Canyon Apartments',
            html: runningBehindHTML(lead),
          });
          await sb.from('bookings').update({ late_email_sent: true }).eq('id', b.id);
          await sb.from('message_log').insert({
            booking_id: b.id, lead_id: b.lead_id, type: 'running_behind', recipient: lead.email,
          });
        } catch (e) { await sendAlert(resend, `tick: running-behind booking ${b.id}`, e); }
      } else {
        // She opened the card in-window — still mark so we don't check again
        await sb.from('bookings').update({ late_email_sent: true }).eq('id', b.id);
      }
    }
  }
}

export const config: Config = {
  schedule: '* * * * *',
};
