import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireStaff();
  if (error) return error;
  const { id } = await params;
  const db = supabaseAdmin();

  const { data, error: err } = await db
    .from('units')
    .select('*, unit_photos(id, storage_path, sort_order)')
    .eq('id', id)
    .order('sort_order', { referencedTable: 'unit_photos' })
    .single();

  if (err) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ unit: data });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireStaff();
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const db = supabaseAdmin();

  const allowed = ['title','area','city','bedrooms','bathrooms','weekly_price','amenities','special','status','available_date','sort_order','notes',
    'complex_name','unit_number','utility_credit_monthly','entry_type','keypad_code','mgmt_notes','street_address'];
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key] === '' ? null : body[key];
  }

  const { data, error: err } = await db.from('units').update(update).eq('id', id).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ unit: data });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireStaff();
  if (error) return error;
  const { id } = await params;
  const db = supabaseAdmin();
  await db.from('units').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
