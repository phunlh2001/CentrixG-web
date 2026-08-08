export const SEPAY_ENV_KEYS = {
  BANK_CODE: "VITE_SEPAY_BANK_CODE",
  BANK_NAME: "VITE_SEPAY_BANK_NAME",
  ACC_NUMBER: "VITE_SEPAY_ACC_NUMBER",
  ACC_NAME: "VITE_SEPAY_ACC_NAME",
  TEMPLATE: "VITE_SEPAY_TEMPLATE",
  ORDER_PREFIX: "VITE_SEPAY_ORDER_PREFIX",
  TIMEOUT_SECONDS: "VITE_SEPAY_TIMEOUT_SECONDS",
  API_KEY: "VITE_SEPAY_API_KEY",
  WEBHOOK_SECRET: "VITE_SEPAY_WEBHOOK_SECRET",
  API_URL: "VITE_SEPAY_API_URL",
  WEBHOOK_URL: "VITE_SEPAY_WEBHOOK_URL",
  POLL_INTERVAL_MS: "VITE_SEPAY_POLL_INTERVAL_MS",
} as const;

export const SEPAY_CONFIG = {
  bankCode: import.meta.env[SEPAY_ENV_KEYS.BANK_CODE] || "MBBank",
  bankName: import.meta.env[SEPAY_ENV_KEYS.BANK_NAME] || "MB Bank (Ngân hàng Quân Đội)",
  accountNumber: import.meta.env[SEPAY_ENV_KEYS.ACC_NUMBER] || "",
  accountName: import.meta.env[SEPAY_ENV_KEYS.ACC_NAME] || "",
  template: import.meta.env[SEPAY_ENV_KEYS.TEMPLATE] || "compact",
  orderPrefix: import.meta.env[SEPAY_ENV_KEYS.ORDER_PREFIX] || "CG",
  timeoutSeconds: Number(import.meta.env[SEPAY_ENV_KEYS.TIMEOUT_SECONDS]) || 900,

  // Sensitive Webhook & API Key Constants (Loaded strictly via environment variables)
  apiKey: import.meta.env[SEPAY_ENV_KEYS.API_KEY] || "",
  webhookSecret: import.meta.env[SEPAY_ENV_KEYS.WEBHOOK_SECRET] || "",
  apiUrl: import.meta.env[SEPAY_ENV_KEYS.API_URL] || "https://my.sepay.vn/userapi",
  webhookUrl: import.meta.env[SEPAY_ENV_KEYS.WEBHOOK_URL] || "",
  pollIntervalMs: Number(import.meta.env[SEPAY_ENV_KEYS.POLL_INTERVAL_MS]) || 3000,

  getQrUrl: (amount: number, orderCode: string) => {
    const bankCode = import.meta.env[SEPAY_ENV_KEYS.BANK_CODE] || "MBBank";
    const accNumber = import.meta.env[SEPAY_ENV_KEYS.ACC_NUMBER] || "";
    const template = import.meta.env[SEPAY_ENV_KEYS.TEMPLATE] || "compact";
    return `https://qr.sepay.vn/img?bank=${encodeURIComponent(
      bankCode,
    )}&acc=${encodeURIComponent(accNumber)}&template=${encodeURIComponent(
      template,
    )}&amount=${Math.round(amount)}&des=${encodeURIComponent(orderCode)}`;
  },
};
