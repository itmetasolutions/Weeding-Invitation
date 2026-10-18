# Sehra Bandi & Barat — standalone invitation

A complete, independent copy of the Sehra Bandi & Barat invitation (**The Royal Golden Thread**), split out of the combined `groom-invitations` project so it can be deployed on its own domain. It contains no Walima code.

| Route | What it is |
|---|---|
| `/sehra-bandi-barat` | The invitation · Tue 3 Nov 2026 · Sehra Bandi 5:30 PM, Barat & Nikah 6:00 PM |
| `/` | Redirects to `/sehra-bandi-barat` (configured in `next.config.ts`) |
| `/calendar/sehra-bandi.ics`, `/calendar/barat-nikah.ics` | Downloadable calendar files |

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
  components/barat/           intro, arch geometry, sehra, palace, gold dust, thread trail
  app/sehra-bandi-barat/      page, fonts layout, royal.css, opengraph-image
  app/calendar/[file]/        .ics files for this invitation's two events
scripts/render-video.mjs      1080×1920 vertical video export
```

Fonts: Cinzel, Cormorant Garamond and Amiri, self-hosted via `@fontsource`. All artwork is original SVG, CSS and canvas. The background music is generated live in the browser (Web Audio API) — no audio files.

`src/data/wedding.ts` is kept byte-identical to the Walima project and to the combined project, so a correction can be pasted across all three. The Walima entry it still carries is simply unused here.

## Vertical video (optional)

```bash
npm run build && npm start      # terminal 1
npm run render:video            # terminal 2  →  videos/sehra-bandi-barat.mp4
```

Needs Chrome or Chromium (set `CHROME_PATH` if it isn't found) and `ffmpeg` on PATH. The video is silent.
