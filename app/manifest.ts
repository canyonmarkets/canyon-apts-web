import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Canyon Apartments — Furnished Phoenix Rentals',
    short_name: 'Canyon Apartments',
    description:
      'Fully furnished weekly and monthly apartments across the Phoenix metro. No credit check, utilities included, move-in ready from $495/week.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1c1917',
    theme_color: '#C94B0C',
    icons: [
      { src: '/logo.png', sizes: 'any', type: 'image/png' },
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  };
}
