"use client";

import { useSearchParams } from "next/navigation";
import { BrowsePage } from "@/components/search/browse-page";
import { useEffect, useState } from "react";

export function SearchPageClient() {
  const searchParams = useSearchParams();
  const [currentQuery, setCurrentQuery] = useState(searchParams.get("q") || "");

  // Update query when URL search params change
  useEffect(() => {
    const newQuery = searchParams.get("q") || "";
    setCurrentQuery(newQuery);
  }, [searchParams]);

  return <BrowsePage key={currentQuery} initialQuery={currentQuery} />;
}
