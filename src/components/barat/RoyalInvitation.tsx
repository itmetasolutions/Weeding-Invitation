"use client";

import { useRef, useState } from "react";
import { COUPLE, EVENTS, formatDate, formatTime, longDate } from "@/data/wedding";
import { mapsLink } from "@/lib/maps";
import { pad, useAutoplayFlag, useCountdown, useReducedMotion } from "@/lib/hooks";
import { CalendarMenu } from "@/components/shared/CalendarMenu";
import { useInvitationShell } from "@/components/shared/useInvitationShell";
import { useGsap, gsap, ScrollTrigger } from "@/components/shared/useGsap";
import { configureMotion, pauseOffscreen, refreshWhenSettled } from "@/components/shared/motion";
import { IconPin, IconReplay, IconShare, IconSoundOff, IconSoundOn } from "@/components/shared/icons";
import { RoyalIntro } from "./RoyalIntro";
import { GoldDust } from "./GoldDust";
import { ThreadTrail } from "./ThreadTrail";
import { ArchFrame, Colonnade, Corner, Divider, Lantern, Medallion, Sehra, Skyline } from "./ornaments";
import { star } from "./geometry";

const SEHRA = EVENTS.sehraBandi;
const BARAT = EVENTS.baratNikah;

const calClasses = { button: "btn-line", menu: "cal-menu", item: "cal-item" };
const calClassesDark = { button: "btn-line !text-navy !border-bronze", menu: "cal-menu", item: "cal-item" };

export function RoyalInvitation() {
  const reduced = useReducedMotion();
  const autoplay = useAutoplayFlag();
  const shell = useInvitationShell({
    voice: "royal",
    shareTitle: `Sehra Bandi & Barat · ${COUPLE.groom} & ${COUPLE.bride}`,
    shareText: `You are cordially invited to the Sehra Bandi & Barat of ${COUPLE.groom} & ${COUPLE.bride} · ${formatDate(SEHRA.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, Lahore.`,
  });
  const [introGone, setIntroGone] = useState(false);

  const replay = () => {
    setIntroGone(false);
    shell.replay();
  };

  return (
    <div className="royal grain relative min-h-[100svh] overflow-x-clip">
      <a href="#invitation" className="sr-only-focusable fixed left-3 top-3 z-[60] bg-ivory px-3 py-2 text-navy">
        Skip to invitation details
      </a>
      <GoldDust />
      {introGone && <ThreadTrail />}

      {!introGone && (
        <RoyalIntro
          key={`intro-${shell.run}`}
          reduced={reduced}
          autoplay={autoplay}
          onOpen={() => shell.open(true)}
          onExited={() => setIntroGone(true)}
        />
      )}

      <RoyalBody key={`body-${shell.run}`} ready={introGone} reduced={reduced} autoplay={autoplay} onReplay={replay} onShare={shell.share} />

      {introGone && (
        <nav aria-label="Invitation controls" className="fixed right-3 top-3 z-50 flex gap-2 sm:right-6 sm:top-6" style={{ marginTop: "env(safe-area-inset-top)" }}>
          <RoundBtn label={shell.musicOn ? "Mute music" : "Play music"} onClick={shell.toggleMusic} pressed={shell.musicOn}>
            {shell.musicOn ? <IconSoundOn className="h-[18px] w-[18px]" /> : <IconSoundOff className="h-[18px] w-[18px]" />}
          </RoundBtn>
          <RoundBtn label="Replay animation" onClick={replay}>
            <IconReplay className="h-[18px] w-[18px]" />
          </RoundBtn>
          <RoundBtn label="Share invitation" onClick={shell.share}>
            <IconShare className="h-[18px] w-[18px]" />
          </RoundBtn>
        </nav>
      )}

      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center">
        {shell.toast && <span className="border border-gold bg-navy/95 px-5 py-3 font-cinzel text-[0.7rem] uppercase tracking-[0.2em] text-ivory shadow-2xl">{shell.toast}</span>}
      </div>
      <noscript>
        <style>{`.royal-intro{display:none!important}html{overflow:auto!important}`}</style>
      </noscript>
    </div>
  );
}

