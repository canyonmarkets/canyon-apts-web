import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') ?? 'upcoming'; // today | upcoming | all
  const db = supabaseAdmin();

  let query = db.from('bookings').select('*, leads(*)').neq('status', 'canceled');

  const phoenixDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
  if (filter === 'today') {
    query = query
      .gte('slot_start', `${phoenixDate}T00:00:00-07:00`)
      .lte('slot_start', `${phoenixDate}T23:59:59-07:00`);
  } else if (filter === 'upcoming') {
    query = query.gte('slot_start', `${phoenixDate}T00:00:00-07:00`);
  }

  const { data } = await query.order('slot_start', { ascending: filter !== 'all' });
  return NextResponse.json({ bookings: data ?? [] });
}
