import { ImageResponse } from "next/og";
import { learningPaths } from "@/lib/product";

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
          background: "#171c1b",
          color: "#fffaf0",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          padding: 68,
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#32cdbb",
            borderRadius: 500,
            height: 520,
            opacity: 0.12,
            position: "absolute",
            right: -180,
            top: -220,
            width: 520,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ color: "#32cdbb", fontSize: 28, fontWeight: 800 }}>
            HeyYusuf · Arabic with a friendly guide
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1.02,
              marginTop: 30,
              maxWidth: 900,
            }}
          >
            Your first Arabic conversation starts here.
          </div>
          <div
            style={{
              color: "#b7c0bb",
              display: "flex",
              fontSize: 29,
              gap: 18,
              marginTop: 38,
            }}
          >
            {learningPaths.map((path) => <span key={path.id}>{path.id === "msa" ? path.shortLabel : path.label}</span>)}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
