import {
  buildGoogleQrUrl,
  buildOtpAuthUrl,
  formatTotpSecret,
  generateTotpSecret,
  verifyTotpCode,
} from "./totp";

export type AuthRole = "admin" | "staff" | "security" | "fan";

export type AuthUser = {
  name: string;
  email: string;
  role: AuthRole;
  mfaEnabled: boolean;
};

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "WEAK_PASSWORD"
  | "MFA_REQUIRED"
  | "INVALID_MFA_CODE"
  | "ACCOUNT_EXISTS"
  | "ACCOUNT_NOT_FOUND"
  | "INVALID_INPUT";

export class AuthError extends Error {
  code: AuthErrorCode;
  retryAfterSeconds?: number;

  constructor(code: AuthErrorCode, message: string, retryAfterSeconds?: number) {
    super(message);
    this.code = code;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

type PasswordHash = {
  algorithm: "pbkdf2-sha256";
  iterations: number;
  salt: string;
  hash: string;
};

type TwoFactorRecord = {
  enabled: boolean;
  secret: string;
  createdAt: string;
  issuer: string;
};

type PendingTwoFactorRecord = {
  secret: string;
  issuer: string;
  accountName: string;
  otpauthUrl: string;
  createdAt: string;
  expiresAt: string;
};

type UserRecord = {
  name: string;
  email: string;
  role: AuthRole;
  createdAt: string;
  passwordHash?: PasswordHash;
  password?: string; // legacy support only
  mfa?: TwoFactorRecord;
  failedSignInCount?: number;
  lockoutUntil?: string;
};

type SessionStoragePayload = {
  user: AuthUser;
  exp: number;
};

export type SessionCookiePayload = {
  email: string;
  exp: number;
};

export type TwoFactorSetup = {
  secret: string;
  formattedSecret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
  issuer: string;
  accountName: string;
  expiresAt: string;
};

export type TwoFactorState = {
  enabled: boolean;
  pendingSetup: TwoFactorSetup | null;
};

export type SignInResult =
  | { status: "authenticated"; user: AuthUser }
  | { status: "mfa_required"; message: string };

export const AUTH_COOKIE_NAME = "stadiumiq_auth";
const USER_KEY = "stadiumiq_user";
const USERS_KEY = "stadiumiq_users";
const PENDING_2FA_PREFIX = "stadiumiq_2fa_pending_";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const PASSWORD_MIN_LENGTH = 10;
const PBKDF2_ITERATIONS = 120000;
const FAILED_ATTEMPT_LIMIT = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const TWO_FACTOR_PENDING_MINUTES = 10;
const TWO_FACTOR_ISSUER = "StadiumIQ";

export const DEMO_ADMIN = {
  name: "StadiumIQ Admin",
  email: "admin@stadiumiq.demo",
  role: "admin" as const,
  password: "Admin@12345",
};

function getWebCrypto(): Crypto {
  if (typeof crypto !== "undefined" && crypto.subtle) return crypto;
  throw new Error("Web Crypto is unavailable in this runtime.");
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += String.fromCharCode(bytes[i]);
  }
  return btoa(out);
}

function base64ToBytes(input: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(input, "base64"));
  }
  const decoded = atob(input);
  const out = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i += 1) out[i] = decoded.charCodeAt(i);
  return out;
}

function normalizeEmail(emailInput: string): string {
  return emailInput.trim().toLowerCase();
}

function normalizeName(nameInput: string): string {
  return nameInput.trim().replace(/\s+/g, " ");
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? match[1] : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Strict${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
}

function encodeSessionCookie(payload: SessionCookiePayload): string {
  return encodeURIComponent(JSON.stringify(payload));
}

export function decodeSessionCookie(value: string): SessionCookiePayload | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<SessionCookiePayload>;
    if (!parsed || typeof parsed.email !== "string" || typeof parsed.exp !== "number") return null;
    return { email: normalizeEmail(parsed.email), exp: parsed.exp };
  } catch {
    return null;
  }
}

function toAuthUser(record: UserRecord): AuthUser {
  return {
    name: record.name,
    email: record.email,
    role: record.role,
    mfaEnabled: Boolean(record.mfa?.enabled),
  };
}

