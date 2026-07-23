import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { tenantPlainHTML } from '@/lib/email/templates';
import { renderAgreementPDF, type SignatureEntry, type AuditEvent } from '@/lib/agreement/pdf';

// Public signing endpoints — no login; access is the unguessable token itself.

function clientIp(req: NextRequest) {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = supabaseAdmin();
  const { data: ag } = await db.from('agreements').select('*').eq('token', token).single();
  if (!ag || ag.status === 'voided') return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Log the view (throttled: skip if last event is a view within 10 min from same IP)
  const ip = clientIp(req);
  const events: AuditEvent[] = ag.events ?? [];
  const last = events[events.length - 1];
  const recentSameView = last?.type === 'viewed' && last.ip === ip && Date.now() - new Date(last.at).getTime() < 10 * 60 * 1000;
  if (!recentSameView) {
    events.push({ type: 'viewed', at: new Date().toISOString(), ip });
    await db.from('agreements').update({ events, status: ag.status === 'sent' ? 'viewed' : ag.status }).eq('id', ag.id);
  }

  return NextResponse.json({
    status: ag.status,
    data: ag.data,
    signed: (ag.signatures ?? []).map((sig: SignatureEntry) => ({ guest: sig.guest, at: sig.at })),
    uploads: {
      id: events.filter(e => e.type === 'id_uploaded').map(e => e.name),
      selfie: events.filter(e => e.type === 'selfie_uploaded').map(e => e.name),
    },
  });
}

// PUT multipart — the guest uploads their photo ID (kind=id) or a selfie (kind=selfie) after signing.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const guest = (form.get('guest') as string) || 'Guest';
  const kind = form.get('kind') === 'selfie' ? 'selfie' : 'id';
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'File too large (15 MB max)' }, { status: 400 });
  if (!/^image\/|^application\/pdf$/.test(file.type)) return NextResponse.json({ error: 'Photos or PDF only' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: ag } = await db.from('agreements').select('id, tenancy_id, data, events').eq('token', token).single();
  if (!ag) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ext = file.type === 'application/pdf' ? 'pdf' : (file.type.split('/')[1] || 'jpg');
  const storagePath = `${ag.tenancy_id ?? 'general'}/${kind === 'selfie' ? 'selfie' : 'photo-id'}-${guest.replace(/[^\w]+/g, '-')}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await db.storage.from('documents').upload(storagePath, buffer, { contentType: file.type });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  await db.from('documents').insert({
    tenancy_id: ag.tenancy_id, tenant_name: (ag.data.guests?.[0]?.name as string) ?? guest,
    name: `${kind === 'selfie' ? 'Selfie' : 'Photo ID'} — ${guest}`, storage_path: storagePath, mime: file.type,
  });
  const events = [...(ag.events ?? []), { type: kind === 'selfie' ? 'selfie_uploaded' : 'id_uploaded', at: new Date().toISOString(), ip: clientIp(req), name: guest }];
  await db.from('agreements').update({ events }).eq('id', ag.id);
  if (ag.tenancy_id) {
    try { await db.from('tenancy_events').insert({ tenancy_id: ag.tenancy_id, type: 'note', note: `${kind === 'selfie' ? '🤳 Selfie' : '🪪 Photo ID'} uploaded by ${guest}` }); } catch { /* non-critical */ }
  }
  return NextResponse.json({ ok: true });
}

// POST { guest, nameTyped, image } — record one guest's signature.
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { guest, nameTyped, image } = await req.json();
  if (!guest || !nameTyped?.trim() || !image?.startsWith('data:image/png')) {
    return NextResponse.json({ error: 'Signature incomplete' }, { status: 400 });
  }
  if (image.length > 300_000) return NextResponse.json({ error: 'Signature image too large' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: ag } = await db.from('agreements').select('*').eq('token', token).single();
  if (!ag || ag.status === 'voided') return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const guests: { name: string }[] = ag.data.guests ?? [];
  if (!guests.some(g => g.name === guest)) return NextResponse.json({ error: 'Unknown guest' }, { status: 400 });

  const ip = clientIp(req);
  const now = new Date().toISOString();
  const signatures: SignatureEntry[] = (ag.signatures ?? []).filter((sig: SignatureEntry) => sig.guest !== guest);
  signatures.push({ guest, nameTyped: nameTyped.trim(), image, at: now, ip });

  const events: AuditEvent[] = [...(ag.events ?? []), { type: 'signed', at: now, ip, name: `${guest} (typed: ${nameTyped.trim()})` }];
  const allSigned = guests.every(g => signatures.some(sig => sig.guest === g.name));

  // Render the latest PDF and store/replace it in the documents vault
  const pdf = await renderAgreementPDF(ag.data, signatures, events);
  const storagePath = `${ag.tenancy_id ?? 'general'}/rental-agreement-${ag.id}.pdf`;
  await db.storage.from('documents').upload(storagePath, pdf, { contentType: 'application/pdf', upsert: true });

  let documentId = ag.document_id;
  if (!documentId) {
    const { data: doc } = await db.from('documents')
      .insert({
        tenancy_id: ag.tenancy_id, tenant_name: guests[0]?.name ?? null,
        name: `Rental Agreement — signed${allSigned ? '' : ' (partial)'}.pdf`,
        storage_path: storagePath, mime: 'application/pdf',
      })
      .select().single();
    documentId = doc?.id ?? null;
  } else if (allSigned) {
    await db.from('documents').update({ name: 'Rental Agreement — signed.pdf' }).eq('id', documentId);
  }

  await db.from('agreements').update({
    signatures, events,
    status: allSigned ? 'signed' : ag.status,
    signed_at: allSigned ? now : ag.signed_at,
    document_id: documentId,
  }).eq('id', ag.id);

  if (ag.tenancy_id) {
    try {
      await db.from('tenancy_events').insert({ tenancy_id: ag.tenancy_id, type: 'note', note: `✍️ Rental agreement signed by ${guest}${allSigned ? ' — all guests have signed' : ''}` });
    } catch { /* non-critical */ }
  }

  // Tell staff
  try {
    await sendEmail({
      to: process.env.STAFF_NOTIFY_EMAIL || 'properties@canyon-advisors.com',
      subject: `✍️ Agreement signed by ${guest} — ${ag.data.address}`,
      html: tenantPlainHTML('Agreement Signed', `${guest} just signed the rental agreement for ${ag.data.address}.\n\n${allSigned ? 'All guests have now signed. ' : ''}The signed PDF is saved in the Documents vault and on the tenant's card.`),
      voice: 'management',
    });
  } catch { /* non-critical */ }

  // Everyone signed → email each adult their finished copy
  if (allSigned) {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const pdfLink = `${base}/api/sign/${token}/pdf`;
    const withEmail = (ag.data.guests ?? []).filter((g: { email?: string }) => g.email?.trim());
    for (const g of withEmail as { name: string; email: string }[]) {
      try {
        await sendEmail({
          to: g.email.trim(),
          subject: `Your signed rental agreement — ${ag.data.address}`,
          html: tenantPlainHTML('Your Signed Rental Agreement', `Hi ${g.name.split(' ')[0]},

Everyone has signed — your rental agreement for ${ag.data.address} is complete.

Download or print your copy any time:

${pdfLink}

Please keep this email for your records.

Welcome home,
Canyon Apartments Management`),
          voice: 'management',
        });
      } catch { /* non-critical */ }
    }
  }

  return NextResponse.json({ ok: true, allSigned });
}
