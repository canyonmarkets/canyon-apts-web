import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { recapHTML } from '@/lib/email/templates';
import { CITIES } from '@/lib/cities';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/unit-photos/${path}`;
}

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;

  const { booking_id, unit_id, note } = await req.json();
  if (!booking_id || !unit_id) {
    return NextResponse.json({ error: 'booking_id and unit_id required' }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const [{ data: booking }, { data: unit }] = await Promise.all([
    sb.from('bookings').select('*, leads(name, email)').eq('id', booking_id).single(),
    sb.from('units').select('*, unit_photos(*)').eq('id', unit_id).single(),
  ]);

  if (!booking || !unit) {
    return NextResponse.json({ error: 'Booking or unit not found' }, { status: 404 });
  }

  const lead = booking.leads as { name: string; email: string };
  if (!lead?.email) {
    return NextResponse.json({ error: 'No email on lead' }, { status: 400 });
  }

  const photos = (unit.unit_photos ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
  const cityLabel = CITIES.find(c => c.slug === unit.city)?.name ?? unit.city;

  const recapUnit = {
    title: unit.title,
    area: unit.area,
    city: cityLabel,
    bedrooms: unit.bedrooms,
    bathrooms: unit.bathrooms,
    weekly_price: unit.weekly_price,
    amenities: unit.amenities ?? [],
    special: unit.special,
    complex_name: unit.complex_name ?? null,
    photoUrls: photos.map((p: { storage_path: string }) => photoUrl(p.storage_path)),
  };

  const { ok } = await sendEmail({
    to: lead.email,
    subject: `The photos from our call — Canyon Apartments`,
    html: recapHTML(lead, recapUnit, typeof note === 'string' && note.trim() ? note.trim() : undefined),
  });

  const now = new Date().toISOString();
  await Promise.all([
    sb.from('bookings').update({
      recap_sent: true,
      recap_sent_at: now,
      recap_unit_id: unit_id,
      pipeline_stage: 'photos_sent',
    }).eq('id', booking_id),
    sb.from('message_log').insert({
      booking_id, lead_id: booking.lead_id, type: 'recap', recipient: lead.email,
      meta: { unit_id, email_sent: ok },
    }),
  ]);

  return NextResponse.json({ ok });
}
