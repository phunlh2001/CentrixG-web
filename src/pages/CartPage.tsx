import { useEffect } from "react";
import { useCart, Utils } from "@/shared";
import { ArrowRight, ShoppingCart, Trash2, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import NeonBadge from "../components/neon/NeonBadge";
import NeonButton from "../components/neon/NeonButton";
import NeonCard from "../components/neon/NeonCard";
import SectionHeader from "../components/neon/SectionHeader";

function EmptyCart() {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col justify-center items-center gap-6 py-24 rounded-2xl"
      style={{
        background: "#00D4FF08",
        border: "1px solid #00D4FF14",
      }}
    >
      <div
        className="flex justify-center items-center rounded-2xl w-20 h-20"
        style={{ background: "#00D4FF14", border: "1px solid #00D4FF26" }}
      >
        <ShoppingCart size={34} style={{ color: "#00D4FF66" }} />
      </div>
      <div className="text-center">
        <p
          className="mb-2 font-bold text-xl"
          style={{ color: "var(--system-color-mist-lavender)" }}
        >
          {t("desktop.cartPage.emptyTitle")}
        </p>
        <p className="text-sm" style={{ color: "#E8E8FF8C" }}>
          {t("desktop.cartPage.emptySub")}
        </p>
      </div>
      <Link to="/">
        <NeonButton variant="primary" startIcon={<ArrowRight size={15} />}>
          {t("desktop.cartPage.browseCta")}
        </NeonButton>
      </Link>
    </div>
  );
}

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, removeItem, clearCart, itemCount } = useCart();

  // Reset pagination state to page 1 when visiting CartPage
  useEffect(() => {
    localStorage.setItem("products_current_page", "1");
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const price = item.discount
      ? item.price * (1 - item.discount / 100)
      : item.price;
    return sum + price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate("/payment");
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center">
          <SectionHeader
            eyebrow={t("desktop.cartPage.eyebrow")}
            title={t("desktop.cartPage.title")}
          />
          {items.length > 0 && (
            <NeonBadge color="cyan">
              {t("desktop.cartPage.itemCount", { count: itemCount })}
            </NeonBadge>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-[1fr_340px]">
            {/* Cart items */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 pr-1.5 max-h-[460px] overflow-y-auto custom-scrollbar">
                {items.map((item) => {
                  const finalPrice = item.discount
                    ? item.price * (1 - item.discount / 100)
                    : item.price;

                  return (
                    <NeonCard
                      key={item.id}
                      glow="cyan"
                      padding="none"
                      className="transition-all duration-200 shrink-0"
                    >
                      <div className="flex gap-4 p-4">
                        {/* Image */}
                        <div
                          className="rounded-lg overflow-hidden shrink-0"
                          style={{ width: 96, height: 64 }}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => navigate(`/products/${item.id}`)}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className="mb-1 font-bold text-[10px] uppercase tracking-wider"
                            style={{ color: "#00D4FF80" }}
                          >
                            {item.categoryName}
                          </p>
                          <h3
                            className="font-semibold hover:text-[#00d4ff] text-sm line-clamp-2 leading-snug transition-colors cursor-pointer"
                            style={{
                              color: "var(--system-color-mist-lavender)",
                            }}
                            onClick={() => navigate(`/products/${item.id}`)}
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <NeonBadge color="cyan">
                              <Zap size={9} />
                              {t("desktop.common.steamKey")}
                            </NeonBadge>
                          </div>
                        </div>

                        {/* Price + remove */}
                        <div className="flex flex-col justify-between items-end ml-2 shrink-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex justify-center items-center hover:bg-[#FF2D7814] hover:border-[#FF2D7859] rounded-lg w-7 h-7 hover:text-[#ff2d78] transition-all duration-200"
                            style={{
                              color: "#E8E8FF4C",
                              border: "1px solid #E8E8FF14",
                            }}
                          >
                            <Trash2 size={13} />
                          </button>

                          <div className="text-right">
                            {item.discount && (
                              <p
                                className="mb-0.5 text-xs line-through"
                                style={{ color: "#E8E8FF59" }}
                              >
                                {Utils.convert.currency(
                                  item.price,
                                  i18n.language,
                                )}
                              </p>
                            )}
                            <p
                              className="font-black text-base"
                              style={{
                                color: "#00d4ff",
                                textShadow: "0 0 8px #00D4FF66",
                              }}
                            >
                              {Utils.convert.currency(
                                finalPrice,
                                i18n.language,
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </NeonCard>
                  );
                })}
              </div>

              {/* Clear all */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={clearCart}
                  className="flex items-center gap-1.5 font-medium hover:text-[#ff2d78] text-xs transition-colors"
                  style={{ color: "#FF2D788C" }}
                >
                  <Trash2 size={12} />
                  {t("desktop.cartPage.clearCart")}
                </button>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:top-24 lg:sticky flex flex-col self-start gap-4">
              <NeonCard glow="cyan" padding="md">
                <h3
                  className="mb-5 font-bold text-base"
                  style={{ color: "var(--system-color-mist-lavender)" }}
                >
                  {t("desktop.cartPage.orderSummary")}
                </h3>

                <div className="flex flex-col gap-3 mb-5 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: "#E8E8FF8C" }}>
                      {t("desktop.cartPage.subtotal", { count: itemCount })}
                    </span>
                    <span
                      style={{ color: "var(--system-color-mist-lavender)" }}
                    >
                      {Utils.convert.currency(subtotal, i18n.language)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: "#E8E8FF8C" }}>
                      {t("desktop.cartPage.delivery")}
                    </span>
                    <span style={{ color: "#00ff88" }}>
                      {t("desktop.cartPage.free")}
                    </span>
                  </div>
                </div>

                <div
                  className="mb-5 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, #00D4FF33, transparent)",
                  }}
                />

                <div className="flex justify-between items-baseline mb-6">
                  <span
                    className="font-bold text-base"
                    style={{ color: "var(--system-color-mist-lavender)" }}
                  >
                    {t("desktop.cartPage.total")}
                  </span>
                  <span
                    className="font-black text-2xl"
                    style={{
                      color: "#00d4ff",
                      textShadow: "0 0 16px #00D4FF66",
                    }}
                  >
                    {Utils.convert.currency(subtotal, i18n.language)}
                  </span>
                </div>

                <NeonButton
                  variant="primary"
                  fullWidth
                  size="lg"
                  startIcon={<ShoppingCart size={16} />}
                  onClick={handleCheckout}
                >
                  {t("desktop.cartPage.checkout")}
                </NeonButton>

                <p
                  className="mt-3 text-xs text-center"
                  style={{ color: "#E8E8FF59" }}
                >
                  {t("desktop.cartPage.keysNote")}
                </p>
              </NeonCard>

              {/* Continue shopping */}
              <NeonButton
                variant="ghost"
                fullWidth
                onClick={() => navigate("/")}
                startIcon={<ArrowRight size={14} />}
              >
                {t("desktop.cartPage.continueShopping")}
              </NeonButton>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
