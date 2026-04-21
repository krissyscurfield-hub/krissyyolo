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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 rounded-3xl bg-white shadow-card overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-mist">
          <div className="text-base font-display font-semibold">{title}</div>
          <button onClick={onClose} className="text-muted hover:text-ink">
            <X size={18} />
          </button>
        </header>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="px-6 py-4 border-t border-mist bg-paper">{footer}</div> : null}
      </div>
    </div>
  );
}
