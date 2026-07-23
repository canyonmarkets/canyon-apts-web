import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  const db = supabaseAdmin();
  const [rulesRes, blocksRes] = await Promise.all([
    db.from('availability_rules').select('*').order('day_of_week'),
    db.from('availability_blocks').select('*').gte('end_at', new Date().toISOString()).order('start_at'),
  ]);

  return NextResponse.json({ rules: rulesRes.data ?? [], blocks: blocksRes.data ?? [] });
}

export async function PATCH(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const { rules } = await req.json();
  if (!Array.isArray(rules)) return NextResponse.json({ error: 'rules array required' }, { status: 400 });

  const db = supabaseAdmin();
  const results = await Promise.all(
    rules.map(r => db.from('availability_rules').update({
      start_time: r.start_time,
      end_time: r.end_time,
      slot_minutes: r.slot_minutes,
      buffer_minutes: r.buffer_minutes,
      active: r.active,
    }).eq('id', r.id).select().single())
  );

  const errors = results.filter(r => r.error);
  if (errors.length) return NextResponse.json({ error: 'Some rules failed to update' }, { status: 500 });
  return NextResponse.json({ rules: results.map(r => r.data) });
}
