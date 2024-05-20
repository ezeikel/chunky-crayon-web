import type { Metadata } from 'next';
import { DynaPuff, Nunito_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { config } from '@fortawesome/fontawesome-svg-core';
import PlausibleProvider from 'next-plausible';
import '@fortawesome/fontawesome-svg-core/styles.css';
import cn from '@/utils/cn';
import Providers from './providers';
import '@/global.css';

config.autoAddCss = false;

const dynaPuff = DynaPuff({ subsets: ['latin'], variable: '--font-dyna-puff' });

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-nunito-sans',
});

export const metadata: Metadata = {
  title: 'Chunky Crayon - AI-Generated Coloring Book Pages',
  description:
    'Unleash your creativity with Chunky Crayon! Our AI-powered app generates unique, vibrant coloring book pages from text, voice, or image prompts. Download, print, and color in, or use our interactive web app for digital coloring.',
  keywords:
    'coloring book, AI art, generative art, coloring pages, digital coloring, creative app',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Chunky Crayon - AI-Generated Coloring Book Pages',
    description:
      'Unleash your creativity with Chunky Crayon! Our AI-powered app generates unique, vibrant coloring book pages from text, voice, or image prompts. Download, print, and color in, or use our interactive web app for digital coloring.',
    url: 'https://chunkycrayon.com',
    siteName: 'Chunky Crayon',
    images: [
      {
        url: 'https://chunkycrayon.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chunky Crayon AI-Generated Coloring Book Pages',
      },
    ],
    locale: 'en-US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chunky Crayon - AI-Generated Coloring Book Pages',
    description:
      'Unleash your creativity with Chunky Crayon! Our AI-powered app generates unique, vibrant coloring book pages from text, voice, or image prompts. Download, print, and color in, or use our interactive web app for digital coloring.',
    images: ['https://chunkycrayon.com/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain="chunkycrayon.com" />
      </head>
      <body
        className={cn(
          'font-nunito-sans antialiased',
          dynaPuff.variable,
          nunitoSans.variable,
        )}
      >
        <Providers>
          <main>{children}</main>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
