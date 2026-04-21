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

type Item =
  | { kind: "event"; id: string; start: Date; end: Date; event: CalendarEvent }
  | { kind: "task"; id: string; start: Date; end: Date; task: Task };

/**
 * Resolve overlapping items into columns so they can render side-by-side.
 * Returns each item enriched with { col, colCount } — where col is this item's
 * column index in the group, and colCount is how many columns that group needs.
 */
function layoutColumns<T extends { start: Date; end: Date }>(
  items: T[]
): (T & { col: number; colCount: number })[] {
  const sorted = [...items].sort((a, b) => a.start.getTime() - b.start.getTime());
  const out: (T & { col: number; colCount: number })[] = [];
  let group: (T & { col: number })[] = [];
  let groupEnd = 0;

  function flush() {
    const count = group.reduce((m, g) => Math.max(m, g.col + 1), 0);
    for (const g of group) out.push({ ...g, colCount: count });
    group = [];
  }

  for (const it of sorted) {
    const s = it.start.getTime();
    if (group.length === 0 || s >= groupEnd) {
      // start a new group
      flush();
      group = [{ ...it, col: 0 }];
      groupEnd = it.end.getTime();
      continue;
    }
    // find the first free column
    const used = new Set(
      group.filter((g) => g.end.getTime() > s).map((g) => g.col)
    );
    let col = 0;
    while (used.has(col)) col++;
    group.push({ ...it, col });
    groupEnd = Math.max(groupEnd, it.end.getTime());
  }
  flush();
  return out;
}

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

  const items = useMemo<Item[]>(() => {
    // Calendar events: drop anything that's the mirror of a Cadence-scheduled
    // task — those will render as tasks instead of doubling up.
    const a: Item[] = events
      .filter((e) => !e.linked_task_id && e.source !== "cadence")
      .map((e) => ({
        kind: "event" as const,
        id: `e-${e.id}`,
        start: new Date(e.starts_at),
        end: new Date(e.ends_at),
        event: e,
      }));
    const b: Item[] = tasks
      .filter((t) => t.scheduled_start && t.scheduled_end)
      .map((t) => ({
        kind: "task" as const,
        id: `t-${t.id}`,
        start: new Date(t.scheduled_start!),
        end: new Date(t.scheduled_end!),
        task: t,
      }));
    // Safety-net dedupe across kinds: if (title + start + end) already exists,
    // drop duplicates. Handles the case where iCloud returns the same event in
    // multiple calendars, or a task's mirror event escaped the linked_task_id filter.
    const seen = new Set<string>();
    const combined = [...b, ...a].filter((it) => {
      const title = it.kind === "event" ? it.event.title : it.task.title;
      const key = `${title.trim().toLowerCase()}|${it.start.getTime()}|${it.end.getTime()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return layoutColumns(combined);
  }, [events, tasks]);

  function topFor(d: Date) {
    const t = d.getTime();
    const minutes = Math.max(0, (t - dayStart.getTime()) / 60000);
    return minutes * PX_PER_MIN;
  }

  function heightFor(start: Date, end: Date) {
    const s = start.getTime();
    const e = end.getTime();
    return Math.max(22, ((e - s) / 60000) * PX_PER_MIN);
  }

  const totalHeight = (endHour - startHour) * 60 * PX_PER_MIN;
  const sameDay =
    now >= new Date(date.getFullYear(), date.getMonth(), date.getDate()) &&
    now < new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  const nowTop = sameDay ? topFor(now) : -1;

  return (
    <div className="relative flex" style={{ height: totalHeight }}>
      {/* hour ruler */}
      <div className="w-12 shrink-0 relative">
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
            className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
            style={{ top: nowTop }}
          >
            <div className="h-2 w-2 rounded-full bg-cadence -ml-1 shadow-[0_0_0_4px_rgba(47,111,237,.15)]" />
            <div className="h-px flex-1 bg-cadence" />
          </div>
        ) : null}

        {/* items */}
        {items.map((it) => {
          const widthPct = 100 / it.colCount;
          const leftPct = widthPct * it.col;
          const top = topFor(it.start);
          const height = heightFor(it.start, it.end);
          if (it.kind === "event") {
            return (
              <div
                key={it.id}
                className="absolute rounded-xl bg-white border border-mist px-2.5 py-1.5 shadow-card overflow-hidden"
                style={{
                  top,
                  height,
                  left: `calc(${leftPct}% + 4px)`,
                  width: `calc(${widthPct}% - 8px)`,
                }}
              >
                <div className="text-[10px] text-muted truncate">
                  {formatTime(it.start)} · {it.event.calendar_name ?? "Calendar"}
                </div>
                <div className="text-xs md:text-sm font-medium leading-tight line-clamp-2 break-words">
                  {it.event.title}
                </div>
              </div>
            );
          }
          const t = it.task;
          const done = t.status === "DONE";
          return (
            <button
              key={it.id}
              onClick={() => onTaskClick?.(t.id)}
              className={cn(
                "absolute rounded-xl px-2.5 py-1.5 text-left transition overflow-hidden",
                done
                  ? "border border-sage/40 text-muted"
                  : "border border-cadence/30 hover:bg-cadence/12"
              )}
              style={{
                top,
                height,
                left: `calc(${leftPct}% + 4px)`,
                width: `calc(${widthPct}% - 8px)`,
                backgroundColor: done ? "#6AA47915" : "#2F6FED12",
              }}
            >
              <div className="text-[10px] text-muted truncate">
                {formatTime(it.start)} · {t.estimated_minutes}m
              </div>
              <div
                className={cn(
                  "text-xs md:text-sm font-medium leading-tight line-clamp-2 break-words",
                  done && "completed-strike"
                )}
              >
                {t.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