function setPendingTwoFactor(email: string, pending: PendingTwoFactorRecord) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PENDING_2FA_PREFIX}${normalizeEmail(email)}`, JSON.stringify(pending));
}

function getPendingTwoFactor(email: string): PendingTwoFactorRecord | null {
  if (typeof window === "undefined") return null;
  const key = `${PENDING_2FA_PREFIX}${normalizeEmail(email)}`;
  const pending = safeJsonParse<PendingTwoFactorRecord>(localStorage.getItem(key));
  if (!pending) return null;
  const expiresAt = Date.parse(pending.expiresAt);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
    localStorage.removeItem(key);
    return null;
  }
  return pending;
}

function clearPendingTwoFactor(email: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${PENDING_2FA_PREFIX}${normalizeEmail(email)}`);
}

function getRecordIndex(users: UserRecord[], email: string): number {
  return users.findIndex((u) => normalizeEmail(u.email) === normalizeEmail(email));
}

async function hashPassword(password: string, saltBytes: Uint8Array, iterations = PBKDF2_ITERATIONS): Promise<string> {
  const cryptoApi = getWebCrypto();
  const normalizedSalt = new Uint8Array(saltBytes).buffer;
  const key = await cryptoApi.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await cryptoApi.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: normalizedSalt, iterations },
    key,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

async function createPasswordHash(password: string): Promise<PasswordHash> {
  const saltBytes = new Uint8Array(16);
  getWebCrypto().getRandomValues(saltBytes);
  return {
    algorithm: "pbkdf2-sha256",
    iterations: PBKDF2_ITERATIONS,
    salt: bytesToBase64(saltBytes),
    hash: await hashPassword(password, saltBytes, PBKDF2_ITERATIONS),
  };
}

async function verifyPasswordHash(password: string, passwordHash: PasswordHash): Promise<boolean> {
  const candidate = await hashPassword(password, base64ToBytes(passwordHash.salt), passwordHash.iterations);
  return candidate === passwordHash.hash;
}

