import type { Metadata } from "next";
import EventsView from "./EventsView";

export const metadata: Metadata = {
  title: "Events | ASA - TXST",
  description:
    "Workshops, guest speakers, projects, and professional development from the Association for Statistics and Analytics at Texas State University. Meetings every other Wednesday this fall — see the next one and add the whole semester to your calendar.",
};

export default function EventsPage() {
  return <EventsView />;
}
