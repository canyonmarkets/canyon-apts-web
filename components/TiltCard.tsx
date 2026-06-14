'use client';

import { useRef, type ReactNode } from 'react';

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
  /** Spotlight tint (rgba). */
  glow?: string;
};

/**
 * A card that tilts in 3D toward the cursor and shows a soft spotlight that
 * follows the pointer. Pure transform/opacity manipulation via refs (no React
 * state churn on mousemove). Disabled for users who prefer reduced motion.
 */
export default function TiltCard({
  children,
  className = '',
  max = 6,
  glow = 'rgba(201, 75, 12, 0.12)',
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotX = (0.5 - py) * max * 2;
    const rotY = (px - 0.5) * max * 2;
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    if (spotRef.current) {
      spotRef.current.style.opacity = '1';
      spotRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, ${glow}, transparent 60%)`;
    }
  };

  const handleLeave = () => {
    const el = cardRef.current;
    if (el) el.style.transform = '';
    if (spotRef.current) spotRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card ${className}`}
    >
      <div ref={spotRef} className="tilt-spotlight" aria-hidden="true" />
      {children}
    </div>
  );
}
