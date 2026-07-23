-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 6A — Tenant Back Office schema (Emily's side)
-- Written 2026-07-03. Idempotent — safe to run more than once.
-- Spec: Canyon-Apts Planning/PHASE-6-BACKOFFICE.md
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Units become the master registry of every physical apartment ─────────────
ALTER TABLE units
  ADD COLUMN IF NOT EXISTS unit_number            text,
  ADD COLUMN IF NOT EXISTS utility_credit_monthly int,
  ADD COLUMN IF NOT EXISTS entry_type             text CHECK (entry_type IN ('keypad','key') OR entry_type IS NULL),
  ADD COLUMN IF NOT EXISTS keypad_code            text,   -- STAFF ONLY: never select on public pages
  ADD COLUMN IF NOT EXISTS mgmt_notes             text;

-- ── Tenancies: one row per stay (unit + rate + deposit lifecycle) ─────────────
CREATE TABLE IF NOT EXISTS tenancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid REFERENCES units(id) ON DELETE SET NULL,
  weekly_rate numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','moved_out')),
  move_in date,
  move_out date,
  notice_given_at timestamptz,
  deposit_total numeric NOT NULL DEFAULT 500,
  deposit_status text NOT NULL DEFAULT 'holding' CHECK (deposit_status IN ('holding','returned','kept')),
  deposit_returned_amount numeric,
  kids int,
  pets text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Tenants: people attached to a tenancy (primary + co-occupants) ────────────
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,  -- link back to the booking funnel
  name text NOT NULL,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tenants_tenancy_idx ON tenants(tenancy_id);
CREATE INDEX IF NOT EXISTS tenants_name_idx ON tenants(name);

-- ── Payments: every dollar received, itemized ─────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  week_due date,                                          -- the Monday this covers; null for move-in items
  type text NOT NULL CHECK (type IN ('rent','late_fee','deposit','application_fee','prorate','buffer_day','utility_overage','other')),
  amount numeric NOT NULL,
  method text CHECK (method IN ('zelle','venmo','cash','cashapp','other') OR method IS NULL),
  paid_at timestamptz NOT NULL DEFAULT now(),
  late boolean NOT NULL DEFAULT false,
  note text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tenant_payments_tenancy_idx ON tenant_payments(tenancy_id);
CREATE INDEX IF NOT EXISTS tenant_payments_week_idx ON tenant_payments(week_due);

-- ── Utility overages: monthly bill vs credit, collected with next week ────────
CREATE TABLE IF NOT EXISTS utility_charges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  month date NOT NULL,                                    -- first of month
  bill_amount numeric,
  credit numeric,
  overage numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','collected','waived')),
  emailed_at timestamptz,
  collected_payment_id uuid REFERENCES tenant_payments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Email templates: the girls write the wording, placeholders fill numbers ───
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,          -- 'late_fee' | 'utility_overage' | custom
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,                -- {{name}} {{amount}} {{credit}} {{overage}} {{unit}} {{week}}
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Documents vault (private storage bucket + index table) ────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid REFERENCES tenancies(id) ON DELETE SET NULL,
  tenant_name text,                  -- denormalized for fast search even after move-out
  name text NOT NULL,
  storage_path text NOT NULL,
  mime text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- PRIVATE bucket for rental agreements etc. (signed URLs only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='staff manage documents') THEN
    CREATE POLICY "staff manage documents" ON storage.objects
      FOR ALL TO authenticated
      USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');
  END IF;
END $$;

-- ── RLS: enable + staff-only access on all new tables ────────────────────────
ALTER TABLE tenancies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents       ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tenancies','tenants','tenant_payments','utility_charges','email_templates','documents'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname=t||'_staff_all') THEN
      EXECUTE format('CREATE POLICY %I ON %I FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());', t||'_staff_all', t);
    END IF;
  END LOOP;
END $$;

-- ── Seed the two starter email templates (girls will rewrite the wording) ─────
INSERT INTO email_templates (key, name, subject, body) VALUES
  ('late_fee', 'Late Payment Notice',
   'Payment reminder — Canyon Apartments',
   E'Hi {{name}},\n\nThis is a reminder that your weekly payment of {{amount}} was due this morning at 10:00 AM. A $50 late fee now applies, bringing your total to {{total}}.\n\nPlease send payment by 5:00 PM today to keep everything on track for the week.\n\nThank you,\nCanyon Apartments Management'),
  ('utility_overage', 'Utility Overage Notice',
   'Utility overage this month — Canyon Apartments',
   E'Hi {{name}},\n\nYour apartment includes a monthly utility credit of {{credit}}. This month''s usage came to {{bill}}, which puts you {{overage}} over the included amount.\n\nThe {{overage}} overage will be added to your next weekly payment.\n\nThank you,\nCanyon Apartments Management')
ON CONFLICT (key) DO NOTHING;

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM information_schema.tables WHERE table_name='tenancies')        AS tenancies_ok,
  (SELECT count(*) FROM information_schema.tables WHERE table_name='tenant_payments')  AS payments_ok,
  (SELECT count(*) FROM information_schema.tables WHERE table_name='email_templates')  AS templates_ok,
  (SELECT count(*) FROM information_schema.tables WHERE table_name='documents')        AS documents_ok,
  (SELECT count(*) FROM information_schema.columns WHERE table_name='units' AND column_name='keypad_code') AS units_ok,
  (SELECT count(*) FROM storage.buckets WHERE id='documents')                          AS bucket_ok;
