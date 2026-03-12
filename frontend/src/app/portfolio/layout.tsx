import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "พอร์ตจำลอง — Portfolio Simulator",
  description:
    "ทดลองซื้อขายหุ้นด้วยเงินจำลอง ไม่เสี่ยงเงินจริง ติดตามกำไร-ขาดทุน และประวัติการเทรดแบบเรียลไทม์",
  robots: { index: false },
};

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
