import type { Metadata } from "next";
import { Sora, Geist_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { SITE, PERSONAL } from "@/lib/constants";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${PERSONAL.name}`,
  },
  description: SITE.description,
  authors: [{ name: PERSONAL.name, url: SITE.url }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE.url,
    siteName: PERSONAL.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PERSONAL.name,
  url: SITE.url,
  jobTitle: PERSONAL.role,
  description: SITE.description,
  sameAs: [PERSONAL.github, PERSONAL.linkedin, PERSONAL.twitter],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sora.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <MotionConfig reducedMotion="user">
          <a href="#main" className="skip-link">
            Lewati ke konten
          </a>
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
