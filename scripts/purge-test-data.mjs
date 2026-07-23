// Purge all "TEST —" data (and Jeff's July-3 booking test) before go-live.
// Leaves the imported real roster/payments completely untouched.
// Usage: node scripts/purge-test-data.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const env = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
const get = k => env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1]?.trim();
const URL_ = get('NEXT_PUBLIC_SUPABASE_URL');
const KEY = get('SUPABASE_SERVICE_ROLE_KEY');
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };

async function del(q, label) {
  const r = await fetch(`${URL_}/rest/v1/${q}`, { method: 'DELETE', headers: { ...H, Prefer: 'return=representation' } });
  const j = r.ok ? await r.json() : [];
  console.log(`${label}: ${r.ok ? (Array.isArray(j) ? j.length : '?') + ' deleted' : 'FAIL ' + r.status}`);
  return j;
}
async function rows(q) { const r = await fetch(`${URL_}/rest/v1/${q}`, { headers: H }); return r.ok ? r.json() : []; }

// 1. TEST tenancies (Carmen, Doug, any Maria tenancy) — cascades tenants/payments/events/utility/docs
const testTenants = await rows(`tenants?select=tenancy_id&name=ilike.TEST%20—*`);
const tids = [...new Set(testTenants.map(t => t.tenancy_id))];
if (tids.length) await del(`tenancies?id=in.(${tids.join(',')})`, `TEST tenancies (${tids.length})`);
else console.log('TEST tenancies: none found');

// 2. TEST leads — cascades bookings + waitlist + notes/follow-ups
await del(`leads?name=ilike.TEST%20—*`, 'TEST leads (+ their bookings/waitlist)');

// 3. Jeff's July-3 booking test (name "Jeff", created during testing)
await del(`leads?name=eq.Jeff&created_at=gte.2026-07-03`, "Jeff's test booking lead");

// 4. Test unit(s)
await del(`units?title=ilike.*test*`, 'Test units');

// 5. Verify what remains
const [units, tenancies, leads, payments] = await Promise.all([
  rows('units?select=id'), rows('tenancies?select=id&status=eq.active'), rows('leads?select=id'), rows('tenant_payments?select=id'),
]);
console.log(`\nRemaining: ${units.length} units · ${tenancies.length} active tenancies · ${leads.length} leads · ${payments.length} payments`);
