import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, Phone, MapPin } from 'lucide-react';
import BookCallButton from '@/components/BookCallButton';
import Reveal from '@/components/Reveal';
import { SITE } from '@/lib/site';
import { HOUSING_TYPES, getHousingType } from '@/lib/housingTypes';
import { SPOKE_CITIES, getCity } from '@/lib/cities';
import { hospitalsForCity } from '@/lib/hospitals';

export const dynamicParams = false;

type Params = { housingType: string; city: string };

export function generateStaticParams() {
  return HOUSING_TYPES.flatMap((t) =>
    SPOKE_CITIES.map((c) => ({ housingType: t.slug, city: c.slug })),
  );
}

const fill = (s: string, city: string) => s.replaceAll('{city}', city);

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { housingType, city } = await params;
  const type = getHousingType(housingType);
  const c = getCity(city);
  if (!type || !c) return {};
  return {
    title: fill(type.metaTitle, c.name),
    description: fill(type.metaDescription, c.name),
    alternates: { canonical: `/${type.slug}/${c.slug}` },
  };
}

export default async function SpokePage({ params }: { params: Promise<Params> }) {
  const { housingType, city } = await params;
  const type = getHousingType(housingType);
  const c = getCity(city);
  if (!type || !c) notFound();

  const h1 = fill(type.h1, c.name);
  const intro = fill(type.intro, c.name);
  const benefits = type.benefits.map((b) => fill(b, c.name));
  const isNurse = type.slug === 'traveling-nurse-housing';
  const hospitals = hospitalsForCity(c.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `${type.name} in ${c.name}, AZ`,
        provider: { '@type': 'LocalBusiness', name: SITE.name, telephone: SITE.phone },
        areaServed: { '@type': 'City', name: `${c.name}, Arizona` },
        description: intro,
        url: `${SITE.baseUrl}/${type.slug}/${c.slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl },
          { '@type': 'ListItem', position: 2, name: type.name, item: `${SITE.baseUrl}${type.phoenixHub}` },
          { '@type': 'ListItem', position: 3, name: `${type.name} ${c.name}`, item: `${SITE.baseUrl}/${type.slug}/${c.slug}` },
        ],
      },
    ],
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-stone-900 px-6 py-24">
        <Reveal className="max-w-4xl mx-auto text-center">
          <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">{c.name}, AZ · Phoenix Metro</p>
          <h1 className="font-display font-bold text-3xl sm:text-5xl uppercase tracking-wide text-white leading-tight mb-6">
            {h1}
          </h1>
          <p className="text-stone-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6">{intro}</p>
          {c.comingSoon && (
            <p className="inline-block rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-sm px-4 py-1.5 mb-6">
              Units in {c.name} are coming soon — ask about upcoming availability.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <BookCallButton
              label="Check Availability"
              className="btn-shine inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:bg-brand-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/40"
            />
            <a href={SITE.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-lg border border-stone-600 px-8 py-4 text-sm font-semibold text-white uppercase tracking-wide hover:border-brand-500 transition-colors duration-200">
              <Phone size={16} strokeWidth={1.5} />{SITE.phone}
            </a>
          </div>
        </Reveal>
      </section>

      {/* Benefits */}
      <section className="px-6 py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-12">
              {type.name} in {c.name} — What You Get
            </h2>
          </Reveal>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle size={20} className="flex-shrink-0 mt-0.5 text-brand-600" strokeWidth={1.5} />
                <span className="text-stone-700 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Local context */}
      <section className="px-6 py-20 bg-white">
        <Reveal className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 mb-4 inline-flex items-center gap-3">
            <MapPin size={28} strokeWidth={1.5} className="text-brand-600" /> Living in {c.name}
          </h2>
          <p className="text-stone-600 text-base leading-relaxed max-w-2xl mx-auto">{c.blurb}</p>
        </Reveal>
      </section>

      {/* Hospitals (traveling-nurse only) */}
      {isNurse && hospitals.length > 0 && (
        <section className="px-6 py-20 bg-stone-50">
          <div className="max-w-4xl mx-auto">
            <Reveal>
              <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-stone-900 text-center mb-4">
                Hospitals Near {c.name}
              </h2>
              <p className="text-stone-600 text-sm text-center max-w-2xl mx-auto mb-10 leading-relaxed">
                We place travel nurses in furnished units near {c.name}-area medical centers. Call and we&apos;ll match you to the unit closest to your assignment. (Proximity only — no hospital affiliation.)
              </p>
            </Reveal>
            <div className="flex flex-wrap gap-3 justify-center">
              {hospitals.map((h) => (
                <span key={h.name} className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-700 text-sm">{h.name}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Internal links: sibling types in this city + this type in other cities */}
      <section className="px-6 py-12 bg-white border-t border-stone-100">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {HOUSING_TYPES.filter((t) => t.slug !== type.slug).map((t) => (
              <Link key={t.slug} href={`/${t.slug}/${c.slug}`}
                className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
                {t.shortName} in {c.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={type.phoenixHub} className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
              {type.name} Phoenix
            </Link>
            {SPOKE_CITIES.filter((o) => o.slug !== c.slug).map((o) => (
              <Link key={o.slug} href={`/${type.slug}/${o.slug}`}
                className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
                {type.shortName} in {o.name}
              </Link>
            ))}
            <Link href="/" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">← Canyon Apartments</Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-brand-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white">
            Looking for {type.name} in {c.name}?
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">Book a free 15-minute call. We&apos;ll walk through availability and often have you moved in the same week.</p>
          <div className="flex justify-center">
            <BookCallButton label="Book a Free 15-Min Call" className="btn-shine inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-brand-800 uppercase tracking-wide hover:bg-brand-50 transition-colors duration-200" />
          </div>
          <a href={SITE.phoneHref} className="inline-flex items-center gap-2 justify-center text-sm text-brand-200 hover:text-white transition-colors"><Phone size={14} strokeWidth={1.5} />{SITE.phone}</a>
        </div>
      </section>
    </div>
  );
}
