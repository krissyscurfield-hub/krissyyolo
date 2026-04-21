import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { planDay } from "@/lib/scheduler";
import { startOfLocalDay, endOfLocalDay } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json().catch(() => ({}));
    const date = body?.date ? new Date(body.date) : new Date();
    const from = startOfLocalDay(date).toISOString();
    const to = endOfLocalDay(date).toISOString();

    const [{ data: profile }, { data: events }, { data: candidates }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("starts_at", from)
        .lte("starts_at", to),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "DONE")
        .or(
          `scheduled_start.is.null,and(scheduled_start.gte.${from},scheduled_start.lte.${to})`
        ),
    ]);

    if (!profile) return NextResponse.json({ error: "no profile" }, { status: 400 });

    const result = planDay({
      date,
      profile,
      events: events ?? [],
      tasks: candidates ?? [],
    });

    // Persist: set scheduled_start/end and status=SCHEDULED for placed tasks.
    // Tasks that were previously scheduled but didn't fit are pushed back to INBOX.
    const placedIds = new Set(result.assignments.map((a) => a.taskId));

    const placedUpdates = result.assignments.map((a) =>
      supabase
        .from("tasks")
        .update({
          scheduled_start: a.start.toISOString(),
          scheduled_end: a.end.toISOString(),
          status: "SCHEDULED",
        })
        .eq("id", a.taskId)
        .eq("user_id", user.id)
    );

    const unscheduledUpdates = result.unscheduled
      .filter((id) => !placedIds.has(id))
      .map((id) =>
        supabase
          .from("tasks")
          .update({ scheduled_start: null, scheduled_end: null, status: "INBOX" })
          .eq("id", id)
          .eq("user_id", user.id)
      );

    await Promise.all([...placedUpdates, ...unscheduledUpdates]);

    return NextResponse.json({
      placed: result.assignments.length,
      unscheduled: result.unscheduled.length,
      windows: result.windows,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
