"use client";

import { motion, type Variants } from "framer-motion";
import { SCHEDULE, formatDate, statusOf } from "@/lib/meeting";
import styles from "./MonthGrid.module.css";

/**
 * One month of the calendar, with the meeting days marked.
 *
 * A wall calendar rather than a list, because the rhythm is the point: the
 * marks fall down the same column two rows apart, and "every other
 * Wednesday" is visible before it is read. The schedule list beside it
 * carries the same facts for a screen reader, so the grid itself is hidden
 * from one and summarised in its caption.
 *
 * Days are laid out in UTC, like everything in lib/meeting.ts, so the
 * server and every visitor draw the same month.
 */
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const WEDNESDAY = 3;

const grid: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.012, delayChildren: 0.1 } },
};

const day: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  shown: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const STATUS_WORD = { done: "done", next: "next", upcoming: "coming up" };

export default function MonthGrid({
  year,
  month,
  onLoad = false,
  className,
}: {
  year: number;
  /** 0-based, as Date has it */
  month: number;
  /** Heroes draw on load; the rest wait to be scrolled to */
  onLoad?: boolean;
  className?: string;
}) {
  const lead = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}-`;

  const meetings = SCHEDULE.filter((iso) => iso.startsWith(prefix));
  const title = formatDate(`${prefix}01`, { month: "long", year: "numeric" });
  const summary = meetings.length
    ? `Meetings on ${meetings
        .map((iso) => `${formatDate(iso)} (${STATUS_WORD[statusOf(iso)]})`)
        .join(", ")}.`
    : "No meetings this month.";

  return (
    <figure className={`${styles.month} ${className ?? ""}`}>
      <figcaption className={styles.caption}>
        <span className={styles.title}>{title}</span>
        <span className={styles.srOnly}> {summary}</span>
        <span className={styles.count} aria-hidden="true">
          {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
        </span>
      </figcaption>

      <motion.ol
        className={styles.grid}
        aria-hidden="true"
        variants={grid}
        initial="hidden"
        {...(onLoad
          ? { animate: "shown" }
          : {
              whileInView: "shown",
              viewport: { once: true, margin: "0px 0px -14% 0px" },
            })}
      >
        {WEEKDAYS.map((w, i) => (
          <li
            key={`h${i}`}
            className={`${styles.head} ${i === WEDNESDAY ? styles.headOn : ""}`}
          >
            {w}
          </li>
        ))}

        {Array.from({ length: lead }, (_, i) => (
          <li key={`b${i}`} />
        ))}

        {Array.from({ length }, (_, i) => {
          const date = i + 1;
          const iso = prefix + String(date).padStart(2, "0");
          const status = meetings.includes(iso) ? statusOf(iso) : null;
          const weekday = (lead + i) % 7;

          return (
            <motion.li
              key={iso}
              className={[
                styles.day,
                weekday === WEDNESDAY && styles.wednesday,
                (weekday === 0 || weekday === 6) && styles.weekend,
                status && styles[status],
              ]
                .filter(Boolean)
                .join(" ")}
              variants={day}
            >
              <span className={styles.num}>{date}</span>
            </motion.li>
          );
        })}
      </motion.ol>
    </figure>
  );
}
