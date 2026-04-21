"use client";

import { Check, Clock } from "lucide-react";
import type { Task } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

interface Props {
  task: Task;
  onComplete?: (id: string) => void;
  onPromote?: (id: string) => void;
  compact?: boolean;
}

const priorityColor: Record<number, string> = {
  1: "bg-cadence",
  2: "bg-amber",
  3: "bg-mist",
};

export function TaskCard({ task, onComplete, onPromote, compact }: Props) {
  const done = task.status === "DONE";
  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl bg-white shadow-card px-4",
        compact ? "py-2" : "py-3",
        done && "completed-strike"
      )}
    >
      <button
        aria-label="Complete task"
        onClick={() => onComplete?.(task.id)}
        className={cn(
          "shrink-0 h-5 w-5 rounded-full border-2 border-mist flex items-center justify-center transition",
          done ? "border-sage bg-sage" : "group-hover:border-cadence"
        )}
      >
        {done ? <Check size={12} className="text-white" /> : null}
      </button>

      <span className={cn("h-2 w-2 rounded-full shrink-0", priorityColor[task.priority])} />

      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{task.title}</div>
        {task.scheduled_start ? (
          <div className="text-xs text-muted flex items-center gap-1 mt-0.5">
            <Clock size={10} />
            {formatTime(task.scheduled_start)}
            {task.estimated_minutes ? ` · ${task.estimated_minutes}m` : null}
          </div>
        ) : null}
      </div>

      {!task.must_do_today && !done && onPromote ? (
        <button
          onClick={() => onPromote(task.id)}
          className="text-xs text-muted hover:text-cadence opacity-0 group-hover:opacity-100 transition"
        >
          Must do
        </button>
      ) : null}
    </div>
  );
}
