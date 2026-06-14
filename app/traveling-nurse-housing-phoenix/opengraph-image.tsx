import { ImageResponse } from 'next/og';
import { OgCard } from '@/lib/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Canyon Apartments · Phoenix, AZ"
      title="Traveling Nurse Housing in Phoenix, AZ"
      subtitle="Near Major Hospitals · Weekly & Monthly · No Credit Check"
    />,
    { width: 1200, height: 630 },
  );
}
