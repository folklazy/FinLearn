import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FinLearn — เรียนรู้การลงทุนอย่างมั่นใจ",
    short_name: "FinLearn",
    description:
      "แพลตฟอร์มเรียนรู้การลงทุนหุ้นสำหรับมือใหม่ ข้อมูลบริษัท กราฟ งบการเงิน และ Portfolio Simulator",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0f14",
    theme_color: "#0e0f14",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
