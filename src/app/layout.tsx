import type { Metadata, Viewport } from "next";
import { SITE } from "@/data/wedding";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: "Abdullah & Rabiea · Wedding Invitations",
  description: "Wedding invitations from the family of Abdullah.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
