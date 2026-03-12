import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "หุ้น — ข้อมูลหุ้น S&P 500 วิเคราะห์พื้นฐาน กราฟราคา",
  description:
    "ดูข้อมูลหุ้น S&P 500 ราคาเรียลไทม์ กราฟ งบการเงิน สัญญาณซื้อขาย และคะแนนวิเคราะห์ครบจบในที่เดียว",
  openGraph: {
    title: "หุ้น — ข้อมูลหุ้น S&P 500",
    description:
      "ดูข้อมูลหุ้น S&P 500 ราคาเรียลไทม์ กราฟ งบการเงิน สัญญาณซื้อขาย และคะแนนวิเคราะห์",
  },
};

export default function StocksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
