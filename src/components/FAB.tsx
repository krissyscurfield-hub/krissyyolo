"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickAddValue } from "./QuickAdd";
import { QuickAdd } from "./QuickAdd";

/**
 * Floating action button for mobile quick capture.
 * Opens a bottom-sheet quick-add overlay.
 */
export function FAB({ onAdd }: { onAdd: (v: QuickAddValue) => Promise<void> | void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Add task"
        className={cn(
          "md:hidden fixed z-40 right-5 rounded-full bg-ink text-paper",
          "h-14 w-14 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
          "active:scale-90 transition"
        )}
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 76px)" }}
      >
        <Plus size={26} />
      </button>

      {open ? (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end bg-ink/30 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl bg-paper p-4 cadence-fade"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-display font-semibold">New task</div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted hover:text-ink p-2 -mr-2"
              >
                <X size={18} />
              </button>
            </div>
            <QuickAdd
              autoFocus
              onAdd={async (v) => {
                await onAdd(v);
                setOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
