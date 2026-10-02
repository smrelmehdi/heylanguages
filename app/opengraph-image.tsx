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
          background: "#f5efe3",
          color: "#19221f",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "1px solid rgba(25, 34, 31, 0.18)",
            borderRadius: 36,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            padding: 56,
            width: "100%",
          }}
        >
          <div style={{ color: "#087c71", fontSize: 28, fontWeight: 700 }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            Real conversations start with a hello.
          </div>
          <div style={{ color: "#59645f", fontSize: 34 }}>
            Meet HeyYusuf, your guide to practical Arabic.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
