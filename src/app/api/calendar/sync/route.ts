import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { connectAppleClient, fetchEventsInRange } from "@/lib/caldav";
import { decryptSecret } from "@/lib/encrypt";

export async function POST() {
  try {
    const { supabase, user } = await requireUser();
    const { data: account } = await supabase
      .from("calendar_accounts")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!account) return NextResponse.json({ error: "no calendar connected" }, { status: 400 });

    const password = decryptSecret(account.password_ciphertext);
    const client = await connectAppleClient(account.username, password);

    // Pull a window: now - 1 day → now + 30 days
    const from = new Date();
    from.setDate(from.getDate() - 1);
    const to = new Date();
    to.setDate(to.getDate() + 30);

    const buckets = await fetchEventsInRange(client, from, to);

    let saved = 0;
    let totalFetched = 0;
    const errors: string[] = [];

    for (const { calendarName, events } of buckets) {
      totalFetched += events.length;
      for (const e of events) {
        const row = {
          user_id: user.id,
          account_id: account.id,
          external_uid: e.uid,
          calendar_name: calendarName,
          title: e.summary,
          description: e.description ?? null,
          location: e.location ?? null,
          starts_at: e.start.toISOString(),
          ends_at: e.end.toISOString(),
          all_day: e.allDay,
          source: "apple",
        };
        const { error } = await supabase
          .from("calendar_events")
          .upsert(row, { onConflict: "account_id,external_uid" });
        if (error) {
          if (errors.length < 3) errors.push(error.message);
        } else {
          saved++;
        }
      }
    }

    await supabase
      .from("calendar_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", account.id);

    return NextResponse.json({
      ok: true,
      calendars: buckets.length,
      totalFetched,
      saved,
      errors,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
