# Walima Reception — standalone invitation

A complete, independent copy of the Walima invitation (**The Pearl Garden**), split out of the combined `groom-invitations` project so it can be deployed on its own domain. It contains no Barat / Sehra Bandi code.

| Route | What it is |
|---|---|
| `/walima` | The invitation · Wed 4 Nov 2026 · 6:00 PM · Al-Jannat Fort Marriage Hall |
| `/` | Redirects to `/walima` (configured in `next.config.ts`) |
| `/calendar/walima.ics` | Downloadable calendar file |

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm start
npm run typecheck
```

Requires Node 18.18+ (Node 20 or 22 recommended).

## Deploy

Push **this folder** as its own repo (or set it as the Vercel project root directory) and import it in Vercel — Next.js is detected automatically. Optionally set `NEXT_PUBLIC_SITE_URL = https://your-domain.com` so WhatsApp and Facebook previews use absolute URLs on the final domain.

Guest link: `https://your-domain.com/` (it opens the invitation).

## What is inside

```
src/
  data/wedding.ts            ← every fact: names, times (+05:00), venues, Maps links
  lib/                       calendar (Google + ICS), maps, share, countdown hooks, procedural audio
  components/shared/          CalendarMenu, icons, GSAP hook, motion plumbing, invitation state
  components/walima/          pearl intro, botanicals (rose, spray, wreath), petal drift
  app/walima/                 page, fonts layout, pearl.css, opengraph-image
  app/calendar/[file]/        walima.ics
scripts/render-video.mjs      1080×1920 vertical video export
```

Fonts: Italiana, Pinyon Script and Jost, self-hosted via `@fontsource`. All artwork is original SVG, CSS and canvas. The background music is generated live in the browser (Web Audio API) — no audio files. This invitation also has a WhatsApp share button.

`src/data/wedding.ts` is kept byte-identical to the Barat project and to the combined project, so a correction can be pasted across all three. The Sehra Bandi and Barat entries it still carries are simply unused here.

## Vertical video (optional)

```bash
npm run build && npm start      # terminal 1
npm run render:video            # terminal 2  →  videos/walima.mp4
```

Needs Chrome or Chromium (set `CHROME_PATH` if it isn't found) and `ffmpeg` on PATH. The video is silent.
