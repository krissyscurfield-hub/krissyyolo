import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { connectAppleClient } from "@/lib/caldav";
import { encryptSecret } from "@/lib/encrypt";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "username and password required" }, { status: 400 });
    }

    // Verify credentials actually work with iCloud.
    try {
      const client = await connectAppleClient(username, password);
      await client.fetchCalendars();
    } catch (e: any) {
      return NextResponse.json(
        { error: "iCloud rejected these credentials. Use an app-specific password from appleid.apple.com." },
        { status: 400 }
      );
    }

    const ciphertext = encryptSecret(password);

    const { error } = await supabase.from("calendar_accounts").upsert(
      {
        user_id: user.id,
        provider: "apple",
        display_name: username,
        username,
        password_ciphertext: ciphertext,
        caldav_url: "https://caldav.icloud.com",
      },
      { onConflict: "user_id" }
    );
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
