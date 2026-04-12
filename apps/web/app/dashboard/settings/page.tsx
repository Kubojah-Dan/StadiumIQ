"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Copy,
  Database,
  Download,
  KeyRound,
  QrCode,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import type { TwoFactorState } from "../../../lib/auth";
import { useAuth } from "../../../components/auth-context";

type TabId = "account" | "notifications" | "security" | "privacy";

type Prefs = {
  surgeAlerts: boolean;
  queueAlerts: boolean;
  dailySummary: boolean;
};

function loadPrefs(email: string): Prefs {
  try {
    const raw = localStorage.getItem(`stadiumiq_prefs_${email.toLowerCase()}`);
    if (!raw) return { surgeAlerts: true, queueAlerts: true, dailySummary: false };
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      surgeAlerts: parsed.surgeAlerts ?? true,
      queueAlerts: parsed.queueAlerts ?? true,
      dailySummary: parsed.dailySummary ?? false,
    };
  } catch {
    return { surgeAlerts: true, queueAlerts: true, dailySummary: false };
  }
}

function savePrefs(email: string, prefs: Prefs) {
  localStorage.setItem(`stadiumiq_prefs_${email.toLowerCase()}`, JSON.stringify(prefs));
}

export default function DashboardSettingsPage() {
  const {
    user,
    twoFactorState,
    updateProfile,
    changePassword,
    beginTwoFactorSetup,
    enableTwoFactor,
    disableTwoFactor,
    cancelTwoFactorSetup,
    signOut,
  } = useAuth();

  const [tab, setTab] = useState<TabId>("account");
  const [toast, setToast] = useState<{ kind: "ok" | "err"; message: string } | null>(null);

  const tabs = useMemo(
    () => [
      { id: "account" as const, label: "Account Profile", icon: <User size={18} /> },
      { id: "notifications" as const, label: "Notifications", icon: <Bell size={18} /> },
      { id: "security" as const, label: "Security & Access", icon: <Shield size={18} /> },
      { id: "privacy" as const, label: "Data & Privacy", icon: <Database size={18} /> },
    ],
    [],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-300 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Command Center
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center">
            <Shield className="mr-3 h-7 w-7 text-slate-400" />
            System Settings
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">Configure your profile, alerts, and security policies.</p>
        </div>

        {toast && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              toast.kind === "ok"
                ? "border-green-500/30 bg-green-500/10 text-green-200"
                : "border-red-500/30 bg-red-500/10 text-red-200"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="hidden lg:block space-y-2">
          {tabs.map((t) => (
            <TabButton key={t.id} active={tab === t.id} icon={t.icon} label={t.label} onClick={() => setTab(t.id)} />
          ))}
        </div>

        <div className="lg:hidden glass-panel border border-white/10 rounded-2xl p-2 overflow-x-auto custom-scrollbar">
          <div className="flex gap-2 min-w-max">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition text-sm font-semibold ${
                  tab === t.id
                    ? "bg-primary/15 text-primary border-primary/25"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                <span className={`${tab === t.id ? "text-primary" : "text-slate-400"}`}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {tab === "account" && (
            <AccountPanel
              user={user}
              onSave={async (name) => {
                try {
                  await updateProfile({ name });
                  setToast({ kind: "ok", message: "Profile updated." });
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Failed to update profile.";
                  setToast({ kind: "err", message: msg });
                }
              }}
            />
          )}

          {tab === "notifications" && <NotificationsPanel email={user.email} onToast={(t) => setToast(t)} />}

          {tab === "security" && (
            <SecurityPanel
              user={user}
              twoFactorState={twoFactorState}
              onChangePassword={async (currentPassword, nextPassword, totpCode) => {
                try {
                  await changePassword({ currentPassword, nextPassword, totpCode });
                  setToast({ kind: "ok", message: "Password updated." });
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Failed to update password.";
                  setToast({ kind: "err", message: msg });
                }
              }}
              onBeginTwoFactor={async () => {
                try {
                  await beginTwoFactorSetup();
                  setToast({ kind: "ok", message: "Setup key generated. Verify code to enable 2FA." });
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Failed to begin 2FA setup.";
                  setToast({ kind: "err", message: msg });
                }
              }}
              onEnableTwoFactor={async (code) => {
                try {
                  await enableTwoFactor({ code });
                  setToast({ kind: "ok", message: "Two-factor authentication enabled." });
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Failed to enable 2FA.";
                  setToast({ kind: "err", message: msg });
                }
              }}
              onDisableTwoFactor={async (code) => {
                try {
                  await disableTwoFactor({ code });
                  setToast({ kind: "ok", message: "Two-factor authentication disabled." });
                } catch (e: unknown) {
                  const msg = e instanceof Error ? e.message : "Failed to disable 2FA.";
                  setToast({ kind: "err", message: msg });
                }
              }}
              onCancelTwoFactorSetup={() => {
                cancelTwoFactorSetup();
                setToast({ kind: "ok", message: "Pending 2FA setup cancelled." });
              }}
              onToast={(t) => setToast(t)}
            />
          )}

          {tab === "privacy" && (
            <PrivacyPanel
              email={user.email}
              onExport={() => exportLocalData(user.email)}
              onClearCache={() => {
                clearLocalCache(user.email);
                setToast({ kind: "ok", message: "Local cache cleared." });
              }}
              onSignOut={() => {
                signOut();
                window.location.href = "/";
              }}
            />
          )}

          <div className="glass-panel p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Danger Zone</h3>
            <p className="text-sm text-slate-400 mb-4">These actions reset local data for this browser only.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                className="bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-500/30 px-4 py-2.5 rounded-xl transition font-semibold text-sm"
                onClick={() => {
                  clearLocalCache(user.email);
                  signOut();
                  window.location.href = "/";
                }}
              >
                Purge local data + sign out
              </button>
              <button
                type="button"
                className="glass-panel border border-white/10 hover:bg-white/5 px-4 py-2.5 rounded-xl transition font-semibold text-sm text-slate-200"
                onClick={() => setToast({ kind: "ok", message: "No destructive server action in demo mode." })}
              >
                Purge server cache (demo)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
        active
          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(37,99,235,0.12)]"
          : "text-slate-300 hover:bg-white/5 border border-white/10"
      }`}
    >
      <span className={`mr-3 ${active ? "text-primary" : "text-slate-500"}`}>{icon}</span>
      {label}
    </button>
  );
}

function AccountPanel({
  user,
  onSave,
}: {
  user: { name: string; email: string };
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);

  useEffect(() => setName(user.name), [user.name]);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <User className="h-5 w-5 mr-2 text-slate-400" />
        Profile Information
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-1">Email Address</label>
          <input
            value={user.email}
            readOnly
            type="email"
            className="w-full bg-black/10 border border-white/10 rounded-xl py-2.5 px-3 text-slate-300 opacity-80"
          />
          <p className="mt-1.5 text-xs text-slate-500">Email is fixed in demo mode.</p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
        <button
          type="button"
          disabled={saving}
          className="bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground px-6 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.35)] font-semibold"
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(name);
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function NotificationsPanel({
  email,
  onToast,
}: {
  email: string;
  onToast: (t: { kind: "ok" | "err"; message: string }) => void;
}) {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs(email));

  useEffect(() => setPrefs(loadPrefs(email)), [email]);

  const toggle = (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      savePrefs(email, next);
      onToast({ kind: "ok", message: "Notification preferences saved." });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to save preferences.";
      onToast({ kind: "err", message: msg });
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Bell className="h-5 w-5 mr-2 text-slate-400" />
        Notifications
      </h3>

      <div className="space-y-4">
        <ToggleRow
          title="Surge alerts"
          desc="Receive high priority alerts when zones enter Warning/Critical."
          checked={prefs.surgeAlerts}
          onClick={() => toggle("surgeAlerts")}
        />
        <ToggleRow
          title="Queue alerts"
          desc="Get notified when estimated wait times spike."
          checked={prefs.queueAlerts}
          onClick={() => toggle("queueAlerts")}
        />
        <ToggleRow
          title="Daily summary"
          desc="A daily operational summary email (demo)."
          checked={prefs.dailySummary}
          onClick={() => toggle("dailySummary")}
        />
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  checked,
  onClick,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 transition text-left"
    >
      <div>
        <div className="text-white font-semibold">{title}</div>
        <div className="text-xs text-slate-400 mt-1">{desc}</div>
      </div>
      <div
        className={`h-7 w-12 rounded-full border transition flex items-center px-1 ${
          checked ? "bg-primary/25 border-primary/30 justify-end" : "bg-black/20 border-white/10 justify-start"
        }`}
        aria-hidden
      >
        <div className={`h-5 w-5 rounded-full ${checked ? "bg-primary" : "bg-slate-500"} shadow`} />
      </div>
    </button>
  );
}

function SecurityPanel({
  user,
  twoFactorState,
  onChangePassword,
  onBeginTwoFactor,
  onEnableTwoFactor,
  onDisableTwoFactor,
  onCancelTwoFactorSetup,
  onToast,
}: {
  user: { email: string; mfaEnabled: boolean };
  twoFactorState: TwoFactorState | null;
  onChangePassword: (currentPassword: string, nextPassword: string, totpCode?: string) => Promise<void>;
  onBeginTwoFactor: () => Promise<void>;
  onEnableTwoFactor: (code: string) => Promise<void>;
  onDisableTwoFactor: (code: string) => Promise<void>;
  onCancelTwoFactorSetup: () => void;
  onToast: (t: { kind: "ok" | "err"; message: string }) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordTotp, setPasswordTotp] = useState("");
  const [enableCode, setEnableCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const pendingSetup = twoFactorState?.pendingSetup ?? null;
  const twoFactorEnabled = twoFactorState?.enabled ?? user.mfaEnabled;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <KeyRound className="h-5 w-5 mr-2 text-slate-400" />
          Password Policy
        </h3>

        {localError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
            {localError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-300 mb-1">Current password</label>
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">New password</label>
            <input
              value={nextPassword}
              onChange={(e) => setNextPassword(e.target.value)}
              type="password"
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">Confirm new password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
            />
          </div>
          {twoFactorEnabled && (
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-1">Authenticator code</label>
              <input
                value={passwordTotp}
                onChange={(e) => setPasswordTotp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                inputMode="numeric"
                placeholder="Required because 2FA is enabled"
                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium tracking-[0.2em]"
              />
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Password rule: 10+ chars including uppercase, lowercase, and number.
          </p>
          <button
            type="button"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground px-6 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.35)] font-semibold"
            onClick={async () => {
              setLocalError(null);
              if (nextPassword !== confirm) {
                setLocalError("New password and confirmation do not match.");
                return;
              }
              setSaving(true);
              try {
                await onChangePassword(currentPassword, nextPassword, passwordTotp);
                setCurrentPassword("");
                setNextPassword("");
                setConfirm("");
                setPasswordTotp("");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-slate-400" />
          Two-Factor Authentication
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Secure your account with an authenticator app. You can copy your setup key or scan a QR code.
        </p>

        {twoFactorEnabled ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-4">
              <div className="text-blue-100 font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Authenticator protection is active.
              </div>
              <p className="text-xs text-blue-200/80 mt-1">
                Enter a valid authenticator code to disable 2FA.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1">Authenticator code to disable</label>
                <input
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="123456"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium tracking-[0.2em]"
                />
              </div>
              <button
                type="button"
                className="h-[42px] px-5 rounded-xl border border-white/20 hover:bg-white/5 transition text-sm font-semibold text-white"
                onClick={() => void onDisableTwoFactor(disableCode)}
              >
                Disable 2FA
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!pendingSetup && (
              <button
                type="button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl transition shadow-[0_0_15px_rgba(37,99,235,0.35)] font-semibold text-sm"
                onClick={() => void onBeginTwoFactor()}
              >
                Generate 2FA setup key
              </button>
            )}

            {pendingSetup && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white mb-2">Manual setup key</div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <code className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-blue-200 break-all">
                      {pendingSetup.formattedSecret}
                    </code>
                    <button
                      type="button"
                      className="h-10 px-4 rounded-xl border border-white/20 hover:bg-white/5 transition text-sm font-semibold text-white inline-flex items-center justify-center"
                      onClick={async () => {
                        const copied = await copyToClipboard(pendingSetup.secret);
                        if (copied) onToast({ kind: "ok", message: "Setup key copied." });
                        else onToast({ kind: "err", message: "Could not copy key. Copy manually." });
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy key
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Expires at {new Date(pendingSetup.expiresAt).toLocaleString()}.</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-semibold text-white mb-2 flex items-center">
                    <QrCode className="h-4 w-4 mr-2 text-slate-300" />
                    Scan QR code
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pendingSetup.qrCodeUrl}
                      alt="2FA setup QR code"
                      className="w-[180px] h-[180px] rounded-xl border border-white/10 bg-white p-2"
                    />
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                      Scan with Google Authenticator, Microsoft Authenticator, 1Password, or Authy.
                      QR rendering uses Google Chart API in demo mode; use manual key entry for stricter environments.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-1">Authenticator code</label>
                    <input
                      value={enableCode}
                      onChange={(e) => setEnableCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                      inputMode="numeric"
                      placeholder="123456"
                      className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium tracking-[0.2em]"
                    />
                  </div>
                  <button
                    type="button"
                    className="h-[42px] px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition text-sm font-semibold"
                    onClick={() => void onEnableTwoFactor(enableCode)}
                  >
                    Enable 2FA
                  </button>
                  <button
                    type="button"
                    className="h-[42px] px-4 rounded-xl border border-white/20 hover:bg-white/5 transition text-sm font-semibold text-slate-200"
                    onClick={onCancelTwoFactorSetup}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PrivacyPanel({
  email,
  onExport,
  onClearCache,
  onSignOut,
}: {
  email: string;
  onExport: () => void;
  onClearCache: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Database className="h-5 w-5 mr-2 text-slate-400" />
        Data & Privacy
      </h3>

      <div className="space-y-3">
        <ActionRow
          title="Export my local data"
          desc="Download your demo preferences and session data as JSON."
          icon={<Download className="h-4 w-4 text-slate-300" />}
          onClick={onExport}
        />
        <ActionRow
          title="Clear local cache"
          desc="Clears cached prefs and selected stadium for this browser."
          icon={<Database className="h-4 w-4 text-slate-300" />}
          onClick={onClearCache}
        />
        <ActionRow
          title="Sign out"
          desc={`Ends your session for ${email}.`}
          icon={<Shield className="h-4 w-4 text-slate-300" />}
          onClick={onSignOut}
        />
      </div>
    </div>
  );
}

function ActionRow({
  title,
  desc,
  icon,
  onClick,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 transition text-left flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl border border-white/10 bg-black/20 flex items-center justify-center mt-0.5">{icon}</div>
      <div>
        <div className="text-white font-semibold">{title}</div>
        <div className="text-xs text-slate-400 mt-1">{desc}</div>
      </div>
    </button>
  );
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = value;
      el.setAttribute("readonly", "true");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(el);
      return copied;
    } catch {
      return false;
    }
  }
}

function exportLocalData(email: string) {
  const keys = [
    "stadiumiq_user",
    "stadiumiq_users",
    `stadiumiq_prefs_${email.toLowerCase()}`,
    "stadiumiq_stadium_id",
    `stadiumiq_2fa_pending_${email.toLowerCase()}`,
  ];
  const out: Record<string, string | null> = {};
  for (const k of keys) {
    try {
      out[k] = localStorage.getItem(k);
    } catch {
      out[k] = null;
    }
  }
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "stadiumiq-export.json";
  a.click();
  URL.revokeObjectURL(url);
}

function clearLocalCache(email: string) {
  const keys = [
    `stadiumiq_prefs_${email.toLowerCase()}`,
    "stadiumiq_stadium_id",
    `stadiumiq_2fa_pending_${email.toLowerCase()}`,
  ];
  for (const k of keys) localStorage.removeItem(k);
}
