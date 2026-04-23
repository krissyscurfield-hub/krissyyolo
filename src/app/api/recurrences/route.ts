import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("recurrences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
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
      category_id: body.category_id ?? null,
      estimated_minutes: body.estimated_minutes ?? 30,
      scheduled_time: body.scheduled_time ?? null,
      cadence: body.cadence ?? "daily",
      days_of_week: body.days_of_week ?? null,
      starts_on: body.starts_on ?? null,
      active: body.active ?? true,
    };
    if (!row.title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const { data, error } = await supabase
      .from("recurrences")
      .insert(row)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
