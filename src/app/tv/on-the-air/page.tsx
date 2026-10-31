import { CategoryPage, categoryMetadata } from "@/components/category/category-page";

export const metadata = categoryMetadata("tv", "on-the-air");

export default function OnTheAirTVPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CategoryPage media="tv" slug="on-the-air" searchParams={searchParams} />;
}
