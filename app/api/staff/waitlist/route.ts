import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const { error } = await requireStaff();
  if (error) return error;

  const db = supabaseAdmin();
  const { data } = await db
    .from('waitlist')
    .select('*, leads(name, phone, email, desired_city, bedrooms)')
    .order('created_at', { ascending: false });

  return NextResponse.json({ waitlist: data ?? [] });
}

// Staff-side add: either attach an EXISTING lead (lead_id) or create a new one
// (name/phone/email) — for people who call in or message on Facebook, or whose
// form answers were wrong and need re-bucketing.
export async function POST(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const body = await req.json();
  const { lead_id, name, phone, email, desired_city, bedrooms, reason } = body;

  const validReasons = ['city_unavailable', 'beds_unavailable', 'date_too_far'];
  if (!validReasons.includes(reason)) {
    return NextResponse.json({ error: 'Valid reason required' }, { status: 400 });
  }

  const db = supabaseAdmin();
  let leadId = lead_id as string | undefined;

  if (!leadId) {
    if (!name?.trim() || !phone?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name, phone, and email are required' }, { status: 400 });
    }
    const { data: lead, error: leadErr } = await db
      .from('leads')
      .insert({
        name: name.trim(), phone: phone.trim(), email: email.trim(),
        desired_city: desired_city ?? null,
        bedrooms: bedrooms ? Number(bedrooms) : null,
        lead_source: 'other', heard_about: 'added by staff',
        screening_answers: {},
      })
      .select().single();
    if (leadErr || !lead) return NextResponse.json({ error: leadErr?.message ?? 'Failed to create lead' }, { status: 500 });
    leadId = lead.id;
  }

  const { data: entry, error: wlErr } = await db
    .from('waitlist')
    .insert({
      lead_id: leadId,
      desired_city: desired_city ?? null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      reason,
    })
    .select().single();
  if (wlErr) return NextResponse.json({ error: wlErr.message }, { status: 500 });
  return NextResponse.json({ entry });
}

export async function DELETE(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const db = supabaseAdmin();
  const { error: err } = await db.from('waitlist').delete().eq('id', id);
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const { error } = await requireStaff();
  if (error) return error;

  const { id } = await req.json();
  const db = supabaseAdmin();
  const { data, error: err } = await db
    .from('waitlist')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', id)
    .select().single();
  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ entry: data });
}
