import { readFile } from "node:fs/promises";
import path from "node:path";

/** Loads a fontsource .woff file (Satori supports woff, not woff2) at build time. */
export async function font(pkg: string, file: string) {
  return readFile(path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));
}
