"use client";

import ActionButton from "@/components/ui/ActionButton";
import LineRise from "@/components/ui/LineRise";
import { Cadence } from "@/components/graphics/Motifs";
import Ridgeline from "@/components/graphics/Ridgeline";
import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import { asset } from "@/lib/asset";
import { JOIN_FORM_URL } from "@/lib/links";
import {
  ICS_PATH,
  MEETING,
  NEXT_MEETING,
  SCHEDULE,
  SEMESTER,
  formatDate,
  googleCalendarUrl,
  parseDate,
  statusOf,
} from "@/lib/meeting";
import MonthGrid from "./MonthGrid";
import styles from "./EventsView.module.css";

const DETAILS = [
  { key: "Time", value: `${MEETING.start} to ${MEETING.end}` },
  { key: "Place", value: MEETING.place },
  { key: "Then", value: MEETING.cadence },
];

const next = parseDate(NEXT_MEETING);

/* Every month the schedule touches, in order, as [year, month] */
const MONTHS = [...new Set(SCHEDULE.map((iso) => iso.slice(0, 7)))].map((ym) => {
  const [y, m] = ym.split("-").map(Number);
  return [y, m - 1] as const;
});

const STATUS_LABEL = { done: "Held", next: "Next", upcoming: "Coming up" };

export default function EventsView() {
  return (
    <main className={styles.page}>
      {/* ══ 1 — the next meeting ════════════════════════ */}
      <section className={`${styles.stage} tone-pine`} data-header-theme="dark">
        {/* The same drifting field as the home hero — this is the other
            screen the site opens on, so it stands on the same ground. */}
        <Ridgeline className={styles.plotLayer} />

        <div className={styles.inner}>
          <div className={styles.col}>
            <SectionLabel onLoad>Next meeting</SectionLabel>

            <LineRise
              as="h1"
              onLoad
              className={styles.display}
              lines={[
                `${MEETING.weekday},`,
                <>
                  <span className={styles.accent}>{formatDate(NEXT_MEETING)}</span>
                </>,
              ]}
            />

            <Reveal delay={0.35}>
              <dl className={styles.details}>
                {DETAILS.map(({ key, value }) => (
                  <div key={key} className={styles.detail}>
                    <dt className={styles.detailKey}>{key}</dt>
                    <dd className={styles.detailValue}>{value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.45} className={styles.actions}>
              <ActionButton href={googleCalendarUrl(NEXT_MEETING)} external>
                Add to calendar
              </ActionButton>
              <ActionButton href={asset(ICS_PATH)} variant="ghost" download>
                Every date (.ics)
              </ActionButton>
            </Reveal>
          </div>

          {/* The month it falls in, drawn as a calendar: the headline says
              which day, this shows where that day sits among the others */}
          <Reveal delay={0.2} className={styles.heroMonth}>
            <MonthGrid
              year={next.getUTCFullYear()}
              month={next.getUTCMonth()}
              onLoad
            />
          </Reveal>
        </div>
      </section>

      {/* ══ 2 — the whole semester ══════════════════════ */}
      <section
        className={`${styles.stage} tone-paper`}
        data-header-theme="light"
      >
        <div className={`${styles.inner} ${styles.semester}`}>
          <div className={styles.col}>
            <SectionLabel>{SEMESTER}</SectionLabel>

            <LineRise
              className={styles.display}
              lines={["Every other", "Wednesday."]}
            />

            <Reveal delay={0.3}>
              <p className={styles.sub}>
                Same time, same room: {MEETING.start}&ndash;{MEETING.end} in{" "}
                {MEETING.place}. Add one date, or take the whole semester
                at once.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <ol className={styles.schedule}>
              {SCHEDULE.map((iso, i) => {
                const status = statusOf(iso);

                return (
                  <li
                    key={iso}
                    className={`${styles.row} ${styles[`row_${status}`]}`}
                  >
                    <span className={styles.rowIndex} aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.rowDate}>
                      {formatDate(iso, {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className={styles.rowStatus}>{STATUS_LABEL[status]}</span>
                    {status === "done" ? (
                      <span className={styles.rowAdd} aria-hidden="true" />
                    ) : (
                      <a
                        className={styles.rowAdd}
                        href={googleCalendarUrl(iso)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Add ${formatDate(iso)} to Google Calendar`}
                      >
                        Add
                        <span aria-hidden="true"> +</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ol>
          </Reveal>

          <div className={styles.months}>
            {MONTHS.map(([y, m]) => (
              <MonthGrid key={`${y}-${m}`} year={y} month={m} />
            ))}
          </div>

          <Reveal delay={0.1} className={styles.legend} aria-hidden="true">
            <span className={styles.key}>
              <i className={`${styles.swatch} ${styles.swatchDone}`} />
              Held
            </span>
            <span className={styles.key}>
              <i className={`${styles.swatch} ${styles.swatchNext}`} />
              Next
            </span>
            <span className={styles.key}>
              <i className={`${styles.swatch} ${styles.swatchUpcoming}`} />
              Coming up
            </span>
          </Reveal>
        </div>
      </section>

      {/* ══ 3 — what happens at them ════════════════════ */}
      <section
        className={`${styles.stage} ${styles.closing} tone-pine`}
        data-header-theme="dark"
      >
        <div className={styles.inner}>
          <div className={styles.col}>
            <SectionLabel>At the table</SectionLabel>

            <LineRise
              className={styles.display}
              lines={["Workshops, speakers,", "and projects."]}
            />

            <Reveal delay={0.3}>
              <p className={styles.sub}>
                Each meeting is its own thing. We&rsquo;ll post what&rsquo;s
                on here as each one is set. Join now and you&rsquo;ll hear
                about it first.
              </p>
            </Reveal>

            <Reveal delay={0.4} className={styles.actions}>
              <ActionButton href={JOIN_FORM_URL} external>
                Join ASA
              </ActionButton>
            </Reveal>
          </div>

          <div className={styles.motif}>
            <Cadence />
          </div>
        </div>
      </section>
    </main>
  );
}
