import { meetingsIcs } from "@/lib/meeting";

/* Rendered once at build into `out/meetings.ics` — a static file anyone can
   import, or subscribe to so later schedule changes reach them too. */
export const dynamic = "force-static";

export function GET() {
  return new Response(meetingsIcs(), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
}
