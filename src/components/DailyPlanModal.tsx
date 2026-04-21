"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Task } from "@/lib/types";

export function DailyPlanModal({
  date,
  onClose,
  onCommitted,
}: {
  date: Date;
  onClose: () => void;
  onCommitted: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Task[]>([]);
  const [mustDo, setMustDo] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `/api/tasks?from=${encodeURIComponent(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
        )}&to=${encodeURIComponent(
          new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59).toISOString()
        )}`
      );
      if (res.ok) {
        const all: Task[] = await res.json();
        setCandidates(all.filter((t) => t.status !== "DONE"));
        setMustDo(new Set(all.filter((t) => t.must_do_today && t.status !== "DONE").map((t) => t.id)));
      }
    })();
  }, [date]);

  async function runAutoSchedule() {
    setLoading(true);
    const res = await fetch("/api/plan/day", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: date.toISOString() }),
    });
    const j = await res.json();
    setPlaced(j.placed ?? 0);
    setLoading(false);
    setStep(2);
  }

  function toggleMustDo(id: string) {
    setMustDo((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (next.size > 3) {
        // cap at 3
        const first = Array.from(next)[0];
        next.delete(first);
      }
      return next;
    });
  }

  async function commit() {
    setLoading(true);
    const patches = candidates.map((t) =>
      fetch(`/api/tasks/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ must_do_today: mustDo.has(t.id) }),
      })
    );
    await Promise.all(patches);
    setLoading(false);
    onCommitted();
  }

  return (
    <Modal
      title={
        step === 1 ? "Plan my day" : step === 2 ? "Pick your Must Do 3" : "Confirm"
      }
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted">
            Step {step} / 3
          </div>
          <div className="flex gap-2">
            {step === 1 ? (
              <button
                onClick={runAutoSchedule}
                disabled={loading}
                className="rounded-xl bg-ink text-white px-4 py-2 text-sm inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                <Sparkles size={14} />
                {loading ? "Planning…" : "Auto-schedule"}
              </button>
            ) : step === 2 ? (
              <button
                onClick={() => setStep(3)}
                className="rounded-xl bg-ink text-white px-4 py-2 text-sm inline-flex items-center gap-2"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={commit}
                disabled={loading}
                className="rounded-xl bg-ink text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Committing…" : "Commit to day"}
              </button>
            )}
          </div>
        </div>
      }
    >
      {step === 1 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Cadence will fit your unscheduled tasks into free time today, respecting your work
            hours and calendar events. You can still drag anything around after.
          </p>
          <div className="rounded-xl bg-paper border border-mist p-4 text-sm">
            {candidates.length} task{candidates.length === 1 ? "" : "s"} eligible to place.
          </div>
        </div>
      ) : step === 2 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {placed !== null ? `${placed} placed.` : ""} Now pick up to 3 things that
            <em> have</em> to get done. Everything else is Can Do Later.
          </p>
          <div className="space-y-1.5 max-h-72 overflow-auto">
            {candidates.length === 0 ? (
              <div className="text-sm text-muted">Nothing to pick — you&apos;re clear.</div>
            ) : null}
            {candidates.map((t) => {
              const on = mustDo.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleMustDo(t.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition ${
                    on ? "border-cadence bg-cadence/8" : "border-mist hover:border-ink/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{t.title}</span>
                    <span className="text-xs text-muted">P{t.priority}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="text-xs text-muted">{mustDo.size}/3 selected</div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">Ready to go. Confirm to lock in the day.</p>
          <ul className="space-y-1.5">
            {candidates
              .filter((t) => mustDo.has(t.id))
              .map((t) => (
                <li
                  key={t.id}
                  className="rounded-xl bg-cadence/8 border border-cadence/30 px-3 py-2 text-sm"
                >
                  {t.title}
                </li>
              ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
