import { CategoryPage, categoryMetadata } from "@/components/category/category-page";

export const metadata = categoryMetadata("movie", "now-playing");

export default function NowPlayingMoviesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryPage media="movie" slug="now-playing" searchParams={searchParams} />;
}
