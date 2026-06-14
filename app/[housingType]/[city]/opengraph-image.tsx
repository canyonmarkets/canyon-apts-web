import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';
import { HOUSING_TYPES, getHousingType } from '@/lib/housingTypes';
import { SPOKE_CITIES, getCity } from '@/lib/cities';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return HOUSING_TYPES.flatMap((t) =>
    SPOKE_CITIES.map((c) => ({ housingType: t.slug, city: c.slug })),
  );
}

export default async function Image({
  params,
}: {
  params: Promise<{ housingType: string; city: string }>;
}) {
  const { housingType, city } = await params;
  const type = getHousingType(housingType);
  const c = getCity(city);

  return new ImageResponse(
    <OgCard
      eyebrow={`Canyon Apartments · ${c?.name ?? 'Phoenix Metro'}, AZ`}
      title={type ? `${type.name} in ${c?.name ?? 'Phoenix'}, AZ` : 'Furnished Apartments in Phoenix Metro'}
    />,
    { width: 1200, height: 630 },
  );
}
