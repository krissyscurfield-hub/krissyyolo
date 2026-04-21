"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setStep("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/today");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="text-3xl font-display font-semibold tracking-tight">Cadence</div>
          <div className="text-muted text-sm mt-1">Your day, planned.</div>
        </div>

        {step === "email" ? (
          <form onSubmit={sendCode} className="rounded-2xl bg-white shadow-card p-6 space-y-4">
            <label className="block">
              <span className="text-sm text-muted">Email</span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-mist px-4 py-3 outline-none focus:border-cadence transition"
              />
            </label>
            {error ? <div className="text-sm text-amber">{error}</div> : null}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-xl bg-ink text-white py-3 font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Sending…" : "Send login code"}
            </button>
            <p className="text-xs text-muted text-center">
              We email you a 6-digit code. No password, no link.
            </p>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="rounded-2xl bg-white shadow-card p-6 space-y-4">
            <div>
              <div className="text-sm font-medium">Enter your code</div>
              <div className="text-xs text-muted mt-1">
                We sent a 6-digit code to <span className="text-ink">{email}</span>. It arrives in under 30 seconds.
              </div>
            </div>
            <label className="block">
              <span className="text-sm text-muted">Code</span>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="one-time-code"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="mt-1 w-full rounded-xl border border-mist px-4 py-3 outline-none focus:border-cadence transition text-center text-2xl font-mono tracking-[0.4em]"
              />
            </label>
            {error ? <div className="text-sm text-amber">{error}</div> : null}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl bg-ink text-white py-3 font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Verifying…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="w-full text-xs text-muted hover:text-ink transition"
            >
              ← Use a different email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
