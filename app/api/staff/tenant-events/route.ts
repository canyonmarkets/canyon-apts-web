import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST: log an event on a tenancy (e.g. the one-time late extension).
// Body: { tenancy_id, type, note? }
export async function POST(req: Request) {
  const { error, userId } = await requireManager();
  if (error) return error;

  const { tenancy_id, type, note } = await req.json();
  if (!tenancy_id || !type?.trim()) {
    return NextResponse.json({ error: 'tenancy_id and type required' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data, error: err } = await db.from('tenancy_events')
    .insert({ tenancy_id, type: type.trim(), note: note?.trim() || null, recorded_by: userId })
    .select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ event: data });
}
