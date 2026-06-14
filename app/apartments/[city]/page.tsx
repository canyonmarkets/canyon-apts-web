import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, ChevronDown } from 'lucide-react';
import BookCallButton from '@/components/BookCallButton';
import Reveal from '@/components/Reveal';
import { SITE } from '@/lib/site';
import { HOUSING_TYPES } from '@/lib/housingTypes';
import { SPOKE_CITIES, getCity } from '@/lib/cities';
import { hospitalsForCity } from '@/lib/hospitals';
import { getCityFaqs } from '@/lib/faqs';

export const dynamicParams = false;

type Params = { city: string };

export function generateStaticParams() {
  return SPOKE_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return {};
  return {
    title: `Furnished Apartments ${c.name} AZ | Weekly & Monthly Housing`,
    description: `Furnished apartments for rent in ${c.name}, AZ — no credit check, weekly & monthly terms, utilities included. Travel nurse housing, corporate housing, weekly rentals. Canyon Apartments.`,
    alternates: { canonical: `/apartments/${c.slug}` },
  };
}

export default async function CityHubPage({ params }: { params: Promise<Params> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();

  const hospitals = hospitalsForCity(c.slug);
  const faqs = getCityFaqs(c.name);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: `Furnished Apartments & Short-Term Housing in ${c.name}, AZ`,
        description: `Canyon Apartments offers fully furnished apartments in ${c.name}, AZ — no credit check, weekly & monthly terms, utilities included.`,
        url: `${SITE.baseUrl}/apartments/${c.slug}`,
        about: { '@type': 'City', name: `${c.name}, Arizona` },
        hasPart: HOUSING_TYPES.map((t) => ({
          '@type': 'WebPage',
          name: `${t.name} in ${c.name}, AZ`,
          url: `${SITE.baseUrl}/${t.slug}/${c.slug}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl },
          { '@type': 'ListItem', position: 2, name: `${c.name} Furnished Apartments`, item: `${SITE.baseUrl}/apartments/${c.slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-stone-900 px-6 py-24">
        <Reveal className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">{c.name}, AZ · East Valley</p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
            Furnished Apartments in {c.name}, AZ
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            Canyon Apartments rents fully furnished apartments in {c.name} on flexible weekly and monthly terms. No credit check, utilities included, move-in ready from $495/week.
          </p>
          {c.comingSoon && (
            <p className="inline-block rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-sm px-4 py-1.5 mb-6">
              {c.name} units are coming soon — ask about upcoming availability.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <BookCallButton
              label="Check Availability"
              className="btn-shine inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/40"
            />
          </div>
        </Reveal>
      </section>

      {/* Housing type cards */}
      <section className="px-6 py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3">Housing Options</p>
            <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900">
              What We Offer in {c.name}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {HOUSING_TYPES.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}/${c.slug}`}
                className="group flex flex-col gap-3 p-6 rounded-xl border-2 border-stone-200 bg-white hover:border-brand-500 transition-colors duration-200"
              >
                <h3 className="font-display font-bold text-lg uppercase tracking-wide text-stone-900 group-hover:text-brand-600 transition-colors duration-200">
                  {t.name}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed flex-1">{t.intro.replaceAll('{city}', c.name)}</p>
                <span className="text-brand-600 text-xs font-semibold uppercase tracking-wide">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Local context */}
      <section className="px-6 py-20 bg-white">
        <Reveal className="max-w-4xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 mb-4 inline-flex items-center gap-3">
            <MapPin size={28} strokeWidth={1.5} className="text-brand-600" /> About {c.name}
          </h2>
          <p className="text-stone-600 text-base leading-relaxed mb-6">{c.blurb}</p>
          {c.anchors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {c.anchors.map((anchor) => (
                <span key={anchor} className="px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 text-stone-600 text-xs">{anchor}</span>
              ))}
            </div>
          )}
        </Reveal>
      </section>

      {/* Hospitals */}
      {hospitals.length > 0 && (
        <section className="px-6 py-20 bg-stone-50">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-4">
                Hospitals Near {c.name}
              </h2>
              <p className="text-stone-600 text-sm text-center max-w-2xl mx-auto mb-10 leading-relaxed">
                We place travel nurses and healthcare workers in furnished units near {c.name}-area medical centers. (Proximity only — no hospital affiliation.)
              </p>
            </Reveal>
            <div className="flex flex-wrap gap-3 justify-center">
              {hospitals.map((h) => (
                <span key={h.name} className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-700 text-sm">{h.name}</span>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href={`/traveling-nurse-housing/${c.slug}`} className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors duration-200">
                Travel nurse housing in {c.name} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-3">FAQ</p>
            <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900">
              Common Questions
            </h2>
          </Reveal>
          <div className="flex flex-col gap-3">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group rounded-xl border border-stone-200 bg-stone-50 overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-stone-100 transition-colors duration-200">
                  <span className="font-display font-bold text-base uppercase tracking-wide text-stone-900 leading-snug">{q}</span>
                  <ChevronDown size={18} strokeWidth={2} className="flex-shrink-0 text-brand-600 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="px-6 pb-6 text-stone-600 text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Internal links */}
      <section className="px-6 py-12 bg-stone-50 border-t border-stone-100">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-stone-500 text-center mb-4">Housing Types in {c.name}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {HOUSING_TYPES.map((t) => (
                <Link key={t.slug} href={`/${t.slug}/${c.slug}`}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
                  {t.shortName}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-stone-500 text-center mb-4">Other Cities</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {SPOKE_CITIES.filter((o) => o.slug !== c.slug).map((o) => (
                <Link key={o.slug} href={`/apartments/${o.slug}`}
                  className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
                  {o.name}
                </Link>
              ))}
              <Link href="/" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
                ← Canyon Apartments
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-brand-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white">
            Looking for Housing in {c.name}?
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">Book a free 15-minute call. We&apos;ll walk through what&apos;s available in {c.name} and can often have you moved in the same week.</p>
          <div className="flex justify-center">
            <BookCallButton label="Book a Free 15-Min Call" className="btn-shine inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-brand-800 uppercase tracking-wide hover:bg-brand-50 transition-colors duration-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
