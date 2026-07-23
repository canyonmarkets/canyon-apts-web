import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// One payload for the whole Reports screen; the page does the math.
export async function GET() {
  const { error } = await requireManager();
  if (error) return error;

  const db = supabaseAdmin();
  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const [paymentsRes, tenanciesRes, unitsRes] = await Promise.all([
    db.from('tenant_payments')
      .select('tenancy_id, type, amount, method, week_due, paid_at, late')
      .gte('paid_at', yearStart)
      .order('paid_at', { ascending: true })
      .limit(10000),
    db.from('tenancies')
      .select('id, status, weekly_rate, move_in, move_out, deposit_total, deposit_status, deposit_returned_amount, unit_id, notes, tenants(is_primary, name)'),
    db.from('units').select('id, status'),
  ]);

  if (paymentsRes.error) return NextResponse.json({ error: paymentsRes.error.message }, { status: 500 });
  return NextResponse.json({
    payments: paymentsRes.data ?? [],
    tenancies: tenanciesRes.data ?? [],
    units: unitsRes.data ?? [],
  });
}
