/**
 * Single source of truth for every fact shown on both invitations.
 * Correct anything here and both routes, calendar files, share text
 * and Open Graph images update automatically.
 *
 * All times are Pakistan Standard Time (Asia/Karachi, UTC+05:00, no DST).
 */

export type Venue = {
  name: string;
  /** Full postal address, one line per array item. */
  addressLines: string[];
  city: string;
  /**
   * Optional verified Google Maps link. When omitted, a Maps search link
   * is built from name + address.
   */
  mapsUrl?: string;
};

export type WeddingEvent = {
  id: "sehra-bandi" | "barat-nikah" | "walima";
  title: string;
  /** ISO 8601 with explicit +05:00 offset (Asia/Karachi). */
  start: string;
  /**
   * End time used ONLY for calendar entries (calendars require one).
   * It is not printed on the invitation.
   */
  calendarEnd: string;
  venue: Venue;
  /** Extra ceremony lines shown on the invitation. */
  schedule?: { label: string; time: string }[];
  note?: string;
};

export const COUPLE = {
  groom: "Abdullah",
  bride: "Rabiea",
  monogram: ["A", "R"] as const,
};

export const TIMEZONE = "Asia/Karachi";

export const VENUES = {
  sehra: {
    name: "Sehra Bandi Venue",
    addressLines: [
      "189-B, Sector A-1, GECHS",
      "Main Madr-e-Millat Road, Township",
    ],
    city: "Lahore",
  },
  alJannat: {
    name: "Al-Jannat Fort Marriage Hall",
    addressLines: ["228-C PIA Road, Block C, Phase 1", "Johar Town, Lahore 54000"],
    city: "Lahore",
    // Same verified link used on the bride-side invitation.
    mapsUrl: "https://maps.app.goo.gl/QNQT9iPZUTQBk4ij6",
  },
} satisfies Record<string, Venue>;

export const EVENTS = {
  sehraBandi: {
    id: "sehra-bandi",
    title: "Sehra Bandi",
    start: "2026-11-03T17:30:00+05:00",
    calendarEnd: "2026-11-03T18:00:00+05:00",
    venue: VENUES.sehra,
  },
  baratNikah: {
    id: "barat-nikah",
    title: "Barat & Nikah",
    start: "2026-11-03T18:00:00+05:00",
    calendarEnd: "2026-11-03T22:00:00+05:00",
    venue: VENUES.alJannat,
    schedule: [
      { label: "Barat", time: "6:00 PM" },
      { label: "Nikah", time: "6:30 PM" },
    ],
    note: "Nikah & Rukhsati Ceremony",
  },
  walima: {
    id: "walima",
    title: "Walima Reception",
    start: "2026-11-04T18:00:00+05:00",
    calendarEnd: "2026-11-04T22:00:00+05:00",
    venue: VENUES.alJannat,
  },
} satisfies Record<string, WeddingEvent>;

export const ALL_EVENTS: WeddingEvent[] = Object.values(EVENTS);

export function getEvent(id: string): WeddingEvent | undefined {
  return ALL_EVENTS.find((e) => e.id === id);
}

/*
 * Deterministic formatting in Pakistan time (UTC+05:00, no DST).
 * Intl output differs between Node and browsers ("Tuesday 3" vs "Tuesday, 3"),
 * which breaks hydration, so dates are formatted by hand.
 */
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function pkt(iso: string) {
  const d = new Date(new Date(iso).getTime() + PKT_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), day: d.getUTCDate(), wd: d.getUTCDay(), h: d.getUTCHours(), min: d.getUTCMinutes() };
}

export function formatDate(iso: string, opts: { weekday?: "long"; day?: "numeric" | "2-digit"; month?: "long"; year?: "numeric" }) {
  const p = pkt(iso);
  const parts: string[] = [];
  if (opts.weekday) parts.push(DAYS[p.wd] + (opts.day || opts.month ? "," : ""));
  if (opts.day) parts.push(opts.day === "2-digit" ? String(p.day).padStart(2, "0") : String(p.day));
  if (opts.month) parts.push(MONTHS[p.m]);
  if (opts.year) parts.push(String(p.y));
  return parts.join(" ");
}

export function formatTime(iso: string) {
  const p = pkt(iso);
  const h12 = p.h % 12 === 0 ? 12 : p.h % 12;
  return `${h12}:${String(p.min).padStart(2, "0")} ${p.h < 12 ? "AM" : "PM"}`;
}

export function longDate(iso: string) {
  return formatDate(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export const SITE = {
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
};
