"use client";

import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-ink/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-lg md:mx-4 rounded-t-3xl md:rounded-3xl bg-white shadow-card overflow-hidden max-h-[92vh] flex flex-col"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <header className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-mist shrink-0">
          <div className="text-base font-display font-semibold">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-muted hover:text-ink p-2 -mr-2"
          >
            <X size={18} />
          </button>
        </header>
        <div className="px-5 md:px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer ? (
          <div className="px-5 md:px-6 py-4 border-t border-mist bg-paper shrink-0">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
