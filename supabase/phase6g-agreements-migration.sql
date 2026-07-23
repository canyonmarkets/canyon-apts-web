-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 6G — Rental agreements + e-signature (replaces Eversign)
-- Idempotent — safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

-- Full street address per unit (the agreement's "Address" line). Staff-only.
ALTER TABLE units ADD COLUMN IF NOT EXISTS street_address text;

CREATE TABLE IF NOT EXISTS agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid REFERENCES tenancies(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL,               -- private signing-link token
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','viewed','signed','voided')),
  data jsonb NOT NULL,                      -- every wizard field (guests, dates, fees, special terms)
  events jsonb NOT NULL DEFAULT '[]'::jsonb,-- audit trail: [{type, at, ip, name}]
  signatures jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{guest, name_typed, image (dataURI), at, ip}]
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL, -- final signed PDF
  sent_at timestamptz NOT NULL DEFAULT now(),
  signed_at timestamptz,
  created_by uuid
);
CREATE INDEX IF NOT EXISTS agreements_tenancy_idx ON agreements(tenancy_id);
CREATE INDEX IF NOT EXISTS agreements_token_idx ON agreements(token);

ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='agreements' AND policyname='agreements_staff_all') THEN
    CREATE POLICY agreements_staff_all ON agreements
      FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
  END IF;
END $$;
-- Note: the public signing page NEVER touches this table from the browser —
-- it goes through server routes using the service role, keyed by the token.

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM information_schema.tables  WHERE table_name='agreements')                        AS agreements_ok,  -- want 1
  (SELECT count(*) FROM information_schema.columns WHERE table_name='units' AND column_name='street_address') AS address_ok; -- want 1
