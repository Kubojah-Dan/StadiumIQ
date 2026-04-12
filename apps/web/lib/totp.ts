const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_DIGITS = 6;
const TOTP_PERIOD_SECONDS = 30;

function getWebCrypto(): Crypto {
  if (typeof crypto !== "undefined" && crypto.subtle) return crypto;
  throw new Error("Web Crypto is unavailable in this runtime.");
}

function uint8ToBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i];
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32ToUint8(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[\s=-]/g, "");
  if (!clean) throw new Error("TOTP secret is empty.");

  let bits = 0;
  let value = 0;
  const out: number[] = [];

  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error("TOTP secret has invalid Base32 characters.");
    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(out);
}

function counterToBytes(counter: number): Uint8Array {
  const out = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i -= 1) {
    out[i] = c & 255;
    c = Math.floor(c / 256);
  }
  return out;
}

function normalizeSecret(secret: string): string {
  return secret.toUpperCase().replace(/[\s-]/g, "");
}

export function normalizeTotpCode(code: string): string {
  return code.replace(/\s/g, "");
}

export function formatTotpSecret(secret: string): string {
  const clean = normalizeSecret(secret);
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

export function generateTotpSecret(byteLength = 20): string {
  const bytes = new Uint8Array(byteLength);
  getWebCrypto().getRandomValues(bytes);
  return uint8ToBase32(bytes);
}

export function buildOtpAuthUrl(input: { issuer: string; accountName: string; secret: string }) {
  const issuer = input.issuer.trim();
  const accountName = input.accountName.trim().toLowerCase();
  const secret = normalizeSecret(input.secret);

  const label = `${issuer}:${accountName}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });

  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

export function buildGoogleQrUrl(otpauthUrl: string, size = 220) {
  const safeSize = Math.min(512, Math.max(120, size));
  const encoded = encodeURIComponent(otpauthUrl);
  return `https://chart.googleapis.com/chart?cht=qr&chs=${safeSize}x${safeSize}&chld=M|0&chl=${encoded}`;
}

async function generateHotp(secret: string, counter: number): Promise<string> {
  const cryptoApi = getWebCrypto();
  const keyData = base32ToUint8(normalizeSecret(secret));
  const keyBuffer = new Uint8Array(keyData).buffer;
  const counterBuffer = new Uint8Array(counterToBytes(counter)).buffer;
  const key = await cryptoApi.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const digest = new Uint8Array(await cryptoApi.subtle.sign("HMAC", key, counterBuffer));
  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const code = binary % 10 ** TOTP_DIGITS;
  return String(code).padStart(TOTP_DIGITS, "0");
}

function currentCounter(atMs = Date.now()): number {
  return Math.floor(atMs / 1000 / TOTP_PERIOD_SECONDS);
}

export async function generateTotpCode(secret: string, atMs = Date.now()) {
  return generateHotp(secret, currentCounter(atMs));
}

export async function verifyTotpCode(
  secret: string,
  code: string,
  opts?: { driftWindows?: number; atMs?: number },
) {
  const normalizedCode = normalizeTotpCode(code);
  if (!/^\d{6}$/.test(normalizedCode)) return false;

  const driftWindows = Math.min(3, Math.max(0, opts?.driftWindows ?? 1));
  const atMs = opts?.atMs ?? Date.now();
  const baseCounter = currentCounter(atMs);

  for (let w = -driftWindows; w <= driftWindows; w += 1) {
    const generated = await generateHotp(secret, baseCounter + w);
    if (generated === normalizedCode) return true;
  }

  return false;
}
