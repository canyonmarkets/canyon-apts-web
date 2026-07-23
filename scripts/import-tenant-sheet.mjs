// 6F — Import the tenant Google Sheet snapshot into Supabase.
// Usage:  node scripts/import-tenant-sheet.mjs           (dry run — writes report, touches nothing)
//         node scripts/import-tenant-sheet.mjs --commit  (actually writes)
// Source: Canyon-Apts Planning/tenant-sheet-snapshot-2026-07-03.xlsx
//   • "Tenants" tab  → units + ACTIVE tenancies + tenants (current roster, source of truth)
//   • "Sheet13" tab  → 2026 weekly payments (Jan 26 – Jun 29). Red fill = late.
//     "Move in $X" (green) = move-in charges. "MOVE OUT" (orange) = tenancy ended.
//     Payments before the current tenant's move-in go to a synthetic "prior tenant"
//     moved_out tenancy on the same unit so income totals stay correct for taxes.
import ExcelJS from 'exceljs';
import fs from 'node:fs';
import path from 'node:path';

const COMMIT = process.argv.includes('--commit');
const ROOT = path.resolve(import.meta.dirname, '..');
const XLSX_PATH = 'C:/Users/jeffm/Documents/CLAUDE/CANYON-APTS/Canyon-Apts Planning/tenant-sheet-snapshot-2026-07-03.xlsx';
const REPORT_PATH = 'C:/Users/jeffm/Documents/CLAUDE/CANYON-APTS/Canyon-Apts Planning/IMPORT-RECONCILIATION.md';

// ── env ────────────────────────────────────────────────────────────────────────
const env = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
const get = k => env.match(new RegExp('^' + k + '=(.*)$', 'm'))?.[1]?.trim();
const URL_ = get('NEXT_PUBLIC_SUPABASE_URL');
const KEY = get('SUPABASE_SERVICE_ROLE_KEY');
const H = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', Prefer: 'return=representation' };

