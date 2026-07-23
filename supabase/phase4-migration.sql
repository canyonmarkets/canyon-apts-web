-- Phase 4 migration: automation columns + message_log
-- Run in Supabase SQL editor:
-- https://supabase.com/dashboard/project/ukjxwxtxuivnlimwxesq/sql

-- Add complex_name to units (staff-only; used in recap emails, never shown publicly)
ALTER TABLE units ADD COLUMN IF NOT EXISTS complex_name text;

-- Add automation columns to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS opened_at        timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_sent    boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS late_email_sent  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recap_sent       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recap_sent_at    timestamptz,
  ADD COLUMN IF NOT EXISTS recap_unit_id    uuid REFERENCES units(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS followup_sent    boolean NOT NULL DEFAULT false;

-- Message log — idempotency + audit trail for all automated sends
CREATE TABLE IF NOT EXISTS message_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  uuid REFERENCES bookings(id) ON DELETE SET NULL,
  lead_id     uuid REFERENCES leads(id) ON DELETE SET NULL,
  type        text NOT NULL,   -- 'reminder_2h' | 'reminder_1h' | 'running_behind' | 'recap' | 'followup' | 'waitlist_blast' | 'error_alert'
  recipient   text,
  sent_at     timestamptz DEFAULT now(),
  meta        jsonb
);

CREATE INDEX IF NOT EXISTS message_log_booking_id_type ON message_log(booking_id, type);
CREATE INDEX IF NOT EXISTS message_log_lead_id_type ON message_log(lead_id, type);
