import { EVENTS, getEvent } from "@/data/wedding";
import { buildIcs } from "@/lib/calendar";

/** Only the events shown on this invitation are served here. */
const EVENT_IDS = [EVENTS.walima.id];

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return EVENT_IDS.map((id) => ({ file: `${id}.ics` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const event = getEvent(file.replace(/\.ics$/, ""));
  if (!event || !EVENT_IDS.some((id) => id === event.id)) return new Response("Not found", { status: 404 });
  return new Response(buildIcs(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}-abdullah-rabiea.ics"`,
    },
  });
}
