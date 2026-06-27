import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') ?? '';
    const bedrooms = parseInt(searchParams.get('bedrooms') ?? '0', 10);

    const db = supabaseAdmin();
    const { data: units } = await db
      .from('units')
      .select('city, bedrooms, status, available_date')
      .neq('status', 'taken');

    const cityUnits = (units ?? []).filter(u => u.city === city);
    const cityHasUnits = cityUnits.length > 0;
    const bedroomsHasUnits = cityUnits.some(u => u.bedrooms === bedrooms);

    return NextResponse.json({ cityHasUnits, bedroomsHasUnits });
  } catch (err) {
    console.error('inventory-check error', err);
    return NextResponse.json({ cityHasUnits: true, bedroomsHasUnits: true }, { status: 200 });
  }
}
