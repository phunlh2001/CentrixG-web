import { BookOpen, ChevronRight, LogOut, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { APP_CONFIG } from "../shared/contanst/appConfig";
import { LanguageCode } from "../shared/i18n/config";
import { useCart } from "../shared";
import { BaseMenuItem } from "../shared/types";
import BaseSelect from "./ui/BaseSelect";

type NavigationMenuProps = {
  menu: BaseMenuItem[];
  onClose?: () => void;
};

import { useAuthStore } from "../shared/store/useAuthStore";

export default function NavigationMenu({ menu, onClose }: NavigationMenuProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user: currentUser, isAuthenticated, logout: storeLogout, checkAuth } = useAuthStore();

  const [language, setLanguage] = useState(i18n.language);

  const handleChangeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem("lang", lang);
    i18n.changeLanguage(lang);
  };

  const handleLogout = async () => {
    await storeLogout();
    onClose?.();
  };

  const translatedMenu = menu.map((item) => ({
    ...item,
    label: t(`desktop.topbar.navLinks.${item.slug}`, item.label),
    children: item.children?.map((child) => ({
      ...child,
      label: t(`desktop.topbar.navLinks.${child.slug}`, child.label),
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
    <div
      style={{
        background: "#050510E0",
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: "1px solid #00D4FF14",
        boxShadow: "0 1px 0 #00D4FF0F, 0 4px 24px #00000066",
      }}
      className="flex flex-col w-full h-full text-white"
    >
      {/* Menu */}
      <div className="flex-1 space-y-2 p-5 overflow-y-auto">
        {translatedMenu.map((item) => (
          <div key={item.slug}>
            <Link
              to={`/${item.slug}`}
              onClick={onClose}
              className={`flex items-center text-sm justify-between rounded-lg px-4 py-3 transition ${
                isActive(item.slug)
                  ? "bg-cyan-500/15 text-cyan-400"
                  : "hover:bg-white/5 text-white/80"
              }`}
            >
              <span>{item.label}</span>

              {item.children?.length ? <ChevronRight size={16} /> : null}
            </Link>

            {!!item.children?.length && (
              <div className="mt-1 ml-5 border-white/10 border-l">
                {item.children.map((child) => (
                  <Link
                    key={child.slug}
                    to={`/categories/${child.slug}`}
                    onClick={onClose}
                    className="block px-4 py-2 text-white/60 hover:text-cyan-400 text-sm"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="space-y-3 p-5 border-white/10 border-t">
        {currentUser && isAuthenticated ? (
          <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/20 px-4 py-3 rounded-lg text-sm">
            <Link
              to="/library"
              onClick={onClose}
              className="flex items-center gap-2.5 text-cyan-400 font-semibold truncate"
            >
              <User size={18} className="shrink-0" />
              <span className="truncate">{currentUser.username}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-white/70 hover:text-red-400 text-xs transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            onClick={onClose}
            className="flex items-center gap-3 hover:bg-white/5 px-4 py-3 rounded-lg text-sm"
          >
            <User size={18} />
            {t("desktop.topbar.signIn")}
          </Link>
        )}

        <Link
          to="/library"
          onClick={onClose}
          className="flex items-center gap-3 hover:bg-white/5 px-4 py-3 rounded-lg text-sm"
        >
          <BookOpen size={18} />
          {t("desktop.topbar.myLibrary")}
        </Link>

        <Link
          to="/cart"
          onClick={onClose}
          className="flex items-center justify-between bg-cyan-500/10 px-4 py-3 rounded-lg text-cyan-400 text-sm"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart size={18} />
            {t("desktop.topbar.cart")}
          </div>
          {itemCount > 0 && (
            <span className="flex items-center justify-center rounded-full w-5 h-5 font-black text-[10px] text-white bg-red-600 shadow-[0_0_10px_#ef4444b3]">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Link>

        <BaseSelect
          data={APP_CONFIG.locale.dropdownItems}
          value={language}
          onChange={(lang) => handleChangeLanguage(lang as LanguageCode)}
        />
      </div>
    </div>
  );
}
