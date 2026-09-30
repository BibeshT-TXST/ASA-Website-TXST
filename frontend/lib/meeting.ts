/**
 * The meeting schedule, in one place.
 *
 * Everything on the events page reads from here — the headline, the month
 * grids, the schedule list, every calendar link and the .ics feed — so a
 * change of date or room is a change of one line.
 *
 * Moving on to the next meeting is `NEXT_MEETING`. Whether a date shows as
 * done, next or coming up is worked out by comparing it to that, never to
 * the clock: the site is built once and served as static files, so "today"
 * at build time would be wrong by the next morning.
 *
 * NOTE ON THE TIME: the original brief said "evening, 5:00 AM to 6:00 AM",
 * which cannot both be true. It is set to 5:00–6:00 PM on the strength of
 * "evening". If that is wrong, `start` / `end` and their 24-hour twins are
 * the only things to change.
 */
export const MEETING = {
  weekday: "Wednesday",
  start: "5:00 PM",
  end: "6:00 PM",
  /* The same times, as calendar apps want them */
  start24: "170000",
  end24: "180000",
  place: "McCoy Building, Room 240",
  address: "McCoy Building Room 240, Texas State University, San Marcos, TX",
  cadence: "Every other Wednesday",
  timeZone: "America/Chicago",
};

export const SEMESTER = "Fall 2026";

/* Every other Wednesday from the first meeting. Stops before Nov 25, the
   Wednesday of Thanksgiving week. Delete a line to cancel a meeting; add
   one to schedule it. */
export const SCHEDULE = [
  "2026-09-16",
  "2026-09-30",
  "2026-10-14",
  "2026-10-28",
  "2026-11-11",
];

/* The meeting the page leads with. */
export const NEXT_MEETING = "2026-09-30";

export type MeetingStatus = "done" | "next" | "upcoming";

/* ISO dates compare correctly as strings, which is all this needs. */
export function statusOf(iso: string): MeetingStatus {
  if (iso < NEXT_MEETING) return "done";
  if (iso === NEXT_MEETING) return "next";
  return "upcoming";
}

/* Parsed as UTC and read back as UTC throughout, so the server and a
   visitor in any time zone agree on which day a date is. */
export function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" },
) {
  return parseDate(iso).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
}

const compact = (iso: string) => iso.replaceAll("-", "");

/* Google Calendar's template URL for one meeting. Local times plus an
   explicit zone, so it lands at 5pm Central for someone adding it from
   anywhere. */
export function googleCalendarUrl(iso: string) {
  const first = iso === SCHEDULE[0];
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" +
    encodeURIComponent(`ASA ${first ? "First " : ""}Meeting — Texas State`) +
    `&dates=${compact(iso)}T${MEETING.start24}/${compact(iso)}T${MEETING.end24}` +
    `&ctz=${MEETING.timeZone}` +
    "&location=" +
    encodeURIComponent(MEETING.address) +
    "&details=" +
    encodeURIComponent(
      `Meeting of the Association for Statistics and Analytics. ${MEETING.cadence}, ${MEETING.start}–${MEETING.end}.`,
    )
  );
}

/* The feed's path, served by app/meetings.ics/route.ts. Relative to the
   base path, so it goes through `asset()` like anything else in public/. */
export const ICS_PATH = "/meetings.ics";

/* The whole semester as one iCalendar file. Importing or subscribing to it
   puts every meeting in Apple Calendar, Outlook or Google at once. */
export function meetingsIcs() {
  const stamp = "20260901T000000Z";
  const events = SCHEDULE.map((iso) =>
    [
      "BEGIN:VEVENT",
      `UID:asa-txst-${iso}@asa-txstate.org`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${MEETING.timeZone}:${compact(iso)}T${MEETING.start24}`,
      `DTEND;TZID=${MEETING.timeZone}:${compact(iso)}T${MEETING.end24}`,
      "SUMMARY:ASA Meeting — Texas State",
      `LOCATION:${MEETING.address.replaceAll(",", "\\,")}`,
      "DESCRIPTION:Meeting of the Association for Statistics and Analytics.",
      "END:VEVENT",
    ].join("\r\n"),
  );

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ASA Texas State//Meetings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:ASA at Texas State",
    `X-WR-TIMEZONE:${MEETING.timeZone}`,
    /* Central time, so DTSTART's TZID resolves without a lookup */
    "BEGIN:VTIMEZONE",
    `TZID:${MEETING.timeZone}`,
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:-0600",
    "TZOFFSETTO:-0500",
    "TZNAME:CDT",
    "DTSTART:19700308T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:-0500",
    "TZOFFSETTO:-0600",
    "TZNAME:CST",
    "DTSTART:19701101T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
