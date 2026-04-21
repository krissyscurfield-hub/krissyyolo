import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from("tasks")
      .update({ status: "DONE", completed_at: new Date().toISOString() })
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
