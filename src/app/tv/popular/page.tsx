import { CategoryPage, categoryMetadata } from "@/components/category/category-page";

export const metadata = categoryMetadata("tv", "popular");

export default function PopularTVPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryPage media="tv" slug="popular" searchParams={searchParams} />;
}
