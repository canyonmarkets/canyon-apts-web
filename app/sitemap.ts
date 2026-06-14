import { MetadataRoute } from 'next';
import { HOUSING_TYPES } from '@/lib/housingTypes';
import { SPOKE_CITIES } from '@/lib/cities';

const BASE = 'https://canyon-apts.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const cityHubs: MetadataRoute.Sitemap = SPOKE_CITIES.map((c) => ({
    url: `${BASE}/apartments/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const spokes: MetadataRoute.Sitemap = HOUSING_TYPES.flatMap((t) =>
    SPOKE_CITIES.map((c) => ({
      url: `${BASE}/${t.slug}/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
  );

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/#amenities`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/#faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/#locations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/#how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    // ── Keyword-intent service pages ──────────────────────────────────────
    { url: `${BASE}/no-credit-check-apartments-phoenix`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.95 },
    { url: `${BASE}/furnished-apartments-phoenix`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.95 },
    { url: `${BASE}/weekly-rentals-phoenix`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/traveling-nurse-housing-phoenix`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/corporate-housing-phoenix`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    // ── City hub pages ────────────────────────────────────────────────────
    ...cityHubs,
    // ── Generated housing-type × city spokes ──────────────────────────────
    ...spokes,
  ];
}
