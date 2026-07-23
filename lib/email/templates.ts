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
  pets?: string | null;
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
    <td style="padding:10px 16px;color:#6b7280;font-size:13px;font-weight:600;">Pets</td>
    <td style="padding:10px 16px;color:#111827;font-size:14px;">${lead.pets ?? '—'}</td>
  </tr>
  <tr style="background:#f9fafb;">
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

// ─── PHASE 4 TEMPLATES ────────────────────────────────────────────────────────

export function reminderHTML(lead: { name: string; phone: string }, slotLabel: string, hoursOut: 2 | 1): string {
  const titleText = hoursOut === 2 ? 'Your Call Is Coming Up in 2 Hours' : 'Your Call Is in 1 Hour';
  const timeNote = hoursOut === 2 ? 'in about two hours' : 'in about an hour';
  const body = `
<!-- TITLE -->${titleText}<!-- /TITLE -->
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
  Hi ${lead.name} -- just a quick reminder that your Canyon Apartments call is coming up ${timeNote}.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3ee;border-radius:8px;padding:20px;margin-bottom:24px;">
  <tr>
    <td>
      <p style="margin:0 0 4px;color:${BRAND_COLOR};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Your call time</p>
      <p style="margin:0;color:#111827;font-size:20px;font-weight:700;">${slotLabel}</p>
      <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">MST · Phoenix, Arizona · We'll call you</p>
    </td>
  </tr>
</table>
<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
  <strong>We'll call you at ${lead.phone}.</strong> No need to do anything — just make sure you're available at that time.
</p>
<p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
  Need to reschedule? Just reply to this email and we'll find another time that works.
</p>
`;
  return baseWrapper(body);
}

export function runningBehindHTML(lead: { name: string }): string {
  const body = `
<!-- TITLE -->Running a Few Minutes Behind<!-- /TITLE -->
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
  Hi ${lead.name} — so sorry, we're running just a few minutes behind on our call today.
</p>
<p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
  We'll reach out to you shortly. If now is no longer a good time, just reply to this email and we'll find a better window — we really do want to connect with you.
</p>
<p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
  Thank you for your patience. We look forward to talking soon.
</p>
`;
  return baseWrapper(body);
}

interface RecapUnit {
  title: string; area: string; city: string; bedrooms: number; bathrooms: number;
  weekly_price: number; amenities: string[]; special: string | null;
  complex_name: string | null; photoUrls: string[];
}

export function recapHTML(lead: { name: string }, unit: RecapUnit, note?: string): string {
  const safeNote = note
    ? note.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')
    : '';
  const noteBlock = safeNote
    ? `<p style="margin:0 0 20px;padding:14px 18px;background:#fff7ed;border-left:3px solid ${BRAND_COLOR};border-radius:6px;color:#374151;font-size:15px;line-height:1.6;">${safeNote}</p>`
    : '';
  const photoBlock = unit.photoUrls.length > 0
    ? unit.photoUrls.slice(0, 6).map(url =>
        `<img src="${url}" alt="${unit.title}" width="250" style="display:inline-block;width:250px;max-width:100%;border-radius:8px;margin:0 8px 8px 0;object-fit:cover;" />`
      ).join('')
    : '';

  const amenitiesBlock = unit.amenities.length > 0
    ? `<p style="margin:12px 0 0;color:#6b7280;font-size:13px;">${unit.amenities.join(' · ')}</p>`
    : '';

  const body = `
<!-- TITLE -->Here Are the Photos From Our Call<!-- /TITLE -->
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
  Hi ${lead.name} — it was great talking with you! As promised, here are the photos and details for the unit we discussed.
</p>
${noteBlock}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3ee;border-radius:8px;padding:20px;margin-bottom:24px;">
  <tr>
    <td>
      <p style="margin:0 0 2px;color:${BRAND_COLOR};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Unit</p>
      <p style="margin:0 0 4px;color:#111827;font-size:18px;font-weight:700;">${unit.title}</p>
      <p style="margin:0;color:#6b7280;font-size:14px;">${unit.city} · ${unit.bedrooms}BR / ${unit.bathrooms}BA</p>
      ${amenitiesBlock}
      ${unit.special ? `<p style="margin:10px 0 0;color:${BRAND_COLOR};font-size:14px;font-weight:600;">★ ${unit.special}</p>` : ''}
    </td>
    <td align="right" style="vertical-align:top;padding-left:16px;">
      <p style="margin:0;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Weekly rate</p>
      <p style="margin:4px 0 0;color:#111827;font-size:28px;font-weight:700;">$${unit.weekly_price.toLocaleString()}<span style="font-size:14px;font-weight:400;color:#6b7280;">/wk</span></p>
    </td>
  </tr>
</table>

${photoBlock ? `<div style="margin-bottom:24px;">${photoBlock}</div>` : ''}

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
  <tr><td>
    <p style="margin:0 0 10px;color:#111827;font-size:14px;font-weight:700;">A few things to remember:</p>
    <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8;">
      <li>All utilities, WiFi, and furniture included in the weekly rate</li>
      <li>No credit check required — we go off income and references</li>
      <li>Week-to-week lease — no long-term commitment</li>
      <li>Move-in is fast — often same day or next day once you're ready</li>
    </ul>
  </td></tr>
</table>

<p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
  Ready to move forward? Just reply to this email or give us a call and we'll get the paperwork handled quickly.
</p>
<p style="margin:0;color:#6b7280;font-size:13px;">
  Questions? Reply here anytime — we check email throughout the day.
</p>
`;
  return baseWrapper(body);
}

