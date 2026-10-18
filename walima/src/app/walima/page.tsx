import type { Metadata, Viewport } from "next";
import { PearlInvitation } from "@/components/walima/PearlInvitation";
import { COUPLE, EVENTS, longDate, formatTime } from "@/data/wedding";

const title = `Walima Reception · ${COUPLE.groom} & ${COUPLE.bride}`;
const description = `An evening of elegance · ${longDate(EVENTS.walima.start)} · ${formatTime(EVENTS.walima.start)} · ${EVENTS.walima.venue.name}, Lahore`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/walima" },
  openGraph: { title, description, type: "website", url: "/walima", siteName: `${COUPLE.groom} & ${COUPLE.bride}` },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#F8F4EC" };

export default function Page() {
  return <PearlInvitation />;
}
