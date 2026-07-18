CREATE TABLE IF NOT EXISTS viewing_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
  title TEXT NOT NULL,
  poster_path TEXT,
  overview TEXT,
  release_date TEXT,
  vote_average REAL,
  status TEXT NOT NULL CHECK (status IN ('watching', 'completed', 'plan_to_watch')),
  watch_count INTEGER NOT NULL DEFAULT 1,
  started_at TEXT,
  completed_at TEXT,
  last_watched_at TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 10),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, tmdb_id, media_type)
);

CREATE INDEX IF NOT EXISTS viewing_history_user_status
  ON viewing_history (user_id, status, last_watched_at DESC);

CREATE TABLE IF NOT EXISTS episode_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tmdb_id INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  watched INTEGER NOT NULL DEFAULT 0 CHECK (watched IN (0, 1)),
  watched_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, tmdb_id, season_number, episode_number)
);

CREATE INDEX IF NOT EXISTS episode_progress_user_show
  ON episode_progress (user_id, tmdb_id, season_number, episode_number);
