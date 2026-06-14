import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Canyon Apartments · Phoenix Metro, AZ"
      title="Phoenix Furnished Housing Guides"
      subtitle="Travel Nurses · No Credit Check · Relocations · Short-Term Stays"
    />,
    { width: 1200, height: 630 },
  );
}
