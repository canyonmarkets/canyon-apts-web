import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, desired_city, bedrooms, reason, lead_source } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }

    const db = supabaseAdmin();

    // Upsert lead by email if provided, otherwise insert
    let leadId: string;
    if (email?.trim()) {
      const { data: existing } = await db
        .from('leads')
        .select('id')
        .eq('email', email.trim())
        .maybeSingle();

      if (existing) {
        leadId = existing.id;
      } else {
        const { data: lead, error } = await db
          .from('leads')
          .insert({ name: name.trim(), phone: phone.trim(), email: email.trim(), lead_source: lead_source ?? 'other' })
          .select()
          .single();
        if (error || !lead) return NextResponse.json({ error: 'Failed to save.' }, { status: 500 });
        leadId = lead.id;
      }
    } else {
      const { data: lead, error } = await db
        .from('leads')
        .insert({ name: name.trim(), phone: phone.trim(), email: email?.trim() ?? '', lead_source: lead_source ?? 'other' })
        .select()
        .single();
      if (error || !lead) return NextResponse.json({ error: 'Failed to save.' }, { status: 500 });
      leadId = lead.id;
    }

    await db.from('waitlist').insert({
      lead_id: leadId,
      desired_city: desired_city ?? null,
      bedrooms: bedrooms ? Number(bedrooms) : null,
      reason: reason ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('waitlist error', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
