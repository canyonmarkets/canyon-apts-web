import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Canyon Apartments · Phoenix Metro, AZ"
      title="Furnished Apartments — No Credit Check"
      subtitle="From $495/wk  ·  Utilities Included  ·  Move In This Week"
    />,
    { width: 1200, height: 630 },
  );
}
