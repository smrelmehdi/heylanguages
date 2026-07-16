import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#17130f",
          color: "#fff4df",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(255, 244, 223, 0.16)",
            borderRadius: 40,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: 56,
            width: "100%",
          }}
        >
          <div style={{ color: "#d99a3d", fontSize: 28, fontWeight: 700 }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            Language learning for real conversations.
          </div>
          <div style={{ color: "#c9ad8c", fontSize: 34 }}>
            Discover HeyYusuf, practical Arabic learning.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
