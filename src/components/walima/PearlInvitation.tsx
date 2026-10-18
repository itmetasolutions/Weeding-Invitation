"use client";

import { useEffect, useRef, useState } from "react";
import { COUPLE, EVENTS, formatDate, formatTime, longDate } from "@/data/wedding";
import { mapsLink } from "@/lib/maps";
import { pad, useAutoplayFlag, useCountdown, useReducedMotion } from "@/lib/hooks";
import { whatsappUrl, currentUrl } from "@/lib/share";
import { CalendarMenu } from "@/components/shared/CalendarMenu";
import { useInvitationShell } from "@/components/shared/useInvitationShell";
import { useGsap, gsap, ScrollTrigger } from "@/components/shared/useGsap";
import { configureMotion, inViewFlag, pauseOffscreen, pointerParallax, prepareDraw, refreshWhenSettled, smallScreen } from "@/components/shared/motion";
import { IconPin, IconReplay, IconShare, IconSoundOff, IconSoundOn, IconWhatsApp } from "@/components/shared/icons";
import { PearlIntro } from "./PearlIntro";
import { PetalDrift } from "./PetalDrift";
import { Garland, Spray, Wreath } from "./botanicals";

const W = EVENTS.walima;
const cal = { button: "btn-ghost", menu: "pcal-menu", item: "pcal-item" };
const SHARE_TEXT = `You are warmly invited to the Walima Reception of ${COUPLE.groom} & ${COUPLE.bride} · ${longDate(W.start)}, ${formatTime(W.start)} · ${W.venue.name}, Lahore.`;

export function PearlInvitation() {
  const reduced = useReducedMotion();
  const autoplay = useAutoplayFlag();
  const shell = useInvitationShell({ voice: "pearl", shareTitle: `Walima Reception · ${COUPLE.groom} & ${COUPLE.bride}`, shareText: SHARE_TEXT });
  const [introGone, setIntroGone] = useState(false);
  // The body starts while the intro's light is still open, so the pearl hands
  // over to the wreath instead of the page cutting between two scenes.
  const [handed, setHanded] = useState(false);
  const [waHref, setWaHref] = useState(whatsappUrl(SHARE_TEXT, ""));
  useEffect(() => setWaHref(whatsappUrl(SHARE_TEXT, currentUrl())), []);

  const replay = () => {
    setIntroGone(false);
    setHanded(false);
    shell.replay();
  };

  return (
    <div className="pearl-site relative min-h-[100svh] overflow-x-clip">
      <a href="#reception" className="sr-only-focusable fixed left-3 top-3 z-[60] rounded-full bg-white px-4 py-2 text-taupe shadow">
        Skip to reception details
      </a>
      <div className="paper pointer-events-none fixed inset-0 z-0 opacity-70" aria-hidden />
      {handed && <PetalDrift />}

      {!introGone && (
        <PearlIntro
          key={`intro-${shell.run}`}
          reduced={reduced}
          autoplay={autoplay}
          onOpen={() => shell.open(true)}
          onHandoff={() => setHanded(true)}
          onExited={() => setIntroGone(true)}
        />
      )}

      <PearlBody key={`body-${shell.run}`} ready={handed} reduced={reduced} autoplay={autoplay} waHref={waHref} onShare={shell.share} onReplay={replay} />

      {introGone && (
        <nav
          aria-label="Invitation controls"
          className="pearl-dock fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-champagne/50 bg-white/75 p-1.5 shadow-[0_18px_40px_-18px_rgba(98,83,73,0.6)] backdrop-blur-md"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <PillBtn label={shell.musicOn ? "Mute music" : "Play music"} onClick={shell.toggleMusic} pressed={shell.musicOn}>
            {shell.musicOn ? <IconSoundOn className="h-[18px] w-[18px]" /> : <IconSoundOff className="h-[18px] w-[18px]" />}
          </PillBtn>
          <span className="h-5 w-px bg-champagne/40" aria-hidden />
          <PillBtn label="Replay animation" onClick={replay}>
            <IconReplay className="h-[18px] w-[18px]" />
          </PillBtn>
          <span className="h-5 w-px bg-champagne/40" aria-hidden />
          <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" title="Share on WhatsApp" className="tap grid h-10 w-10 place-items-center rounded-full text-taupe transition hover:bg-pearl">
            <IconWhatsApp className="h-[18px] w-[18px]" />
          </a>
          <span className="h-5 w-px bg-champagne/40" aria-hidden />
          <PillBtn label="Share invitation" onClick={shell.share}>
            <IconShare className="h-[18px] w-[18px]" />
          </PillBtn>
        </nav>
      )}

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-6 z-[60] flex justify-center">
        {shell.toast && <span className="rounded-full bg-white px-5 py-3 text-[0.72rem] uppercase tracking-[0.2em] text-taupe shadow-xl">{shell.toast}</span>}
      </div>
      <noscript>
        <style>{`.pearl-intro{display:none!important}html{overflow:auto!important}`}</style>
      </noscript>
    </div>
  );
}

