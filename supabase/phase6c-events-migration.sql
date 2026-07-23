-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 6C-2 — tenancy event log (extensions, misc events) + units security
-- Idempotent — safe to run more than once. Includes the earlier security
-- follow-up in case it has not been run yet.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Event log: anything notable that is not already a payment row ────────────
CREATE TABLE IF NOT EXISTS tenancy_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
  type text NOT NULL,          -- 'extension_used' | 'note' | future types
  note text,
  meta jsonb,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tenancy_events_tenancy_idx ON tenancy_events(tenancy_id);

ALTER TABLE tenancy_events ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tenancy_events' AND policyname='tenancy_events_staff_all') THEN
    CREATE POLICY tenancy_events_staff_all ON tenancy_events
      FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());
  END IF;
END $$;

-- ── Units column lockdown (from phase6a-security-followup — no-op if done) ───
REVOKE SELECT ON public.units FROM anon;
GRANT SELECT (id, title, area, city, bedrooms, bathrooms, weekly_price, amenities,
              special, status, available_date, sort_order, created_at, updated_at)
  ON public.units TO anon;

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM information_schema.tables WHERE table_name='tenancy_events')            AS events_ok,     -- want 1
  has_column_privilege('anon', 'public.units', 'weekly_price', 'SELECT')                        AS public_ok,     -- want true
  has_column_privilege('anon', 'public.units', 'keypad_code',  'SELECT')                        AS keypad_hidden; -- want false
