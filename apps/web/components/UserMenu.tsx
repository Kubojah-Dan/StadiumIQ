"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

function initials(nameOrEmail: string) {
  const parts = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  const one = parts[0] ?? nameOrEmail;
  return one.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const label = useMemo(() => {
    if (!user) return "User";
    return user.name || user.email;
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-10 px-2.5 rounded-full bg-secondary border border-white/20 flex items-center justify-center hover:bg-white/5 transition"
        aria-label="User menu"
      >
        <span className="text-sm font-semibold">{initials(label)}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.6rem)] w-56 rounded-2xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl shadow-2xl overflow-hidden z-50">
          <div className="p-4 border-b border-white/10">
            <div className="text-sm font-semibold text-white truncate">{user?.name ?? "Signed in"}</div>
            <div className="text-[11px] text-slate-400 truncate">{user?.email ?? ""}</div>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition text-sm text-slate-200"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4 text-slate-300" />
              Settings
            </Link>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition text-sm text-slate-200"
              onClick={() => {
                setOpen(false);
                signOut();
                router.push("/");
              }}
            >
              <LogOut className="h-4 w-4 text-slate-300" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

