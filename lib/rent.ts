// Week math for the rent cycle. All rent weeks are keyed by their Monday
// (Phoenix time). Due Monday 10:00 AM; late window until 5:00 PM; buffer
// night covers Monday; checkout Tuesday 10:00 AM.

// Phoenix = UTC-7 year-round (no DST).
const PHX_OFFSET_MS = 7 * 60 * 60 * 1000;

function phxNow(): Date {
  return new Date(Date.now() - PHX_OFFSET_MS);
}

/** YYYY-MM-DD of the Monday of the week containing the given Phoenix date. */
export function mondayOf(d: Date): string {
  const day = d.getUTCDay(); // using UTC accessors on an offset-shifted date
  const diff = day === 0 ? -6 : 1 - day; // Sunday belongs to the previous Monday
  const m = new Date(d);
  m.setUTCDate(d.getUTCDate() + diff);
  return m.toISOString().slice(0, 10);
}

/** This week's Monday (Phoenix time), YYYY-MM-DD. */
export function currentMonday(): string {
  return mondayOf(phxNow());
}

/** Monday N weeks away from the given Monday. */
export function shiftMonday(monday: string, weeks: number): string {
  const d = new Date(monday + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + weeks * 7);
  return d.toISOString().slice(0, 10);
}

/** First Monday strictly after the given date — the first full rent week after move-in. */
export function nextMondayAfter(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = d.getUTCDay();
  const add = day === 1 ? 7 : ((8 - day) % 7 || 7);
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

export function fmtWeek(monday: string): string {
  return new Date(monday + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fmtWeekLong(monday: string): string {
  return new Date(monday + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/** Phase of the current Monday cycle, Phoenix time.
 *  before_due   Mon before 10 AM
 *  late_window  Mon 10 AM–5 PM ($50 fee applies)
 *  buffer_night Mon 5 PM → Tue 10 AM (prepaid night; out Tue 10 AM if unpaid)
 *  past_due     Tue 10 AM onward in the same week
 */
export function weekPhase(monday: string): 'future' | 'before_due' | 'late_window' | 'buffer_night' | 'past_due' | 'past' {
  const now = phxNow();
  const nowMonday = mondayOf(now);
  if (monday > nowMonday) return 'future';
  if (monday < nowMonday) return 'past';
  const dow = now.getUTCDay();
  const hour = now.getUTCHours();
  if (dow === 1) {
    if (hour < 10) return 'before_due';
    if (hour < 17) return 'late_window';
    return 'buffer_night';
  }
  if (dow === 2 && hour < 10) return 'buffer_night';
  return 'past_due';
}
