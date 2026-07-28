-- SafeSteps analytics — raw event log plus the permanent aggregates.
--
-- `events` is transient: the hourly cron folds settled sessions into the agg_*
-- tables and deletes their rows, so this table stays roughly constant in size
-- however many people play. Everything in agg_* is a count or a sum — never a
-- percentage or an average, because those cannot be merged across runs without
-- silently weighting a 3-player week like a 300-player one. Rates are computed
-- at read time in /dashboard.json.

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at INTEGER NOT NULL,          -- epoch ms, set server-side
  sid         TEXT    NOT NULL,          -- random per-tab id, not a person
  test        INTEGER NOT NULL DEFAULT 0,-- 1 when the tab had ?test=1
  event       TEXT    NOT NULL,
  chapter     TEXT,
  scene       TEXT,
  pick        TEXT,
  verdict     TEXT,
  pct         REAL,
  tier        TEXT,
  flow        TEXT,
  step        INTEGER,
  ms          INTEGER                    -- ms since page load, orders the funnel
);

-- The aggregation groups by sid and filters on received_at, so both are indexed.
CREATE INDEX IF NOT EXISTS events_sid_idx      ON events (sid);
CREATE INDEX IF NOT EXISTS events_received_idx ON events (received_at);

-- Headline counters: players, finishers, saw_tutorial, finished_report.
CREATE TABLE IF NOT EXISTS agg_headline (
  metric TEXT PRIMARY KEY,
  value  INTEGER NOT NULL DEFAULT 0
);

-- order_sum/order_n give a mean ms-since-load, which is mergeable across runs.
-- A median would not be, which is why the funnel is ordered by the mean.
CREATE TABLE IF NOT EXISTS agg_scene (
  scene      TEXT PRIMARY KEY,
  players    INTEGER NOT NULL DEFAULT 0,
  order_sum  INTEGER NOT NULL DEFAULT 0,
  order_n    INTEGER NOT NULL DEFAULT 0,
  first_n    INTEGER NOT NULL DEFAULT 0,
  first_good INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS agg_flow (
  flow    TEXT PRIMARY KEY,
  started INTEGER NOT NULL DEFAULT 0,
  done    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS agg_chapter (
  chapter     TEXT PRIMARY KEY,
  completions INTEGER NOT NULL DEFAULT 0,
  pct_sum     REAL    NOT NULL DEFAULT 0,
  pct_n       INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS agg_tier (
  chapter TEXT NOT NULL,
  tier    TEXT NOT NULL,
  n       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chapter, tier)
);

-- Remembers which sids have already been counted, so a player who idles past the
-- settle window and then carries on is not counted as a second player. Pruned
-- after SEEN_RETAIN_DAYS, which bounds it — it holds no event data, only flags.
CREATE TABLE IF NOT EXISTS seen_sid (
  sid              TEXT PRIMARY KEY,
  last_at          INTEGER NOT NULL,
  counted_player   INTEGER NOT NULL DEFAULT 0,
  counted_finisher INTEGER NOT NULL DEFAULT 0,
  counted_tutorial INTEGER NOT NULL DEFAULT 0,
  counted_report   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS seen_sid_last_idx ON seen_sid (last_at);

CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);

INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', '1');
