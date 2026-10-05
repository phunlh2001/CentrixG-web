import {
  Award,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Gift,
  Globe,
  HelpCircle,
  Link as LinkIcon,
  LoaderCircle,
  Lock,
  Mail,
  Megaphone,
  MessageSquare,
  Phone,
  Plus,
  Radio,
  Share2,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Trash2,
  TrendingUp,
  Tv,
  User,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  AffiliateService,
  IAffiliateApplyPayload,
  IAffiliateMeResponse,
  ISocialChannel,
} from "../api/affiliateApi";
import { AuthService } from "../api/authApi";
import CentrixMascot from "../assets/centrixg-removebg.png";
import CentrixLogo from "../assets/centrix-logo.png";
import MainLayout from "../components/MainLayout";
import NeonBadge from "../components/neon/NeonBadge";
import NeonButton from "../components/neon/NeonButton";
import NeonCard from "../components/neon/NeonCard";
import SectionHeader from "../components/neon/SectionHeader";
import { APP_CONFIG } from "../shared/contanst/appConfig";
import { useAuthStore } from "../shared/store/useAuthStore";
import { openExternalLink } from "../shared/utils";

const PLATFORM_NAME_MAP: Record<string, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
  instagram: "Instagram",
  discord: "Discord",
  telegram: "Telegram",
  twitch: "Twitch",
  website: "Website",
  other: "Other",
};

interface ILocalChannel {
  channel: string;
  urlOrHandle: string;
}

const CHANNEL_OPTIONS = [
  { value: "youtube", icon: <Video size={15} /> },
  { value: "tiktok", icon: <Video size={15} /> },
  { value: "facebook", icon: <Share2 size={15} /> },
  { value: "instagram", icon: <Tv size={15} /> },
  { value: "discord", icon: <MessageSquare size={15} /> },
  { value: "telegram", icon: <Radio size={15} /> },
  { value: "twitch", icon: <Tv size={15} /> },
  { value: "website", icon: <Globe size={15} /> },
  { value: "other", icon: <LinkIcon size={15} /> },
];

type PageAffiliateStatus = "LOADING" | "PENDING" | "APPROVED" | "REJECTED" | "IDLE";

