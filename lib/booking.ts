export const LEAD_SOURCES = ['facebook', 'craigslist', 'organic', 'other'] as const;
export const PIPELINE_STAGES = [
  'new', 'called', 'photos_sent', 'following_up', 'toured_applied', 'leased', 'lost',
] as const;
export const BOOKING_STATUSES = ['scheduled', 'completed', 'no_show', 'canceled'] as const;

export type LeadSource = typeof LEAD_SOURCES[number];
export type PipelineStage = typeof PIPELINE_STAGES[number];
export type BookingStatus = typeof BOOKING_STATUSES[number];

export const PIPELINE_LABELS: Record<PipelineStage, string> = {
  new: 'New',
  called: 'Called',
  photos_sent: 'Photos Sent',
  following_up: 'Following Up',
  toured_applied: 'Toured / Applied',
  leased: 'Leased',
  lost: 'Lost',
};

export const SCREENING_ITEMS = [
  {
    id: 'weekly',
    heading: 'This is a weekly rental.',
    text: 'I can stay as many weeks as I need, but the lease renews each week. This is NOT a month-to-month or annual lease.',
  },
  {
    id: 'price',
    heading: 'The $495 rate is per week — not per month.',
    text: 'The starting rate of $495 is charged every week. A 4-week stay would be approximately $1,980, not $495.',
  },
  {
    id: 'credit',
    heading: 'No credit check is required.',
    text: 'Past evictions, low credit scores, non-traditional income, and most background issues do not disqualify me.',
  },
  {
    id: 'faq',
    heading: 'I have read the Frequently Asked Questions.',
    text: 'I have reviewed the FAQ section on this website and am ready to speak with someone about my specific situation.',
  },
] as const;
