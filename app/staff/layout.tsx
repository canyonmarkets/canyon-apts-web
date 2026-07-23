'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Home, Calendar, Building2, Users, Settings, BarChart2, BookOpen, Search, X, Monitor, Smartphone, Phone, Contact, Banknote, FolderOpen, PieChart, LayoutGrid } from 'lucide-react';
import { PIPELINE_LABELS, type PipelineStage } from '@/lib/booking';
import { CITIES } from '@/lib/cities';
import { isManager } from '@/lib/roles';

// Bottom bar (5 slots) differs by tier; everything else lives in the More sheet.
const NAV_MANAGER = [
  { href: '/staff',          label: 'Today',    icon: Home },
  { href: '/staff/bookings', label: 'Bookings', icon: Calendar },
  { href: '/staff/tenants',  label: 'Tenants',  icon: Contact },
  { href: '/staff/rent',     label: 'Rent',     icon: Banknote },
];
const NAV_BOOKING = [
  { href: '/staff',           label: 'Today',     icon: Home },
  { href: '/staff/bookings',  label: 'Bookings',  icon: Calendar },
  { href: '/staff/inventory', label: 'Inventory', icon: Building2 },
  { href: '/staff/waitlist',  label: 'Waitlist',  icon: Users },
];
const MORE_MANAGER = [
  { href: '/staff/inventory',   label: 'Inventory', icon: Building2 },
  { href: '/staff/waitlist',    label: 'Waitlist',  icon: Users },
  { href: '/staff/availability',label: 'Schedule',  icon: Settings },
  { href: '/staff/stats',       label: 'Stats',     icon: BarChart2 },
  { href: '/staff/reports',     label: 'Reports',   icon: PieChart },
  { href: '/staff/documents',   label: 'Documents', icon: FolderOpen },
  { href: '/staff/guide',       label: 'Guide',     icon: BookOpen },
];
const MORE_BOOKING = [
  { href: '/staff/availability',label: 'Schedule',  icon: Settings },
  { href: '/staff/stats',       label: 'Stats',     icon: BarChart2 },
  { href: '/staff/guide',       label: 'Guide',     icon: BookOpen },
];

interface SearchResult {
  id: string; name: string; phone: string; email: string;
  desired_city: string | null; bedrooms: number | null;
  bookings: { id: string; slot_start: string; status: string; pipeline_stage: PipelineStage }[];
  waitlist: { id: string; reason: string; notified_at: string | null }[];
}
interface TenantHit {
  id: string; name: string; phone: string | null; email: string | null; tenancy_id: string;
  tenancies: { id: string; status: string; weekly_rate: number; units: { complex_name: string | null; unit_number: string | null; title: string } | null } | null;
}

const REASON_SHORT: Record<string, string> = {
  city_unavailable: 'City waitlist', beds_unavailable: 'BR waitlist', date_too_far: 'Date waitlist',
};

