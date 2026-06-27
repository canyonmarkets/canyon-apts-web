import { supabaseAdmin } from '@/lib/supabase/admin';

const AZ_OFFSET = '-07:00'; // Arizona — no DST, always UTC-7

export type Slot = { startISO: string; endISO: string; label: string };

/** Open slots for [fromDate, toDate] inclusive (YYYY-MM-DD, Phoenix local days). */
export async function getOpenSlots(fromDate: string, toDate: string): Promise<Slot[]> {
  const db = supabaseAdmin();
  const [{ data: rules }, { data: blocks }, { data: booked }] = await Promise.all([
    db.from('availability_rules').select('*').eq('active', true),
    db.from('availability_blocks').select('*'),
    db.from('bookings').select('slot_start').neq('status', 'canceled'),
  ]);

  const bookedSet = new Set((booked ?? []).map(b => new Date(b.slot_start).toISOString()));
  const blockRanges = (blocks ?? []).map(
    b => [new Date(b.start_at).getTime(), new Date(b.end_at).getTime()] as const,
  );
  const minLeadMs = 2 * 60 * 60 * 1000; // no slots within next 2 hours
  const now = Date.now();
  const out: Slot[] = [];

  const from = new Date(fromDate + 'T00:00:00' + AZ_OFFSET);
  const to = new Date(toDate + 'T00:00:00' + AZ_OFFSET);

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const ymd = d.toLocaleDateString('en-CA', { timeZone: 'America/Phoenix' }); // YYYY-MM-DD
    const dow = new Date(ymd + 'T12:00:00' + AZ_OFFSET).getDay();

    for (const r of (rules ?? []).filter(rule => rule.day_of_week === dow)) {
      const [ehRaw, emRaw] = r.end_time.split(':').map(Number);
      let sh = Number(r.start_time.split(':')[0]);
      let sm = Number(r.start_time.split(':')[1]);
      const step = r.slot_minutes + r.buffer_minutes;

      while (sh * 60 + sm + r.slot_minutes <= ehRaw * 60 + emRaw) {
        const hh = String(sh).padStart(2, '0');
        const mm = String(sm).padStart(2, '0');
        const start = new Date(`${ymd}T${hh}:${mm}:00${AZ_OFFSET}`);
        const end = new Date(start.getTime() + r.slot_minutes * 60000);
        const t = start.getTime();
        const blocked = blockRanges.some(([a, b]) => t < b && end.getTime() > a);

        if (t - now >= minLeadMs && !bookedSet.has(start.toISOString()) && !blocked) {
          out.push({
            startISO: start.toISOString(),
            endISO: end.toISOString(),
            label: start.toLocaleString('en-US', {
              timeZone: 'America/Phoenix',
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
          });
        }

        sm += step;
        sh += Math.floor(sm / 60);
        sm %= 60;
      }
    }
  }

  return out.sort((a, b) => a.startISO.localeCompare(b.startISO));
}
