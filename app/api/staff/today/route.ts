import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  const db = supabaseAdmin();
  const phoenixDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
  const dayStart = `${phoenixDate}T00:00:00-07:00`;
  const dayEnd = `${phoenixDate}T23:59:59-07:00`;

  const [bookingsRes, followUpsRes, waitlistRes, hotLeadsRes] = await Promise.all([
    db.from('bookings')
      .select('*, leads(*)')
      .gte('slot_start', dayStart)
      .lte('slot_start', dayEnd)
      .neq('status', 'canceled')
      .order('slot_start'),
    db.from('follow_ups')
      .select('*, leads(name, phone, email)')
      .lte('due_at', new Date().toISOString())
      .eq('done', false)
      .order('due_at'),
    db.from('waitlist').select('id', { count: 'exact', head: true }).is('notified_at', null),
    db.from('bookings')
      .select('*, leads(name, phone, desired_city, bedrooms)')
      .in('pipeline_stage', ['following_up', 'toured_applied'])
      .neq('status', 'canceled')
      .order('slot_start', { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    bookings: bookingsRes.data ?? [],
    followUps: followUpsRes.data ?? [],
    waitlistCount: waitlistRes.count ?? 0,
    hotLeads: hotLeadsRes.data ?? [],
  });
}
