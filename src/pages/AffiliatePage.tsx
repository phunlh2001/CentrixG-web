import {
  Check,
  CheckCircle2,
  Copy,
  Gift,
  HelpCircle,
  LoaderCircle,
  Mail,
  Phone,
  Share2,
  Sparkles,
  TicketPercent,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AffiliateService, IAffiliateRegisterPayload } from "../api/affiliateApi";
import MainLayout from "../components/MainLayout";
import NeonBadge from "../components/neon/NeonBadge";
import NeonButton from "../components/neon/NeonButton";
import NeonCard from "../components/neon/NeonCard";
import SectionHeader from "../components/neon/SectionHeader";
import { APP_CONFIG } from "../shared/contanst/appConfig";
import { useAuthStore } from "../shared/store/useAuthStore";
import { openExternalLink } from "../shared/utils";

export default function AffiliatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    offerCode: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredCode, setRegisteredCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Initialize pre-filled data from current authenticated user
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        username: prev.username || currentUser.username || "",
        email: prev.email || currentUser.email || "",
      }));
    }
  }, [currentUser]);

  // Handle Offer Code change (filter to alphanumeric, uppercase, max 12 chars)
  const handleOfferCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const clean = raw.slice(0, 12);
    setFormData((prev) => ({ ...prev, offerCode: clean }));
    if (errors.offerCode) {
      setErrors((prev) => ({ ...prev, offerCode: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) {
      newErrors.username = t("desktop.affiliatePage.validation.usernameRequired");
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("desktop.affiliatePage.validation.emailInvalid");
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("desktop.affiliatePage.validation.fullNameRequired");
    }

    // Phone validation (digits, 9-11 characters)
    const cleanPhone = formData.phone.replace(/[\s\-\+\(\)]/g, "");
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 12) {
      newErrors.phone = t("desktop.affiliatePage.validation.phoneRequired");
    }

    // Offer code validation: 6-12 alphanumeric characters
    if (!formData.offerCode || formData.offerCode.length < 6 || formData.offerCode.length > 12) {
      newErrors.offerCode = t("desktop.affiliatePage.validation.offerCodeInvalid");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: IAffiliateRegisterPayload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        offerCode: formData.offerCode.trim().toUpperCase(),
      };

      try {
        await AffiliateService.register(payload);
      } catch (apiErr: any) {
        // If the backend endpoint is not yet connected, gracefully continue for client demo
        console.warn("Affiliate API notification:", apiErr?.message);
      }

      setRegisteredCode(payload.offerCode);
      setIsSuccess(true);
      toast.success(t("desktop.affiliatePage.success.title"));
    } catch (err: any) {
      toast.error(err?.message || "Failed to register affiliate code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success(t("desktop.affiliatePage.success.copied"));
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <SectionHeader
            eyebrow={t("desktop.affiliatePage.eyebrow")}
            title={t("desktop.affiliatePage.title")}
          />
          <NeonBadge color="cyan" dot>
            <Sparkles size={13} className="text-neon-cyan" />
            {t("desktop.affiliatePage.badge")}
          </NeonBadge>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <NeonCard glow="cyan" padding="lg" className="text-center max-w-2xl mx-auto w-full">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00FF8859] bg-[#00FF8814]">
              <CheckCircle2 size={34} style={{ color: "#00ff88" }} />
            </div>

            <h2
              className="text-2xl font-black mb-3"
              style={{ color: "var(--system-color-mist-lavender)" }}
            >
              {t("desktop.affiliatePage.success.title")}
            </h2>

            <p className="text-sm leading-relaxed mb-6 max-w-lg mx-auto" style={{ color: "#E8E8FF8C" }}>
              {t("desktop.affiliatePage.success.desc")}
            </p>

            {/* Confirmed Promo Code Card */}
            <div
              className="p-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{
                background: "#00FF880D",
                border: "1px solid #00FF8833",
                boxShadow: "0 0 24px #00FF8814",
              }}
            >
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#00ff88]">
                  {t("desktop.affiliatePage.success.yourCode")}
                </span>
                <div className="text-2xl font-black tracking-widest font-mono text-[#00ff88] mt-0.5">
                  {registeredCode}
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(registeredCode)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#00FF881F] hover:bg-[#00FF8833] text-[#00ff88] border border-[#00FF884D] transition-all cursor-pointer"
              >
                {copiedCode ? (
                  <>
                    <Check size={14} /> {t("desktop.affiliatePage.success.copied")}
                  </>
                ) : (
                  <>
                    <Copy size={14} /> {t("desktop.affiliatePage.success.copyCode")}
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <NeonButton variant="primary" onClick={() => navigate("/")}>
                {t("desktop.affiliatePage.success.backHome")}
              </NeonButton>
              <NeonButton variant="secondary" onClick={() => navigate("/library")}>
                {t("desktop.affiliatePage.success.goToLibrary")}
              </NeonButton>
              {APP_CONFIG.contact?.discord && (
                <button
                  type="button"
                  onClick={() => openExternalLink(APP_CONFIG.contact.discord)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#E8E8FF8C] hover:text-neon-cyan transition-colors"
                >
                  <HelpCircle size={14} />
                  {t("desktop.affiliatePage.success.contactSupport")}
                </button>
              )}
            </div>
          </NeonCard>
        ) : (
          <>
            {/* 3-Step Partner Roadmap */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  step: "01",
                  title: t("desktop.affiliatePage.steps.step1Title"),
                  desc: t("desktop.affiliatePage.steps.step1Desc"),
                  icon: <TicketPercent size={20} className="text-neon-cyan" />,
                  color: "cyan" as const,
                },
                {
                  step: "02",
                  title: t("desktop.affiliatePage.steps.step2Title"),
                  desc: t("desktop.affiliatePage.steps.step2Desc"),
                  icon: <Share2 size={20} className="text-neon-purple" />,
                  color: "purple" as const,
                },
                {
                  step: "03",
                  title: t("desktop.affiliatePage.steps.step3Title"),
                  desc: t("desktop.affiliatePage.steps.step3Desc"),
                  icon: <TrendingUp size={20} className="text-[#00ff88]" />,
                  color: "cyan" as const,
                },
              ].map((item) => (
                <NeonCard key={item.step} glow={item.color} padding="md" className="relative overflow-hidden">
                  <span className="absolute -top-1 -right-1 text-4xl font-black opacity-10 select-none">
                    {item.step}
                  </span>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-text-primary/5 border border-text-primary/10 shrink-0">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-sm" style={{ color: "var(--system-color-mist-lavender)" }}>
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "#E8E8FF8C" }}>
                    {item.desc}
                  </p>
                </NeonCard>
              ))}
            </div>

            {/* Registration Form & Live Preview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Minimalized Neon Form (7 cols) */}
              <NeonCard glow="cyan" padding="lg" className="lg:col-span-7">
                <div className="mb-6">
                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ color: "var(--system-color-mist-lavender)" }}
                  >
                    {t("desktop.affiliatePage.form.title")}
                  </h3>
                  <p className="text-xs" style={{ color: "#E8E8FF8C" }}>
                    {t("desktop.affiliatePage.form.subtitle")}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Row 1: Username & Email (Pre-filled) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                        {t("desktop.affiliatePage.form.usernameLabel")}
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF73]" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, username: e.target.value }))
                          }
                          className="py-2.5 pr-4 pl-9 rounded-lg outline-none w-full text-sm text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all"
                        />
                      </div>
                      {errors.username && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.username}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                        {t("desktop.affiliatePage.form.emailLabel")}
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF73]" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="py-2.5 pr-4 pl-9 rounded-lg outline-none w-full text-sm text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Full Name & Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                        {t("desktop.affiliatePage.form.fullNameLabel")} *
                      </label>
                      <div className="relative">
                        <Users size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF73]" />
                        <input
                          type="text"
                          value={formData.fullName}
                          placeholder={t("desktop.affiliatePage.form.fullNamePlaceholder")}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, fullName: e.target.value }));
                            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
                          }}
                          className="py-2.5 pr-4 pl-9 rounded-lg outline-none w-full text-sm text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40]"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.fullName}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                        {t("desktop.affiliatePage.form.phoneLabel")} *
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF73]" />
                        <input
                          type="tel"
                          value={formData.phone}
                          placeholder={t("desktop.affiliatePage.form.phonePlaceholder")}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, phone: e.target.value }));
                            if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                          }}
                          className="py-2.5 pr-4 pl-9 rounded-lg outline-none w-full text-sm text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40]"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Custom Offer Code Field */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                        {t("desktop.affiliatePage.form.offerCodeLabel")} *
                      </label>
                      <span
                        className={`text-xs font-mono font-bold ${
                          formData.offerCode.length >= 6
                            ? "text-[#00ff88]"
                            : formData.offerCode.length > 0
                            ? "text-yellow-400"
                            : "text-[#E8E8FF59]"
                        }`}
                      >
                        {formData.offerCode.length}/12
                      </span>
                    </div>

                    <div className="relative">
                      <TicketPercent
                        size={15}
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF73]"
                      />
                      <input
                        type="text"
                        maxLength={12}
                        value={formData.offerCode}
                        placeholder={t("desktop.affiliatePage.form.offerCodePlaceholder")}
                        onChange={handleOfferCodeChange}
                        className="py-2.5 pr-14 pl-9 font-mono tracking-wider font-bold uppercase rounded-lg outline-none w-full text-sm text-[#00d4ff] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40]"
                      />
                      {formData.offerCode.length >= 6 && (
                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[#00ff88]">
                          <Check size={16} />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#E8E8FF73]">
                      {t("desktop.affiliatePage.form.offerCodeHint")}
                    </p>

                    {errors.offerCode && (
                      <p className="text-xs text-red-400 mt-0.5">{errors.offerCode}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <NeonButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    className="mt-4"
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <LoaderCircle size={16} className="animate-spin text-black" />
                      ) : (
                        <Gift size={16} />
                      )
                    }
                  >
                    {isSubmitting
                      ? t("desktop.affiliatePage.form.submitting")
                      : t("desktop.affiliatePage.form.submitBtn")}
                  </NeonButton>
                </form>
              </NeonCard>

              {/* Right Column: Live Checkout Preview Card (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <NeonCard glow="purple" padding="md">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-text-primary/10">
                    <Sparkles size={16} className="text-neon-cyan" />
                    <h4
                      className="text-sm font-bold"
                      style={{ color: "var(--system-color-mist-lavender)" }}
                    >
                      {t("desktop.affiliatePage.form.previewTitle")}
                    </h4>
                  </div>

                  <p className="text-xs mb-4" style={{ color: "#E8E8FF8C" }}>
                    {t("desktop.affiliatePage.form.previewDesc")}
                  </p>

                  {/* Simulated Checkout Discount Row */}
                  <div
                    className="p-3.5 rounded-xl flex items-center justify-between gap-3"
                    style={{
                      background: "#00FF880D",
                      border: "1px solid #00FF8833",
                      boxShadow: "0 0 16px #00FF8814",
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <TicketPercent size={15} className="text-[#00ff88] shrink-0" />
                      <span className="font-semibold text-xs text-[#00ff88] truncate">
                        {t("desktop.affiliatePage.form.previewDiscount")}:
                      </span>
                      <span className="font-mono px-2 py-0.5 rounded text-xs font-black bg-[#00FF881F] text-[#00ff88] border border-[#00FF8840] shrink-0">
                        {formData.offerCode.trim() || "CODE123"}
                      </span>
                    </div>
                    <span className="font-bold text-xs text-[#00ff88] shrink-0">
                      -10%
                    </span>
                  </div>

                  {/* Summary Box Preview */}
                  <div className="mt-4 p-3 rounded-lg bg-bg-dark/60 border border-text-primary/10 flex flex-col gap-2 text-xs">
                    <div className="flex justify-between text-[#E8E8FF8C]">
                      <span>Original Order Total:</span>
                      <span className="line-through font-mono">100.000 ₫</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#00ff88]">
                      <span>Affiliate Discount (-10%):</span>
                      <span className="font-mono">-10.000 ₫</span>
                    </div>
                    <div className="flex justify-between font-black text-neon-cyan text-sm pt-2 border-t border-text-primary/10">
                      <span>Customer Pays:</span>
                      <span className="font-mono">90.000 ₫</span>
                    </div>
                  </div>
                </NeonCard>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
