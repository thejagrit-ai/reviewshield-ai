import crypto from "crypto";
import bcrypt from "bcryptjs";

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: string;
}

interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: "user" | "admin";
  iat: number;
  exp: number;
}

const DEFAULT_AUTH_SECRET = "reviewshield-custom-auth-secret";

export function getAuthSecret() {
  return process.env.AUTH_SECRET || process.env.JWT_SECRET || DEFAULT_AUTH_SECRET;
}

export async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, 12);
  return { hash };
}

export async function verifyPassword(password: string, expectedHash: string) {
  return bcrypt.compare(password, expectedHash);
}

export function normalizeUserRecord(record: any): AuthUser | null {
  if (!record) return null;
  const uid = record.id || record.uid;
  if (!uid) return null;

  return {
    uid,
    email: String(record.email || ""),
    name: String(record.name || "Verified Partner"),
    role: record.role === "admin" ? "admin" : "user",
    createdAt: record.createdAt,
  };
}

export function sanitizeUserRecord(record: any): AuthUser | null {
  return normalizeUserRecord(record);
}

export function createAuthToken(user: AuthUser, secret = getAuthSecret(), expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthTokenPayload = {
    sub: user.uid,
    email: user.email,
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");

  return `${signingInput}.${signature}`;
}

export function verifyAuthToken(token: string, secret = getAuthSecret()): AuthUser | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AuthTokenPayload;
    if (!payload || typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      uid: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}