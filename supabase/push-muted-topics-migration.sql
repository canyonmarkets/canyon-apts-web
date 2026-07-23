-- Per-person alert muting (July 2026)
-- Run in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/ukjxwxtxuivnlimwxesq/sql
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS muted_topics text[] NOT NULL DEFAULT '{}';
SELECT staff_id, muted_topics FROM push_subscriptions; -- verify
