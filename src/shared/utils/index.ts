import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CATEGORIES, LOCALES } from "../contanst/appConfig";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function openExternalLink(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

export const Utils = {
  convert: {
    category: (id: string) => {
      return CATEGORIES.find((x) => x.id === id)?.name || id;
    },
    currency: (price: number, localeCode?: string) => {
      const locale = LOCALES.find((x) => x.localeCode === localeCode);

      let convertedPrice = price;
      if (price > 1000) {
        if (localeCode === "en") convertedPrice = price / 25000;
        else if (localeCode === "zh") convertedPrice = price / 3500;
      } else if (price > 0 && price <= 1000) {
        if (localeCode === "vi") convertedPrice = price * 25000;
        else if (localeCode === "zh") convertedPrice = price * 7.1;
      }

      return convertedPrice.toLocaleString(locale?.locale || "en-US", {
        style: "currency",
        currency: locale ? locale.currency : "USD",
        maximumFractionDigits: localeCode === "vi" ? 0 : 2,
      });
    },
    toVnd: (price: number, localeCode?: string): number => {
      if (price > 1000) return price;
      if (localeCode === "en") return Math.round(price * 25000);
      if (localeCode === "zh") return Math.round(price * 3500);
      return Math.round(price * 25000);
    },
  },
  format: {
    cardExpiryDate: (value: string) => {
      const digits = value.replace(/\D/g, "").slice(0, 4);

      if (digits.length < 2) {
        return digits;
      }

      if (digits.length === 2 && value.length >= 2 && !value.includes("/")) {
        return `${digits}/`;
      }

      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    },
  },
  cookie: {
    create: (name: string, value: string, days?: number) => {
      try {
        let expires: string = "";
        if (days) {
          const date = new Date();
          date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
          expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax`;
      } catch {
        // Document cookie may be blocked or restricted in Desktop Electron
      }
      try {
        localStorage.setItem(name, value);
      } catch {
        // Fallback catch
      }
    },
    read: (name: string): string | null => {
      try {
        if (typeof document !== "undefined" && document.cookie) {
          const nameEQ = `${name}=`;
          const ca = document.cookie.split(";");
          for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === " ") c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
              const val = c.substring(nameEQ.length, c.length);
              try {
                return decodeURIComponent(val);
              } catch {
                return val;
              }
            }
          }
        }
      } catch {
        // Fallback to localStorage below
      }
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    clear: (name: string) => {
      try {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      } catch {
        // Ignore
      }
      try {
        localStorage.removeItem(name);
      } catch {
        // Ignore
      }
    },
  },
};
