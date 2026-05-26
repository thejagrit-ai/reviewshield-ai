import React, { createContext, useContext, useEffect, useState } from "react";
import { saveUserProfile } from "./db";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  authToken: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = "rs_auth_token";
const AUTH_USER_KEY = "rs_auth_user";

function storeSession(token: string | null, user: User | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(AUTH_USER_KEY);
  }
}

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = (token: string | null, nextUser: User | null) => {
    setAuthToken(token);
    setUser(nextUser);
    storeSession(token, nextUser);
  };

  const refreshUser = async () => {
    const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) {
      applySession(null, null);
      return;
    }

    try {
      const payload = await requestJson("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      applySession(token, payload.user as User);
    } catch {
      applySession(null, null);
    }
  };

  useEffect(() => {
    (async () => {
      const storedToken = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_KEY) : null;
      try {
        if (!storedToken) {
          applySession(null, null);
          return;
        }

        const payload = await requestJson("/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        applySession(storedToken, payload.user as User);
      } catch {
        applySession(null, null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const payload = await requestJson("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: pass }),
      });

      applySession(payload.token, payload.user as User);
      return payload.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const payload = await requestJson("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password: pass, name }),
      });

      applySession(payload.token, payload.user as User);
      return payload.user;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    throw new Error("Password reset is not enabled for the custom auth backend.");
  };

  const loginWithGoogle = async () => {
    throw new Error("Google sign-in is not enabled for the custom auth backend.");
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (authToken) {
        await requestJson("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }).catch(() => {});
      }
    } finally {
      applySession(null, null);
      setLoading(false);
    }
  };

  const updateProfileName = async (name: string) => {
    if (!user) return;
    const updatedUser = { ...user, name };

    if (authToken) {
      await requestJson("/api/auth/sync-profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name, email: user.email }),
      });
    }

    await saveUserProfile(updatedUser);
    applySession(authToken, updatedUser);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!authToken) throw new Error("No active session.");
    await requestJson("/api/auth/change-password", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  };

  const deleteAccount = async () => {
    if (!authToken) throw new Error("No active session.");
    await requestJson("/api/auth/account", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    applySession(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        loading,
        login,
        signup,
        resetPassword,
        loginWithGoogle,
        logout,
        updateProfileName,
        changePassword,
        deleteAccount,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
