import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireStaff();
  if (error) return error;
  const { id: unitId } = await params;

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const db = supabaseAdmin();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${unitId}/${Date.now()}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadErr } = await db.storage
    .from('unit-photos')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: existing } = await db.from('unit_photos').select('sort_order').eq('unit_id', unitId).order('sort_order', { ascending: false }).limit(1);
  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error: dbErr } = await db.from('unit_photos').insert({
    unit_id: unitId, storage_path: path, sort_order: nextOrder,
  }).select().single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ photo: data });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireStaff();
  if (error) return error;
  const { id: unitId } = await params;

  const { searchParams } = new URL(req.url);
  const photoId = searchParams.get('photoId');
  if (!photoId) return NextResponse.json({ error: 'photoId required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: photo } = await db.from('unit_photos').select('storage_path').eq('id', photoId).single();
  if (photo) await db.storage.from('unit-photos').remove([photo.storage_path]);
  await db.from('unit_photos').delete().eq('id', photoId).eq('unit_id', unitId);
  return NextResponse.json({ ok: true });
}
