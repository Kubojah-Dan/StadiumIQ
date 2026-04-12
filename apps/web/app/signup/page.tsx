"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { BrandMark } from "../../components/BrandMark";
import { useAuth } from "../../components/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { status, signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ name, email, password });
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign up failed.";
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
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md glass-panel border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Sign up to access StadiumIQ dashboards and manage your settings.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Full name</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 transition">
                <User className="h-4 w-4 text-slate-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder="Venue Operator"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/40 transition">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@venue.com"
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
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 10 chars, mixed case + number"
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-600"
                />
              </div>
              <p className="text-[11px] text-slate-500 -mt-2">
                Use 10+ characters with uppercase, lowercase, and a number.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3 rounded-xl transition shadow-[0_0_18px_rgba(37,99,235,0.35)] flex items-center justify-center"
            >
              {submitting ? "Creating account…" : "Create account"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-400">
            By continuing you agree to the platform’s acceptable use policy (demo).
          </div>
        </div>
      </main>
    </div>
  );
}
