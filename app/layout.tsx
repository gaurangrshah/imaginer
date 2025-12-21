import './globals.css';

import type { Metadata } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import Script from 'next/script';

import { ClerkProvider } from '@clerk/nextjs';

import { cn } from '@/lib/utils';

const IBMPlex = IBM_Plex_Sans({ subsets: ["latin"], weight: ['400', '500', '600', '700'], variable: '--font-ibm-plex' });

export const metadata: Metadata = {
  title: "Imaginer",
  description: "AI-powered image generator",
};

const UMAMI_WEBSITE_ID = 'e0e6cf68-b853-4e36-8875-3611396ff2e3';
const UMAMI_URL = process.env.NEXT_PUBLIC_UMAMI_URL;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: "#624cf5" } }}>
      <html lang="en">
        <head>
          {UMAMI_URL && (
            <Script
              defer
              src={`${UMAMI_URL}/script.js`}
              data-website-id={UMAMI_WEBSITE_ID}
              strategy="afterInteractive"
            />
          )}
        </head>
        <body className={cn("font-IBMPlex antialiased", IBMPlex.variable)}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
