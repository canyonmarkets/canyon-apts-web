import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET: full roster — tenancies with their people and unit.
export async function GET() {
  const { error } = await requireManager();
  if (error) return error;

  const db = supabaseAdmin();
  const { data, error: err } = await db
    .from('tenancies')
    .select('*, tenants(*), units(id, title, complex_name, unit_number, city, bedrooms)')
    .order('created_at', { ascending: false });

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ tenancies: data ?? [] });
}

// POST: create a tenancy + primary tenant (+ optional co-occupants).
// Body: { unit_id, weekly_rate, move_in, deposit_total, kids, pets, notes,
//         primary: { name, phone, email, lead_id? }, occupants?: [{name, phone, email}] }
export async function POST(req: Request) {
  const { error, userId } = await requireManager();
  if (error) return error;

  const body = await req.json();
  const { unit_id, weekly_rate, move_in, deposit_total, kids, pets, notes, primary, occupants } = body;

  if (!primary?.name?.trim()) {
    return NextResponse.json({ error: 'Primary tenant name is required' }, { status: 400 });
  }

  const db = supabaseAdmin();

  const { data: tenancy, error: tErr } = await db
    .from('tenancies')
    .insert({
      unit_id: unit_id ?? null,
      weekly_rate: weekly_rate ? Number(weekly_rate) : 0,
      move_in: move_in || null,
      deposit_total: deposit_total != null && deposit_total !== '' ? Number(deposit_total) : 500,
      kids: kids != null && kids !== '' ? Number(kids) : null,
      pets: pets?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select().single();

  if (tErr || !tenancy) return NextResponse.json({ error: tErr?.message ?? 'Failed to create tenancy' }, { status: 500 });

  const people = [
    { tenancy_id: tenancy.id, is_primary: true, name: primary.name.trim(), phone: primary.phone?.trim() || null, email: primary.email?.trim() || null, lead_id: primary.lead_id ?? null },
    ...((occupants ?? []) as { name?: string; phone?: string; email?: string }[])
      .filter(o => o.name?.trim())
      .map(o => ({ tenancy_id: tenancy.id, is_primary: false, name: o.name!.trim(), phone: o.phone?.trim() || null, email: o.email?.trim() || null, lead_id: null })),
  ];

  const { error: pErr } = await db.from('tenants').insert(people);
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  // Voiding the double-work: if this unit was marketed, flip it to taken.
  if (unit_id) {
    await db.from('units').update({ status: 'taken' }).eq('id', unit_id);
  }

  return NextResponse.json({ tenancy_id: tenancy.id, recorded_by: userId });
}
