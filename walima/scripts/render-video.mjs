#!/usr/bin/env node
/**
 * Renders this invitation as 1080×1920 vertical videos (WhatsApp / Instagram).
 *
 *   npm run build && npm start           # in one terminal
 *   npm run render:video                # in another
 *
 * Options (env): BASE_URL (default http://localhost:3000), CHROME_PATH (optional).
 * Requires: playwright-core (devDependency) + a Chromium/Chrome, and ffmpeg on PATH for MP4 output.
 * The page's ?autoplay=1 mode plays the intro, opens the invitation and glides through every scene.
 */
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync, existsSync } from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = path.resolve("videos");
const JOBS = [{ route: "/walima", name: "walima", seconds: 46 }];

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find((c) => existsSync(c));
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: findChrome(), args: ["--autoplay-policy=no-user-gesture-required"] });

for (const job of JOBS) {
  const tmp = path.join(OUT, `.tmp-${job.name}`);
  rmSync(tmp, { recursive: true, force: true });
  const ctx = await browser.newContext({
    viewport: { width: 432, height: 768 },
    deviceScaleFactor: 2.5,
    recordVideo: { dir: tmp, size: { width: 1080, height: 1920 } },
  });
  const page = await ctx.newPage();
  console.log(`● Recording ${job.route} (${job.seconds}s)…`);
  await page.goto(`${BASE}${job.route}?autoplay=1`, { waitUntil: "networkidle" });
  await page.waitForTimeout(job.seconds * 1000);
  await ctx.close();
  const webm = readdirSync(tmp).find((f) => f.endsWith(".webm"));
  const webmOut = path.join(OUT, `${job.name}.webm`);
  renameSync(path.join(tmp, webm), webmOut);
  rmSync(tmp, { recursive: true, force: true });
  try {
    execFileSync("ffmpeg", ["-y", "-v", "error", "-ss", "0.8", "-i", webmOut, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "20", "-r", "30", "-movflags", "+faststart", path.join(OUT, `${job.name}.mp4`)]);
    rmSync(webmOut);
    console.log(`  ✓ videos/${job.name}.mp4`);
  } catch {
    console.log(`  ✓ videos/${job.name}.webm (install ffmpeg for MP4)`);
  }
}
await browser.close();
