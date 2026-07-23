import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { renderAgreementPDF } from '@/lib/agreement/pdf';

// POST { data } — render the agreement PDF for preview without creating anything.
export async function POST(req: Request) {
  const { error } = await requireManager();
  if (error) return error;

  const { data } = await req.json();
  if (!data?.guests?.length) return NextResponse.json({ error: 'data required' }, { status: 400 });

  const pdf = await renderAgreementPDF(data, [], [
    { type: 'sent', at: new Date().toISOString(), name: 'PREVIEW — not yet sent' },
  ]);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="rental-agreement-preview.pdf"',
    },
  });
}
