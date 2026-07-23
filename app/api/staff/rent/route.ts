import { NextRequest, NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET ?week=YYYY-MM-DD (a Monday) → everything the Rent Day screen needs:
// active tenancies + that week's payments + pending utility overages.
export async function GET(req: NextRequest) {
  const { error } = await requireManager();
  if (error) return error;

  const week = req.nextUrl.searchParams.get('week');
  if (!week || !/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return NextResponse.json({ error: 'week=YYYY-MM-DD required' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const [tenanciesRes, paymentsRes, utilityRes] = await Promise.all([
    db.from('tenancies')
      .select('id, weekly_rate, status, move_in, move_out, tenants(id, is_primary, name, phone, email), units(id, title, complex_name, unit_number)')
      .eq('status', 'active'),
    db.from('tenant_payments').select('*').eq('week_due', week),
    db.from('utility_charges').select('id, tenancy_id, month, overage, status').eq('status', 'pending'),
  ]);

  if (tenanciesRes.error) return NextResponse.json({ error: tenanciesRes.error.message }, { status: 500 });
  return NextResponse.json({
    tenancies: tenanciesRes.data ?? [],
    payments: paymentsRes.data ?? [],
    pending_overages: utilityRes.data ?? [],
  });
}
