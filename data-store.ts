import fs from "fs/promises";
import path from "path";
import { ProductInsight, ReviewAnalysis, SystemLog, User } from "./src/types";

export type StoredUser = User & {
  passwordSalt?: string;
  passwordHash?: string;
};

export interface AnalysisCacheEntry {
  result: ReviewAnalysis;
  provisional?: boolean;
  createdAt: string;
}

export interface AnalysisJobItem {
  key: string;
  item: any;
}

export interface AnalysisJob {
  id: string;
  createdAt: string;
  status: string;
  userEmail: string;
  items: AnalysisJobItem[];
}

export interface DatabaseState {
  users: StoredUser[];
  reviews: Array<ReviewAnalysis & { userId: string }>;
  insights: Array<ProductInsight & { userId: string }>;
  logs: SystemLog[];
  analysisCache: Record<string, AnalysisCacheEntry>;
  analysisJobs: AnalysisJob[];
}

const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'reviewshield-db.json')
  : path.join(process.cwd(), 'data', 'db.json');

function createDefaultState(): DatabaseState {
  return {
    users: [],
    reviews: [],
    insights: [],
    logs: [],
    analysisCache: {},
    analysisJobs: [],
  };
}

function normalizeState(raw: any): DatabaseState {
  const state = createDefaultState();
  if (!raw || typeof raw !== "object") {
    return state;
  }

  state.users = Array.isArray(raw.users) ? raw.users : Object.values(raw.users || {});
  state.reviews = Array.isArray(raw.reviews) ? raw.reviews : Object.values(raw.reviews || {});
  state.insights = Array.isArray(raw.insights) ? raw.insights : Object.values(raw.insights || {});
  state.logs = Array.isArray(raw.logs) ? raw.logs : Object.values(raw.logs || {});
  state.analysisJobs = Array.isArray(raw.analysisJobs) ? raw.analysisJobs : Object.values(raw.analysisJobs || {});

  if (raw.analysisCache && typeof raw.analysisCache === "object" && !Array.isArray(raw.analysisCache)) {
    state.analysisCache = raw.analysisCache;
  }

  return state;
}

async function readState(): Promise<DatabaseState> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    if (!raw.trim()) {
      return createDefaultState();
    }
    return normalizeState(JSON.parse(raw));
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return createDefaultState();
    }
    throw error;
  }
}

async function writeState(state: DatabaseState): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(state, null, 2));
}

let writeQueue = Promise.resolve();