function cityName(slug: string | null) {
  if (!slug) return null;
  return CITIES.find(c => c.slug === slug)?.name ?? slug;
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Desktop / phone width toggle (persisted)
  const [wide, setWide] = useState(false);
  useEffect(() => { setWide(localStorage.getItem('staff-wide') === '1'); }, []);
  const toggleWide = () => {
    setWide(w => { localStorage.setItem('staff-wide', w ? '0' : '1'); return !w; });
  };

  // More menu sheet
  const [moreOpen, setMoreOpen] = useState(false);

  // Universal search
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [tenantHits, setTenantHits] = useState<TenantHit[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setTenantHits([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/staff/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) { const d = await res.json(); setResults(d.results ?? []); setTenantHits(d.tenants ?? []); }
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const closeSearch = () => { setSearchOpen(false); setQuery(''); setResults([]); setTenantHits([]); };

  const openResult = (r: SearchResult) => {
    const latest = [...(r.bookings ?? [])].sort((a, b) => b.slot_start.localeCompare(a.slot_start))[0];
    closeSearch();
    if (latest) router.push(`/staff/bookings/${latest.id}`);
    else if ((r.waitlist ?? []).length > 0) router.push('/staff/waitlist');
  };

  const isLoginPage = pathname.startsWith('/staff/login');

  useEffect(() => {
    if (isLoginPage) { setReady(true); return; }
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/staff/login'); return; }
      setUserEmail(session.user.email ?? null);
      setReady(true);
      // Register service worker + request push subscription
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/sw.js').then(async (reg) => {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidKey) return;
          const existing = await reg.pushManager.getSubscription();
          if (existing) return; // already subscribed
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey,
          });
          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub),
          });
        }).catch(() => {/* push not supported or blocked */});
      }
    });
  }, [isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (!ready) {
    return (
      <div className="min-h-screen bg-iron-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    router.replace('/staff/login');
  };

  const shell = wide ? 'max-w-5xl' : 'max-w-lg';
  const manager = isManager(userEmail);
  const navItems = manager ? NAV_MANAGER : NAV_BOOKING;
  const moreItems = manager ? MORE_MANAGER : MORE_BOOKING;
  const moreActive = moreItems.some(({ href }) => pathname.startsWith(href));

  return (
    <div className="flex flex-col h-dvh bg-iron-50">
      {/* Top bar */}
      <header className="bg-iron-900 px-4 shrink-0 relative z-50">
        <div className={`${shell} mx-auto h-14 flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Canyon_Logo-removebg-preview.png" alt="Canyon" className="h-9 w-auto" />
            <span className="font-display text-sm font-bold uppercase tracking-widest text-white">Staff</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
              aria-label="Search people"
              className={`p-2 rounded-xl transition-colors ${searchOpen ? 'bg-brand-600 text-white' : 'text-iron-400 hover:text-white hover:bg-white/10'}`}>
              <Search size={17} />
            </button>
            <button onClick={toggleWide}
              aria-label={wide ? 'Switch to phone layout' : 'Switch to desktop layout'}
              title={wide ? 'Phone layout' : 'Desktop layout'}
              className="hidden md:block p-2 rounded-xl text-iron-400 hover:text-white hover:bg-white/10 transition-colors">
              {wide ? <Smartphone size={17} /> : <Monitor size={17} />}
            </button>
            <button onClick={signOut} className="text-xs text-iron-400 hover:text-white transition-colors pl-1.5">Sign out</button>
          </div>
        </div>

        {/* Search panel */}
        {searchOpen && (
          <div className="absolute left-0 right-0 top-14 bg-iron-900 border-t border-white/10 shadow-2xl pb-3 px-4">
            <div className={`${shell} mx-auto`}>
              <div className="relative mt-3">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-iron-400" />
                <input
                  ref={searchInput}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') closeSearch(); }}
                  placeholder="Search any name, phone, or email…"
                  className="w-full rounded-xl bg-white/10 border border-white/15 pl-10 pr-10 py-3 text-sm text-white placeholder:text-iron-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-iron-400 hover:text-white">
                    <X size={15} />
                  </button>
                )}
              </div>

              {query.trim().length >= 2 && (
                <div className="mt-2 max-h-[50vh] overflow-y-auto rounded-xl bg-white shadow-xl divide-y divide-iron-50">
                  {searching && results.length === 0 && tenantHits.length === 0 && (
                    <p className="px-4 py-4 text-center text-iron-800 text-sm">Searching…</p>
                  )}
                  {!searching && results.length === 0 && tenantHits.length === 0 && (
                    <p className="px-4 py-4 text-center text-iron-800 text-sm">No one found for &quot;{query.trim()}&quot;</p>
                  )}
                  {(manager ? tenantHits : []).map(t => (
                    <button key={`t-${t.id}`} onClick={() => { closeSearch(); router.push(`/staff/tenants/${t.tenancy_id}`); }}
                      className="w-full text-left px-4 py-3 hover:bg-iron-50 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-iron-900 text-sm truncate">{t.name}</p>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-green-50 text-green-700 shrink-0">
                          {t.tenancies?.status === 'moved_out' ? 'Past tenant' : 'Tenant'}
                        </span>
                      </div>
                      <p className="text-iron-800 text-xs mt-0.5 flex items-center gap-1.5">
                        {t.phone && <><Phone size={10} /> {t.phone} · </>}
                        {t.tenancies?.units ? `${t.tenancies.units.complex_name || t.tenancies.units.title}${t.tenancies.units.unit_number ? ' #' + t.tenancies.units.unit_number : ''}` : 'No unit'}
                        {t.tenancies ? ` · $${t.tenancies.weekly_rate}/wk` : ''}
                      </p>
                    </button>
                  ))}
                  {results.map(r => {
                    const latest = [...(r.bookings ?? [])].sort((a, b) => b.slot_start.localeCompare(a.slot_start))[0];
                    const onWaitlist = (r.waitlist ?? []).length > 0;
                    return (
                      <button key={r.id} onClick={() => openResult(r)}
                        className="w-full text-left px-4 py-3 hover:bg-iron-50 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-iron-900 text-sm truncate">{r.name}</p>
                          <div className="flex gap-1 shrink-0">
                            {latest && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-brand-50 text-brand-700">
                                {latest.status === 'no_show' ? 'No-show' : PIPELINE_LABELS[latest.pipeline_stage] ?? latest.pipeline_stage}
                              </span>
                            )}
                            {onWaitlist && (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">
                                {REASON_SHORT[r.waitlist[0].reason] ?? 'Waitlist'}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-iron-800 text-xs mt-0.5 flex items-center gap-1.5">
                          <Phone size={10} /> {r.phone}
                          {r.bedrooms ? ` · ${r.bedrooms}BR` : ''}{cityName(r.desired_city) ? ` · ${cityName(r.desired_city)}` : ''}
                          {latest && ` · Call ${new Date(latest.slot_start).toLocaleDateString('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric' })}`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Backdrop to close search */}
      {searchOpen && <div className="fixed inset-0 z-40 bg-black/40" onClick={closeSearch} />}

      {/* Page content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className={`${shell} mx-auto px-4 py-4 pb-24`}>
          {children}
        </div>
      </main>

      {/* More sheet */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMoreOpen(false)} />
          <div className="fixed bottom-[60px] left-0 right-0 z-50 px-3 pb-2">
            <div className={`${shell} mx-auto bg-white rounded-2xl shadow-2xl border border-iron-100 p-2 grid grid-cols-4 gap-1`}>
              {moreItems.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1 rounded-xl py-3 transition-colors ${active ? 'bg-brand-50 text-brand-600' : 'text-iron-900 hover:bg-iron-50'}`}>
                    <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                    <span className="text-[10px] font-medium">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-iron-100 safe-area-pb z-40">
        <div className={`${shell} mx-auto flex`}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/staff' ? pathname === '/staff' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active ? 'text-brand-600' : 'text-iron-900 hover:text-brand-600'}`}
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(v => !v)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${moreOpen || moreActive ? 'text-brand-600' : 'text-iron-900 hover:text-brand-600'}`}
          >
            <LayoutGrid size={22} strokeWidth={moreOpen || moreActive ? 2 : 1.5} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
