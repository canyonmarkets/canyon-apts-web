import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Canyon Apartments · Phoenix, AZ"
      title="No-Credit-Check Apartments in Phoenix, AZ"
      subtitle="No Hard Pull · Evictions OK · Furnished From $495/wk"
    />,
    { width: 1200, height: 630 },
  );
}
