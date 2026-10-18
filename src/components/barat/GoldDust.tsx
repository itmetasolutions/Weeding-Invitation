"use client";

import { useEffect, useRef } from "react";

/** Slow-rising, twinkling gold motes. Lightweight 2D canvas, pauses when tab hidden. */
export function GoldDust({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);

    /* One mote, rendered once. Building a radial gradient per mote per frame
       (up to 140 of them) was the whole cost of this effect. */
    const SPRITE = 32;
    const sprite = document.createElement("canvas");
    sprite.width = SPRITE;
    sprite.height = SPRITE;
    const sx = sprite.getContext("2d");
    if (sx) {
      const g = sx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
      g.addColorStop(0, "rgba(255,236,190,1)");
      g.addColorStop(1, "rgba(197,164,109,0)");
      sx.fillStyle = g;
      sx.beginPath();
      sx.arc(SPRITE / 2, SPRITE / 2, SPRITE / 2, 0, Math.PI * 2);
      sx.fill();
    }

    let w = 0;
    let h = 0;
    type M = { x: number; y: number; r: number; vy: number; vx: number; ph: number; sp: number };
    let motes: M[] = [];
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(((w * h) / 14000) * density);
      motes = Array.from({ length: Math.min(n, 140) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        vy: -(Math.random() * 0.18 + 0.04),
        vx: (Math.random() - 0.5) * 0.08,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.02 + 0.006,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y += m.vy;
        m.x += m.vx + Math.sin(m.ph) * 0.05;
        m.ph += m.sp;
        if (m.y < -5) {
          m.y = h + 5;
          m.x = Math.random() * w;
        }
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(m.ph * 2));
        const d = m.r * 8; // sprite diameter == 2 * (r * 4)
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, m.x - d / 2, m.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    const vis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", vis);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [density]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
