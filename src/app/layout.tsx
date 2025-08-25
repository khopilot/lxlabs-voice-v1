import type { Metadata } from "next";
import "./globals.css";
import "./lib/envSetup";

export const metadata: Metadata = {
  title: "LXLabs Hospitality Training",
  description: "AI-powered English conversation practice for Cambodian hospitality professionals. Master front desk skills with interactive voice training.",
  metadataBase: new URL('https://lxlabs-voice-v1.vercel.app'),
  openGraph: {
    title: "LXLabs Hospitality Training Platform",
    description: "AI-powered English conversation practice for Cambodian hospitality professionals. Master front desk skills with interactive voice training.",
    url: 'https://lxlabs-voice-v1.vercel.app',
    siteName: 'LXLabs Training',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'LXLabs Hospitality Training Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "LXLabs Hospitality Training Platform",
    description: "AI-powered English conversation practice for Cambodian hospitality professionals.",
    images: ['/og-image.png'],
  },
  keywords: ['hospitality training', 'English conversation', 'AI voice training', 'Cambodia', 'hotel training', 'front desk skills', 'language learning'],
  authors: [{ name: 'LXLabs', url: 'https://lxlabs.com' }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
