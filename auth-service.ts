import type { IncomingMessage } from "http";
import crypto from "crypto";
import { getFirestore } from "./lib/firebase.js";
import { createAuthToken, getAuthSecret, hashPassword, normalizeUserRecord, verifyAuthToken, verifyPassword } from "./auth-utils.js";
import type { User } from "./src/types.js";

export const CUSTOM_ADMIN_EMAIL = "sjagrit2005@gmail.com";

export type AuthenticatedUser = User;

type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: string;
  passwordHash?: string;
};

type RequestLike = Pick<IncomingMessage, "headers"> & {
  body?: any;
};

const USERS_COLLECTION = "users";

function normalizeEmail(email: string) {
  return String(email).toLowerCase().trim();
}

function normalizeCreatedAt(value: any) {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return String(value);
}

function toPublicUser(record: any): User {
  const normalized = normalizeUserRecord({
    id: record.id || record._id,
    email: record.email,
    name: record.name,
    role: record.role,
    createdAt: normalizeCreatedAt(record.createdAt),
  });

  if (!normalized) {
    throw new Error("Account profile is malformed.");
  }

  return {
    id: normalized.uid,
    email: normalized.email,
    name: normalized.name,
    role: normalized.role,
    createdAt: normalized.createdAt,
  };
}

function usersCollection() {
  return getFirestore().collection(USERS_COLLECTION);
}

async function readUserDocByEmail(email: string): Promise<UserRecord | null> {
  const snapshot = await usersCollection().where("email", "==", normalizeEmail(email)).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<UserRecord, "id">) };
}

async function readUserDocById(uid: string): Promise<UserRecord | null> {
  const doc = await usersCollection().doc(uid).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Omit<UserRecord, "id">) };
}

export async function readUserByEmail(email: string) {
  const user = await readUserDocByEmail(email);
  return user ? toPublicUser(user) : null;
}

export async function readUserById(uid: string) {
  const user = await readUserDocById(uid);
  return user ? toPublicUser(user) : null;
}

export async function signupUser(email: string, password: string, name: string) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await readUserDocByEmail(normalizedEmail);

  if (existing) {
    throw Object.assign(new Error("An account with that email already exists."), { statusCode: 409 });
  }

  const passwordHash = (await hashPassword(password)).hash;
  const createdAt = new Date().toISOString();
  const role = normalizedEmail === CUSTOM_ADMIN_EMAIL ? "admin" : "user";
  const uid = `user-${crypto.randomUUID()}`;

  const payload: UserRecord = {
    id: uid,
    email: normalizedEmail,
    name: String(name).trim(),
    role,
    createdAt,
    passwordHash,
  };

  await usersCollection().doc(uid).set(payload);

  const user = toPublicUser(payload);
  return {
    user,
    token: createAuthToken({ uid: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }),
  };
}

export async function loginUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const userRecord = await readUserDocByEmail(normalizedEmail);

  if (!userRecord?.passwordHash) {
    throw Object.assign(new Error("Invalid credentials."), { statusCode: 401 });
  }

  const valid = await verifyPassword(password, userRecord.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Invalid credentials."), { statusCode: 401 });
  }

  const user = toPublicUser(userRecord);
  return {
    user,
    token: createAuthToken({ uid: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }),
  };
}

export async function getAuthenticatedUser(req: RequestLike) {
  const rawHeader = req.headers.authorization;
  const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAuthToken(token, getAuthSecret());
  if (!decoded) {
    return null;
  }

  const user = await readUserDocById(decoded.uid);

  if (!user) {
    return null;
  }

  return toPublicUser(user);
}

export async function syncProfile(uid: string, email: string, name: string) {
  const normalizedEmail = normalizeEmail(email);
  const role = normalizedEmail === CUSTOM_ADMIN_EMAIL ? "admin" : "user";
  const existing = await readUserDocById(uid);

  if (!existing) {
    throw new Error("Account not found.");
  }

  await usersCollection().doc(uid).set(
    {
      email: normalizedEmail,
      name: String(name).trim() || existing.name,
      role: existing.role === "admin" || role === "admin" ? "admin" : "user",
    },
    { merge: true }
  );

  const updated = await readUserDocById(uid);

  if (!updated) {
    throw new Error("Failed to reconcile profile.");
  }

  return toPublicUser(updated);
}

export async function changePassword(uid: string, oldPassword: string, newPassword: string) {
  const user = await readUserDocById(uid);
  if (!user?.passwordHash) {
    throw Object.assign(new Error("This account is not managed by the custom password backend."), { statusCode: 400 });
  }

  const valid = await verifyPassword(oldPassword, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Old password is incorrect."), { statusCode: 401 });
  }

  const nextPasswordHash = (await hashPassword(newPassword)).hash;
  await usersCollection().doc(uid).set({ passwordHash: nextPasswordHash }, { merge: true });
}

export async function deleteAccount(uid: string) {
  await usersCollection().doc(uid).delete();
}