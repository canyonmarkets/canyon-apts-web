import { Resend } from 'resend';

export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
  replyTo?: string;
  // 'booking' = properties@ (Joleen's voice) · 'management' = management@ (Emily's voice).
  // Tenant-facing email always uses 'management' so replies land in the right inbox.
  voice?: 'booking' | 'management';
}): Promise<{ ok: boolean; error?: unknown }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'no RESEND_API_KEY' };

  const from = args.voice === 'management'
    ? (process.env.RESEND_FROM_MGMT || 'Canyon Apartments <management@canyon-advisors.com>')
    : (process.env.RESEND_FROM || 'Canyon Apartments <properties@canyon-advisors.com>');

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    replyTo: args.replyTo,
    to: args.to,
    subject: args.subject,
    html: args.html,
    attachments: args.attachments,
  });

  return error ? { ok: false, error } : { ok: true };
}
