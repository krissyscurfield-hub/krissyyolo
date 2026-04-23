import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();
    const patch: Record<string, any> = {};
    for (const k of [
      "title",
      "priority",
      "category_id",
      "estimated_minutes",
      "scheduled_time",
      "cadence",
      "days_of_week",
      "starts_on",
      "active",
    ]) {
      if (k in body) patch[k] = body[k];
    }
    const { data, error } = await supabase
      .from("recurrences")
      .update(patch)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from("recurrences")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
