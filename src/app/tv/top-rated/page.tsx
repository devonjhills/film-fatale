import { CategoryPage, categoryMetadata } from "@/components/category/category-page";

export const metadata = categoryMetadata("tv", "top-rated");

export default function TopRatedTVPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryPage media="tv" slug="top-rated" searchParams={searchParams} />;
}
