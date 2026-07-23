import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { tenantPlainHTML } from '@/lib/email/templates';

// POST: send a (possibly template-based, always editable) email to a tenant.
// Body: { tenancy_id, to, subject, body, template_key? }
// Always sends from the management voice and logs to message_log.
export async function POST(req: Request) {
  const { error } = await requireManager();
  if (error) return error;

  const { tenancy_id, to, subject, body, template_key } = await req.json();
  if (!to?.trim() || !subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'to, subject, and body required' }, { status: 400 });
  }

  const { ok, error: sendErr } = await sendEmail({
    to: to.trim(),
    subject: subject.trim(),
    html: tenantPlainHTML(subject.trim(), body.trim()),
    voice: 'management',
  });

  if (!ok) return NextResponse.json({ error: 'Send failed', detail: String(sendErr) }, { status: 502 });

  const db = supabaseAdmin();
  try {
    await db.from('message_log').insert({
      type: template_key || 'tenant_custom',
      channel: 'email',
      recipient: to.trim(),
      meta: { tenancy_id: tenancy_id ?? null, subject: subject.trim() },
    });
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true });
}
