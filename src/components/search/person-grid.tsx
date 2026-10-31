import { PersonTile } from "@/components/person/person-tile";
import type { Person } from "@/lib/types";

/** People search results: portrait tiles subtitled with their best-known title. */
export function PersonGrid({ people }: { people: Person[] }) {
  return (
    <div className="poster-grid">
      {people.map((person) => {
        const knownFor = person.known_for?.[0];
        const knownForTitle = knownFor
          ? "title" in knownFor
            ? knownFor.title
            : knownFor.name
          : null;
        return (
          <PersonTile
            key={person.id}
            person={person}
            subtitle={knownForTitle ?? person.known_for_department}
          />
        );
      })}
    </div>
  );
}
