import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

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

    const { data, error } = await supabase.from("tasks").insert(row).select("*").single();
    if (error) throw error;

    // Best-effort: if scheduled, write to Apple Calendar (non-blocking)
    if (row.scheduled_start) {
      fetch(new URL("/api/calendar/events", request.url), {
        method: "POST",
        headers: { "Content-Type": "application/json", cookie: request.headers.get("cookie") ?? "" },
        body: JSON.stringify({ taskId: data.id }),
      }).catch(() => {});
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
