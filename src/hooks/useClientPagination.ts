import { useState, useEffect } from "react";

interface UseClientPaginationOptions {
  itemsPerPage?: number;
  items: any[];
  resetOnChange?: boolean;
}

export function useClientPagination({
  itemsPerPage = 10,
  items,
  resetOnChange = true,
}: UseClientPaginationOptions) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (resetOnChange) {
      setCurrentPage(1);
    }
  }, [items, resetOnChange]);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedItems = items.slice(startIdx, endIdx);

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(pageNum);
  };

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return {
    currentPage,
    totalPages,
    paginatedItems,
    startIdx: startIdx + 1,
    endIdx,
    totalItems: items.length,
    goToPrevious,
    goToNext,
    goToPage,
    canGoPrevious,
    canGoNext,
    setCurrentPage,
  };
}
