"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive golden thread: follows the guest's finger / cursor as a
 * luminous strand that unspools and fades behind them.
 */
export function ThreadTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);
    type P = { x: number; y: number; t: number };
    const pts: P[] = [];
    const LIFE = 900;
    const onMove = (e: PointerEvent) => {
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (pts.length > 60) pts.shift();
      if (!raf) raf = requestAnimationFrame(draw);
    };
    let raf = 0;
    const draw = () => {
      const now = performance.now();
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (pts.length > 2) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        /* The glow is one shadowed stroke for the whole strand. Shadowing each
           of the ~60 segments separately blurred the canvas 60 times a frame. */
        ctx.beginPath();
        ctx.moveTo((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
        for (let i = 1; i < pts.length - 1; i++) {
          const b = pts[i];
          const n = pts[i + 1];
          ctx.quadraticCurveTo(b.x, b.y, (b.x + n.x) / 2, (b.y + n.y) / 2);
        }
        ctx.strokeStyle = "rgba(232, 201, 135, 0.5)";
        ctx.shadowColor = "rgba(255, 220, 150, 0.9)";
        ctx.shadowBlur = 10;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        /* Cores keep the per-segment taper, with no shadow cost. */
        ctx.shadowBlur = 0;
        for (let i = 1; i < pts.length - 1; i++) {
          const a = pts[i - 1];
          const b = pts[i];
          const n = pts[i + 1];
          const life = 1 - (now - b.t) / LIFE;
          ctx.strokeStyle = `rgba(232, 201, 135, ${life * 0.85})`;
          ctx.lineWidth = 0.4 + life * 1.6;
          ctx.beginPath();
          ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
          ctx.quadraticCurveTo(b.x, b.y, (b.x + n.x) / 2, (b.y + n.y) / 2);
          ctx.stroke();
        }
        const head = pts[pts.length - 1];
        const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 10);
        g.addColorStop(0, "rgba(255,246,220,0.9)");
        g.addColorStop(1, "rgba(255,230,170,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = pts.length ? requestAnimationFrame(draw) : 0;
      if (!raf) ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    addEventListener("pointermove", onMove, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full" />;
}
