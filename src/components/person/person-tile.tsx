import Image from "next/image";
import Link from "@/components/ui/app-link";
import { User } from "@/components/ui/icons";
import { getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PersonTileProps {
  person: { id: number; name: string; profile_path: string | null };
  /** Character, job or best-known title. */
  subtitle?: string | null;
  /** Small trailing detail, e.g. an episode count. */
  detail?: string | null;
  className?: string;
}

/** A portrait tile that matches MediaCard, for cast and people grids. */
export function PersonTile({ person, subtitle, detail, className }: PersonTileProps) {
  const profileUrl = getImageUrl(person.profile_path, "profile", "h632");

  return (
    <article className={cn("min-w-0", className)}>
      <Link href={`/person/${person.id}`} className="tile">
        <div className="tile-art">
          {profileUrl ? (
            <Image
              src={profileUrl}
              alt=""
              fill
              sizes="(max-width: 639px) 33vw, 180px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <User className="size-7 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="tile-body">
          <h3 className="line-clamp-2 text-ui font-medium leading-snug text-foreground">
            {person.name}
          </h3>
          {subtitle && (
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{subtitle}</p>
          )}
          {detail && (
            <p className="mt-auto pt-1 text-xs tabular-nums text-muted-foreground">{detail}</p>
          )}
        </div>
      </Link>
    </article>
  );
}
