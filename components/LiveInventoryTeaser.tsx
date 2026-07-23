import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CITIES } from '@/lib/cities';
import InventoryBanner from '@/components/InventoryBanner';

interface TeaserUnit {
  id: string; title: string; area: string; city: string; bedrooms: number; bathrooms: number;
  weekly_price: number; special: string | null; status: string; available_date: string | null;
  unit_photos: { id: string; storage_path: string; sort_order: number }[];
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const photoUrl = (p: string) => `${SUPABASE_URL}/storage/v1/object/public/unit-photos/${p}`;
const cityName = (slug: string) => CITIES.find(c => c.slug === slug)?.name ?? slug;

// Server component: a live strip of real available units on the homepage.
// Falls back to the static inventory banner if nothing is listed.
export default async function LiveInventoryTeaser() {
  let units: TeaserUnit[] = [];
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from('units')
      .select('id, title, area, city, bedrooms, bathrooms, weekly_price, special, status, available_date, unit_photos(id, storage_path, sort_order)')
      .in('status', ['available', 'available_on'])
      .order('sort_order', { ascending: true })
      .limit(3);
    units = (data as TeaserUnit[]) ?? [];
  } catch { /* fall through to banner */ }

  if (units.length === 0) return <InventoryBanner />;

  return (
    <section className="relative bg-iron-900 px-6 py-20 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[44rem] max-w-full rounded-full bg-brand-500/10 blur-3xl" aria-hidden="true" />
      <div className="relative max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <p className="text-brand-400 font-mono text-sm tracking-[0.3em] uppercase mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" /> Live Inventory
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-wide text-white">
              Available Right Now
            </h2>
          </div>
          <Link href="/available-now?utm_source=home_teaser"
            className="text-sm font-semibold text-brand-400 hover:text-brand-200 transition-colors shrink-0">
            See all available units →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {units.map(u => {
            const photo = [...u.unit_photos].sort((a, b) => a.sort_order - b.sort_order)[0];
            return (
              <Link key={u.id} href={`/available-now?utm_source=home_teaser#${u.id}`}
                className="group rounded-2xl bg-[#161d2b] ring-1 ring-white/10 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:ring-brand-500/40 hover:shadow-[0_12px_40px_rgba(201,75,12,0.18)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                  {photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={photoUrl(photo.storage_path)} alt={u.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/40 text-sm">Photos coming soon</div>
                  )}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-iron-900/70 backdrop-blur border border-white/15 text-green-300 text-[11px] font-semibold px-2.5 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    {u.status === 'available' ? 'Available Now' : 'Available Soon'}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-white text-sm uppercase tracking-wide truncate">{u.title}</p>
                    <p className="text-white/50 text-xs">{cityName(u.city)} · {u.bedrooms}BR / {u.bathrooms}BA</p>
                  </div>
                  <p className="text-brand-400 text-xl font-bold shrink-0">
                    ${u.weekly_price.toLocaleString()}<span className="text-white/40 text-xs font-normal">/wk</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