function RoundBtn({ label, onClick, children, pressed }: { label: string; onClick: () => void; children: React.ReactNode; pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 bg-navy/70 text-gold backdrop-blur-md transition hover:border-gold hover:bg-navy hover:text-gold-hi"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */

function RoyalBody({ ready, reduced, autoplay, onReplay, onShare }: { ready: boolean; reduced: boolean; autoplay: boolean; onReplay: () => void; onShare: () => void }) {
  const root = useRef<HTMLElement>(null);

  useGsap(
    root,
    () => {
      configureMotion();
      if (!ready || reduced) return;
      const cleanups: (() => void)[] = [];

      const drawIn = (scope: Element | null, opts: gsap.TweenVars = {}) => {
        if (!scope) return;
        const paths = scope.querySelectorAll<SVGPathElement>("[data-draw]");
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        return gsap.to(paths, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", stagger: 0.08, ...opts });
      };

      /* Scene 2 — Blessings */
      const bless = gsap.timeline({ scrollTrigger: { trigger: "[data-sec='bless']", start: "top 85%" } });
      bless
        .from("[data-sec='bless'] [data-vthread]", { scaleY: 0, transformOrigin: "50% 0%", duration: 1.2, ease: "power2.inOut" })
        .fromTo("[data-bismillah]", { clipPath: "inset(-20% 0% -20% 100%)", opacity: 1 }, { clipPath: "inset(-20% 0% -20% 0%)", duration: 2.4, ease: "power2.inOut" }, "-=0.3")
        .from("[data-bismillah]", { filter: "blur(6px)", duration: 1.6, ease: "power1.out" }, "<")
        .add(drawIn(document.querySelector("[data-sec='bless'] [data-divider]"), { duration: 1.2 }) ?? gsap.timeline(), "-=0.8")
        .from("[data-bless-line]", { opacity: 0, y: 24, duration: 1.3, ease: "power3.out" }, "-=0.8")
        .from("[data-cue]", { opacity: 0, duration: 1 }, "-=0.2");

      /* Scene 3 — Groom's grand reveal: camera travels through three arches */
      const groom = gsap.timeline({
        scrollTrigger: { trigger: "[data-sec='groom']", start: "top top", end: "+=170%", scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true },
      });
      groom
        .fromTo("[data-layer='3']", { scale: 0.42, opacity: 0.35 }, { scale: 1.1, opacity: 1, ease: "none", duration: 1 }, 0)
        .fromTo("[data-layer='2']", { scale: 0.7, opacity: 0.6 }, { scale: 2.2, opacity: 0, ease: "power1.in", duration: 1 }, 0)
        .fromTo("[data-layer='1']", { scale: 1.05, opacity: 1 }, { scale: 3.6, opacity: 0, ease: "power1.in", duration: 0.8 }, 0)
        .from("[data-groom-kicker]", { opacity: 0, y: 20, duration: 0.25 }, 0.45)
        .from("[data-letter]", { opacity: 0, yPercent: 60, rotateX: -80, filter: "blur(8px)", stagger: 0.05, duration: 0.35, ease: "power3.out" }, 0.5)
        .from("[data-and]", { opacity: 0, letterSpacing: "0.9em", duration: 0.4, ease: "power2.out" }, 0.95)
        .to({}, { duration: 0.25 });

      /* Scene 4 — Sehra Bandi: thread becomes the sehra */
      const sehra = gsap.timeline({ scrollTrigger: { trigger: "[data-sec='sehra']", start: "top 70%" } });
      const band = gsap.utils.toArray<SVGPathElement>("[data-band]");
      band.forEach((p) => {
        const l = p.getTotalLength();
        gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
      });
      sehra
        .to(band, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" })
        .from("[data-strand]", { scaleY: 0, opacity: 0, duration: 1.4, ease: "power3.out", stagger: { each: 0.035, from: "center" } }, "-=0.6")
        .from("[data-sehra-title] > *", { opacity: 0, y: 26, stagger: 0.14, duration: 1, ease: "power3.out" }, "-=1")
        .from("[data-sehra-panel]", { opacity: 0, y: 70, rotateX: 18, transformPerspective: 900, transformOrigin: "50% 0%", duration: 1.3, ease: "power3.out" }, "-=0.6");
      ScrollTrigger.create({
        trigger: "[data-sehra-panel]",
        start: "top 80%",
        once: true,
        onEnter: () => drawIn(document.querySelector("[data-sehra-panel]")),
      });

      /* Animated timeline between functions */
      gsap.fromTo(
        "[data-tl-thread]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", transformOrigin: "50% 0%", scrollTrigger: { trigger: "[data-sec='timeline'] ol", start: "top 70%", end: "bottom 60%", scrub: true, invalidateOnRefresh: true } },
      );
      gsap.utils.toArray<HTMLElement>("[data-tl-item]").forEach((el) => {
        // one trigger drives both tweens; two triggers on the same element
        // measured the same position twice and could toggle out of step
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 68%", toggleActions: "play none none reverse" } })
          .from(el, { opacity: 0.15, x: 24, duration: 0.9, ease: "power3.out" }, 0)
          .from(el.querySelector("[data-tl-node]"), { scale: 0, duration: 0.6, ease: "back.out(3)" }, 0);
      });

      /* Scene 5 — Palace: parallax camera between archways */
      const palace = gsap.timeline({ scrollTrigger: { trigger: "[data-sec='palace']", start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } });
      palace
        .fromTo("[data-depth='sky']", { yPercent: 10 }, { yPercent: -6, ease: "none" }, 0)
        .fromTo("[data-depth='back']", { yPercent: 14, scale: 0.95 }, { yPercent: -10, scale: 1.08, ease: "none" }, 0)
        .fromTo("[data-depth='mid']", { yPercent: 22, scale: 1 }, { yPercent: -18, scale: 1.25, ease: "none" }, 0)
        .fromTo("[data-depth='front']", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, ease: "power1.out", duration: 0.45 }, 0)
        .to("[data-depth='front']", { scale: 2.4, opacity: 0, ease: "power1.in", duration: 0.55 }, 0.45);
      const baratIn = gsap.timeline({ scrollTrigger: { trigger: "[data-barat-copy] [data-b1]", start: "top 75%" } });
      baratIn
        .from("[data-barat-copy] [data-b1]", { opacity: 0, y: 30, filter: "blur(6px)", stagger: 0.15, duration: 1.2, ease: "power3.out" })
        .add(drawIn(document.querySelector("[data-barat-copy]"), { duration: 1.4 }) ?? gsap.timeline(), "-=0.6");
      gsap.from("[data-barat-copy] [data-b2]", { opacity: 0, y: 24, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "[data-barat-copy] [data-b2]", start: "top 82%" } });

      /* Countdown tiles */
      gsap.from("[data-tile]", { opacity: 0, y: 30, rotateX: -60, transformPerspective: 600, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: "[data-sec='countdown']", start: "top 75%" } });

      /* Scene 6 — Final frame drawn by the thread */
      const fin = gsap.timeline({ scrollTrigger: { trigger: "[data-sec='final']", start: "top 70%" } });
      fin
        .add(drawIn(document.querySelector("[data-final-frame]"), { duration: 2.4, stagger: 0 }) ?? gsap.timeline())
        .from("[data-final-corner]", { opacity: 0, scale: 0.6, stagger: 0.1, duration: 0.8, ease: "back.out(2)" }, "-=1.4")
        .from("[data-final] > *", { opacity: 0, y: 22, stagger: 0.09, duration: 0.9, ease: "power3.out" }, "-=1.2");

      // Sehra sway: give each strand its own tempo
      gsap.utils.toArray<SVGGElement>("[data-strand]").forEach((s, i) => s.style.setProperty("--d", `${4 + ((i * 37) % 23) / 10}s`));

      cleanups.push(
        pauseOffscreen(root.current, ".emboss, .gold-shimmer, .beam, .lantern, [data-strand]"),
        refreshWhenSettled(),
      );

      if (autoplay) {
        // Video renderer: glide down the page.
        const total = document.documentElement.scrollHeight - innerHeight;
        const proxy = { y: 0 };
        gsap.to(proxy, { y: total, duration: 34, ease: "none", delay: 2.5, onUpdate: () => window.scrollTo(0, proxy.y) });
      }

      return () => cleanups.forEach((fn) => fn());
    },
    [ready, reduced, autoplay],
  );

  return (
    <main ref={root} className="relative z-10">
      <h1 className="sr-only">
        Sehra Bandi &amp; Barat of {COUPLE.groom} &amp; {COUPLE.bride}
      </h1>
      {/* Scene 2 — Blessings */}
      <section data-sec="bless" className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pb-16 text-center">
        <div data-vthread className="mb-10 h-28 w-px bg-gradient-to-b from-transparent via-gold/70 to-gold" />
        <p lang="ar" dir="rtl" data-bismillah className="gold-shimmer font-amiri text-[2.6rem] font-bold leading-[1.9] sm:text-7xl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <div data-divider className="my-6 text-gold">
          <Divider className="h-6 w-64" />
        </div>
        <p data-bless-line className="max-w-xl text-[1.35rem] italic leading-snug text-ivory/90 sm:text-[1.7rem]">
          With the blessings of Allah, we invite you to celebrate a beautiful new beginning.
        </p>
        <div data-cue className="absolute bottom-8 flex flex-col items-center gap-3 text-gold/70" aria-hidden>
          <span className="font-cinzel text-[0.6rem] uppercase tracking-[0.4em]">Scroll</span>
          <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
        </div>
      </section>

      {/* Scene 3 — Groom's grand reveal */}
      <section data-sec="groom" className="relative h-[100svh] overflow-hidden" aria-labelledby="groom-name">
        <div className="vignette pointer-events-none absolute inset-0 z-10" />
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <div data-layer="3" className="absolute h-[86svh] w-[min(88vw,600px)]" style={{ maskImage: "radial-gradient(closest-side, #000 65%, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000 65%, transparent)" }}>
            <ArchFrame p="g3" spec={{ x0: 60, x1: 540, base: 900, spring: 420, apex: 90 }} className="h-full w-full" strokeWidth={1.4} />
          </div>
          <div data-layer="2" className="absolute h-[86svh] w-[min(88vw,600px)]">
            <ArchFrame p="g2" spec={{ x0: 60, x1: 540, base: 900, spring: 420, apex: 90 }} className="h-full w-full" strokeWidth={1.6} jali={false} />
          </div>
          <div data-layer="1" className="absolute h-[86svh] w-[min(88vw,600px)]">
            <ArchFrame p="g1" spec={{ x0: 60, x1: 540, base: 900, spring: 420, apex: 90 }} className="h-full w-full" strokeWidth={2} jali={false} />
          </div>
          <div className="absolute h-[60vmin] w-[60vmin] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,201,135,0.18), transparent 65%)" }} />
        </div>
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center" style={{ perspective: "800px" }}>
          <p data-groom-kicker className="mb-4 font-cinzel text-[0.66rem] uppercase tracking-[0.5em] text-gold/80">
            The Groom
          </p>
          <h2 id="groom-name" aria-label={COUPLE.groom} className="whitespace-nowrap font-cinzel text-[12.6vw] font-semibold leading-none tracking-[0.03em] sm:text-[7.5rem]">
            {COUPLE.groom.toUpperCase().split("").map((ch, i) => (
              <span key={i} data-letter aria-hidden className="emboss inline-block" data-text={ch}>
                {ch}
              </span>
            ))}
          </h2>
          <p data-and className="mt-5 font-cinzel text-[6.4vw] font-medium tracking-[0.3em] sm:text-[2.6rem]">
            <span className="emboss" data-text={`& ${COUPLE.bride.toUpperCase()}`}>
              &amp; {COUPLE.bride.toUpperCase()}
            </span>
          </p>
        </div>
      </section>

      {/* Scene 4 — Sehra Bandi */}
      <section data-sec="sehra" id="sehra-bandi" className="relative px-5 pb-28 pt-16" aria-labelledby="sehra-title">
        <Sehra className="mx-auto -mb-6 w-full max-w-[640px]" />
        <div data-sehra-title className="relative text-center">
          <p className="font-cinzel text-[0.62rem] uppercase tracking-[0.5em] text-gold/80">The Crowning of the Groom</p>
          <h2 id="sehra-title" className="mt-3 font-cinzel text-[2.6rem] font-semibold tracking-[0.12em] sm:text-6xl">
            <span className="emboss" data-text="SEHRA BANDI">SEHRA BANDI</span>
          </h2>
        </div>
        <article data-sehra-panel className="royal-panel relative mx-auto mt-12 max-w-xl px-7 py-12 text-center sm:px-14">
          <Corner className="absolute left-3 top-3 h-14 w-14 text-bronze" />
          <Corner className="absolute right-3 top-3 h-14 w-14 rotate-90 text-bronze" />
          <Corner className="absolute bottom-3 left-3 h-14 w-14 -rotate-90 text-bronze" />
          <Corner className="absolute bottom-3 right-3 h-14 w-14 rotate-180 text-bronze" />
          <p className="font-cinzel text-[0.7rem] uppercase tracking-[0.4em] text-bronze">{formatDate(SEHRA.start, { weekday: "long" })}</p>
          <p className="mt-2 font-cinzel text-7xl font-semibold leading-none text-navy">{formatDate(SEHRA.start, { day: "2-digit" })}</p>
          <p className="mt-2 font-cinzel text-sm uppercase tracking-[0.35em] text-navy/80">{formatDate(SEHRA.start, { month: "long", year: "numeric" })}</p>
          <div className="mx-auto my-6 h-px w-24 bg-bronze/50" />
          <p className="font-cinzel text-2xl tracking-[0.15em] text-bronze">{formatTime(SEHRA.start)}</p>
          <address className="mt-6 not-italic text-[1.2rem] leading-relaxed text-navy/85">
            {SEHRA.venue.addressLines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
            <span className="block">{SEHRA.venue.city}</span>
          </address>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a className="btn-gold" href={mapsLink(SEHRA.venue)} target="_blank" rel="noopener noreferrer">
              <IconPin className="h-4 w-4" /> View Location
            </a>
            <CalendarMenu event={SEHRA} classes={calClassesDark} />
          </div>
        </article>
      </section>

      {/* Animated timeline between the two functions */}
      <section data-sec="timeline" className="relative px-6 py-24" aria-labelledby="tl-title">
        <div className="text-center">
          <p className="font-cinzel text-[0.62rem] uppercase tracking-[0.5em] text-gold/80">{longDate(SEHRA.start)}</p>
          <h2 id="tl-title" className="mt-3 text-4xl italic text-ivory sm:text-5xl">
            The Order of the Evening
          </h2>
        </div>
        <ol className="relative mx-auto mt-14 max-w-md">
          <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-gold/15" />
          <span data-tl-thread aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px origin-top bg-gradient-to-b from-gold-hi via-gold to-bronze shadow-[0_0_10px_rgba(232,201,135,0.8)]" />
          {[
            { time: formatTime(SEHRA.start), title: "Sehra Bandi", place: `${SEHRA.venue.addressLines[0]}, Township` },
            { time: BARAT.schedule[0].time, title: "Barat Arrival", place: BARAT.venue.name },
            { time: BARAT.schedule[1].time, title: "Nikah Ceremony", place: BARAT.venue.name },
            { time: "", title: "Rukhsati", place: "Nikah & Rukhsati Ceremony" },
          ].map((it) => (
            <li key={it.title} data-tl-item className="relative mb-12 pl-14 last:mb-0">
              <span data-tl-node aria-hidden className="absolute left-0 top-1 grid h-[31px] w-[31px] place-items-center rounded-full border border-gold bg-navy">
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
                  <path d={star(10, 10, 9, 3.6, 4)} fill="#C5A46D" />
                </svg>
              </span>
              {it.time && <p className="font-cinzel text-[0.72rem] tracking-[0.3em] text-gold">{it.time}</p>}
              <p className="mt-1 font-cinzel text-xl tracking-[0.08em] text-ivory">{it.title}</p>
              <p className="mt-1 text-[1.05rem] italic text-ivory/65">{it.place}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Scene 5 — The Grand Barat */}
      <section data-sec="palace" id="barat" className="relative overflow-hidden" aria-labelledby="barat-title">
        <div className="absolute inset-0" aria-hidden>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0b1427 0%, #101d3a 45%, #0b1427 100%)" }} />
          <div data-depth="sky" className="absolute inset-x-0 top-[6%] h-[38%] opacity-70">
            <Skyline className="h-full w-full" />
          </div>
          <div className="beam left-[12%] rotate-[14deg]" />
          <div className="beam left-[40%] rotate-[3deg]" style={{ animationDelay: "-3s" }} />
          <div className="beam left-[68%] -rotate-[12deg]" style={{ animationDelay: "-6s" }} />
          <div data-depth="back" className="absolute inset-x-[-10%] top-[30%] h-[34%] opacity-60">
            <Colonnade count={11} p="cb" className="h-full w-full" stroke={0.8} />
          </div>
          <div data-depth="mid" className="absolute inset-x-[-20%] bottom-[-4%] h-[48%]">
            <Colonnade count={7} p="cm" className="h-full w-full" stroke={1.2} />
          </div>
          <div className="absolute inset-x-0 top-0 flex justify-around">
            {[0, 1, 2, 3, 4].map((i) => (
              <Lantern key={i} p={`ln${i}`} className={`lantern h-36 w-10 sm:h-48 sm:w-14 ${i % 2 ? "mt-6" : ""}`} />
            ))}
          </div>
          <div data-depth="front" className="pointer-events-none absolute inset-0 flex items-end justify-center">
            <ArchFrame p="cf" spec={{ x0: 20, x1: 580, base: 1000, spring: 480, apex: 60 }} className="h-full w-full" strokeWidth={2.4} />
          </div>
          <div className="vignette absolute inset-0" />
        </div>

        <div data-barat-copy className="relative flex flex-col items-center px-5 text-center">
          <div className="flex min-h-[100svh] flex-col items-center justify-center pt-24">
            <p data-b1 className="font-cinzel text-[0.62rem] uppercase tracking-[0.5em] text-gold/85">
              {longDate(BARAT.start)}
            </p>
            <h2 id="barat-title" data-b1 className="mt-5 font-cinzel text-[13vw] font-semibold leading-none tracking-[0.1em] sm:text-8xl">
              <span className="emboss" data-text="THE BARAT">THE BARAT</span>
            </h2>
            <p data-b1 className="mt-5 font-cinzel text-2xl tracking-[0.25em] text-gold-hi sm:text-3xl">{BARAT.schedule[0].time}</p>
            <svg viewBox="0 0 300 40" className="mx-auto mt-8 h-8 w-56 text-gold" fill="none" stroke="currentColor" aria-hidden>
              <path data-draw d="M0 20 C60 20 80 4 110 12 C130 18 140 30 150 20 C160 10 170 22 190 28 C220 36 240 20 300 20" strokeWidth="1" />
            </svg>
          </div>

          <div className="mb-28 w-full max-w-lg border border-gold/40 bg-navy/70 px-6 py-12 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-[3px] sm:px-10">
            <p data-b2 className="font-cinzel text-[0.62rem] uppercase tracking-[0.5em] text-gold/80">Followed by the</p>
            <h3 data-b2 className="mt-3 font-cinzel text-[1.6rem] font-semibold tracking-[0.18em] sm:text-3xl">
              <span className="emboss" data-text="NIKAH CEREMONY">NIKAH CEREMONY</span>
            </h3>
            <p data-b2 className="mt-3 font-cinzel text-xl tracking-[0.2em] text-gold-hi">{BARAT.schedule[1].time}</p>
            <p data-b2 className="mt-3 text-lg italic text-ivory/80">{BARAT.note}</p>

            <div data-b2 className="mx-auto my-7 h-px w-16 bg-gold/50" />
            <p data-b2 className="font-cinzel text-base tracking-[0.12em] text-ivory">{BARAT.venue.name}</p>
            <address data-b2 className="mt-2 not-italic text-[1.05rem] leading-relaxed text-ivory/70">
              {BARAT.venue.addressLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            <div data-b2 className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a className="btn-gold" href={mapsLink(BARAT.venue)} target="_blank" rel="noopener noreferrer">
                <IconPin className="h-4 w-4" /> View Location
              </a>
              <CalendarMenu event={BARAT} classes={calClasses} />
            </div>
          </div>
        </div>
      </section>

      <RoyalCountdown />

      {/* Scene 6 — Final invitation */}
      <section data-sec="final" id="invitation" className="relative px-3 pb-20 pt-24 sm:px-6" aria-labelledby="final-title">
        <div className="relative mx-auto max-w-3xl">
          <svg data-final-frame className="pointer-events-none absolute inset-0 h-full w-full text-gold" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none" stroke="currentColor" aria-hidden>
            <path data-draw vectorEffect="non-scaling-stroke" strokeWidth="1.2" d="M50 0.6 H99.4 V99.4 H0.6 V0.6 Z" />
            <path data-draw vectorEffect="non-scaling-stroke" strokeWidth="0.6" d="M50 2 H98 V98 H2 V2 Z" opacity="0.7" />
          </svg>
          {(["left-0 top-0", "right-0 top-0 rotate-90", "bottom-0 left-0 -rotate-90", "bottom-0 right-0 rotate-180"] as const).map((pos) => (
            <div key={pos} data-final-corner className={`pointer-events-none absolute h-16 w-16 text-gold sm:h-24 sm:w-24 ${pos}`}>
              <Corner className="h-full w-full" />
            </div>
          ))}

          <div data-final className="relative flex flex-col items-center px-6 py-16 text-center sm:px-16 sm:py-20">
            <div className="relative h-24 w-24">
              <Medallion p="fm" className="h-full w-full" />
              <span className="absolute inset-0 grid place-items-center font-cinzel text-lg font-semibold tracking-[0.15em] text-gold">
                {COUPLE.monogram[0]}·{COUPLE.monogram[1]}
              </span>
            </div>
            <p className="mt-8 max-w-lg text-[1.3rem] italic leading-snug text-ivory/90 sm:text-[1.5rem]">
              With immense joy and gratitude, the family of {COUPLE.groom} cordially invites you to celebrate the wedding of
            </p>
            <h2 id="final-title" className="mt-6 font-cinzel text-[2.1rem] font-semibold leading-tight tracking-[0.1em] sm:whitespace-nowrap sm:text-[2.6rem] md:text-[3.1rem]">
              <span className="emboss" data-text={`${COUPLE.groom.toUpperCase()} & ${COUPLE.bride.toUpperCase()}`}>
                <span className="block sm:inline">{COUPLE.groom.toUpperCase()}</span>
                <span className="block text-[0.6em] sm:inline sm:text-[1em]"> &amp; </span>
                <span className="block sm:inline">{COUPLE.bride.toUpperCase()}</span>
              </span>
            </h2>
            <p className="mt-6 max-w-md text-[1.2rem] italic text-ivory/80">Your presence and blessings will make this occasion truly memorable.</p>

            <div className="mt-12 grid w-full gap-5 text-left sm:grid-cols-2">
              <EventCard
                title="Sehra Bandi"
                date={longDate(SEHRA.start)}
                lines={[formatTime(SEHRA.start)]}
                address={[...SEHRA.venue.addressLines, SEHRA.venue.city]}
                href={mapsLink(SEHRA.venue)}
                event={SEHRA}
              />
              <EventCard
                title="Barat & Nikah"
                date={longDate(BARAT.start)}
                lines={BARAT.schedule.map((s) => `${s.label} · ${s.time}`)}
                address={[BARAT.venue.name, ...BARAT.venue.addressLines]}
                href={mapsLink(BARAT.venue)}
                event={BARAT}
              />
            </div>

            <p className="mt-14 font-cinzel text-sm uppercase tracking-[0.3em] text-gold-hi">We look forward to celebrating with you.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn-line text-gold" onClick={onShare}>
                <IconShare className="h-4 w-4" /> Share Invitation
              </button>
              <button type="button" className="btn-line text-gold" onClick={onReplay}>
                <IconReplay className="h-4 w-4" /> Replay
              </button>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center font-cinzel text-[0.6rem] uppercase tracking-[0.4em] text-ivory/40">Sehra Bandi &amp; Barat · Lahore · {formatDate(SEHRA.start, { year: "numeric" })}</p>
      </section>
    </main>
  );
}

function EventCard({ title, date, lines, address, href, event }: { title: string; date: string; lines: string[]; address: string[]; href: string; event: typeof SEHRA | typeof BARAT }) {
  return (
    <div className="flex flex-col border border-gold/35 bg-gradient-to-b from-gold/[0.07] to-transparent p-6">
      <h3 className="font-cinzel text-lg font-semibold tracking-[0.14em] text-gold-hi">{title}</h3>
      <p className="mt-2 text-[1.05rem] text-ivory/85">{date}</p>
      {lines.map((l) => (
        <p key={l} className="font-cinzel text-sm tracking-[0.15em] text-gold">
          {l}
        </p>
      ))}
      <address className="mt-3 flex-1 not-italic text-[1rem] leading-relaxed text-ivory/65">
        {address.map((a) => (
          <span key={a} className="block">
            {a}
          </span>
        ))}
      </address>
      <div className="mt-5 flex flex-wrap gap-2">
        <a className="btn-gold !px-3.5 !py-2.5 !text-[0.62rem]" href={href} target="_blank" rel="noopener noreferrer">
          <IconPin className="h-3.5 w-3.5" /> View Location
        </a>
        <CalendarMenu event={event} classes={{ button: "btn-line !px-3.5 !py-2.5 !text-[0.62rem] text-gold", menu: "cal-menu", item: "cal-item" }} label="Calendar" />
      </div>
    </div>
  );
}

function RoyalCountdown() {
  const r = useCountdown(SEHRA.start);
  const units: [string, number | undefined][] = [
    ["Days", r?.days],
    ["Hours", r?.hours],
    ["Minutes", r?.minutes],
    ["Seconds", r?.seconds],
  ];
  return (
    <section data-sec="countdown" className="relative px-5 py-24 text-center" aria-labelledby="cd-title">
      <p className="font-cinzel text-[0.62rem] uppercase tracking-[0.5em] text-gold/80">Counting down to the</p>
      <h2 id="cd-title" className="mt-3 text-4xl italic text-ivory sm:text-5xl">
        Sehra Bandi
      </h2>
      {r?.done ? (
        <p className="mt-10 font-cinzel text-xl tracking-[0.2em] text-gold-hi">The celebrations have begun · Mubarak!</p>
      ) : (
        <div className="mx-auto mt-10 grid max-w-xl grid-cols-4 gap-2.5 sm:gap-4" role="timer" aria-live="off">
          {units.map(([label, v]) => (
            <div key={label} data-tile className="tile px-1 py-5 sm:py-7">
              <span className="block font-cinzel text-3xl font-semibold tabular-nums text-gold-hi sm:text-5xl">{v === undefined ? "––" : pad(v)}</span>
              <span className="mt-2 block font-cinzel text-[0.55rem] uppercase tracking-[0.25em] text-ivory/60 sm:text-[0.65rem]">{label}</span>
            </div>
          ))}
        </div>
      )}
      <p className="mt-6 text-[1.05rem] italic text-ivory/60">
        {longDate(SEHRA.start)} · {formatTime(SEHRA.start)} Pakistan time
      </p>
    </section>
  );
}
