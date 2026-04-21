import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { connectAppleClient, ensureCadenceCalendar, createAppleEvent } from "@/lib/caldav";
import { decryptSecret } from "@/lib/encrypt";

// POST { taskId } — write a scheduled task into Apple Calendar.
export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { taskId } = await request.json();

    const { data: task } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!task?.scheduled_start || !task.scheduled_end) {
      return NextResponse.json({ skipped: "task not scheduled" });
    }

    const { data: account } = await supabase
      .from("calendar_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!account) return NextResponse.json({ skipped: "no calendar" });

    const password = decryptSecret(account.password_ciphertext);
    const client = await connectAppleClient(account.username, password);
    const calUrl = await ensureCadenceCalendar(client);

    const { uid } = await createAppleEvent(client, calUrl, {
      title: task.title,
      description: task.notes ?? undefined,
      start: new Date(task.scheduled_start),
      end: new Date(task.scheduled_end),
    });

    // Record the event locally + link to task
    const { data: evt } = await supabase
      .from("calendar_events")
      .insert({
        user_id: user.id,
        account_id: account.id,
        external_uid: uid,
        title: task.title,
        starts_at: task.scheduled_start,
        ends_at: task.scheduled_end,
        source: "cadence",
        linked_task_id: task.id,
      })
      .select("id")
      .single();

    if (evt) {
      await supabase
        .from("tasks")
        .update({ external_event_id: evt.id })
        .eq("id", task.id);
    }

    return NextResponse.json({ ok: true, uid });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

// GET ?from=&to= — read cached events in a range.
export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    let q = supabase.from("calendar_events").select("*").eq("user_id", user.id);
    if (from) q = q.gte("starts_at", from);
    if (to) q = q.lte("starts_at", to);
    const { data, error } = await q.order("starts_at");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
