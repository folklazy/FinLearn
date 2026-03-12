import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "บทเรียน — เรียนรู้การลงทุนตั้งแต่เริ่มต้น",
  description:
    "บทเรียนลงทุนหุ้นครบวงจร ตั้งแต่พื้นฐาน P/E Ratio, งบการเงิน จนถึงเทคนิควิเคราะห์ขั้นสูง เหมาะสำหรับมือใหม่ถึงมือโปร",
  openGraph: {
    title: "บทเรียน — เรียนรู้การลงทุนตั้งแต่เริ่มต้น",
    description:
      "บทเรียนลงทุนหุ้นครบวงจร ตั้งแต่พื้นฐาน P/E Ratio จนถึงเทคนิคขั้นสูง",
  },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
