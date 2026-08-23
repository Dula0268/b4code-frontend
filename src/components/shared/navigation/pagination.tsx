"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  /** Zero-based current page index, matching the Spring `Page` contract. */
  page: number;
  /** Total number of pages, from the backend `totalPages`. */
  totalPages: number;
  /** Total number of matching rows, from the backend `totalElements`. */
  totalItems?: number;
  /** Rows requested per page, from the backend `size`. */
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Builds a windowed list of page indexes, e.g. [0, -1, 4, 5, 6, -1, 19].
 * `-1` marks an ellipsis gap.
 */
function buildPageWindow(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages = new Set<number>([0, totalPages - 1, page]);
  if (page - 1 > 0) pages.add(page - 1);
  if (page + 1 < totalPages - 1) pages.add(page + 1);
  if (page <= 2) {
    pages.add(1);
    pages.add(2);
    pages.add(3);
  }
  if (page >= totalPages - 3) {
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
    pages.add(totalPages - 4);
  }

  const sorted = [...pages].filter((p) => p >= 0 && p < totalPages).sort((a, b) => a - b);

  const withGaps: number[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push(-1);
    withGaps.push(p);
  });
  return withGaps;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: PaginationProps) {
  const t = useTranslations("Pagination");

  if (totalPages <= 1) return null;

  const safePage = Math.min(Math.max(page, 0), totalPages - 1);
  const from = pageSize ? safePage * pageSize + 1 : undefined;
  const to =
    pageSize && totalItems !== undefined
      ? Math.min((safePage + 1) * pageSize, totalItems)
      : undefined;

  return (
    <nav
      aria-label={t("label")}
      className={`flex-none flex items-center justify-between gap-2 px-4 py-2 border-t border-[var(--gray-5)] bg-white/50 ${className}`}
    >
      {from !== undefined && to !== undefined && totalItems !== undefined ? (
        <p className="text-[10px] text-[var(--gray-3)] hidden sm:block m-0">
          {t.rich("showing", {
            from,
            to,
            total: totalItems,
            strong: (chunks) => (
              <span className="font-bold text-[var(--black-2)]">{chunks}</span>
            ),
          })}
        </p>
      ) : (
        <p className="text-[10px] text-[var(--gray-3)] hidden sm:block m-0">
          {t("pageOf", { page: safePage + 1, total: totalPages })}
        </p>
      )}

      <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          aria-label={t("previous")}
          disabled={safePage === 0}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft size={12} />
        </Button>

        <div className="flex gap-1">
          {buildPageWindow(safePage, totalPages).map((p, i) =>
            p === -1 ? (
              <span
                key={`gap-${i}`}
                aria-hidden="true"
                className="h-6 w-4 flex items-end justify-center text-[10px] text-[var(--gray-3)]"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={safePage === p ? "default" : "outline"}
                size="icon"
                aria-label={t("goToPage", { page: p + 1 })}
                aria-current={safePage === p ? "page" : undefined}
                className={`h-6 w-6 text-[10px] ${
                  safePage === p
                    ? "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90"
                    : ""
                }`}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6"
          aria-label={t("next")}
          disabled={safePage === totalPages - 1}
          onClick={() => onPageChange(safePage + 1)}
        >
          <ChevronRight size={12} />
        </Button>
      </div>
    </nav>
  );
}
