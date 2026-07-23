import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireManager();
  if (error) return error;
  const { id } = await params;
  const db = supabaseAdmin();

  const [tenancyRes, paymentsRes, utilityRes, eventsRes, messagesRes, docsRes] = await Promise.all([
    db.from('tenancies').select('*, tenants(*), units(id, title, complex_name, unit_number, city, bedrooms, entry_type, keypad_code, utility_credit_monthly, street_address)').eq('id', id).single(),
    db.from('tenant_payments').select('*').eq('tenancy_id', id).order('paid_at', { ascending: false }).limit(200),
    db.from('utility_charges').select('*').eq('tenancy_id', id).order('month', { ascending: false }).limit(24),
    db.from('tenancy_events').select('*').eq('tenancy_id', id).order('created_at', { ascending: false }).limit(200),
    db.from('message_log').select('id, type, recipient, sent_at, meta').contains('meta', { tenancy_id: id }).order('sent_at', { ascending: false }).limit(200),
    db.from('documents').select('*').eq('tenancy_id', id).order('created_at', { ascending: false }),
  ]);

  if (tenancyRes.error) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    tenancy: tenancyRes.data,
    payments: paymentsRes.data ?? [],
    utility_charges: utilityRes.data ?? [],
    events: eventsRes.data ?? [],
    messages: messagesRes.data ?? [],
    documents: docsRes.data ?? [],
  });
}

// PATCH: update tenancy fields (rate, deposit, notes, move-out lifecycle, unit).
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireManager();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const db = supabaseAdmin();

  const allowed = ['unit_id', 'weekly_rate', 'status', 'move_in', 'move_out', 'notice_given_at',
    'deposit_total', 'deposit_status', 'deposit_returned_amount', 'kids', 'pets', 'notes'];
  const update: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) update[key] = body[key];

  const { data, error: err } = await db.from('tenancies').update(update).eq('id', id).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });

  // Moving out frees the unit on the marketing side.
  if (body.status === 'moved_out' && data.unit_id) {
    await db.from('units').update({ status: 'available' }).eq('id', data.unit_id);
  }

  return NextResponse.json({ tenancy: data });
}

// POST: add a co-occupant.  Body: { name, phone, email }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireManager();
  if (error) return error;
  const { id } = await params;
  const { name, phone, email } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data, error: err } = await db
    .from('tenants')
    .insert({ tenancy_id: id, is_primary: false, name: name.trim(), phone: phone?.trim() || null, email: email?.trim() || null })
    .select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ tenant: data });
}

// DELETE: remove a co-occupant.  Body: { tenant_id }
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireManager();
  if (error) return error;
  const { id } = await params;
  const { tenant_id } = await req.json();
  if (!tenant_id) return NextResponse.json({ error: 'tenant_id required' }, { status: 400 });

  const db = supabaseAdmin();
  const { error: err } = await db.from('tenants').delete().eq('id', tenant_id).eq('tenancy_id', id).eq('is_primary', false);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
