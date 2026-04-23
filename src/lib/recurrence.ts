// Pure helpers for deciding whether a recurrence should fire on a given day,
// and for constructing the concrete task row from a template.

export interface RecurrenceTemplate {
  id: string;
  user_id: string;
  title: string;
  priority: 1 | 2 | 3;
  category_id: string | null;
  estimated_minutes: number;
  scheduled_time: string | null; // "HH:MM" or null
  cadence: "daily" | "weekdays" | "weekends" | "weekly";
  days_of_week: number[] | null;
  starts_on: string | null;      // "YYYY-MM-DD"
  last_generated_on: string | null;
  active: boolean;
}

export function shouldRunOn(r: RecurrenceTemplate, day: Date): boolean {
  if (!r.active) return false;
  if (r.starts_on) {
    const starts = new Date(r.starts_on + "T00:00:00");
    if (day < starts) return false;
  }
  const dow = day.getDay(); // 0 Sun .. 6 Sat
  switch (r.cadence) {
    case "daily":
      return true;
    case "weekdays":
      return dow >= 1 && dow <= 5;
    case "weekends":
      return dow === 0 || dow === 6;
    case "weekly":
      return Array.isArray(r.days_of_week) && r.days_of_week.includes(dow);
    default:
      return false;
  }
}

export function buildTaskRowFromTemplate(
  r: RecurrenceTemplate,
  day: Date
): Record<string, any> {
  let scheduled_start: string | null = null;
  let scheduled_end: string | null = null;
  if (r.scheduled_time) {
    const [h, m] = r.scheduled_time.split(":").map(Number);
    const start = new Date(day);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + r.estimated_minutes * 60_000);
    scheduled_start = start.toISOString();
    scheduled_end = end.toISOString();
  }
  return {
    user_id: r.user_id,
    title: r.title,
    priority: r.priority,
    category_id: r.category_id,
    estimated_minutes: r.estimated_minutes,
    scheduled_start,
    scheduled_end,
    status: scheduled_start ? "SCHEDULED" : "INBOX",
    recurrence_id: r.id,
  };
}

export function dateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}
