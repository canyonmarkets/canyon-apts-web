import { NextRequest, NextResponse } from 'next/server';
import { requireStaff } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { waitlistBlastHTML } from '@/lib/email/templates';
import { CITIES } from '@/lib/cities';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/unit-photos/${path}`;
}

export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;

  const { unit_id, note } = await req.json();
  if (!unit_id) return NextResponse.json({ error: 'unit_id required' }, { status: 400 });
  const personalNote = typeof note === 'string' && note.trim() ? note.trim() : undefined;

  const sb = supabaseAdmin();

  const { data: unit } = await sb
    .from('units')
    .select('*, unit_photos(*)')
    .eq('id', unit_id)
    .single();

  if (!unit) return NextResponse.json({ error: 'Unit not found' }, { status: 404 });

  // Find waitlist entries matching city + bedrooms that haven't been notified yet
  const { data: entries } = await sb
    .from('waitlist')
    .select('*, leads(name, email)')
    .eq('reason', 'city_unavailable')
    .is('notified_at', null);

  const cityLabel = CITIES.find(c => c.slug === unit.city)?.name ?? unit.city;
  const photos = (unit.unit_photos ?? [])
    .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    .map((p: { storage_path: string }) => photoUrl(p.storage_path));

  // Also get beds-unavailable matches
  const { data: bedEntries } = await sb
    .from('waitlist')
    .select('*, leads(name, email)')
    .eq('reason', 'beds_unavailable')
    .is('notified_at', null);

  const allEntries = [
    ...(entries ?? []).filter((e: { leads: { desired_city?: string } }) => e.leads?.desired_city === unit.city),
    ...(bedEntries ?? []).filter((e: { leads: { bedrooms?: number; desired_city?: string } }) =>
      e.leads?.bedrooms === unit.bedrooms && e.leads?.desired_city === unit.city
    ),
  ];

  // Deduplicate by lead_id
  const seen = new Set<string>();
  const unique = allEntries.filter(e => {
    if (seen.has(e.lead_id)) return false;
    seen.add(e.lead_id);
    return true;
  });

  let sent = 0;
  const now = new Date().toISOString();

  for (const entry of unique) {
    const lead = entry.leads as { name: string; email: string };
    if (!lead?.email) continue;

    const { ok } = await sendEmail({
      to: lead.email,
      subject: `A ${unit.bedrooms}BR in ${cityLabel} just opened up — Canyon Apartments`,
      html: waitlistBlastHTML(lead, {
        bedrooms: unit.bedrooms,
        city: cityLabel,
        title: unit.title,
        weekly_price: unit.weekly_price,
        photoUrls: photos,
      }, personalNote),
    });

    if (ok) {
      await Promise.all([
        sb.from('waitlist').update({ notified_at: now }).eq('id', entry.id),
        sb.from('message_log').insert({
          lead_id: entry.lead_id, type: 'waitlist_blast', recipient: lead.email,
          meta: { unit_id, city: unit.city, bedrooms: unit.bedrooms },
        }),
      ]);
      sent++;
    }
  }

  return NextResponse.json({ sent, total: unique.length });
}
