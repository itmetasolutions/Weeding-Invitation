"use client";

import { gsap, ScrollTrigger } from "./useGsap";

/**
 * Shared motion plumbing for both invitations.
 * Behaviour only — neither invitation's look is defined here.
 */

let configured = false;

/** Called once per invitation mount, before any timeline is built. */
export function configureMotion() {
  if (configured) return;
  configured = true;
  gsap.config({ nullTargetWarn: false });
  // Mobile browsers fire resize when the URL bar shows/hides. Without this,
  // ScrollTrigger re-measures mid-scroll and pinned/scrubbed scenes jump.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** True only for mouse/trackpad. Touch devices skip hover-driven motion entirely. */
export function finePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

export function smallScreen() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

/**
 * Trigger positions depend on text metrics, so measure again once webfonts have
 * swapped in. Cheaper and more accurate than refreshing on a timer.
 */
export function refreshWhenSettled() {
  ScrollTrigger.refresh();
  const again = () => requestAnimationFrame(() => ScrollTrigger.refresh());
  document.fonts?.ready.then(again).catch(() => {});
  const onLoad = () => again();
  if (document.readyState !== "complete") addEventListener("load", onLoad, { once: true });
  return () => removeEventListener("load", onLoad);
}

type ParallaxLayer = {
  el: gsap.TweenTarget;
  x?: number;
  y?: number;
  rotate?: number;
  rotateY?: number;
  rotateX?: number;
  /** Skipped while this returns false — used to leave off-screen layers alone. */
  when?: () => boolean;
};

/**
 * Pointer parallax that resolves its targets once and writes through quickTo
 * setters, throttled to one rAF per frame. Replaces per-event gsap.to(selector)
 * calls, which re-query the DOM and allocate tweens on every mouse move.
 * Returns a cleanup. No-ops on touch devices.
 */
export function pointerParallax(layers: ParallaxLayer[], duration = 1.2) {
  if (!finePointer()) return () => {};
  const setters = layers.map((l) => ({
    l,
    x: l.x ? gsap.quickTo(l.el, "x", { duration, ease: "power3.out" }) : null,
    y: l.y ? gsap.quickTo(l.el, "y", { duration, ease: "power3.out" }) : null,
    rotate: l.rotate ? gsap.quickTo(l.el, "rotate", { duration, ease: "power3.out" }) : null,
    rotateY: l.rotateY ? gsap.quickTo(l.el, "rotateY", { duration, ease: "power3.out" }) : null,
    rotateX: l.rotateX ? gsap.quickTo(l.el, "rotateX", { duration, ease: "power3.out" }) : null,
  }));

  let nx = 0;
  let ny = 0;
  let raf = 0;
  let live = true;

  const apply = () => {
    raf = 0;
    if (!live) return;
    for (const s of setters) {
      if (s.l.when && !s.l.when()) continue;
      s.x?.(nx * (s.l.x ?? 0));
      s.y?.(ny * (s.l.y ?? 0));
      s.rotate?.(nx * (s.l.rotate ?? 0));
      s.rotateY?.(nx * (s.l.rotateY ?? 0));
      s.rotateX?.(-ny * (s.l.rotateX ?? 0));
    }
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    nx = e.clientX / innerWidth - 0.5;
    ny = e.clientY / innerHeight - 0.5;
    if (!raf) raf = requestAnimationFrame(apply);
  };

  addEventListener("pointermove", onMove, { passive: true });
  return () => {
    live = false;
    removeEventListener("pointermove", onMove);
    if (raf) cancelAnimationFrame(raf);
  };
}

/**
 * Infinite CSS animations (foil sheen, slow spins, bokeh, float) keep
 * rasterising while off-screen. Park them with a class until they are in view.
 */
export function pauseOffscreen(root: HTMLElement | null, selector: string) {
  if (!root || typeof IntersectionObserver === "undefined") return () => {};
  const els = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (!els.length) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) (e.target as HTMLElement).classList.toggle("anim-idle", !e.isIntersecting);
    },
    { rootMargin: "100px" },
  );
  els.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    els.forEach((el) => el.classList.remove("anim-idle"));
  };
}

/** Marks elements as in/out of view so pointer-driven motion can skip them. */
export function inViewFlag(trigger: string | Element) {
  const state = { value: false };
  ScrollTrigger.create({
    trigger,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      state.value = self.isActive;
    },
  });
  return state;
}

/** Sets stroke dash values so a path can be "drawn", and returns the elements. */
export function prepareDraw(selector: string) {
  return gsap.utils.toArray<SVGGeometryElement>(selector).map((el) => {
    const len = el.getTotalLength();
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    return el;
  });
}

/** Horizontal mask wipe — crisper than animating filter: blur() on text. */
export const WIPE_FROM = { clipPath: "inset(-15% 100% -15% 0%)" } as const;
export const WIPE_TO = { clipPath: "inset(-15% 0% -15% 0%)" } as const;
