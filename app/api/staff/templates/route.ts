import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { error } = await requireManager();
  if (error) return error;
  const db = supabaseAdmin();
  const { data, error: err } = await db.from('email_templates').select('*').order('name');
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ templates: data ?? [] });
}

// PATCH: update an existing template's wording.  Body: { key, name?, subject, body }
export async function PATCH(req: Request) {
  const { error } = await requireManager();
  if (error) return error;
  const { key, name, subject, body } = await req.json();
  if (!key || !subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'key, subject, and body required' }, { status: 400 });
  }
  const db = supabaseAdmin();
  const update: Record<string, unknown> = { subject: subject.trim(), body: body.trim(), updated_at: new Date().toISOString() };
  if (name?.trim()) update.name = name.trim();
  const { data, error: err } = await db.from('email_templates').update(update).eq('key', key).select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ template: data });
}

// POST: create a brand-new template.  Body: { name, subject, body }
export async function POST(req: Request) {
  const { error } = await requireManager();
  if (error) return error;
  const { name, subject, body } = await req.json();
  if (!name?.trim() || !subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'name, subject, and body required' }, { status: 400 });
  }
  const key = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40) || 'custom';
  const db = supabaseAdmin();
  const { data, error: err } = await db.from('email_templates')
    .insert({ key: key + '_' + Date.now().toString(36), name: name.trim(), subject: subject.trim(), body: body.trim() })
    .select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ template: data });
}
