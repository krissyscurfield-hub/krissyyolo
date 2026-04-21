import { requireUser } from "@/lib/supabase/server";
import { InboxView } from "@/components/InboxView";
import type { Task } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "DONE")
    .order("priority")
    .order("created_at", { ascending: false });

  return <InboxView initial={(data ?? []) as Task[]} />;
}
