"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, SignInResult, TwoFactorSetup, TwoFactorState } from "../lib/auth";
import {
  authenticate,
  beginTwoFactorEnrollment,
  cancelTwoFactorEnrollment,
  clearSession,
  createAccount,
  disableTwoFactor,
  enableTwoFactor,
  getSession,
  getTwoFactorState,
  seedDemoAdminIfMissing,
  setSession,
  updateAccount,
} from "../lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  twoFactorState: TwoFactorState | null;
  signIn: (input: { email: string; password: string; totpCode?: string }) => Promise<SignInResult>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  updateProfile: (input: { name: string }) => Promise<void>;
  changePassword: (input: { currentPassword: string; nextPassword: string; totpCode?: string }) => Promise<void>;
  beginTwoFactorSetup: () => Promise<TwoFactorSetup>;
  enableTwoFactor: (input: { code: string }) => Promise<void>;
  disableTwoFactor: (input: { code: string }) => Promise<void>;
  cancelTwoFactorSetup: () => void;
  signOut: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [twoFactorState, setTwoFactorState] = useState<TwoFactorState | null>(null);

  const syncTwoFactor = useCallback((email: string | null) => {
    if (!email) {
      setTwoFactorState(null);
      return;
    }
    try {
      setTwoFactorState(getTwoFactorState(email));
    } catch {
      setTwoFactorState(null);
    }
  }, []);

  const refresh = useCallback(() => {
    const session = getSession();
    setUser(session);
    setStatus(session ? "authenticated" : "unauthenticated");
    syncTwoFactor(session?.email ?? null);
  }, [syncTwoFactor]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await seedDemoAdminIfMissing();
      } catch {
        // ignore seeding errors in demo mode
      } finally {
        if (active) refresh();
      }
    })();
    return () => {
      active = false;
    };
  }, [refresh]);

  const signIn = useCallback(
    async ({ email, password, totpCode }: { email: string; password: string; totpCode?: string }) => {
      const result = await authenticate({ email, password, totpCode });
      if (result.status === "mfa_required") return result;

      setSession(result.user);
      setUser(result.user);
      setStatus("authenticated");
      syncTwoFactor(result.user.email);
      return result;
    },
    [syncTwoFactor],
  );

  const signUp = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const created = await createAccount({ name, email, password, role: "staff" });
      setSession(created);
      setUser(created);
      setStatus("authenticated");
      syncTwoFactor(created.email);
    },
    [syncTwoFactor],
  );

  const updateProfile = useCallback(
    async ({ name }: { name: string }) => {
      if (!user) throw new Error("Not signed in.");
      const nextName = name.trim();
      if (!nextName) throw new Error("Name is required.");

      await updateAccount(user.email, { name: nextName });
      const nextUser: AuthUser = { ...user, name: nextName };
      setSession(nextUser);
      setUser(nextUser);
      syncTwoFactor(nextUser.email);
    },
    [user, syncTwoFactor],
  );

  const changePassword = useCallback(
    async ({
      currentPassword,
      nextPassword,
      totpCode,
    }: {
      currentPassword: string;
      nextPassword: string;
      totpCode?: string;
    }) => {
      if (!user) throw new Error("Not signed in.");

      const authStep = await authenticate({
        email: user.email,
        password: currentPassword,
        totpCode: user.mfaEnabled ? totpCode : undefined,
      });
      if (authStep.status !== "authenticated") {
        throw new Error("Authenticator code is required to change your password.");
      }

      await updateAccount(user.email, { password: nextPassword });
    },
    [user],
  );

  const beginTwoFactorSetupFlow = useCallback(async () => {
    if (!user) throw new Error("Not signed in.");
    const setup = beginTwoFactorEnrollment(user.email);
    setTwoFactorState((prev) => ({ enabled: prev?.enabled ?? user.mfaEnabled, pendingSetup: setup }));
    return setup;
  }, [user]);

  const enableTwoFactorFlow = useCallback(
    async ({ code }: { code: string }) => {
      if (!user) throw new Error("Not signed in.");
      await enableTwoFactor(user.email, code);
      const nextUser: AuthUser = { ...user, mfaEnabled: true };
      setSession(nextUser);
      setUser(nextUser);
      syncTwoFactor(nextUser.email);
    },
    [user, syncTwoFactor],
  );

  const disableTwoFactorFlow = useCallback(
    async ({ code }: { code: string }) => {
      if (!user) throw new Error("Not signed in.");
      await disableTwoFactor(user.email, code);
      const nextUser: AuthUser = { ...user, mfaEnabled: false };
      setSession(nextUser);
      setUser(nextUser);
      syncTwoFactor(nextUser.email);
    },
    [user, syncTwoFactor],
  );

  const cancelTwoFactorSetupFlow = useCallback(() => {
    if (!user) return;
    cancelTwoFactorEnrollment(user.email);
    syncTwoFactor(user.email);
  }, [user, syncTwoFactor]);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    setStatus("unauthenticated");
    setTwoFactorState(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      twoFactorState,
      signIn,
      signUp,
      updateProfile,
      changePassword,
      beginTwoFactorSetup: beginTwoFactorSetupFlow,
      enableTwoFactor: enableTwoFactorFlow,
      disableTwoFactor: disableTwoFactorFlow,
      cancelTwoFactorSetup: cancelTwoFactorSetupFlow,
      signOut,
      refresh,
    }),
    [
      status,
      user,
      twoFactorState,
      signIn,
      signUp,
      updateProfile,
      changePassword,
      beginTwoFactorSetupFlow,
      enableTwoFactorFlow,
      disableTwoFactorFlow,
      cancelTwoFactorSetupFlow,
      signOut,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}

