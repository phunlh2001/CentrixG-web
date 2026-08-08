import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { useTranslation } from "react-i18next";

import Footer from "../components/Footer";
import Header from "../components/Header";
import NavigationMenu from "../components/NavigationMenu";
import BaseDrawer from "../components/ui/BaseDrawer";
import { MEGA_MENU } from "../shared/contanst/appConfig";

type Language = "vi" | "en" | "zh";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const { i18n } = useTranslation();
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [visible, setVisible] = useState(false);
  const { pathname } = useLocation();

  const currentLang = (i18n.language?.slice(0, 2) as Language) || "vi";

  const isDesktop = import.meta.env.VITE_APP_TARGET === "desktop";

  const MENU = Object.values(MEGA_MENU)
    .filter((item) => !isDesktop || item.slug !== "download")
    .map((item) => ({
      slug: item.slug,
      label: item.label[currentLang] || item.label["vi"] || item.label["en"],
    }));

  const toggleSidebar = () => setOpenSidebar(!openSidebar);

  useEffect(() => {
    setVisible(false);
    const t1 = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 0);
    const t2 = setTimeout(() => setVisible(true), 80);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return (
    <>
      <Header menu={MENU} toggleMenu={toggleSidebar} />

      <main
        className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-7xl transition-all duration-300"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
        }}
      >
        {children}
      </main>

      <Footer />

      <BaseDrawer
        onClose={toggleSidebar}
        isOpen={openSidebar}
        content={<NavigationMenu menu={MENU} onClose={toggleSidebar} />}
      />

      <ToastContainer
        position="bottom-right"
        autoClose={2500}
        hideProgressBar
        closeOnClick
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "#08081CF2",
          border: "1px solid #00D4FF33",
          color: "#e8e8ff",
          backdropFilter: "blur(12px)",
          fontSize: "0.8125rem",
        }}
      />
    </>
  );
}
