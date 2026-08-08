import {
  AtSign,
  Check,
  CircleCheck,
  CircleUser,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LogIn,
  ShieldAlert,
  UserRoundPlus,
  X,
} from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthService } from "../api/authApi";
import { useAuthStore } from "../shared/store/useAuthStore";
import CentrixGLogo from "../assets/centrix-logo.png";
import MainLayout from "../components/MainLayout";
import NeonButton from "../components/neon/NeonButton";

type SignInFormType = { email: string; password: string };
type SignUpFormType = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function NeonInput({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  startIcon,
  hasPasswordToggle,
  preventCopyCut = false,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  startIcon?: ReactNode;
  hasPasswordToggle?: boolean;
  preventCopyCut?: boolean;
}) {
  const [showPw, setShowPw] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-semibold text-xs uppercase tracking-wider"
        style={{ color: "#00D4FFB2" }}
      >
        {label}
      </label>
      <div className="relative">
        {startIcon && (
          <span
            className="top-1/2 left-3 absolute -translate-y-1/2"
            style={{ color: "#00D4FF73" }}
          >
            {startIcon}
          </span>
        )}
        <input
          id={id}
          name={id}
          type={hasPasswordToggle ? (showPw ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onCopy={preventCopyCut ? (e) => e.preventDefault() : undefined}
          onCut={preventCopyCut ? (e) => e.preventDefault() : undefined}
          onContextMenu={preventCopyCut ? (e) => e.preventDefault() : undefined}
          className="py-2.5 pr-10 pl-9 rounded-lg outline-none w-full text-[var(--system-color-mist-lavender)] text-sm transition-all placeholder-[#E8E8FF40]"
          style={{
            background: "#00D4FF0D",
            border: "1px solid #00D4FF26",
            userSelect: preventCopyCut ? "none" : "auto",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#00D4FF73";
            e.currentTarget.style.boxShadow = "0 0 16px #00D4FF14";
            e.currentTarget.style.background = "#00D4FF14";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#00D4FF26";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.background = "#00D4FF0D";
          }}
        />
        {hasPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="top-1/2 right-3 absolute hover:text-[#00d4ff] transition-colors -translate-y-1/2"
            style={{ color: "#00D4FF66" }}
          >
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function PasswordStrengthChecker({ password }: { password: string }) {
  const { t } = useTranslation();

  const lengthValid = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const criteriaCount =
    (lengthValid ? 1 : 0) +
    (hasUpper ? 1 : 0) +
    (hasLower ? 1 : 0) +
    (hasNumber ? 1 : 0);

  const getStrengthConfig = () => {
    if (!password) return { percent: 0, color: "#374151", text: "" };
    if (criteriaCount <= 1) return { percent: 25, color: "#EF4444", text: t("auth.register.pwWeak") };
    if (criteriaCount === 2) return { percent: 50, color: "#F59E0B", text: t("auth.register.pwFair") };
    if (criteriaCount === 3) return { percent: 75, color: "#06B6D4", text: t("auth.register.pwGood") };
    return { percent: 100, color: "#10B981", text: t("auth.register.pwStrong") };
  };

  const strength = getStrengthConfig();

  const rules = [
    { label: t("auth.register.pwLengthRule"), valid: lengthValid },
    { label: t("auth.register.pwUpperRule"), valid: hasUpper },
    { label: t("auth.register.pwLowerRule"), valid: hasLower },
    { label: t("auth.register.pwNumberRule"), valid: hasNumber },
  ];

  return (
    <div
      className="p-3.5 rounded-xl flex flex-col gap-2.5 transition-all text-xs"
      style={{
        background: "#00D4FF0A",
        border: "1px solid #00D4FF1F",
      }}
    >
      {/* Header & Strength badge */}
      <div className="flex items-center justify-between font-semibold">
        <span className="flex items-center gap-1.5 text-text-primary/80">
          <ShieldAlert size={14} className="text-neon-cyan" />
          {t("auth.register.pwRequirements")}
        </span>
        {password && (
          <span
            className="font-bold tracking-wide uppercase px-2 py-0.5 rounded text-[10px]"
            style={{ color: strength.color, background: `${strength.color}1F` }}
          >
            {strength.text}
          </span>
        )}
      </div>

      {/* Strength Bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#00D4FF0D]">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${strength.percent}%`,
            background: strength.color,
            boxShadow: strength.percent > 0 ? `0 0 10px ${strength.color}80` : "none",
          }}
        />
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="flex items-center gap-1.5 transition-colors text-[11px]"
            style={{
              color: rule.valid ? "#10B981" : password ? "#EF4444A6" : "#E8E8FF66",
            }}
          >
            {rule.valid ? (
              <Check size={12} className="shrink-0 text-emerald-400" />
            ) : (
              <X size={12} className="shrink-0 text-red-400/60" />
            )}
            <span className="truncate">{rule.label}</span>
          </div>
        ))}
      </div>

      {/* Copy Prevention Note */}
      <div className="pt-1 text-[10px] text-text-primary/50 border-t border-[#00D4FF14]">
        {t("auth.register.pwNoCopyNote")}
      </div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: "#00D4FF1A" }} />
      <span className="text-xs" style={{ color: "#E8E8FF4C" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "#00D4FF1A" }} />
    </div>
  );
}

function SignInForm({
  onSwitch,
  onSubmit,
  isSubmitting,
}: {
  onSwitch?: () => void;
  onSubmit?: (v: SignInFormType) => void;
  isSubmitting?: boolean;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<SignInFormType>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(form);
      }}
      className="flex flex-col gap-4"
    >
      <NeonInput
        label={t("auth.login.identityLabel")}
        id="email"
        type="text"
        value={form.email}
        onChange={handleChange}
        placeholder={t("auth.login.emailPlaceholder")}
        startIcon={<AtSign size={14} />}
      />
      <NeonInput
        label={t("auth.login.passwordLabel")}
        id="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder={t("auth.login.passwordPlaceholder")}
        startIcon={<KeyRound size={14} />}
        hasPasswordToggle
      />

      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="font-medium text-xs transition-colors hover:text-neon-cyan"
          style={{ color: "#00D4FF99" }}
        >
          {t("auth.login.forgotPassword")}
        </Link>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <NeonButton
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <LogIn size={15} />
            )
          }
        >
          {isSubmitting ? t("auth.signingIn") : t("auth.login.title")}
        </NeonButton>
        <Divider label={t("auth.or")} />
        <NeonButton
          type="button"
          variant="ghost"
          fullWidth
          startIcon={<UserRoundPlus size={15} />}
          onClick={onSwitch}
          disabled={isSubmitting}
        >
          {t("auth.login.btnGoToRegister")}
        </NeonButton>
      </div>
    </form>
  );
}

