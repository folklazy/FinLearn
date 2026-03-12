import { ImageResponse } from "next/og";

export const alt = "FinLearn — เรียนรู้การลงทุนอย่างมั่นใจ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0f14",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Gradient glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,108,240,0.15) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #7c6cf0, #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 800, color: "white" }}>
              F
            </span>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#e8e9ed",
              letterSpacing: "-0.03em",
            }}
          >
            FinLearn
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "#9a9caa",
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          เรียนรู้การลงทุนอย่างมั่นใจ — ข้อมูลหุ้น กราฟ งบการเงิน
          และ Portfolio Simulator
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
          }}
        >
          {["ข้อมูลหุ้น S&P 500", "บทเรียนลงทุน", "จำลองพอร์ต"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "10px 24px",
                  borderRadius: 100,
                  background: "rgba(124,108,240,0.12)",
                  border: "1px solid rgba(124,108,240,0.25)",
                  color: "#a599ff",
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
