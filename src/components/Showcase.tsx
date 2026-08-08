import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { IProduct } from "../api/productApi";
import GameCard from "./GameCard";
import NeonPagination from "./neon/NeonPagination";
import SectionHeader from "./neon/SectionHeader";

const PAGE_SIZE = 15;

type ShowcaseProps = {
  title?: string;
  eyebrow?: string;
  list: IProduct[];
  viewAllHref?: string;
  paginated?: boolean;
  onClickCard?: (item: IProduct) => void;
};

export default function Showcase({
  title,
  eyebrow,
  list,
  viewAllHref,
  paginated = false,
  onClickCard,
}: ShowcaseProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  const totalPages = paginated ? Math.ceil(list.length / PAGE_SIZE) : 1;
  const visibleList = paginated
    ? list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : list;

  const handlePageChange = (p: number) => {
    setPage(p);
    // Scroll to the top of this section, not the page top
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef}>
      {title && (
        <div className="flex justify-between items-center mb-6">
          <SectionHeader title={title} eyebrow={eyebrow} />
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="font-semibold text-neon-cyan/65 hover:text-neon-cyan text-xs transition-colors"
            >
              {t("desktop.showcase.viewAll")}
            </Link>
          )}
        </div>
      )}

      <div className="gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleList.map((item, index) => (
          <GameCard
            key={item.id || index}
            item={item}
            onClick={() => onClickCard?.(item)}
          />
        ))}
      </div>

      {paginated && (
        <NeonPagination
          page={page}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      )}
    </section>
  );
}
