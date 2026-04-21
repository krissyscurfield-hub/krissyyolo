"use client";

import type { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";

interface Props {
  tasks: Task[];
  onComplete: (id: string) => void;
  cap?: number;
}

export function MustDoStrip({ tasks, onComplete, cap = 3 }: Props) {
  const items = tasks.filter((t) => t.must_do_today && t.status !== "DONE").slice(0, cap);
  const doneCount = tasks.filter((t) => t.must_do_today && t.status === "DONE").length;

  return (
    <section className="rounded-2xl bg-paper border border-mist p-4">
      <header className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">Must Do Today</div>
        <div className="text-xs text-muted">
          {items.length}/{cap}
          {doneCount > 0 ? ` · ${doneCount} done` : ""}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="text-sm text-muted">
          Nothing promoted yet. Pick up to {cap} from below.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <TaskCard key={t.id} task={t} onComplete={onComplete} />
          ))}
        </div>
      )}
    </section>
  );
}
