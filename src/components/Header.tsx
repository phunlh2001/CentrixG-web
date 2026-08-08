import { BookOpen, ChevronDown, LogOut, Menu, ShoppingCart, User } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/centrix-logo.png";
import { APP_CONFIG } from "../shared/contanst/appConfig";
import i18n, { LanguageCode } from "../shared/i18n/config";
import { useCart } from "../shared";
import { BaseMenuItem } from "../shared/types";
import BaseSelect from "./ui/BaseSelect";

type HeaderProps = {
  menu: BaseMenuItem[];
  toggleMenu?: () => void;
};

import { useAuthStore } from "../shared/store/useAuthStore";

export default function Header({ menu, toggleMenu }: HeaderProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, logout: storeLogout, checkAuth } = useAuthStore();
  const { itemCount } = useCart();

  const handleSwitchToLanguage = (lang: LanguageCode) => {
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);
  };

  const handleLogout = async () => {
    await storeLogout();
    navigate('/');
  };

  const translatedNavLinks = menu.map((item) => ({
    ...item,
    label: t(`desktop.header.navLinks.${item.slug}`, item.label),
    children: item.children?.map((child) => ({
      ...child,
      label: t(`desktop.header.navLinks.${child.slug}`, child.label),
    })),
  }));

  const isActive = (slug: string) =>
    location.pathname === `/${slug}` ||
    location.pathname.startsWith(`/${slug}/`);

  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  useEffect(() => {
    const handleSessionChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleSessionChange);
    window.addEventListener("auth-session-changed", handleSessionChange);
    return () => {
      window.removeEventListener("storage", handleSessionChange);
      window.removeEventListener("auth-session-changed", handleSessionChange);
    };
  }, []);

  return (
    <header
      className="top-0 z-50 sticky w-full"
      style={{
        background: "#050510E0",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: "1px solid #00D4FF14",
        boxShadow: "0 1px 0 #00D4FF0F, 0 4px 24px #00000066",
      }}
    >
      <div className="flex justify-between items-center mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl h-16">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleMenu?.()}
            className="lg:hidden flex justify-center items-center bg-[#00D4FF0F] hover:bg-[#00D4FF1F] border border-[#00D4FF26] hover:border-[#00D4FF59] rounded-lg w-9 h-9 text-[var(--system-color-mist-lavender)] transition-all"
          >
            <Menu size={18} />
          </button>

          <Link to="/" className="group flex items-center gap-2.5">
            <div
              className="relative flex justify-center items-center rounded-lg w-9 h-9 overflow-hidden shrink-0"
              style={{
                background: "#00D4FF14",
                border: "1px solid #00D4FF33",
                boxShadow: "0 0 12px #00D4FF26",
              }}
            >
              <img src={Logo} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <span
              className="hidden sm:block font-black text-lg tracking-tight"
              style={{
                background: "linear-gradient(135deg, #e8e8ff, #00d4ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {APP_CONFIG.name}
            </span>
          </Link>
        </div>

        {/* Center: nav links */}
        <nav className="hidden lg:flex items-center gap-1 h-full">
          {translatedNavLinks.map((x) => (
            <div className="group relative" key={x.slug}>
              <Link
                to={`/${x.slug}`}
                className={`relative flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(x.slug)
                    ? "text-[#00d4ff] bg-[#00D4FF1A]"
                    : "text-[#E8E8FFB2] hover:text-[#00d4ff] hover:bg-[#00D4FF12]"
                }`}
              >
                {isActive(x.slug) && (
                  <span
                    className="bottom-0 left-1/2 absolute rounded-full w-3/4 h-px -translate-x-1/2"
                    style={{
                      background: "#00d4ff",
                      boxShadow: "0 0 6px #00D4FFCC",
                    }}
                  />
                )}
                {x.label}
                {!!x.children?.length && (
                  <ChevronDown
                    size={13}
                    className="opacity-60 group-hover:opacity-100 group-hover:rotate-180 transition-transform duration-200"
                  />
                )}
              </Link>

              {!!x.children?.length && (
                <div
                  className="invisible group-hover:visible top-full left-0 absolute opacity-0 group-hover:opacity-100 mt-2 p-3 rounded-xl w-72 transition-all duration-200"
                  style={{
                    background: "#08081CF7",
                    border: "1px solid #00D4FF26",
                    boxShadow: "0 16px 48px #00000099, 0 0 0 1px #00D4FF0D",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="gap-1 grid grid-cols-2">
                    {x.children.map((child) => (
                      <Link
                        key={`categories/${child.slug}`}
                        to={`/categories/${child.slug}`}
                        className="flex items-center gap-2 hover:bg-[#00D4FF14] px-3 py-2 rounded-lg text-[#E8E8FFA6] hover:text-[#00d4ff] text-sm transition-all duration-150"
                      >
                        <span
                          className="rounded-full w-1 h-1 shrink-0"
                          style={{ background: "#00D4FF80" }}
                        />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right: auth, library, cart, language */}
        <div className="flex items-center gap-1.5">
          {currentUser && isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-2 bg-[#00D4FF12] px-3 py-1.5 border border-[#00D4FF33] rounded-lg font-medium text-sm text-[#E8E8FFD9]">
              <Link
                to="/library"
                title={currentUser.username}
                className="flex items-center gap-1.5 hover:text-[#00d4ff] max-w-36 transition-colors"
              >
                <User size={15} className="shrink-0 text-neon-cyan" />
                <span className="truncate">{currentUser.username}</span>
              </Link>
              <span className="text-[#00D4FF40]">|</span>
              <button
                type="button"
                onClick={handleLogout}
                title={t("auth.logout", { defaultValue: "Sign out" })}
                className="flex items-center gap-1 text-[#E8E8FFA6] hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden lg:flex items-center gap-1.5 hover:bg-[#00D4FF12] px-3 py-1.5 border border-transparent hover:border-[#00D4FF33] rounded-lg font-medium text-[#E8E8FFA6] hover:text-[#00d4ff] text-sm transition-all"
            >
              <User size={15} />
              {t("desktop.header.signIn")}
            </Link>
          )}

          {/* Library */}
          <Link
            to="/library"
            title="My Library"
            className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
              isActive("library")
                ? "bg-[#00D4FF1A] border-[#00D4FF4C] text-[#00d4ff]"
                : "border-transparent text-[#E8E8FF8C] hover:text-[#00d4ff] hover:bg-[#00D4FF12] hover:border-[#00D4FF33]"
            }`}
          >
            <BookOpen size={16} />
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            className="hidden relative lg:flex items-center gap-1.5 hover:shadow-[0_0_18px_#00D4FF40] px-3 py-1.5 hover:border-[#00D4FF80] rounded-lg font-semibold text-sm transition-all duration-200"
            style={{
              background: "#00D4FF1A",
              border: "1px solid #00D4FF40",
              color: "#00d4ff",
            }}
          >
            <ShoppingCart size={15} />
            {t("desktop.header.cart")}
            {itemCount > 0 && (
              <span
                className="-top-1.5 -right-1.5 absolute flex justify-center items-center rounded-full w-5 h-5 font-black text-[10px] text-white bg-red-600 shadow-[0_0_10px_#ef4444b3]"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile cart */}
          <Link
            to="/cart"
            className="lg:hidden relative flex justify-center items-center rounded-lg w-9 h-9 text-[#E8E8FFB2] hover:text-[#00d4ff] transition-all"
          >
            <ShoppingCart size={16} />
            {itemCount > 0 && (
              <span
                className="-top-1 -right-1 absolute flex justify-center items-center rounded-full w-4.5 h-4.5 font-black text-[9px] text-white bg-red-600 shadow-[0_0_10px_#ef4444b3]"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          <div className="hidden sm:block w-24">
            <BaseSelect
              data={APP_CONFIG.locale.dropdownItems}
              value={localStorage.getItem("lang") ?? APP_CONFIG.locale.default}
              onChange={(lang) => handleSwitchToLanguage(lang as LanguageCode)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
