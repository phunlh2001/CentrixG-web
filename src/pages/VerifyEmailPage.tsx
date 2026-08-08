import {
  ArrowLeft,
  CheckCircle2,
  MailCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MainLayout from "../components/MainLayout";
import NeonButton from "../components/neon/NeonButton";
import NeonCard from "../components/neon/NeonCard";
import SectionHeader from "../components/neon/SectionHeader";

import { useAuthStore } from "../shared/store/useAuthStore";

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyCode: storeVerifyCode } = useAuthStore();

  // Retrieve email and target redirect path from location state or search params / localStorage
  const stateEmail = (location.state as { email?: string; from?: { pathname?: string } })?.email || "";
  const redirectPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  const [email, setEmail] = useState<string>(() => {
    return stateEmail || localStorage.getItem("pendingVerifyEmail") || "";
  });

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Resend Timer State
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setTimerActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, resendTimer]);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResendCode = () => {
    setResendTimer(60);
    setTimerActive(true);
    toast.info(t("desktop.verifyEmailPage.resendBtn"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (!email || code.length < 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await storeVerifyCode({ email, code });
      setIsVerified(true);
      localStorage.removeItem("pendingVerifyEmail");
      toast.success(
        t("auth.verifySuccess", {
          username: session.user?.username || email,
          defaultValue: `Account verified. Welcome, ${session.user?.username || "Player"}!`,
        })
      );
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1500);
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string"
          ? (error as { message: string }).message
          : t("auth.serverErrorMsg");
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-lg mx-auto py-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <SectionHeader
            eyebrow={t("desktop.verifyEmailPage.eyebrow")}
            title={t("desktop.verifyEmailPage.title")}
          />
          <p className="mt-2 text-sm text-text-primary/70 leading-relaxed">
            {t("desktop.verifyEmailPage.subtitle", { email: email || "your email" })}
          </p>
        </div>

        {isVerified ? (
          <NeonCard glow="cyan" padding="lg" className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_24px_#10B98140]">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-text-primary">
              {t("desktop.verifyEmailPage.successTitle")}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs text-text-primary/70">
              {t("desktop.verifyEmailPage.successDesc")}
            </p>
          </NeonCard>
        ) : (
          <NeonCard glow="cyan" padding="lg">
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan shadow-[0_0_20px_#00D4FF33]">
                  <MailCheck size={26} />
                </div>
                <label className="text-xs font-semibold text-text-primary/80 uppercase tracking-wider">
                  {t("desktop.verifyEmailPage.codeLabel")}
                </label>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Email Input fallback if missing */}
                {!email && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-primary/80">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@domain.com"
                      className="w-full rounded-xl border border-neon-cyan/20 bg-bg-dark/80 py-2.5 px-4 text-sm text-text-primary placeholder:text-text-primary/35 focus:border-neon-cyan focus:outline-none"
                    />
                  </div>
                )}

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center items-center gap-2.5 sm:gap-3">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-neon-cyan/30 bg-bg-dark/90 text-center font-mono text-xl font-black text-neon-cyan shadow-inner focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all"
                    />
                  ))}
                </div>

                {/* Resend Timer & Actions */}
                <div className="flex items-center justify-between text-xs px-1">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-1 text-text-primary/60 hover:text-neon-cyan transition-colors"
                  >
                    <ArrowLeft size={12} />
                    {t("desktop.verifyEmailPage.changeEmail")}
                  </Link>

                  {timerActive ? (
                    <span className="text-text-primary/60">
                      {t("desktop.verifyEmailPage.resendTimer", { time: resendTimer })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="flex items-center gap-1 font-bold text-neon-cyan hover:underline"
                    >
                      <RotateCcw size={12} />
                      {t("desktop.verifyEmailPage.resendBtn")}
                    </button>
                  )}
                </div>

                <NeonButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={digits.join("").length < 6 || isSubmitting}
                  startIcon={<ShieldCheck size={17} />}
                >
                  {isSubmitting
                    ? t("desktop.verifyEmailPage.verifying")
                    : t("desktop.verifyEmailPage.verifyBtn")}
                </NeonButton>
              </form>
            </div>
          </NeonCard>
        )}
      </div>
    </MainLayout>
  );
}
