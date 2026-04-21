import { requireUser } from "@/lib/supabase/server";
import { WeekView } from "@/components/WeekView";
import type { Task, CalendarEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function WeekPage() {
  const { supabase, user } = await requireUser();
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const [{ data: events }, { data: tasks }] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("starts_at", start.toISOString())
      .lt("starts_at", end.toISOString()),
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_start", start.toISOString())
      .lt("scheduled_start", end.toISOString()),
  ]);

  return (
    <WeekView
      startISO={start.toISOString()}
      events={(events ?? []) as CalendarEvent[]}
      tasks={(tasks ?? []) as Task[]}
    />
  );
}
