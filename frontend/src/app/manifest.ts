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
      { src: "/api/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/api/icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
