"use client";

import type { Task, CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

export function WeekView({
  startISO,
  events,
  tasks,
}: {
  startISO: string;
  events: CalendarEvent[];
  tasks: Task[];
}) {
  const start = new Date(startISO);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  function inDay(iso: string, day: Date) {
    const d = new Date(iso);
    return (
      d.getFullYear() === day.getFullYear() &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate()
    );
  }

  const today = new Date();
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-display font-semibold mb-5 md:mb-6">Week</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((d) => {
          const dayEvents = events.filter((e) => inDay(e.starts_at, d));
          const dayTasks = tasks.filter(
            (t) => t.scheduled_start && inDay(t.scheduled_start, d)
          );
          const isToday =
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate();
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "rounded-2xl bg-white shadow-card p-3 min-h-[320px]",
                isToday && "ring-2 ring-cadence"
              )}
            >
              <div className="text-[11px] text-muted uppercase tracking-wider">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </div>
              <div className="text-lg font-display font-semibold mb-2">
                {d.getDate()}
              </div>

              <div className="space-y-1.5">
                {dayEvents.map((e) => (
                  <div
                    key={e.id}
                    className="text-xs px-2 py-1 rounded-lg bg-mist/60"
                  >
                    <div className="font-mono text-[10px] text-muted">
                      {new Date(e.starts_at).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="truncate">{e.title}</div>
                  </div>
                ))}
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="text-xs px-2 py-1 rounded-lg bg-cadence/10 border border-cadence/20"
                  >
                    <div className="font-mono text-[10px] text-muted">
                      {t.scheduled_start &&
                        new Date(t.scheduled_start).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                    </div>
                    <div className="truncate">{t.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
