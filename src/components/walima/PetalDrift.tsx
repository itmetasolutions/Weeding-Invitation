"use client";

import { useEffect, useRef } from "react";

/**
 * A few ivory petals drifting down, tumbling in 3D (simulated by x-scale).
 * Each petal is drawn once into an offscreen sprite and then blitted, so no
 * gradient or canvas shadow is rebuilt per petal per frame.
 */
export function PetalDrift({ count = 16 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    const SPRITE = 48; // sprite is drawn at this size and scaled down per petal

    /* one petal, rendered once */
    const sprite = document.createElement("canvas");
    sprite.width = SPRITE;
    sprite.height = SPRITE;
    const sx = sprite.getContext("2d");
    if (sx) {
      const r = SPRITE * 0.42;
      sx.translate(SPRITE / 2, SPRITE / 2);
      const g = sx.createLinearGradient(0, -r, 0, r);
      g.addColorStop(0, "rgba(255,253,248,0.95)");
      g.addColorStop(1, "rgba(229,216,197,0.85)");
      sx.fillStyle = g;
      sx.shadowColor = "rgba(98,83,73,0.18)";
      sx.shadowBlur = 4;
      sx.shadowOffsetY = 2;
      sx.beginPath();
      sx.moveTo(0, r);
      sx.bezierCurveTo(-r * 0.9, r * 0.2, -r * 0.6, -r, 0, -r);
      sx.bezierCurveTo(r * 0.6, -r, r * 0.9, r * 0.2, 0, r);
      sx.fill();
    }

    let w = 0;
    let h = 0;
    type P = { x: number; y: number; s: number; vy: number; sway: number; ph: number; rot: number; vr: number; flip: number; vf: number };
    let ps: P[] = [];
    const spawn = (y?: number): P => ({
      x: Math.random() * w,
      y: y ?? -20,
      s: 5 + Math.random() * 7,
      vy: 0.25 + Math.random() * 0.35,
      sway: 0.4 + Math.random() * 0.8,
      ph: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.01,
      flip: Math.random() * Math.PI * 2,
      vf: 0.01 + Math.random() * 0.02,
    });

    const measure = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const populate = () => {
      const n = Math.round(count * Math.min(1.4, Math.max(coarse ? 0.5 : 0.6, w / 900)));
      ps = Array.from({ length: n }, () => spawn(Math.random() * h));
    };

    measure();
    populate();

    // Mobile browsers fire resize when the URL bar shows/hides. Re-measuring is
    // fine, but respawning every petal there would visibly reset the drift, so
    // the flock is only rebuilt when the width really changes.
    let lastW = w;
    const onResize = () => {
      measure();
      if (Math.abs(w - lastW) > 40) {
        lastW = w;
        populate();
      }
    };
    addEventListener("resize", onResize);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y += p.vy;
        p.ph += 0.01;
        p.x += Math.sin(p.ph) * p.sway * 0.4;
        p.rot += p.vr;
        p.flip += p.vf;
        if (p.y > h + 20) Object.assign(p, spawn());
        const k = (p.s * 2) / SPRITE; // sprite → petal size
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(Math.cos(p.flip) * k, k);
        ctx.drawImage(sprite, -SPRITE / 2, -SPRITE / 2);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [count]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[5] h-full w-full" />;
}
