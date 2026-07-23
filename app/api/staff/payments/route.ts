import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

const TYPES = ['rent', 'late_fee', 'deposit', 'application_fee', 'prorate', 'buffer_day', 'utility_overage', 'other'];
const METHODS = ['zelle', 'venmo', 'cash', 'cashapp', 'other'];

// POST: record one payment or a batch (move-in charges).
// Body: { tenancy_id, items: [{ type, amount, method, week_due?, late?, note? }] }
export async function POST(req: Request) {
  const { error, userId } = await requireManager();
  if (error) return error;

  const { tenancy_id, items } = await req.json();
  if (!tenancy_id || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'tenancy_id and at least one item required' }, { status: 400 });
  }

  const rows = [];
  for (const it of items) {
    if (!TYPES.includes(it.type)) return NextResponse.json({ error: `Bad type: ${it.type}` }, { status: 400 });
    const amount = Number(it.amount);
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ error: 'Each item needs a positive amount' }, { status: 400 });
    rows.push({
      tenancy_id,
      type: it.type,
      amount,
      method: METHODS.includes(it.method) ? it.method : null,
      week_due: it.week_due || null,
      late: it.late === true,
      note: it.note?.trim() || null,
      recorded_by: userId,
    });
  }

  const db = supabaseAdmin();
  const { data, error: err } = await db.from('tenant_payments').insert(rows).select();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ payments: data });
}

// DELETE: undo a mistaken entry.  Body: { id }
export async function DELETE(req: Request) {
  const { error } = await requireManager();
  if (error) return error;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const db = supabaseAdmin();
  const { error: err } = await db.from('tenant_payments').delete().eq('id', id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
