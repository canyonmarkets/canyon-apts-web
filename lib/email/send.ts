import { Resend } from 'resend';

export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
  replyTo?: string;
}): Promise<{ ok: boolean; error?: unknown }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'no RESEND_API_KEY' };

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM || 'Canyon Apartments <properties@canyon-advisors.com>',
    replyTo: args.replyTo,
    to: args.to,
    subject: args.subject,
    html: args.html,
    attachments: args.attachments,
  });

  return error ? { ok: false, error } : { ok: true };
}
