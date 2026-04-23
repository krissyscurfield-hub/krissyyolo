"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Moon, RefreshCw, ArrowRight, Calendar as CalIcon } from "lucide-react";
import type { Task, CalendarEvent } from "@/lib/types";
import { QuickAdd } from "./QuickAdd";
import { MustDoStrip } from "./MustDoStrip";
import { TaskCard } from "./TaskCard";
import { DailyPlanModal } from "./DailyPlanModal";
import { ShutdownModal } from "./ShutdownModal";
import { DailyVerse } from "./DailyVerse";
import { DayList } from "./DayList";
import { NowNext } from "./NowNext";
import { FAB } from "./FAB";
import { parseQuickAdd } from "@/lib/parse";
import { startOfLocalDay, endOfLocalDay } from "@/lib/utils";
import type { QuickAddValue } from "./QuickAdd";

function greeting(d: Date) {
  const h = d.getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function TodayView({
  initialEvents,
  initialTasks,
  dateISO,
  calendarConnected = true,
  userName,
}: {
  initialEvents: CalendarEvent[];
  initialTasks: Task[];
  dateISO: string;
  calendarConnected?: boolean;
  userName?: string;
}) {
  const router = useRouter();
  const date = new Date(dateISO);
  const [events] = useState<CalendarEvent[]>(initialEvents);
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

  const doneToday = useMemo(
    () => scheduledToday.filter((t) => t.status === "DONE").length,
    [scheduledToday]
  );

  async function addTask(input: QuickAddValue) {
    const parsed = parseQuickAdd(input.raw);
    const priority = input.priority !== 3 ? input.priority : parsed.priority;
    const dueDate =
      input.dueDate ?? (parsed.dueDate ? parsed.dueDate.toISOString().slice(0, 10) : null);
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: parsed.title,
        priority,
        scheduled_start: parsed.scheduledStart?.toISOString() ?? null,
        estimated_minutes: parsed.estimatedMinutes ?? 30,
        due_date: dueDate,
      }),
    });
    if (res.ok) {
      const t = await res.json();
      setTasks((prev) => [t, ...prev]);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
    }
  }

  async function complete(id: string) {
    const before = tasks;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: "DONE" as const, completed_at: new Date().toISOString() }
          : t
      )
    );
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([6, 20, 6]);
    const res = await fetch(`/api/tasks/${id}/complete`, { method: "POST" });
    if (!res.ok) setTasks(before);
  }

  async function promote(id: string) {
    const before = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, must_do_today: true } : t)));
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ must_do_today: true }),
    });
    if (!res.ok) setTasks(before);
  }

  async function deleteTask(id: string) {
    const before = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok) setTasks(before);
  }

  async function setPriority(id: string, p: 1 | 2 | 3) {
    const before = tasks;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, priority: p } : t)));
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: p }),
    });
    if (!res.ok) setTasks(before);
  }

  async function syncCalendar() {
    setSyncing(true);
    await fetch("/api/calendar/sync", { method: "POST" });
    router.refresh();
    setSyncing(false);
  }

  const allDone = scheduledToday.length > 0 && doneToday === scheduledToday.length;
  const mustDoCount = tasks.filter((t) => t.must_do_today && t.status !== "DONE").length;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-5 md:py-10 space-y-5 md:space-y-7">
      {/* HERO HEADER */}
      <header className="space-y-1.5">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted font-medium">
          {greeting(new Date())}{userName ? `, ${userName}` : ""}
        </div>
        <div className="flex items-end justify-between gap-3">
          <h1 className="text-[40px] md:text-[56px] leading-[1.02] font-display font-semibold tracking-tight">
            {date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}
          </h1>
          <button
            onClick={syncCalendar}
            disabled={syncing}
            aria-label="Sync"
            className="shrink-0 rounded-full bg-white shadow-card h-10 w-10 flex items-center justify-center hover:bg-paper transition disabled:opacity-50 active:scale-90"
          >
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="text-sm text-muted">
          {date.toLocaleDateString(undefined, { weekday: "long" })}
          {scheduledToday.length > 0 ? (
            <span className="ml-3 text-muted">
              · <span className="text-sage font-medium">{doneToday}</span> / {scheduledToday.length} done
            </span>
          ) : null}
        </div>
      </header>

      {/* NOW / NEXT HERO */}
      {allDone ? (
        <section className="rounded-3xl bg-gradient-to-br from-sage/15 to-sage/5 border border-sage/25 px-6 py-7 text-center">
          <div className="text-[11px] uppercase tracking-[0.18em] text-sage font-medium mb-2">
            All done
          </div>
          <div className="text-xl font-display font-semibold text-ink">
            You&apos;re done for today.
          </div>
          <div className="text-sm text-muted mt-1">Go rest.</div>
        </section>
      ) : (
        <NowNext events={events} tasks={tasks} />
      )}

      {/* CALENDAR ONBOARDING BANNER */}
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
              Two-minute setup. Pull your events in and save tasks to iCloud.
            </div>
          </div>
          <ArrowRight size={16} className="text-cadence shrink-0" />
        </Link>
      ) : null}

      {/* QUICK ADD (desktop; mobile uses FAB) */}
      <div className="hidden md:block">
        <QuickAdd onAdd={addTask} />
      </div>

      {/* MUST DO TODAY — only if there's something */}
      {mustDoCount > 0 ? <MustDoStrip tasks={tasks} onComplete={complete} /> : null}

      {/* DAY LIST — the schedule */}
      <section>
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-2 px-1">
          Schedule
        </h2>
        <DayList date={date} events={events} tasks={scheduledToday} onComplete={complete} />
      </section>

      {/* CAN DO LATER — inline below, not sidebar */}
      {inboxForToday.length > 0 ? (
        <section>
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-2 px-1 flex items-center justify-between">
            <span>Can do later</span>
            <span className="normal-case tracking-normal text-muted">{inboxForToday.length}</span>
          </h2>
          <div className="space-y-2">
            {inboxForToday.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onComplete={complete}
                onPromote={promote}
                onDelete={deleteTask}
                onSetPriority={setPriority}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* DAILY VERSE — quiet, at the bottom */}
      <DailyVerse />

      {/* RITUAL BUTTONS — subtle footer pair */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={() => setPlanOpen(true)}
          className="flex-1 rounded-xl bg-ink text-paper px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-[0.98]"
        >
          <Sparkles size={14} />
          Plan my day
        </button>
        <button
          onClick={() => setShutdownOpen(true)}
          className="flex-1 rounded-xl bg-white shadow-card px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-paper transition active:scale-[0.98]"
        >
          <Moon size={14} />
          Shutdown
        </button>
      </div>

      {/* MOBILE FAB */}
      <FAB onAdd={addTask} />

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
