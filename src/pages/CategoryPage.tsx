import clsx from "clsx";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  RotateCcw,
  Search,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IProduct, isValidProduct, ProductService } from "../api/productApi";
import MainLayout from "../components/MainLayout";
import NeonButton from "../components/neon/NeonButton";
import NeonCard from "../components/neon/NeonCard";
import NeonPagination from "../components/neon/NeonPagination";
import SectionHeader from "../components/neon/SectionHeader";
import Showcase from "../components/ui/Showcase";
import { useDebounce } from "../shared";

const CATEGORIES_DEFAULT_LIMIT = 10;

export default function CategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Product Data & Pagination State
  const [products, setProducts] = useState<IProduct[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 12;

  // Category Filtering & Search State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAutocompleteFocused, setIsAutocompleteFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Fetch Product Catalog Data
  const loadCategoryData = async () => {
    setIsLoading(true);
    try {
      const response = await ProductService.get({
        page,
        pageSize: 100, // Fetch broader set to build category list and catalog
      });

      if (response && response.success && response.statusCode === 200 && response.data) {
        const rawItems = response.data.items || [];
        const filteredItems = rawItems.filter(isValidProduct);
        setProducts(filteredItems);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading category products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, []);

  // Extract all unique categories & compute counts across catalog
  const { allCategories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      p.categories?.forEach((cat) => {
        const trimmed = cat.trim();
        if (trimmed) {
          counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      });
    });

    const sortedCats = Object.keys(counts).sort((a, b) => a.localeCompare(b));
    return { allCategories: sortedCats, categoryCounts: counts };
  }, [products]);

  // Filter categories list by search query (debounced)
  const filteredCategories = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return allCategories;
    }
    const query = debouncedSearchQuery.toLowerCase().trim();
    return allCategories.filter((cat) => cat.toLowerCase().includes(query));
  }, [allCategories, debouncedSearchQuery]);

  // Autocomplete suggestions based on active raw input
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return allCategories.filter(
      (cat) => cat.toLowerCase().includes(query) && !selectedCategories.includes(cat),
    );
  }, [allCategories, searchQuery, selectedCategories]);

  // Handle click outside to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsAutocompleteFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle Category selection (Multi-choice)
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setPage(1);
  };

  // Filter products by selected categories
  const filteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) {
      return products;
    }
    return products.filter((product) =>
      product.categories?.some((cat) => selectedCategories.includes(cat.trim())),
    );
  }, [products, selectedCategories]);

  // Paginated product items
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredProducts, page, pageSize]);

  // Computed total pages based on filtered results
  const computedTotalPages = Math.ceil(filteredProducts.length / pageSize) || 1;

  // Categories visible in sidebar (Cap at 10 unless expanded)
  const visibleCategories = isExpanded
    ? filteredCategories
    : filteredCategories.slice(0, CATEGORIES_DEFAULT_LIMIT);

  const remainingCategoryCount = filteredCategories.length - CATEGORIES_DEFAULT_LIMIT;

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 animate-fade-in-up">
        {/* Page Header */}
        <section>
          <SectionHeader
            eyebrow={t("desktop.categoryPage.eyebrow", { defaultValue: "GAME CATEGORIES" })}
            title={t("desktop.categoryPage.title", { defaultValue: "Explore Game Categories" })}
          />
        </section>

        {/* MAIN LAYOUT SPLIT: Compact Left Sidebar (3-col) & Main Product Body (9-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= COMPACT LEFT SIDEBAR (TAG FILTER) ================= */}
          <div className="lg:col-span-3 flex flex-col gap-4 sticky top-24">
            <NeonCard glow="cyan" padding="sm" className="flex flex-col gap-3 relative">
              {/* Sidebar Header & Reset Link */}
              <div className="flex items-center justify-between border-b border-text-primary/10 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Filter size={14} className="text-neon-cyan" />
                  <h3 className="font-bold text-xs text-text-primary uppercase tracking-wider">
                    {t("desktop.categoryPage.allCategories", { defaultValue: "Categories" })}
                  </h3>
                </div>

                {(selectedCategories.length > 0 || searchQuery.trim().length > 0) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-[11px] font-semibold text-neon-pink hover:text-neon-pink/80 transition-colors"
                  >
                    <RotateCcw size={11} />
                    {t("desktop.categoryPage.clearFilters", { defaultValue: "Reset" })}
                  </button>
                )}
              </div>

              {/* Search Bar & Autocomplete Dropdown */}
              <div className="relative">
                <div className="relative flex items-center">
                  <Search size={13} className="absolute left-2.5 text-neon-cyan/70 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsAutocompleteFocused(true);
                    }}
                    onFocus={() => setIsAutocompleteFocused(true)}
                    placeholder={t("desktop.categoryPage.searchPlaceholder", {
                      defaultValue: "Search tags...",
                    })}
                    className="w-full bg-bg-dark/70 border border-text-primary/15 rounded-md pl-7 pr-7 py-1.5 text-xs text-text-primary placeholder:text-text-primary/40 focus:outline-none focus:border-neon-cyan/60 focus:ring-1 focus:ring-neon-cyan/30 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-text-primary/40 hover:text-text-primary transition-colors p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Autocomplete Suggestions Popover */}
                {isAutocompleteFocused && autocompleteSuggestions.length > 0 && (
                  <div
                    ref={autocompleteRef}
                    className="absolute top-full left-0 right-0 mt-1 z-30 bg-bg-dark/95 border border-neon-cyan/30 rounded-md shadow-[0_4px_20px_#00D4FF1F] backdrop-blur-md max-h-40 overflow-y-auto divide-y divide-text-primary/5 py-1 custom-scrollbar"
                  >
                    {autocompleteSuggestions.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          toggleCategory(cat);
                          setSearchQuery("");
                          setIsAutocompleteFocused(false);
                        }}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left text-text-primary/80 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Tag size={11} className="text-neon-cyan/60 shrink-0" />
                          {cat}
                        </span>
                        <span className="text-[10px] text-text-primary/40 font-mono">
                          {categoryCounts[cat] || 0}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Counter Pill */}
              {selectedCategories.length > 0 && (
                <div className="flex items-center justify-between bg-neon-cyan/10 border border-neon-cyan/25 rounded px-2.5 py-1 text-[11px] text-neon-cyan font-medium">
                  <span>
                    {t("desktop.categoryPage.selectedCategories", {
                      count: selectedCategories.length,
                      defaultValue: `${selectedCategories.length} selected`,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className="hover:underline text-[10px] font-bold text-neon-pink"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Category Items Rendered as Compact Tag Pills */}
              <div className="flex flex-wrap gap-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar py-0.5">
                {visibleCategories.length === 0 ? (
                  <div className="w-full py-4 text-center text-xs text-text-primary/40">
                    {t("desktop.categoryPage.noCategories", { defaultValue: "No matching tags" })}
                  </div>
                ) : (
                  visibleCategories.map((category) => {
                    const isSelected = selectedCategories.includes(category);
                    const count = categoryCounts[category] || 0;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={clsx(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border shrink-0",
                          isSelected
                            ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-[0_0_8px_#00D4FF33]"
                            : "bg-text-primary/5 border-text-primary/10 text-text-primary/75 hover:bg-neon-cyan/10 hover:text-text-primary hover:border-neon-cyan/30",
                        )}
                      >
                        {isSelected ? (
                          <Check size={11} strokeWidth={2.5} className="text-neon-cyan" />
                        ) : (
                          <Tag size={10} className="text-text-primary/40" />
                        )}
                        <span className="truncate max-w-[110px]">{category}</span>
                        <span
                          className={clsx(
                            "text-[9px] px-1.5 py-0.2 rounded-full font-mono",
                            isSelected
                              ? "bg-neon-cyan text-bg-deep font-bold"
                              : "bg-text-primary/10 text-text-primary/50",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Show More / Show Less Toggle Button (Capped at 10 items initially) */}
              {filteredCategories.length > CATEGORIES_DEFAULT_LIMIT && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-[11px] font-semibold text-neon-cyan/80 hover:text-neon-cyan transition-colors bg-neon-cyan/5 hover:bg-neon-cyan/10 rounded border border-neon-cyan/20 cursor-pointer mt-0.5"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={13} />
                      {t("desktop.categoryPage.showLess", { defaultValue: "Show less" })}
                    </>
                  ) : (
                    <>
                      <ChevronDown size={13} />
                      {t("desktop.categoryPage.showMore", {
                        count: remainingCategoryCount,
                        defaultValue: `+ Show ${remainingCategoryCount} more`,
                      })}
                    </>
                  )}
                </button>
              )}
            </NeonCard>
          </div>

          {/* ================= MAIN BODY (PRODUCTS CATALOG FOCUS) ================= */}
          <div className="lg:col-span-9 flex flex-col gap-5">
            {/* Catalog Showcase (No Duplicate Filter Bar Above) */}
            {isLoading ? (
              <div className="py-24 text-center text-text-primary/50 text-sm">
                Loading products catalog...
              </div>
            ) : paginatedProducts.length === 0 ? (
              <NeonCard glow="purple" padding="lg" className="text-center py-16">
                <p className="text-sm text-text-primary/60 mb-4">
                  {t("desktop.categoryPage.noProducts", {
                    defaultValue: "No products match the selected categories",
                  })}
                </p>
                <NeonButton variant="secondary" size="md" onClick={clearFilters}>
                  {t("desktop.categoryPage.clearFilters", { defaultValue: "Clear filters" })}
                </NeonButton>
              </NeonCard>
            ) : (
              <Showcase
                eyebrow={
                  selectedCategories.length > 0
                    ? selectedCategories.join(", ")
                    : t("desktop.categoryPage.allCategories", { defaultValue: "All Categories" })
                }
                title={t("desktop.categoryPage.catalogTitle", { defaultValue: "Game Catalog" })}
                list={paginatedProducts}
                paginated={false}
                onClickCard={(item) => navigate(`/products/${item.id}`)}
              />
            )}

            {/* Pagination */}
            {computedTotalPages > 1 && (
              <NeonPagination
                page={page}
                totalPages={computedTotalPages}
                onChange={setPage}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
