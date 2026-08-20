import BaseImageSwiper, {
  BaseImageSwiperNavigationEvent,
} from "@/components/ui/BaseImageSwiper";
import { APP_CONFIG, useCart, Utils } from "@/shared";
import clsx from "clsx";
import {
  Check,
  ChevronLeft,
  Download,
  Layers,
  Monitor,
  Package,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthService } from "../api/authApi";
import { IProduct, isValidProduct, ProductService } from "../api/productApi";
import MainLayout from "../components/MainLayout";
import NeonBadge from "../components/neon/NeonBadge";
import NeonButton from "../components/neon/NeonButton";
import NeonCard from "../components/neon/NeonCard";
import GameCard from "../components/ui/GameCard";
import { useAuthStore } from "../shared/store/useAuthStore";

const parsePrice = (value?: string) => Number(value || 0);

const getProductPrice = (item: IProduct, language: string) => {
  if (!item.pricing) return 0;
  if (language === "zh") return parsePrice(item.pricing.cny);
  if (language === "en") return parsePrice(item.pricing.usd);
  return parsePrice(item.pricing.vnd);
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, isInCart } = useCart();
  const { checkAuth, accessToken } = useAuthStore();

  const isActivateMode =
    location.search.includes("mode=activate") ||
    Boolean((location.state as any)?.isOwned);

  const isDesktopApp =
    import.meta.env.VITE_APP_TARGET === "desktop" ||
    (typeof window !== "undefined" &&
      (Boolean((window as any).electron) || window.location.protocol === "file:"));

  const [product, setProduct] = useState<IProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);
  const [isExecutingActivation, setIsExecutingActivation] = useState(false);

  const CATEGORIES_MAX_VISIBLE = 5;

  // Route Guard: /products/:id?mode=activate requires logged in user
  useEffect(() => {
    if (isActivateMode) {
      const authed = checkAuth() || AuthService.isAuthenticated();
      if (!authed) {
        navigate("/auth", { replace: true });
      }
    }
  }, [isActivateMode, checkAuth, navigate]);

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      if (id) {
        const response = await ProductService.getById(id);
        if (
          response &&
          response.success &&
          response.statusCode === 200 &&
          response.data &&
          isValidProduct(response.data)
        ) {
          setProduct(response.data);
        } else {
          setProduct(null);
        }
      }

      // Fetch similar products from real API
      const listResponse = await ProductService.get({ page: 1, pageSize: 12 });
      if (
        listResponse &&
        listResponse.success &&
        listResponse.statusCode === 200 &&
        listResponse.data
      ) {
        const rawItems = listResponse.data.items || [];
        const filtered = rawItems.filter(isValidProduct).filter((p) => p.id !== id);
        setSimilarProducts(filtered);
      }
      setIsLoading(false);
    };

    fetchProductData();
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-24 text-center text-text-primary/50 text-sm">
          Loading product details...
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="py-24 text-center">
          <h2 className="text-xl font-bold text-text-primary mb-2">Product Not Found</h2>
          <p className="text-xs text-text-primary/60 mb-4">
            The product you are looking for is unavailable or invalid.
          </p>
          <NeonButton variant="primary" onClick={() => navigate("/")}>
            Back to Home
          </NeonButton>
        </div>
      </MainLayout>
    );
  }

  const price = getProductPrice(product, i18n.language);
  const alreadyInCart = isInCart(product.id);
  const imageUrls = [product.imageUrl, ...(product.imageUrl ? [product.imageUrl] : [])];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price,
      categoryName: product.categories[0] || "game",
    });
  };

  const handleBuyNow = () => {
    if (!alreadyInCart) {
      handleAddToCart();
    }
    navigate("/payment");
  };

  const handleDownloadLauncher = () => {
    const link = document.createElement("a");
    link.href = APP_CONFIG.download.desktopInstaller;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleActivateClick = () => {
    setIsActivateModalOpen(true);
  };

  const handleConfirmActivate = async () => {
    setIsExecutingActivation(true);
    try {
      const userToken = accessToken || AuthService.getAccessToken() || "";
      const targetAppId = product.appId;
      const platformType = product.type;

      if (window.centrixDesktop?.installApp) {
        const result = await window.centrixDesktop.installApp(
          userToken,
          targetAppId,
          platformType,
        );
        if (result && result.success) {
          toast.success(
            t("desktop.productDetailPage.activateSuccessToast", {
              defaultValue: "Game is ready! Check your Steam Library.",
            }),
          );
        } else {
          toast.error(
            t("desktop.productDetailPage.activateErrorToast", {
              defaultValue: "Could not activate game right now. Please try again.",
            }),
          );
        }
      } else {
        // Fallback for non-electron web preview
        await new Promise((res) => setTimeout(res, 2000));
        toast.success(
          t("desktop.productDetailPage.activateSuccessToast", {
            defaultValue: "Game is ready! Check your Steam Library.",
          }),
        );
      }
    } catch (error: any) {
      toast.error(
        t("desktop.productDetailPage.activateErrorToast", {
          defaultValue: "Could not activate game right now. Please try again.",
        }),
      );
    } finally {
      setIsExecutingActivation(false);
      setIsActivateModalOpen(false);
    }
  };

  const handleOnGoToSlide = (e: BaseImageSwiperNavigationEvent) => {
    setActiveSlide(e.activeSlideIndex ?? 0);
  };

  const defaultSpecs = {
    minimum: {
      OS: "Windows 10 64-bit",
      CPU: "Intel Core i5-8400 / AMD Ryzen 5 1600",
      RAM: "16 GB",
      GPU: "NVIDIA GTX 1060 6GB / AMD RX 580 8GB",
      DirectX: "11",
      Storage: "70 GB SSD",
    },
    recommended: {
      OS: "Windows 10 / 11 64-bit",
      CPU: "Intel Core i7-9700 / AMD Ryzen 5 5500",
      RAM: "16 GB",
      GPU: "NVIDIA RTX 2060 / AMD RX 5700 XT",
      DirectX: "12",
      Storage: "70 GB SSD",
    },
  };

  return (
    <MainLayout>
      {/* Background container blurred & non-interactive when confirmation modal is active */}
      <div
        className={clsx(
          isActivateModalOpen &&
            "pointer-events-none select-none blur-md filter transition-all duration-300",
        )}
      >
        {/* === TOP AMBIENT HERO BANNER & HEADER === */}
        <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-6 overflow-hidden pt-6 pb-4 px-4 sm:px-6 lg:px-8 border-b border-neon-cyan/10">
          <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover object-top blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/60 via-bg-deep/90 to-bg-deep" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-3">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="self-start flex items-center gap-1.5 text-xs text-text-primary/70 hover:text-neon-cyan transition-colors"
            >
              <ChevronLeft size={14} /> {t("desktop.productDetailPage.back")}
            </button>

            {/* Game Title & Badges */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <NeonBadge color="cyan" dot>
                    <Zap size={10} />
                    {t("desktop.productDetailPage.steamKeyBadge")}
                  </NeonBadge>
                  <NeonBadge color="green">
                    <Check size={10} />
                    {t("desktop.productDetailPage.status")}
                  </NeonBadge>
                </div>
                <h1 className="font-black text-2xl sm:text-4xl tracking-tight leading-tight text-text-primary">
                  {product.name}
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* === MAIN SPLIT VIEW (IMAGE ON LEFT, CONTENT & BUY ON RIGHT) === */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* LEFT SIDE: Shrunk Game Image Gallery (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <NeonCard glow="cyan" padding="sm" className="overflow-hidden">
              {/* Main Image */}
              <div className="relative rounded-lg overflow-hidden mb-2.5 aspect-[16/9] max-h-64 sm:max-h-72">
                <img
                  src={imageUrls[activeSlide] || product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300"
                />
              </div>

              {/* Thumbnail Swiper */}
              {imageUrls.length > 1 && (
                <BaseImageSwiper
                  slidesPerView={4}
                  spaceBetween={6}
                  navigation={true}
                  hasGoToSlide={true}
                  loop={false}
                  onGoToSlide={handleOnGoToSlide}
                  onSlideClick={(i: number) => setActiveSlide(i ?? 0)}
                  autoplay={false}
                  contents={imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className={clsx(
                        "aspect-video overflow-hidden rounded-md cursor-pointer transition-all border",
                        i === activeSlide
                          ? "border-neon-cyan opacity-100"
                          : "border-transparent opacity-40 hover:opacity-70",
                      )}
                    >
                      <img
                        src={url}
                        alt={t("desktop.productDetailPage.thumbnailAlt", { index: i + 1 })}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                />
              )}
            </NeonCard>
          </div>

          {/* RIGHT SIDE: Minimal Categories, Buy / Add to Cart, & About This Product (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Top Right: Categories */}
            {product.categories &&
              product.categories.length > 0 &&
              (() => {
                const hasMore = product.categories.length > CATEGORIES_MAX_VISIBLE;
                const visibleCategories = isCategoriesExpanded
                  ? product.categories
                  : product.categories.slice(0, CATEGORIES_MAX_VISIBLE);
                const remainingCount = product.categories.length - CATEGORIES_MAX_VISIBLE;

                return (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neon-cyan/70 mr-1">
                      {t("desktop.productDetailPage.categoriesAndFeatures")}:
                    </span>
                    {visibleCategories.map((cat) => (
                      <NeonBadge key={cat} color="cyan">
                        {cat}
                      </NeonBadge>
                    ))}

                    {hasMore && (
                      <button
                        type="button"
                        onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                        className="text-[11px] font-semibold text-neon-cyan/80 hover:text-neon-cyan cursor-pointer transition-colors px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/20 hover:border-neon-cyan/40"
                      >
                        {isCategoriesExpanded
                          ? t("desktop.productDetailPage.less", { defaultValue: "Less" })
                          : `+ ${remainingCount} ${t("desktop.productDetailPage.more", { defaultValue: "more" })}`}
                      </button>
                    )}
                  </div>
                );
              })()}

            {/* Buy / Add to Cart / Activate Box */}
            <NeonCard glow="cyan" padding="md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-text-primary/10">
                {isActivateMode ? (
                  <div>
                    <NeonBadge color="green" dot className="text-xs font-bold">
                      <Check size={12} />
                      {t("desktop.productDetailPage.ownedStatus", {
                        defaultValue: "Owned in Library",
                      })}
                    </NeonBadge>
                  </div>
                ) : (
                  <div>
                    <p className="font-black text-3xl text-neon-cyan drop-shadow-[0_0_16px_#00D4FF66]">
                      {Utils.convert.currency(price, i18n.language)}
                    </p>
                    <p className="text-[11px] mt-0.5 text-neon-cyan/70">
                      {t("desktop.productDetailPage.priceNote")}
                    </p>
                  </div>
                )}

                <div className="flex sm:flex-row flex-col gap-2.5 sm:w-auto w-full">
                  {isActivateMode ? (
                    isDesktopApp ? (
                      <NeonButton
                        type="button"
                        variant="primary"
                        size="md"
                        startIcon={<Zap size={16} />}
                        onClick={handleActivateClick}
                      >
                        {t("desktop.productDetailPage.actActivate", {
                          defaultValue: "Activate",
                        })}
                      </NeonButton>
                    ) : (
                      <NeonButton
                        type="button"
                        variant="primary"
                        size="md"
                        startIcon={<Download size={16} />}
                        onClick={handleDownloadLauncher}
                      >
                        {t("desktop.productDetailPage.actDownloadLauncher", {
                          defaultValue: "Download Launcher",
                        })}
                      </NeonButton>
                    )
                  ) : (
                    <>
                      <NeonButton
                        type="button"
                        variant="primary"
                        size="md"
                        startIcon={alreadyInCart ? <Check size={16} /> : <ShoppingCart size={16} />}
                        onClick={handleAddToCart}
                        disabled={alreadyInCart}
                      >
                        {alreadyInCart
                          ? t("desktop.cartPage.alreadyInCart")
                          : t("desktop.productDetailPage.actAddToCart")}
                      </NeonButton>
                      <NeonButton
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={handleBuyNow}
                      >
                        {t("desktop.productDetailPage.actBuyNow")}
                      </NeonButton>
                    </>
                  )}
                </div>
              </div>

              {/* Features checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  "Instant Steam Delivery",
                  "Official Game License",
                  "Works Worldwide",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-text-primary/80">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan">
                      <Check size={10} />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </NeonCard>

            {/* About This Product Section */}
            <NeonCard glow="purple" padding="md">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-text-primary">
                <Package size={15} className="text-neon-lavender" />
                {t("desktop.productDetailPage.aboutProduct")}
              </h3>
              <p className="text-xs leading-relaxed text-text-primary/75">
                {product.description || t("desktop.productDetailPage.description")}
              </p>
            </NeonCard>
          </div>
        </div>

        {/* === DLCS SECTION === */}
        {product.dlcs && product.dlcs.length > 0 && (
          <div className="mb-12">
            <NeonCard glow="purple" padding="md">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-neon-purple/20">
                <h3 className="font-bold text-base flex items-center gap-2 text-text-primary">
                  <Layers size={17} className="text-neon-lavender" />
                  {t("desktop.productDetailPage.dlcsTitle", {
                    defaultValue: "Downloadable Content (DLCs)",
                  })}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neon-purple/20 text-neon-lavender border border-neon-purple/40 font-bold">
                  {product.dlcs.length} DLC{product.dlcs.length > 1 ? "s" : ""}
                </span>
              </div>

              <div
                className={clsx(
                  "flex flex-col divide-y divide-neon-purple/10",
                  product.dlcs.length > 5 && "max-h-[16.5rem] overflow-y-auto pr-2",
                )}
                style={
                  product.dlcs.length > 5
                    ? {
                        scrollbarWidth: "thin",
                        scrollbarColor: "#7B2FBE40 transparent",
                      }
                    : undefined
                }
              >
                {product.dlcs.map((dlc) => (
                  <div
                    key={dlc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-2 hover:bg-neon-purple/10 rounded-lg transition-colors gap-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-lavender shrink-0 shadow-[0_0_6px_#7B2FBE]" />
                      <span className="font-semibold text-xs text-text-primary">{dlc.name}</span>
                    </div>
                    {dlc.createdAt && (
                      <span className="text-[11px] text-text-primary/50 font-mono pl-4 sm:pl-0">
                        {new Date(dlc.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        )}

        {/* === SPECIFICATIONS SECTION === */}
        <div className="mb-8">
          <NeonCard glow="cyan" padding="md">
            <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-text-primary">
              <Monitor size={16} className="text-neon-cyan" />
              {t("desktop.productDetailPage.specifications")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                [
                  { label: t("desktop.productDetailPage.minimum"), entries: defaultSpecs.minimum },
                  {
                    label: t("desktop.productDetailPage.recommended"),
                    entries: defaultSpecs.recommended,
                  },
                ] as const
              ).map(({ label, entries }) => (
                <div key={label}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2.5 text-neon-cyan/70">
                    {label}
                  </p>
                  <div className="flex flex-col">
                    {Object.entries(entries).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex gap-3 py-1.5 text-xs border-b border-neon-cyan/10"
                      >
                        <span className="w-20 shrink-0 font-semibold text-text-primary/60">
                          {key}
                        </span>
                        <span className="text-text-primary">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>

        {/* === SIMILAR PRODUCTS === */}
        {similarProducts.length > 0 && (
          <div className="mt-10">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2.5 text-text-primary">
              <span className="w-1 h-4 rounded-full bg-neon-cyan shadow-[0_0_8px_#00D4FFCC]" />
              {t("desktop.productDetailPage.similarProducts")}
            </h4>
            <BaseImageSwiper
              slidesPerView={Math.min(5, similarProducts.length)}
              spaceBetween={10}
              navigation={true}
              allowTouchMove={true}
              isAutoPlay={false}
              autoplay={{}}
              contents={similarProducts.map((item) => (
                <div
                  key={item.id}
                  className="scale-95 origin-top hover:scale-100 transition-transform"
                >
                  <GameCard item={item} onClick={() => navigate(`/products/${item.id}`)} />
                </div>
              ))}
            />
          </div>
        )}
      </div>

      {/* === CONFIRMATION & ACTIVATION MODAL (PORTAL TO DOCUMENT BODY FOR VIEWPORT CENTERING) === */}
      {isActivateModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-md animate-fade-in">
            <NeonCard glow="cyan" padding="lg" className="max-w-md w-full relative z-[10000] text-center shadow-[0_0_50px_#00D4FF40]">
              {isExecutingActivation ? (
                <div className="flex flex-col items-center justify-center py-6 gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin" />
                  <h3 className="font-bold text-base text-text-primary">
                    {t("desktop.productDetailPage.activatingProgress", {
                      defaultValue: "Processing activation... Please do not close the application.",
                    })}
                  </h3>
                  <p className="text-xs text-text-primary/60">
                    {t("desktop.productDetailPage.activateConfirmTitle", {
                      defaultValue: "Activation Confirmation",
                    })}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-5 py-2">
                  <div className="w-12 h-12 rounded-full bg-neon-amber/15 border border-neon-amber/40 text-neon-amber flex items-center justify-center shadow-[0_0_12px_#FFB80040]">
                    <Zap size={24} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="font-black text-lg text-text-primary">
                      {t("desktop.productDetailPage.activateConfirmTitle", {
                        defaultValue: "Activation Confirmation",
                      })}
                    </h3>
                    <p className="text-sm text-text-primary/80 leading-relaxed">
                      {t("desktop.productDetailPage.activateConfirmMsg", {
                        defaultValue:
                          "We will restart the steam client for this process. Do you want to continue?",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 w-full mt-2">
                    <NeonButton
                      type="button"
                      variant="secondary"
                      size="md"
                      className="w-1/2"
                      onClick={() => setIsActivateModalOpen(false)}
                    >
                      {t("desktop.productDetailPage.actCancel", { defaultValue: "Cancel" })}
                    </NeonButton>

                    <NeonButton
                      type="button"
                      variant="primary"
                      size="md"
                      className="w-1/2"
                      onClick={handleConfirmActivate}
                    >
                      {t("desktop.productDetailPage.actContinue", { defaultValue: "Continue" })}
                    </NeonButton>
                  </div>
                </div>
              )}
            </NeonCard>
          </div>,
          document.body,
        )}
    </MainLayout>
  );
}
