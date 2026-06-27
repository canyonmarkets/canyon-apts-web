import { createClient } from '@supabase/supabase-js';

// SERVER ONLY. Never import this into a client component.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(10000) }),
      },
    },
  );
}
