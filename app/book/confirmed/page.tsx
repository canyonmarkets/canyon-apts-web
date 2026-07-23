import { Suspense } from 'react';
import type { Metadata } from 'next';
import ConfirmedContent from './ConfirmedContent';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BookConfirmedPage() {
  return (
    <Suspense>
      <ConfirmedContent />
    </Suspense>
  );
}