export function followupHTML(lead: { name: string }): string {
  const body = `
<!-- TITLE -->Did You Get the Photos?<!-- /TITLE -->
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
  Hi ${lead.name} — just checking in to make sure you received the photos and unit details we sent over earlier.
</p>
<p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
  Do you have any questions? We're happy to answer anything — about the unit, the process, pricing, or anything else. We want to make this as easy as possible for you.
</p>
<p style="margin:0 0 8px;color:#374151;font-size:15px;line-height:1.6;">
  If you're ready to move forward, just reply here and we'll get things started.
</p>
<p style="margin:0;color:#6b7280;font-size:13px;">
  — The Canyon Apartments team
</p>
`;
  return baseWrapper(body);
}

export function waitlistBlastHTML(lead: { name: string }, unit: { bedrooms: number; city: string; title: string; weekly_price: number; photoUrls: string[] }, note?: string): string {
  const safeBlastNote = note
    ? note.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')
    : '';
  const blastNoteBlock = safeBlastNote
    ? `<p style="margin:0 0 20px;padding:14px 18px;background:#fff7ed;border-left:3px solid ${BRAND_COLOR};border-radius:6px;color:#374151;font-size:15px;line-height:1.6;">${safeBlastNote}</p>`
    : '';
  const photoBlock = unit.photoUrls.slice(0, 4).map(url =>
    `<img src="${url}" alt="${unit.title}" width="240" style="display:inline-block;width:240px;max-width:100%;border-radius:8px;margin:0 8px 8px 0;object-fit:cover;" />`
  ).join('');

  const body = `
<!-- TITLE -->A ${unit.bedrooms}BR in ${unit.city} Just Opened Up<!-- /TITLE -->
<p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
  Hi ${lead.name} — great news. A ${unit.bedrooms}-bedroom furnished apartment in ${unit.city} just became available, and you were at the top of our list.
</p>
${blastNoteBlock}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3ee;border-radius:8px;padding:20px;margin-bottom:24px;">
  <tr>
    <td>
      <p style="margin:0 0 2px;color:${BRAND_COLOR};font-size:11px;text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">Available now</p>
      <p style="margin:0;color:#111827;font-size:18px;font-weight:700;">${unit.bedrooms}BR · ${unit.city}</p>
    </td>
    <td align="right">
      <p style="margin:0;color:#111827;font-size:24px;font-weight:700;">$${unit.weekly_price.toLocaleString()}<span style="font-size:13px;font-weight:400;color:#6b7280;">/wk</span></p>
    </td>
  </tr>
</table>

${photoBlock ? `<div style="margin-bottom:24px;">${photoBlock}</div>` : ''}

<p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
  These units move fast. If you're still looking, reply to this email or book a quick call below and we'll hold it for you while we talk.
</p>

<table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
  <tr>
    <td style="background:${BRAND_COLOR};border-radius:8px;padding:14px 28px;">
      <a href="https://canyon-apts.com/book?utm_source=waitlist_blast" style="color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.05em;">Book a Free 15-Min Call →</a>
    </td>
  </tr>
</table>

<p style="margin:0;color:#9ca3af;font-size:12px;">
  You're receiving this because you asked us to let you know when a ${unit.bedrooms}BR in ${unit.city} became available. Reply "STOP" to be removed from future notifications.
</p>
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


// ── Tenant template emails (Phase 6C) ────────────────────────────────────────
// The girls write plain text in the template editor; this wraps it in the
// branded shell with escaping + line breaks. No HTML knowledge needed.
export function tenantPlainHTML(title: string, bodyText: string): string {
  const esc = bodyText
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');
  const body = `<!-- TITLE -->${title}<!-- /TITLE -->
<p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">${esc}</p>`;
  return baseWrapper(body);
}