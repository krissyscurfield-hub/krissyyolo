"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Fields = {
  work_hours_start: string;
  work_hours_end: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
};

export function WorkHoursForm({ initial }: { initial: Fields }) {
  const [f, setF] = useState<Fields>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({
      work_hours_start: f.work_hours_start,
      work_hours_end: f.work_hours_end,
      quiet_hours_start: f.quiet_hours_start,
      quiet_hours_end: f.quiet_hours_end,
    }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function bind(key: keyof Fields) {
    return {
      value: f[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setF((prev) => ({ ...prev, [key]: e.target.value })),
    };
  }

  return (
    <div className="rounded-2xl bg-white shadow-card p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Work start" type="time" {...bind("work_hours_start")} />
        <Field label="Work end" type="time" {...bind("work_hours_end")} />
        <Field label="Quiet start" type="time" {...bind("quiet_hours_start")} />
        <Field label="Quiet end" type="time" {...bind("quiet_hours_end")} />
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted">
          Tasks auto-scheduled only inside work hours, never during quiet hours.
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl bg-ink text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm text-muted">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full rounded-xl border border-mist px-3 py-2 outline-none focus:border-cadence font-mono"
      />
    </label>
  );
}
