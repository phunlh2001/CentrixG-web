import { useTranslation } from "react-i18next";
import NeonButton from "../neon/NeonButton";

type PaymentFormProps = {
  onSubmit?: () => void;
};

export default function PaymentForm({ onSubmit }: PaymentFormProps) {
  const { t } = useTranslation();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <input
        className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-primary/35 focus:border-neon-cyan/55"
        placeholder={t("desktop.paymentPage.form.cardholderName")}
      />
      <input
        className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-primary/35 focus:border-neon-cyan/55"
        inputMode="numeric"
        placeholder={t("desktop.paymentPage.form.cardNumber")}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-primary/35 focus:border-neon-cyan/55"
          placeholder={t("desktop.paymentPage.form.expiryDate")}
        />
        <input
          className="rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-primary/35 focus:border-neon-cyan/55"
          inputMode="numeric"
          placeholder={t("desktop.paymentPage.form.cvc")}
        />
      </div>
      <NeonButton type="submit" variant="primary" fullWidth size="lg">
        {t("desktop.paymentPage.form.payNow")}
      </NeonButton>
    </form>
  );
}
