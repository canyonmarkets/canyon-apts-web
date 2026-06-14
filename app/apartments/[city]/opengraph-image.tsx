import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';
import { SPOKE_CITIES, getCity } from '@/lib/cities';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return SPOKE_CITIES.map((c) => ({ city: c.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const c = getCity(city);

  return new ImageResponse(
    <OgCard
      eyebrow="Canyon Apartments · Phoenix Metro, AZ"
      title={`Furnished Apartments in ${c?.name ?? 'Phoenix'}, AZ`}
      subtitle="Weekly & Monthly · Utilities Included · No Credit Check"
    />,
    { width: 1200, height: 630 },
  );
}
