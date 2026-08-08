import SlideItem from "@/components/SildeItem";
import BaseImageSwiper from "@/components/ui/BaseImageSwiper";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IProduct, isValidProduct, ProductService } from "../api/productApi";
import NeonBadge from "../components/neon/NeonBadge";
import NeonPagination from "../components/neon/NeonPagination";
import SearchBar from "../components/neon/SearchBar";
import Showcase from "../components/Showcase";
import MainLayout from "../layout/MainLayout";

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-5 text-center">
      <p
        className="font-black text-2xl md:text-3xl"
        style={{ color: "#00d4ff", textShadow: "0 0 16px #00D4FF80" }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: "#E8E8FF8C" }}>
        {label}
      </p>
    </div>
  );
}

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [heroProducts, setHeroProducts] = useState<IProduct[]>([]);
  const [isHeroLoading, setIsHeroLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  // Fetch Hero Section featured products independently on mount (unaffected by searchQuery)
  useEffect(() => {
    const fetchHeroProducts = async () => {
      setIsHeroLoading(true);
      try {
        const response = await ProductService.get({
          page: 1,
          pageSize: 10,
        });

        if (
          response &&
          response.success &&
          response.statusCode === 200 &&
          response.data
        ) {
          const rawItems = response.data.items || [];
          const filtered = rawItems.filter(isValidProduct).slice(0, 5);
          setHeroProducts(filtered);
        }
      } catch (error) {
        console.error("Error fetching hero products:", error);
      } finally {
        setIsHeroLoading(false);
      }
    };

    fetchHeroProducts();
  }, []);

  const loadData = async () => {
    try {
      const response = await ProductService.get({
        searchQuery,
        page,
        pageSize,
      });

      if (
        response &&
        response.success &&
        response.statusCode === 200 &&
        response.data
      ) {
        const rawItems = response.data.items || [];
        // Filter rule: invisible === false and complete 3-currency prices
        const filteredItems = rawItems.filter(isValidProduct);
        setProducts(filteredItems);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching products from API:", error);
      setProducts([]);
      setTotalPages(1);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, page]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-14 lg:gap-20">
        {/* === Hero === */}
        <section>
          <div className="flex md:flex-row flex-col justify-between md:items-end gap-5 mb-6">
            <div>
              <NeonBadge color="cyan" dot className="mb-3">
                <Sparkles size={10} />
                {t("desktop.homePage.eyebrow")}
              </NeonBadge>
              <h1
                className="max-w-2xl font-black text-3xl md:text-5xl leading-tight tracking-tight"
                style={{ color: "var(--system-color-mist-lavender)" }}
              >
                {t("desktop.homePage.headline")}
              </h1>
            </div>

            <div
              className="flex items-center px-2 py-4 rounded-xl divide-x shrink-0"
              style={{
                background: "#00D4FF0A",
                border: "1px solid #00D4FF1F",
                backdropFilter: "blur(12px)",
              }}
            >
              <StatBlock
                value={t("desktop.homePage.metricDeliveryValue")}
                label={t("desktop.homePage.metricDeliveryLabel")}
              />
              <StatBlock
                value={t("desktop.homePage.metricValueValue")}
                label={t("desktop.homePage.metricValueLabel")}
              />
            </div>
          </div>

          {/* Carousel + sidebar */}
          <div className="gap-4 lg:gap-5 grid grid-cols-1 rounded-xl overflow-hidden min-h-[30rem]">
            {heroProducts.length > 0 ? (
              <BaseImageSwiper
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={heroProducts.length > 1}
                contents={heroProducts.map((item) => (
                  <SlideItem key={item.id} item={item} />
                ))}
                pagination={{ clickable: true }}
                allowTouchMove={true}
              />
            ) : (
              <div className="w-full h-[30rem] rounded-xl flex items-center justify-center border border-neon-cyan/20 bg-bg-dark/60 text-text-primary/50 text-sm">
                {isHeroLoading ? "Loading featured catalog..." : "No featured products available"}
              </div>
            )}
          </div>
        </section>

        {/* === Search section === */}
        <section>
          <div className="mx-auto max-w-2xl">
            <p
              className="mb-3 font-bold text-xs text-center uppercase tracking-[0.2em]"
              style={{ color: "#00D4FF80" }}
            >
              {t("desktop.homePage.searchEyebrow")}
            </p>
            <SearchBar
              items={products}
              onSelect={(item) => navigate(`/products/${item.id}`)}
              onChange={(value) => {
                setSearchQuery(value);
                setPage(1);
              }}
              placeholder={t("desktop.homePage.searchPlaceholder")}
            />
          </div>
        </section>

        <Showcase
          eyebrow={t("desktop.homePage.hotGamesEyebrow")}
          title={t("desktop.homePage.hotGames")}
          list={products}
          paginated={false}
          onClickCard={(item) => navigate(`/products/${item.id}`)}
        />

        {totalPages > 1 && (
          <NeonPagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </MainLayout>
  );
}
