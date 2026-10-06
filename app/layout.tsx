import type { Metadata, Viewport } from 'next';
import './globals.css';
import SyncOnLoad from '@/components/SyncOnLoad';

export const metadata: Metadata = {
  title: 'CA Revise · Ss',
  description: 'CA Final Nov 2026 revision: case drills, clause hunt, MCQs, law library, notes, flip cards.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'CA Revise' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eef1f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1020' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

// App fonts: Bricolage Grotesque / Public Sans / IBM Plex Mono / Special Elite.
// Handwriting fonts (Kalam / Caveat / Shadows Into Light) are used by the Notes view only.
const FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Mono:wght@500;600&family=Special+Elite&family=Caveat:wght@400;700&family=Kalam:wght@400;700&family=Shadows+Into+Light&display=swap';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS} rel="stylesheet" />
      </head>
      <body><SyncOnLoad />{children}</body>
    </html>
  );
}
