import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { CalendarDay, CalendarMonth } from "@/lib/types";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear().toString(),
    );
    const month = parseInt(
      searchParams.get("month") || (new Date().getMonth() + 1).toString(),
    );

    // Get the first and last day of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startISO = startDate.toISOString().split("T")[0];
    const endISO = endDate.toISOString().split("T")[0];

    // Production: Use Postgres
    const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      interface CalendarRow {
        watch_date: string;
        tmdb_id: number;
        media_type: "movie" | "tv";
        title: string;
        poster_path: string | null;
        session_count: number;
      }

      const { rows } = (await sql`
        SELECT 
          DATE(last_watched_at) as watch_date,
          tmdb_id,
          media_type,
          title,
          poster_path,
          COUNT(*) as session_count
        FROM viewing_history 
        WHERE user_id = ${session.user.id}
        AND last_watched_at IS NOT NULL
        AND DATE(last_watched_at) >= ${startISO}
        AND DATE(last_watched_at) <= ${endISO}
        GROUP BY DATE(last_watched_at), tmdb_id, media_type, title, poster_path
        ORDER BY watch_date ASC
      `) as { rows: CalendarRow[] };

      // Group by date
      const dayMap = new Map<string, CalendarDay>();

      rows.forEach((row) => {
        const date = row.watch_date;

        if (!dayMap.has(date)) {
          dayMap.set(date, {
            date,
            watchedItems: [],
          });
        }

        dayMap.get(date)!.watchedItems.push({
          tmdb_id: row.tmdb_id,
          media_type: row.media_type,
          title: row.title,
          poster_path: row.poster_path,
          session_count: row.session_count,
        });
      });

      // Create array of all days in the month
      const days: CalendarDay[] = [];
      for (let day = 1; day <= endDate.getDate(); day++) {
        const dateString = new Date(year, month - 1, day)
          .toISOString()
          .split("T")[0];
        const dayData = dayMap.get(dateString) || {
          date: dateString,
          watchedItems: [],
        };
        days.push(dayData);
      }

      const calendarMonth: CalendarMonth = {
        year,
        month,
        days,
      };

      return NextResponse.json(calendarMonth);
    }

    // Development: Use in-memory storage (simplified)
    const calendarMonth: CalendarMonth = {
      year,
      month,
      days: Array.from({ length: endDate.getDate() }, (_, i) => ({
        date: new Date(year, month - 1, i + 1).toISOString().split("T")[0],
        watchedItems: [],
      })),
    };

    return NextResponse.json(calendarMonth);
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
