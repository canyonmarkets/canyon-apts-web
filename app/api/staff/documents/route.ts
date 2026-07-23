import { NextRequest, NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET ?q= — list documents, newest first, filtered by tenant or file name.
export async function GET(req: NextRequest) {
  const { error } = await requireManager();
  if (error) return error;

  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const db = supabaseAdmin();
  let query = db.from('documents').select('*').order('created_at', { ascending: false }).limit(200);
  if (q.length >= 2) {
    const like = `%${q.replace(/[%_]/g, '')}%`;
    query = query.or(`tenant_name.ilike.${like},name.ilike.${like}`);
  }
  const { data, error: err } = await query;
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] });
}

// POST multipart/form-data: file + optional tenancy_id + tenant_name.
export async function POST(req: NextRequest) {
  const { error, userId } = await requireManager();
  if (error) return error;

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({ error: 'File too large (25 MB max)' }, { status: 400 });

  const tenancyId = (form.get('tenancy_id') as string) || null;
  const tenantName = (form.get('tenant_name') as string) || null;

  const safeName = file.name.replace(/[^\w.\- ]+/g, '_');
  const path = `${tenancyId ?? 'general'}/${Date.now()}_${safeName}`;

  const db = supabaseAdmin();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await db.storage.from('documents').upload(path, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data, error: insErr } = await db.from('documents')
    .insert({ tenancy_id: tenancyId, tenant_name: tenantName, name: file.name, storage_path: path, mime: file.type || null, uploaded_by: userId })
    .select().single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
  return NextResponse.json({ document: data });
}

// PATCH { id, action: 'sign' } — mint a short-lived private link for viewing.
export async function PATCH(req: Request) {
  const { error } = await requireManager();
  if (error) return error;

  const { id, action } = await req.json();
  if (action !== 'sign' || !id) return NextResponse.json({ error: 'id and action=sign required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: doc } = await db.from('documents').select('storage_path').eq('id', id).single();
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data, error: err } = await db.storage.from('documents').createSignedUrl(doc.storage_path, 300);
  if (err || !data) return NextResponse.json({ error: err?.message ?? 'sign failed' }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}

// DELETE { id }
export async function DELETE(req: Request) {
  const { error } = await requireManager();
  if (error) return error;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: doc } = await db.from('documents').select('storage_path').eq('id', id).single();
  if (doc) await db.storage.from('documents').remove([doc.storage_path]);
  const { error: err } = await db.from('documents').delete().eq('id', id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
