import { ReviewAnalysis, ProductInsight, SystemLog, User } from "../types";

function getStoredAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("rs_auth_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function getStoredAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("rs_auth_token");
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface DataErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleDataError(error: unknown, operationType: OperationType, path: string | null) {
  const storedUser = getStoredAuthUser();
  const errInfo: DataErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: storedUser?.id || null,
      email: storedUser?.email || null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
    },
    operationType,
    path,
  };
  console.error("Data access error matched:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(getStoredAuthToken() ? { Authorization: `Bearer ${getStoredAuthToken()}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

export async function testConnection() {
  try {
    const token = getStoredAuthToken();
    if (!token) return;
    await requestJson("/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Connection test failed:", error);
  }
}

export async function saveUserProfile(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    await requestJson("/api/data/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  } catch (error) {
    handleDataError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProfile(uid: string): Promise<User | null> {
  const path = `users/${uid}`;
  try {
    const payload = await requestJson(`/api/data/users/${encodeURIComponent(uid)}`, {
      method: "GET",
    });
    return (payload.user as User) || null;
  } catch (error) {
    handleDataError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveReview(review: ReviewAnalysis, uid: string): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    await requestJson("/api/data/reviews", {
      method: "POST",
      body: JSON.stringify({ review, uid }),
    });
  } catch (error) {
    handleDataError(error, OperationType.WRITE, path);
  }
}

export async function fetchReviews(uid: string, isAdmin: boolean = false): Promise<ReviewAnalysis[]> {
  const path = "reviews";
  try {
    const payload = await requestJson(`/api/data/reviews?uid=${encodeURIComponent(uid)}&admin=${isAdmin ? "1" : "0"}`, {
      method: "GET",
    });
    return (payload.reviews as ReviewAnalysis[]) || [];
  } catch (error) {
    handleDataError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  const path = `reviews/${reviewId}`;
  try {
    await requestJson(`/api/data/reviews/${encodeURIComponent(reviewId)}`, {
      method: "DELETE",
    });
  } catch (error) {
    handleDataError(error, OperationType.DELETE, path);
  }
}

export async function saveProductInsight(insight: ProductInsight, uid: string): Promise<void> {
  const path = `insights/${insight.productName}`;
  try {
    await requestJson("/api/data/insights", {
      method: "POST",
      body: JSON.stringify({ insight, uid }),
    });
  } catch (error) {
    handleDataError(error, OperationType.WRITE, path);
  }
}

export async function fetchProductInsights(uid: string, isAdmin: boolean = false): Promise<ProductInsight[]> {
  const path = "insights";
  try {
    const payload = await requestJson(`/api/data/insights?uid=${encodeURIComponent(uid)}&admin=${isAdmin ? "1" : "0"}`, {
      method: "GET",
    });
    return (payload.insights as ProductInsight[]) || [];
  } catch (error) {
    handleDataError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveSystemLog(action: string, details: string): Promise<void> {
  const logId = `log-${Math.random().toString(36).substring(2, 11)}`;
  const path = `logs/${logId}`;
  try {
    await requestJson("/api/data/logs", {
      method: "POST",
      body: JSON.stringify({ action, details }),
    });
  } catch (error) {
    handleDataError(error, OperationType.WRITE, path);
  }
}

export async function fetchAllLogs(): Promise<SystemLog[]> {
  const path = "logs";
  try {
    const payload = await requestJson("/api/data/logs", {
      method: "GET",
    });
    return (payload.logs as SystemLog[]) || [];
  } catch (error) {
    handleDataError(error, OperationType.LIST, path);
    return [];
  }
}

export async function fetchAllUsers(): Promise<User[]> {
  const path = "users";
  try {
    const payload = await requestJson("/api/data/users", {
      method: "GET",
    });
    return (payload.users as User[]) || [];
  } catch (error) {
    handleDataError(error, OperationType.LIST, path);
    return [];
  }
}
