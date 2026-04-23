"use client";

import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Props {
  tasks: Task[];
  onComplete: (id: string) => void;
  cap?: number;
}

export function MustDoStrip({ tasks, onComplete, cap = 3 }: Props) {
  const items = tasks.filter((t) => t.must_do_today && t.status !== "DONE").slice(0, cap);
  const doneCount = tasks.filter((t) => t.must_do_today && t.status === "DONE").length;
  if (items.length === 0 && doneCount === 0) return null;

  return (
    <section>
      <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-2 px-1 flex items-center justify-between">
        <span>Must do today</span>
        <span className="normal-case tracking-normal text-muted">
          {items.length}/{cap}
          {doneCount > 0 ? ` · ${doneCount} done` : ""}
        </span>
      </h2>

      <div className="space-y-2">
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => onComplete(t.id)}
            className="group w-full flex items-center gap-3 rounded-xl bg-white shadow-card px-4 py-3 text-left transition active:scale-[0.99]"
          >
            <span
              className={cn(
                "shrink-0 h-6 w-6 rounded-full border-2 border-mist flex items-center justify-center transition",
                "group-hover:border-cadence group-active:scale-90"
              )}
            >
              <Check size={14} className="text-transparent group-hover:text-cadence transition" />
            </span>
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
            <span className="text-sm font-medium truncate flex-1">{t.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
