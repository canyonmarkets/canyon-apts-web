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
  /** Two-paragraph body prose for spoke pages; {city} interpolated. */
  detailedProse: string;
  benefits: string[];
  metaTitle: string; // include {city}
  metaDescription: string; // include {city}
  /** Slugs of the most topically relevant /guides articles for this type. */
  relatedGuides: string[];
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
    detailedProse:
      'Canyon Apartments has rented fully furnished apartments across the Phoenix metro since 2017 — starting as a short-term rental operation and rebuilding around direct weekly and monthly leases after the 2020 Airbnb shutdown. The result is a rental experience built around the resident: no hidden fees, no credit checks, and a real furnished apartment instead of a hotel room or extended-stay suite.\n\nA fully furnished Canyon apartment in {city} means you walk in with nothing but your bag. We provide the furniture, bedding, kitchen equipment, towels, and TV — all of it set up and ready before you arrive. Utilities and parking are bundled into one weekly or monthly rate, so there are no surprise bills and no setup calls to utility companies. Most residents confirm availability on a call and are in their new unit within 2 to 3 days.',
    benefits: [
      'Move-in ready — just bring your suitcase',
      'All utilities included in one weekly rate',
      'Weekly or monthly — no long-term lease',
      'No credit check, no rental-history hurdles',
    ],
    metaTitle: 'Furnished Apartments {city} AZ | Weekly & Monthly',
    metaDescription:
      'Fully furnished apartments in {city}, AZ. Utilities included, weekly & monthly terms, no credit check, fast move-in. Canyon Apartments.',
    relatedGuides: [
      'furnished-vs-unfurnished-short-term-phoenix',
      'extended-stay-hotels-vs-furnished-apartments-phoenix',
      'moving-to-phoenix-temporary-housing',
    ],
  },
  {
    slug: 'no-credit-check-apartments',
    phoenixHub: '/no-credit-check-apartments-phoenix',
    name: 'No-Credit-Check Apartments',
    shortName: 'No Credit Check',
    h1: 'No-Credit-Check Apartments in {city}, AZ',
    intro:
      'Furnished apartments in {city} with no credit check, ever. Past evictions, low scores, and non-traditional income do not disqualify you — we look at your ability to pay going forward.',
    detailedProse:
      'Most rental companies run a credit check before they will even return a call. Canyon Apartments does not — not a hard pull, not a soft pull, nothing on file. This was a deliberate decision when we rebuilt the business around direct resident relationships after 2020. The people we work with often have genuine credit challenges: an eviction from a years-old situation, a medical bankruptcy, non-traditional income that standard scoring systems do not recognize, or a legal background that conventional landlords reject outright. We look at your current ability to pay, have a direct conversation, and go from there.\n\nA no-credit-check apartment in {city} through Canyon is a real furnished home — not a motel room, not a shared house — with full furnishings, all utilities included, and flexible weekly or monthly terms. Many of the residents who came to us after being turned down by every other landlord have been with us continuously for a year or more.',
    benefits: [
      'No credit check of any kind — no hard or soft pull',
      'Evictions and bad credit welcome',
      'Non-violent records considered case-by-case',
      'Furnished, utilities included, flexible terms',
    ],
    metaTitle: 'No Credit Check Apartments {city} AZ | Furnished',
    metaDescription:
      'No-credit-check furnished apartments in {city}, AZ. Evictions OK, no rental history required, utilities included, move in this week. Canyon Apartments.',
    relatedGuides: [
      'no-credit-check-apartments-phoenix-how-they-work',
      'renting-with-eviction-arizona',
    ],
  },
  {
    slug: 'weekly-rentals',
    phoenixHub: '/weekly-rentals-phoenix',
    name: 'Weekly Rentals',
    shortName: 'Weekly',
    h1: 'Weekly Apartment Rentals in {city}, AZ',
    intro:
      'Furnished weekly rentals in {city} starting at $495/week. Stay a week or stay months — the lease renews weekly, with utilities included and no long-term commitment.',
    detailedProse:
      'Week-to-week furnished rentals exist because life does not always come on a 12-month schedule. Canyon Apartments built its weekly rental model after the 2020 Airbnb shutdown — when we pulled every listing and rebuilt around direct, flexible resident relationships. Short-term flexibility became the foundation of how we operate, not an add-on.\n\nA Canyon weekly rental in {city} starts at $495 per week, utilities included. The lease renews week-to-week until you are ready to leave — no penalty, no pressure, no long-term obligation. Whether you need 10 days to bridge between leases, 6 weeks for a work assignment, or several months while a bigger housing situation resolves, the terms adjust to match your life. Moving in is straightforward: a short call to confirm availability, a simple one-page agreement, and you pick up keys — often within 2 to 3 days of your first conversation.',
    benefits: [
      'Week-to-week — stay exactly as long as you need',
      'Starting at $495/week, utilities included',
      'Fully furnished and move-in ready',
      'No credit check, fast move-in',
    ],
    metaTitle: 'Weekly Apartment Rentals {city} AZ | Furnished',
    metaDescription:
      'Furnished weekly apartment rentals in {city}, AZ from $495/week. Utilities included, no credit check, week-to-week flexibility. Canyon Apartments.',
    relatedGuides: [
      'extended-stay-hotels-vs-furnished-apartments-phoenix',
      'moving-to-phoenix-temporary-housing',
    ],
  },
  {
    slug: 'traveling-nurse-housing',
    phoenixHub: '/traveling-nurse-housing-phoenix',
    name: 'Traveling Nurse Housing',
    shortName: 'Travel Nurse',
    h1: 'Traveling Nurse Housing in {city}, AZ',
    intro:
      'Fully furnished housing for travel nurses on assignment in {city}. Week-to-week and month-to-month leases that flex with your contract, near major hospitals, utilities included.',
    detailedProse:
      'Traveling nurses were the core of Canyon Apartments from the beginning. During the 2020 surge, nurses on assignment made up roughly 75% of our residents — and that experience directly shaped how we approach furnished housing. We know what a travel nursing assignment looks like: the contract terms, the priority of being genuinely close to the medical center, and the need for flexibility if an assignment changes or ends early.\n\nEvery Canyon unit in {city} is move-in ready from day one: bed and full bedding, equipped kitchen, towels, TV, and all utilities in a single weekly or monthly rate. We place travel nurses near {city}-area hospitals and match you to the closest available unit when you call. Lease terms flex with your contract — weekly or monthly, with no penalty if your assignment changes mid-stay. No credit check, no long-form application, no delays.',
    benefits: [
      'Terms that match your assignment length',
      'Near major {city}-area hospitals',
      'Furnished real apartment — not a hotel or shared room',
      'No credit check, flexible check-out if a contract ends early',
    ],
    metaTitle: 'Traveling Nurse Housing {city} AZ | Furnished Weekly',
    metaDescription:
      'Furnished traveling nurse housing in {city}, AZ. Weekly & monthly terms near major hospitals, utilities included, fast move-in. Canyon Apartments.',
    relatedGuides: [
      'traveling-nurse-housing-phoenix-guide',
      'moving-to-phoenix-temporary-housing',
    ],
  },
  {
    slug: 'corporate-housing',
    phoenixHub: '/corporate-housing-phoenix',
    name: 'Corporate Housing',
    shortName: 'Corporate',
    h1: 'Corporate Housing in {city}, AZ',
    intro:
      'Turnkey corporate housing in {city} for relocations, projects, and assignment workers. Fully furnished, utilities included, flexible monthly terms, and a simple direct booking process.',
    detailedProse:
      'Corporate housing through Canyon Apartments is built for the way assignments actually work: an employer needs a furnished unit for an employee in {city} by Monday, and they need a clean, direct process to make it happen. No credit check delays, no furniture-rental add-ons, no long lease negotiations — just a turnkey furnished apartment on flexible monthly terms with a single all-in rate.\n\nCanyon has placed employees on cross-country relocations, professionals on project-based assignments, consultants on multi-month engagements, and executives on extended stays across the East Valley. Every unit includes furnishings, all utilities, and parking. Many corporate clients handle recurring placements through a single direct contact, which we are happy to set up when you call.',
    benefits: [
      'Turnkey furnished units near major employers',
      'Flexible monthly terms for projects & relocations',
      'Utilities and parking included',
      'Direct booking — no credit check, fast setup',
    ],
    metaTitle: 'Corporate Housing {city} AZ | Furnished Monthly',
    metaDescription:
      'Furnished corporate housing in {city}, AZ for relocations and assignments. Utilities included, flexible monthly terms, fast move-in. Canyon Apartments.',
    relatedGuides: [
      'moving-to-phoenix-temporary-housing',
      'furnished-vs-unfurnished-short-term-phoenix',
    ],
  },
];

export const getHousingType = (slug: string) =>
  HOUSING_TYPES.find((t) => t.slug === slug);
