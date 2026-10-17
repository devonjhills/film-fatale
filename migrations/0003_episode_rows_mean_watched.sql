-- The UNIQUE (user_id, tmdb_id, season_number, episode_number) constraint
-- already indexes these columns; the copy only doubled the cost of writes.
DROP INDEX IF EXISTS episode_progress_user_show;

-- Episodes are now deleted when unwatched, so a row always means watched.
DELETE FROM episode_progress WHERE watched = 0;
