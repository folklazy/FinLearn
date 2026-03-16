import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import OnboardingGuard from "@/components/providers/OnboardingGuard";
import LayoutShell from "@/components/layout/LayoutShell";
import { I18nProvider } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://finlearn.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FinLearn — เรียนรู้การลงทุนอย่างมั่นใจ",
    template: "%s | FinLearn",
  },
  description:
    "แพลตฟอร์มเรียนรู้การลงทุนหุ้นสำหรับมือใหม่ ข้อมูลบริษัท กราฟ งบการเงิน และ Portfolio Simulator — เริ่มลงทุนอย่างมั่นใจ ไม่ต้องเสี่ยงเงินจริง",
  keywords: [
    "FinLearn",
    "เรียนรู้การลงทุน",
    "หุ้น",
    "จำลองพอร์ต",
    "Portfolio Simulator",
    "ข้อมูลหุ้น",
    "งบการเงิน",
    "วิเคราะห์หุ้น",
    "stock analysis",
    "learn investing",
    "paper trading",
    "S&P 500",
  ],
  authors: [{ name: "FinLearn" }],
  creator: "FinLearn",
  publisher: "FinLearn",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: "FinLearn",
    title: "FinLearn — เรียนรู้การลงทุนอย่างมั่นใจ",
    description:
      "แพลตฟอร์มเรียนรู้การลงทุนหุ้นสำหรับมือใหม่ ข้อมูลบริษัท กราฟ งบการเงิน และ Portfolio Simulator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FinLearn — เรียนรู้การลงทุนอย่างมั่นใจ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinLearn — เรียนรู้การลงทุนอย่างมั่นใจ",
    description:
      "แพลตฟอร์มเรียนรู้การลงทุนหุ้นสำหรับมือใหม่ ข้อมูลบริษัท กราฟ งบการเงิน และ Portfolio Simulator",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "finance",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e0f14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={inter.variable}>
      <body>
        <ThemeProvider>
        <AuthProvider>
          <I18nProvider>
            <CurrencyProvider>
            <OnboardingGuard>
              <LayoutShell>
                {children}
              </LayoutShell>
            </OnboardingGuard>
            </CurrencyProvider>
          </I18nProvider>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
