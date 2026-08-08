import clsx from "clsx";
import { Check, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { IProduct } from "../api/productApi";
import { useCart } from "../shared";
import { Utils } from "../shared/utils";
import BaseButton from "./ui/BaseButton";

function GameCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="bg-neon-cyan/5 border border-neon-cyan/8 rounded-xl w-full aspect-[3/4]" />
      <div className="flex flex-col gap-2 px-1">
        <div className="bg-neon-cyan/8 rounded w-1/3 h-3" />
        <div className="rounded h-4 bg-text-primary/6" />
        <div className="rounded w-2/3 h-4 bg-text-primary/4" />
      </div>
    </div>
  );
}

type GameCardProps = {
  item: IProduct;
  loaded?: boolean;
  onClick?: () => void;
};

const parsePrice = (value?: string) => Number(value || 0);

const getProductPrice = (item: IProduct, language: string) => {
  if (!item.pricing) return 0;
  if (language === "zh") return parsePrice(item.pricing.cny);
  if (language === "en") return parsePrice(item.pricing.usd);
  return parsePrice(item.pricing.vnd);
};

const getProductCategory = (item: IProduct) =>
  item.categories && item.categories.length > 0 ? item.categories[0] : "game";

export default function GameCard({
  item,
  loaded = true,
  onClick,
}: GameCardProps) {
  const { t, i18n } = useTranslation();
  const { addItem, isInCart } = useCart();

  if (!loaded) return <GameCardSkeleton />;

  const price = getProductPrice(item, i18n.language);
  const categoryId = getProductCategory(item);
  const categories = item.categories || [];
  const alreadyInCart = isInCart(item.id);

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    addItem({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      price,
      categoryName: categoryId,
    });
  };

  return (
    <article
      onClick={() => onClick?.()}
      className="group relative flex flex-col bg-[#08081CB2] hover:shadow-[0_0_24px_#00D4FF1A,0_8px_32px_#00000066] backdrop-blur-md border border-neon-cyan/10 hover:border-neon-cyan/35 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5 duration-300 cursor-pointer"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#050510F2_0%,#05051066_45%,transparent_70%)]" />

        <div className="top-2.5 right-2.5 left-2.5 absolute flex justify-between items-start gap-2">
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="self-start px-1.5 py-0.5 rounded font-bold text-[9px] uppercase tracking-wide border border-neon-cyan/45 bg-neon-cyan/15 text-neon-cyan shadow-[0_0_8px_#00D4FF40]"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        <div className="right-0 bottom-0 left-0 absolute flex justify-center items-center p-3 transition-transform translate-y-full group-hover:translate-y-0 duration-300">
          <BaseButton
            variant="custom"
            className={clsx(
              "flex justify-center items-center gap-2 backdrop-blur-sm py-2 border rounded-lg w-full font-semibold text-xs transition-all duration-200",
              alreadyInCart
                ? "cursor-default border-neon-cyan/20 bg-neon-cyan/8 text-neon-cyan/50"
                : "cursor-pointer border-neon-cyan/40 bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/20",
            )}
            onClick={handleAddToCart}
            disabled={alreadyInCart}
          >
            {alreadyInCart ? (
              <>
                <Check size={13} />
                {t("desktop.cartPage.alreadyInCart")}
              </>
            ) : (
              <>
                <ShoppingCart size={13} />
                {t("desktop.productDetailPage.actAddToCart")}
              </>
            )}
          </BaseButton>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <span className="self-start bg-neon-cyan/8 px-2 py-0.5 rounded font-semibold text-[10px] text-neon-cyan/70 uppercase tracking-wider">
          {t(`desktop.categories.${categoryId}`, {
            defaultValue: categoryId,
          })}
        </span>

        <h3 className="min-h-[2.5rem] font-semibold text-text-primary text-sm line-clamp-2 leading-snug">
          {item.name}
        </h3>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="font-black text-neon-cyan text-base [text-shadow:0_0_8px_#00D4FF66]">
            {Utils.convert.currency(price, i18n.language)}
          </span>
        </div>
      </div>
    </article>
  );
}
