import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Canyon Apts',
  description:
    'Canyon Apts offers fully furnished short-term apartment rentals in the Phoenix metro area. No credit check, no rental history required. Weekly and monthly rates starting at $495/week.',
  url: 'https://canyon-apts.com',
  telephone: '+16029356830',
  email: 'info@canyon-markets.com',
  logo: 'https://canyon-apts.com/logo.png',
  priceRange: 'From $495/week',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Phoenix',
    addressRegion: 'AZ',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'City', name: 'Phoenix' },
    { '@type': 'City', name: 'Tempe' },
    { '@type': 'City', name: 'Mesa' },
    { '@type': 'City', name: 'Gilbert' },
    { '@type': 'City', name: 'Chandler' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'Canyon Apts | Furnished Short-Term Rentals Phoenix AZ — No Credit Check',
    template: '%s | Canyon Apts',
  },
  description:
    'Fully furnished weekly and monthly apartment rentals in Phoenix, Tempe, Mesa, Gilbert, and Chandler. No credit check, no rental history required. Utilities included. Starting at $495/week.',
  keywords: [
    'furnished apartments Phoenix no credit check',
    'short term rentals Phoenix AZ',
    'weekly apartments Phoenix',
    'monthly furnished rentals Phoenix',
    'no credit check apartments Phoenix',
    'furnished apartments Tempe Mesa Chandler',
    'corporate housing Phoenix',
    'traveling nurse housing Phoenix',
    'evictions ok apartment Phoenix',
    'furnished weekly rental Arizona',
  ],
  authors: [{ name: 'Canyon Apts', url: 'https://canyon-apts.com' }],
  metadataBase: new URL('https://canyon-apts.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://canyon-apts.com',
    siteName: 'Canyon Apts',
    title: 'Canyon Apts | Furnished Short-Term Rentals Phoenix AZ — No Credit Check',
    description:
      'Fully furnished apartments available weekly or monthly across the Phoenix metro. No credit check. Utilities included. Move in this week.',
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Canyon Apts — Phoenix Furnished Rentals' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canyon Apts | Furnished Short-Term Rentals Phoenix AZ — No Credit Check',
    description: 'Weekly and monthly furnished apartments in Phoenix metro. No credit check. Starting at $495/week.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
