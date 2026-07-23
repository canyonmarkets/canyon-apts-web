import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Recent booked leads for the "start from a booking" picker on New Tenant.
export async function GET() {
  const { error } = await requireManager();
  if (error) return error;

  const db = supabaseAdmin();
  const since = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
  const { data } = await db
    .from('leads')
    .select('id, name, phone, email, pets, desired_city, bedrooms, created_at, bookings(id)')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(60);

  // Only leads who actually booked a call
  const leads = (data ?? []).filter(l => (l.bookings ?? []).length > 0)
    .map(({ bookings: _b, ...rest }) => rest);
  return NextResponse.json({ leads });
}
