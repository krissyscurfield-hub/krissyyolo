"use client";

import { useMemo } from "react";
import { verseForDate } from "@/lib/verses";

export function DailyVerse() {
  const verse = useMemo(() => verseForDate(new Date()), []);
  return (
    <section className="rounded-2xl bg-white shadow-card px-5 py-4 border-l-4 border-cadence">
      <div className="text-[11px] uppercase tracking-wider text-muted mb-1.5">
        Verse of the day
      </div>
      <p className="text-sm text-ink leading-relaxed italic">
        &ldquo;{verse.text}&rdquo;
      </p>
      <div className="text-xs text-cadence font-medium mt-2">— {verse.ref}</div>
    </section>
  );
}