function SignUpForm({
  onSwitch,
  onSubmit,
  isSubmitting,
}: {
  onSwitch?: () => void;
  onSubmit?: (v: SignUpFormType) => void;
  isSubmitting?: boolean;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<SignUpFormType>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(form);
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NeonInput
          label={t("auth.register.displayNameLabel")}
          id="username"
          value={form.username}
          onChange={handleChange}
          placeholder={t("auth.register.displayNamePlaceholder")}
          startIcon={<CircleUser size={14} />}
        />
        <NeonInput
          label={t("auth.register.emailLabel")}
          id="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder={t("auth.register.emailPlaceholder")}
          startIcon={<AtSign size={14} />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NeonInput
          label={t("auth.register.passwordLabel")}
          id="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder={t("auth.register.passwordPlaceholder")}
          startIcon={<KeyRound size={14} />}
          hasPasswordToggle
          preventCopyCut
        />
        <NeonInput
          label={t("auth.register.confirmPasswordLabel")}
          id="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder={t("auth.register.confirmPasswordPlaceholder")}
          startIcon={<CircleCheck size={14} />}
          hasPasswordToggle
          preventCopyCut
        />
      </div>

      {/* Password Strength Meter & Checklist */}
      <PasswordStrengthChecker password={form.password} />

      <div className="flex flex-col gap-3 mt-1">
        <NeonButton
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <UserRoundPlus size={15} />
            )
          }
        >
          {isSubmitting ? t("auth.creatingAccount") : t("auth.register.btnSubmit")}
        </NeonButton>
        <Divider label={t("auth.or")} />
        <NeonButton
          type="button"
          variant="ghost"
          fullWidth
          onClick={onSwitch}
          disabled={isSubmitting}
        >
          {t("auth.register.btnGoToLogin")}
        </NeonButton>
      </div>
    </form>
  );
}

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [formName, setFormName] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification State after Register
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const redirectPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  const { login: storeLogin, register: storeRegister, verifyCode: storeVerifyCode, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated || AuthService.isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const getErrorMessage = (error: unknown) => {
    if (typeof error === "string" && error.trim()) return error.trim();
    if (error && typeof error === "object" && "message" in error) {
      const msg = (error as { message: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    }
    return t("auth.serverErrorMsg");
  };

  const handleSignInSubmit = async (values: SignInFormType) => {
    setIsSubmitting(true);

    try {
      const session = await storeLogin({
        email: values.email.trim(),
        password: values.password,
      });

      toast.success(
        t("auth.loginSuccess", {
          username: session.user?.username || values.email.trim(),
          defaultValue: `Welcome back, ${session.user?.username || "Player"}!`,
        })
      );
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (values: SignUpFormType) => {
    const password = values.password;
    const lengthValid = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!lengthValid || !hasUpper || !hasLower || !hasNumber) {
      toast.error(t("auth.passwordInvalidRule"));
      return;
    }

    if (values.password !== values.confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await storeRegister({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });

      const registeredEmail = values.email.trim();
      localStorage.setItem("pendingVerifyEmail", registeredEmail);

      toast.success(
        res?.message || t("auth.registerSuccess")
      );

      navigate("/verify-email", {
        state: { email: registeredEmail, from: (location.state as { from?: unknown })?.from },
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (!pendingVerifyEmail || code.length < 6) return;

    setIsSubmitting(true);

    try {
      const session = await storeVerifyCode({
        email: pendingVerifyEmail,
        code,
      });

      toast.success(
        t("auth.verifySuccess", {
          username: session.user?.username || pendingVerifyEmail,
        })
      );
      setPendingVerifyEmail(null);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center min-h-[60vh] py-6">
        <div
          className={`w-full ${
            formName === "signUp" ? "max-w-lg" : "max-w-md"
          } transition-all duration-300 animate-fade-in-up`}
        >
          {/* Card */}
          <div
            className="relative p-6 sm:p-8 rounded-2xl overflow-hidden"
            style={{
              background: "#08081CCC",
              border: "1px solid #00D4FF26",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 64px #00000099, 0 0 0 1px #00D4FF0D",
            }}
          >
            {/* Top glow */}
            <div
              className="top-0 left-1/2 absolute w-64 h-px -translate-x-1/2 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #00D4FF99, transparent)",
              }}
            />
            {/* Purple ambient */}
            <div
              className="right-0 bottom-0 absolute w-48 h-48 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, #7B2FBE1F, transparent 70%)",
                filter: "blur(20px)",
              }}
            />

            <div className="z-10 relative">
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <div
                  className="flex justify-center items-center mb-3 rounded-xl w-14 h-14"
                  style={{
                    background: "#00D4FF14",
                    border: "1px solid #00D4FF33",
                  }}
                >
                  <img
                    src={CentrixGLogo}
                    alt="logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>

                {/* Tabs (Hidden during OTP verification) */}
                {!pendingVerifyEmail && (
                  <div
                    className="flex p-0.5 rounded-lg w-full"
                    style={{
                      background: "#00D4FF0D",
                      border: "1px solid #00D4FF1A",
                    }}
                  >
                    {(["signIn", "signUp"] as const).map((tab) => {
                      const active = formName === tab;
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => !isSubmitting && setFormName(tab)}
                          disabled={isSubmitting}
                          className="flex-1 py-1.5 rounded-md font-semibold text-sm transition-all duration-200"
                          style={
                            active
                              ? {
                                  background: "#00D4FF1F",
                                  color: "#00d4ff",
                                  boxShadow: "0 0 12px #00D4FF26",
                                  border: "1px solid #00D4FF40",
                                }
                              : { color: "#E8E8FF73" }
                          }
                        >
                          {tab === "signIn" ? t("auth.login.title") : t("auth.register.title")}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {pendingVerifyEmail ? (
                /* OTP Verification Form */
                <form onSubmit={handleVerifyCodeSubmit} className="flex flex-col gap-5">
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-text-primary">Confirm Email Code</h3>
                    <p className="mt-1 text-xs text-text-primary/65">
                      Enter the 6-digit code sent to <span className="text-neon-cyan font-semibold">{pendingVerifyEmail}</span>
                    </p>
                  </div>

                  <div className="flex justify-center items-center gap-2 my-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-11 h-12 rounded-xl border border-neon-cyan/30 bg-bg-dark/90 text-center font-mono text-xl font-bold text-neon-cyan focus:border-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-cyan/40"
                      />
                    ))}
                  </div>

                  <NeonButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={otpDigits.join("").length < 6 || isSubmitting}
                  >
                    {isSubmitting ? "Verifying..." : "Verify & Sign In"}
                  </NeonButton>

                  <button
                    type="button"
                    onClick={() => setPendingVerifyEmail(null)}
                    className="text-xs text-text-primary/60 hover:text-neon-cyan transition-colors text-center"
                  >
                    ← Back to Registration
                  </button>
                </form>
              ) : formName === "signIn" ? (
                <SignInForm
                  onSwitch={() => setFormName("signUp")}
                  onSubmit={handleSignInSubmit}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <SignUpForm
                  onSwitch={() => setFormName("signIn")}
                  onSubmit={handleSignUpSubmit}
                  isSubmitting={isSubmitting}
                />
              )}

              <p
                className="mt-6 text-xs text-center"
                style={{ color: "#E8E8FF4C" }}
              >
                {t("auth.legalText")}{" "}
                <Link
                  to="#"
                  className="hover:text-[#00d4ff] underline transition-colors"
                >
                  {t("auth.terms")}
                </Link>{" "}
                {t("auth.and")}{" "}
                <Link
                  to="#"
                  className="hover:text-[#00d4ff] underline transition-colors"
                >
                  {t("auth.privacy")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
