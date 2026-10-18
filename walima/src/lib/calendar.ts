import type { WeddingEvent } from "@/data/wedding";
import { COUPLE } from "@/data/wedding";
import { venueAddress, mapsLink } from "./maps";

/** 2026-11-03T17:30:00+05:00 -> 20261103T123000Z */
function toUtcStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function eventTitle(e: WeddingEvent) {
  return `${e.title} – ${COUPLE.groom} & ${COUPLE.bride}`;
}

function eventDetails(e: WeddingEvent) {
  const lines = [
    `${e.title} of ${COUPLE.groom} & ${COUPLE.bride}.`,
    ...(e.schedule?.map((s) => `${s.label}: ${s.time}`) ?? []),
    e.note ?? "",
    `Location: ${mapsLink(e.venue)}`,
  ].filter(Boolean);
  return lines.join("\n");
}

export function googleCalendarUrl(e: WeddingEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: eventTitle(e),
    dates: `${toUtcStamp(e.start)}/${toUtcStamp(e.calendarEnd)}`,
    details: eventDetails(e),
    location: venueAddress(e.venue),
    ctz: "Asia/Karachi",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** RFC 5545 line folding at 75 octets (UTF-8 aware, never splits a character). */
function fold(line: string) {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes + b > limit) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function buildIcs(e: WeddingEvent) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Abdullah & Rabiea//Wedding Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}-2026@abdullah-rabiea-wedding`,
    `DTSTAMP:${toUtcStamp("2026-10-14T00:00:00Z")}`,
    `DTSTART:${toUtcStamp(e.start)}`,
    `DTEND:${toUtcStamp(e.calendarEnd)}`,
    `SUMMARY:${icsEscape(eventTitle(e))}`,
    `DESCRIPTION:${icsEscape(eventDetails(e))}`,
    `LOCATION:${icsEscape(venueAddress(e.venue))}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT3H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(eventTitle(e))}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Static route that serves a downloadable .ics file. */
export function icsHref(e: WeddingEvent) {
  return `/calendar/${e.id}.ics`;
}
