import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/staff-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET ?year=2026 — the full payment ledger for one year as a CSV download.
// Built for tax season: one row per payment, Excel-friendly.

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const TYPE_LABELS: Record<string, string> = {
  rent: 'Weekly rent', late_fee: 'Late fee', deposit: 'Deposit',
  application_fee: 'Application fee', prorate: 'Prorated days', buffer_day: 'Buffer day',
  utility_overage: 'Utility overage', other: 'Other',
};

export async function GET(req: Request) {
  const { error } = await requireManager();
  if (error) return error;

  const url = new URL(req.url);
  const year = Number(url.searchParams.get('year')) || new Date().getFullYear();

  const db = supabaseAdmin();
  const [paymentsRes, tenanciesRes] = await Promise.all([
    db.from('tenant_payments')
      .select('tenancy_id, type, amount, method, week_due, paid_at, late, note')
      .gte('paid_at', `${year}-01-01`).lt('paid_at', `${year + 1}-01-01`)
      .order('paid_at', { ascending: true })
      .limit(20000),
    db.from('tenancies')
      .select('id, status, deposit_status, units(title, city), tenants(is_primary, name)'),
  ]);
  if (paymentsRes.error) return NextResponse.json({ error: paymentsRes.error.message }, { status: 500 });

  interface TenancyRow { id: string; status: string; deposit_status: string; units: { title: string; city: string } | null; tenants: { is_primary: boolean; name: string }[]; }
  const tenancies = new Map<string, TenancyRow>(
    ((tenanciesRes.data ?? []) as unknown as TenancyRow[]).map(t => [t.id, t])
  );

  const header = ['Date paid', 'Tenant', 'Unit', 'City', 'Type', 'Amount', 'Method', 'For week of', 'Late', 'Note', 'Tenancy status', 'Deposit status'];
  const lines = [header.join(',')];
  let total = 0;
  for (const p of paymentsRes.data ?? []) {
    const t = tenancies.get(p.tenancy_id);
    const name = t?.tenants?.find(x => x.is_primary)?.name ?? t?.tenants?.[0]?.name ?? '';
    total += Number(p.amount);
    lines.push([
      csvCell(new Date(p.paid_at).toLocaleDateString('en-US', { timeZone: 'America/Phoenix' })),
      csvCell(name),
      csvCell(t?.units?.title ?? ''),
      csvCell(t?.units?.city ?? ''),
      csvCell(TYPE_LABELS[p.type] ?? p.type),
      csvCell(Number(p.amount).toFixed(2)),
      csvCell(p.method ?? ''),
      csvCell(p.week_due ?? ''),
      csvCell(p.late ? 'LATE' : ''),
      csvCell(p.note ?? ''),
      csvCell(t?.status ?? ''),
      csvCell(t?.deposit_status ?? ''),
    ].join(','));
  }
  lines.push('');
  lines.push(`TOTAL COLLECTED ${year},,,,,${total.toFixed(2)}`);

  // BOM so Excel opens it as UTF-8
  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="canyon-apts-payments-${year}.csv"`,
    },
  });
}
