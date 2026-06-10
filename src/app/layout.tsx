import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GoogleAnalytics } from "@/components/analytics";
import { AccessibilityPanel } from "@/components/accessibility-panel";
import { CookieConsent } from "@/components/cookie-consent";
import { Recaptcha } from "@/components/recaptcha";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { ScrollButtons } from "@/components/scroll-buttons";
import { WelcomeBanner } from "@/components/welcome-banner";
import { OnboardingOverlay } from "@/components/onboarding-overlay";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const SITE_DESC =
  "DataForge is a free suite of privacy-first online tools — 200+ developer utilities, 170+ data generators, an Excel-style spreadsheet with 360+ formulas, a live crypto tracker, file converter and OCR. Everything runs locally in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DataForge — 200+ Free Online Developer Tools & Generators",
    template: "%s · DataForge",
  },
  description: SITE_DESC,
  keywords: [
    "developer tools", "online tools", "data generator", "password generator",
    "uuid generator", "hash generator", "json formatter", "csv to json",
    "qr code generator", "barcode generator", "regex tester", "excel online",
    "spreadsheet", "excel formulas", "crypto tracker", "free online tools",
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
    title: `${SITE_NAME} — 200+ Free Online Developer Tools & Generators`,
    description: SITE_DESC,
    siteName: SITE_NAME,
    locale: "en_US",
    // og:image is provided by the file-based opengraph-image route (real PNG).
  },
  twitter: {
    card: "summary_large_image",
    site: "@dataforge",
    creator: "@dataforge",
    title: `${SITE_NAME} — 200+ Free Online Developer Tools & Generators`,
    description: SITE_DESC,
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
    var brand = localStorage.getItem('df-brand-css');
    if (brand) el.style.cssText += brand;
    var bgc = localStorage.getItem('df-bg-css');
    if (bgc) el.style.setProperty('--bg-grad', bgc);
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
    "200+ Developer Tools", "Data Generators", "JSON / CSV / XML Converters",
    "Regex Tester", "Hash & Password Generators", "CSS Generators",
    "Excel-style Spreadsheet with 360+ Formulas", "Formula Manager",
    "Live Crypto Tracker", "File Converter", "OCR",
  ],
  screenshot: `${SITE_URL}/opengraph-image`,
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
        <OnboardingOverlay />
        <WelcomeBanner />
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6">
          {children}
        </main>
        <SiteFooter />
        <AccessibilityPanel />
        <ScrollButtons />
        <WhatsAppButton />
        <CookieConsent />
        <Recaptcha />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
