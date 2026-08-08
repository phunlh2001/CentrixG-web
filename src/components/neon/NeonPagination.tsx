import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BaseButton from "../ui/BaseButton";
import BaseIconButton from "../ui/BaseIconButton";

type NeonPaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

const navButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200 select-none disabled:cursor-not-allowed disabled:border-neon-cyan/6 disabled:text-text-primary/20 enabled:border-neon-cyan/15 enabled:bg-neon-cyan/5 enabled:text-neon-cyan/70 enabled:hover:border-neon-cyan/40 enabled:hover:text-neon-cyan";

const pageButtonClassName =
  "flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200 select-none";

function getVisiblePages(page: number, totalPages: number) {
  const pages: (number | "...")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (page > 3) pages.push("...");

  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(totalPages - 1, page + 1);
    i++
  ) {
    pages.push(i);
  }

  if (page < totalPages - 2) pages.push("...");
  pages.push(totalPages);

  return pages;
}

export default function NeonPagination({
  page,
  totalPages,
  onChange,
}: NeonPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-1.5">
      <BaseIconButton
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={navButtonClassName}
      >
        <ChevronLeft size={16} />
      </BaseIconButton>

      {getVisiblePages(page, totalPages).map((visiblePage, index) =>
        visiblePage === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="flex justify-center items-center w-9 h-9 text-text-primary/30 text-sm"
          >
            ...
          </span>
        ) : (
          <BaseButton
            variant="custom"
            key={visiblePage}
            onClick={() => onChange(visiblePage)}
            className={clsx(
              pageButtonClassName,
              visiblePage === page
                ? "border-neon-cyan/50 bg-neon-cyan/14 text-neon-cyan shadow-[0_0_12px_#00D4FF33]"
                : "border-neon-cyan/10 text-text-primary/55 hover:border-neon-cyan/30 hover:text-text-primary/90",
            )}
          >
            {visiblePage}
          </BaseButton>
        ),
      )}

      <BaseIconButton
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={navButtonClassName}
      >
        <ChevronRight size={16} />
      </BaseIconButton>
    </div>
  );
}
