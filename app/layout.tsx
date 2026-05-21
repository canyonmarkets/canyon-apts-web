import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

/* ─── Structured Data ──────────────────────────────────────────────────── */

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    /* ── Primary Business Entity ── */
    {
      '@type': 'ApartmentComplex',
      '@id': 'https://canyon-apts.com/#business',
      name: 'Canyon Apts',
      alternateName: 'Canyon Apartments Phoenix',
      description:
        'Canyon Apts offers fully furnished short-term and extended-stay apartment rentals across the Phoenix metro area. No credit check, no rental history required. Weekly and monthly rates starting at $495/week. Utilities, parking, and furnishings all included.',
      url: 'https://canyon-apts.com',
      telephone: '+16029356830',
      email: 'info@canyon-markets.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://canyon-apts.com/logo.png',
        width: 300,
        height: 100,
      },
      image: [
        'https://canyon-apts.com/apt-01.webp',
        'https://canyon-apts.com/apt-02.webp',
        'https://canyon-apts.com/apt-03.webp',
        'https://canyon-apts.com/apt-04.webp',
        'https://canyon-apts.com/apt-05.webp',
      ],
      priceRange: 'From $495/week',
      currenciesAccepted: 'USD',
      paymentAccepted: 'Cash, Credit Card, Bank Transfer',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Phoenix',
        addressRegion: 'AZ',
        postalCode: '85001',
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 33.4484,
        longitude: -112.074,
      },
      areaServed: [
        { '@type': 'City', name: 'Phoenix',  sameAs: 'https://www.wikidata.org/wiki/Q16556'  },
        { '@type': 'City', name: 'Tempe',    sameAs: 'https://www.wikidata.org/wiki/Q498817' },
        { '@type': 'City', name: 'Mesa',     sameAs: 'https://www.wikidata.org/wiki/Q79860'  },
        { '@type': 'City', name: 'Gilbert',  sameAs: 'https://www.wikidata.org/wiki/Q488727' },
        { '@type': 'City', name: 'Chandler', sameAs: 'https://www.wikidata.org/wiki/Q498960' },
      ],
      amenityFeature: [
        { '@type': 'LocationFeatureSpecification', name: 'Fully Furnished',            value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Utilities Included',         value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Free Parking',               value: true },
        { '@type': 'LocationFeatureSpecification', name: 'In-Unit Washer and Dryer',   value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Fully Equipped Kitchen',     value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Gated Community',            value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Pool and Fitness Center',    value: true },
        { '@type': 'LocationFeatureSpecification', name: 'No Credit Check Required',   value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Week-to-Week Lease',         value: true },
        { '@type': 'LocationFeatureSpecification', name: 'Pet Friendly Options',       value: true },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Furnished Apartment Rental Plans',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Weekly Furnished Apartment Rental',
            description:
              'Fully furnished apartment rented on a week-to-week basis. All utilities included. No credit check. Move in this week.',
            price: '495',
            priceCurrency: 'USD',
            unitCode: 'WEE',
            availability: 'https://schema.org/InStock',
            seller: { '@id': 'https://canyon-apts.com/#business' },
          },
          {
            '@type': 'Offer',
            name: 'Monthly Furnished Apartment Rental',
            description:
              'Fully furnished apartment on a flexible month-to-month basis. All utilities included. No credit check or lease required.',
            price: '1980',
            priceCurrency: 'USD',
            unitCode: 'MON',
            availability: 'https://schema.org/InStock',
            seller: { '@id': 'https://canyon-apts.com/#business' },
          },
        ],
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
          opens: '08:00',
          closes: '20:00',
        },
      ],
      knowsAbout: [
        'Furnished Apartment Rentals',
        'Short-Term Housing Phoenix',
        'Corporate Housing Phoenix AZ',
        'Traveling Nurse Housing',
        'No Credit Check Apartments',
        'Weekly Apartment Rentals',
        'Extended Stay Apartments',
        'Felony Friendly Housing',
        'Move-In Ready Apartments',
        'Utilities Included Rentals',
      ],
    },

    /* ── FAQ Rich Result ── */
    {
      '@type': 'FAQPage',
      '@id': 'https://canyon-apts.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Do you really not run a credit check?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Correct — we do not run credit checks of any kind. No hard pull, no soft pull. Past evictions, bankruptcies, or low credit scores will not disqualify you. We look at your ability to pay the weekly or monthly rate going forward.',
          },
        },
        {
          '@type': 'Question',
          name: 'How much does it cost and what is included?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Rates start at $495 per week for studio units. The rate includes the furnished apartment, all utilities (water, electric, gas), and parking. There are no hidden fees or add-ons — what we quote is what you pay.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long can I stay?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'As long as you need. We offer week-to-week and month-to-month arrangements. There is no minimum or maximum stay requirement. Some residents stay a week during a home renovation; others have been with us for over a year.',
          },
        },
        {
          '@type': 'Question',
          name: 'How quickly can I move in?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Many residents are able to move in the same day or within 2 to 3 days of their first call. Once you book a call, we walk through availability and can usually get paperwork done and keys handed over very quickly.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does fully furnished mean exactly?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Every unit comes with a bed and bedding, living room furniture, a fully equipped kitchen (dishes, pots, pans, utensils), towels, and at least one TV. You literally just need your clothes and personal items.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you accept applicants with felony records?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We consider non-violent felony records on a case-by-case basis. The best thing to do is book a 15-minute call and have an honest conversation with us. We work with a wide range of situations that traditional landlords turn away. The only records we cannot work with are violent crimes and sexual offenses.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are pets allowed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Pet policies vary by property. Some of our communities are pet-friendly. Mention this on your call and we will match you with a pet-friendly unit if available.',
          },
        },
        {
          '@type': 'Question',
          name: 'What areas of Phoenix do you serve?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We currently have furnished apartments available in Phoenix, Tempe, Mesa, Gilbert, and Chandler. We are actively adding new locations — ask about upcoming availability when you call.',
          },
        },
      ],
    },

    /* ── Website Entity ── */
    {
      '@type': 'WebSite',
      '@id': 'https://canyon-apts.com/#website',
      url: 'https://canyon-apts.com',
      name: 'Canyon Apts',
      description:
        'Furnished short-term apartment rentals across the Phoenix metro. No credit check required. Starting at $495/week.',
      publisher: { '@id': 'https://canyon-apts.com/#business' },
      inLanguage: 'en-US',
    },
  ],
};

