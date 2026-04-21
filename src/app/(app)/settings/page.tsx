import { requireUser } from "@/lib/supabase/server";
import { CalendarConnectForm } from "@/components/CalendarConnectForm";
import { WorkHoursForm } from "@/components/WorkHoursForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const [{ data: account }, { data: profile }] = await Promise.all([
    supabase.from("calendar_accounts").select("id,display_name,username,last_synced_at").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
      <h1 className="text-2xl font-display font-semibold">Settings</h1>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
          Calendar
        </h2>
        <CalendarConnectForm connected={!!account} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
          Day shape
        </h2>
        <WorkHoursForm
          initial={{
            work_hours_start: profile?.work_hours_start ?? "09:00",
            work_hours_end: profile?.work_hours_end ?? "18:00",
            quiet_hours_start: profile?.quiet_hours_start ?? "22:00",
            quiet_hours_end: profile?.quiet_hours_end ?? "07:00",
          }}
        />
      </section>

      <section className="rounded-2xl bg-white shadow-card p-6">
        <div className="text-sm text-muted">Signed in as</div>
        <div className="text-sm">{user.email}</div>
      </section>
    </div>
  );
}
