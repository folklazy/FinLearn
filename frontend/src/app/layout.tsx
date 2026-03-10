import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import OnboardingGuard from "@/components/providers/OnboardingGuard";
import { I18nProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FinLearn — เรียนรู้การลงทุนอย่างมั่นใจ",
    template: "%s | FinLearn",
  },
  description: "แพลตฟอร์มเรียนรู้การลงทุนหุ้นสำหรับมือใหม่ ข้อมูลบริษัท กราฟ งบการเงิน และ Portfolio Simulator",
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
        <AuthProvider>
          <I18nProvider>
            <OnboardingGuard>
              <Navbar />
              <main style={{ minHeight: 'calc(100vh - 64px)' }}>
                {children}
              </main>
              <Footer />
            </OnboardingGuard>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
