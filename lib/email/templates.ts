const BRAND_COLOR = '#C94B0C';
const DARK_BG = '#1c1917';

interface LeadData {
  name: string;
  phone: string;
  email: string;
  party_size?: number | null;
  desired_city?: string | null;
  bedrooms?: number | null;
  move_in_date?: string | null;
  lead_source?: string | null;
  heard_about?: string | null;
  screening_answers?: Record<string, boolean>;
}

function baseWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:${DARK_BG};padding:24px 32px;">
            <p style="margin:0;color:${BRAND_COLOR};font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">Canyon Apartments</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.2;">${content.match(/<!-- TITLE -->([\s\S]*?)<!-- \/TITLE -->/)?.[1] ?? ''}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            ${content.replace(/<!-- TITLE -->[\s\S]*?<!-- \/TITLE -->/, '')}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 32px;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Canyon Apartments · Phoenix Metro · <a href="https://canyon-apts.com" style="color:${BRAND_COLOR};text-decoration:none;">canyon-apts.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function prospectConfirmationHTML(lead: LeadData, slotLabel: string): string {
  const body = `
<!-- TITLE -->Your Call Is Booked!<!-- /TITLE -->
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
  Hi ${lead.name} — you're all set. Here are your details:
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3ee;border-radius:8px;padding:20px;margin-bottom:24px;">
  <tr>
    <td>
      <p style="margin:0 0 4px;color:${BRAND_COLOR};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Your call time</p>
      <p style="margin:0;color:#111827;font-size:20px;font-weight:700;">${slotLabel}</p>
      <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">MST · Phoenix, Arizona</p>
    </td>
  </tr>
</table>
<p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">
  <strong>We'll call you at ${lead.phone}.</strong> A calendar invite is attached to this email — add it so you don't forget.
</p>
<p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
  On the call we'll go over your situation, match you with available units, and answer any questions. Most people are able to move in within a day or two of their call.
</p>
<p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Need to reschedule? Reply to this email or call us:</p>
<p style="margin:0;"><a href="tel:+16232307020" style="color:${BRAND_COLOR};font-weight:600;font-size:16px;text-decoration:none;">(623) 230-7020</a></p>
`;
  return baseWrapper(body);
}

export function staffNewBookingHTML(lead: LeadData, slotLabel: string, bookingId: string): string {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const body = `
<!-- TITLE -->New Booking — ${lead.name}<!-- /TITLE -->
<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
  <tr style="background:#fef3ee;">
    <td style="padding:10px 16px;color:${BRAND_COLOR};font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;width:140px;">Call Time</td>
    <td style="padding:10px 16px;color:#111827;font-weight:700;font-size:16px;">${slotLabel} MST</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Name</td>
    <td style="padding:10px 16px;color:#111827;font-size:14px;">${lead.name}</td>
  </tr>
  <tr>
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Phone</td>
    <td style="padding:10px 16px;font-size:14px;"><a href="tel:${lead.phone.replace(/\D/g,'')}" style="color:${BRAND_COLOR};font-weight:600;">${lead.phone}</a></td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Email</td>
    <td style="padding:10px 16px;font-size:14px;"><a href="mailto:${lead.email}" style="color:${BRAND_COLOR};">${lead.email}</a></td>
  </tr>
  <tr>
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Party size</td>
    <td style="padding:10px 16px;color:#111827;font-size:14px;">${lead.party_size ?? '—'}</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">City wanted</td>
    <td style="padding:10px 16px;color:#111827;font-size:14px;">${lead.desired_city ? capitalize(lead.desired_city) : '—'}</td>
  </tr>
  <tr>
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Bedrooms</td>
    <td style="padding:10px 16px;color:#111827;font-size:14px;">${lead.bedrooms ? `${lead.bedrooms}BR` : '—'}</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Move-in date</td>
    <td style="padding:10px 16px;color:#111827;font-size:14px;">${lead.move_in_date ?? '—'}</td>
  </tr>
  <tr>
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Lead source</td>
    <td style="padding:10px 16px;color:#111827;font-size:14px;">${lead.lead_source ? capitalize(lead.lead_source) : '—'}${lead.heard_about ? ` · "${lead.heard_about}"` : ''}</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Booking ID</td>
    <td style="padding:10px 16px;color:#9ca3af;font-size:12px;font-family:monospace;">${bookingId}</td>
  </tr>
</table>
`;
  return baseWrapper(body);
}

export function errorAlertHTML(context: string, error: unknown): string {
  const body = `
<!-- TITLE -->⚠️ System Error<!-- /TITLE -->
<p style="margin:0 0 16px;color:#374151;font-size:15px;">A critical function failed. Details:</p>
<pre style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:16px;font-size:12px;overflow:auto;color:#111827;">${context}\n\n${String(error)}</pre>
`;
  return baseWrapper(body);
}