async function post(table, body) {
  const r = await fetch(`${URL_}/rest/v1/${table}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(`${table}: ${JSON.stringify(j).slice(0, 200)}`);
  return Array.isArray(j) ? j[0] : j;
}
async function getRows(q) {
  const r = await fetch(`${URL_}/rest/v1/${q}`, { headers: H });
  return r.ok ? r.json() : [];
}

// ── helpers ────────────────────────────────────────────────────────────────────
const CPLX_MAP = { HERITAGE: 'The Heritage', SOFIA: 'Sofia', OVATION: 'Ovation', OLIVE: 'Olive East', CITI: 'Citi on Camelback', GENOA: 'Genoa Lakes', RESIDENCES: 'Residences at 4225', 'SAN PAULO': 'San Paulo', ROCKLEDGE: 'Rockledge', 'THE MADDOX': 'Maddox' };
const txt = cell => {
  let v = cell.value;
  if (v == null) return '';
  if (typeof v === 'object') {
    if (v.richText) return cell.text ?? '';
    if (v.text) return String(v.text);
    if (v.result != null) return String(v.result);
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return String(cell.text ?? '');
  }
  return String(v);
};
const fillOf = cell => cell.fill?.fgColor?.argb ?? '';
const num = s => { const m = String(s).replace(/[$,]/g, '').match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
const fixYear = d => { // sheet dates sometimes parse into the future — walk back a year at a time
  if (!d) return null;
  let out = d;
  while (out > '2026-07-04') { out = (Number(out.slice(0, 4)) - 1) + out.slice(4); }
  return out;
};

const anomalies = [];
const report = [];

// ── 1. Parse roster (Tenants tab) ─────────────────────────────────────────────
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(XLSX_PATH);
const T = wb.getWorksheet('Tenants');
const roster = []; // { complex, unit, bed, bath, rate, moveIn, deposit, kids, pets, notes, people: [{name, phone, email}] }
let curComplex = null, curEntry = null;

for (let r = 2; r <= T.rowCount; r++) {
  const row = T.getRow(r);
  const c1 = txt(row.getCell(1)).trim();
  const name = txt(row.getCell(5)).trim();
  if (c1 && !name && !num(c1)) { curComplex = CPLX_MAP[c1.toUpperCase()] ?? c1; continue; } // complex header
  if (c1 && num(c1) !== null && name) { // primary tenant row
    curEntry = {
      complex: curComplex, unit: c1,
      bed: num(txt(row.getCell(2))) ?? 1, bath: num(txt(row.getCell(3))) ?? 1,
      rate: num(txt(row.getCell(4))) ?? 0,
      moveIn: fixYear(txt(row.getCell(8)) || null),
      deposit: num(txt(row.getCell(11))) ?? 500,
      kids: num(txt(row.getCell(12))),
      pets: (num(txt(row.getCell(13))) ?? 0) > 0 ? `${num(txt(row.getCell(13)))} pet(s)` : null,
      notes: txt(row.getCell(14)).trim() || null,
      people: [{ name, phone: txt(row.getCell(6)).trim() || null, email: (txt(row.getCell(7)).trim().replace(/^mailto:/, '')) || null }],
    };
    roster.push(curEntry);
  } else if (!c1 && name && curEntry) { // co-occupant row
    curEntry.people.push({ name, phone: txt(row.getCell(6)).trim() || null, email: (txt(row.getCell(7)).trim().replace(/^mailto:/, '')) || null });
  }
}
report.push(`## Roster parsed: ${roster.length} current tenancies, ${roster.reduce((s, e) => s + e.people.length, 0)} people`);

// ── 2. Parse 2026 payment grid (Sheet13) ─────────────────────────────────────
const G = wb.getWorksheet('Sheet13');
const weekCols = []; // [col, 'YYYY-MM-DD' Monday]
G.getRow(1).eachCell({ includeEmpty: false }, (cell, col) => {
  if (cell.value instanceof Date) weekCols.push([col, cell.value.toISOString().slice(0, 10)]);
});
report.push(`## Payment grid: ${weekCols.length} weeks (${weekCols[0]?.[1]} → ${weekCols.at(-1)?.[1]})`);

const gridRows = []; // { complex, unit, gridName, cells: [{week, raw, amount, late, kind}] , moveOuts: [week], moveIns: [{week, amount}] }
for (let r = 2; r <= G.rowCount; r++) {
  const row = G.getRow(r);
  const unit = txt(row.getCell(2)).trim();
  if (!unit) continue;
  const entry = { complex: txt(row.getCell(1)).trim(), unit, gridName: txt(row.getCell(3)).trim(), payments: [], moveOuts: [], moveIns: [] };
  for (const [col, week] of weekCols) {
    const cell = row.getCell(col);
    const raw = txt(cell).trim();
    if (!raw) continue;
    const fill = fillOf(cell);
    const lower = raw.toLowerCase();
    if (lower.includes('move out') || lower.includes('move-out') || lower === 'moveout') { entry.moveOuts.push(week); continue; }
    if (lower.includes('move in') || lower.includes('move-in')) {
      const amt = num(raw);
      if (amt) entry.moveIns.push({ week, amount: amt, raw });
      continue;
    }
    let amt = num(raw);
    // Emily's utility-adjustment shorthand: "-96.62 (732)" = adjustment noted, tenant paid the parenthetical.
    if (amt !== null && amt <= 0) {
      const paren = raw.match(/\(\s*\$?(\d+(?:\.\d+)?)\s*\)/);
      amt = paren ? Number(paren[1]) : null;
    }
    if (amt === null || amt <= 0) { if (raw) anomalies.push(`Unparsed cell ${entry.complex} #${unit} wk ${week}: "${raw}"`); continue; }
    entry.payments.push({ week, amount: amt, late: fill === 'FFFF0000', raw: raw !== String(amt) ? raw : null });
  }
  gridRows.push(entry);
}

// ── 3. Match grid rows → roster (by unit number) ─────────────────────────────
const totalByComplex = {};
let grand = 0, totalPayments = 0;
const plans = []; // per unit: { rosterEntry?, gridRow?, currentPayments, priorPayments, priorMoveOut }
const rosterByUnit = Object.fromEntries(roster.map(e => [e.unit, e]));

for (const g of gridRows) {
  const ro = rosterByUnit[g.unit];
  if (!ro) anomalies.push(`Grid unit ${g.complex} #${g.unit} ("${g.gridName}") has no roster entry — payments go to a prior-tenant record on a new unit`);
  const cutoff = ro?.moveIn ? shift(ro.moveIn, -7) : '1900-01-01';
  const current = [], prior = [];
  for (const p of g.payments) (p.week >= cutoff ? current : prior).push(p);
  for (const m of g.moveIns) {
    const target = m.week >= cutoff ? current : prior;
    target.push({ week: m.week, amount: m.amount, late: false, raw: m.raw, movein: true });
  }
  const sum = arr => arr.reduce((s, p) => s + p.amount, 0);
  const complexName = ro?.complex ?? g.complex;
  totalByComplex[complexName] = (totalByComplex[complexName] ?? 0) + sum(current) + sum(prior);
  grand += sum(current) + sum(prior);
  totalPayments += current.length + prior.length;
  const priorMoveOut = g.moveOuts.filter(w => w < cutoff).sort().at(-1) ?? (prior.length ? prior.map(p => p.week).sort().at(-1) : null);
  if (ro && g.gridName && !g.gridName.toLowerCase().includes(ro.people[0].name.split(' ')[0].toLowerCase()) && !ro.people.some(p => g.gridName.toLowerCase().includes(p.name.split(' ')[0].toLowerCase()))) {
    anomalies.push(`Name check ${complexName} #${g.unit}: grid says "${g.gridName}", roster says "${ro.people[0].name}" (grid may show a prior tenant — payments split by move-in date)`);
  }
  plans.push({ ro, g, current, prior, priorMoveOut, complexName });
}
for (const ro of roster) if (!gridRows.some(g => g.unit === ro.unit)) anomalies.push(`Roster unit ${ro.complex} #${ro.unit} (${ro.people[0].name}) has NO payment rows in the 2026 grid`);

function shift(dateStr, days) { const d = new Date(dateStr + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); }

// ── 4. Report ─────────────────────────────────────────────────────────────────
report.push(`\n## Money reconciliation (check these against the sheet!)`);
report.push(`- **Grand total 2026 payments: $${grand.toLocaleString()}** across ${totalPayments} recorded payments`);
for (const [cx, amt] of Object.entries(totalByComplex).sort()) report.push(`  - ${cx}: $${amt.toLocaleString()}`);
report.push(`\n## Per-tenancy detail`);
for (const p of plans) {
  const who = p.ro ? p.ro.people[0].name : `(prior only: "${p.g.gridName || 'unknown'}")`;
  const cur = p.current.reduce((s, x) => s + x.amount, 0);
  const pri = p.prior.reduce((s, x) => s + x.amount, 0);
  report.push(`- ${p.complexName} #${p.g.unit} — ${who}: ${p.current.length} payments $${cur.toLocaleString()}${pri ? ` · prior tenant: ${p.prior.length} payments $${pri.toLocaleString()}` : ''}`);
}
report.push(`\n## Anomalies to eyeball (${anomalies.length})`);
for (const a of anomalies) report.push(`- ⚠ ${a}`);

// ── 5. Write to DB (only with --commit) ───────────────────────────────────────
if (COMMIT) {
  const existingUnits = await getRows('units?select=id,unit_number,complex_name');
  let created = { units: 0, tenancies: 0, tenants: 0, payments: 0 };
  for (const p of plans.concat(roster.filter(ro => !gridRows.some(g => g.unit === ro.unit)).map(ro => ({ ro, g: null, current: [], prior: [], complexName: ro.complex })))) {
    const ro = p.ro;
    const unitNo = ro?.unit ?? p.g.unit;
    // unit (skip if already imported)
    let unit = existingUnits.find(u => u.unit_number === unitNo && (u.complex_name ?? '') === p.complexName);
    if (!unit) {
      unit = await post('units', {
        title: `${p.complexName} #${unitNo}`, area: p.complexName, city: 'phoenix',
        bedrooms: ro?.bed ?? 1, bathrooms: ro?.bath ?? 1, weekly_price: ro?.rate ?? 0,
        status: ro ? 'taken' : 'available', complex_name: p.complexName, unit_number: unitNo,
        utility_credit_monthly: (ro?.bed ?? 1) >= 2 ? 150 : 100, sort_order: 100,
      });
      created.units++;
    }
    // active tenancy from roster
    if (ro) {
      const tenancy = await post('tenancies', {
        unit_id: unit.id, weekly_rate: ro.rate, status: 'active', move_in: ro.moveIn,
        deposit_total: ro.deposit, kids: ro.kids, pets: ro.pets, notes: ro.notes ?? 'Imported from spreadsheet 2026-07-04',
      });
      created.tenancies++;
      for (let i = 0; i < ro.people.length; i++) {
        await post('tenants', { tenancy_id: tenancy.id, is_primary: i === 0, name: ro.people[i].name, phone: ro.people[i].phone, email: ro.people[i].email });
        created.tenants++;
      }
      for (const pay of p.current) {
        await post('tenant_payments', {
          tenancy_id: tenancy.id, type: pay.movein ? 'other' : 'rent', amount: pay.amount,
          week_due: pay.movein ? null : pay.week, late: pay.late,
          paid_at: pay.week + 'T19:00:00Z',
          note: pay.movein ? `Move-in charges (imported: ${pay.raw})` : (pay.raw ? `Imported: ${pay.raw}` : 'Imported from sheet'),
        });
        created.payments++;
      }
    }
    // prior-tenant tenancy for orphan payments
    if (p.prior?.length) {
      const priorT = await post('tenancies', {
        unit_id: unit.id, weekly_rate: 0, status: 'moved_out',
        move_out: p.priorMoveOut, deposit_total: 500, deposit_status: 'kept',
        notes: `Prior tenant(s) — imported 2026 payments made before the current tenant's move-in. Grid name: "${p.g?.gridName ?? ''}"`,
      });
      created.tenancies++;
      await post('tenants', { tenancy_id: priorT.id, is_primary: true, name: p.g?.gridName && p.ro && p.g.gridName !== p.ro.people[0].name ? p.g.gridName + ' (prior)' : `Prior tenant — ${p.complexName} #${unitNo}`, phone: null, email: null });
      created.tenants++;
      for (const pay of p.prior) {
        await post('tenant_payments', {
          tenancy_id: priorT.id, type: pay.movein ? 'other' : 'rent', amount: pay.amount,
          week_due: pay.movein ? null : pay.week, late: pay.late, paid_at: pay.week + 'T19:00:00Z',
          note: pay.raw ? `Imported: ${pay.raw}` : 'Imported from sheet (prior tenant)',
        });
        created.payments++;
      }
    }
  }
  report.unshift(`# IMPORT COMMITTED ${new Date().toISOString().slice(0, 10)}\nCreated: ${created.units} units · ${created.tenancies} tenancies · ${created.tenants} people · ${created.payments} payments\n`);
} else {
  report.unshift(`# DRY RUN (nothing written) — re-run with --commit to import\n`);
}

fs.writeFileSync(REPORT_PATH, report.join('\n'));
console.log(report.slice(0, 30).join('\n'));
console.log(`\n… full report → ${REPORT_PATH}`);
