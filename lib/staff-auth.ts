import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { isManager } from '@/lib/roles';

export async function requireStaff() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return { user: null, userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user, userId: user.id, error: null };
}

// Back-office routes (tenants, payments, documents, reports): manager tier only.
// A hired caller on the properties@ login gets a 403 here even with a valid session.
export async function requireManager() {
  const { user, userId, error } = await requireStaff();
  if (error) return { user: null, userId: null, error };
  if (!isManager(user!.email)) {
    return { user: null, userId: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user, userId, error: null };
}
