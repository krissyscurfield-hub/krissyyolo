"use client";

import { useMemo, useState } from "react";
import { Modal } from "./Modal";
import { Moon } from "lucide-react";
import type { Task } from "@/lib/types";
import { startOfLocalDay, endOfLocalDay } from "@/lib/utils";

export function ShutdownModal({
  date,
  tasks,
  onClose,
  onCommitted,
}: {
  date: Date;
  tasks: Task[];
  onClose: () => void;
  onCommitted: () => void;
}) {
  const unfinished = useMemo(() => {
    const from = startOfLocalDay(date).getTime();
    const to = endOfLocalDay(date).getTime();
    return tasks.filter((t) => {
      if (t.status === "DONE") return false;
      if (!t.scheduled_start && !t.must_do_today) return false;
      if (!t.scheduled_start) return true;
      const s = new Date(t.scheduled_start).getTime();
      return s >= from && s <= to;
    });
  }, [tasks, date]);

  const [roll, setRoll] = useState<Set<string>>(new Set(unfinished.map((t) => t.id)));
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);

  async function commit() {
    setLoading(true);
    await fetch("/api/plan/shutdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: date.toISOString(),
        rollForwardIds: Array.from(roll),
      }),
    });
    setLoading(false);
    onCommitted();
  }

  return (
    <Modal
      title="Shutdown"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted">Tomorrow is planned. Go rest.</div>
          <button
            onClick={commit}
            disabled={loading}
            className="rounded-xl bg-ink text-white px-4 py-2 text-sm inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            <Moon size={14} />
            {loading ? "Closing…" : "Close day"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <section>
          <div className="text-sm font-medium mb-2">Roll forward</div>
          {unfinished.length === 0 ? (
            <div className="text-sm text-muted">
              Everything is done. Rare. Enjoy it.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-auto">
              {unfinished.map((t) => {
                const on = roll.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() =>
                      setRoll((prev) => {
                        const next = new Set(prev);
                        on ? next.delete(t.id) : next.add(t.id);
                        return next;
                      })
                    }
                    className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition ${
                      on ? "border-cadence bg-cadence/8" : "border-mist hover:border-ink/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{t.title}</span>
                      <span className="text-xs text-muted">
                        {on ? "→ tomorrow" : "drop"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="text-sm font-medium mb-2">Reflection (optional)</div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="One line on how today felt."
            className="w-full rounded-xl border border-mist px-3 py-2 text-sm outline-none focus:border-cadence resize-none"
            rows={3}
          />
        </section>
      </div>
    </Modal>
  );
}
