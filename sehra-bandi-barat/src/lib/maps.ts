import type { Venue } from "@/data/wedding";

export function venueAddress(v: Venue) {
  const base = [...v.addressLines];
  if (!base.join(" ").includes(v.city)) base.push(v.city);
  const name = v.name.toLowerCase().includes("venue") ? [] : [v.name];
  return [...name, ...base, "Pakistan"].join(", ");
}

/** Verified link if we have one, otherwise a Google Maps search for the full address. */
export function mapsLink(v: Venue) {
  if (v.mapsUrl) return v.mapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress(v))}`;
}
