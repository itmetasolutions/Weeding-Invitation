# Abdullah & Rabiea — Groom-side Wedding Invitations

Two independent, animated invitations in one Next.js project:

| Route | Invitation | Concept |
|---|---|---|
| `/sehra-bandi-barat` | Sehra Bandi & Barat · Tue 3 Nov 2026 | **The Royal Golden Thread** — midnight navy, antique gold, Mughal architecture |
| `/walima` | Walima Reception · Wed 4 Nov 2026 | **The Pearl Garden** — pearl ivory, champagne gold, botanical florals |

Each route is a standalone invitation with its own intro, artwork, motion, music, countdown, replay, sharing and Open Graph preview. Neither links to or redirects to the other. `/` is a small private index for the host only. Don't send it to guests.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000/sehra-bandi-barat  and  /walima
npm run build        # production build (all routes are prerendered as static pages)
npm start
npm run typecheck
```

Requires Node 18.18+ (Node 20 or 22 recommended).

## Deploy to Vercel

1. Push this folder to a GitHub repo. Then in Vercel choose **Add New → Project → Import** that repo. The framework is detected as Next.js automatically, so no settings are needed.
   Alternatively, run `npx vercel` and then `npx vercel --prod` from this folder.
2. (Recommended) In **Project → Settings → Environment Variables**, add
   `NEXT_PUBLIC_SITE_URL = https://your-domain.com` so that WhatsApp and Facebook link previews use absolute URLs on your final domain. Without it, the Vercel production URL is used automatically.
3. Share links:
   - Barat-only guests: `https://your-domain.com/sehra-bandi-barat`
   - Walima-only guests: `https://your-domain.com/walima`

## Editing details

Every fact lives in **`src/data/wedding.ts`**: names, times (ISO with `+05:00`), venues, Maps links and calendar end times. Change it once and the pages, calendar files, share text and OG images all update.

- `calendarEnd` is used only for calendar entries, because calendars require an end time. It is never shown on the invitation. Current values: Sehra 5:30–6:00 PM, Barat & Nikah 6:00–10:00 PM, Walima 6:00–10:00 PM. Adjust if needed.
- The Al-Jannat Fort Maps link is the same verified short link used on the bride-side card. The Sehra Bandi venue uses a Google Maps address search, because no pin was supplied. To use an exact pin, add `mapsUrl` to `VENUES.sehra`.

## Features

- User-triggered opening animation, **Skip intro**, **Replay**, keyboard focus on the Open button, and a skip link to the details
- Live countdowns calculated in Pakistan time (`Asia/Karachi`), so they are correct on any guest's device:
  - Invitation 1 counts down to the Sehra Bandi
  - Invitation 2 counts down to the Walima
- **View Location**: Google Maps links
- **Add to Calendar**: Google Calendar link, plus a downloadable `.ics` file for Apple Calendar and Outlook (served at `/calendar/<id>.ics`) with a 3-hour reminder
- **Share**: Web Share API, falling back to copying the link. Invitation 2 also has a WhatsApp button.
- **Music**: original background music generated live in the browser (Web Audio API), so there are no audio files to license. It starts only after the guest taps Open, which complies with browser autoplay rules. A mute/unmute control is always visible.
  - Invitation 1: a tanpura-style drone with a Yaman-flavoured reed melody
  - Invitation 2: a soft music box with a pad
- **Reduced motion**: if the guest's device has `prefers-reduced-motion` turned on, the intros and scroll effects are skipped and all content shows immediately.
- **No JavaScript**: the intro is hidden and the full invitation text is still readable.
- Unique title, description and generated OG image for each route (`opengraph-image.tsx`)

## Project structure

```
src/
  data/wedding.ts                  ← single source of truth
  lib/                             calendar (Google + ICS), maps, share, countdown hooks, procedural audio
  components/shared/               CalendarMenu, icons, GSAP hook, motion plumbing, invitation state (behaviour only)
  components/barat/                Royal Golden Thread: intro, arch geometry, sehra, palace, gold dust, thread trail
  components/walima/               Pearl Garden: pearl intro, botanicals (rose, spray, wreath), petal drift
  app/sehra-bandi-barat/           page, layout (fonts), royal.css, opengraph-image
  app/walima/                      page, layout (fonts), pearl.css, opengraph-image
  app/calendar/[file]/route.ts     static .ics files
scripts/render-videos.mjs          1080×1920 video export
```

All artwork is original SVG, CSS and canvas, with no stock images. Fonts are self-hosted through `@fontsource` (Cinzel, Cormorant Garamond, Amiri, Italiana, Pinyon Script and Jost).

## Vertical videos (optional)

```bash
npm run build && npm start      # terminal 1
npm run render:videos           # terminal 2  →  videos/sehra-bandi-barat.mp4, videos/walima.mp4
```

The script opens each page with `?autoplay=1`, which plays the intro, opens the invitation and glides through every scene, and records it at 1080×1920. It needs Chrome or Chromium (set `CHROME_PATH` if it isn't found) and `ffmpeg` for MP4 output. The videos are silent. If you want sound, add a music track in any video editor.
