export type FAQ = { q: string; a: string };

const BASE_FAQS: FAQ[] = [
  {
    q: 'Do you really not run a credit check?',
    a: 'Correct — we do not run credit checks of any kind. No hard pull, no soft pull. Past evictions, bankruptcies, or low credit scores will not disqualify you. We look at your ability to pay the weekly or monthly rate going forward.',
  },
  {
    q: 'How much does it cost and what is included?',
    a: 'Rates start at $495 per week. The rate includes the furnished apartment, all utilities (water, electric, gas), and parking. No hidden fees — what we quote is what you pay.',
  },
  {
    q: 'How quickly can I move in?',
    a: 'Many residents move in within 2 to 3 days of their first call. Once you book a call, we walk through availability and can usually get paperwork done and keys handed over very quickly.',
  },
  {
    q: 'How long can I stay?',
    a: 'As long as you need. We offer week-to-week and month-to-month arrangements with no minimum or maximum stay requirement. Some residents stay one week; others have been with us for over a year.',
  },
];

const TYPE_FAQ: Record<string, FAQ> = {
  'furnished-apartments': {
    q: 'What exactly is included in a fully furnished apartment?',
    a: 'Every unit comes with a bed and all bedding, living room furniture, a fully equipped kitchen (dishes, pots, pans, utensils), towels, and at least one TV. You just need to bring your clothes and personal items.',
  },
  'no-credit-check-apartments': {
    q: 'What if I have an eviction or very bad credit?',
    a: 'Evictions and bad credit do not disqualify you. We do not run any credit check. We also consider non-violent felony records on a case-by-case basis. The best thing to do is book a call and have a direct conversation with us.',
  },
  'weekly-rentals': {
    q: 'Is there a minimum number of weeks I have to stay?',
    a: 'No minimum or maximum. You can stay one week or stay for months — the lease simply renews week-to-week as long as you need it. Give us notice when you are ready to leave and we will handle the rest.',
  },
  'traveling-nurse-housing': {
    q: 'Can you match me to housing near my assignment hospital?',
    a: 'Yes — tell us your hospital assignment on the call and we will match you to the closest available unit. We have placed nurses near Banner, Dignity Health, HonorHealth, Mayo Clinic, and other Phoenix-area medical centers.',
  },
  'corporate-housing': {
    q: 'Do you work with corporate accounts or direct billing?',
    a: 'Yes. We work with employers who need to house employees on assignment or relocation. Bring it up on the call and we can walk through billing arrangements, multi-unit needs, and flexible lease terms.',
  },
};

export function getSpokesFaqs(typeSlug: string, cityName: string): FAQ[] {
  const typeFaq = TYPE_FAQ[typeSlug];
  const cityFaq: FAQ = {
    q: `Do you have units available in ${cityName} right now?`,
    a: `Availability changes frequently. The best way to check is to book a quick 15-minute call — we will tell you exactly what is open in ${cityName} and can often get you moved in within a few days.`,
  };
  return [...BASE_FAQS, ...(typeFaq ? [typeFaq] : []), cityFaq];
}

export function getCityFaqs(cityName: string): FAQ[] {
  return [
    ...BASE_FAQS,
    {
      q: `What housing types do you offer in ${cityName}?`,
      a: `In ${cityName} we offer fully furnished apartments across five categories: standard furnished apartments, no-credit-check apartments, weekly rentals, traveling nurse housing, and corporate housing. All include utilities, parking, and flexible weekly or monthly lease terms.`,
    },
    {
      q: `Do you have units available in ${cityName} right now?`,
      a: `Availability changes week to week. Book a quick 15-minute call and we will tell you exactly what is open in ${cityName}. Most residents are moved in within 2 to 3 days of that first call.`,
    },
  ];
}
