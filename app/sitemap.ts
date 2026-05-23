import { MetadataRoute } from 'next';

const BASE = 'https://canyon-apts.com';

export default function sitemap(): MetadataRoute.Sitemap {
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
  ];
}
