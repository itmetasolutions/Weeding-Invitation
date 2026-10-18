import { ImageResponse } from "next/og";
import { COUPLE, EVENTS, longDate, formatTime } from "@/data/wedding";
import { font } from "@/lib/og-fonts";

export const alt = `Sehra Bandi & Barat of ${COUPLE.groom} & ${COUPLE.bride}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function Image() {
  const [cinzel, corm] = await Promise.all([font("cinzel", "cinzel-latin-600-normal.woff"), font("cormorant-garamond", "cormorant-garamond-latin-400-italic.woff")]);
  const gold = "#C5A46D";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "radial-gradient(circle at 50% 40%, #16264a 0%, #0B1427 70%)", padding: 28 }}>
        <div style={{ flex: 1, display: "flex", border: `2px solid ${gold}`, padding: 10 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `1px solid rgba(197,164,109,0.55)`, color: "#F5EFE3" }}>
            <div style={{ display: "flex", width: 120, height: 120, borderRadius: 60, border: `2px solid ${gold}`, alignItems: "center", justifyContent: "center", fontFamily: "Cinzel", fontSize: 40, color: "#E9CF92" }}>
              A·R
            </div>
            <div style={{ marginTop: 30, fontFamily: "Cinzel", fontSize: 22, letterSpacing: 10, color: gold }}>{`THE FAMILY OF ${COUPLE.groom.toUpperCase()} INVITES YOU`}</div>
            <div style={{ marginTop: 14, fontFamily: "Cinzel", fontSize: 64, letterSpacing: 6, color: "#E9CF92" }}>{"SEHRA BANDI & BARAT"}</div>
            <div style={{ marginTop: 6, fontFamily: "Cormorant", fontSize: 52, color: "#F5EFE3" }}>
              {`${COUPLE.groom} & ${COUPLE.bride}`}
            </div>
            <div style={{ marginTop: 22, fontFamily: "Cinzel", fontSize: 22, letterSpacing: 4, color: "rgba(245,239,227,0.8)" }}>
              {`${longDate(EVENTS.sehraBandi.start).toUpperCase()} · FROM ${formatTime(EVENTS.sehraBandi.start)} · LAHORE`}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Cinzel", data: cinzel, weight: 600 }, { name: "Cormorant", data: corm, style: "italic", weight: 400 }] },
  );
}
