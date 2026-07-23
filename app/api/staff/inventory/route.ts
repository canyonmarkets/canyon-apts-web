import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  const db = supabaseAdmin();
  const { data } = await db
    .from('units')
    .select('*, unit_photos(id, storage_path, sort_order)')
    .order('sort_order')
    .order('sort_order', { referencedTable: 'unit_photos' });

  return NextResponse.json({ units: data ?? [] });
}

export async function POST(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const body = await req.json();
  const db = supabaseAdmin();
  const { data, error: err } = await db.from('units').insert({
    title: body.title?.trim() ?? '',
    area: body.area?.trim() ?? '',
    city: body.city ?? 'phoenix',
    bedrooms: Number(body.bedrooms) || 1,
    bathrooms: Number(body.bathrooms) || 1,
    weekly_price: Number(body.weekly_price) || 495,
    amenities: body.amenities ?? [],
    special: body.special?.trim() || null,
    status: body.status ?? 'available',
    available_date: body.available_date || null,
    sort_order: body.sort_order ?? 0,
    notes: body.notes?.trim() || null,
  }).select().single();

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ unit: data });
}
