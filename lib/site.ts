/**
 * Site-wide constants + brand facts for canyon-apts.com.
 * Single source of truth for NAP (name/address/phone), used everywhere so it
 * stays identical to the Google Business Profile (Paige) listing.
 */
export const SITE = {
  name: 'Canyon Apartments',
  baseUrl: 'https://canyon-apts.com',
  phone: '(623) 230-7020',
  phoneHref: 'tel:+16232307020',
  email: 'info@canyon-markets.com',
  serviceArea: 'Phoenix Metro Area, AZ',
  foundedYear: 2017,
  startingWeeklyRate: 495,
} as const;

/** Defensible credibility figures (see StatBar). */
export const STATS = {
  guestsHosted: 4000, // conservative; ~4–5k bookings since 2017
  yearsInBusiness: new Date().getFullYear() - SITE.foundedYear,
  citiesServed: 5, // available now (Scottsdale coming soon)
} as const;

/**
 * The real origin story — authentic, original content for trust copy + the
 * traveling-nurse pages. Keep public phrasing professional.
 */
export const BRAND_STORY = {
  short:
    'Canyon Apartments started as an Airbnb operation in 2017. When the 2020 shutdown canceled our entire March–April season overnight, we pulled every listing and rebuilt around direct, flexible weekly and monthly rentals — so our residents get stability and we control the experience end to end.',
  travelNurseHook:
    'Traveling nurses were the heart of our business through 2020 and the reason we moved to direct furnished rentals. We know what a nurse on assignment needs: a real, move-in-ready apartment near the hospital, on terms that flex with the contract.',
} as const;
