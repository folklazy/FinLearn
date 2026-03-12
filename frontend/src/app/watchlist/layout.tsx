import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "รายการจับตา — Watchlist",
  description:
    "ติดตามหุ้นที่สนใจ ดูราคาเรียลไทม์ และเปรียบเทียบหุ้นในรายการจับตาของคุณ",
  robots: { index: false },
};

export default function WatchlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
