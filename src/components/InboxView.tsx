"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import { QuickAdd } from "./QuickAdd";
import { TaskCard } from "./TaskCard";
import { parseQuickAdd } from "@/lib/parse";

export function InboxView({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initial);

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
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "DONE", completed_at: new Date().toISOString() } : t
      )
    );
    await fetch(`/api/tasks/${id}/complete`, { method: "POST" });
  }

  const p1 = tasks.filter((t) => t.priority === 1);
  const p2 = tasks.filter((t) => t.priority === 2);
  const p3 = tasks.filter((t) => t.priority === 3);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <h1 className="text-2xl font-display font-semibold">Inbox</h1>
      <QuickAdd onAdd={addTask} autoFocus />
      <Section title="P1" count={p1.length}>
        {p1.map((t) => (
          <TaskCard key={t.id} task={t} onComplete={complete} />
        ))}
      </Section>
      <Section title="P2" count={p2.length}>
        {p2.map((t) => (
          <TaskCard key={t.id} task={t} onComplete={complete} />
        ))}
      </Section>
      <Section title="P3" count={p3.length}>
        {p3.map((t) => (
          <TaskCard key={t.id} task={t} onComplete={complete} />
        ))}
      </Section>
      {tasks.length === 0 ? (
        <div className="rounded-2xl bg-paper border border-mist p-8 text-center text-muted">
          You&apos;re clear. Go train.
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="space-y-2">
      <header className="flex items-center justify-between px-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted">{count}</div>
      </header>
      {children}
    </section>
  );
}
