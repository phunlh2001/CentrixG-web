import { toast } from "react-toastify";
import { HttpClient } from "../shared/http/httpClient";
import type { RequestConfig } from "../shared/http/types";
import { Utils } from "../shared/utils";

const BASE_URL = "auth";

export const AUTH_STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  expiresIn: "expiresIn",
  user: "authUser",
} as const;

export type AuthUserRole = "ADMIN" | "CUSTOMER" | "SELLER" | string;

export interface IAuthUser {
  id: string;
  username: string;
  email: string;
  role: AuthUserRole;
  isBlock?: boolean;
  totalEarn?: number;
  isSeller?: boolean;
  offerCode?: string | null;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IJwtAffiliate {
  totalEarn?: number;
  offerCode?: string | null;
}

export interface IJwtPayload {
  sub?: string;
  id?: string;
  username?: string;
  email?: string;
  role?: AuthUserRole;
  isBlocked?: boolean;
  isBlock?: boolean;
  affiliate?: IJwtAffiliate;
  totalEarn?: number;
  offerCode?: string | null;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export const decodeJwt = (token: string): IJwtPayload | null => {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as IJwtPayload;
  } catch {
    return null;
  }
};

export const parseUserFromToken = (token: string): IAuthUser | null => {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const role = (payload.role || "CUSTOMER") as AuthUserRole;
  const isSeller = role?.toUpperCase() === "SELLER";
  const totalEarn = payload.affiliate?.totalEarn ?? payload.totalEarn ?? 0;
  const offerCode = payload.affiliate?.offerCode ?? payload.offerCode ?? null;

  return {
    id: payload.id || payload.sub || "",
    username: payload.username || "",
    email: payload.email || "",
    role: role,
    isBlock: payload.isBlocked ?? payload.isBlock ?? false,
    isSeller: isSeller,
    totalEarn: typeof totalEarn === "number" ? totalEarn : Number(totalEarn) || 0,
    offerCode: offerCode,
  };
};

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

export const saveSession = (session: IAuthResponse) => {
  if (!session) return;
  const days = session.expiresIn ? session.expiresIn / 86400 || 7 : 7;

  if (session.accessToken) {
    Utils.cookie.create(AUTH_STORAGE_KEYS.accessToken, session.accessToken, days);
    const user = parseUserFromToken(session.accessToken);
    if (user) {
      Utils.cookie.create(AUTH_STORAGE_KEYS.user, JSON.stringify(user), days);
    }
  }
  if (session.refreshToken) {
    Utils.cookie.create(AUTH_STORAGE_KEYS.refreshToken, session.refreshToken, days);
  }
  if (session.expiresIn) {
    Utils.cookie.create(AUTH_STORAGE_KEYS.expiresIn, String(session.expiresIn), days);
  }
  window.dispatchEvent(new Event("auth-session-changed"));
};

export const clearSession = () => {
  Utils.cookie.clear(AUTH_STORAGE_KEYS.accessToken);
  Utils.cookie.clear(AUTH_STORAGE_KEYS.refreshToken);
  Utils.cookie.clear(AUTH_STORAGE_KEYS.expiresIn);
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
    const token = AuthService.getAccessToken();
    if (!token) return null;

    if (!AuthService.isAuthenticated()) return null;

    // Parse user directly from current access token
    const userFromToken = parseUserFromToken(token);
    if (userFromToken) return userFromToken;

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
