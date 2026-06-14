import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Canyon Apartments · Phoenix, AZ"
      title="Corporate Housing in Phoenix, AZ"
      subtitle="Furnished · Monthly Terms · Direct Booking · Fast Setup"
    />,
    { width: 1200, height: 630 },
  );
}
