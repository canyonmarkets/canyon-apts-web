import { Suspense } from 'react';
import type { Metadata } from 'next';
import BookFlow from './BookFlow';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BookPage() {
  return (
    <Suspense>
      <BookFlow />
    </Suspense>
  );
}
