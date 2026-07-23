/**
 * One-way SMS via Twilio. Silently no-ops if TWILIO_* env vars are missing
 * so nothing breaks before A2P 10DLC approval.
 * HARD RULE: outbound only — never handle inbound replies.
 */

export async function sendSMS(to: string, body: string): Promise<{ ok: boolean }> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM;

  if (!sid || !token || !from) return { ok: false };

  // Strip non-digits then ensure E.164 format for US numbers
  const digits = to.replace(/\D/g, '');
  const e164 = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: e164, From: from, Body: body }).toString(),
        signal: AbortSignal.timeout(8000),
      },
    );
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}
