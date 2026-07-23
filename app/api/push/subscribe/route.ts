import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const { userId, error } = await requireStaff();
  if (error) return error;

  const subscription = await req.json();
  const db = supabaseAdmin();

  await db.from('push_subscriptions').upsert({
    staff_id: userId,
    subscription,
  }, { onConflict: 'staff_id' });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { userId, error } = await requireStaff();
  if (error) return error;

  const db = supabaseAdmin();
  await db.from('push_subscriptions').delete().eq('staff_id', userId);
  return NextResponse.json({ ok: true });
}

// GET — this account's alert settings (for the toggle on the staff home page)
export async function GET() {
  const { userId, error } = await requireStaff();
  if (error) return error;
  const db = supabaseAdmin();
  const { data } = await db.from('push_subscriptions').select('muted_topics').eq('staff_id', userId).maybeSingle();
  return NextResponse.json({ subscribed: !!data, muted_topics: data?.muted_topics ?? [] });
}

// PATCH { muted_topics: string[] } — mute/unmute alert types for this account
export async function PATCH(req: Request) {
  const { userId, error } = await requireStaff();
  if (error) return error;
  const { muted_topics } = await req.json();
  if (!Array.isArray(muted_topics)) return NextResponse.json({ error: 'muted_topics must be an array' }, { status: 400 });
  const db = supabaseAdmin();
  const { error: err } = await db.from('push_subscriptions')
    .update({ muted_topics: muted_topics.filter(t => typeof t === 'string') })
    .eq('staff_id', userId);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
