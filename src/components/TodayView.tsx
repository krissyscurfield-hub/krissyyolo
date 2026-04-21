"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Moon, RefreshCw, ArrowRight, Calendar as CalIcon } from "lucide-react";
import type { Task, CalendarEvent } from "@/lib/types";
import { QuickAdd } from "./QuickAdd";
import { DayTimeline } from "./DayTimeline";
import { MustDoStrip } from "./MustDoStrip";
import { TaskCard } from "./TaskCard";
import { DailyPlanModal } from "./DailyPlanModal";
import { ShutdownModal } from "./ShutdownModal";
import { parseQuickAdd } from "@/lib/parse";
import { startOfLocalDay, endOfLocalDay } from "@/lib/utils";

export function TodayView({
  initialEvents,
  initialTasks,
  dateISO,
  calendarConnected = true,
}: {
  initialEvents: CalendarEvent[];
  initialTasks: Task[];
  dateISO: string;
  calendarConnected?: boolean;
}) {
  const router = useRouter();
  const date = new Date(dateISO);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [planOpen, setPlanOpen] = useState(false);
  const [shutdownOpen, setShutdownOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const dayStart = startOfLocalDay(date).getTime();
  const dayEnd = endOfLocalDay(date).getTime();

  const scheduledToday = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.scheduled_start &&
          new Date(t.scheduled_start).getTime() >= dayStart &&
          new Date(t.scheduled_start).getTime() <= dayEnd
      ),
    [tasks, dayStart, dayEnd]
  );

  const inboxForToday = useMemo(
    () => tasks.filter((t) => !t.scheduled_start && t.status !== "DONE"),
    [tasks]
  );

  async function addTask(raw: string) {
    const parsed = parseQuickAdd(raw);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: parsed.title,
        priority: parsed.priority,
        scheduled_start: parsed.scheduledStart?.toISOString() ?? null,
        estimated_minutes: parsed.estimatedMinutes ?? 30,
        due_date: parsed.dueDate ? parsed.dueDate.toISOString().slice(0, 10) : null,
      }),
    });
    if (res.ok) {
      const t = await res.json();
      setTasks((prev) => [t, ...prev]);
    }
  }

  async function complete(id: string) {
    const before = tasks;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "DONE", completed_at: new Date().toISOString() } : t
      )
    );
    const res = await fetch(`/api/tasks/${id}/complete`, { method: "POST" });
    if (!res.ok) setTasks(before);
  }

  async function promote(id: string) {
    const before = tasks;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, must_do_today: true } : t))
    );
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ must_do_today: true }),
    });
    if (!res.ok) setTasks(before);
  }

  async function syncCalendar() {
    setSyncing(true);
    await fetch("/api/calendar/sync", { method: "POST" });
    router.refresh();
    setSyncing(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-4 md:py-8 space-y-5 md:space-y-6">
      <header className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-muted uppercase tracking-wider">
              {date.toLocaleDateString(undefined, { weekday: "long" })}
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-semibold">
              {date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
            </h1>
          </div>
          <button
            onClick={syncCalendar}
            disabled={syncing}
            aria-label="Sync"
            className="md:hidden rounded-full bg-white shadow-card p-2.5 hover:bg-paper transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlanOpen(true)}
            className="flex-1 md:flex-initial rounded-xl bg-ink text-white px-4 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            <Sparkles size={14} />
            Plan my day
          </button>
          <button
            onClick={() => setShutdownOpen(true)}
            className="flex-1 md:flex-initial rounded-xl bg-white shadow-card px-4 py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-paper transition"
          >
            <Moon size={14} />
            Shutdown
          </button>
          <button
            onClick={syncCalendar}
            disabled={syncing}
            className="hidden md:inline-flex rounded-xl bg-white shadow-card px-4 py-2.5 text-sm font-medium items-center gap-2 hover:bg-paper transition disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            Sync
          </button>
        </div>
      </header>

      {!calendarConnected ? (
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-2xl bg-cadence/8 border border-cadence/25 px-4 py-3 hover:bg-cadence/12 transition active:scale-[0.99]"
        >
          <div className="h-9 w-9 rounded-xl bg-cadence/15 flex items-center justify-center shrink-0">
            <CalIcon size={18} className="text-cadence" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink">Connect Apple Calendar</div>
            <div className="text-xs text-muted mt-0.5">
              Two-minute setup. Pull your events in and save scheduled tasks to iCloud.
            </div>
          </div>
          <ArrowRight size={16} className="text-cadence shrink-0" />
        </Link>
      ) : null}

      <QuickAdd onAdd={addTask} />

      <MustDoStrip tasks={tasks} onComplete={complete} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 md:gap-6">
        <section className="rounded-2xl bg-white shadow-card p-3 md:p-4 overflow-auto">
          <DayTimeline
            date={date}
            events={events}
            tasks={scheduledToday}
          />
        </section>

        <aside className="space-y-3">
          <header className="flex items-center justify-between px-1">
            <div className="text-sm font-medium">Can Do Later</div>
            <div className="text-xs text-muted">{inboxForToday.length}</div>
          </header>
          <div className="space-y-2">
            {inboxForToday.length === 0 ? (
              <div className="rounded-xl bg-paper border border-mist p-4 text-sm text-muted">
                Inbox is clear.
              </div>
            ) : (
              inboxForToday.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onComplete={complete}
                  onPromote={promote}
                  compact
                />
              ))
            )}
          </div>
        </aside>
      </div>

      {planOpen ? (
        <DailyPlanModal
          date={date}
          onClose={() => setPlanOpen(false)}
          onCommitted={() => {
            setPlanOpen(false);
            router.refresh();
          }}
        />
      ) : null}

      {shutdownOpen ? (
        <ShutdownModal
          date={date}
          tasks={tasks}
          onClose={() => setShutdownOpen(false)}
          onCommitted={() => {
            setShutdownOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
