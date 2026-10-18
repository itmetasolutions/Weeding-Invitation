"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { WeddingEvent } from "@/data/wedding";
import { googleCalendarUrl, icsHref } from "@/lib/calendar";
import { IconCalendar } from "./icons";

type Classes = { button: string; menu: string; item: string };

/**
 * "Add to Calendar" with two real targets: Google Calendar (web) and a
 * downloadable .ics file (Apple Calendar, Outlook, Samsung, etc.).
 * Shared behaviour only; each invitation passes its own styling.
 */
export function CalendarMenu({ event, classes, label = "Add to Calendar" }: { event: WeddingEvent; classes: Classes; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        className={classes.button}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <IconCalendar className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </button>
      {open && (
        <div id={id} role="menu" className={classes.menu}>
          <a role="menuitem" className={classes.item} href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            Google Calendar
          </a>
          <a role="menuitem" className={classes.item} href={icsHref(event)} download onClick={() => setOpen(false)}>
            Apple / Outlook (.ics)
          </a>
        </div>
      )}
    </div>
  );
}
