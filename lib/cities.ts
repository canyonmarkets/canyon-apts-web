/**
 * Service-area cities for the SEO landing-page mesh.
 * Phoenix is the canonical hub (handled by the existing flat /{type}-phoenix
 * pages). The other cities get generated spokes at /{type}/{city}.
 * West Valley is intentionally excluded (too far to maintain). Scottsdale is
 * comingSoon — units expected within a few months (2026).
 *
 * Local copy is kept general on purpose: per Jeff, the Phoenix metro reads as
 * one large connected suburb without the distinct neighborhood identities of
 * other major metros — so we lean on freeway access + nearby employers/hospitals
 * rather than inventing neighborhood detail.
 */
export type City = {
  slug: string;
  name: string;
  /** True once units are actually available there. */
  available: boolean;
  comingSoon?: boolean;
  /** Generic, true context for non-thin local copy. */
  blurb: string;
  /** Nearby anchors used in copy (employers, hospitals, freeways). */
  anchors: string[];
};

export const CITIES: City[] = [
  {
    slug: 'phoenix',
    name: 'Phoenix',
    available: true,
    blurb:
      'Centrally located across the greater Phoenix area with quick access to major employers, hospitals, and the I-10 and I-17 corridors.',
    anchors: ['Downtown Phoenix', 'Sky Harbor Airport', 'I-10', 'I-17', 'Banner & Dignity Health hospitals'],
  },
  {
    slug: 'tempe',
    name: 'Tempe',
    available: true,
    blurb:
      'Minutes from Sky Harbor Airport and Arizona State University, with easy access to the Loop 101 and US-60 — convenient to the entire East Valley.',
    anchors: ['Arizona State University', 'Sky Harbor Airport', 'Loop 101', 'US-60'],
  },
  {
    slug: 'mesa',
    name: 'Mesa',
    available: true,
    blurb:
      'East Valley locations convenient to Banner Health, Boeing, and the growing Mesa employment and tech corridor.',
    anchors: ['Banner Desert Medical Center', 'Boeing', 'US-60', 'Loop 202'],
  },
  {
    slug: 'gilbert',
    name: 'Gilbert',
    available: true,
    blurb:
      'Family-friendly Southeast Valley communities near Dignity Health Mercy Gilbert and Chandler Regional, with quick Loop 202 access.',
    anchors: ['Mercy Gilbert Medical Center', 'Loop 202', 'Santan Freeway'],
  },
  {
    slug: 'chandler',
    name: 'Chandler',
    available: true,
    blurb:
      'Close to Intel, PayPal, and the Price Road Corridor — ideal for corporate and tech assignment workers, with easy Loop 101 and 202 access.',
    anchors: ['Intel', 'PayPal', 'Price Road Corridor', 'Loop 101', 'Loop 202'],
  },
  // Scottsdale intentionally removed 2026-07-04 (Joleen's request): the "coming soon"
  // presence was attracting Scottsdale-specific callers we can't serve yet and burning
  // booking slots. Re-add the entry here when a Scottsdale unit is actually secured —
  // the spoke pages, city hub, sitemap entries, and booking dropdown all regenerate
  // from this list automatically.
];

/** Cities that get generated spoke pages (everything except the Phoenix hub). */
export const SPOKE_CITIES = CITIES.filter((c) => c.slug !== 'phoenix');

export const getCity = (slug: string) => CITIES.find((c) => c.slug === slug);
