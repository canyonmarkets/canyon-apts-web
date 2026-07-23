import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { tenantPlainHTML } from '@/lib/email/templates';

// POST { tenancy_id, data } — create the agreement + email the signing link.
export async function POST(req: Request) {
  const { error, userId } = await requireManager();
  if (error) return error;

  const { tenancy_id, data, recipients } = await req.json();
  if (!data?.guests?.[0]?.name) return NextResponse.json({ error: 'At least one guest is required' }, { status: 400 });
  const primary = data.guests[0];
  if (!primary.email?.trim()) return NextResponse.json({ error: 'The primary guest needs an email to receive the signing link' }, { status: 400 });
  // Only guests on the agreement can receive the link
  const guestEmails = new Set((data.guests as { email?: string }[]).map(g => g.email?.trim()).filter(Boolean));
  const sendTo: string[] = (Array.isArray(recipients) && recipients.length ? recipients : [primary.email.trim()])
    .map((r: string) => r.trim()).filter((r: string) => guestEmails.has(r));
  if (sendTo.length === 0) sendTo.push(primary.email.trim());

  const token = crypto.randomBytes(24).toString('base64url');
  const db = supabaseAdmin();

  const { data: agreement, error: err } = await db.from('agreements')
    .insert({
      tenancy_id: tenancy_id ?? null,
      token,
      status: 'sent',
      data,
      events: [{ type: 'sent', at: new Date().toISOString(), name: primary.name }],
      created_by: userId,
    })
    .select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const link = `${base}/sign/${token}`;

  let allOk = true;
  for (const to of sendTo) {
    const guestName = (data.guests as { name: string; email?: string }[]).find(g => g.email?.trim() === to)?.name ?? primary.name;
    const body = `Hi ${guestName.split(' ')[0]},

Your rental agreement for ${data.address} is ready to review and sign.

Open this link on your phone or computer, read through the agreement, and sign at the bottom:

${link}

Check-in: ${data.checkIn} · Weekly payment: $${Number(data.weeklyPayment).toLocaleString()}
${data.guests.length > 1 ? `\nAll ${data.guests.length} adults sign on this same link, one after another.\n` : ''}
If anything looks incorrect, reply to this email before signing.

Thank you,
Canyon Apartments Management`;

    const { ok } = await sendEmail({
      to,
      subject: `Your rental agreement is ready to sign — Canyon Apartments`,
      html: tenantPlainHTML('Your Rental Agreement Is Ready', body),
      voice: 'management',
    });
    if (!ok) allOk = false;
    if (tenancy_id) {
      try { await db.from('message_log').insert({ type: 'agreement_sent', channel: 'email', recipient: to, meta: { tenancy_id, subject: 'Rental agreement signing link' } }); } catch { /* non-critical */ }
    }
  }

  if (tenancy_id) {
    try {
      await db.from('tenancy_events').insert({ tenancy_id, type: 'note', note: `📄 Rental agreement sent to ${sendTo.join(', ')}${allOk ? '' : ' (AN EMAIL FAILED — resend needed)'}`, recorded_by: userId });
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ agreement_id: agreement.id, link, emailed: allOk });
}

// GET ?tenancy_id= — agreements for a tenant card.
export async function GET(req: Request) {
  const { error } = await requireManager();
  if (error) return error;
  const tenancyId = new URL(req.url).searchParams.get('tenancy_id');
  if (!tenancyId) return NextResponse.json({ error: 'tenancy_id required' }, { status: 400 });
  const db = supabaseAdmin();
  const { data } = await db.from('agreements')
    .select('id, status, sent_at, signed_at, token, document_id')
    .eq('tenancy_id', tenancyId).order('sent_at', { ascending: false });
  return NextResponse.json({ agreements: data ?? [] });
}