async function withState<T>(mutator: (state: DatabaseState) => Promise<T> | T): Promise<T> {
  const task = writeQueue.then(async () => {
    const state = await readState();
    const result = await mutator(state);
    await writeState(state);
    return result;
  });

  writeQueue = task.then(
    () => undefined,
    () => undefined
  );

  return task;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function sortByFieldDesc<T extends Record<string, any>>(items: T[], field: keyof T) {
  return [...items].sort((left, right) => String(right[field] || "").localeCompare(String(left[field] || "")));
}

export function sanitizeUserRecord(user: StoredUser | null | undefined): User | null {
  if (!user) return null;
  const { passwordHash, passwordSalt, ...publicUser } = user;
  return publicUser;
}

export function normalizeUserRecord(record: any): User | null {
  if (!record || typeof record !== "object") return null;
  if (!record.id || !record.email || !record.name || !record.role) return null;
  return {
    id: String(record.id),
    email: String(record.email).toLowerCase(),
    name: String(record.name),
    role: record.role === "admin" ? "admin" : "user",
    createdAt: record.createdAt ? String(record.createdAt) : undefined,
  };
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const state = await readState();
  const normalized = email.toLowerCase();
  return state.users.find((user) => user.email.toLowerCase() === normalized) || null;
}

export async function getUserById(uid: string): Promise<StoredUser | null> {
  const state = await readState();
  return state.users.find((user) => user.id === uid) || null;
}

export async function upsertUserProfile(user: StoredUser): Promise<User> {
  return withState(async (state) => {
    const nextUser: StoredUser = {
      ...user,
      email: user.email.toLowerCase(),
      role: user.role === "admin" ? "admin" : "user",
      createdAt: user.createdAt || new Date().toISOString(),
    };

    const index = state.users.findIndex((entry) => entry.id === nextUser.id);
    if (index >= 0) {
      state.users[index] = { ...state.users[index], ...nextUser };
    } else {
      state.users.push(nextUser);
    }

    return sanitizeUserRecord(nextUser)!;
  });
}

export async function deleteUserById(uid: string): Promise<void> {
  await withState(async (state) => {
    state.users = state.users.filter((user) => user.id !== uid);
    state.reviews = state.reviews.filter((review) => review.userId !== uid);
    state.insights = state.insights.filter((insight) => insight.userId !== uid);
    return undefined;
  });
}

export async function listUsers(): Promise<User[]> {
  const state = await readState();
  return sortByFieldDesc(state.users, "createdAt").map((user) => sanitizeUserRecord(user)!).filter(Boolean);
}

export async function upsertReview(review: ReviewAnalysis, userId: string): Promise<ReviewAnalysis> {
  return withState(async (state) => {
    const stored = { ...review, userId };
    const index = state.reviews.findIndex((entry) => entry.id === review.id);
    if (index >= 0) {
      state.reviews[index] = stored;
    } else {
      state.reviews.push(stored);
    }
    return review;
  });
}

export async function deleteReviewById(reviewId: string): Promise<void> {
  await withState(async (state) => {
    state.reviews = state.reviews.filter((review) => review.id !== reviewId);
    return undefined;
  });
}

export async function listReviews(userId?: string, isAdmin = false): Promise<ReviewAnalysis[]> {
  const state = await readState();
  const reviews = isAdmin ? state.reviews : state.reviews.filter((review) => review.userId === userId);
  return sortByFieldDesc(reviews, "createdAt").map(({ userId: _userId, ...review }) => review);
}

export async function upsertInsight(insight: ProductInsight, userId: string): Promise<ProductInsight> {
  return withState(async (state) => {
    const stored = { ...insight, userId };
    const index = state.insights.findIndex((entry) => entry.productName === insight.productName && entry.userId === userId);
    if (index >= 0) {
      state.insights[index] = stored;
    } else {
      state.insights.push(stored);
    }
    return insight;
  });
}

export async function listInsights(userId?: string, isAdmin = false): Promise<ProductInsight[]> {
  const state = await readState();
  const insights = isAdmin ? state.insights : state.insights.filter((insight) => insight.userId === userId);
  return sortByFieldDesc(insights, "lastUpdated").map(({ userId: _userId, ...insight }) => insight);
}

export async function appendLog(log: SystemLog): Promise<SystemLog> {
  return withState(async (state) => {
    state.logs.push(log);
    return log;
  });
}

export async function listLogs(limit = 50): Promise<SystemLog[]> {
  const state = await readState();
  return sortByFieldDesc(state.logs, "timestamp").slice(0, limit);
}

export async function getAnalysisCacheEntry(key: string): Promise<AnalysisCacheEntry | null> {
  const state = await readState();
  return state.analysisCache[key] || null;
}

export async function setAnalysisCacheEntry(key: string, entry: AnalysisCacheEntry): Promise<void> {
  await withState(async (state) => {
    state.analysisCache[key] = clone(entry);
    return undefined;
  });
}

export async function addAnalysisJob(job: AnalysisJob): Promise<void> {
  await withState(async (state) => {
    state.analysisJobs.push(clone(job));
    return undefined;
  });
}

type QueryFilter = {
  field: string;
  op: "==";
  value: any;
};

class DocumentSnapshotAdapter<T> {
  public readonly exists: boolean;

  constructor(public readonly id: string, private readonly value: T | null) {
    this.exists = value !== null;
  }

  data(): T | undefined {
    return this.value === null ? undefined : clone(this.value);
  }
}

class QuerySnapshotAdapter<T> {
  public readonly size: number;
  public readonly empty: boolean;

  constructor(public readonly docs: Array<DocumentSnapshotAdapter<T>>) {
    this.size = docs.length;
    this.empty = docs.length === 0;
  }

  forEach(callback: (doc: DocumentSnapshotAdapter<T>) => void) {
    this.docs.forEach(callback);
  }
}

function collectionEntries(state: DatabaseState, name: string): Array<{ id: string; data: any }> {
  if (name === "users") {
    return state.users.map((user) => ({ id: user.id, data: user }));
  }
  if (name === "reviews") {
    return state.reviews.map((review) => ({ id: review.id, data: review }));
  }
  if (name === "insights") {
    return state.insights.map((insight) => ({ id: `${insight.productName}_${insight.userId}`, data: insight }));
  }
  if (name === "logs") {
    return state.logs.map((log) => ({ id: log.id, data: log }));
  }
  if (name === "analysis_cache") {
    return Object.entries(state.analysisCache).map(([id, data]) => ({ id, data }));
  }
  if (name === "analysis_jobs") {
    return state.analysisJobs.map((job) => ({ id: job.id, data: job }));
  }
  return [];
}

function writeCollectionDoc(state: DatabaseState, name: string, id: string, data: any, merge = false) {
  if (name === "users") {
    const nextRecord = { ...(merge ? state.users.find((entry) => entry.id === id) || {} : {}), ...data, id } as StoredUser;
    const index = state.users.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      state.users[index] = nextRecord;
    } else {
      state.users.push(nextRecord);
    }
    return;
  }

  if (name === "reviews") {
    const nextRecord = { ...(merge ? state.reviews.find((entry) => entry.id === id) || {} : {}), ...data, id };
    const index = state.reviews.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      state.reviews[index] = nextRecord;
    } else {
      state.reviews.push(nextRecord);
    }
    return;
  }

  if (name === "insights") {
    const nextRecord = { ...(merge ? state.insights.find((entry) => `${entry.productName}_${entry.userId}` === id) || {} : {}), ...data };
    const index = state.insights.findIndex((entry) => `${entry.productName}_${entry.userId}` === id);
    if (index >= 0) {
      state.insights[index] = nextRecord;
    } else {
      state.insights.push(nextRecord);
    }
    return;
  }

  if (name === "logs") {
    const nextRecord = { ...(merge ? state.logs.find((entry) => entry.id === id) || {} : {}), ...data, id };
    const index = state.logs.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      state.logs[index] = nextRecord;
    } else {
      state.logs.push(nextRecord);
    }
    return;
  }

  if (name === "analysis_cache") {
    state.analysisCache[id] = { ...(merge ? state.analysisCache[id] || {} : {}), ...data };
    return;
  }

  if (name === "analysis_jobs") {
    const nextRecord = { ...(merge ? state.analysisJobs.find((entry) => entry.id === id) || {} : {}), ...data, id };
    const index = state.analysisJobs.findIndex((entry) => entry.id === id);
    if (index >= 0) {
      state.analysisJobs[index] = nextRecord;
    } else {
      state.analysisJobs.push(nextRecord);
    }
  }
}

