import { toast } from "react-toastify";
import { HttpClient } from "../shared/http/httpClient";
import type { RequestConfig } from "../shared/http/types";
import { Utils } from "../shared/utils";

const BASE_URL = "auth";

export const AUTH_STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  expiresIn: "expiresIn",
  expiresAt: "tokenExpiresAt",
  user: "authUser",
} as const;

export type AuthUserRole = "ADMIN" | "CUSTOMER" | "STREAMER" | string;

export interface IAuthUser {
  id: string;
  username: string;
  email: string;
  role: AuthUserRole;
  isBlock?: boolean;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: IAuthUser;
}

export interface IMessageResponse {
  message: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface IVerifyCodePayload {
  email: string;
  code: string;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
}

export interface IRevokeTokenPayload {
  refreshToken: string;
}

const saveSession = (session: IAuthResponse) => {
  if (!session) return;
  const days = session.expiresIn ? session.expiresIn / 86400 || 7 : 7;
  const expiresAt = Date.now() + (session.expiresIn || 900) * 1000;

  if (session.accessToken) {
    Utils.cookie.create(AUTH_STORAGE_KEYS.accessToken, session.accessToken, days);
  }
  if (session.refreshToken) {
    Utils.cookie.create(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken, days);
  }
  if (session.expiresIn) {
    Utils.cookie.create(AUTH_STORAGE_KEYS.expiresIn, String(session.expiresIn), days);
    Utils.cookie.create(AUTH_STORAGE_KEYS.expiresAt, String(expiresAt), days);
  }
  if (session.user) {
    Utils.cookie.create(AUTH_STORAGE_KEYS.user, JSON.stringify(session.user), days);
  }
  window.dispatchEvent(new Event("auth-session-changed"));
};

const clearSession = () => {
  Utils.cookie.clear(AUTH_STORAGE_KEYS.accessToken);
  Utils.cookie.clear(AUTH_STORAGE_KEYS.refreshToken);
  Utils.cookie.clear(AUTH_STORAGE_KEYS.expiresIn);
  Utils.cookie.clear(AUTH_STORAGE_KEYS.expiresAt);
  Utils.cookie.clear(AUTH_STORAGE_KEYS.user);
  window.dispatchEvent(new Event("auth-session-changed"));
};

const publicRequestConfig: RequestConfig = { requiresAuth: false };

export const AuthService = {
  login: async (payload: ILoginPayload): Promise<IAuthResponse> => {
    const res = await HttpClient.post<IAuthResponse>(
      `${BASE_URL}/login`,
      payload,
      publicRequestConfig,
    );

    if (res.success && res.data) {
      saveSession(res.data);
      return res.data;
    }
    throw new Error(res.message || "Login failed");
  },

  register: async (payload: IRegisterPayload): Promise<IMessageResponse> => {
    const res = await HttpClient.post<IMessageResponse>(
      `${BASE_URL}/register`,
      payload,
      publicRequestConfig,
    );

    if (res.data) {
      return res.data;
    }
    return { message: res.message || "Registration successful" };
  },

  verifyCode: async (payload: IVerifyCodePayload): Promise<IAuthResponse> => {
    const res = await HttpClient.post<IAuthResponse>(
      `${BASE_URL}/verify-code`,
      payload,
      publicRequestConfig,
    );

    if (res.success && res.data) {
      saveSession(res.data);
      return res.data;
    }
    throw new Error(res.message || "Verification failed");
  },

  refreshToken: async (payload?: IRefreshTokenPayload): Promise<IAuthResponse> => {
    const token =
      payload?.refreshToken ||
      Utils.cookie.read(AUTH_STORAGE_KEYS.refreshToken) ||
      localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) ||
      "";
    const res = await HttpClient.post<IAuthResponse>(
      `${BASE_URL}/refresh-token`,
      { refreshToken: token },
      publicRequestConfig,
    );

    if (res.success && res.data) {
      saveSession(res.data);
      return res.data;
    }
    throw new Error(res.message || "Refresh token failed");
  },

  revokeToken: async (payload?: IRevokeTokenPayload): Promise<IMessageResponse> => {
    const token =
      payload?.refreshToken ||
      Utils.cookie.read(AUTH_STORAGE_KEYS.refreshToken) ||
      localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken) ||
      "";
    const res = await HttpClient.post<IMessageResponse>(
      `${BASE_URL}/revoke-token`,
      { refreshToken: token },
      publicRequestConfig,
    );

    return res.data || { message: res.message || "Token revoked" };
  },

  getCurrentUser: (): IAuthUser | null => {
    if (!AuthService.isAuthenticated()) return null;

    try {
      const rawCookie = Utils.cookie.read(AUTH_STORAGE_KEYS.user);
      if (rawCookie) {
        return JSON.parse(decodeURIComponent(rawCookie)) as IAuthUser;
      }
      const rawLocal = localStorage.getItem(AUTH_STORAGE_KEYS.user);
      if (rawLocal) {
        return JSON.parse(rawLocal) as IAuthUser;
      }
    } catch {
      return null;
    }
    return null;
  },

  getAccessToken: (): string | null => {
    return Utils.cookie.read(AUTH_STORAGE_KEYS.accessToken) || localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  },

  getRefreshToken: (): string | null => {
    return Utils.cookie.read(AUTH_STORAGE_KEYS.refreshToken) || localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
  },

  isAuthenticated: (): boolean => {
    const token = AuthService.getAccessToken();
    if (!token) return false;

    const expiresAt =
      Utils.cookie.read(AUTH_STORAGE_KEYS.expiresAt) || localStorage.getItem(AUTH_STORAGE_KEYS.expiresAt);
    if (expiresAt) {
      const expiresAtNum = Number(expiresAt);
      if (!isNaN(expiresAtNum) && Date.now() >= expiresAtNum) {
        return false;
      }
    }

    return true;
  },

  logout: async () => {
    const refreshToken = AuthService.getRefreshToken();
    try {
      if (refreshToken) {
        await AuthService.revokeToken({ refreshToken }).catch(() => {});
      }
    } finally {
      clearSession();
      toast.success("Signed out successfully!");
    }
  },
};
