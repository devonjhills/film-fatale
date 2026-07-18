"use client";

import { useSearchParams, useRouter } from "next/navigation";

interface PaginationData {
  currentPage: number;
  handlePageChange: (page: number) => void;
}

/**
 * Hook for managing pagination state and URL synchronization
 */
export function usePaginatedData(): PaginationData {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageParam = searchParams.get("page");

  const parsedPage = pageParam ? Number.parseInt(pageParam, 10) : 1;
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // Update URL when page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    const search = params.toString();
    const newUrl = search ? `?${search}` : "";
    router.push(newUrl, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    currentPage,
    handlePageChange,
  };
}
