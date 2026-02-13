import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "FinLearn — เรียนรู้การลงทุนอย่างมั่นใจ",
  description: "แพลตฟอร์มเรียนรู้การลงทุนหุ้นสำหรับมือใหม่ ข้อมูลบริษัท กราฟ งบการเงิน และ Portfolio Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 64px)' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
