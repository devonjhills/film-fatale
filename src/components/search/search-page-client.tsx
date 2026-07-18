"use client";

import { useSearchParams } from "next/navigation";
import { BrowsePage } from "@/components/search/browse-page";

export function SearchPageClient() {
  const searchParams = useSearchParams();
  return <BrowsePage initialQuery={searchParams.get("q") || ""} />;
}
