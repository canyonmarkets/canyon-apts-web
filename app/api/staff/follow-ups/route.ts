import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const { lead_id, due_at, note } = await req.json();
  if (!lead_id || !due_at) return NextResponse.json({ error: 'lead_id and due_at required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error: err } = await db.from('follow_ups').insert({
    lead_id, due_at, note: note ?? null, done: false,
  }).select().single();

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ followUp: data });
}

export async function PATCH(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const { id, done } = await req.json();
  const db = supabaseAdmin();
  const { data, error: err } = await db.from('follow_ups').update({ done }).eq('id', id).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ followUp: data });
}
