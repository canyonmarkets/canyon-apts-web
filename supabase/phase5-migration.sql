-- Phase 5 migration: SMS opt-in on leads
-- Run in Supabase SQL editor:
-- https://supabase.com/dashboard/project/ukjxwxtxuivnlimwxesq/sql

ALTER TABLE leads ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false;
