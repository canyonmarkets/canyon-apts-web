import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST: enter a month's utility bill; the app does the overage math.
// Body: { tenancy_id, month (YYYY-MM), bill_amount, credit }
export async function POST(req: Request) {
  const { error } = await requireManager();
  if (error) return error;

  const { tenancy_id, month, bill_amount, credit } = await req.json();
  if (!tenancy_id || !month) return NextResponse.json({ error: 'tenancy_id and month required' }, { status: 400 });

  const bill = Number(bill_amount);
  const cred = Number(credit);
  if (!Number.isFinite(bill) || bill < 0 || !Number.isFinite(cred) || cred < 0) {
    return NextResponse.json({ error: 'Valid bill and credit amounts required' }, { status: 400 });
  }
  const overage = Math.max(0, Math.round((bill - cred) * 100) / 100);

  const db = supabaseAdmin();
  const { data, error: err } = await db.from('utility_charges')
    .insert({
      tenancy_id,
      month: month.length === 7 ? month + '-01' : month,
      bill_amount: bill,
      credit: cred,
      overage,
      status: overage > 0 ? 'pending' : 'waived',
    })
    .select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ charge: data });
}

// PATCH: resolve a charge.
// Body: { id, action: 'collect' | 'waive' | 'mark_emailed', week_due?, method? }
export async function PATCH(req: Request) {
  const { error, userId } = await requireManager();
  if (error) return error;

  const { id, action, week_due, method } = await req.json();
  if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: charge } = await db.from('utility_charges').select('*').eq('id', id).single();
  if (!charge) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (action === 'collect') {
    // Record the money and link it.
    const { data: payment, error: pErr } = await db.from('tenant_payments')
      .insert({
        tenancy_id: charge.tenancy_id,
        type: 'utility_overage',
        amount: charge.overage,
        method: method ?? null,
        week_due: week_due || null,
        note: `Utility overage for ${charge.month}`,
        recorded_by: userId,
      })
      .select().single();
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
    await db.from('utility_charges').update({ status: 'collected', collected_payment_id: payment.id }).eq('id', id);
    return NextResponse.json({ ok: true, payment });
  }

  if (action === 'waive') {
    await db.from('utility_charges').update({ status: 'waived' }).eq('id', id);
    return NextResponse.json({ ok: true });
  }

  if (action === 'mark_emailed') {
    await db.from('utility_charges').update({ emailed_at: new Date().toISOString() }).eq('id', id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

// DELETE: remove a mistaken entry.  Body: { id }
export async function DELETE(req: Request) {
  const { error } = await requireManager();
  if (error) return error;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = supabaseAdmin();
  const { error: err } = await db.from('utility_charges').delete().eq('id', id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
