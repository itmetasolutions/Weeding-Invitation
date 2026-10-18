import { ALL_EVENTS, getEvent } from "@/data/wedding";
import { buildIcs } from "@/lib/calendar";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_EVENTS.map((e) => ({ file: `${e.id}.ics` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const event = getEvent(file.replace(/\.ics$/, ""));
  if (!event) return new Response("Not found", { status: 404 });
  return new Response(buildIcs(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.id}-abdullah-rabiea.ics"`,
    },
  });
}
