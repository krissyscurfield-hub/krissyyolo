import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { connectAppleClient, ensureCadenceCalendar, createAppleEvent } from "@/lib/caldav";
import { decryptSecret } from "@/lib/encrypt";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let q = supabase.from("tasks").select("*").eq("user_id", user.id);
    if (status) q = q.eq("status", status);
    if (from) q = q.gte("scheduled_start", from);
    if (to) q = q.lte("scheduled_start", to);
    const { data, error } = await q.order("priority").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();
    const row = {
      user_id: user.id,
      title: String(body.title ?? "").trim(),
      priority: (body.priority ?? 3) as 1 | 2 | 3,
      estimated_minutes: body.estimated_minutes ?? 30,
      scheduled_start: body.scheduled_start ?? null,
      scheduled_end: body.scheduled_start && body.estimated_minutes
        ? new Date(new Date(body.scheduled_start).getTime() + body.estimated_minutes * 60000).toISOString()
        : null,
      due_date: body.due_date ?? null,
      must_do_today: !!body.must_do_today,
      category_id: body.category_id ?? null,
      notes: body.notes ?? null,
      status: body.scheduled_start ? "SCHEDULED" : "INBOX",
    };
    if (!row.title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const { data: task, error } = await supabase.from("tasks").insert(row).select("*").single();
    if (error) throw error;

    // Write to Apple Calendar inline (so errors surface) but never block the task create.
    if (task?.scheduled_start && task?.scheduled_end) {
      try {
        const { data: account } = await supabase
          .from("calendar_accounts")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (account) {
          const password = decryptSecret(account.password_ciphertext);
          const client = await connectAppleClient(account.username, password);
          const calUrl = await ensureCadenceCalendar(client);
          const { uid } = await createAppleEvent(client, calUrl, {
            title: task.title,
            description: task.notes ?? undefined,
            start: new Date(task.scheduled_start),
            end: new Date(task.scheduled_end),
          });

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
            await supabase.from("tasks").update({ external_event_id: evt.id }).eq("id", task.id);
          }
        }
      } catch (calErr) {
        // Log but don't fail the task creation — user will see task saved; calendar write is best-effort.
        console.warn("calendar writeback failed:", (calErr as Error).message);
      }
    }

    return NextResponse.json(task);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
