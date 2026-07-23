import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Purely Doubles — Referee Console',
    short_name: 'Referee',
    description: 'Live match scoring console for Purely Doubles referees. Optimised for outdoor court conditions.',
    start_url: '/referee',
    display: 'standalone',
    background_color: '#070b10',
    theme_color: '#070b10',
    icons: [
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
