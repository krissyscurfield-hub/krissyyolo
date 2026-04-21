"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-3xl font-display font-semibold tracking-tight">Cadence</div>
          <div className="text-muted text-sm mt-1">Your day, planned.</div>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-white shadow-card p-6 text-center">
            <div className="text-base font-medium">Check your email</div>
            <div className="text-sm text-muted mt-2">
              We sent a magic link to <span className="text-ink">{email}</span>.
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="rounded-2xl bg-white shadow-card p-6 space-y-4">
            <label className="block">
              <span className="text-sm text-muted">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@apple.com"
                className="mt-1 w-full rounded-xl border border-mist px-4 py-3 outline-none focus:border-cadence transition"
              />
            </label>
            {error ? <div className="text-sm text-amber">{error}</div> : null}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-xl bg-ink text-white py-3 font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Sending…" : "Send magic link"}
            </button>
            <p className="text-xs text-muted text-center">
              No password. We email you a one-tap sign-in link.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
