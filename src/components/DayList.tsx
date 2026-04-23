"use client";

import { useMemo } from "react";
import { Clock, CalendarClock, Check } from "lucide-react";
import type { Task, CalendarEvent } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

interface Props {
  date: Date;
  events: CalendarEvent[];
  tasks: Task[];
  onComplete?: (taskId: string) => void;
}

type Row =
  | { kind: "event"; key: string; start: Date; end: Date; event: CalendarEvent }
  | { kind: "task"; key: string; start: Date; end: Date; task: Task };

/**
 * Simple chronological list of a day's items. No hour grid, no overlapping cards.
 * Time on the left, title on the right, priority dot, done checkbox.
 */
export function DayList({ date, events, tasks, onComplete }: Props) {
  const rows = useMemo<Row[]>(() => {
    const e: Row[] = events
      .filter((ev) => !ev.linked_task_id && ev.source !== "cadence")
      .map((ev) => ({
        kind: "event",
        key: `e-${ev.id}`,
        start: new Date(ev.starts_at),
        end: new Date(ev.ends_at),
        event: ev,
      }));
    const t: Row[] = tasks
      .filter((t) => t.scheduled_start && t.scheduled_end)
      .map((t) => ({
        kind: "task",
        key: `t-${t.id}`,
        start: new Date(t.scheduled_start!),
        end: new Date(t.scheduled_end!),
        task: t,
      }));
    // Dedupe same title + start across types (task wins over event)
    const seen = new Set<string>();
    const merged = [...t, ...e].filter((r) => {
      const title = r.kind === "event" ? r.event.title : r.task.title;
      const key = `${title.trim().toLowerCase()}|${r.start.getTime()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return merged.sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, tasks]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-paper border border-mist p-6 text-center text-sm text-muted">
        Nothing scheduled today. Add a task with a time or tap <span className="text-ink font-medium">Plan my day</span>.
      </div>
    );
  }

  const now = new Date();
  const sameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  let nowInserted = false;

  return (
    <ol className="divide-y divide-mist/70 rounded-xl bg-white shadow-card overflow-hidden">
      {rows.map((r, i) => {
        const isPast = sameDay && r.end.getTime() < now.getTime();
        const isNow = sameDay && r.start.getTime() <= now.getTime() && r.end.getTime() > now.getTime();
        const shouldInsertNowLineBefore =
          sameDay && !nowInserted && !isNow && r.start.getTime() > now.getTime();
        if (shouldInsertNowLineBefore) nowInserted = true;

        return (
          <li key={r.key}>
            {shouldInsertNowLineBefore ? <NowLine /> : null}
            {r.kind === "event" ? (
              <EventRow row={r} isPast={isPast} isNow={isNow} />
            ) : (
              <TaskRow row={r} isPast={isPast} isNow={isNow} onComplete={onComplete} />
            )}
          </li>
        );
      })}
      {sameDay && !nowInserted ? <NowLine /> : null}
    </ol>
  );
}

function NowLine() {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-cadence/5">
      <div className="h-1.5 w-1.5 rounded-full bg-cadence" />
      <div className="text-[10px] uppercase tracking-wider font-medium text-cadence">Now</div>
      <div className="h-px flex-1 bg-cadence/30" />
    </div>
  );
}

function EventRow({
  row,
  isPast,
  isNow,
}: {
  row: Extract<Row, { kind: "event" }>;
  isPast: boolean;
  isNow: boolean;
}) {
  const ev = row.event;
  return (
    <div className={cn("flex items-start gap-3 px-3 py-2.5", isPast && "opacity-50")}>
      <TimeBlock start={row.start} end={row.end} muted />
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-mist shrink-0" />
          <span className={cn("text-sm truncate", isNow && "font-medium")}>{ev.title}</span>
        </div>
        <div className="text-[11px] text-muted mt-0.5 truncate">
          {ev.calendar_name ?? "Calendar"}
        </div>
      </div>
    </div>
  );
}

function TaskRow({
  row,
  isPast,
  isNow,
  onComplete,
}: {
  row: Extract<Row, { kind: "task" }>;
  isPast: boolean;
  isNow: boolean;
  onComplete?: (id: string) => void;
}) {
  const t = row.task;
  const done = t.status === "DONE";
  return (
    <div className={cn("flex items-start gap-3 px-3 py-2.5", (isPast || done) && "opacity-50")}>
      <TimeBlock start={row.start} end={row.end} />
      <button
        onClick={() => onComplete?.(t.id)}
        aria-label={done ? "Mark incomplete" : "Complete"}
        className={cn(
          "shrink-0 h-5 w-5 rounded-full border-2 border-mist flex items-center justify-center transition mt-0.5",
          done ? "border-sage bg-sage" : "active:scale-90 hover:border-cadence"
        )}
      >
        {done ? <Check size={12} className="text-white" /> : null}
      </button>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full shrink-0",
              t.priority === 1
                ? "bg-cadence"
                : t.priority === 2
                ? "bg-amber"
                : "bg-mist"
            )}
          />
          <span
            className={cn(
              "text-sm truncate",
              done && "line-through decoration-muted",
              isNow && !done && "font-medium"
            )}
          >
            {t.title}
          </span>
        </div>
        <div className="text-[11px] text-muted mt-0.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <Clock size={10} />
            {t.estimated_minutes}m
          </span>
          {t.due_date ? (
            <span className="inline-flex items-center gap-1 text-amber">
              <CalendarClock size={10} />
              {formatDueShort(t.due_date)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TimeBlock({ start, end, muted }: { start: Date; end: Date; muted?: boolean }) {
  return (
    <div className={cn("w-14 shrink-0 text-right font-mono", muted && "text-muted")}>
      <div className="text-[13px] leading-tight">{formatTime(start)}</div>
      <div className="text-[10px] text-muted leading-tight">{formatTime(end)}</div>
    </div>
  );
}

function formatDueShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "today";
  if (diff === 1) return "tmrw";
  if (diff === -1) return "yesterday";
  if (diff < 0) return `${Math.abs(diff)}d over`;
  if (diff <= 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
