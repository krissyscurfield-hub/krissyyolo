import { TodayView } from "@/components/TodayView";
import { requireUser } from "@/lib/supabase/server";
import { endOfLocalDay, startOfLocalDay } from "@/lib/utils";
import type { Task, CalendarEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const { supabase, user } = await requireUser();
  const today = new Date();
  const from = startOfLocalDay(today).toISOString();
  const to = endOfLocalDay(today).toISOString();

  const [{ data: events }, { data: tasks }, { data: account }] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("starts_at", from)
      .lte("starts_at", to)
      .order("starts_at"),
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .or(
        `and(scheduled_start.gte.${from},scheduled_start.lte.${to}),status.eq.INBOX,must_do_today.eq.true`
      )
      .order("priority"),
    supabase.from("calendar_accounts").select("id").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <TodayView
      initialEvents={(events ?? []) as CalendarEvent[]}
      initialTasks={(tasks ?? []) as Task[]}
      dateISO={today.toISOString()}
      calendarConnected={!!account}
    />
  );
}
