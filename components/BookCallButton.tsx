'use client';

import { useRouter } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

type Props = {
  label?: string;
  className?: string;
};

export default function BookCallButton({
  label = 'Book a Free 15-Min Call',
  className = '',
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    trackEvent('booking_modal_open');
    router.push('/book');
  };

  return (
    <button onClick={handleClick} className={className}>
      {label}
    </button>
  );
}
