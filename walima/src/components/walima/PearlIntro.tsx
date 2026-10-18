"use client";

import { useRef } from "react";
import { useGsap, gsap } from "@/components/shared/useGsap";
import { configureMotion, pointerParallax } from "@/components/shared/motion";
import { Spray } from "./botanicals";

const RINGS = [
  { tilt: "rotateX(74deg) rotateY(8deg)", size: 1.55, speed: "38s", dash: false },
  { tilt: "rotateX(66deg) rotateY(-20deg)", size: 1.85, speed: "52s", dash: true },
  { tilt: "rotateX(80deg) rotateY(-4deg)", size: 2.2, speed: "70s", dash: false },
];

/**
 * The opening: light gathers, the pearl rises into it, champagne rings are
 * drawn by a travelling bead of light, florals unfold from their stems, and the
 * words settle last. One timeline, labelled, so every beat is caused by the one
 * before it. Leaving pushes the camera into the pearl and hands the page over
 * to the wreath before this layer is gone.
 */
export function PearlIntro({
  onOpen,
  onHandoff,
  onExited,
  reduced,
  autoplay,
}: {
  onOpen: () => void;
  onHandoff: () => void;
  onExited: () => void;
  reduced: boolean;
  autoplay: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const idle = useRef<gsap.core.Tween[]>([]);
  const leaving = useRef(false);

  useGsap(
    root,
    () => {
      configureMotion();

      // Rings and stems are drawn, so they start fully retracted.
      gsap.utils.toArray<SVGGeometryElement>("[data-iring], [data-stem]").forEach((el) => {
        const l = el.getTotalLength();
        gsap.set(el, { strokeDasharray: el.hasAttribute("data-dash") ? "2 7" : l, strokeDashoffset: l });
      });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tlRef.current = tl;

      /* ---- light gathers ------------------------------------------------ */
      tl.addLabel("dawn")
        .from("[data-ambient]", { opacity: 0, duration: 1.6, ease: "sine.inOut" }, "dawn")
        .fromTo("[data-dawn]", { opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: 1.8, ease: "sine.out" }, "dawn")

        /* ---- the pearl rises into the light ----------------------------- */
        .addLabel("pearl", "dawn+=0.5")
        .from("[data-pearl-wrap]", { scale: 0.62, opacity: 0, y: 34, duration: 1.5, ease: "expo.out" }, "pearl")
        .fromTo("[data-pearl-floor]", { scaleX: 0.3, scaleY: 0.4, opacity: 0 }, { scaleX: 1, scaleY: 1, opacity: 1, duration: 1.5, ease: "expo.out" }, "pearl")
        // a breath of light as it settles, which is what starts the rings
        .fromTo("[data-bloom]", { scale: 0.5, opacity: 0 }, { scale: 1.35, opacity: 0.85, duration: 0.7, ease: "sine.out" }, "pearl+=0.75")
        .to("[data-bloom]", { scale: 1.9, opacity: 0, duration: 1.1, ease: "sine.inOut" }, "pearl+=1.45")

        /* ---- rings drawn by a bead of light ----------------------------- */
        .addLabel("rings", "pearl+=1.0")
        .to("[data-iring]", { strokeDashoffset: 0, duration: 1.5, stagger: 0.2, ease: "power2.inOut" }, "rings")
        .set("[data-bead]", { opacity: 1 }, "rings")
        .to("[data-bead-orbit]", { rotate: 360, svgOrigin: "100 100", duration: 1.5, stagger: 0.2, ease: "power2.inOut" }, "rings")
        .to("[data-bead]", { opacity: 0, duration: 0.4, stagger: 0.2, ease: "sine.in" }, "rings+=1.35")
        .from("[data-iring-pearl]", { opacity: 0, scale: 0, svgOrigin: "100 100", stagger: { each: 0.035, from: "start" }, duration: 0.7, ease: "back.out(2.2)" }, "rings+=1.1")

        /* ---- florals unfold from their stems ---------------------------- */
        .addLabel("flora", "rings+=0.25")
        .from("[data-spray]", { opacity: 0, scale: 0.78, rotate: (i: number) => (i % 2 ? 7 : -7), duration: 2.1, stagger: 0.14, ease: "power2.out" }, "flora")
        .to("[data-spray] [data-stem]", { strokeDashoffset: 0, duration: 1.7, stagger: 0.1, ease: "power2.out" }, "flora+=0.1")
        .from("[data-spray] [data-leaf]", { scaleX: 0.1, scaleY: 0.6, rotate: -14, svgOrigin: "0 0", duration: 1, stagger: { each: 0.025, from: "start" }, ease: "power2.out" }, "flora+=0.45")
        // petals unfold a whole ring at a time, from the outside in
        .from("[data-petal-ring]", { scale: 0.28, rotate: -26, opacity: 0, svgOrigin: "0 0", duration: 1.2, stagger: { each: 0.045, from: "end" }, ease: "power2.out" }, "flora+=0.7")
        .from("[data-spray] [data-berry]", { scale: 0, transformOrigin: "50% 50%", stagger: 0.04, duration: 0.6, ease: "back.out(3)" }, "flora+=1.25")

        /* ---- the words settle last -------------------------------------- */
        .addLabel("words", "flora+=0.85")
        .from("[data-l1] span", { opacity: 0, y: 12, rotateX: -55, transformPerspective: 500, stagger: 0.028, duration: 0.9, ease: "power2.out" }, "words")
        .fromTo("[data-l2]", { clipPath: "inset(-15% 100% -15% 0%)", opacity: 0.001 }, { clipPath: "inset(-15% 0% -15% 0%)", opacity: 1, duration: 1.5, ease: "power2.inOut" }, "words+=0.45")
        .from("[data-l2]", { y: 16, scale: 0.97, duration: 1.5, ease: "expo.out" }, "words+=0.45")
        .from("[data-open]", { opacity: 0, y: 14, scale: 0.94, duration: 0.9, ease: "back.out(1.5)" }, "words+=1.25")
        .fromTo("[data-open] .btn-pearl", { boxShadow: "0 0 0 0 rgba(198,167,117,0.55)" }, { boxShadow: "0 0 0 16px rgba(198,167,117,0)", duration: 1.2, ease: "power2.out" }, "words+=1.5");

      /* ---- idle life: kept out of the timeline, killed before leaving --- */
      idle.current = [
        gsap.to("[data-pearl]", { y: -9, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut" }),
        gsap.to("[data-pearl-floor]", { scaleX: 0.88, scaleY: 0.9, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut" }),
      ];

      const stopParallax = pointerParallax(
        [
          { el: "[data-par='1']", x: -22, y: -14 },
          { el: "[data-par='2']", x: 12, y: 9 },
        ],
        1.4,
      );

      if (reduced) tl.progress(1);
      if (autoplay)
        tl.eventCallback("onComplete", () => {
          window.setTimeout(() => handleOpen(), 1000);
        });

      return () => stopParallax();
    },
    [reduced, autoplay],
  );

  function handleOpen() {
    if (leaving.current) return;
    leaving.current = true;
    onOpen(); // user gesture → music may start
    tlRef.current?.progress(1);
    // the floating pearl and its shadow must stop writing to y/scale before the
    // camera push animates the same properties
    idle.current.forEach((t) => t.kill());

    if (reduced) {
      onHandoff();
      gsap.to(root.current, { opacity: 0, duration: 0.3, onComplete: onExited });
      return;
    }

    gsap
      .timeline({ onComplete: onExited })
      .to("[data-copy], [data-skip]", { opacity: 0, y: -12, duration: 0.5, ease: "power2.in" }, 0)
      .to("[data-spray]", { opacity: 0, scale: 1.12, duration: 1.1, ease: "power2.in", stagger: 0.04 }, 0.05)
      .to("[data-rings]", { scale: 1.75, opacity: 0, rotate: 8, duration: 1.2, ease: "power2.in" }, 0.15)
      .to("[data-pearl-floor]", { opacity: 0, duration: 0.5, ease: "power1.in" }, 0.15)
      .to("[data-pearl-wrap]", { y: "-5vh", duration: 0.7, ease: "power2.inOut" }, 0.15)
      // camera pushes into the pearl, whose light fills the frame
      .to("[data-pearl-wrap]", { scale: 2.9, opacity: 0, duration: 1.1, ease: "power3.in" }, 0.75)
      .fromTo("[data-bloom]", { scale: 0.3, opacity: 0 }, { scale: 8.5, opacity: 1, duration: 1.2, ease: "power2.in" }, 0.75)
      // the wreath starts drawing underneath while the light is still open,
      // so the two scenes share a moment instead of cutting
      .call(onHandoff, undefined, 1.25)
      .to(root.current, { opacity: 0, duration: 0.75, ease: "sine.inOut" }, 1.45);
  }

  return (
    <div ref={root} className="pearl-intro pearl-light fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Invitation cover">
      <div data-ambient className="paper absolute inset-0 opacity-60" />
      <div data-dawn className="pointer-events-none absolute inset-0" aria-hidden style={{ background: "radial-gradient(42% 32% at 50% 44%, rgba(255,255,255,0.9), rgba(255,255,255,0) 72%)" }} />
      <button
        data-skip
        type="button"
        onClick={handleOpen}
        className="tap absolute right-5 top-5 z-20 rounded-full px-3 py-2 text-[0.66rem] uppercase tracking-[0.3em] text-taupe/70 hover:text-taupe"
        style={{ marginTop: "env(safe-area-inset-top)" }}
      >
        Skip intro
      </button>

      {/* florals emerging from edges */}
      <div data-par="1" className="pointer-events-none absolute inset-0">
        <div data-spray className="absolute -left-12 -top-8 w-[82vw] max-w-[460px]">
          <Spray p="pi1" className="h-auto w-full" />
        </div>
        <div data-spray className="absolute -bottom-8 -right-12 w-[82vw] max-w-[480px] rotate-180">
          <Spray p="pi2" className="h-auto w-full" />
        </div>
        <div data-spray className="absolute -right-16 -top-16 hidden w-[30vw] max-w-[320px] -scale-x-100 opacity-80 sm:block">
          <Spray p="pi3" className="h-auto w-full" />
        </div>
        <div data-spray className="absolute -bottom-16 -left-16 hidden w-[30vw] max-w-[320px] -scale-y-100 opacity-80 sm:block">
          <Spray p="pi4" className="h-auto w-full" />
        </div>
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        <div data-par="2" className="relative grid place-items-center" style={{ width: "min(38vw, 180px)", aspectRatio: "1" }}>
          <div data-rings className="pointer-events-none absolute inset-0" style={{ perspective: "700px" }}>
            {RINGS.map((r, i) => (
              <div key={i} className="absolute left-1/2 top-1/2" style={{ width: `${r.size * 100}%`, aspectRatio: "1", transform: `translate(-50%,-50%) ${r.tilt}` }}>
                <svg viewBox="0 0 200 200" className="ring-spin h-full w-full overflow-visible" style={{ ["--rs" as string]: r.speed }}>
                  <defs>
                    <linearGradient id={`ir${i}`} x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stopColor="#F2E2C0" />
                      <stop offset="0.5" stopColor="#C6A775" />
                      <stop offset="1" stopColor="#A5834D" />
                    </linearGradient>
                  </defs>
                  <circle data-iring {...(r.dash ? { "data-dash": "" } : {})} cx="100" cy="100" r="98" fill="none" stroke={`url(#ir${i})`} strokeWidth={r.dash ? 1.6 : 0.9} strokeLinecap="round" />
                  {/* the bead of light that draws the ring */}
                  <g data-bead-orbit>
                    <circle data-bead cx="198" cy="100" r="2.8" fill="#FFFDF8" opacity="0" />
                  </g>
                  {i === 0 &&
                    Array.from({ length: 12 }, (_, k) => {
                      const a = (k / 12) * Math.PI * 2;
                      return <circle key={k} data-iring-pearl cx={Math.round((100 + 98 * Math.cos(a)) * 100) / 100} cy={Math.round((100 + 98 * Math.sin(a)) * 100) / 100} r={2.4} fill="#FFFDF8" stroke="#C6A775" strokeWidth="0.5" />;
                    })}
                </svg>
              </div>
            ))}
          </div>
          <div data-pearl-wrap className="relative h-full w-full">
            <div data-pearl className="pearl h-full w-full" />
          </div>
          <div data-bloom className="bloom pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-0" />
          <div data-pearl-floor className="pearl-floor absolute -bottom-[38%] left-1/2 h-[14%] w-[90%] -translate-x-1/2" />
        </div>

        <div data-copy className="relative mt-[13vh] text-center sm:mt-[12vh]">
          <p data-l1 className="whitespace-nowrap font-italiana text-[0.92rem] uppercase tracking-[0.3em] text-taupe sm:text-xl sm:tracking-[0.42em]" aria-label="An Evening of Elegance" style={{ perspective: "500px" }}>
            {"An Evening of Elegance".split("").map((c, i) => (
              <span key={i} aria-hidden className="inline-block whitespace-pre">
                {c}
              </span>
            ))}
          </p>
          <p data-l2 className="foil mt-3 font-pinyon text-[2.6rem] leading-tight sm:text-6xl">
            You Are Cordially Invited
          </p>
          <div data-open className="mt-7">
            <button type="button" className="btn-pearl" onClick={handleOpen} autoFocus>
              Open Invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
