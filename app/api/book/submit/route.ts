import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getOpenSlots } from '@/lib/availability';
import { buildICS } from '@/lib/ics';
import { sendEmail } from '@/lib/email/send';
import { sendSMS } from '@/lib/sms';
import { prospectConfirmationHTML, staffNewBookingHTML, errorAlertHTML } from '@/lib/email/templates';
import { sendPushToStaff } from '@/lib/push';

async function alertJeff(context: string, error: unknown) {
  const alertEmail = process.env.ERROR_ALERT_EMAIL;
  if (!alertEmail) return;
  await sendEmail({
    to: alertEmail,
    subject: `Canyon Apts — System Error: ${context}`,
    html: errorAlertHTML(context, error),
  }).catch(() => {});
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name, phone, email, party_size, desired_city, bedrooms, move_in_date, pets,
      lead_source, utm_source, utm_medium, utm_campaign, referrer, heard_about,
      screening_answers, slot_start, slot_end, sms_opt_in,
    } = body;

    // Basic validation
    if (!name?.trim() || !phone?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name, phone, and email are required.' }, { status: 400 });
    }
    if (![1, 2].includes(Number(bedrooms))) {
      return NextResponse.json({ error: 'Bedrooms must be 1 or 2.' }, { status: 400 });
    }
    if (!slot_start || !slot_end) {
      return NextResponse.json({ error: 'A time slot is required.' }, { status: 400 });
    }

    // Confirm slot is still open
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
    const slotDate = new Date(slot_start).toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
    const openSlots = await getOpenSlots(today, slotDate);
    const slotOpen = openSlots.some(s => s.startISO === new Date(slot_start).toISOString());
    if (!slotOpen) {
      return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
    }

    const db = supabaseAdmin();

    // Insert lead
    const { data: lead, error: leadErr } = await db
      .from('leads')
      .insert({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        party_size: party_size ? Number(party_size) : null,
        desired_city: desired_city ?? null,
        bedrooms: Number(bedrooms),
        move_in_date: move_in_date?.trim() || null,
        pets: pets?.trim() || null,
        lead_source: lead_source ?? 'other',
        utm_source: utm_source ?? null,
        utm_medium: utm_medium ?? null,
        utm_campaign: utm_campaign ?? null,
        referrer: referrer ?? null,
        heard_about: heard_about ?? null,
        sms_opt_in: sms_opt_in === true,
        screening_answers: screening_answers ?? {},
      })
      .select()
      .single();

    if (leadErr || !lead) {
      await alertJeff('insert leads', leadErr);
      return NextResponse.json({ error: 'Failed to save your information.' }, { status: 500 });
    }

    // Insert booking (unique index on slot_start enforces no double-booking)
    const { data: booking, error: bookingErr } = await db
      .from('bookings')
      .insert({
        lead_id: lead.id,
        slot_start: new Date(slot_start).toISOString(),
        slot_end: new Date(slot_end).toISOString(),
        status: 'scheduled',
        pipeline_stage: 'new',
      })
      .select()
      .single();

    if (bookingErr) {
      // Postgres unique violation = slot just got taken
      if (bookingErr.code === '23505') {
        return NextResponse.json({ error: 'slot_taken' }, { status: 409 });
      }
      await alertJeff('insert bookings', bookingErr);
      return NextResponse.json({ error: 'Failed to save your booking.' }, { status: 500 });
    }

    // Format slot label for emails
    const slotLabel = new Date(slot_start).toLocaleString('en-US', {
      timeZone: 'America/Phoenix',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    // Build .ics
    const ics = buildICS({
      uid: booking.id,
      startISO: new Date(slot_start).toISOString(),
      endISO: new Date(slot_end).toISOString(),
      summary: 'Canyon Apartments — 15-Min Call',
      description: `Your call with Canyon Apartments is scheduled. We will call you at ${phone.trim()}.\n\nQuestions? Call (623) 230-7020 or visit canyon-apts.com`,
      location: 'Phone call — we call you',
    });

    // Send prospect confirmation (with .ics)
    const prospectResult = await sendEmail({
      to: email.trim(),
      subject: `Your call is booked — ${slotLabel} MST`,
      html: prospectConfirmationHTML({ name, phone, email }, slotLabel),
      attachments: [{ filename: 'canyon-apts-call.ics', content: Buffer.from(ics).toString('base64') }],
    });

    // Pop a push on staff phones — the "somebody just grabbed the 11:45 slot" alert
    await sendPushToStaff({
      title: '📞 New booking',
      body: `${name.trim()} — ${slotLabel}${desired_city ? ` · ${desired_city}` : ''}`,
      url: `/staff/bookings/${booking.id}`,
    }, 'bookings');

    // Send staff alert
    const staffResult = await sendEmail({
      to: process.env.STAFF_NOTIFY_EMAIL || 'properties@canyon-advisors.com',
      subject: `New Booking: ${name.trim()} — ${slotLabel}`,
      html: staffNewBookingHTML(
        { name, phone, email, party_size, desired_city, bedrooms: Number(bedrooms), move_in_date, pets, lead_source, heard_about },
        slotLabel,
        booking.id,
      ),
    });

    // Confirmation SMS (opt-in only; no-op if Twilio not configured)
    if (sms_opt_in === true) {
      const smsBody = `You're booked! Canyon Apartments will call you ${slotLabel} MST. - Canyon Apts`;
      const smsResult = await sendSMS(phone.trim(), smsBody);
      if (smsResult.ok) {
        try { await db.from('message_log').insert({ lead_id: lead.id, booking_id: booking.id, type: 'confirmation', channel: 'sms' }); } catch { /* non-critical */ }
      }
    }

    // Log emails (don't fail booking if email fails)
    const logRows = [];
    if (prospectResult.ok) {
      logRows.push({ lead_id: lead.id, booking_id: booking.id, type: 'confirmation', channel: 'email' });
    } else {
      await alertJeff('prospect confirmation email', prospectResult.error);
    }
    if (staffResult.ok) {
      logRows.push({ lead_id: lead.id, booking_id: booking.id, type: 'staff_notify', channel: 'email' });
    } else {
      await alertJeff('staff notify email', staffResult.error);
    }
    if (logRows.length > 0) {
      try { await db.from('message_log').insert(logRows); } catch { /* non-critical */ }
    }

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    await alertJeff('POST /api/book/submit', err).catch(() => {});
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
