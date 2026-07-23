-- ═══════════════════════════════════════════════════════════════════════════
-- COMBINED GO-LIVE MIGRATION (phases 2 + 4 + 5, corrected for actual DB state)
-- Written 2026-07-03. Idempotent — safe to run more than once.
--
-- Corrections vs the original phase files:
--   • CREATE POLICY IF NOT EXISTS is not valid Postgres — replaced with guarded
--     DO blocks that check pg_policies first.
--   • message_log already exists from the Phase-0 schema (with channel/direction/
--     body columns), so phase4's CREATE TABLE IF NOT EXISTS would skip it and the
--     recipient/meta columns the app code needs would never be added. Replaced
--     with ALTER TABLE ADD COLUMN IF NOT EXISTS.
--   • The unit-photos storage bucket already exists (created 2026-06-27) — the
--     insert is kept but is a no-op via ON CONFLICT.
--
-- Run in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/ukjxwxtxuivnlimwxesq/sql/new
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Phase 2: push subscriptions (web-push notifications for staff phones) ────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ── Phase 2: storage bucket (no-op — already exists) ─────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('unit-photos', 'unit-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ── Phase 2: storage policies (guarded; CREATE POLICY has no IF NOT EXISTS) ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'staff can upload unit photos'
  ) THEN
    CREATE POLICY "staff can upload unit photos"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'unit-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'unit photos are public'
  ) THEN
    CREATE POLICY "unit photos are public"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'unit-photos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'staff can delete unit photos'
  ) THEN
    CREATE POLICY "staff can delete unit photos"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'unit-photos');
  END IF;
END $$;

-- ── Phase 4: staff-only complex name, used in recap emails ───────────────────
ALTER TABLE units ADD COLUMN IF NOT EXISTS complex_name text;

-- ── Phase 4: automation columns on bookings ──────────────────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS opened_at        timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_sent    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS late_email_sent  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recap_sent       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recap_sent_at    timestamptz,
  ADD COLUMN IF NOT EXISTS recap_unit_id    uuid REFERENCES units(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS followup_sent    boolean NOT NULL DEFAULT false;

-- ── Phase 4: bring the existing Phase-0 message_log up to the app's shape ────
ALTER TABLE message_log ADD COLUMN IF NOT EXISTS recipient text;
ALTER TABLE message_log ADD COLUMN IF NOT EXISTS meta jsonb;

CREATE INDEX IF NOT EXISTS message_log_booking_id_type ON message_log(booking_id, type);
CREATE INDEX IF NOT EXISTS message_log_lead_id_type ON message_log(lead_id, type);

-- ── Phase 5: SMS opt-in flag (Twilio later; column ships now) ────────────────
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false;

-- ── 2026-07-03: "Do you have any pets?" question on the booking form ─────────
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pets text;

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM information_schema.columns WHERE table_name='bookings'    AND column_name='recap_sent_at')    AS bookings_ok,
  (SELECT count(*) FROM information_schema.columns WHERE table_name='message_log' AND column_name='recipient')        AS message_log_ok,
  (SELECT count(*) FROM information_schema.tables  WHERE table_name='push_subscriptions')                            AS push_table_ok,
  (SELECT count(*) FROM information_schema.columns WHERE table_name='leads'       AND column_name='sms_opt_in')       AS leads_ok,
  (SELECT count(*) FROM information_schema.columns WHERE table_name='units'       AND column_name='complex_name')     AS units_ok,
  (SELECT count(*) FROM information_schema.columns WHERE table_name='leads'       AND column_name='pets')             AS pets_ok;
