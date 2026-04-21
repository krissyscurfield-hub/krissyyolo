"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Calendar, Inbox, CalendarDays, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const items = [
  { href: "/today", label: "Today", icon: Calendar },
  { href: "/week", label: "Week", icon: CalendarDays },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-mist bg-paper flex flex-col">
      <div className="px-5 py-6">
        <div className="text-lg font-display font-semibold tracking-tight">Cadence</div>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition",
                active ? "bg-white shadow-card text-ink" : "text-muted hover:text-ink"
              )}
            >
              <Icon size={16} />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={signOut}
        className="m-2 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-ink transition"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </aside>
  );
}
