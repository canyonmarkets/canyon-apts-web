import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const { start_at, end_at, reason } = await req.json();
  if (!start_at || !end_at) return NextResponse.json({ error: 'start_at and end_at required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error: err } = await db.from('availability_blocks').insert({ start_at, end_at, reason: reason ?? null }).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ block: data });
}

export async function DELETE(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = supabaseAdmin();
  await db.from('availability_blocks').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
