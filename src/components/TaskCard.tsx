"use client";

import { useState } from "react";
import { Check, Clock, CalendarClock, MoreHorizontal, Trash2, Flag } from "lucide-react";
import type { Task } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

interface Props {
  task: Task;
  onComplete?: (id: string) => void;
  onPromote?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSetPriority?: (id: string, p: 1 | 2 | 3) => void;
  compact?: boolean;
}

const priorityColor: Record<number, string> = {
  1: "bg-cadence",
  2: "bg-amber",
  3: "bg-mist",
};

const priorityLabel: Record<number, string> = {
  1: "High",
  2: "Med",
  3: "Low",
};

export function TaskCard({
  task,
  onComplete,
  onPromote,
  onDelete,
  onSetPriority,
  compact,
}: Props) {
  const done = task.status === "DONE";
  const [menuOpen, setMenuOpen] = useState(false);

  const dueLabel = task.due_date ? formatDueDate(task.due_date) : null;

  return (
    <div
      className={cn(
        "group rounded-xl bg-white shadow-card px-4 relative",
        compact ? "py-2" : "py-3",
        done && "opacity-55"
      )}
    >
      <div className="flex items-center gap-3">
        <button
          aria-label={done ? "Mark incomplete" : "Complete task"}
          onClick={() => onComplete?.(task.id)}
          className={cn(
            "shrink-0 h-6 w-6 rounded-full border-2 border-mist flex items-center justify-center transition",
            done ? "border-sage bg-sage" : "group-hover:border-cadence active:scale-90"
          )}
        >
          {done ? <Check size={14} className="text-white" /> : null}
        </button>

        <span className={cn("h-2 w-2 rounded-full shrink-0", priorityColor[task.priority])} />

        <div className="flex-1 min-w-0">
          <div className={cn("text-sm truncate", done && "line-through decoration-muted")}>
            {task.title}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {task.scheduled_start ? (
              <span className="text-xs text-muted inline-flex items-center gap-1">
                <Clock size={10} />
                {formatTime(task.scheduled_start)}
                {task.estimated_minutes ? ` · ${task.estimated_minutes}m` : null}
              </span>
            ) : null}
            {dueLabel ? (
              <span className="text-xs inline-flex items-center gap-1 rounded-full bg-amber/10 text-amber px-2 py-0.5 font-medium">
                <CalendarClock size={10} />
                {dueLabel}
              </span>
            ) : null}
          </div>
        </div>

        {!task.must_do_today && !done && onPromote ? (
          <button
            onClick={() => onPromote(task.id)}
            className="text-xs text-muted hover:text-cadence hidden md:inline transition"
          >
            Must do
          </button>
        ) : null}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          aria-label="More"
          className="text-muted hover:text-ink p-1.5 -mr-1.5 rounded-lg transition"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {menuOpen ? (
        <>
          <button
            className="fixed inset-0 z-30"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute right-3 top-11 z-40 w-52 rounded-xl bg-white shadow-card border border-mist py-1 text-sm">
            <div className="px-3 py-1.5 text-[11px] text-muted uppercase tracking-wider">
              Priority
            </div>
            <div className="flex gap-1 px-2 pb-2">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onSetPriority?.(task.id, p as 1 | 2 | 3);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex-1 text-xs rounded-lg py-1.5 font-medium transition",
                    task.priority === p
                      ? p === 1
                        ? "bg-cadence text-white"
                        : p === 2
                        ? "bg-amber/20 text-amber"
                        : "bg-mist text-ink"
                      : "text-muted hover:bg-paper"
                  )}
                >
                  <Flag size={10} className="inline -mt-0.5 mr-1" />
                  {priorityLabel[p]}
                </button>
              ))}
            </div>
            {!task.must_do_today && !done && onPromote ? (
              <button
                onClick={() => {
                  onPromote(task.id);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-paper transition"
              >
                Promote to Must Do Today
              </button>
            ) : null}
            {onDelete ? (
              <button
                onClick={() => {
                  onDelete(task.id);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-amber hover:bg-amber/5 transition inline-flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function formatDueDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays === -1) return "Due yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 7) return `Due ${d.toLocaleDateString(undefined, { weekday: "short" })}`;
  return `Due ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}
