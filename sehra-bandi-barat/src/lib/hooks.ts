"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

function diff(target: number): Remaining {
  const ms = Math.max(0, target - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: ms === 0,
  };
}

/**
 * Countdown to an ISO timestamp that carries its own offset (+05:00, Asia/Karachi),
 * so the result is correct regardless of the guest's device timezone.
 * Returns null until mounted to avoid hydration mismatch.
 */
export function useCountdown(iso: string): Remaining | null {
  const [r, setR] = useState<Remaining | null>(null);
  useEffect(() => {
    const t = new Date(iso).getTime();
    setR(diff(t));
    const id = window.setInterval(() => setR(diff(t)), 1000);
    return () => window.clearInterval(id);
  }, [iso]);
  return r;
}

function subscribeRM(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeRM,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** ?autoplay=1 is used by the video renderer: auto-opens and auto-scrolls. */
export function useAutoplayFlag() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get("autoplay") === "1");
  }, []);
  return on;
}

export const pad = (n: number) => String(n).padStart(2, "0");
