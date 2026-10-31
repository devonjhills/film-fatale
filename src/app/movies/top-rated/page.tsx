import { CategoryPage, categoryMetadata } from "@/components/category/category-page";

export const metadata = categoryMetadata("movie", "top-rated");

export default function TopRatedMoviesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryPage media="movie" slug="top-rated" searchParams={searchParams} />;
}