export default function AffiliatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser, refreshSession } = useAuthStore();

  const [affiliateStatus, setAffiliateStatus] = useState<PageAffiliateStatus>("LOADING");
  const [affiliateData, setAffiliateData] = useState<IAffiliateMeResponse | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    offerCode: "",
    promotionPlan: "",
    pastAchievements: "",
    bankName: "",
    bankAccountNumber: "",
    bankAccountName: "",
  });

  const [channels, setChannels] = useState<ILocalChannel[]>([
    { channel: "youtube", urlOrHandle: "" },
  ]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredCode, setRegisteredCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Check authorization & fetch affiliate status on mount
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate("/auth", { state: { from: { pathname: "/affiliate" } }, replace: true });
      return;
    }

    const fetchAffiliateStatus = async () => {
      try {
        const data = await AffiliateService.getMe();
        if (data) {
          setAffiliateData(data);
          const normalized = data.status?.toUpperCase();
          if (normalized === "APPROVED") {
            setAffiliateStatus("APPROVED");
            // If user has CUSTOMER role, refresh session to sync updated SELLER role and JWT claims
            if (currentUser?.role?.toUpperCase() === "CUSTOMER") {
              refreshSession().catch(() => {});
            }
          } else if (normalized === "PENDING") {
            setAffiliateStatus("PENDING");
          } else if (normalized === "REJECTED") {
            setAffiliateStatus("REJECTED");
          } else {
            setAffiliateStatus("IDLE");
          }
        } else {
          setAffiliateStatus("IDLE");
        }
      } catch {
        setAffiliateStatus("IDLE");
      }
    };

    fetchAffiliateStatus();
  }, [navigate, currentUser?.role, refreshSession]);

  // Initialize pre-filled data from authenticated user
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        username: currentUser.username || prev.username || "",
        email: currentUser.email || prev.email || "",
      }));
    }
  }, [currentUser]);

  // Handle Offer Code change (accept min 4, max 12 alphanumeric characters, auto uppercase)
  const handleOfferCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const clean = raw.slice(0, 12);
    setFormData((prev) => ({ ...prev, offerCode: clean }));
    if (errors.offerCode) {
      setErrors((prev) => ({ ...prev, offerCode: "" }));
    }
  };

  // Channels management
  const handleAddChannel = () => {
    setChannels((prev) => [...prev, { channel: "tiktok", urlOrHandle: "" }]);
  };

  const handleRemoveChannel = (index: number) => {
    if (channels.length <= 1) return;
    setChannels((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChannelChange = (
    index: number,
    field: "channel" | "urlOrHandle",
    value: string
  ) => {
    setChannels((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    if (errors.channels) {
      setErrors((prev) => ({ ...prev, channels: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const username = formData.username || currentUser?.username || "";
    const email = formData.email || currentUser?.email || "";

    if (!username.trim()) {
      newErrors.username = t("desktop.affiliatePage.validation.usernameRequired");
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("desktop.affiliatePage.validation.emailInvalid");
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("desktop.affiliatePage.validation.fullNameRequired");
    }

    // Phone validation (digits, 9-12 characters)
    const cleanPhone = formData.phone.replace(/[\s\-\+\(\)]/g, "");
    if (!cleanPhone || cleanPhone.length < 9 || cleanPhone.length > 12) {
      newErrors.phone = t("desktop.affiliatePage.validation.phoneRequired");
    }

    // Communication channels validation (at least 1 channel with valid link/handle)
    const validChannels = channels.filter((c) => c.urlOrHandle.trim().length > 0);
    if (validChannels.length === 0) {
      newErrors.channels = t("desktop.affiliatePage.validation.channelsRequired");
    }

    // Promotion Plan validation (minimum 15 characters)
    if (!formData.promotionPlan.trim() || formData.promotionPlan.trim().length < 15) {
      newErrors.promotionPlan = t("desktop.affiliatePage.validation.promotionPlanRequired");
    }

    // Past achievements validation
    if (!formData.pastAchievements.trim()) {
      newErrors.pastAchievements = t("desktop.affiliatePage.validation.pastAchievementsRequired");
    }

    // Bank Details validation
    if (!formData.bankName.trim()) {
      newErrors.bankName = t("desktop.affiliatePage.validation.bankNameRequired");
    }

    const cleanBankAcc = formData.bankAccountNumber.replace(/\s/g, "");
    if (!cleanBankAcc || cleanBankAcc.length < 5) {
      newErrors.bankAccountNumber = t("desktop.affiliatePage.validation.bankAccountNumberRequired");
    }

    if (!formData.bankAccountName.trim()) {
      newErrors.bankAccountName = t("desktop.affiliatePage.validation.bankAccountNameRequired");
    }

    // User-provided Offer code validation: min 4, max 12 alphanumeric characters
    if (
      !formData.offerCode ||
      formData.offerCode.length < 4 ||
      formData.offerCode.length > 12
    ) {
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
      const socialChannels: ISocialChannel[] = channels
        .filter((c) => c.urlOrHandle.trim().length > 0)
        .map((c) => ({
          platform: PLATFORM_NAME_MAP[c.channel] || c.channel,
          url: c.urlOrHandle.trim(),
        }));

      const payload: IAffiliateApplyPayload = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phone.trim(),
        socialChannels,
        promotionPlan: formData.promotionPlan.trim(),
        achievements: formData.pastAchievements.trim(),
        bankName: formData.bankName.trim(),
        bankAccountNumber: formData.bankAccountNumber.trim(),
        bankAccountName: formData.bankAccountName.trim().toUpperCase(),
        offerCode: formData.offerCode.trim().toUpperCase(),
      };

      await AffiliateService.apply(payload);

      setRegisteredCode(payload.offerCode);
      setAffiliateData({
        offerCode: payload.offerCode,
        totalEarn: 0,
        status: "PENDING",
      });
      setAffiliateStatus("PENDING");
      toast.success(t("desktop.affiliatePage.success.title"));
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit affiliate application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success(t("desktop.affiliatePage.success.copied", { defaultValue: "Copied!" }));
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const displayOfferCode =
    registeredCode ||
    affiliateData?.offerCode ||
    currentUser?.offerCode ||
    formData.offerCode ||
    "PARTNER";

  if (affiliateStatus === "LOADING") {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
          <LoaderCircle size={42} className="text-neon-cyan animate-spin" />
          <p className="text-sm font-semibold text-[#E8E8FFA6]">
            {t("desktop.affiliatePage.form.submitting", { defaultValue: "Loading partner status..." })}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-10 animate-fade-in-up">
        {/* Header - shown only for normal registration form */}
        {affiliateStatus !== "APPROVED" && affiliateStatus !== "PENDING" && (
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
        )}

        {/* 1. APPROVED View: Seller Partner Dashboard */}
        {affiliateStatus === "APPROVED" && (
          <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto w-full animate-fade-in text-center">
            {/* Floating Hero Visual with ambient radial glow like NotFoundPage */}
            <div className="relative my-2">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle, #00D4FF33, #7B2FBE26, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
              <img
                src={CentrixMascot || CentrixLogo}
                alt="Centrix G Partner"
                className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 object-contain mx-auto animate-float drop-shadow-[0_0_32px_#00D4FF80]"
              />
            </div>

            {/* Title & Badge */}
            <div className="flex flex-col items-center gap-3">
              <NeonBadge color="cyan" dot>
                <Sparkles size={13} className="text-neon-cyan" />
                {t("desktop.affiliatePage.sellerDashboard.badge")}
              </NeonBadge>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
                style={{
                  color: "#00d4ff",
                  textShadow: "0 0 32px #00D4FF80",
                }}
              >
                {t("desktop.affiliatePage.sellerDashboard.title")}
              </h1>

              <p className="text-sm sm:text-base leading-relaxed max-w-2xl text-[#E8E8FFB2]">
                {t("desktop.affiliatePage.sellerDashboard.subtitle")}
              </p>
            </div>

            {/* 2-Card Hero Stats Grid (Active Offer Code & Total Commission Earnings) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full text-left">
              {/* Card 1: Active Offer Code */}
              <NeonCard glow="cyan" padding="md" className="flex flex-col justify-between gap-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neon-cyan font-bold text-xs uppercase tracking-wider">
                    <TicketPercent size={15} />
                    <span>{t("desktop.affiliatePage.sellerDashboard.activeCode")}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#00ff88] bg-[#00FF881A] border border-[#00FF8840] px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span>
                    ACTIVE
                  </span>
                </div>

                <div
                  className="p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 min-h-[64px]"
                  style={{
                    background: "#00FF880D",
                    border: "1px solid #00FF8833",
                    boxShadow: "0 0 20px #00FF8814",
                  }}
                >
                  <div className="text-xl sm:text-2xl font-mono font-black tracking-wider text-[#00ff88] drop-shadow-[0_0_12px_#00FF8880] select-all min-w-0 break-all flex-1">
                    {displayOfferCode}
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(displayOfferCode)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
                      copiedCode
                        ? "bg-[#00FF8833] text-[#00ff88] border border-[#00FF8880] shadow-[0_0_12px_#00FF8840]"
                        : "bg-[#00FF881F] hover:bg-[#00FF8833] text-[#00ff88] border border-[#00FF884D]"
                    }`}
                  >
                    {copiedCode ? (
                      <>
                        <Check size={14} className="shrink-0" />
                        <span>{t("desktop.affiliatePage.success.copied", { defaultValue: "Copied!" })}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="shrink-0" />
                        <span>{t("desktop.affiliatePage.success.copyCode", { defaultValue: "Copy Code" })}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#E8E8FF73] leading-relaxed">
                  {t("desktop.affiliatePage.sellerDashboard.activeCodeDesc")}
                </p>
              </NeonCard>

              {/* Card 2: Total Commission Earnings */}
              <NeonCard glow="purple" padding="md" className="flex flex-col justify-between gap-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neon-purple font-bold text-xs uppercase tracking-wider">
                    <Wallet size={15} />
                    <span>{t("desktop.affiliatePage.sellerDashboard.totalEarnings")}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#E8E8FFA6] bg-[#7B2FBE1A] border border-[#7B2FBE33] px-2 py-0.5 rounded-full">
                    VND
                  </span>
                </div>

                <div
                  className="p-4 rounded-xl flex items-center justify-between gap-3"
                  style={{
                    background: "#7B2FBE0F",
                    border: "1px solid #7B2FBE33",
                    boxShadow: "0 0 20px #7B2FBE14",
                  }}
                >
                  <div className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-[#00d4ff] drop-shadow-[0_0_12px_#00D4FF80]">
                    {(affiliateData?.totalEarn ?? currentUser?.totalEarn ?? 0).toLocaleString("vi-VN")} vnd
                  </div>
                  <TrendingUp size={24} className="text-[#00ff88] shrink-0" />
                </div>

                <p className="text-[11px] text-[#E8E8FF73] leading-relaxed">
                  {t("desktop.affiliatePage.sellerDashboard.totalEarningsDesc")}
                </p>
              </NeonCard>
            </div>

            {/* Active Partner Privileges Grid (3 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full text-left">
              <div className="p-3.5 rounded-xl bg-[#00D4FF08] border border-[#00D4FF1F]">
                <div className="flex items-center gap-2 mb-1.5 text-neon-cyan font-bold text-xs">
                  <Gift size={15} />
                  <h4>{t("desktop.affiliatePage.sellerDashboard.perk1Title")}</h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                  {t("desktop.affiliatePage.sellerDashboard.perk1Desc")}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#00D4FF08] border border-[#00D4FF1F]">
                <div className="flex items-center gap-2 mb-1.5 text-neon-cyan font-bold text-xs">
                  <Banknote size={15} />
                  <h4>{t("desktop.affiliatePage.sellerDashboard.perk2Title")}</h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                  {t("desktop.affiliatePage.sellerDashboard.perk2Desc")}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#00D4FF08] border border-[#00D4FF1F]">
                <div className="flex items-center gap-2 mb-1.5 text-neon-cyan font-bold text-xs">
                  <ShieldCheck size={15} />
                  <h4>{t("desktop.affiliatePage.sellerDashboard.perk3Title")}</h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                  {t("desktop.affiliatePage.sellerDashboard.perk3Desc")}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3.5 pt-2">
              <NeonButton variant="primary" size="lg" onClick={() => navigate("/")}>
                {t("desktop.affiliatePage.success.backHome")}
              </NeonButton>
              <NeonButton variant="secondary" size="lg" onClick={() => navigate("/library")}>
                {t("desktop.affiliatePage.success.goToLibrary")}
              </NeonButton>
              {APP_CONFIG.contact?.discord && (
                <button
                  type="button"
                  onClick={() => openExternalLink(APP_CONFIG.contact.discord)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-[#E8E8FFA6] hover:text-neon-cyan transition-colors bg-[#00D4FF08] border border-[#00D4FF26] hover:border-[#00D4FF59] cursor-pointer"
                >
                  <HelpCircle size={15} />
                  {t("desktop.affiliatePage.success.contactSupport")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. PENDING View: Review Notification & Verification Pipeline */}
        {affiliateStatus === "PENDING" && (
          <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto w-full animate-fade-in text-center">
            {/* Floating Hero Visual with ambient amber radial glow */}
            <div className="relative my-2">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(circle, #FFA50040, #FF550020, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
              <img
                src={CentrixMascot || CentrixLogo}
                alt="Centrix G Partner Review"
                className="relative z-10 w-40 h-40 sm:w-48 sm:h-48 object-contain mx-auto animate-float drop-shadow-[0_0_32px_#FFA50080]"
              />
            </div>

            {/* Title & Badge */}
            <div className="flex flex-col items-center gap-3">
              <NeonBadge color="amber" dot>
                <Clock size={13} className="text-amber-400" />
                {t("desktop.affiliatePage.pending.badge")}
              </NeonBadge>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-amber-400"
                style={{
                  textShadow: "0 0 32px #FFA50080",
                }}
              >
                {t("desktop.affiliatePage.pending.title")}
              </h1>

              <p className="text-sm sm:text-base leading-relaxed max-w-2xl text-[#E8E8FFB2]">
                {t("desktop.affiliatePage.pending.subtitle")}
              </p>
            </div>

            {/* 2-Card Status Grid (Submitted Code & 3-Step Verification Timeline) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full text-left">
              {/* Card 1: Submitted Offer Code */}
              <NeonCard glow="none" padding="md" className="flex flex-col justify-between gap-4 relative overflow-hidden border-[#FFA50040] shadow-[0_0_24px_#FFA50014]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <TicketPercent size={15} />
                    <span>{t("desktop.affiliatePage.pending.submittedCode")}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-[#FFA5001A] border border-[#FFA50040] px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    UNDER REVIEW
                  </span>
                </div>

                <div
                  className="p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 min-h-[64px]"
                  style={{
                    background: "#FFA5000D",
                    border: "1px solid #FFA50033",
                    boxShadow: "0 0 20px #FFA50014",
                  }}
                >
                  <div className="text-xl sm:text-2xl font-mono font-black tracking-wider text-amber-400 drop-shadow-[0_0_12px_#FFA50080] select-all min-w-0 break-all flex-1">
                    {displayOfferCode}
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(displayOfferCode)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 ${
                      copiedCode
                        ? "bg-[#FFA50033] text-amber-400 border border-[#FFA50080] shadow-[0_0_12px_#FFA50040]"
                        : "bg-[#FFA5001F] hover:bg-[#FFA50033] text-amber-400 border border-[#FFA5004D]"
                    }`}
                  >
                    {copiedCode ? (
                      <>
                        <Check size={14} className="shrink-0" />
                        <span>{t("desktop.affiliatePage.success.copied", { defaultValue: "Copied!" })}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="shrink-0" />
                        <span>{t("desktop.affiliatePage.success.copyCode", { defaultValue: "Copy Code" })}</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#E8E8FF73] leading-relaxed">
                  {t("desktop.affiliatePage.pending.reviewNote")}
                </p>
              </NeonCard>

              {/* Card 2: 3-Step Verification Pipeline */}
              <NeonCard glow="cyan" padding="md" className="flex flex-col justify-between gap-4">
                <div className="flex items-center gap-2 text-neon-cyan font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={15} />
                  <span>Application Progress</span>
                </div>

                <div className="flex flex-col gap-3 py-1">
                  {/* Step 1: Completed */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00FF8826] border border-[#00FF8866] text-[#00ff88] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={13} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F4F4F6]">{t("desktop.affiliatePage.pending.step1Title")}</div>
                      <div className="text-[11px] text-[#E8E8FF8C]">{t("desktop.affiliatePage.pending.step1Desc")}</div>
                    </div>
                  </div>

                  {/* Step 2: In Progress (Amber) */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FFA50026] border border-[#FFA50080] text-amber-400 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                      <Clock size={13} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-300">{t("desktop.affiliatePage.pending.step2Title")}</div>
                      <div className="text-[11px] text-[#E8E8FF8C]">{t("desktop.affiliatePage.pending.step2Desc")}</div>
                    </div>
                  </div>

                  {/* Step 3: Upcoming */}
                  <div className="flex items-start gap-3 opacity-60">
                    <div className="w-6 h-6 rounded-full bg-[#E8E8FF1A] border border-[#E8E8FF33] text-[#E8E8FFA6] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={13} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#E8E8FFB2]">{t("desktop.affiliatePage.pending.step3Title")}</div>
                      <div className="text-[11px] text-[#E8E8FF73]">{t("desktop.affiliatePage.pending.step3Desc")}</div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-[#E8E8FF73] pt-1 border-t border-[#00D4FF1F]">
                  Status: <span className="font-bold text-amber-400">PENDING_REVIEW</span>
                </div>
              </NeonCard>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3.5 pt-2">
              <NeonButton variant="primary" size="lg" onClick={() => navigate("/")}>
                {t("desktop.affiliatePage.pending.backHome")}
              </NeonButton>
              <NeonButton variant="secondary" size="lg" onClick={() => navigate("/library")}>
                {t("desktop.affiliatePage.pending.goToLibrary")}
              </NeonButton>
              {APP_CONFIG.contact?.discord && (
                <button
                  type="button"
                  onClick={() => openExternalLink(APP_CONFIG.contact.discord)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-[#E8E8FFA6] hover:text-neon-cyan transition-colors bg-[#00D4FF08] border border-[#00D4FF26] hover:border-[#00D4FF59] cursor-pointer"
                >
                  <HelpCircle size={15} />
                  {t("desktop.affiliatePage.pending.contactSupport")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. Normal Form View: Rendered when REJECTED or IDLE (Not yet registered or Rejected) */}
        {affiliateStatus !== "APPROVED" && affiliateStatus !== "PENDING" && (
          <>
            {/* Program Guidelines Section: What You Receive & What You Should Do */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: What You Receive */}
              <NeonCard glow="cyan" padding="md" className="relative">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neon-cyan/20">
                  <Gift size={18} className="text-neon-cyan" />
                  <h3
                    className="font-black text-base"
                    style={{ color: "var(--system-color-mist-lavender)" }}
                  >
                    {t("desktop.affiliatePage.guidelines.receiveTitle")}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3 rounded-xl bg-[#00D4FF08] border border-[#00D4FF1F]">
                    <div className="flex items-center gap-2 mb-1 text-neon-cyan font-bold text-xs">
                      <TrendingUp size={14} />
                      <h4>{t("desktop.affiliatePage.guidelines.receive1Title")}</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                      {t("desktop.affiliatePage.guidelines.receive1Desc")}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#00D4FF08] border border-[#00D4FF1F]">
                    <div className="flex items-center gap-2 mb-1 text-neon-cyan font-bold text-xs">
                      <TicketPercent size={14} />
                      <h4>{t("desktop.affiliatePage.guidelines.receive2Title")}</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                      {t("desktop.affiliatePage.guidelines.receive2Desc")}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#00D4FF08] border border-[#00D4FF1F]">
                    <div className="flex items-center gap-2 mb-1 text-neon-cyan font-bold text-xs">
                      <Wallet size={14} />
                      <h4>{t("desktop.affiliatePage.guidelines.receive3Title")}</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                      {t("desktop.affiliatePage.guidelines.receive3Desc")}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#00D4FF08] border border-[#00D4FF1F]">
                    <div className="flex items-center gap-2 mb-1 text-neon-cyan font-bold text-xs">
                      <Award size={14} />
                      <h4>{t("desktop.affiliatePage.guidelines.receive4Title")}</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                      {t("desktop.affiliatePage.guidelines.receive4Desc")}
                    </p>
                  </div>
                </div>
              </NeonCard>

              {/* Right: What You Should Do */}
              <NeonCard glow="purple" padding="md" className="relative">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#7B2FBE40]">
                  <Megaphone size={18} className="text-neon-purple" />
                  <h3
                    className="font-black text-base"
                    style={{ color: "var(--system-color-mist-lavender)" }}
                  >
                    {t("desktop.affiliatePage.guidelines.doTitle")}
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-[#7B2FBE0A] border border-[#7B2FBE26]">
                    <div className="flex items-center gap-2 mb-1 text-neon-purple font-bold text-xs">
                      <Video size={14} />
                      <h4>{t("desktop.affiliatePage.guidelines.do1Title")}</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                      {t("desktop.affiliatePage.guidelines.do1Desc")}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#7B2FBE0A] border border-[#7B2FBE26]">
                    <div className="flex items-center gap-2 mb-1 text-neon-purple font-bold text-xs">
                      <Share2 size={14} />
                      <h4>{t("desktop.affiliatePage.guidelines.do2Title")}</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                      {t("desktop.affiliatePage.guidelines.do2Desc")}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#7B2FBE0A] border border-[#7B2FBE26]">
                    <div className="flex items-center gap-2 mb-1 text-neon-purple font-bold text-xs">
                      <ShieldCheck size={14} />
                      <h4>{t("desktop.affiliatePage.guidelines.do3Title")}</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#E8E8FF8C]">
                      {t("desktop.affiliatePage.guidelines.do3Desc")}
                    </p>
                  </div>
                </div>
              </NeonCard>
            </div>

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

            {/* Full-Width Partner Registration Form Section */}
            <NeonCard glow="cyan" padding="lg" className="w-full">
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

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Section 1: Personal Info & Contact */}
                <div className="p-4 sm:p-5 rounded-xl bg-bg-dark/45 border border-text-primary/10 flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-neon-cyan flex items-center gap-1.5">
                    <User size={13} />
                    {t("desktop.affiliatePage.form.sectionContact")}
                  </span>

                  {/* Username & Email (Disabled / Locked to Account) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                          {t("desktop.affiliatePage.form.usernameLabel")}
                        </label>
                        <span className="text-[10px] text-[#E8E8FF59] font-medium flex items-center gap-1">
                          <Lock size={10} /> Locked
                        </span>
                      </div>
                      <div className="relative">
                        <User size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF4D]" />
                        <input
                          type="text"
                          value={formData.username}
                          disabled
                          readOnly
                          className="py-2.5 pr-4 pl-9 rounded-lg outline-none w-full text-sm text-[var(--system-color-mist-lavender)] opacity-60 cursor-not-allowed bg-[#00D4FF08] border border-[#00D4FF1F]"
                        />
                      </div>
                      {errors.username && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.username}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                          {t("desktop.affiliatePage.form.emailLabel")}
                        </label>
                        <span className="text-[10px] text-[#E8E8FF59] font-medium flex items-center gap-1">
                          <Lock size={10} /> Locked
                        </span>
                      </div>
                      <div className="relative">
                        <Mail size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF4D]" />
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          readOnly
                          className="py-2.5 pr-4 pl-9 rounded-lg outline-none w-full text-sm text-[var(--system-color-mist-lavender)] opacity-60 cursor-not-allowed bg-[#00D4FF08] border border-[#00D4FF1F]"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Section 2: Dynamic Communication Channels */}
                <div className="p-4 sm:p-5 rounded-xl bg-bg-dark/45 border border-text-primary/10 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-neon-cyan flex items-center gap-1.5">
                        <Share2 size={13} />
                        {t("desktop.affiliatePage.form.sectionChannels")} *
                      </span>
                      <p className="text-[11px] text-[#E8E8FF73] mt-0.5">
                        {t("desktop.affiliatePage.form.channelsDesc")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {channels.map((ch, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {/* Channel Selector */}
                        <div className="w-36 sm:w-44 shrink-0">
                          <select
                            value={ch.channel}
                            onChange={(e) => handleChannelChange(idx, "channel", e.target.value)}
                            className="w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-[#00D4FF14] text-neon-cyan border border-[#00D4FF33] outline-none cursor-pointer"
                          >
                            {CHANNEL_OPTIONS.map((opt) => (
                              <option
                                key={opt.value}
                                value={opt.value}
                                className="bg-[#08081C] text-[var(--system-color-mist-lavender)]"
                              >
                                {t(`desktop.affiliatePage.channels.${opt.value}`, opt.value)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* URL or Handle Input */}
                        <div className="flex-1 relative">
                          <LinkIcon size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF73]" />
                          <input
                            type="text"
                            value={ch.urlOrHandle}
                            placeholder={t("desktop.affiliatePage.form.channelUrlPlaceholder")}
                            onChange={(e) => handleChannelChange(idx, "urlOrHandle", e.target.value)}
                            className="py-2.5 pr-4 pl-9 rounded-lg outline-none w-full text-xs text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40]"
                          />
                        </div>

                        {/* Remove button */}
                        {channels.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChannel(idx)}
                            title={t("desktop.affiliatePage.form.channelRemove")}
                            className="p-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all shrink-0 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddChannel}
                    className="self-start mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-neon-cyan bg-[#00D4FF14] border border-[#00D4FF40] hover:bg-[#00D4FF26] transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    {t("desktop.affiliatePage.form.addChannel")}
                  </button>

                  {errors.channels && (
                    <p className="text-xs text-red-400 mt-0.5">{errors.channels}</p>
                  )}
                </div>

                {/* Section 3: Promotion Plan & Past Achievements */}
                <div className="p-4 sm:p-5 rounded-xl bg-bg-dark/45 border border-text-primary/10 flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-neon-cyan flex items-center gap-1.5">
                    <Megaphone size={13} />
                    {t("desktop.affiliatePage.form.sectionPlan")} *
                  </span>

                  {/* Promotion Plan - Full width expanded */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                      {t("desktop.affiliatePage.form.promotionPlanLabel")} *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.promotionPlan}
                      placeholder={t("desktop.affiliatePage.form.promotionPlanPlaceholder")}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, promotionPlan: e.target.value }));
                        if (errors.promotionPlan) setErrors((prev) => ({ ...prev, promotionPlan: "" }));
                      }}
                      className="py-3 px-3.5 rounded-lg outline-none w-full text-xs text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40] resize-y custom-scrollbar min-h-[105px] leading-relaxed"
                    />
                    {errors.promotionPlan && (
                      <p className="text-xs text-red-400 mt-0.5">{errors.promotionPlan}</p>
                    )}
                  </div>

                  {/* Past Achievements & Portfolio - Full width expanded */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                      {t("desktop.affiliatePage.form.pastAchievementsLabel")} *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.pastAchievements}
                      placeholder={t("desktop.affiliatePage.form.pastAchievementsPlaceholder")}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, pastAchievements: e.target.value }));
                        if (errors.pastAchievements) setErrors((prev) => ({ ...prev, pastAchievements: "" }));
                      }}
                      className="py-3 px-3.5 rounded-lg outline-none w-full text-xs text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40] resize-y custom-scrollbar min-h-[105px] leading-relaxed"
                    />
                    {errors.pastAchievements && (
                      <p className="text-xs text-red-400 mt-0.5">{errors.pastAchievements}</p>
                    )}
                  </div>
                </div>

                {/* Section 4: Bank Details for Commission Payouts */}
                <div className="p-4 sm:p-5 rounded-xl bg-bg-dark/45 border border-text-primary/10 flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-neon-cyan flex items-center gap-1.5">
                    <Banknote size={13} />
                    {t("desktop.affiliatePage.form.sectionBank")} *
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bank Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                        {t("desktop.affiliatePage.form.bankNameLabel")} *
                      </label>
                      <input
                        type="text"
                        value={formData.bankName}
                        placeholder={t("desktop.affiliatePage.form.bankNamePlaceholder")}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, bankName: e.target.value }));
                          if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: "" }));
                        }}
                        className="py-2.5 px-3 rounded-lg outline-none w-full text-xs text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40]"
                      />
                      {errors.bankName && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.bankName}</p>
                      )}
                    </div>

                    {/* Bank Account Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                        {t("desktop.affiliatePage.form.bankAccountNumberLabel")} *
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccountNumber}
                        placeholder={t("desktop.affiliatePage.form.bankAccountNumberPlaceholder")}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, bankAccountNumber: e.target.value }));
                          if (errors.bankAccountNumber) setErrors((prev) => ({ ...prev, bankAccountNumber: "" }));
                        }}
                        className="py-2.5 px-3 font-mono rounded-lg outline-none w-full text-xs text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40]"
                      />
                      {errors.bankAccountNumber && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.bankAccountNumber}</p>
                      )}
                    </div>

                    {/* Bank Account Holder Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-semibold text-xs uppercase tracking-wider text-[#00D4FFB2]">
                        {t("desktop.affiliatePage.form.bankAccountNameLabel")} *
                      </label>
                      <input
                        type="text"
                        value={formData.bankAccountName}
                        placeholder={t("desktop.affiliatePage.form.bankAccountNamePlaceholder")}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, bankAccountName: e.target.value.toUpperCase() }));
                          if (errors.bankAccountName) setErrors((prev) => ({ ...prev, bankAccountName: "" }));
                        }}
                        className="py-2.5 px-3 uppercase font-semibold rounded-lg outline-none w-full text-xs text-[var(--system-color-mist-lavender)] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40]"
                      />
                      {errors.bankAccountName && (
                        <p className="text-xs text-red-400 mt-0.5">{errors.bankAccountName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 5: User-Provided Custom Offer Code with Live Partner Badge */}
                <div className="p-4 sm:p-5 rounded-xl bg-bg-dark/45 border border-text-primary/10 flex flex-col gap-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    {/* Left Column: Code Input and Rules (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col justify-between gap-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neon-cyan flex items-center gap-1.5">
                            <TicketPercent size={13} />
                            {t("desktop.affiliatePage.form.sectionCode")} *
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${
                              formData.offerCode.length >= 4
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
                            size={16}
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-[#00D4FF73]"
                          />
                          <input
                            type="text"
                            maxLength={12}
                            value={formData.offerCode}
                            placeholder={t("desktop.affiliatePage.form.offerCodePlaceholder")}
                            onChange={handleOfferCodeChange}
                            className="py-2.5 pr-14 pl-9 font-mono tracking-widest font-black uppercase rounded-lg outline-none w-full text-sm text-[#00d4ff] bg-[#00D4FF0D] border border-[#00D4FF26] focus:border-[#00D4FF73] transition-all placeholder-[#E8E8FF40]"
                          />
                          {formData.offerCode.length >= 4 && (
                            <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[#00ff88]">
                              <CheckCircle2 size={16} />
                            </span>
                          )}
                        </div>

                        {errors.offerCode && (
                          <p className="text-xs text-red-400 mt-1">{errors.offerCode}</p>
                        )}

                        <p className="text-[11px] text-[#E8E8FF73] mt-2 leading-relaxed">
                          {t("desktop.affiliatePage.form.offerCodeHint")}
                        </p>
                      </div>

                      {/* Code Rules Checklist */}
                      <div className="p-3 rounded-lg bg-[#00D4FF08] border border-[#00D4FF1A] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-[11px] text-[#E8E8FFB2]">
                        <div className="flex items-center gap-1.5">
                          <Check size={13} className={formData.offerCode.length >= 4 ? "text-[#00ff88]" : "text-[#00D4FF73]"} />
                          <span>{t("desktop.affiliatePage.form.codeRuleLength")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={13} className="text-[#00D4FF73]" />
                          <span>{t("desktop.affiliatePage.form.codeRuleUnique")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Live Holographic Partner Pass (5 cols) */}
                    <div
                      className="lg:col-span-5 p-4 rounded-xl border border-neon-cyan/30 bg-gradient-to-br from-[#00D4FF12] via-[#7B2FBE0A] to-[#08081C] relative overflow-hidden flex flex-col justify-between gap-3"
                      style={{
                        boxShadow: "0 0 24px #00D4FF14",
                      }}
                    >
                      {/* Top Header of Pass */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neon-cyan font-bold text-xs tracking-wider uppercase">
                          <Sparkles size={13} />
                          <span>{t("desktop.affiliatePage.form.codeCardTitle")}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#00ff88] bg-[#00FF881A] border border-[#00FF8840] px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span>
                          LIVE
                        </span>
                      </div>

                      {/* Center Glowing Code Display */}
                      <div className="py-2 px-3 text-center bg-[#050514]/60 rounded-lg border border-neon-cyan/15">
                        <span className="text-[10px] uppercase tracking-widest text-[#E8E8FF73] font-semibold block mb-0.5">
                          Centrix-G Partner Code
                        </span>
                        <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-[#00ff88] drop-shadow-[0_0_12px_#00FF8880] select-all">
                          {formData.offerCode.trim() || "YOURCODE"}
                        </span>
                      </div>

                      {/* Bottom Perks Pills */}
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5 p-1.5 rounded bg-[#00D4FF0D] border border-[#00D4FF1F] text-[#E8E8FFCC] truncate">
                          <Gift size={11} className="text-neon-cyan shrink-0" />
                          <span className="truncate">{t("desktop.affiliatePage.form.codeCardDiscount")}</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded bg-[#00D4FF0D] border border-[#00D4FF1F] text-[#E8E8FFCC] truncate">
                          <Banknote size={11} className="text-[#00ff88] shrink-0" />
                          <span className="truncate">{t("desktop.affiliatePage.form.codeCardCommission")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <NeonButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-2"
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
          </>
        )}
      </div>
    </MainLayout>
  );
}
