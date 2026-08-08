import clsx from 'clsx';
import { Flame, Grid, Shield, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IProduct, isValidProduct, ProductService } from '../api/productApi';
import MainLayout from '../components/MainLayout';
import NeonBadge from '../components/neon/NeonBadge';
import NeonPagination from '../components/neon/NeonPagination';
import SectionHeader from '../components/neon/SectionHeader';
import Showcase from '../components/ui/Showcase';

type SectionId = 'all' | 'hot' | 'new' | 'denuvo';

const SECTION_IDS: SectionId[] = ['all', 'hot', 'new', 'denuvo'];

const SECTION_ICONS: Record<SectionId, ReactNode> = {
  all: <Grid size={15} />,
  hot: <Flame size={15} />,
  new: <Sparkles size={15} />,
  denuvo: <Shield size={15} />,
};

const SECTION_BADGE_COLORS = {
  all: 'amber',
  hot: 'pink',
  new: 'cyan',
  denuvo: 'purple',
} as const;

export default function CategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionId>('all');
  const [products, setProducts] = useState<IProduct[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 12;

  const loadCategoryData = async () => {
    setIsLoading(true);
    try {
      const response = await ProductService.get({
        page,
        pageSize,
      });

      if (response && response.success && response.statusCode === 200 && response.data) {
        const rawItems = response.data.items || [];
        const filteredItems = rawItems.filter(isValidProduct);
        setProducts(filteredItems);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error loading category products:", error);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, [page]);

  // Section filtering
  const getFilteredProducts = () => {
    if (activeSection === 'hot') {
      return products.filter((p) =>
        p.categories?.some((c) => c.toLowerCase().includes('hot'))
      );
    }
    if (activeSection === 'new') {
      return products.filter((p) =>
        p.categories?.some((c) => c.toLowerCase().includes('moi') || c.toLowerCase().includes('new'))
      );
    }
    if (activeSection === 'denuvo') {
      return products.filter((p) =>
        p.categories?.some((c) => c.toLowerCase().includes('denuvo'))
      );
    }
    return products;
  };

  const displayedList = getFilteredProducts();

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 animate-fade-in-up">
        {/* Page header */}
        <section>
          <SectionHeader
            eyebrow={t('desktop.categoryPage.eyebrow')}
            title={t('desktop.categoryPage.title')}
          />
        </section>

        {/* Section tabs */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {SECTION_IDS.map((sectionId) => {
            const active = activeSection === sectionId;
            return (
              <button
                key={sectionId}
                type="button"
                onClick={() => setActiveSection(sectionId)}
                className="transition-all duration-200"
              >
                <NeonBadge
                  color={SECTION_BADGE_COLORS[sectionId]}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 text-sm font-semibold cursor-pointer transition-all",
                    active && "shadow-[0_0_12px_#00D4FF66] border-neon-cyan"
                  )}
                >
                  {SECTION_ICONS[sectionId]}
                  {t(`desktop.categoryPage.sections.${sectionId}`)}
                </NeonBadge>
              </button>
            );
          })}
        </div>

        {/* Catalog Showcase */}
        {isLoading ? (
          <div className="py-20 text-center text-text-primary/50 text-sm">
            Loading products catalog...
          </div>
        ) : (
          <Showcase
            eyebrow={t(`desktop.categoryPage.sections.${activeSection}`)}
            title={t('desktop.categoryPage.catalogTitle')}
            list={displayedList}
            paginated={false}
            onClickCard={(item) => navigate(`/products/${item.id}`)}
          />
        )}

        {/* Pagination */}
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
