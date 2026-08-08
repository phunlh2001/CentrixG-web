import { ShoppingBag, Zap } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { IProduct } from "../api/productApi";
import { useCart, Utils } from "../shared";
import NeonButton from "./neon/NeonButton";

type SlideItemProps = {
  item: IProduct;
};

const parsePrice = (value?: string) => Number(value || 0);

const getProductPrice = (item: IProduct, language: string) => {
  if (language === "zh") return parsePrice(item.pricing.cny);
  if (language === "en") return parsePrice(item.pricing.usd);
  return parsePrice(item.pricing.vnd);
};

export default function SlideItem({ item }: SlideItemProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addItem, isInCart } = useCart();
  const price = getProductPrice(item, i18n.language);
  const meta = (item.categories || []).slice(0, 2).join(" / ");

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInCart(item.id)) {
      addItem({
        id: item.id,
        name: item.name,
        imageUrl: item.imageUrl,
        price,
        categoryName: item.categories[0] || "game",
      });
    }
    navigate("/payment");
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    navigate(`/products/${item.id}`);
  };

  return (
    <div
      onClick={handleContainerClick}
      className="relative w-full h-[30rem] min-h-80 rounded-xl overflow-hidden cursor-pointer group"
    >
      {/* Background image */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, #050510EB 0%, #05051099 50%, #0505101A 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to top, #050510B2 0%, transparent 50%)",
        }}
      />

      {/* Neon border */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none group-hover:border-neon-cyan/60 transition-colors"
        style={{ border: "1px solid #00D4FF26" }}
      />

      {/* Purple ambient glow bottom-right */}
      <div
        className="right-0 bottom-0 absolute w-72 h-72 translate-x-1/3 translate-y-1/3 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7B2FBE40, transparent 70%)",
          filter: "blur(32px)",
        }}
      />

      {/* Content */}
      <div className="bottom-0 left-0 z-10 absolute flex flex-col gap-4 p-5 sm:p-8 lg:p-10 max-w-xl">
        {/* Badge */}
        <span
          className="flex items-center self-start gap-1.5 px-2.5 py-1 rounded-md font-black text-[11px] uppercase tracking-[0.18em]"
          style={{
            background: "#00D4FF1F",
            border: "1px solid #00D4FF66",
            color: "#00d4ff",
            boxShadow: "0 0 12px #00D4FF40",
          }}
        >
          <Zap size={10} />
          {t("desktop.homePage.slide.badge")}
        </span>

        {/* Title */}
        <h1
          onClick={() => navigate(`/products/${item.id}`)}
          className="font-black text-2xl sm:text-4xl lg:text-5xl text-left leading-tight tracking-tight hover:text-neon-cyan transition-colors"
          style={{ color: "var(--system-color-mist-lavender)" }}
        >
          {item.name}
        </h1>

        {/* Benefits — desktop only */}
        <div className="hidden lg:flex flex-col gap-2 text-sm leading-relaxed" style={{ color: "#E8E8FFB2" }}>
          {meta && (
            <p className="font-semibold text-neon-cyan/80 text-left uppercase tracking-[0.12em]">
              {meta}
            </p>
          )}
          <p className="line-clamp-3 text-left">{item.description}</p>
          <ul className="space-y-1 pl-4 list-disc">
            <li className="text-left">
              {t("desktop.homePage.slide.benefitSteam")}
            </li>
            <li className="text-left">
              {t("desktop.homePage.slide.benefitDelivery")}
            </li>
          </ul>
        </div>

        {/* Price */}
        <p
          className="font-black text-2xl sm:text-3xl text-left"
          style={{
            color: "#00d4ff",
            textShadow: "0 0 16px #00D4FF80",
          }}
        >
          {Utils.convert.currency(price, i18n.language)}
        </p>

        {/* Actions */}
        <div className="flex sm:flex-row flex-col gap-2 sm:gap-3">
          <NeonButton
            variant="primary"
            size="lg"
            startIcon={<ShoppingBag size={16} />}
            onClick={handleBuyNow}
          >
            {t("desktop.homePage.slide.buyNow")}
          </NeonButton>
          <NeonButton
            variant="secondary"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/products/${item.id}`);
            }}
          >
            {t("desktop.productDetailPage.aboutProduct", { defaultValue: "View Details" })}
          </NeonButton>
        </div>
      </div>
    </div>
  );
}
