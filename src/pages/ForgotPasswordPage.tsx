import {
  ArrowLeft,
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  MailCheck,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import NeonButton from "../components/neon/NeonButton";
import NeonCard from "../components/neon/NeonCard";
import SectionHeader from "../components/neon/SectionHeader";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Wizard Step State: 1 = Email, 2 = OTP Code, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // OTP Timer State
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // OTP Input Refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password Strength Calculator
  const calculatePasswordStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "", color: "bg-gray-700" };
    let score = 0;
    if (pw.length >= 8) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: "Weak", color: "bg-neon-pink" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-amber-400" };
      case 3:
        return { score: 75, label: "Good", color: "bg-cyan-400" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-emerald-400" };
      default:
        return { score: 10, label: "Weak", color: "bg-neon-pink" };
    }
  };

  const pwStrength = calculatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  // Countdown timer effect for Step 2
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
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

  // Handle Step 1 Submit (Send Code)
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStep(2);
    setResendTimer(60);
    setTimerActive(true);
  };

  // OTP Digit Change Handler
  const handleOtpChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Auto advance focus
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP Keydown Handler (Backspace)
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // OTP Paste Handler
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = Array(6).fill("");
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    const targetIndex = Math.min(pastedData.length, 5);
    otpInputRefs.current[targetIndex]?.focus();
  };

  // Handle Resend Code
  const handleResendCode = () => {
    setResendTimer(60);
    setTimerActive(true);
  };

  // Handle Step 2 Submit (Verify OTP)
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpDigits.join("").length < 6) return;
    setStep(3);
  };

  // Handle Step 3 Submit (Reset Password)
  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !passwordsMatch) return;
    setStep(4);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 max-w-xl mx-auto py-6 animate-fade-in-up">
        {/* Header */}
        <div className="text-center">
          <SectionHeader
            eyebrow={t("desktop.forgotPasswordPage.eyebrow")}
            title={t("desktop.forgotPasswordPage.title")}
          />
          <p className="mt-2 text-sm text-text-primary/70">
            {t("desktop.forgotPasswordPage.subtitle")}
          </p>
        </div>

        {/* Step Progress Bar (Hidden if Success) */}
        {step <= 3 && (
          <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-neon-cyan/15 bg-bg-dark/60 backdrop-blur-md">
            {[
              { num: 1, label: t("desktop.forgotPasswordPage.step1Title") },
              { num: 2, label: t("desktop.forgotPasswordPage.step2Title") },
              { num: 3, label: t("desktop.forgotPasswordPage.step3Title") },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      step === s.num
                        ? "bg-neon-cyan text-bg-dark shadow-[0_0_12px_#00D4FF80]"
                        : step > s.num
                        ? "bg-emerald-500 text-bg-dark"
                        : "bg-text-primary/10 text-text-primary/40"
                    }`}
                  >
                    {step > s.num ? <CheckCircle2 size={14} /> : s.num}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-medium ${
                      step === s.num
                        ? "text-neon-cyan font-bold"
                        : step > s.num
                        ? "text-emerald-400"
                        : "text-text-primary/40"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    className={`flex-1 h-0.5 rounded transition-all ${
                      step > idx + 1 ? "bg-emerald-500/60" : "bg-text-primary/10"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Step 1: Input Email */}
        {step === 1 && (
          <NeonCard glow="cyan" padding="lg">
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {t("desktop.forgotPasswordPage.step1Title")}
                </h3>
                <p className="mt-1 text-xs text-text-primary/65">
                  {t("desktop.forgotPasswordPage.step1Desc")}
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-text-primary/80">
                    {t("desktop.forgotPasswordPage.emailLabel")}
                  </label>
                  <div className="relative">
                    <AtSign
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neon-cyan/60"
                    />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("desktop.forgotPasswordPage.emailPlaceholder")}
                      className="w-full rounded-xl border border-neon-cyan/20 bg-bg-dark/80 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-primary/35 focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20"
                    />
                  </div>
                </div>

                <NeonButton type="submit" variant="primary" size="lg" fullWidth>
                  {t("desktop.forgotPasswordPage.sendCode")}
                </NeonButton>
              </form>

              <div className="pt-2 text-center border-t border-text-primary/10">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 text-xs text-neon-cyan/80 hover:text-neon-cyan transition-colors"
                >
                  <ArrowLeft size={13} />
                  {t("desktop.forgotPasswordPage.backToLogin")}
                </Link>
              </div>
            </div>
          </NeonCard>
        )}

        {/* Step 2: 6-Digit OTP Code Verification */}
        {step === 2 && (
          <NeonCard glow="cyan" padding="lg">
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan shadow-[0_0_16px_#00D4FF33]">
                  <MailCheck size={22} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">
                  {t("desktop.forgotPasswordPage.step2Title")}
                </h3>
                <p className="mt-1 text-xs text-text-primary/65">
                  {t("desktop.forgotPasswordPage.step2Desc", { email })}
                </p>
              </div>

              <form onSubmit={handleStep2Submit} className="flex flex-col gap-6">
                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center items-center gap-2.5 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="h-12 w-10 sm:h-14 sm:w-12 rounded-xl border border-neon-cyan/30 bg-bg-dark/90 text-center font-mono text-xl font-black text-neon-cyan shadow-inner focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/40 transition-all"
                    />
                  ))}
                </div>

                {/* Resend Timer & Actions */}
                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-text-primary/60 hover:text-neon-cyan transition-colors"
                  >
                    ← {t("desktop.forgotPasswordPage.changeEmail")}
                  </button>

                  {timerActive ? (
                    <span className="text-text-primary/60">
                      {t("desktop.forgotPasswordPage.resendTimer", { time: resendTimer })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="flex items-center gap-1 font-bold text-neon-cyan hover:underline"
                    >
                      <RotateCcw size={12} />
                      {t("desktop.forgotPasswordPage.resendBtn")}
                    </button>
                  )}
                </div>

                <NeonButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={otpDigits.join("").length < 6}
                >
                  {t("desktop.forgotPasswordPage.verifyCode")}
                </NeonButton>
              </form>
            </div>
          </NeonCard>
        )}

        {/* Step 3: Renew Password */}
        {step === 3 && (
          <NeonCard glow="purple" padding="lg">
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  {t("desktop.forgotPasswordPage.step3Title")}
                </h3>
                <p className="mt-1 text-xs text-text-primary/65">
                  {t("desktop.forgotPasswordPage.step3Desc")}
                </p>
              </div>

              <form onSubmit={handleStep3Submit} className="flex flex-col gap-5">
                {/* New Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newPassword" className="text-xs font-semibold text-text-primary/80">
                    {t("desktop.forgotPasswordPage.newPasswordLabel")}
                  </label>
                  <div className="relative">
                    <KeyRound
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neon-cyan/60"
                    />
                    <input
                      id="newPassword"
                      type={showNewPw ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("desktop.forgotPasswordPage.newPasswordPlaceholder")}
                      className="w-full rounded-xl border border-neon-cyan/20 bg-bg-dark/80 py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-primary/35 focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-primary/40 hover:text-neon-cyan transition-colors"
                    >
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword.length > 0 && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-text-primary/60">Strength</span>
                        <span className="font-bold text-text-primary">{pwStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-text-primary/10 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${pwStrength.color}`}
                          style={{ width: `${pwStrength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="text-xs font-semibold text-text-primary/80"
                  >
                    {t("desktop.forgotPasswordPage.confirmPasswordLabel")}
                  </label>
                  <div className="relative">
                    <ShieldCheck
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neon-cyan/60"
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPw ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("desktop.forgotPasswordPage.confirmPasswordPlaceholder")}
                      className={`w-full rounded-xl border bg-bg-dark/80 py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder:text-text-primary/35 focus:outline-none focus:ring-2 transition-all ${
                        passwordsMismatch
                          ? "border-neon-pink focus:border-neon-pink focus:ring-neon-pink/20"
                          : passwordsMatch
                          ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                          : "border-neon-cyan/20 focus:border-neon-cyan focus:ring-neon-cyan/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-primary/40 hover:text-neon-cyan transition-colors"
                    >
                      {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {passwordsMismatch && (
                    <span className="text-[11px] font-medium text-neon-pink">
                      {t("desktop.forgotPasswordPage.passwordMismatch")}
                    </span>
                  )}
                  {passwordsMatch && (
                    <span className="text-[11px] font-medium text-emerald-400">
                      {t("desktop.forgotPasswordPage.passwordMatch")}
                    </span>
                  )}
                </div>

                <NeonButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!newPassword || !passwordsMatch}
                >
                  {t("desktop.forgotPasswordPage.resetPasswordBtn")}
                </NeonButton>
              </form>
            </div>
          </NeonCard>
        )}

        {/* Step 4: Success State */}
        {step === 4 && (
          <NeonCard glow="cyan" padding="lg" className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_24px_#10B98140]">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-text-primary">
              {t("desktop.forgotPasswordPage.successTitle")}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-text-primary/70">
              {t("desktop.forgotPasswordPage.successDesc")}
            </p>
            <div className="mt-6">
              <NeonButton
                variant="primary"
                size="lg"
                onClick={() => navigate("/auth")}
                startIcon={<Lock size={15} />}
              >
                {t("desktop.forgotPasswordPage.backToLogin")}
              </NeonButton>
            </div>
          </NeonCard>
        )}
      </div>
    </MainLayout>
  );
}
