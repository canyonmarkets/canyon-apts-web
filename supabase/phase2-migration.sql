-- Phase 2 migration: push_subscriptions table + Storage bucket + RLS
-- Run this in the Supabase SQL editor at:
-- https://supabase.com/dashboard/project/ukjxwxtxuivnlimwxesq/sql

-- Push subscriptions (web-push)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Storage bucket for unit photos (run in dashboard → Storage → New bucket if SQL fails)
INSERT INTO storage.buckets (id, name, public)
VALUES ('unit-photos', 'unit-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: allow authenticated users to upload/delete
CREATE POLICY IF NOT EXISTS "staff can upload unit photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'unit-photos');

CREATE POLICY IF NOT EXISTS "unit photos are public"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'unit-photos');

CREATE POLICY IF NOT EXISTS "staff can delete unit photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'unit-photos');
