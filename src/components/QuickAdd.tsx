"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
  onAdd: (raw: string) => Promise<void> | void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function QuickAdd({ onAdd, placeholder, autoFocus }: Props) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setBusy(true);
    try {
      await onAdd(value.trim());
      setValue("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl bg-white shadow-card px-4 py-3">
      <Plus size={16} className="text-muted shrink-0" />
      <input
        autoFocus={autoFocus}
        disabled={busy}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "Add task — e.g. Call Alex tomorrow 3pm !1 #business"}
        className="flex-1 bg-transparent outline-none placeholder:text-muted text-sm"
      />
      <span className="text-xs text-muted hidden sm:inline">⏎</span>
    </form>
  );
}
