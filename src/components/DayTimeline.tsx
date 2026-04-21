"use client";

import { useMemo } from "react";
import type { Task, CalendarEvent } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

interface Props {
  date: Date;
  events: CalendarEvent[];
  tasks: Task[]; // scheduled to this day
  startHour?: number;
  endHour?: number;
  onTaskClick?: (taskId: string) => void;
  now?: Date;
}

const PX_PER_MIN = 1.2;

export function DayTimeline({
  date,
  events,
  tasks,
  startHour = 5,
  endHour = 23,
  onTaskClick,
  now = new Date(),
}: Props) {
  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour]
  );

  const dayStart = new Date(date);
  dayStart.setHours(startHour, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, 0, 0, 0);

  function topFor(d: Date | string) {
    const t = new Date(d).getTime();
    const minutes = Math.max(0, (t - dayStart.getTime()) / 60000);
    return minutes * PX_PER_MIN;
  }

  function heightFor(start: Date | string, end: Date | string) {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    return Math.max(20, ((e - s) / 60000) * PX_PER_MIN);
  }

  const totalHeight = (endHour - startHour) * 60 * PX_PER_MIN;
  const sameDay =
    now >= new Date(date.getFullYear(), date.getMonth(), date.getDate()) &&
    now < new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const nowTop = sameDay ? topFor(now) : -1;

  return (
    <div className="relative flex" style={{ height: totalHeight }}>
      {/* hour ruler */}
      <div className="w-14 shrink-0 relative">
        {hours.map((h) => (
          <div
            key={h}
            className="absolute left-0 right-0 text-[11px] text-muted font-mono"
            style={{ top: (h - startHour) * 60 * PX_PER_MIN - 6 }}
          >
            {h % 12 === 0 ? 12 : h % 12}
            {h < 12 ? "a" : "p"}
          </div>
        ))}
      </div>

      {/* canvas */}
      <div className="flex-1 relative border-l border-mist">
        {/* hour lines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute left-0 right-0 border-t border-mist/60"
            style={{ top: (h - startHour) * 60 * PX_PER_MIN }}
          />
        ))}

        {/* now line */}
        {nowTop >= 0 ? (
          <div
            className="absolute left-0 right-0 flex items-center"
            style={{ top: nowTop }}
          >
            <div className="h-2 w-2 rounded-full bg-cadence -ml-1 shadow-[0_0_0_4px_rgba(47,111,237,.15)]" />
            <div className="h-px flex-1 bg-cadence" />
          </div>
        ) : null}

        {/* events */}
        {events.map((e) => (
          <div
            key={e.id}
            className="absolute left-2 right-2 rounded-xl bg-white border border-mist px-3 py-2 shadow-card"
            style={{
              top: topFor(e.starts_at),
              height: heightFor(e.starts_at, e.ends_at),
            }}
          >
            <div className="text-[11px] text-muted">
              {formatTime(e.starts_at)} · {e.calendar_name ?? "Calendar"}
            </div>
            <div className="text-sm font-medium truncate">{e.title}</div>
          </div>
        ))}

        {/* scheduled tasks */}
        {tasks.map((t) =>
          t.scheduled_start && t.scheduled_end ? (
            <button
              key={t.id}
              onClick={() => onTaskClick?.(t.id)}
              className={cn(
                "absolute left-2 right-2 rounded-xl px-3 py-2 text-left transition",
                t.status === "DONE"
                  ? "bg-sage/10 border border-sage/40 text-muted"
                  : "bg-cadence/8 border border-cadence/30 hover:bg-cadence/12"
              )}
              style={{
                top: topFor(t.scheduled_start),
                height: heightFor(t.scheduled_start, t.scheduled_end),
                backgroundColor: t.status === "DONE" ? "#6AA47915" : "#2F6FED12",
              }}
            >
              <div className="text-[11px] text-muted">
                {formatTime(t.scheduled_start)} · {t.estimated_minutes}m
              </div>
              <div
                className={cn(
                  "text-sm font-medium truncate",
                  t.status === "DONE" && "completed-strike"
                )}
              >
                {t.title}
              </div>
            </button>
          ) : null
        )}
      </div>
    </div>
  );
}
