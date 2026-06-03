import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const SITE_URL = "https://dataforge.example";
const SITE_NAME = "DataForge";
const SITE_DESC =
  "DataForge is a free suite of 170+ fast, privacy-first online generators — passwords, UUIDs, addresses, hashes, QR codes, barcodes, fake data, and a live crypto tracker. Everything runs locally in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DataForge — 170+ Free Online Data Generators",
    template: "%s · DataForge",
  },
  description: SITE_DESC,
  keywords: [
    "data generator", "random number generator", "password generator",
    "uuid generator", "hash generator", "ip address generator", "secret key generator",
    "qr code generator", "barcode generator", "fake data", "test data",
    "iban generator", "credit card generator", "json mock", "crypto tracker",
    "free online tools", "developer tools",
  ],
  authors: [{ name: "DataForge" }],
  creator: "DataForge",
  publisher: "DataForge",
  category: "Technology",
  applicationName: SITE_NAME,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: `${SITE_NAME} — 170+ Free Online Data Generators`,
    description: SITE_DESC,
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "DataForge — Free Online Data Generators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@dataforge",
    creator: "@dataforge",
    title: `${SITE_NAME} — 170+ Free Online Data Generators`,
    description: SITE_DESC,
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  alternates: { canonical: "/" },
  other: {
    "og:locale:alternate": "en_GB",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1e" },
  ],
};

// Applies saved theme + background before paint to avoid a flash.
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('df-theme');
    var b = localStorage.getItem('df-bg') || 'aurora';
    var dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var el = document.documentElement;
    if (dark) el.classList.add('dark');
    el.setAttribute('data-bg', b);
  } catch(e){}
})();
`;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESC,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/#tools?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.svg` },
  },
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Password Generator", "UUID Generator", "Hash Generator",
    "QR Code Generator", "Barcode Generator", "IBAN Generator",
    "Credit Card Test Generator", "JSON Mock Generator", "Live Crypto Tracker",
  ],
  screenshot: `${SITE_URL}/og-image.png`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
