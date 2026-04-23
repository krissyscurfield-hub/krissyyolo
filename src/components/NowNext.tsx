"use client";

import { useMemo } from "react";
import type { Task, CalendarEvent } from "@/lib/types";
import { formatTime, cn } from "@/lib/utils";

type Item =
  | { kind: "event"; title: string; start: Date; end: Date; source?: string }
  | { kind: "task"; title: string; start: Date; end: Date; priority: 1 | 2 | 3 };

export function NowNext({
  events,
  tasks,
  now = new Date(),
}: {
  events: CalendarEvent[];
  tasks: Task[];
  now?: Date;
}) {
  const { current, next, untilNext } = useMemo(() => {
    const all: Item[] = [];
    for (const e of events) {
      if (e.linked_task_id || e.source === "cadence") continue;
      all.push({
        kind: "event",
        title: e.title,
        start: new Date(e.starts_at),
        end: new Date(e.ends_at),
        source: e.calendar_name ?? undefined,
      });
    }
    for (const t of tasks) {
      if (!t.scheduled_start || !t.scheduled_end || t.status === "DONE") continue;
      all.push({
        kind: "task",
        title: t.title,
        start: new Date(t.scheduled_start),
        end: new Date(t.scheduled_end),
        priority: t.priority,
      });
    }
    all.sort((a, b) => a.start.getTime() - b.start.getTime());
    const cur = all.find((i) => i.start <= now && i.end > now) ?? null;
    const nxt = all.find((i) => i.start > now) ?? null;
    const untilNext = nxt
      ? Math.max(0, Math.round((nxt.start.getTime() - now.getTime()) / 60_000))
      : null;
    return { current: cur, next: nxt, untilNext };
  }, [events, tasks, now]);

  if (!current && !next) {
    return (
      <section className="rounded-3xl bg-gradient-to-br from-paper to-mist/50 border border-mist px-6 py-7 text-center">
        <div className="text-xs uppercase tracking-wider text-muted mb-2">Now</div>
        <div className="text-lg font-display font-medium text-ink">
          You&apos;re free.
        </div>
        <div className="text-sm text-muted mt-1">
          Nothing scheduled for the rest of today.
        </div>
      </section>
    );
  }

  if (current) {
    const tone = current.kind === "task" ? "cadence" : "ink";
    return (
      <section
        className={cn(
          "rounded-3xl px-6 py-6 relative overflow-hidden",
          tone === "cadence"
            ? "bg-cadence text-white"
            : "bg-ink text-paper"
        )}
      >
        <div className="text-[11px] uppercase tracking-[0.18em] opacity-80 mb-1 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          Now
        </div>
        <div className="text-2xl md:text-3xl font-display font-semibold leading-tight">
          {current.title}
        </div>
        <div className="text-sm opacity-80 mt-2">
          {formatTime(current.start)} — {formatTime(current.end)}
        </div>
      </section>
    );
  }

  // next only
  const relative =
    untilNext === 0
      ? "starting now"
      : untilNext! < 60
      ? `in ${untilNext} min`
      : untilNext! < 120
      ? `in 1 hr ${untilNext! - 60} min`
      : `at ${formatTime(next!.start)}`;

  return (
    <section className="rounded-3xl bg-white shadow-card px-6 py-6">
      <div className="text-[11px] uppercase tracking-[0.18em] text-muted mb-1.5">
        Up next
      </div>
      <div className="text-xl md:text-2xl font-display font-semibold text-ink leading-tight">
        {next!.title}
      </div>
      <div className="text-sm text-muted mt-2">{relative}</div>
    </section>
  );
}
