import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isManager, isManagerPath } from '@/lib/roles';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (
    req.nextUrl.pathname.startsWith('/staff') &&
    !req.nextUrl.pathname.startsWith('/staff/login') &&
    !user
  ) {
    return NextResponse.redirect(new URL('/staff/login', req.url));
  }
  // Back-office pages are manager-tier only (the caller firewall).
  if (user && isManagerPath(req.nextUrl.pathname) && !isManager(user.email)) {
    return NextResponse.redirect(new URL('/staff', req.url));
  }
  return res;
}

export const config = { matcher: ['/staff/:path*'] };
