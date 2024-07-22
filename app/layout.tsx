import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { config } from '@fortawesome/fontawesome-svg-core';
import PlausibleProvider from 'next-plausible';
import '@fortawesome/fontawesome-svg-core/styles.css';
import cn from '@/utils/cn';
import Header from '@/components/Header/Header';
import { Toaster } from '@/components/ui/toaster';
import { tondo, rooneySans } from '@/fonts';
import '@/global.css';
import Providers from './providers';

config.autoAddCss = false;

export const metadata: Metadata = {
  title: 'Chunky Crayon - Creative Coloring & Learning Fun',
  description:
    'Chunky Crayon is a vibrant and interactive app designed for kids and parents to generate unique, personalized coloring book pages and fun educational worksheets. Transform text, voice, and image prompts into printable coloring pages, or enjoy digital coloring on our web, iOS, and Android apps. Expand your child’s creativity and learning with engaging activities like connect the dots, hangman, and more. Chunky Crayon makes learning and creativity a delightful experience for kids at home or in school.',
  keywords:
    'coloring book pages, creative app for kids, personalized coloring pages, educational worksheets, fun learning activities, kids creativity app, interactive coloring app, digital coloring, printable coloring pages, connect the dots, hangman, kids educational games, math worksheets, English worksheets, kids learning tools, creative learning, kids drawing activities, home learning, school learning, web app for kids, iOS app for kids, Android app for kids, Chunky Crayon, fun educational app',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Chunky Crayon - Creative Coloring & Learning Fun',
    description:
      'Chunky Crayon is a vibrant and interactive app designed for kids and parents to generate unique, personalized coloring book pages and fun educational worksheets. Transform text, voice, and image prompts into printable coloring pages, or enjoy digital coloring on our web, iOS, and Android apps. Expand your child’s creativity and learning with engaging activities like connect the dots, hangman, and more. Chunky Crayon makes learning and creativity a delightful experience for kids at home or in school.',
    url: 'https://chunkycrayon.com',
    siteName: 'Chunky Crayon',
    images: [
      {
        url: 'https://chunkycrayon.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chunky Crayon AI-Generated Coloring Book Pages',
      },
    ],
    locale: 'en-GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chunky Crayon - Creative Coloring & Learning Fun',
    description:
      'Chunky Crayon is a vibrant and interactive app designed for kids and parents to generate unique, personalized coloring book pages and fun educational worksheets. Transform text, voice, and image prompts into printable coloring pages, or enjoy digital coloring on our web, iOS, and Android apps. Expand your child’s creativity and learning with engaging activities like connect the dots, hangman, and more. Chunky Crayon makes learning and creativity a delightful experience for kids at home or in school.',
    images: ['https://chunkycrayon.com/images/og-image.jpg'],
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
          'font-rooney-sans antialiased',
          tondo.variable,
          rooneySans.variable,
        )}
      >
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
