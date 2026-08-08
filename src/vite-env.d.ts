/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_API_URL?: string;
  readonly VITE_APP_TARGET?: "web" | "desktop";
  readonly VITE_ENABLE_WEB?: "true" | "false";
  readonly VITE_ENABLE_DESKTOP?: "true" | "false";

  // SePay Webhook & Payment API Configuration
  readonly VITE_SEPAY_BANK_CODE?: string;
  readonly VITE_SEPAY_BANK_NAME?: string;
  readonly VITE_SEPAY_ACC_NUMBER?: string;
  readonly VITE_SEPAY_ACC_NAME?: string;
  readonly VITE_SEPAY_TEMPLATE?: string;
  readonly VITE_SEPAY_ORDER_PREFIX?: string;
  readonly VITE_SEPAY_TIMEOUT_SECONDS?: string;
  readonly VITE_SEPAY_API_KEY?: string;
  readonly VITE_SEPAY_WEBHOOK_SECRET?: string;
  readonly VITE_SEPAY_API_URL?: string;
  readonly VITE_SEPAY_WEBHOOK_URL?: string;
  readonly VITE_SEPAY_POLL_INTERVAL_MS?: string;
}

interface Window {
  centrixDesktop?: {
    isDesktop: boolean;
    platform: string;
    installApp?: (appId: number | string) => Promise<{ success: boolean; message: string }>;
  };
}
