"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Shield } from "lucide-react";
import { BrandMark } from "../../components/BrandMark";
import { useAuth } from "../../components/auth-context";
import { DEMO_ADMIN } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { status, signIn } = useAuth();

  const [nextPath, setNextPath] = useState("/dashboard");

  const [email, setEmail] = useState(DEMO_ADMIN.email);
  const [password, setPassword] = useState(DEMO_ADMIN.password);
  const [totpCode, setTotpCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  useEffect(() => {
    try {
      const query = new URLSearchParams(window.location.search);
      const next = query.get("next");
      if (next && next.startsWith("/")) setNextPath(next);
    } catch {
      setNextPath("/dashboard");
    }
  }, []);

  const resetMfaState = () => {
    setMfaRequired(false);
    setTotpCode("");
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await signIn({
        email,
        password,
        totpCode: mfaRequired ? totpCode : undefined,
      });
      if (result.status === "mfa_required") {
        setMfaRequired(true);
        setError(result.message);
        return;
      }
      router.push(nextPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/40">
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between">
        <BrandMark href="/" />
        <div className="text-sm text-slate-300">
          New here?{" "}
          <Link href="/signup" className="text-primary hover:underline font-semibold">
            Create an account
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md glass-panel border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign in</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Access the Command Center, live venue map, incidents, analytics, and settings.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 transition">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (mfaRequired) resetMfaState();
                  }}
                  type="email"
                  autoComplete="email"
                  placeholder="staff@stadiumiq.demo"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 transition">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (mfaRequired) resetMfaState();
                  }}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            {mfaRequired && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Authenticator code</label>
                <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 transition">
                  <Shield className="h-4 w-4 text-primary" />
                  <input
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-500 tracking-[0.2em]"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  2FA is enabled on this account. Enter the 6-digit code from your authenticator app.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-xl transition shadow-[0_0_18px_rgba(37,99,235,0.35)] flex items-center justify-center"
            >
              {submitting ? "Signing in…" : mfaRequired ? "Verify and sign in" : "Sign in"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-xs text-slate-400">
            Demo admin: <span className="text-slate-200 font-semibold">{DEMO_ADMIN.email}</span> /{" "}
            <span className="text-slate-200 font-semibold">{DEMO_ADMIN.password}</span>
          </div>
        </div>
      </main>
    </div>
  );
}
