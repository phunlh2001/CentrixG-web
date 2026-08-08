import { create } from "zustand";
import {
  AuthService,
  IAuthResponse,
  IAuthUser,
  ILoginPayload,
  IRegisterPayload,
  IVerifyCodePayload,
} from "../../api/authApi";
import { Utils } from "../utils";

export const COOKIE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  expiresIn: "expiresIn",
  expiresAt: "tokenExpiresAt",
  user: "authUser",
} as const;

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  user: IAuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (session: IAuthResponse) => void;
  clearSession: () => void;
  login: (payload: ILoginPayload) => Promise<IAuthResponse>;
  register: (payload: IRegisterPayload) => Promise<{ message: string }>;
  verifyCode: (payload: IVerifyCodePayload) => Promise<IAuthResponse>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
}

const getInitialUser = (): IAuthUser | null => {
  try {
    const raw = Utils.cookie.read(COOKIE_KEYS.user);
    if (raw) {
      try {
        return JSON.parse(decodeURIComponent(raw)) as IAuthUser;
      } catch {
        return JSON.parse(raw) as IAuthUser;
      }
    }
  } catch {
    // Ignore JSON parse errors
  }
  return null;
};

const getInitialToken = (): string | null => {
  return Utils.cookie.read(COOKIE_KEYS.accessToken);
};

const isTokenValid = (): boolean => {
  const token = getInitialToken();
  const user = getInitialUser();
  if (!token || !user) return false;

  const expiresAt = Utils.cookie.read(COOKIE_KEYS.expiresAt);
  if (expiresAt) {
    const expiresAtNum = Number(expiresAt);
    if (!isNaN(expiresAtNum) && Date.now() >= expiresAtNum) {
      return false;
    }
  }
  return true;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: getInitialToken(),
  refreshToken: Utils.cookie.read(COOKIE_KEYS.refreshToken),
  expiresIn: Number(Utils.cookie.read(COOKIE_KEYS.expiresIn) || 0),
  user: getInitialUser(),
  isAuthenticated: isTokenValid(),
  isLoading: false,

  setSession: (session: IAuthResponse) => {
    const days = session.expiresIn ? session.expiresIn / 86400 || 7 : 7;
    const expiresAt = Date.now() + (session.expiresIn || 900) * 1000;

    if (session.accessToken) {
      Utils.cookie.create(COOKIE_KEYS.accessToken, session.accessToken, days);
    }
    if (session.refreshToken) {
      Utils.cookie.create(COOKIE_KEYS.refreshToken, session.refreshToken, days);
    }
    if (session.expiresIn) {
      Utils.cookie.create(COOKIE_KEYS.expiresIn, String(session.expiresIn), days);
      Utils.cookie.create(COOKIE_KEYS.expiresAt, String(expiresAt), days);
    }
    if (session.user) {
      Utils.cookie.create(COOKIE_KEYS.user, JSON.stringify(session.user), days);
    }

    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      user: session.user,
      isAuthenticated: true,
    });

    window.dispatchEvent(new Event("auth-session-changed"));
  },

  clearSession: () => {
    Utils.cookie.clear(COOKIE_KEYS.accessToken);
    Utils.cookie.clear(COOKIE_KEYS.refreshToken);
    Utils.cookie.clear(COOKIE_KEYS.expiresIn);
    Utils.cookie.clear(COOKIE_KEYS.expiresAt);
    Utils.cookie.clear(COOKIE_KEYS.user);

    set({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      user: null,
      isAuthenticated: false,
    });

    window.dispatchEvent(new Event("auth-session-changed"));
  },

  login: async (payload: ILoginPayload) => {
    set({ isLoading: true });
    try {
      const session = await AuthService.login(payload);
      get().setSession(session);
      return session;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (payload: IRegisterPayload) => {
    set({ isLoading: true });
    try {
      return await AuthService.register(payload);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyCode: async (payload: IVerifyCodePayload) => {
    set({ isLoading: true });
    try {
      const session = await AuthService.verifyCode(payload);
      get().setSession(session);
      return session;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AuthService.logout();
    } finally {
      get().clearSession();
      set({ isLoading: false });
    }
  },

  checkAuth: () => {
    const valid = isTokenValid();
    const user = getInitialUser();
    const isAuth = valid && user !== null;

    set({
      isAuthenticated: isAuth,
      user,
      accessToken: getInitialToken(),
    });

    if (!isAuth && get().accessToken) {
      get().clearSession();
    }
    return isAuth;
  },
}));
