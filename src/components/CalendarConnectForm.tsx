"use client";

import { useState } from "react";

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
    // Kick off a first sync silently
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
      <div className="rounded-2xl bg-white shadow-card p-6 space-y-3">
        <div className="text-sm font-medium">Apple Calendar connected</div>
        <div className="text-sm text-muted">
          Events will pull from iCloud on demand. Cadence writes new events to your primary calendar with
          a <code className="text-xs">CADENCE:</code> tag so they&apos;re easy to filter.
        </div>
        <button
          onClick={sync}
          disabled={loading}
          className="rounded-xl bg-ink text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Syncing…" : "Sync now"}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white shadow-card p-6 space-y-4">
      <div>
        <div className="text-sm font-medium">Connect Apple Calendar</div>
        <div className="text-xs text-muted mt-1">
          Generate an app-specific password at{" "}
          <a
            href="https://appleid.apple.com/account/manage"
            target="_blank"
            rel="noreferrer"
            className="text-cadence underline"
          >
            appleid.apple.com
          </a>{" "}
          → Sign-In and Security → App-Specific Passwords.
        </div>
      </div>

      <label className="block">
        <span className="text-sm text-muted">Apple ID email</span>
        <input
          required
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-xl border border-mist px-4 py-3 outline-none focus:border-cadence"
        />
      </label>

      <label className="block">
        <span className="text-sm text-muted">App-specific password</span>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="xxxx-xxxx-xxxx-xxxx"
          className="mt-1 w-full rounded-xl border border-mist px-4 py-3 outline-none focus:border-cadence font-mono"
        />
      </label>

      {error ? <div className="text-sm text-amber">{error}</div> : null}

      <button
        type="submit"
        disabled={loading || !username || !password}
        className="w-full rounded-xl bg-ink text-white py-3 font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Connecting…" : "Connect"}
      </button>
    </form>
  );
}
