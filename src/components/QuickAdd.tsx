"use client";

import { useState } from "react";
import { Plus, Flag, CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickAddValue {
  raw: string;
  priority: 1 | 2 | 3;
  dueDate: string | null; // "YYYY-MM-DD" or null
}

interface Props {
  onAdd: (value: QuickAddValue) => Promise<void> | void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function QuickAdd({ onAdd, placeholder, autoFocus }: Props) {
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(3);
  const [dueDate, setDueDate] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    try {
      await onAdd({
        raw: value.trim(),
        priority,
        dueDate: dueDate || null,
      });
      setValue("");
      setPriority(3);
      setDueDate("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-card overflow-hidden">
      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3">
        <Plus size={18} className="text-muted shrink-0" />
        <input
          autoFocus={autoFocus}
          disabled={busy}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "Add a task — e.g. Call Alex 3pm"}
          className="flex-1 bg-transparent outline-none placeholder:text-muted"
          style={{ fontSize: "16px" }}
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          className="text-xs font-medium rounded-lg bg-ink text-white px-3 py-1.5 disabled:opacity-40 transition"
        >
          Add
        </button>
      </form>

      <div className="flex items-center gap-2 px-3 pb-3 pt-0 border-t border-mist/60 flex-wrap">
        <div className="flex items-center gap-1">
          <Flag size={12} className="text-muted ml-1 mr-0.5" />
          {(
            [
              { p: 1, label: "High", color: "bg-cadence text-white" },
              { p: 2, label: "Med", color: "bg-amber/15 text-amber" },
              { p: 3, label: "Low", color: "bg-mist text-muted" },
            ] as const
          ).map((opt) => {
            const active = priority === opt.p;
            return (
              <button
                key={opt.p}
                type="button"
                onClick={() => setPriority(opt.p)}
                className={cn(
                  "text-[11px] rounded-full px-2.5 py-1 font-medium transition",
                  active
                    ? opt.color
                    : "text-muted hover:text-ink"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-mist" />

        <label className="flex items-center gap-1.5 cursor-pointer">
          <CalendarDays size={12} className="text-muted" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={cn(
              "text-[11px] bg-transparent outline-none border-0 font-medium",
              dueDate ? "text-cadence" : "text-muted"
            )}
            style={{ fontSize: "12px" }}
          />
          {dueDate ? (
            <button
              type="button"
              onClick={() => setDueDate("")}
              className="text-muted hover:text-ink"
              aria-label="Clear deadline"
            >
              <X size={10} />
            </button>
          ) : null}
        </label>
      </div>
    </div>
  );
}
