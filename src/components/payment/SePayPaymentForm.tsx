import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  Info,
  LoaderCircle,
  QrCode,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IOrderDetails, OrderService } from "@/api/orderApi";
import { Utils } from "@/shared";
import NeonBadge from "../neon/NeonBadge";
import NeonButton from "../neon/NeonButton";

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
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 minutes
  const [orderData, setOrderData] = useState<IOrderDetails | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("PENDING");

  // Step 1: Initialize order via API: GET /api/orders/latest -> if null, POST /api/orders
  const initOrder = async () => {
    setIsInitializing(true);
    setInitError(null);
    try {
      // 1. Try checking latest order first
      let order: IOrderDetails | null = null;
      const latestRes = await OrderService.getLatestOrder();

      if (latestRes && latestRes.success && latestRes.data && latestRes.data.orderCode) {
        const latestStatus = (latestRes.data.status || "PENDING").toUpperCase();
        if (latestStatus === "PENDING") {
          order = latestRes.data;
        }
      }

      // 2. If no active pending order exists, create a new order
      if (!order) {
        const createRes = await OrderService.createOrder(amount);
        if (createRes && createRes.success && createRes.data) {
          order = createRes.data;
        } else if (createRes?.data) {
          order = createRes.data;
        }
      }

      if (order) {
        setOrderData(order);
        setOrderStatus(order.status || "PENDING");
        if (typeof order.expired === "number" && order.expired >= 0) {
          setTimeLeft(order.expired);
        } else {
          setTimeLeft(900);
        }
      } else {
        throw new Error("Unable to create or retrieve order details.");
      }
    } catch (err: any) {
      console.error("Error initializing order:", err);
      setInitError(err?.message || "Failed to initialize payment order.");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initOrder();
  }, [amount]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const timeLeftRef = useRef(timeLeft);
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  // Step 2: Polling loop every 3 seconds to check GET /api/orders/{orderCode}
  useEffect(() => {
    if (!orderData?.orderCode || orderStatus !== "PENDING") {
      return;
    }

    let isSubscribed = true;
    const pollInterval = 5000;

    const checkOrderStatus = async () => {
      if (timeLeftRef.current <= 0) return;
      try {
        const res = await OrderService.getOrderStatus(orderData.orderCode);
        if (!isSubscribed) return;

        const currentStatus = (res?.data?.status || (res?.data as any)?.orderStatus || "PENDING")?.toUpperCase();

        if (currentStatus && currentStatus !== "PENDING") {
          setOrderStatus(currentStatus);

          if (currentStatus === "COMPLETED") {
            onSubmit?.();
          }
        }
      } catch (error) {
        console.error("Error polling order status:", error);
      }
    };

    // Run immediately when mounted/order created
    checkOrderStatus();

    const intervalId = setInterval(checkOrderStatus, pollInterval);
    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [orderData?.orderCode, orderStatus, onSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <LoaderCircle size={28} className="animate-spin text-neon-cyan" />
        <p className="text-xs text-text-primary/60">
          Generating secure payment order...
        </p>
      </div>
    );
  }

  if (initError || !orderData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <AlertCircle size={32} className="text-neon-pink" />
        <p className="text-xs text-text-primary/70 max-w-sm">
          {initError || "Unable to load order details."}
        </p>
        <NeonButton variant="secondary" size="sm" onClick={initOrder} startIcon={<RotateCcw size={13} />}>
          Retry Order
        </NeonButton>
      </div>
    );
  }

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
              src={orderData.qrCodeUrl}
              alt="SePay VietQR Code"
              className="w-44 h-44 object-contain rounded-lg"
              loading="eager"
            />
          </div>
          <span className="text-[11px] font-medium" style={{ color: "#00D4FF99" }}>
            {t("desktop.paymentPage.sepay.qrInstruction")}
          </span>
        </div>

        {/* Transfer Information list from API */}
        <div className="flex flex-col gap-2.5 text-xs">
          {/* Bank Name */}
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
              {orderData.bankName}
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
                {orderData.accountNumber}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(orderData.accountNumber, "account")
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
              {orderData.accountName}
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
                {Utils.convert.currency(orderData.amount, "vi")}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(orderData.amount.toString(), "amount")
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
                {orderData.orderCode}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(orderData.orderCode, "code")}
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

      {/* Polling Status Indicator: PENDING / COMPLETED / FAILED / REFUNDED */}
      {orderStatus === "COMPLETED" ? (
        <div
          className="flex items-center justify-center gap-2 text-xs p-3 rounded-lg bg-[#00FF8814] border border-[#00FF8840] text-[#00ff88]"
        >
          <Check size={16} className="text-[#00ff88]" />
          <span className="font-bold">
            Payment COMPLETED successfully! Redirecting...
          </span>
        </div>
      ) : orderStatus === "FAILED" ? (
        <div
          className="flex items-center justify-center gap-2 text-xs p-3 rounded-lg bg-neon-pink/10 border border-neon-pink/40 text-neon-pink"
        >
          <AlertCircle size={16} />
          <span className="font-bold">
            Payment FAILED. Please try again or contact support.
          </span>
        </div>
      ) : orderStatus === "REFUNDED" ? (
        <div
          className="flex items-center justify-center gap-2 text-xs p-3 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400"
        >
          <RotateCcw size={16} />
          <span className="font-bold">
            Payment has been REFUNDED.
          </span>
        </div>
      ) : (
        <div
          className="flex items-center justify-center gap-2 text-xs p-3 rounded-lg bg-[#00D4FF0F] border border-[#00D4FF26] text-[#E8E8FF8C]"
        >
          <LoaderCircle size={14} className="animate-spin text-[#00d4ff]" />
          <span>
            {t("desktop.paymentPage.sepay.waitingForSignal", {
              defaultValue: "Waiting for transfer (polling every 3s)...",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
