-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 6A SECURITY FOLLOW-UP — column-level lockdown on units
-- The public website's anon key may only read marketing columns. Staff-only
-- fields (keypad_code, mgmt_notes, unit_number, notes, complex_name,
-- utility_credit_monthly, entry_type) become invisible to the public API.
-- Run BEFORE entering any real keypad codes. Safe to re-run.
-- ═══════════════════════════════════════════════════════════════════════════

REVOKE SELECT ON public.units FROM anon;
GRANT SELECT (id, title, area, city, bedrooms, bathrooms, weekly_price, amenities,
              special, status, available_date, sort_order, created_at, updated_at)
  ON public.units TO anon;

-- Verify: anon can see weekly_price but NOT keypad_code
SELECT
  has_column_privilege('anon', 'public.units', 'weekly_price', 'SELECT') AS public_marketing_ok,   -- want: true
  has_column_privilege('anon', 'public.units', 'keypad_code',  'SELECT') AS keypad_hidden_ok;      -- want: false
