import clsx from "clsx";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { IProduct } from "../../api/productApi";
import { Utils } from "../../shared/utils";
import BaseButton from "../ui/BaseButton";

type SearchBarProps = {
  items: IProduct[];
  onSelect?: (item: IProduct) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

function highlight(text: string, query: string): React.ReactNode {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return text;

  const startIndex = text.toLowerCase().indexOf(normalizedQuery);
  if (startIndex === -1) return text;

  return (
    <>
      {text.slice(0, startIndex)}
      <mark className="bg-neon-cyan/25 rounded-sm font-bold text-neon-cyan">
        {text.slice(startIndex, startIndex + query.length)}
      </mark>
      {text.slice(startIndex + query.length)}
    </>
  );
}

export default function SearchBar({
  items,
  onSelect,
  placeholder = "Search games...",
  value,
  onChange,
}: SearchBarProps) {
  const { i18n } = useTranslation();
  const [query, setQuery] = useState(value ?? "");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions =
    query.trim().length >= 1
      ? items
          .filter((item) =>
            item.name.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 8)
      : [];

  const showDropdown = focused && suggestions.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    onChange?.(event.target.value);
  };

  const handleSelect = (item: IProduct) => {
    setQuery(item.name);
    onChange?.(item.name);
    setFocused(false);
    onSelect?.(item);
  };

  const handleClear = () => {
    setQuery("");
    onChange?.("");
    inputRef.current?.focus();
  };

  const getFinalPrice = (item: IProduct) => {
    if (i18n.language === "zh") return Number(item.pricing.cny || 0);
    if (i18n.language === "en") return Number(item.pricing.usd || 0);
    return Number(item.pricing.vnd || 0);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={clsx(
          "relative flex items-center border rounded-xl transition-all duration-200",
          focused
            ? "border-neon-cyan/40 bg-neon-cyan/7 shadow-[0_0_24px_#00D4FF14]"
            : "border-neon-cyan/12 bg-neon-cyan/4",
        )}
      >
        <Search
          size={16}
          className={clsx(
            "left-4 absolute transition-colors shrink-0",
            focused ? "text-neon-cyan" : "text-neon-cyan/40",
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="bg-transparent py-3 pr-10 pl-10 outline-none w-full text-text-primary placeholder:text-text-faint text-sm"
        />
        {query && (
          <BaseButton
            variant="custom"
            type="button"
            onClick={handleClear}
            className="right-3 absolute p-1 rounded-md text-text-faint hover:text-neon-cyan transition-colors"
          >
            <X size={14} />
          </BaseButton>
        )}
      </div>

      <div
        className={clsx(
          "top-full right-0 left-0 z-50 absolute bg-[#060616F7] shadow-[0_16px_48px_#000000B3] backdrop-blur-xl mt-2 border border-neon-cyan/15 rounded-xl overflow-hidden transition-[opacity,transform] duration-200",
          showDropdown
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="px-4 py-2 border-neon-cyan/8 border-b font-bold text-[10px] text-neon-cyan/40 uppercase tracking-[0.18em]">
          {suggestions.length} result{suggestions.length !== 1 ? "s" : ""}
        </div>

        {suggestions.map((item) => (
          <BaseButton
            variant="custom"
            key={item.id || item.name}
            type="button"
            onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              handleSelect(item);
            }}
            className="flex items-center gap-3 hover:bg-neon-cyan/7 px-4 py-3 border-neon-cyan/5 border-b w-full text-left transition-colors duration-150"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="rounded w-12 h-8 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary text-sm truncate">
                {highlight(item.name, query)}
              </p>
              <p className="mt-0.5 text-neon-cyan/65 text-xs">
                {Utils.convert.currency(getFinalPrice(item), i18n.language)}
              </p>
            </div>
          </BaseButton>
        ))}
      </div>
    </div>
  );
}
