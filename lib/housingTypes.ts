/**
 * The five housing-type "hubs". Each `slug` matches the base of the existing
 * flat Phoenix landing page (e.g. slug "furnished-apartments" → existing
 * /furnished-apartments-phoenix, referenced as phoenixHub). Generated spokes
 * live at /{slug}/{city} for non-Phoenix cities, so there is no collision with
 * the existing Phoenix pages and no duplicate-content competition for Phoenix.
 */
export type HousingType = {
  slug: string;
  /** Existing flat page that serves as the Phoenix hub. */
  phoenixHub: string;
  name: string;
  /** Short label for chips/nav. */
  shortName: string;
  /** {city} is interpolated at build time. */
  h1: string;
  intro: string;
  benefits: string[];
  metaTitle: string; // include {city}
  metaDescription: string; // include {city}
};

export const HOUSING_TYPES: HousingType[] = [
  {
    slug: 'furnished-apartments',
    phoenixHub: '/furnished-apartments-phoenix',
    name: 'Furnished Apartments',
    shortName: 'Furnished',
    h1: 'Furnished Apartments in {city}, AZ',
    intro:
      'Fully furnished, move-in-ready apartments in {city} — furniture, kitchenware, bedding, and TVs included. Weekly and monthly terms, utilities included, no credit check.',
    benefits: [
      'Move-in ready — just bring your suitcase',
      'All utilities included in one weekly rate',
      'Weekly or monthly — no long-term lease',
      'No credit check, no rental-history hurdles',
    ],
    metaTitle: 'Furnished Apartments {city} AZ | Weekly & Monthly',
    metaDescription:
      'Fully furnished apartments in {city}, AZ. Utilities included, weekly & monthly terms, no credit check, fast move-in. Canyon Apartments.',
  },
  {
    slug: 'no-credit-check-apartments',
    phoenixHub: '/no-credit-check-apartments-phoenix',
    name: 'No-Credit-Check Apartments',
    shortName: 'No Credit Check',
    h1: 'No-Credit-Check Apartments in {city}, AZ',
    intro:
      'Furnished apartments in {city} with no credit check, ever. Past evictions, low scores, and non-traditional income do not disqualify you — we look at your ability to pay going forward.',
    benefits: [
      'No credit check of any kind — no hard or soft pull',
      'Evictions and bad credit welcome',
      'Non-violent records considered case-by-case',
      'Furnished, utilities included, flexible terms',
    ],
    metaTitle: 'No Credit Check Apartments {city} AZ | Furnished',
    metaDescription:
      'No-credit-check furnished apartments in {city}, AZ. Evictions OK, no rental history required, utilities included, move in this week. Canyon Apartments.',
  },
  {
    slug: 'weekly-rentals',
    phoenixHub: '/weekly-rentals-phoenix',
    name: 'Weekly Rentals',
    shortName: 'Weekly',
    h1: 'Weekly Apartment Rentals in {city}, AZ',
    intro:
      'Furnished weekly rentals in {city} starting at $495/week. Stay a week or stay months — the lease renews weekly, with utilities included and no long-term commitment.',
    benefits: [
      'Week-to-week — stay exactly as long as you need',
      'Starting at $495/week, utilities included',
      'Fully furnished and move-in ready',
      'No credit check, fast move-in',
    ],
    metaTitle: 'Weekly Apartment Rentals {city} AZ | Furnished',
    metaDescription:
      'Furnished weekly apartment rentals in {city}, AZ from $495/week. Utilities included, no credit check, week-to-week flexibility. Canyon Apartments.',
  },
  {
    slug: 'traveling-nurse-housing',
    phoenixHub: '/traveling-nurse-housing-phoenix',
    name: 'Traveling Nurse Housing',
    shortName: 'Travel Nurse',
    h1: 'Traveling Nurse Housing in {city}, AZ',
    intro:
      'Fully furnished housing for travel nurses on assignment in {city}. Week-to-week and month-to-month leases that flex with your contract, near major hospitals, utilities included.',
    benefits: [
      'Terms that match your assignment length',
      'Near major {city}-area hospitals',
      'Furnished real apartment — not a hotel or shared room',
      'No credit check, flexible check-out if a contract ends early',
    ],
    metaTitle: 'Traveling Nurse Housing {city} AZ | Furnished Weekly',
    metaDescription:
      'Furnished traveling nurse housing in {city}, AZ. Weekly & monthly terms near major hospitals, utilities included, fast move-in. Canyon Apartments.',
  },
  {
    slug: 'corporate-housing',
    phoenixHub: '/corporate-housing-phoenix',
    name: 'Corporate Housing',
    shortName: 'Corporate',
    h1: 'Corporate Housing in {city}, AZ',
    intro:
      'Turnkey corporate housing in {city} for relocations, projects, and assignment workers. Fully furnished, utilities included, flexible monthly terms, and a simple direct booking process.',
    benefits: [
      'Turnkey furnished units near major employers',
      'Flexible monthly terms for projects & relocations',
      'Utilities and parking included',
      'Direct booking — no credit check, fast setup',
    ],
    metaTitle: 'Corporate Housing {city} AZ | Furnished Monthly',
    metaDescription:
      'Furnished corporate housing in {city}, AZ for relocations and assignments. Utilities included, flexible monthly terms, fast move-in. Canyon Apartments.',
  },
];

export const getHousingType = (slug: string) =>
  HOUSING_TYPES.find((t) => t.slug === slug);
