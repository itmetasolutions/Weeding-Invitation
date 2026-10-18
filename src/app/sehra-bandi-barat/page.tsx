import type { Metadata, Viewport } from "next";
import { RoyalInvitation } from "@/components/barat/RoyalInvitation";
import { COUPLE, EVENTS, longDate, formatTime } from "@/data/wedding";

const title = `Sehra Bandi & Barat · ${COUPLE.groom} & ${COUPLE.bride}`;
const description = `The family of ${COUPLE.groom} cordially invites you · Sehra Bandi ${formatTime(EVENTS.sehraBandi.start)} & Barat ${EVENTS.baratNikah.schedule[0].time} · ${longDate(EVENTS.sehraBandi.start)} · Lahore`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/sehra-bandi-barat" },
  openGraph: { title, description, type: "website", url: "/sehra-bandi-barat", siteName: `${COUPLE.groom} & ${COUPLE.bride}` },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#0B1427" };

export default function Page() {
  return <RoyalInvitation />;
}
