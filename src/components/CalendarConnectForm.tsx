"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";

export function CalendarConnectForm({ connected }: { connected: boolean }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(connected);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/calendar/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Connection failed");
      return;
    }
    setOk(true);
    fetch("/api/calendar/sync", { method: "POST" });
  }

  async function sync() {
    setLoading(true);
    await fetch("/api/calendar/sync", { method: "POST" });
    setLoading(false);
    window.location.reload();
  }

  if (ok) {
    return (
      <div className="rounded-2xl bg-white shadow-card p-5 md:p-6 space-y-3">
        <div className="flex items-center gap-2 text-sage">
          <CheckCircle2 size={18} />
          <div className="text-sm font-medium text-ink">Apple Calendar connected</div>
        </div>
        <div className="text-sm text-muted">
          Events pull from iCloud when you sync. New tasks with a time get written back to your calendar automatically.
        </div>
        <button
          onClick={sync}
          disabled={loading}
          className="rounded-xl bg-ink text-white px-4 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition active:scale-[0.98]"
        >
          {loading ? "Syncing…" : "Sync now"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-card p-5 md:p-6 space-y-5">
      <div>
        <div className="text-base font-display font-semibold">Connect Apple Calendar</div>
        <div className="text-sm text-muted mt-1">
          Two-minute setup. Once connected, your iCloud events appear on Today and new tasks you schedule get saved to your calendar.
        </div>
      </div>

      <ol className="space-y-3 text-sm">
        <Step n={1}>
          Open{" "}
          <a
            href="https://appleid.apple.com/account/manage"
            target="_blank"
            rel="noreferrer"
            className="text-cadence underline inline-flex items-center gap-1"
          >
            appleid.apple.com <ExternalLink size={12} />
          </a>{" "}
          and sign in with the Apple ID your calendar lives on.
        </Step>
        <Step n={2}>
          Click <b>Sign-In and Security</b> → <b>App-Specific Passwords</b>.
        </Step>
        <Step n={3}>
          Generate a new password labeled <span className="font-mono text-ink">Cadence</span>. Apple shows it once — copy it.
        </Step>
        <Step n={4}>Paste your Apple ID email and the password below.</Step>
      </ol>

      <form onSubmit={submit} className="space-y-3 pt-2 border-t border-mist">
        <label className="block">
          <span className="text-sm text-muted">Apple ID email</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you@icloud.com"
            className="mt-1 w-full rounded-xl border border-mist px-4 py-3 outline-none focus:border-cadence transition"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted">App-specific password</span>
          <input
            required
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="xxxx-xxxx-xxxx-xxxx"
            className="mt-1 w-full rounded-xl border border-mist px-4 py-3 outline-none focus:border-cadence font-mono transition"
          />
        </label>
        {error ? (
          <div className="rounded-lg bg-amber/10 border border-amber/30 text-amber text-sm px-3 py-2">
            {error}
          </div>
        ) : null}
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full rounded-xl bg-ink text-white py-3 font-medium hover:opacity-90 disabled:opacity-50 transition active:scale-[0.98]"
        >
          {loading ? "Connecting…" : "Connect"}
        </button>
      </form>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="h-6 w-6 shrink-0 rounded-full bg-paper border border-mist text-muted text-xs font-medium flex items-center justify-center">
        {n}
      </span>
      <span className="text-ink">{children}</span>
    </li>
  );
}