function PillBtn({ label, onClick, children, pressed }: { label: string; onClick: () => void; children: React.ReactNode; pressed?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} className="tap grid h-10 w-10 place-items-center rounded-full text-taupe transition hover:bg-pearl">
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

function Odometer({ value, className }: { value: string; className?: string }) {
  return (
    <span className={`odo ${className ?? ""}`} aria-hidden>
      {value.split("").map((d, i) => (
        <span key={i} data-odo={d}>
          {Array.from({ length: 30 }, (_, k) => (
            <span key={k}>{k % 10}</span>
          ))}
        </span>
      ))}
    </span>
  );
}

function PearlBody({ ready, reduced, autoplay, waHref, onShare, onReplay }: { ready: boolean; reduced: boolean; autoplay: boolean; waHref: string; onShare: () => void; onReplay: () => void }) {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGsap(
    root,
    () => {
      configureMotion();

      // Odometer rest positions are always set, including for reduced motion.
      gsap.utils.toArray<HTMLElement>("[data-odo]").forEach((col) => {
        const d = Number(col.dataset.odo);
        gsap.set(col, { yPercent: -((20 + d) / 30) * 100 });
      });
      if (!ready || reduced) return;

      const small = smallScreen();
      const cleanups: (() => void)[] = [];

      /* ================================================================
         Scene 2 — the wreath. The intro's ring of light becomes a ring of
         flowers: the circle is drawn by a travelling bead, stems follow it,
         then petals unfold ring by ring and the names settle last.
         Time-based: this moment should play, not be scrubbed.
      ================================================================ */
      const rings = prepareDraw("[data-sec='reveal'] [data-ring-draw]");
      const stems = prepareDraw("[data-sec='reveal'] [data-stem]");

      const reveal = gsap.timeline({ defaults: { ease: "power3.out" } });
      reveal
        .addLabel("ring")
        .to(rings, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", stagger: 0.16 }, "ring")
        .set("[data-wreath-bead]", { opacity: 1 }, "ring")
        .to("[data-wreath-orbit]", { rotate: 360, svgOrigin: "250 250", duration: 1.5, ease: "power2.inOut" }, "ring")
        .to("[data-wreath-bead]", { opacity: 0, duration: 0.45, ease: "sine.in" }, "ring+=1.3")

        .addLabel("grow", "ring+=0.55")
        .to(stems, { strokeDashoffset: 0, duration: 1.5, ease: "power2.out", stagger: 0.12 }, "grow")
        .from("[data-sec='reveal'] [data-leaf]", { scaleX: 0.12, scaleY: 0.65, rotate: -16, svgOrigin: "0 0", duration: 0.95, stagger: { each: 0.03, from: "start" }, ease: "power2.out" }, "grow+=0.25")
        // a rose opens a whole ring of petals at a time, outer ring first
        .from("[data-sec='reveal'] [data-petal-ring]", { scale: 0.3, rotate: -24, opacity: 0, svgOrigin: "0 0", duration: 1.15, stagger: { each: 0.04, from: "end" }, ease: "power2.out" }, "grow+=0.5")
        .from("[data-sec='reveal'] [data-berry]", { scale: 0, transformOrigin: "50% 50%", stagger: 0.05, duration: 0.6, ease: "back.out(3)" }, "grow+=1.05")

        /* the names — the beat that gets room to breathe */
        .addLabel("names", "grow+=0.75")
        .fromTo("[data-r-kicker]", { clipPath: "inset(-20% 100% -20% 0%)", opacity: 0.001 }, { clipPath: "inset(-20% 0% -20% 0%)", opacity: 1, duration: 1.1, ease: "power2.inOut" }, "names")
        .fromTo(
          "[data-r-name]",
          { clipPath: "inset(-12% 0% 115% 0%)", y: 26, scale: 0.97, opacity: 0.001 },
          { clipPath: "inset(-12% 0% -12% 0%)", y: 0, scale: 1, opacity: 1, duration: 1.3, stagger: 0.24, ease: "expo.out" },
          "names+=0.3",
        )
        .from("[data-r-foot]", { opacity: 0, y: 12, duration: 1, ease: "power2.out" }, "names+=1.5");

      /* Scene 2 → 3 handoff: the ring opens and lifts away as the garden
         arrives underneath. Scrubbed, so the guest's scroll drives the cut. */
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-sec='reveal']", start: "top top", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } })
        .to("[data-wreath]", { scale: small ? 1.1 : 1.18, opacity: 0.25, yPercent: -4, ease: "none", force3D: true }, 0)
        .to("[data-r-text]", { yPercent: -22, opacity: 0.15, ease: "none", force3D: true }, 0);

      /* the wreath turns slowly, but only while it is on screen */
      const spin = gsap.to("[data-wreath-spin]", { rotate: 360, duration: 240, repeat: -1, ease: "none", transformOrigin: "50% 50%" });
      ScrollTrigger.create({
        trigger: "[data-sec='reveal']",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? spin.play() : spin.pause()),
      });

      /* ================================================================
         Scene 3 — the garden drifts past the camera, then the date arrives
      ================================================================ */
      const depth = small ? 0.55 : 1;
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-sec='garden']", start: "top bottom", end: "bottom top", scrub: 1.1, invalidateOnRefresh: true } })
        .fromTo("[data-g='far']", { yPercent: 16 * depth }, { yPercent: -16 * depth, ease: "none", force3D: true }, 0)
        // scale stays modest: these layers carry a CSS blur, and a large scale
        // range re-rasterises it on every frame
        .fromTo("[data-g='near-l']", { xPercent: 0, yPercent: 26 * depth, scale: 1 }, { xPercent: -26 * depth, yPercent: -24 * depth, scale: 1 + 0.18 * depth, ease: "none", force3D: true }, 0)
        .fromTo("[data-g='near-r']", { xPercent: 0, yPercent: 32 * depth, scale: 1 }, { xPercent: 26 * depth, yPercent: -20 * depth, scale: 1 + 0.2 * depth, ease: "none", force3D: true }, 0)
        .fromTo("[data-g='bokeh']", { yPercent: 8 * depth }, { yPercent: -28 * depth, ease: "none", force3D: true }, 0);

      /* invitation line: words lift into focus with the scroll (no blur — a
         blurred paragraph under scrub re-rasterises every frame) */
      gsap.fromTo(
        "[data-together] span",
        { opacity: 0.12, yPercent: 14 },
        {
          opacity: 1,
          yPercent: 0,
          stagger: 0.05,
          ease: "none",
          force3D: true,
          scrollTrigger: { trigger: "[data-together]", start: "top 82%", end: "bottom 58%", scrub: 0.5, invalidateOnRefresh: true },
        },
      );

      /* the date: a held, time-based reveal */
      const dateTl = gsap.timeline({ scrollTrigger: { trigger: "[data-date]", start: "top 78%", invalidateOnRefresh: true }, defaults: { ease: "power3.out" } });
      dateTl.from("[data-date-line]", { scaleX: 0, duration: 1.2, ease: "expo.inOut" }, 0);
      gsap.utils.toArray<HTMLElement>("[data-odo]").forEach((col, i) => {
        const d = Number(col.dataset.odo);
        dateTl.fromTo(col, { yPercent: 0 }, { yPercent: -((20 + d) / 30) * 100, duration: 1.6 + i * 0.14, ease: "power4.out" }, i * 0.07);
      });
      dateTl
        .from("[data-month] span", { opacity: 0, y: 24, rotateX: -80, transformPerspective: 400, stagger: 0.055, duration: 0.95, ease: "back.out(1.5)" }, 0.25)
        .fromTo(
          "[data-weekday]",
          { clipPath: "inset(-15% 100% -15% 0%)", y: 14, scale: 0.98, opacity: 0.001 },
          { clipPath: "inset(-15% 0% -15% 0%)", y: 0, scale: 1, opacity: 1, duration: 1.4, ease: "expo.out" },
          0.95,
        );

      /* ================================================================
         Scene 4 — the reception card rises out of the garden
      ================================================================ */
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-sec='reception']", start: "top 72%", invalidateOnRefresh: true }, defaults: { ease: "expo.out" } })
        .from("[data-card-wrap]", { opacity: 0, y: 90, rotateX: 18, scale: 0.96, transformPerspective: 1000, duration: 1.4 })
        .from("[data-card-rule] ", { scaleX: 0, transformOrigin: "50% 50%", duration: 1, ease: "power2.inOut" }, 0.35)
        .fromTo(
          "[data-card-line]",
          { clipPath: "inset(-20% 0% 110% 0%)", y: 14, opacity: 0.001 },
          { clipPath: "inset(-20% 0% -20% 0%)", y: 0, opacity: 1, duration: 0.9, stagger: 0.075 },
          0.45,
        );

      /* ================================================================
         Scene 5 — the countdown: circles again, echoing the pearl rings
      ================================================================ */
      const dials = prepareDraw("[data-dial-track]");
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-sec='countdown']", start: "top 78%", invalidateOnRefresh: true }, defaults: { ease: "expo.out" } })
        .from("[data-dial]", { opacity: 0, scale: 0.86, rotate: -12, stagger: { each: 0.09, from: "center" }, duration: 1.2 }, 0)
        .to(dials, { strokeDashoffset: 0, duration: 1.6, stagger: 0.1, ease: "power2.inOut" }, 0.15);

      /* ================================================================
         Scene 6 — the final frame: garlands draw it, then the words arrive
      ================================================================ */
      const fStems = prepareDraw("[data-sec='final'] [data-stem]");
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-sec='final']", start: "top 70%", invalidateOnRefresh: true }, defaults: { ease: "expo.out" } })
        .from("[data-frame]", { opacity: 0, scale: 0.95, duration: 1.5 }, 0)
        .to(fStems, { strokeDashoffset: 0, duration: 2, ease: "power2.inOut" }, 0)
        .from("[data-sec='final'] [data-leaf]", { scaleX: 0.15, scaleY: 0.7, rotate: -12, svgOrigin: "0 0", stagger: 0.04, duration: 0.9, ease: "power2.out" }, 0.45)
        .from("[data-sec='final'] [data-petal-ring]", { scale: 0.3, rotate: -20, opacity: 0, svgOrigin: "0 0", stagger: 0.05, duration: 1.1, ease: "power2.out" }, 0.6)
        .from("[data-sec='final'] [data-berry]", { scale: 0, transformOrigin: "50% 50%", stagger: 0.035, duration: 0.6, ease: "back.out(3)" }, 0.8)
        .fromTo(
          "[data-fin] > *",
          { clipPath: "inset(-20% 0% 110% 0%)", y: 18, opacity: 0.001 },
          { clipPath: "inset(-20% 0% -20% 0%)", y: 0, opacity: 1, duration: 1, stagger: 0.09 },
          0.7,
        );

      /* ---- pointer life, only where it is visible and only with a mouse ---- */
      const revealSeen = inViewFlag("[data-sec='reveal']");
      const cardSeen = inViewFlag("[data-sec='reception']");
      cleanups.push(
        pointerParallax(
          [
            { el: "[data-wreath]", x: -16, y: -11, rotate: 1.6, when: () => revealSeen.value },
            { el: "[data-r-text]", x: 9, y: 7, when: () => revealSeen.value },
            { el: card.current, rotateY: 9, rotateX: 7, when: () => cardSeen.value },
          ],
          1.3,
        ),
        pauseOffscreen(root.current, ".foil, .bokeh, .float-y"),
        refreshWhenSettled(),
      );

      if (autoplay) {
        const total = document.documentElement.scrollHeight - innerHeight;
        const proxy = { y: 0 };
        gsap.to(proxy, { y: total, duration: 32, ease: "none", delay: 4, onUpdate: () => window.scrollTo(0, proxy.y) });
      }

      return () => cleanups.forEach((fn) => fn());
    },
    [ready, reduced, autoplay],
  );

  const together = "Together with our families, we warmly invite you to celebrate our Walima Reception.";

  return (
    <main ref={root} className="relative z-10">
      {/* Scene 2 — The floral reveal */}
      <section data-sec="reveal" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-16" aria-labelledby="w-title">
        <div className="pearl-light absolute inset-0 opacity-80" aria-hidden />
        <div className="relative grid w-[min(94vw,640px)] place-items-center" style={{ aspectRatio: "1" }}>
          <div data-wreath className="absolute inset-0">
            <div data-wreath-spin className="h-full w-full">
              <Wreath p="wr" className="h-full w-full" />
            </div>
          </div>
          <div data-r-text className="relative px-10 text-center">
            <p data-r-kicker className="font-italiana text-[0.95rem] uppercase tracking-[0.5em] text-taupe sm:text-lg">
              Walima Reception
            </p>
            <h1 id="w-title" className="mt-3 font-pinyon leading-[0.95] text-taupe">
              <span data-r-name className="foil block text-[3.6rem] sm:text-[5.6rem]">{COUPLE.groom}</span>
              <span data-r-name className="block font-italiana text-2xl text-champagne sm:text-3xl">&amp;</span>
              <span data-r-name className="foil block text-[3.6rem] sm:text-[5.6rem]">{COUPLE.bride}</span>
            </h1>
            <p data-r-foot className="mt-4 text-[0.7rem] uppercase tracking-[0.35em] text-taupe/80">
              {formatDate(W.start, { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </section>

      {/* Scene 3 — The celebration of togetherness */}
      <section data-sec="garden" className="relative overflow-hidden px-6 py-32 sm:py-44" aria-labelledby="date-title">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div data-g="far" className="depth absolute inset-0 opacity-40 blur-[3px]">
            <Spray p="gf1" className="absolute -left-16 top-[8%] w-[60vw] max-w-[420px] rotate-[20deg]" />
            <Spray p="gf2" className="absolute -right-16 bottom-[6%] w-[60vw] max-w-[420px] rotate-[200deg]" />
          </div>
          <div data-g="bokeh" className="depth absolute inset-0">
            {[
              [12, 20, 60],
              [80, 14, 90],
              [65, 60, 50],
              [20, 75, 80],
              [45, 35, 40],
              [88, 80, 70],
            ].map(([l, t, s], i) => (
              <span key={i} className="bokeh" style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDelay: `${-i * 2}s` }} />
            ))}
          </div>
          <div data-g="near-l" className="depth absolute -left-24 top-[30%] w-[70vw] max-w-[520px] opacity-90 blur-[1.5px]">
            <Spray p="gn1" className="h-auto w-full rotate-[50deg]" />
          </div>
          <div data-g="near-r" className="depth absolute -right-24 top-[5%] w-[70vw] max-w-[520px] opacity-90 blur-[1.5px]">
            <Spray p="gn2" className="h-auto w-full -scale-x-100 rotate-[-40deg]" />
          </div>
        </div>

        <div className="relative mx-auto max-w-2xl text-center">
          <p data-together className="font-italiana text-[1.75rem] leading-[1.45] text-taupe sm:text-[2.4rem]">
            {together.split(" ").map((w, i) => (
              <span key={i} className="inline-block">
                {w}&nbsp;
              </span>
            ))}
          </p>

          <div data-date className="mt-20 flex flex-col items-center">
            <h2 id="date-title" className="sr-only">
              {longDate(W.start)}
            </h2>
            <div className="flex items-center gap-5 sm:gap-8" aria-hidden>
              <Odometer value={formatDate(W.start, { day: "2-digit" })} className="font-italiana text-[5.5rem] text-taupe sm:text-[8rem]" />
              <div className="flex flex-col items-start">
                <span data-month className="font-italiana text-[1.6rem] uppercase tracking-[0.35em] text-champagne sm:text-[2.4rem]" style={{ perspective: "400px" }}>
                  {formatDate(W.start, { month: "long" }).split("").map((c, i) => (
                    <span key={i} className="inline-block">
                      {c}
                    </span>
                  ))}
                </span>
                <span data-date-line className="my-2 block h-px w-full origin-left bg-champagne/60" />
                <Odometer value={formatDate(W.start, { year: "numeric" })} className="font-italiana text-[1.6rem] tracking-[0.35em] text-taupe sm:text-[2.4rem]" />
              </div>
            </div>
            <p data-weekday className="foil mt-4 font-pinyon text-5xl sm:text-6xl">
              {formatDate(W.start, { weekday: "long" }).replace(",", "")}
            </p>
          </div>
        </div>
      </section>

      {/* Scene 4 — Event details: floating reception card */}
      <section data-sec="reception" id="reception" className="relative px-5 py-24" aria-labelledby="rc-title" style={{ perspective: "1200px" }}>
        <div data-card-wrap className="mx-auto max-w-md">
          <div className="float-y">
            <div ref={card} className="reception-card" style={{ transformStyle: "preserve-3d" }}>
              <div className="inner px-7 pb-10 pt-12 text-center sm:px-12">
                <svg viewBox="0 0 120 30" className="mx-auto h-6 w-28" aria-hidden>
                  <path d="M0 15 H45 M75 15 H120" stroke="#C6A775" strokeWidth="0.8" />
                  <circle cx="60" cy="15" r="6" fill="#FFFDF8" stroke="#C6A775" strokeWidth="0.8" />
                  <circle cx="50" cy="15" r="2" fill="#C6A775" />
                  <circle cx="70" cy="15" r="2" fill="#C6A775" />
                </svg>
                <h2 id="rc-title" data-card-line className="mt-5 font-italiana text-[1.9rem] uppercase tracking-[0.3em] text-taupe sm:text-[2.2rem]">
                  Walima
                  <span className="block text-[0.95rem] tracking-[0.55em] text-champagne">Reception</span>
                </h2>
                <p data-card-line className="mt-7 text-[1.05rem] tracking-[0.06em] text-taupe">
                  {longDate(W.start)}
                </p>
                <p data-card-line className="mt-2 font-italiana text-4xl text-taupe">{formatTime(W.start)}</p>
                <div data-card-rule className="mx-auto my-7 h-px w-20 bg-gradient-to-r from-transparent via-champagne to-transparent" />
                <p data-card-line className="font-italiana text-xl tracking-[0.12em] text-taupe">{W.venue.name}</p>
                <address data-card-line className="mt-2 not-italic text-[0.98rem] leading-relaxed text-taupe/80">
                  {W.venue.addressLines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
                <div data-card-line className="mt-8 flex flex-col items-center gap-3">
                  <a className="btn-pearl" href={mapsLink(W.venue)} target="_blank" rel="noopener noreferrer">
                    <IconPin className="h-4 w-4" /> View Location
                  </a>
                  <CalendarMenu event={W} classes={cal} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PearlCountdown />

      {/* Scene 5 — Final invitation */}
      <section data-sec="final" className="relative px-4 pb-40 pt-16" aria-labelledby="fin-title">
        <div className="relative mx-auto max-w-xl">
          <div data-frame className="final-frame pointer-events-none absolute inset-0" aria-hidden />
          <Garland p="fg1" className="absolute -top-6 left-1/2 w-[86%] -translate-x-1/2" />
          <Garland p="fg2" className="absolute -bottom-6 left-1/2 w-[86%] -translate-x-1/2 rotate-180" />

          <div data-fin className="relative flex flex-col items-center px-7 py-24 text-center sm:px-16 sm:py-28">
            <p className="font-italiana text-[1.35rem] tracking-[0.08em] text-taupe sm:text-2xl">Two Hearts, One Beautiful Journey.</p>
            <h2 id="fin-title" className="mt-4 font-pinyon leading-[1]">
              <span className="foil block text-[3.3rem] sm:text-[4.6rem]">{COUPLE.groom}</span>
              <span className="block font-italiana text-xl text-champagne">&amp;</span>
              <span className="foil block text-[3.3rem] sm:text-[4.6rem]">{COUPLE.bride}</span>
            </h2>
            <p className="mt-6 max-w-sm text-[1.02rem] leading-relaxed text-taupe/90">Your gracious presence and heartfelt blessings would mean the world to us.</p>
            <div className="my-7 h-px w-24 bg-gradient-to-r from-transparent via-champagne to-transparent" />
            <p className="text-[0.78rem] uppercase tracking-[0.3em] text-taupe">{longDate(W.start)}</p>
            <p className="mt-2 font-italiana text-3xl text-taupe">{formatTime(W.start)}</p>
            <p className="mt-2 text-[0.95rem] text-taupe/85">{W.venue.name}, Lahore.</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a className="btn-pearl" href={mapsLink(W.venue)} target="_blank" rel="noopener noreferrer">
                <IconPin className="h-4 w-4" /> View Location
              </a>
              <CalendarMenu event={W} classes={cal} />
            </div>
            <p className="mt-10 font-pinyon text-[1.9rem] leading-snug text-champagne sm:text-[2.2rem]">We look forward to sharing this beautiful evening with you.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a className="btn-ghost" href={waHref} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp className="h-4 w-4" /> WhatsApp
              </a>
              <button type="button" className="btn-ghost" onClick={onShare}>
                <IconShare className="h-4 w-4" /> Share
              </button>
              <button type="button" className="btn-ghost" onClick={onReplay}>
                <IconReplay className="h-4 w-4" /> Replay
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PearlCountdown() {
  const r = useCountdown(W.start);
  const dials: { label: string; v?: number; max: number }[] = [
    { label: "Days", v: r?.days, max: 60 },
    { label: "Hours", v: r?.hours, max: 24 },
    { label: "Minutes", v: r?.minutes, max: 60 },
    { label: "Seconds", v: r?.seconds, max: 60 },
  ];
  const C = 2 * Math.PI * 44;
  return (
    <section data-sec="countdown" className="relative px-5 py-20 text-center" aria-labelledby="pcd-title">
      <p className="text-[0.7rem] uppercase tracking-[0.4em] text-taupe/70">Until the Walima</p>
      <h2 id="pcd-title" className="foil mt-2 font-pinyon text-5xl">
        Counting the moments
      </h2>
      {r?.done ? (
        <p className="mt-10 font-italiana text-2xl tracking-[0.15em] text-taupe">The evening has arrived · Mubarak!</p>
      ) : (
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 gap-2 sm:gap-5" role="timer" aria-live="off">
          {dials.map((d) => {
            const frac = d.v === undefined ? 0 : Math.min(1, d.v / d.max);
            return (
              <div key={d.label} data-dial className="relative">
                <svg viewBox="0 0 100 100" className="w-full -rotate-90" aria-hidden>
                  <circle cx="50" cy="50" r="44" fill="rgba(255,255,255,0.6)" stroke="#E5D8C5" strokeWidth="1.2" />
                  <circle data-dial-track cx="50" cy="50" r="40" fill="none" stroke="#E5D8C5" strokeWidth="0.5" />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#C6A775"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - frac)}
                    style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.2,0.8,0.2,1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-italiana text-[1.7rem] tabular-nums leading-none text-taupe sm:text-4xl">{d.v === undefined ? "––" : pad(d.v)}</span>
                  <span className="mt-1 text-[0.5rem] uppercase tracking-[0.2em] text-taupe/70 sm:text-[0.6rem]">{d.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-[0.9rem] text-taupe/70">
        {longDate(W.start)} · {formatTime(W.start)} Pakistan time
      </p>
    </section>
  );
}