/* ─── Page Metadata ────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: 'No Credit Check Furnished Apartments Phoenix | Canyon Apts | From $495/Week',
    template: '%s | Canyon Apts',
  },
  description:
    'Fully furnished weekly & monthly apartments in Phoenix, Tempe, Mesa, Gilbert, and Chandler — no credit check, no rental history required. Utilities included. Move in today. Starting at $495/week.',
  keywords: [
    // High-intent primary
    'furnished apartments Phoenix no credit check',
    'no credit check apartments Phoenix AZ',
    'short term furnished rentals Phoenix',
    'weekly apartments Phoenix AZ',
    'monthly furnished apartments Phoenix',
    // Situation-based
    'traveling nurse housing Phoenix AZ',
    'corporate housing Phoenix no credit check',
    'eviction friendly apartments Phoenix',
    'felony friendly apartments Phoenix AZ',
    'apartments that accept felonies Phoenix',
    'apartments bad credit Phoenix AZ',
    // Feature-based
    'utilities included apartments Phoenix',
    'move in ready apartments Phoenix',
    'furnished apartments utilities included Phoenix',
    'week to week apartment rentals Phoenix',
    'extended stay apartments Phoenix AZ',
    // City variations
    'furnished apartments Tempe AZ',
    'furnished apartments Mesa AZ',
    'furnished apartments Chandler AZ',
    'furnished apartments Gilbert AZ',
    'short term rentals Tempe Mesa Chandler',
    // Long tail
    'furnished apartment rent by week Phoenix',
    'no lease apartments Phoenix AZ',
    'all inclusive furnished apartment Phoenix',
  ],
  authors: [{ name: 'Canyon Apts', url: 'https://canyon-apts.com' }],
  metadataBase: new URL('https://canyon-apts.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://canyon-apts.com',
    siteName: 'Canyon Apts',
    title: 'No Credit Check Furnished Apartments Phoenix | Canyon Apts',
    description:
      'Fully furnished apartments available week-to-week or month-to-month across the Phoenix metro. No credit check. Utilities included. Move in today — starting at $495/week.',
    images: [
      {
        url: '/apt-01.webp',
        width: 1200,
        height: 630,
        alt: 'Canyon Apts — Fully Furnished Apartment Phoenix AZ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'No Credit Check Furnished Apartments Phoenix | Canyon Apts',
    description:
      'Weekly & monthly furnished apartments in Phoenix metro. No credit check. Utilities included. Starting at $495/week.',
    images: ['/apt-01.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  other: {
    // Geographic signals for local SEO
    'geo.region':    'US-AZ',
    'geo.placename': 'Phoenix, Arizona',
    'geo.position':  '33.4484;-112.0740',
    'ICBM':          '33.4484, -112.0740',
  },
};

/* ─── Root Layout ──────────────────────────────────────────────────────── */

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
