/**
 * Major Phoenix-metro hospitals, grouped by city, for the high-intent
 * traveling-nurse pages ("furnished housing near {hospital}"). Hospitals are
 * referenced as proximity context only — NOT as affiliations. Each spoke page
 * can surface the hospitals tagged to its city (plus metro-wide majors).
 */
export type Hospital = {
  name: string;
  /** City slug it sits in / nearest to (matches lib/cities.ts). */
  city: string;
};

export const HOSPITALS: Hospital[] = [
  // Phoenix
  { name: 'Banner University Medical Center Phoenix', city: 'phoenix' },
  { name: 'Mayo Clinic Hospital Phoenix', city: 'phoenix' },
  { name: "Dignity Health St. Joseph's Hospital", city: 'phoenix' },
  { name: "Phoenix Children's Hospital", city: 'phoenix' },
  { name: 'Valleywise Health Medical Center', city: 'phoenix' },
  { name: 'Phoenix VA Health Care System', city: 'phoenix' },
  // Mesa
  { name: 'Banner Desert Medical Center', city: 'mesa' },
  { name: 'Banner Baywood Medical Center', city: 'mesa' },
  { name: 'Mountain Vista Medical Center', city: 'mesa' },
  // Gilbert
  { name: 'Mercy Gilbert Medical Center', city: 'gilbert' },
  { name: 'Banner Gateway Medical Center', city: 'gilbert' },
  // Chandler
  { name: 'Chandler Regional Medical Center', city: 'chandler' },
  // Tempe
  { name: 'Tempe St. Luke\'s Hospital', city: 'tempe' },
  // (Scottsdale hospitals removed with the city on 2026-07-04 — restore when Scottsdale returns.)
];

export const hospitalsForCity = (citySlug: string) =>
  HOSPITALS.filter((h) => h.city === citySlug);
