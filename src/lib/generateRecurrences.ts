// Idempotently generate today's task instances from the user's recurrence templates.
// Called server-side when the Today page loads — cheap and runs in the same render.

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  shouldRunOn,
  buildTaskRowFromTemplate,
  dateOnly,
  type RecurrenceTemplate,
} from "./recurrence";

export async function ensureTodaysRecurrences(
  supabase: SupabaseClient,
  userId: string,
  day: Date = new Date()
): Promise<{ generated: number }> {
  const today = dateOnly(day);
  const { data: templates, error } = await supabase
    .from("recurrences")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true);
  if (error || !templates) return { generated: 0 };

  let generated = 0;
  for (const t of templates as RecurrenceTemplate[]) {
    if (t.last_generated_on === today) continue;
    if (!shouldRunOn(t, day)) continue;
    const row = buildTaskRowFromTemplate(t, day);
    const { error: insErr } = await supabase.from("tasks").insert(row);
    if (!insErr) {
      generated++;
      await supabase
        .from("recurrences")
        .update({ last_generated_on: today })
        .eq("id", t.id)
        .eq("user_id", userId);
    }
  }
  return { generated };
}
