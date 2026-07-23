import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  const { booking_id, lead_id, body } = await req.json();
  if (!body?.trim()) return NextResponse.json({ error: 'Note cannot be empty' }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error: err } = await db.from('notes').insert({
    booking_id: booking_id ?? null,
    lead_id: lead_id ?? null,
    author: user?.email ?? 'staff',
    body: body.trim(),
  }).select().single();

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ note: data });
}
