"use client";

import { useRef } from "react";
import { useGsap, gsap } from "@/components/shared/useGsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { archHalf, cuspedArch, archOutline, rosette, star, type ArchSpec } from "./geometry";
import { RoyalDefs, Medallion } from "./ornaments";
import { COUPLE } from "@/data/wedding";

if (typeof window !== "undefined") gsap.registerPlugin(MotionPathPlugin);

const ARCH: ArchSpec = { x0: 130, x1: 470, base: 660, spring: 360, apex: 120 };
const HZ_L = "M300,660 C200,660 150,652 60,660 S-200,668 -420,660";
const HZ_R = "M300,660 C400,660 450,652 540,660 S800,668 1020,660";

export function RoyalIntro({
  onOpen,
  onExited,
  reduced,
  autoplay,
}: {
  onOpen: () => void;
  onExited: () => void;
  reduced: boolean;
  autoplay: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const leaving = useRef(false);

  useGsap(
    root,
    () => {
      const draw = (sel: string) => {
        gsap.utils.toArray<SVGPathElement>(sel).forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
      };
      draw("[data-thread]");
      draw("[data-arch]");
      draw("[data-cusp]");

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      tlRef.current = tl;
      tl.from("[data-light]", { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 1.1, ease: "expo.out" })
        .to("[data-light-core]", { attr: { r: 5 }, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, "-=0.4")
        .addLabel("thread")
        .to("[data-thread]", { strokeDashoffset: 0, duration: 1.6 }, "thread")
        .to("[data-spark='hl']", { motionPath: { path: HZ_L }, duration: 1.6 }, "thread")
        .to("[data-spark='hr']", { motionPath: { path: HZ_R }, duration: 1.6 }, "thread")
        .to("[data-spark^='h']", { opacity: 0, duration: 0.3 }, "thread+=1.3")
        .addLabel("arch", "thread+=0.55")
        .to("[data-arch]", { strokeDashoffset: 0, duration: 2.1, ease: "power1.inOut" }, "arch")
        .to("[data-spark='al']", { motionPath: { path: archHalf(ARCH, "left") }, duration: 2.1, ease: "power1.inOut" }, "arch")
        .to("[data-spark='ar']", { motionPath: { path: archHalf(ARCH, "right") }, duration: 2.1, ease: "power1.inOut" }, "arch")
        .set("[data-spark^='a']", { opacity: 1 }, "arch")
        .to("[data-spark^='a']", { opacity: 0, duration: 0.25 }, "arch+=2.05")
        .from("[data-finial]", { scale: 0, opacity: 0, transformOrigin: "50% 50%", duration: 0.8, ease: "back.out(2)" }, "arch+=1.95")
        .to("[data-flash]", { opacity: 0.9, scale: 1.6, transformOrigin: "50% 50%", duration: 0.25, ease: "power1.out" }, "arch+=2.0")
        .to("[data-flash]", { opacity: 0, scale: 2.4, duration: 0.8 }, ">")
        .to("[data-cusp]", { strokeDashoffset: 0, duration: 1.4 }, "arch+=1.9")
        .from("[data-jali]", { opacity: 0, duration: 1.8, ease: "sine.inOut" }, "arch+=2.2")
        .from("[data-engrave]", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", stagger: 0.06, duration: 0.6, ease: "back.out(1.6)" }, "arch+=2.3")
        .from("[data-medallion]", { scale: 0.4, opacity: 0, rotate: -40, transformOrigin: "50% 50%", duration: 1.4, ease: "expo.out" }, "arch+=2.6")
        .from("[data-mono]", { opacity: 0, y: 8, stagger: 0.18, duration: 0.8, ease: "power3.out" }, "arch+=3.0")
        .from("[data-copy] > *", { opacity: 0, y: 18, filter: "blur(6px)", stagger: 0.16, duration: 1, ease: "power3.out" }, "arch+=3.1")
        .to("[data-light]", { opacity: 0.35, duration: 1.5 }, "arch+=1");

      gsap.to("[data-medallion-spin]", { rotate: 360, duration: 90, repeat: -1, ease: "none", transformOrigin: "50% 50%" });

      if (reduced) tl.progress(1);
      if (autoplay) tl.eventCallback("onComplete", () => {
          window.setTimeout(() => handleOpen(), 1200);
        });
    },
    [reduced, autoplay],
  );

  function handleOpen() {
    if (leaving.current) return;
    leaving.current = true;
    onOpen(); // user gesture → music may start
    tlRef.current?.progress(1);
    if (reduced) {
      gsap.to(root.current, { opacity: 0, duration: 0.3, onComplete: onExited });
      return;
    }
    const out = gsap.timeline({ onComplete: onExited });
    out
      .to("[data-copy], [data-skip]", { opacity: 0, y: -10, duration: 0.5, ease: "power2.in" }, 0)
      .to("[data-stage]", { scale: 7.5, duration: 2.0, ease: "power3.in", transformOrigin: "50% 48%" }, 0.2)
      .to("[data-stage]", { opacity: 0, duration: 0.6, ease: "power1.in" }, 1.6)
      .to(root.current, { backgroundColor: "rgba(11,20,39,0)", duration: 0.8 }, 1.5);
  }

  return (
    <div
      ref={root}
      className="royal-intro fixed inset-0 z-50 flex flex-col items-center overflow-hidden bg-navy"
      role="dialog"
      aria-modal="true"
      aria-label="Invitation cover"
    >
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 55% at 50% 58%, rgba(197,164,109,0.10), transparent 70%)" }} />
      <button
        data-skip
        type="button"
        onClick={handleOpen}
        className="absolute right-4 top-4 z-10 font-[family-name:var(--font-cinzel)] text-[0.65rem] uppercase tracking-[0.3em] text-gold/80 underline-offset-4 hover:text-gold hover:underline sm:right-8 sm:top-6"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        Skip intro
      </button>

      <div data-stage className="relative flex min-h-0 w-full flex-1 items-end justify-center">
        <svg viewBox="0 0 600 700" className="h-full max-h-[78vh] w-full overflow-visible" preserveAspectRatio="xMidYMax meet" aria-hidden>
          <RoyalDefs p="ri" />
          <clipPath id="ri-clip">
            <path d={archOutline(ARCH) + " Z"} />
          </clipPath>
          {/* jali spandrels */}
          <g data-jali>
            <path d={`M90,660 L90,80 L510,80 L510,660 ${archOutline(ARCH).replace("M", "L")} Z`} fill="url(#ri-jali)" fillRule="evenodd" opacity="0.32" />
            <path d="M90,80 H510 M90,72 H510" stroke="url(#ri-gold)" strokeWidth="0.8" />
            <path d="M90,660 V80 M510,660 V80" stroke="url(#ri-gold)" strokeWidth="0.6" opacity="0.6" />
          </g>
          {/* inner glow of the opening */}
          <path d={archOutline(ARCH) + " Z"} fill="url(#ri-glow)" opacity="0.18" />

          <path data-thread d={HZ_L} fill="none" stroke="url(#ri-gold)" strokeWidth="1.4" filter="url(#ri-soft)" />
          <path data-thread d={HZ_R} fill="none" stroke="url(#ri-gold)" strokeWidth="1.4" filter="url(#ri-soft)" />
          <path data-arch d={archHalf(ARCH, "left")} fill="none" stroke="url(#ri-gold)" strokeWidth="2" filter="url(#ri-soft)" />
          <path data-arch d={archHalf(ARCH, "right")} fill="none" stroke="url(#ri-gold)" strokeWidth="2" filter="url(#ri-soft)" />
          <path data-cusp d={cuspedArch(ARCH, 4, 18)} fill="none" stroke="url(#ri-gold)" strokeWidth="1" opacity="0.9" />

          {/* engravings on pillars */}
          {[420, 500, 580].map((y) => (
            <g key={y}>
              <path data-engrave d={rosette(ARCH.x0 - 1, y, 9, 8, 0.4)} fill="none" stroke="#C5A46D" strokeWidth="0.6" />
              <path data-engrave d={rosette(ARCH.x1 + 1, y, 9, 8, 0.4)} fill="none" stroke="#C5A46D" strokeWidth="0.6" />
            </g>
          ))}
          <g data-finial>
            <path d={star(300, 96, 14, 5, 8)} fill="url(#ri-gold)" />
            <path d="M300,110 V122" stroke="url(#ri-gold)" strokeWidth="1.2" />
          </g>
          <circle data-flash cx="300" cy="120" r="26" fill="url(#ri-glow)" opacity="0" />

          {/* medallion + monogram */}
          <g data-medallion>
            <g data-medallion-spin>
              <Medallion x={210} y={300} width={180} height={180} p="rim" />
            </g>
            <text data-mono x="268" y="404" textAnchor="middle" fill="url(#ri-gold)" style={{ fontFamily: "var(--font-cinzel)", fontSize: 42, fontWeight: 600 }}>
              {COUPLE.monogram[0]}
            </text>
            <path data-mono d={star(300, 390, 6, 2.4, 4)} fill="#C5A46D" />
            <text data-mono x="332" y="404" textAnchor="middle" fill="url(#ri-gold)" style={{ fontFamily: "var(--font-cinzel)", fontSize: 42, fontWeight: 600 }}>
              {COUPLE.monogram[1]}
            </text>
          </g>

          {/* the light */}
          <g data-light>
            <circle cx="300" cy="660" r="60" fill="url(#ri-glow)" />
            <circle data-light-core cx="300" cy="660" r="3" fill="#FFF7E0" />
          </g>
          <circle data-spark="hl" cx="0" cy="0" r="3.5" fill="#FFF4D6" filter="url(#ri-soft)" transform="translate(300 660)" />
          <circle data-spark="hr" cx="0" cy="0" r="3.5" fill="#FFF4D6" filter="url(#ri-soft)" transform="translate(300 660)" />
          <circle data-spark="al" cx="0" cy="0" r="4" fill="#FFF4D6" filter="url(#ri-soft)" opacity="0" />
          <circle data-spark="ar" cx="0" cy="0" r="4" fill="#FFF4D6" filter="url(#ri-soft)" opacity="0" />
        </svg>
      </div>

      <div data-copy className="relative z-10 flex flex-col items-center px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 text-center">
        <p className="font-[family-name:var(--font-cinzel)] text-[0.62rem] uppercase tracking-[0.45em] text-gold/80">The family of {COUPLE.groom}</p>
        <p className="mt-3 font-[family-name:var(--font-cormorant)] text-[1.9rem] italic leading-none text-ivory sm:text-[2.3rem]">
          {COUPLE.groom} <span className="text-gold">&amp;</span> {COUPLE.bride}
        </p>
        <p className="mt-2 font-[family-name:var(--font-cinzel)] text-[0.62rem] uppercase tracking-[0.4em] text-ivory/60">Sehra Bandi · Barat · Nikah</p>
        <button type="button" onClick={handleOpen} className="btn-gold mt-6" autoFocus>
          Open Our Invitation
        </button>
      </div>
    </div>
  );
}
