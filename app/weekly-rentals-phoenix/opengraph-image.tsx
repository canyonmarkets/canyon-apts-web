import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Canyon Apartments · Phoenix, AZ"
      title="Weekly Apartment Rentals in Phoenix, AZ"
      subtitle="From $495/wk · Utilities Included · No Long-Term Lease"
    />,
    { width: 1200, height: 630 },
  );
}