function deleteCollectionDoc(state: DatabaseState, name: string, id: string) {
  if (name === "users") {
    state.users = state.users.filter((entry) => entry.id !== id);
    return;
  }
  if (name === "reviews") {
    state.reviews = state.reviews.filter((entry) => entry.id !== id);
    return;
  }
  if (name === "insights") {
    state.insights = state.insights.filter((entry) => `${entry.productName}_${entry.userId}` !== id);
    return;
  }
  if (name === "logs") {
    state.logs = state.logs.filter((entry) => entry.id !== id);
    return;
  }
  if (name === "analysis_cache") {
    delete state.analysisCache[id];
    return;
  }
  if (name === "analysis_jobs") {
    state.analysisJobs = state.analysisJobs.filter((entry) => entry.id !== id);
  }
}

function collectionSortField(name: string, field: string) {
  if (name === "users") return field === "createdAt" ? field : field;
  return field;
}

class CollectionQueryAdapter {
  constructor(
    private readonly name: string,
    private readonly filters: QueryFilter[] = [],
    private readonly sortField: string | null = null,
    private readonly sortDirection: "asc" | "desc" = "asc",
    private readonly limitCount: number | null = null,
  ) {}

  doc(id: string) {
    return new DocumentReferenceAdapter(this.name, id);
  }

  where(field: string, op: "==", value: any) {
    return new CollectionQueryAdapter(this.name, [...this.filters, { field, op, value }], this.sortField, this.sortDirection, this.limitCount);
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new CollectionQueryAdapter(this.name, this.filters, collectionSortField(this.name, field), direction, this.limitCount);
  }

  limit(count: number) {
    return new CollectionQueryAdapter(this.name, this.filters, this.sortField, this.sortDirection, count);
  }

  async get() {
    const state = await readState();
    let entries = collectionEntries(state, this.name);
    for (const filter of this.filters) {
      if (filter.op === "==") {
        entries = entries.filter((entry) => entry.data?.[filter.field] === filter.value);
      }
    }

    if (this.sortField) {
      entries = [...entries].sort((left, right) => {
        const leftValue = String(left.data?.[this.sortField] || "");
        const rightValue = String(right.data?.[this.sortField] || "");
        return this.sortDirection === "desc" ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
      });
    }

    if (this.limitCount !== null) {
      entries = entries.slice(0, this.limitCount);
    }

    return new QuerySnapshotAdapter(entries.map((entry) => new DocumentSnapshotAdapter(entry.id, entry.data)));
  }
}

class DocumentReferenceAdapter {
  constructor(private readonly name: string, private readonly id: string) {}

  async get() {
    const state = await readState();
    const entry = collectionEntries(state, this.name).find((record) => record.id === this.id) || null;
    return new DocumentSnapshotAdapter(this.id, entry ? entry.data : null);
  }

  async set(data: any, options?: { merge?: boolean }) {
    await withState(async (state) => {
      writeCollectionDoc(state, this.name, this.id, data, Boolean(options?.merge));
      return undefined;
    });
  }

  async update(data: any) {
    await this.set(data, { merge: true });
  }

  async delete() {
    await withState(async (state) => {
      deleteCollectionDoc(state, this.name, this.id);
      return undefined;
    });
  }
}

class CollectionReferenceAdapter extends CollectionQueryAdapter {
  constructor(name: string) {
    super(name);
  }
}

export const storeDb = {
  collection(name: string) {
    return new CollectionReferenceAdapter(name);
  },
};

