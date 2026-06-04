import { ImageResponse } from "next/og";

export const alt = "DataForge — 200+ Free Online Developer Tools & Generators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0a0f1e 0%, #131c3a 55%, #1e293b 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1 }}>DataForge</div>
        </div>

        <div style={{ marginTop: 40, fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 980 }}>
          200+ Free Online Developer Tools & Generators
        </div>

        <div style={{ marginTop: 28, fontSize: 30, color: "#94a3b8", maxWidth: 920 }}>
          Tools, data generators, an Excel-style spreadsheet with 360+ formulas, crypto tracker,
          file converter & OCR — all 100% in your browser.
        </div>

        <div style={{ marginTop: 44, display: "flex", gap: 14, flexWrap: "wrap" }}>
          {["JSON / CSV / XML", "Regex", "Hashing", "CSS Tools", "Spreadsheet", "Crypto"].map((t) => (
            <div
              key={t}
              style={{
                fontSize: 24,
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.4)",
                color: "#bfdbfe",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
