import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireStaff();
  if (error) return error;
  const { id } = await params;
  const db = supabaseAdmin();

  const [bookingRes, notesRes] = await Promise.all([
    db.from('bookings').select('*, leads(*)').eq('id', id).single(),
    db.from('notes').select('*').eq('booking_id', id).order('created_at', { ascending: false }),
  ]);

  if (bookingRes.error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ booking: bookingRes.data, notes: notesRes.data ?? [] });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireStaff();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const db = supabaseAdmin();

  const allowed = ['pipeline_stage', 'status', 'opened_at', 'assigned_to'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const { data, error: err } = await db.from('bookings').update(update).eq('id', id).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ booking: data });
}
