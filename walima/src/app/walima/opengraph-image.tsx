import { ImageResponse } from "next/og";
import { COUPLE, EVENTS, longDate, formatTime } from "@/data/wedding";
import { font } from "@/lib/og-fonts";

export const alt = `Walima Reception of ${COUPLE.groom} & ${COUPLE.bride}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function Image() {
  const [italiana, pinyon, jost] = await Promise.all([
    font("italiana", "italiana-latin-400-normal.woff"),
    font("pinyon-script", "pinyon-script-latin-400-normal.woff"),
    font("jost", "jost-latin-400-normal.woff"),
  ]);
  const champ = "#C6A775";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F8F4EC 55%, #E5D8C5 100%)" }}>
        <div style={{ position: "absolute", left: 564, top: 66, width: 72, height: 72, borderRadius: 36, background: "radial-gradient(circle at 35% 30%, #FFFFFF 0%, #F1E9DC 45%, #CDBB9F 100%)", boxShadow: "0 20px 40px rgba(98,83,73,0.3)" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "50px 110px", borderRadius: 60, border: `2px solid ${champ}`, background: "rgba(255,255,255,0.55)" }}>
          <div style={{ fontFamily: "Italiana", fontSize: 30, letterSpacing: 14, color: "#625349" }}>AN EVENING OF ELEGANCE</div>
          <div style={{ fontFamily: "Italiana", fontSize: 60, letterSpacing: 12, color: "#625349", marginTop: 14 }}>WALIMA RECEPTION</div>
          <div style={{ fontFamily: "Pinyon", fontSize: 92, color: "#A8854C", marginTop: 4 }}>
            {`${COUPLE.groom} & ${COUPLE.bride}`}
          </div>
          <div style={{ fontFamily: "Jost", fontSize: 24, letterSpacing: 6, color: "#625349", marginTop: 10 }}>
            {`${longDate(EVENTS.walima.start).toUpperCase()} · ${formatTime(EVENTS.walima.start)}`}
          </div>
          <div style={{ fontFamily: "Jost", fontSize: 22, letterSpacing: 3, color: "rgba(98,83,73,0.75)", marginTop: 8 }}>{`${EVENTS.walima.venue.name}, Lahore`}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Italiana", data: italiana }, { name: "Pinyon", data: pinyon }, { name: "Jost", data: jost }] },
  );
}
