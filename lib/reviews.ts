/**
 * AggregateRating scaffold. Set enabled = true and fill in real values once
 * Google reviews are live via Paige. The schema block in layout.tsx reads this
 * and omits the rating entirely until enabled — avoids a fake-review penalty.
 */
export const REVIEWS = {
  enabled: false,
  ratingValue: 4.9,
  reviewCount: 0,
  bestRating: 5,
  worstRating: 1,
} as const;
