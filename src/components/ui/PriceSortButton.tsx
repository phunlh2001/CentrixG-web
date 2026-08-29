import clsx from "clsx";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export type SortOrder = "asc" | "desc" | undefined;

type PriceSortButtonProps = {
  value?: SortOrder;
  onChange: (newValue?: SortOrder) => void;
  className?: string;
};

export default function PriceSortButton({
  value,
  onChange,
  className,
}: PriceSortButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleCycle = () => {
    if (!value) {
      onChange("asc");
    } else if (value === "asc") {
      onChange("desc");
    } else {
      onChange(undefined);
    }
  };

  const getButtonStyle = () => {
    if (value === "asc") {
      return {
        bg: "bg-neon-cyan/15 hover:bg-neon-cyan/25",
        border: "border-neon-cyan/50 hover:border-neon-cyan/70",
        text: "text-neon-cyan",
        glow: "shadow-[0_0_16px_#00D4FF3D]",
      };
    }
    if (value === "desc") {
      return {
        bg: "bg-neon-purple/20 hover:bg-neon-purple/30",
        border: "border-neon-purple/50 hover:border-neon-purple/75",
        text: "text-[#c084fc]",
        glow: "shadow-[0_0_16px_#7B2FBE40]",
      };
    }
    return {
      bg: "bg-surface/45 hover:bg-surface/75",
      border: "border-text-primary/20 hover:border-neon-cyan/45",
      text: "text-text-primary/85 hover:text-text-primary",
      glow: "",
    };
  };

  const style = getButtonStyle();

  return (
    <div ref={dropdownRef} className={clsx("relative inline-block", className)}>
      <div
        className={clsx(
          "flex items-center rounded-lg border backdrop-blur-md overflow-hidden transition-all duration-200 shadow-sm",
          style.border,
          style.glow
        )}
      >
        {/* Main Cycle Toggle Button */}
        <button
          type="button"
          onClick={handleToggleCycle}
          className={clsx(
            "flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none",
            style.bg,
            style.text
          )}
          title="Click to toggle price sort (Default → Low to High → High to Low)"
        >
          {value === "asc" ? (
            <ArrowUp size={13} className="text-neon-cyan shrink-0" />
          ) : value === "desc" ? (
            <ArrowDown size={13} className="text-[#c084fc] shrink-0" />
          ) : (
            <ArrowUpDown size={13} className="text-text-primary/50 shrink-0" />
          )}

          <span>
            {value === "asc"
              ? t("desktop.categoryPage.filters.priceAsc", { defaultValue: "Price: Low to High" })
              : value === "desc"
              ? t("desktop.categoryPage.filters.priceDesc", { defaultValue: "Price: High to Low" })
              : t("desktop.categoryPage.filters.default", { defaultValue: "Sort by Price" })}
          </span>
        </button>

        {/* Dropdown Arrow Indicator Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={clsx(
            "px-2 py-1.5 text-xs border-l border-text-primary/15 transition-colors cursor-pointer select-none",
            style.bg,
            style.text
          )}
        >
          <ChevronDown size={12} className={clsx("transition-transform duration-200", isOpen && "rotate-180")} />
        </button>
      </div>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[185px] bg-bg-dark/95 border border-neon-cyan/30 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl py-1 text-xs divide-y divide-text-primary/10 animate-fade-in">
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setIsOpen(false);
            }}
            className={clsx(
              "w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-neon-cyan/10 transition-colors cursor-pointer",
              !value ? "text-neon-cyan font-bold" : "text-text-primary/80"
            )}
          >
            <span className="flex items-center gap-2">
              <ArrowUpDown size={12} className="text-text-primary/40" />
              {t("desktop.categoryPage.filters.default", { defaultValue: "Default Order" })}
            </span>
            {!value && <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_#00D4FF]" />}
          </button>

          <button
            type="button"
            onClick={() => {
              onChange("asc");
              setIsOpen(false);
            }}
            className={clsx(
              "w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-neon-cyan/10 transition-colors cursor-pointer",
              value === "asc" ? "text-neon-cyan font-bold" : "text-text-primary/80"
            )}
          >
            <span className="flex items-center gap-2">
              <ArrowUp size={12} className="text-neon-cyan" />
              {t("desktop.categoryPage.filters.priceAsc", { defaultValue: "Price: Low to High" })}
            </span>
            {value === "asc" && <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_6px_#00D4FF]" />}
          </button>

          <button
            type="button"
            onClick={() => {
              onChange("desc");
              setIsOpen(false);
            }}
            className={clsx(
              "w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-neon-purple/15 transition-colors cursor-pointer",
              value === "desc" ? "text-[#c084fc] font-bold" : "text-text-primary/80"
            )}
          >
            <span className="flex items-center gap-2">
              <ArrowDown size={12} className="text-[#c084fc]" />
              {t("desktop.categoryPage.filters.priceDesc", { defaultValue: "Price: High to Low" })}
            </span>
            {value === "desc" && <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] shadow-[0_0_6px_#7B2FBE]" />}
          </button>
        </div>
      )}
    </div>
  );
}
