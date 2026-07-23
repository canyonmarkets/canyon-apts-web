import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Universal person search: matches leads by name, phone, or email and returns
// their bookings + waitlist entries so the UI can jump straight to the record.
export async function GET(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ results: [] });

  const db = supabaseAdmin();
  const like = `%${q.replace(/[%_]/g, '')}%`;
  const [leadsRes, tenantsRes] = await Promise.all([
    db.from('leads')
      .select('id, name, phone, email, desired_city, bedrooms, bookings(id, slot_start, status, pipeline_stage), waitlist(id, reason, notified_at)')
      .or(`name.ilike.${like},phone.ilike.${like},email.ilike.${like}`)
      .order('created_at', { ascending: false })
      .limit(10),
    db.from('tenants')
      .select('id, name, phone, email, tenancy_id, tenancies(id, status, weekly_rate, units(complex_name, unit_number, title))')
      .or(`name.ilike.${like},phone.ilike.${like},email.ilike.${like}`)
      .limit(10),
  ]);

  if (leadsRes.error) return NextResponse.json({ error: leadsRes.error.message }, { status: 500 });
  return NextResponse.json({ results: leadsRes.data ?? [], tenants: tenantsRes.data ?? [] });
}
