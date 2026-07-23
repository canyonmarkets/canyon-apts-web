import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { renderAgreementPDF } from '@/lib/agreement/pdf';

// Public download of the agreement PDF — access is the unguessable token itself.
// Regenerates from current state so the audit trail is always complete.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = supabaseAdmin();
  const { data: ag } = await db.from('agreements').select('data, signatures, events, status').eq('token', token).single();
  if (!ag || ag.status === 'voided') return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const pdf = await renderAgreementPDF(ag.data, ag.signatures ?? [], ag.events ?? []);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="Canyon Rental Agreement${ag.status === 'signed' ? ' — signed' : ''}.pdf"`,
    },
  });
}
