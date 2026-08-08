import { BaseSelect, LanguageCode } from '@centrixg/shared';
import { BookOpen, ChevronRight, ShoppingCart, User } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { APP_CONFIG } from '@centrixg/shared';
import { MenuItem } from '@centrixg/shared';

type NavigationMenuProps = {
  menu: MenuItem[];
  onClose?: () => void;
};

export default function NavigationMenu({ menu, onClose }: NavigationMenuProps) {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const [language, setLanguage] = useState(i18n.language);

  const handleChangeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
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

  return (
    <div
      style={{
        background: '#050510E0',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid #00D4FF14',
        boxShadow: '0 1px 0 #00D4FF0F, 0 4px 24px #00000066',
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
                  ? 'bg-cyan-500/15 text-cyan-400'
                  : 'hover:bg-white/5 text-white/80'
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
        <Link
          to="/auth"
          onClick={onClose}
          className="flex items-center gap-3 hover:bg-white/5 px-4 py-3 rounded-lg text-sm"
        >
          <User size={18} />
          {t('desktop.topbar.signIn')}
        </Link>

        <Link
          to="/library"
          onClick={onClose}
          className="flex items-center gap-3 hover:bg-white/5 px-4 py-3 rounded-lg text-sm"
        >
          <BookOpen size={18} />
          My Library
        </Link>

        <Link
          to="/cart"
          onClick={onClose}
          className="flex items-center gap-3 bg-cyan-500/10 px-4 py-3 rounded-lg text-cyan-400 text-sm"
        >
          <ShoppingCart size={18} />
          {t('desktop.topbar.cart')}
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
