import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { startOfLocalDay, endOfLocalDay } from "@/lib/utils";

// POST { date, rollForwardIds: string[] }
// Rolls unfinished tasks forward (clears schedule, status → INBOX, keeps title/priority).
export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { date, rollForwardIds = [] } = await request.json();
    const d = date ? new Date(date) : new Date();
    const from = startOfLocalDay(d).toISOString();
    const to = endOfLocalDay(d).toISOString();

    if (!Array.isArray(rollForwardIds) || rollForwardIds.length === 0) {
      return NextResponse.json({ rolled: 0 });
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        scheduled_start: null,
        scheduled_end: null,
        status: "INBOX",
        must_do_today: false,
        rolled_from_date: from.slice(0, 10),
      })
      .in("id", rollForwardIds)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ rolled: rollForwardIds.length, from, to });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
