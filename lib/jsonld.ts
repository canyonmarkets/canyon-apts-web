import { SITE } from './site';

/**
 * Page-level Service + BreadcrumbList JSON-LD for the flat Phoenix money pages.
 *
 * The Service ties back to the canonical business entity declared in
 * `app/layout.tsx` (`#business`) via `provider: { '@id': ... }`, so Google
 * consolidates every page's schema onto one entity instead of inventing a
 * separate orphan LocalBusiness per page. The BreadcrumbList makes these
 * high-intent pages eligible for breadcrumb rich results.
 */
export function moneyPageJsonLd({
  name,
  path,
  description,
}: {
  name: string;
  /** Site-relative path, e.g. '/furnished-apartments-phoenix'. */
  path: string;
  description: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name,
        provider: { '@id': `${SITE.baseUrl}/#business` },
        areaServed: { '@type': 'City', name: 'Phoenix, Arizona' },
        description,
        url: `${SITE.baseUrl}${path}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl },
          { '@type': 'ListItem', position: 2, name, item: `${SITE.baseUrl}${path}` },
        ],
      },
    ],
  };
}
