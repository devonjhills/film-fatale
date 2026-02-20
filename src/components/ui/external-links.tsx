"use client";

import { Icons } from "@/components/ui/icons";
import { getRottenTomatoesSearchUrl, formatYear } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ExternalIds } from "@/lib/types";

interface ExternalLinksProps {
  externalIds?: ExternalIds;
  homepage?: string;
  title: string;
  releaseDate?: string;
  className?: string;
}

export function ExternalLinks({
  externalIds,
  homepage,
  title,
  releaseDate,
  className,
}: ExternalLinksProps) {
  const year = releaseDate ? formatYear(releaseDate) : undefined;
  const rottenTomatoesUrl = getRottenTomatoesSearchUrl(title, year);

  const links = [
    {
      name: "IMDb",
      url: externalIds?.imdb_id
        ? `https://www.imdb.com/title/${externalIds.imdb_id}`
        : null,
      icon: Icons.Film,
    },
    {
      name: "Official Site",
      url: homepage,
      icon: Icons.Globe,
    },
    {
      name: "Rotten Tomatoes",
      url: rottenTomatoesUrl,
      icon: Icons.Popcorn,
    },
  ].filter((link) => link.url);

  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {links.map((link) => {
        const IconComponent = link.icon;
        return (
          <Button key={link.name} asChild variant="outline" size="sm">
            <a href={link.url!} target="_blank" rel="noopener noreferrer">
              <IconComponent className="h-4 w-4 mr-2" />
              {link.name}
            </a>
          </Button>
        );
      })}
    </div>
  );
}