function validatePasswordPolicy(password: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AuthError("WEAK_PASSWORD", `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new AuthError(
      "WEAK_PASSWORD",
      "Password must include at least one uppercase letter, one lowercase letter, and one number.",
    );
  }
}

function sanitizeUsers(users: UserRecord[]): UserRecord[] {
  return users.map((u) => ({
    ...u,
    email: normalizeEmail(u.email),
    name: normalizeName(u.name),
  }));
}

function isLocked(record: UserRecord): { locked: boolean; retryAfterSeconds?: number } {
  if (!record.lockoutUntil) return { locked: false };
  const lockoutTs = Date.parse(record.lockoutUntil);
  if (Number.isNaN(lockoutTs)) return { locked: false };
  const remainingMs = lockoutTs - Date.now();
  if (remainingMs <= 0) return { locked: false };
  return { locked: true, retryAfterSeconds: Math.ceil(remainingMs / 1000) };
}

function registerFailedSignIn(record: UserRecord): UserRecord {
  const nextFailedCount = (record.failedSignInCount ?? 0) + 1;
  if (nextFailedCount >= FAILED_ATTEMPT_LIMIT) {
    return {
      ...record,
      failedSignInCount: 0,
      lockoutUntil: new Date(Date.now() + LOCKOUT_MS).toISOString(),
    };
  }
  return { ...record, failedSignInCount: nextFailedCount };
}

function clearSignInFailures(record: UserRecord): UserRecord {
  const { failedSignInCount, lockoutUntil, ...rest } = record;
  if (failedSignInCount === undefined && lockoutUntil === undefined) return record;
  return { ...rest };
}

export function getUserRecords(): UserRecord[] {
  if (typeof window === "undefined") return [];
  const parsed = safeJsonParse<UserRecord[]>(localStorage.getItem(USERS_KEY));
  return Array.isArray(parsed) ? sanitizeUsers(parsed) : [];
}

export function setUserRecords(users: UserRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(sanitizeUsers(users)));
}

function userFromEmail(email: string): AuthUser | null {
  const users = getUserRecords();
  const record = users.find((u) => normalizeEmail(u.email) === normalizeEmail(email));
  return record ? toAuthUser(record) : null;
}

export async function seedDemoAdminIfMissing() {
  const users = getUserRecords();
  if (users.some((u) => normalizeEmail(u.email) === normalizeEmail(DEMO_ADMIN.email))) return;

  const passwordHash = await createPasswordHash(DEMO_ADMIN.password);
  const admin: UserRecord = {
    name: DEMO_ADMIN.name,
    email: normalizeEmail(DEMO_ADMIN.email),
    role: DEMO_ADMIN.role,
    createdAt: new Date().toISOString(),
    passwordHash,
  };
  setUserRecords([admin, ...users]);
}

export async function createAccount(input: {
  name: string;
  email: string;
  password: string;
  role?: AuthRole;
}): Promise<AuthUser> {
  const name = normalizeName(input.name);
  const email = normalizeEmail(input.email);
  const password = input.password;
  const role: AuthRole = input.role ?? "staff";

  if (!name) throw new AuthError("INVALID_INPUT", "Name is required.");
  if (!email) throw new AuthError("INVALID_INPUT", "Email is required.");
  validatePasswordPolicy(password);

  const users = getUserRecords();
  if (users.some((u) => normalizeEmail(u.email) === email)) {
    throw new AuthError("ACCOUNT_EXISTS", "An account with that email already exists.");
  }

  const passwordHash = await createPasswordHash(password);
  const record: UserRecord = {
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
    passwordHash,
  };

  setUserRecords([record, ...users]);
  return toAuthUser(record);
}

export async function authenticate(input: {
  email: string;
  password: string;
  totpCode?: string;
}): Promise<SignInResult> {
  const email = normalizeEmail(input.email);
  const password = input.password;
  const totpCode = input.totpCode?.trim();

  if (!email || !password) throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password.");

  const users = getUserRecords();
  const idx = getRecordIndex(users, email);
  if (idx < 0) throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password.");

  let record = users[idx];

  const lockState = isLocked(record);
  if (lockState.locked) {
    throw new AuthError(
      "ACCOUNT_LOCKED",
      "Too many failed attempts. Please wait and try again.",
      lockState.retryAfterSeconds,
    );
  }

  let passwordOk = false;
  let migrated = false;

  if (record.passwordHash) {
    passwordOk = await verifyPasswordHash(password, record.passwordHash);
  } else if (typeof record.password === "string") {
    passwordOk = password === record.password;
    if (passwordOk) {
      record = {
        ...record,
        passwordHash: await createPasswordHash(password),
        password: undefined,
      };
      migrated = true;
    }
  }

  if (!passwordOk) {
    users[idx] = registerFailedSignIn(record);
    setUserRecords(users);
    throw new AuthError("INVALID_CREDENTIALS", "Invalid email or password.");
  }

  record = clearSignInFailures(record);

  const mfaEnabled = Boolean(record.mfa?.enabled && record.mfa.secret);
  if (mfaEnabled && !totpCode) {
    users[idx] = record;
    if (migrated) setUserRecords(users);
    return { status: "mfa_required", message: "Authenticator code required." };
  }

  if (mfaEnabled && totpCode) {
    const valid = await verifyTotpCode(record.mfa!.secret, totpCode, { driftWindows: 1 });
    if (!valid) {
      throw new AuthError("INVALID_MFA_CODE", "Invalid authenticator code.");
    }
  }

  users[idx] = record;
  setUserRecords(users);

  return { status: "authenticated", user: toAuthUser(record) };
}

export async function updateAccount(
  emailInput: string,
  updates: Partial<Pick<UserRecord, "name">> & { password?: string },
) {
  const email = normalizeEmail(emailInput);
  const users = getUserRecords();
  const idx = getRecordIndex(users, email);
  if (idx < 0) throw new AuthError("ACCOUNT_NOT_FOUND", "Account not found.");

  const current = users[idx];
  const next: UserRecord = { ...current };

  if (updates.name !== undefined) {
    const nextName = normalizeName(updates.name);
    if (!nextName) throw new AuthError("INVALID_INPUT", "Name is required.");
    next.name = nextName;
  }

  if (updates.password !== undefined) {
    validatePasswordPolicy(updates.password);
    next.passwordHash = await createPasswordHash(updates.password);
    next.password = undefined;
  }

  users[idx] = next;
  setUserRecords(users);
}

export function getTwoFactorState(emailInput: string): TwoFactorState {
  const email = normalizeEmail(emailInput);
  const users = getUserRecords();
  const record = users.find((u) => normalizeEmail(u.email) === email);
  if (!record) throw new AuthError("ACCOUNT_NOT_FOUND", "Account not found.");

  const pending = getPendingTwoFactor(email);
  const pendingSetup: TwoFactorSetup | null = pending
    ? {
        secret: pending.secret,
        formattedSecret: formatTotpSecret(pending.secret),
        otpauthUrl: pending.otpauthUrl,
        qrCodeUrl: buildGoogleQrUrl(pending.otpauthUrl),
        issuer: pending.issuer,
        accountName: pending.accountName,
        expiresAt: pending.expiresAt,
      }
    : null;

  return {
    enabled: Boolean(record.mfa?.enabled && record.mfa.secret),
    pendingSetup,
  };
}

export function beginTwoFactorEnrollment(emailInput: string): TwoFactorSetup {
  const email = normalizeEmail(emailInput);
  const users = getUserRecords();
  const record = users.find((u) => normalizeEmail(u.email) === email);
  if (!record) throw new AuthError("ACCOUNT_NOT_FOUND", "Account not found.");

  const secret = generateTotpSecret();
  const otpauthUrl = buildOtpAuthUrl({
    issuer: TWO_FACTOR_ISSUER,
    accountName: email,
    secret,
  });
  const expiresAt = new Date(Date.now() + TWO_FACTOR_PENDING_MINUTES * 60 * 1000).toISOString();

  setPendingTwoFactor(email, {
    secret,
    issuer: TWO_FACTOR_ISSUER,
    accountName: email,
    otpauthUrl,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  return {
    secret,
    formattedSecret: formatTotpSecret(secret),
    otpauthUrl,
    qrCodeUrl: buildGoogleQrUrl(otpauthUrl),
    issuer: TWO_FACTOR_ISSUER,
    accountName: email,
    expiresAt,
  };
}

export async function enableTwoFactor(emailInput: string, code: string) {
  const email = normalizeEmail(emailInput);
  const pending = getPendingTwoFactor(email);
  if (!pending) {
    throw new AuthError("INVALID_INPUT", "2FA setup expired. Please generate a new setup key.");
  }

  const valid = await verifyTotpCode(pending.secret, code.trim(), { driftWindows: 1 });
  if (!valid) throw new AuthError("INVALID_MFA_CODE", "Invalid authenticator code.");

  const users = getUserRecords();
  const idx = getRecordIndex(users, email);
  if (idx < 0) throw new AuthError("ACCOUNT_NOT_FOUND", "Account not found.");

  users[idx] = {
    ...users[idx],
    mfa: {
      enabled: true,
      secret: pending.secret,
      issuer: pending.issuer,
      createdAt: new Date().toISOString(),
    },
  };
  setUserRecords(users);
  clearPendingTwoFactor(email);
}

export async function disableTwoFactor(emailInput: string, code: string) {
  const email = normalizeEmail(emailInput);
  const users = getUserRecords();
  const idx = getRecordIndex(users, email);
  if (idx < 0) throw new AuthError("ACCOUNT_NOT_FOUND", "Account not found.");

  const record = users[idx];
  if (!record.mfa?.enabled || !record.mfa.secret) {
    throw new AuthError("INVALID_INPUT", "2FA is not enabled.");
  }

  const valid = await verifyTotpCode(record.mfa.secret, code.trim(), { driftWindows: 1 });
  if (!valid) throw new AuthError("INVALID_MFA_CODE", "Invalid authenticator code.");

  const sanitizedRecord = { ...record };
  delete sanitizedRecord.mfa;
  users[idx] = sanitizedRecord;
  setUserRecords(users);
  clearPendingTwoFactor(email);
}

export function cancelTwoFactorEnrollment(emailInput: string) {
  clearPendingTwoFactor(emailInput);
}

export function setSession(user: AuthUser) {
  if (typeof window === "undefined") return;
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const storagePayload: SessionStoragePayload = { user, exp };
  localStorage.setItem(USER_KEY, JSON.stringify(storagePayload));
  setCookie(
    AUTH_COOKIE_NAME,
    encodeSessionCookie({
      email: normalizeEmail(user.email),
      exp,
    }),
    SESSION_TTL_SECONDS,
  );
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
  deleteCookie(AUTH_COOKIE_NAME);
}

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const cookieValue = getCookieValue(AUTH_COOKIE_NAME);
  const cookiePayload = cookieValue ? decodeSessionCookie(cookieValue) : null;
  if (!cookiePayload || cookiePayload.exp <= Date.now()) {
    clearSession();
    return null;
  }

  const stored = safeJsonParse<SessionStoragePayload>(localStorage.getItem(USER_KEY));
  if (stored?.user && typeof stored.exp === "number" && stored.exp > Date.now()) {
    return stored.user;
  }

  const user = userFromEmail(cookiePayload.email);
  if (user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        user,
        exp: cookiePayload.exp,
      } satisfies SessionStoragePayload),
    );
  }
  return user;
}
