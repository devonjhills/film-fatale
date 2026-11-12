import { MediaGrid } from "@/components/shared/media-grid";
import { Panel, PanelNote } from "@/components/ui/panel";
import { PersonGrid } from "./person-grid";
import type { MultiSearchResult } from "@/lib/types";

export function SearchResults({ results }: { results: MultiSearchResult }) {
  const { movieResults, tvResults, peopleResults } = results;

  return (
    <div className="space-y-5 md:space-y-6">
      {movieResults.length > 0 && (
        <Panel title="Movies" aside={<PanelNote>{movieResults.length}</PanelNote>}>
          <MediaGrid items={movieResults} mediaType="movie" />
        </Panel>
      )}

      {tvResults.length > 0 && (
        <Panel title="TV shows" aside={<PanelNote>{tvResults.length}</PanelNote>}>
          <MediaGrid items={tvResults} mediaType="tv" />
        </Panel>
      )}

      {peopleResults.length > 0 && (
        <Panel title="People" aside={<PanelNote>{peopleResults.length}</PanelNote>}>
          <PersonGrid people={peopleResults} />
        </Panel>
      )}
    </div>
  );
}
