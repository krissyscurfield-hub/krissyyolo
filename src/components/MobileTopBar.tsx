"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function MobileTopBar() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <header
      className="md:hidden sticky top-0 z-30 bg-paper/85 backdrop-blur-md border-b border-mist flex items-center justify-between px-4 py-3"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.5rem)" }}
    >
      <div className="text-lg font-display font-semibold tracking-tight">Cadence</div>
      <button
        onClick={signOut}
        className="text-muted hover:text-ink p-2 -mr-2"
        aria-label="Sign out"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
