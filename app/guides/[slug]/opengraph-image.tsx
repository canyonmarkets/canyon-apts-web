import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';
import { GUIDES, getGuide } from '@/lib/guides';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getGuide(slug);

  return new ImageResponse(
    <OgCard
      eyebrow={`Canyon Apartments Guide · ${guide?.category ?? 'Housing Guides'}`}
      title={guide?.title ?? 'Phoenix Housing Guide'}
    />,
    { width: 1200, height: 630 },
  );
}
