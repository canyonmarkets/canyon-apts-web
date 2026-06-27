import { NextResponse } from 'next/server';
import { getOpenSlots } from '@/lib/availability';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });
    const in14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' });

    const from = searchParams.get('from') ?? today;
    const to = searchParams.get('to') ?? in14;

    const slots = await getOpenSlots(from, to);
    return NextResponse.json({ slots });
  } catch (err) {
    console.error('availability error', err);
    return NextResponse.json({ error: 'Failed to load slots' }, { status: 500 });
  }
}
