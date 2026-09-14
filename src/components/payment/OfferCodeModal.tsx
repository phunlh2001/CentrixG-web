import { ArrowRight, Check, Sparkles, TicketPercent, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import NeonBadge from "../neon/NeonBadge";
import NeonButton from "../neon/NeonButton";
import NeonCard from "../neon/NeonCard";

type OfferCodeModalProps = {
  isOpen: boolean;
  initialCode?: string;
  onApply: (code: string) => void;
  onSkip: () => void;
  onClose: () => void;
};

export default function OfferCodeModal({
  isOpen,
  initialCode = "",
  onApply,
  onSkip,
  onClose,
}: OfferCodeModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setError(null);
    }
  }, [isOpen, initialCode]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
    setCode(val);
    if (error) setError(null);
  };

  const handleApply = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError(
        t("desktop.paymentPage.offerCodeModal.invalidCode", {
          defaultValue: "Please enter a valid offer code",
        }),
      );
      return;
    }
    onApply(cleanCode);
  };

  const handleSkip = () => {
    onSkip();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-md w-full animate-scale-in">
        <NeonCard
          glow="cyan"
          padding="lg"
          className="relative text-center shadow-[0_0_50px_#00D4FF33] border-neon-cyan/30"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-text-primary/50 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Icon Header */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/40 bg-neon-cyan/15 shadow-[0_0_24px_#00D4FF40]">
            <TicketPercent size={32} className="text-neon-cyan animate-pulse" />
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-2">
            <NeonBadge color="cyan" dot className="font-bold text-xs">
              <Sparkles size={11} className="mr-1 inline text-amber-400" />
              {t("desktop.paymentPage.offerCodeModal.badge", {
                defaultValue: "Special Welcome Offer",
              })}
            </NeonBadge>
          </div>

          {/* Title & Subtitle */}
          <h3
            className="text-xl font-black mb-2"
            style={{
              background: "linear-gradient(135deg, #e8e8ff, #00d4ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("desktop.paymentPage.offerCodeModal.title", {
              defaultValue: "First Purchase 10% Discount",
            })}
          </h3>
          <p className="text-xs text-text-primary/70 mb-6 leading-relaxed">
            {t("desktop.paymentPage.offerCodeModal.subtitle", {
              defaultValue:
                "As a new customer, enter the seller's Offer Code to get 10% off your entire order!",
            })}
          </p>

          {/* Form */}
          <form onSubmit={handleApply} className="flex flex-col gap-4 text-left">
            <div>
              <label
                htmlFor="offer-code-input"
                className="block text-xs font-semibold mb-1.5 text-text-primary/90"
              >
                {t("desktop.paymentPage.offerCodeModal.inputLabel", {
                  defaultValue: "Offer Code / Promo Code",
                })}
              </label>
              <div className="relative">
                <input
                  id="offer-code-input"
                  type="text"
                  value={code}
                  onChange={handleInputChange}
                  placeholder={t("desktop.paymentPage.offerCodeModal.inputPlaceholder", {
                    defaultValue: "e.g. AAAA1111BBBB",
                  })}
                  autoFocus
                  className="w-full font-mono text-center tracking-[0.2em] font-black text-sm uppercase px-4 py-3 rounded-xl border border-neon-cyan/30 bg-bg-dark/70 text-neon-cyan placeholder:text-text-primary/30 placeholder:tracking-normal focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50 transition-all shadow-[inset_0_2px_8px_#00000066]"
                />
              </div>
              {error && (
                <p className="mt-1.5 text-[11px] font-medium text-neon-pink animate-fade-in">
                  {error}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              <NeonButton
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                startIcon={<Check size={16} />}
              >
                {t("desktop.paymentPage.offerCodeModal.applyBtn", {
                  defaultValue: "Apply Offer Code",
                })}
              </NeonButton>

              <NeonButton
                type="button"
                variant="ghost"
                fullWidth
                size="sm"
                onClick={handleSkip}
                className="text-text-primary/60 hover:text-text-primary border-transparent hover:border-text-primary/20"
                endIcon={<ArrowRight size={14} />}
              >
                {t("desktop.paymentPage.offerCodeModal.skipBtn", {
                  defaultValue: "Skip & Pay Directly",
                })}
              </NeonButton>
            </div>
          </form>

          <p className="mt-4 text-[10px] text-text-primary/40 leading-normal">
            {t("desktop.paymentPage.offerCodeModal.optionalNote", {
              defaultValue:
                "This offer is optional. If you don't have a code, you can skip and proceed.",
            })}
          </p>
        </NeonCard>
      </div>
    </div>,
    document.body,
  );
}
