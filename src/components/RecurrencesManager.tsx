"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Repeat2 } from "lucide-react";

type Cadence = "daily" | "weekdays" | "weekends" | "weekly";

interface Recurrence {
  id: string;
  title: string;
  priority: 1 | 2 | 3;
  estimated_minutes: number;
  scheduled_time: string | null;
  cadence: Cadence;
  days_of_week: number[] | null;
  active: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RecurrencesManager() {
  const [items, setItems] = useState<Recurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/recurrences");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  async function remove(id: string) {
    const before = items;
    setItems((prev) => prev.filter((r) => r.id !== id));
    const res = await fetch(`/api/recurrences/${id}`, { method: "DELETE" });
    if (!res.ok) setItems(before);
  }

  async function toggle(r: Recurrence) {
    const before = items;
    setItems((prev) => prev.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)));
    const res = await fetch(`/api/recurrences/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !r.active }),
    });
    if (!res.ok) setItems(before);
  }

  if (loading) {
    return <div className="rounded-2xl bg-white shadow-card p-5 text-sm text-muted">Loading…</div>;
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && !adding ? (
        <div className="rounded-2xl bg-white shadow-card p-5 space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <Repeat2 size={16} className="text-cadence" />
            No recurring tasks yet
          </div>
          <div className="text-sm text-muted">
            Templates like &ldquo;Workout 6am 1h weekdays&rdquo; auto-create a task every
            matching morning. Cuts out the daily copy-paste.
          </div>
        </div>
      ) : null}

      {items.map((r) => (
        <div
          key={r.id}
          className="rounded-2xl bg-white shadow-card p-4 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{r.title}</div>
            <div className="text-xs text-muted mt-0.5">
              {cadenceLabel(r)} {r.scheduled_time ? `· ${r.scheduled_time}` : ""} · {r.estimated_minutes}m · P{r.priority}
            </div>
          </div>
          <button
            onClick={() => toggle(r)}
            className={`text-xs px-2.5 py-1.5 rounded-lg ${
              r.active ? "bg-sage/15 text-sage" : "bg-mist text-muted"
            }`}
          >
            {r.active ? "On" : "Off"}
          </button>
          <button
            onClick={() => remove(r.id)}
            aria-label="Delete"
            className="text-muted hover:text-amber p-2 -mr-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {adding ? (
        <AddForm
          onCancel={() => setAdding(false)}
          onAdded={(r) => {
            setItems((prev) => [r, ...prev]);
            setAdding(false);
          }}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-2xl border-2 border-dashed border-mist text-sm text-muted hover:text-ink hover:border-ink/20 py-3 inline-flex items-center justify-center gap-2 transition"
        >
          <Plus size={14} /> Add recurring task
        </button>
      )}
    </div>
  );
}

function cadenceLabel(r: Recurrence) {
  if (r.cadence === "daily") return "Every day";
  if (r.cadence === "weekdays") return "Weekdays";
  if (r.cadence === "weekends") return "Weekends";
  if (r.cadence === "weekly" && r.days_of_week?.length)
    return r.days_of_week.map((d) => DAYS[d]).join(" · ");
  return "Weekly";
}

function AddForm({
  onCancel,
  onAdded,
}: {
  onCancel: () => void;
  onAdded: (r: Recurrence) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<1 | 2 | 3>(3);
  const [minutes, setMinutes] = useState(30);
  const [time, setTime] = useState<string>("");
  const [cadence, setCadence] = useState<Cadence>("daily");
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/recurrences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        priority,
        estimated_minutes: minutes,
        scheduled_time: time || null,
        cadence,
        days_of_week: cadence === "weekly" ? days : null,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Failed");
      return;
    }
    onAdded(await res.json());
  }

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white shadow-card p-4 space-y-3">
      <input
        required
        placeholder="Title — e.g. Morning workout"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-xl border border-mist px-3 py-2.5 outline-none focus:border-cadence"
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[11px] text-muted uppercase tracking-wider">Time (optional)</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-mist px-3 py-2 outline-none focus:border-cadence font-mono"
          />
        </label>
        <label className="block">
          <span className="text-[11px] text-muted uppercase tracking-wider">Duration (min)</span>
          <input
            type="number"
            min={5}
            step={5}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-mist px-3 py-2 outline-none focus:border-cadence font-mono"
          />
        </label>
      </div>

      <div>
        <div className="text-[11px] text-muted uppercase tracking-wider mb-1.5">Repeat</div>
        <div className="grid grid-cols-4 gap-1.5">
          {(["daily", "weekdays", "weekends", "weekly"] as Cadence[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCadence(c)}
              className={`rounded-lg text-xs py-2 border transition capitalize ${
                cadence === c ? "border-cadence bg-cadence/10 text-ink" : "border-mist text-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {cadence === "weekly" ? (
        <div className="flex gap-1">
          {DAYS.map((d, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={`flex-1 rounded-lg text-xs py-2 border transition ${
                days.includes(i)
                  ? "border-cadence bg-cadence/10 text-ink"
                  : "border-mist text-muted"
              }`}
            >
              {d[0]}
            </button>
          ))}
        </div>
      ) : null}

      <div>
        <div className="text-[11px] text-muted uppercase tracking-wider mb-1.5">Priority</div>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p as 1 | 2 | 3)}
              className={`rounded-lg text-xs py-2 border transition ${
                priority === p ? "border-cadence bg-cadence/10 text-ink" : "border-mist text-muted"
              }`}
            >
              P{p}
            </button>
          ))}
        </div>
      </div>

      {error ? <div className="text-xs text-amber">{error}</div> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-mist text-sm py-2.5 hover:border-ink/20 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy || !title}
          className="flex-1 rounded-xl bg-ink text-white text-sm py-2.5 font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {busy ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}
