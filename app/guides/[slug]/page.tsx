import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import BookCallButton from '@/components/BookCallButton';
import { GUIDES, getGuide } from '@/lib/guides';
import { SITE } from '@/lib/site';

export const dynamicParams = false;

type Params = { slug: string };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${SITE.baseUrl}/guides/${guide.slug}#article`,
        headline: guide.title,
        description: guide.metaDescription,
        datePublished: guide.publishedDate,
        dateModified: guide.publishedDate,
        author: { '@type': 'Organization', name: SITE.name, url: SITE.baseUrl },
        publisher: { '@type': 'Organization', name: SITE.name, url: SITE.baseUrl },
        url: `${SITE.baseUrl}/guides/${guide.slug}`,
        inLanguage: 'en-US',
        about: { '@type': 'Thing', name: 'Furnished Apartments Phoenix AZ' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE.baseUrl}/guides` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: `${SITE.baseUrl}/guides/${guide.slug}` },
        ],
      },
    ],
  };

  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-stone-900 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-500 transition-colors duration-200">Canyon Apartments</Link>
            <ChevronRight size={12} />
            <Link href="/guides" className="hover:text-brand-500 transition-colors duration-200">Guides</Link>
            <ChevronRight size={12} />
            <span className="text-stone-400">{guide.category}</span>
          </nav>
          <Reveal>
            <p className="text-brand-500 font-mono text-sm tracking-[0.3em] uppercase mb-4">{guide.category}</p>
            <h1 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white leading-tight mb-6">
              {guide.title}
            </h1>
            <p className="text-stone-300 text-base leading-relaxed max-w-2xl">{guide.intro}</p>
          </Reveal>
        </div>
      </section>

      {/* Article body */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          {guide.sections.map((section, i) => (
            <Reveal key={i} className="mb-12 last:mb-0">
              {section.heading && (
                <h2 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-wide text-stone-900 mb-5">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((p, j) => (
                <p key={j} className="text-stone-600 text-base leading-relaxed mb-4 last:mb-0">
                  {p}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Related links */}
      {guide.relatedLinks.length > 0 && (
        <section className="px-6 py-16 bg-stone-50 border-t border-stone-100">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <p className="text-brand-600 font-mono text-sm tracking-[0.3em] uppercase mb-5">Related Pages</p>
              <div className="flex flex-wrap gap-3">
                {guide.relatedLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                ))}
                <Link href="/guides" className="px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:border-brand-500 hover:text-brand-600 transition-colors duration-200">
                  ← All Guides
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-20 bg-brand-800">
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase tracking-wide text-white">
            Ready to Find a Unit?
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">
            Book a free 15-minute call. We&apos;ll walk through availability across Phoenix, Tempe, Mesa, Gilbert, and Chandler — and can usually have you in within the same week.
          </p>
          <div className="flex justify-center">
            <BookCallButton
              label="Book a Free 15-Min Call"
              className="btn-shine inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-brand-800 uppercase tracking-wide hover:bg-brand-50 transition-colors duration-200"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
