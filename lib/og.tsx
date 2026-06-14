import React from 'react';

/**
 * Shared JSX layout for all opengraph-image.tsx route files.
 * Returned to ImageResponse (Satori) — use only supported CSS properties.
 */
export function OgCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#1c1917',
        padding: '60px 80px',
        position: 'relative',
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 10,
          backgroundColor: '#C94B0C',
          display: 'flex',
        }}
      />

      {/* Eyebrow */}
      <div
        style={{
          display: 'flex',
          color: '#C94B0C',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          marginBottom: 28,
        }}
      >
        {eyebrow}
      </div>

      {/* Main title */}
      <div
        style={{
          display: 'flex',
          color: '#ffffff',
          fontSize: title.length > 40 ? 48 : 58,
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 28,
          maxWidth: 960,
        }}
      >
        {title}
      </div>

      {/* Divider */}
      <div
        style={{
          width: 64,
          height: 4,
          backgroundColor: '#C94B0C',
          marginBottom: 28,
          display: 'flex',
        }}
      />

      {/* Subtitle / tags */}
      <div
        style={{
          display: 'flex',
          gap: 28,
          color: '#a8a29e',
          fontSize: 22,
        }}
      >
        <span>{subtitle ?? 'From $495/wk  ·  Utilities Included  ·  No Credit Check'}</span>
      </div>

      {/* Domain — bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          right: 80,
          color: '#57534e',
          fontSize: 18,
          letterSpacing: '0.06em',
          display: 'flex',
        }}
      >
        canyon-apts.com
      </div>
    </div>
  );
}
