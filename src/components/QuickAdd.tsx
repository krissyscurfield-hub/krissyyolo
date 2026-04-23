"use client";

import { useState } from "react";
import { Plus, CalendarDays, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuickAddValue {
  raw: string;
  priority: 1 | 2 | 3;
  dueDate: string | null;
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
      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3.5">
        <Plus size={18} className="text-muted shrink-0" />
        <input
          autoFocus={autoFocus}
          disabled={busy}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "What needs to happen?"}
          className="flex-1 bg-transparent outline-none placeholder:text-muted text-[15px]"
          style={{ fontSize: "16px" }}
        />
        {value.trim() ? (
          <button
            type="submit"
            disabled={busy}
            className="text-xs font-medium rounded-lg bg-ink text-paper px-3 py-1.5 disabled:opacity-40 transition"
          >
            Add
          </button>
        ) : null}
      </form>

      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-mist/50">
        {/* Priority dots — no labels, pure visual */}
        <div className="flex items-center gap-1.5">
          {(
            [
              { p: 1, color: "bg-cadence" },
              { p: 2, color: "bg-amber" },
              { p: 3, color: "bg-muted/40" },
            ] as const
          ).map((opt) => {
            const active = priority === opt.p;
            return (
              <button
                key={opt.p}
                type="button"
                onClick={() => setPriority(opt.p)}
                aria-label={`Priority ${opt.p}`}
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center transition",
                  active ? "bg-paper ring-2 ring-ink/80" : "hover:bg-paper"
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full", opt.color)} />
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-mist" />

        <label className="flex items-center gap-1.5 cursor-pointer">
          <CalendarDays size={13} className={dueDate ? "text-cadence" : "text-muted"} />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={cn(
              "bg-transparent outline-none border-0 font-medium",
              dueDate ? "text-cadence" : "text-muted"
            )}
            style={{ fontSize: "13px" }}
          />
          {dueDate ? (
            <button
              type="button"
              onClick={() => setDueDate("")}
              aria-label="Clear deadline"
              className="text-muted hover:text-ink"
            >
              <X size={11} />
            </button>
          ) : null}
        </label>
      </div>
    </div>
  );
}
