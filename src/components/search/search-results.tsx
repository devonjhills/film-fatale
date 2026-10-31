import { MediaGrid } from "@/components/shared/media-grid";
import { Section } from "@/components/shared/section";
import { PersonGrid } from "./person-grid";
import type { MultiSearchResult } from "@/lib/types";

export function SearchResults({ results }: { results: MultiSearchResult }) {
  const { movieResults, tvResults, peopleResults } = results;

  return (
    <div className="space-y-12">
      {movieResults.length > 0 && (
        <Section title={`Movies (${movieResults.length})`}>
          <MediaGrid items={movieResults} mediaType="movie" />
        </Section>
      )}

      {tvResults.length > 0 && (
        <Section title={`TV shows (${tvResults.length})`}>
          <MediaGrid items={tvResults} mediaType="tv" />
        </Section>
      )}

      {peopleResults.length > 0 && (
        <Section title={`People (${peopleResults.length})`}>
          <PersonGrid people={peopleResults} />
        </Section>
      )}
    </div>
  );
}
