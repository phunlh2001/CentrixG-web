import {
  Check,
  Clock,
  Copy,
  Info,
  LoaderCircle,
  QrCode,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SEPAY_CONFIG, Utils } from "@/shared";
import NeonBadge from "../neon/NeonBadge";

type SePayPaymentFormProps = {
  amount: number;
  onSubmit?: () => void;
};

export default function SePayPaymentForm({
  amount,
  onSubmit,
}: SePayPaymentFormProps) {
  const { t } = useTranslation();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(SEPAY_CONFIG.timeoutSeconds);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Generate unique order code for this session
  const orderCode = useMemo(() => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `${SEPAY_CONFIG.orderPrefix}${randomSuffix}`;
  }, []);

  // Convert amount to VND for SePay VietQR generation
  const vndAmount = useMemo(
    () => Utils.convert.toVnd(amount, "vi"),
    [amount],
  );

  const qrImageUrl = useMemo(
    () => SEPAY_CONFIG.getQrUrl(vndAmount, orderCode),
    [vndAmount, orderCode],
  );

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Automated Webhook & API Polling Loop (no manual confirm button needed)
  useEffect(() => {
    if (timeLeft <= 0) return;

    let isSubscribed = true;
    const pollInterval = SEPAY_CONFIG.pollIntervalMs || 5000;

    const checkTransactionStatus = async () => {
      try {
        if (!SEPAY_CONFIG.apiKey) {
          return;
        }

        const response = await fetch(
          `${SEPAY_CONFIG.apiUrl}/transactions/list?account_number=${encodeURIComponent(
            SEPAY_CONFIG.accountNumber,
          )}&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${SEPAY_CONFIG.apiKey}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) return;

        const data = await response.json();
        const transactions = data?.transactions || data?.data?.transactions || [];

        const matchedTx = transactions.find((tx: any) => {
          const content = String(
            tx.transaction_content || tx.code || tx.des || "",
          ).toUpperCase();
          const amountIn = Number(tx.amount_in || tx.amount || 0);
          return content.includes(orderCode.toUpperCase()) && amountIn >= vndAmount;
        });

        if (matchedTx && isSubscribed) {
          setIsVerifying(true);
          onSubmit?.();
        }
      } catch (error) {
        console.error("SePay automated webhook polling check error:", error);
      }
    };

    const intervalId = setInterval(checkTransactionStatus, pollInterval);
    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [orderCode, vndAmount, timeLeft, onSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#00D4FF1F] pb-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{
              background: "#00D4FF1A",
              border: "1px solid #00D4FF40",
              color: "#00d4ff",
            }}
          >
            <QrCode size={18} />
          </div>
          <div>
            <h4
              className="font-bold text-sm"
              style={{ color: "var(--system-color-mist-lavender)" }}
            >
              {t("desktop.paymentPage.sepay.title")}
            </h4>
            <p className="text-xs" style={{ color: "#E8E8FF73" }}>
              {t("desktop.paymentPage.sepay.subtitle")}
            </p>
          </div>
        </div>

        <NeonBadge color="cyan" className="shrink-0">
          <Clock size={11} className="mr-1 inline" />
          {formatTime(timeLeft)}
        </NeonBadge>
      </div>

      {/* QR & Bank details container */}
      <div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-5 items-center">
        {/* QR Code image */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className="relative p-2.5 rounded-xl bg-white shadow-lg overflow-hidden shrink-0 transition-transform duration-300 hover:scale-105"
            style={{
              border: "2px solid #00D4FF59",
              boxShadow: "0 0 20px #00D4FF26",
            }}
          >
            <img
              src={qrImageUrl}
              alt="SePay VietQR Code"
              className="w-44 h-44 object-contain rounded-lg"
              loading="eager"
            />
          </div>
          <span className="text-[11px] font-medium" style={{ color: "#00D4FF99" }}>
            {t("desktop.paymentPage.sepay.qrInstruction")}
          </span>
        </div>

        {/* Transfer Information list */}
        <div className="flex flex-col gap-2.5 text-xs">
          {/* Bank */}
          <div
            className="flex items-center justify-between p-2.5 rounded-lg"
            style={{ background: "#00D4FF0A", border: "1px solid #00D4FF14" }}
          >
            <span style={{ color: "#E8E8FF8C" }}>
              {t("desktop.paymentPage.sepay.bank")}:
            </span>
            <span
              className="font-bold truncate max-w-[180px]"
              style={{ color: "var(--system-color-mist-lavender)" }}
            >
              {SEPAY_CONFIG.bankName}
            </span>
          </div>

          {/* Account Number */}
          <div
            className="flex items-center justify-between p-2.5 rounded-lg"
            style={{ background: "#00D4FF0A", border: "1px solid #00D4FF14" }}
          >
            <span style={{ color: "#E8E8FF8C" }}>
              {t("desktop.paymentPage.sepay.accountNumber")}:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-[#00d4ff]">
                {SEPAY_CONFIG.accountNumber}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(SEPAY_CONFIG.accountNumber, "account")
                }
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#00D4FF1A] hover:bg-[#00D4FF33] text-[#00d4ff] text-[11px] transition-colors"
              >
                {copiedField === "account" ? (
                  <>
                    <Check size={11} /> {t("desktop.paymentPage.sepay.copied")}
                  </>
                ) : (
                  <>
                    <Copy size={11} /> {t("desktop.paymentPage.sepay.copy")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Holder */}
          <div
            className="flex items-center justify-between p-2.5 rounded-lg"
            style={{ background: "#00D4FF0A", border: "1px solid #00D4FF14" }}
          >
            <span style={{ color: "#E8E8FF8C" }}>
              {t("desktop.paymentPage.sepay.accountName")}:
            </span>
            <span
              className="font-bold uppercase"
              style={{ color: "var(--system-color-mist-lavender)" }}
            >
              {SEPAY_CONFIG.accountName}
            </span>
          </div>

          {/* Amount */}
          <div
            className="flex items-center justify-between p-2.5 rounded-lg"
            style={{ background: "#00D4FF0A", border: "1px solid #00D4FF14" }}
          >
            <span style={{ color: "#E8E8FF8C" }}>
              {t("desktop.paymentPage.sepay.amount")}:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#00d4ff]">
                {Utils.convert.currency(vndAmount, "vi")}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(vndAmount.toString(), "amount")
                }
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#00D4FF1A] hover:bg-[#00D4FF33] text-[#00d4ff] text-[11px] transition-colors"
              >
                {copiedField === "amount" ? (
                  <>
                    <Check size={11} /> {t("desktop.paymentPage.sepay.copied")}
                  </>
                ) : (
                  <>
                    <Copy size={11} /> {t("desktop.paymentPage.sepay.copy")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order Code / Transfer Content */}
          <div
            className="flex items-center justify-between p-2.5 rounded-lg"
            style={{
              background: "#7B2FBE1A",
              border: "1px solid #7B2FBE40",
            }}
          >
            <span style={{ color: "#C084FC" }}>
              {t("desktop.paymentPage.sepay.orderCode")}:
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-[#c084fc]">
                {orderCode}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(orderCode, "code")}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#7B2FBE33] hover:bg-[#7B2FBE59] text-[#c084fc] text-[11px] transition-colors"
              >
                {copiedField === "code" ? (
                  <>
                    <Check size={11} /> {t("desktop.paymentPage.sepay.copied")}
                  </>
                ) : (
                  <>
                    <Copy size={11} /> {t("desktop.paymentPage.sepay.copy")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notice Box */}
      <div
        className="flex items-start gap-2.5 p-3 rounded-lg text-xs leading-relaxed"
        style={{
          background: "#FFB80012",
          border: "1px solid #FFB80033",
          color: "#ffc107",
        }}
      >
        <Info size={15} className="shrink-0 mt-0.5" />
        <p>{t("desktop.paymentPage.sepay.notice")}</p>
      </div>

      {/* Waiting / Automated Signal status indicator */}
      <div
        className="flex items-center justify-center gap-2 text-xs p-3 rounded-lg"
        style={{
          background: isVerifying ? "#00FF8814" : "#00D4FF0F",
          border: isVerifying ? "1px solid #00FF8840" : "1px solid #00D4FF26",
          color: isVerifying ? "#00ff88" : "#E8E8FF8C",
        }}
      >
        <LoaderCircle
          size={14}
          className={isVerifying ? "animate-spin text-[#00ff88]" : "animate-spin text-[#00d4ff]"}
        />
        <span>
          {isVerifying
            ? t("desktop.paymentPage.sepay.verifyingPayment", {
                defaultValue: "Payment signal received! Processing order...",
              })
            : t("desktop.paymentPage.sepay.waitingForSignal")}
        </span>
      </div>
    </div>
  );
}
