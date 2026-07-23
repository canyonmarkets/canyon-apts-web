import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const auth = await requireStaff();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get('days') ?? '30');

  const db = supabaseAdmin();
  const since = days > 0
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    : new Date('2020-01-01').toISOString();

  // All leads in window
  const { data: leads } = await db
    .from('leads')
    .select('id, heard_about, desired_city, bedrooms, created_at')
    .gte('created_at', since);

  // All bookings in window (joined with lead for no-show tracking)
  const { data: bookings } = await db
    .from('bookings')
    .select('id, status, pipeline_stage, slot_start, lead_id, recap_sent, created_at')
    .gte('created_at', since);

  if (!leads || !bookings) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }

  // Lead sources
  const sourceCounts: Record<string, number> = {};
  for (const l of leads) {
    const src = l.heard_about || 'unknown';
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
  }
  const leadSources = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));

  // Bookings per week (last 8 weeks max)
  const weekMap: Record<string, number> = {};
  for (const b of bookings) {
    const d = new Date(b.slot_start);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toLocaleDateString('en-CA');
    weekMap[key] = (weekMap[key] ?? 0) + 1;
  }
  const bookingsPerWeek = Object.entries(weekMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([week, count]) => ({ week, count }));

  // No-show rate
  const completed = bookings.filter(b => b.status === 'completed' || b.status === 'no_show');
  const noShows = completed.filter(b => b.status === 'no_show');
  const noShowRate = completed.length > 0 ? Math.round((noShows.length / completed.length) * 100) : 0;

  // Conversion rate (recap_sent = photos sent = passed screening)
  const recapSent = bookings.filter(b => b.recap_sent).length;
  const conversionRate = bookings.length > 0 ? Math.round((recapSent / bookings.length) * 100) : 0;

  // Most wanted city
  const cityCounts: Record<string, number> = {};
  for (const l of leads) {
    const c = l.desired_city || 'unknown';
    cityCounts[c] = (cityCounts[c] ?? 0) + 1;
  }
  const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Most wanted bedrooms
  const bedCounts: Record<string, number> = {};
  for (const l of leads) {
    const b = String(l.bedrooms ?? 'unknown');
    bedCounts[b] = (bedCounts[b] ?? 0) + 1;
  }
  const topBeds = Object.entries(bedCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Pipeline stage breakdown
  const stageCounts: Record<string, number> = {};
  for (const b of bookings) {
    const s = b.pipeline_stage || 'new';
    stageCounts[s] = (stageCounts[s] ?? 0) + 1;
  }

  return NextResponse.json({
    leads: leads.length,
    bookings: bookings.length,
    noShowRate,
    conversionRate,
    topCity,
    topBeds,
    leadSources,
    bookingsPerWeek,
    stageCounts,
  });
}
