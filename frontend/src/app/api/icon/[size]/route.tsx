import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: sizeParam } = await params;
  const size = parseInt(sizeParam, 10);

  if (![192, 512].includes(size)) {
    return new Response("Not found", { status: 404 });
  }

  const borderRadius = Math.round(size * 0.2);
  const fontSize = Math.round(size * 0.55);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          borderRadius,
          background: "linear-gradient(135deg, #7c6cf0, #a78bfa)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize, fontWeight: 800, color: "white" }}>F</span>
      </div>
    ),
    { width: size, height: size }
  );
}
