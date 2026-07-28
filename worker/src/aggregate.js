// Folds settled sessions into the agg_* tables, then deletes their raw rows.
//
// Why this is much simpler than the Apps Script version it replaces: D1 gives us
// atomic batches and upserts. `INSERT ... ON CONFLICT DO UPDATE SET x = x +
// excluded.x` merges a delta in one statement, and D1's batch() runs the whole
// set — every upsert plus the DELETE — as a single transaction. Either the
// aggregates move and the rows go, or neither happens. That removes the batch
// tokens, the pending-delta store and the crash-recovery pass that Sheets needed
// only because it has no transactions.

// A session is only aggregated once it has been quiet this long. Sessions must
// never be split across two runs: half a session in each would double-count the
// player and could resolve the wrong "first attempt" at a scene.
const DEFAULT_SETTLE_MINUTES = 45

// Whole sessions per run, so an hourly cron never runs long. Leftovers wait for
// the next tick.
const MAX_SESSIONS_PER_RUN = 2000

// SQLite caps bound parameters per statement (999). Sessions are processed in
// chunks well inside that, each chunk its own atomic batch.
const CHUNK = 100

const SEEN_RETAIN_DAYS = 30

export async function aggregateAndPurge(env) {
  const settleMs = num(env.SETTLE_MINUTES, DEFAULT_SETTLE_MINUTES) * 60000
  const includeTest = String(env.AGGREGATE_TEST_ROWS) === 'true'
  const cutoff = Date.now() - settleMs

  const settled = await env.DB.prepare(
    `SELECT sid FROM events GROUP BY sid HAVING MAX(received_at) < ?1 LIMIT ?2`,
  ).bind(cutoff, MAX_SESSIONS_PER_RUN).all()

  const sids = (settled.results || []).map(function (r) { return r.sid })
  if (!sids.length) return { sessions: 0, rows: 0, chunks: 0 }

  let rowsPurged = 0
  let chunks = 0

  for (let i = 0; i < sids.length; i += CHUNK) {
    const chunk = sids.slice(i, i + CHUNK)
    rowsPurged += await processChunk_(env, chunk, includeTest)
    chunks++
  }

  await bumpMeta_(env, sids.length, rowsPurged)
  await env.DB.prepare(`DELETE FROM seen_sid WHERE last_at < ?1`)
    .bind(Date.now() - SEEN_RETAIN_DAYS * 86400000).run()

  return { sessions: sids.length, rows: rowsPurged, chunks: chunks }
}

async function processChunk_(env, sids, includeTest) {
  const marks = sids.map(function (_, i) { return '?' + (i + 1) }).join(',')

  const raw = await env.DB.prepare(
    `SELECT sid, test, event, chapter, scene, verdict, pct, tier, flow, ms
       FROM events WHERE sid IN (${marks})`,
  ).bind(...sids).all()

  const rows = raw.results || []
  if (!rows.length) return 0

  const seenRes = await env.DB.prepare(
    `SELECT sid, counted_player, counted_finisher, counted_tutorial, counted_report
       FROM seen_sid WHERE sid IN (${marks})`,
  ).bind(...sids).all()

  const seen = {}
  const seenRows = seenRes.results || []
  seenRows.forEach(function (r) { seen[r.sid] = r })

  const counted = includeTest ? rows : rows.filter(function (r) { return !r.test })
  const delta = reduce_(counted, seen)

  await env.DB.batch(statements_(env, delta, sids, marks))

  return rows.length
}

// --- reducing rows to a delta ---------------------------------------------

// Mirrors the metric definitions the Sheets dashboard used, so the numbers stay
// comparable across the cutover.
function reduce_(rows, seen) {
  const perSid = {}
  const scenes = {}
  const flows = {}
  const chapters = {}
  const tiers = {}
  const first = {}

  rows.forEach(function (r) {
    if (!r.sid) return
    const s = (perSid[r.sid] = perSid[r.sid] ||
      { finisher: 0, tutorial: 0, report: 0 })

    if (r.event === 'results_view') s.finisher = 1
    if (r.event === 'tutorial_step' || r.event === 'tutorial_complete') s.tutorial = 1
    if (r.event === 'tutorial_complete' && r.flow !== 'ig-privacy') s.report = 1

    if ((r.event === 'scene_view' || r.event === 'choice') && r.scene) {
      const sc = (scenes[r.scene] = scenes[r.scene] ||
        { sids: {}, order_sum: 0, order_n: 0, first_n: 0, first_good: 0 })
      sc.sids[r.sid] = 1
      if (r.ms !== null && r.ms !== undefined && !isNaN(Number(r.ms))) {
        sc.order_sum += Number(r.ms)
        sc.order_n++
      }
    }

    if (r.flow) {
      const f = (flows[r.flow] = flows[r.flow] || { started: {}, done: {} })
      f.started[r.sid] = 1
      if (r.event === 'tutorial_complete') f.done[r.sid] = 1
    }

    // First answer only, per player per scene: did they get it right unprompted?
    // Resolved here, while the raw rows still exist — all of one player's
    // attempts at a scene are in the same session, which is why whole sessions
    // are claimed together.
    if (r.event === 'choice' && r.verdict !== 'continue' && r.scene) {
      const key = r.sid + '|' + r.scene
      const ms = Number(r.ms || 0)
      if (!first[key] || ms < first[key].ms) {
        first[key] = { ms: ms, scene: r.scene, verdict: r.verdict }
      }
    }

    if (r.event === 'chapter_complete') {
      const id = r.chapter || '(none)'
      const c = (chapters[id] = chapters[id] || { completions: 0, pct_sum: 0, pct_n: 0 })
      c.completions++
      if (r.pct !== null && r.pct !== undefined && !isNaN(Number(r.pct))) {
        c.pct_sum += Number(r.pct)
        c.pct_n++
      }
      // Nested rather than a joined key: tier names contain spaces ("Boundary
      // Master"), so any string separator risks splitting one apart later.
      if (r.tier) {
        const byTier = (tiers[id] = tiers[id] || {})
        byTier[r.tier] = (byTier[r.tier] || 0) + 1
      }
    }
  })

  Object.keys(first).forEach(function (k) {
    const f = first[k]
    const sc = (scenes[f.scene] = scenes[f.scene] ||
      { sids: {}, order_sum: 0, order_n: 0, first_n: 0, first_good: 0 })
    sc.first_n++
    if (f.verdict === 'good') sc.first_good++
  })

  // Headline counters only move for a sid that has not already been counted, so a
  // player who idles past the settle window and resumes is still one player.
  const headline = { players: 0, finishers: 0, saw_tutorial: 0, finished_report: 0 }
  const seenUpserts = []
  Object.keys(perSid).forEach(function (sid) {
    const s = perSid[sid]
    const prev = seen[sid] || {}
    if (!prev.counted_player) headline.players++
    if (s.finisher && !prev.counted_finisher) headline.finishers++
    if (s.tutorial && !prev.counted_tutorial) headline.saw_tutorial++
    if (s.report && !prev.counted_report) headline.finished_report++
    seenUpserts.push({
      sid: sid,
      finisher: s.finisher || prev.counted_finisher ? 1 : 0,
      tutorial: s.tutorial || prev.counted_tutorial ? 1 : 0,
      report: s.report || prev.counted_report ? 1 : 0,
    })
  })

  const sceneList = Object.keys(scenes).map(function (id) {
    const sc = scenes[id]
    return {
      scene: id,
      players: Object.keys(sc.sids).length,
      order_sum: sc.order_sum,
      order_n: sc.order_n,
      first_n: sc.first_n,
      first_good: sc.first_good,
    }
  })

  const flowList = Object.keys(flows).map(function (id) {
    return {
      flow: id,
      started: Object.keys(flows[id].started).length,
      done: Object.keys(flows[id].done).length,
    }
  })

  const chapterList = Object.keys(chapters).map(function (id) {
    return {
      chapter: id,
      completions: chapters[id].completions,
      pct_sum: chapters[id].pct_sum,
      pct_n: chapters[id].pct_n,
    }
  })

  const tierList = []
  Object.keys(tiers).forEach(function (chapter) {
    Object.keys(tiers[chapter]).forEach(function (tier) {
      tierList.push({ chapter: chapter, tier: tier, n: tiers[chapter][tier] })
    })
  })

  return {
    headline: headline,
    scenes: sceneList,
    flows: flowList,
    chapters: chapterList,
    tiers: tierList,
    seen: seenUpserts,
  }
}

// --- one atomic batch -----------------------------------------------------

function statements_(env, d, sids, marks) {
  const S = []
  const p = function (sql) { return env.DB.prepare(sql) }

  Object.keys(d.headline).forEach(function (metric) {
    if (!d.headline[metric]) return
    S.push(p(
      `INSERT INTO agg_headline (metric, value) VALUES (?1, ?2)
       ON CONFLICT(metric) DO UPDATE SET value = value + excluded.value`,
    ).bind(metric, d.headline[metric]))
  })

  d.scenes.forEach(function (s) {
    S.push(p(
      `INSERT INTO agg_scene (scene, players, order_sum, order_n, first_n, first_good)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6)
       ON CONFLICT(scene) DO UPDATE SET
         players    = players    + excluded.players,
         order_sum  = order_sum  + excluded.order_sum,
         order_n    = order_n    + excluded.order_n,
         first_n    = first_n    + excluded.first_n,
         first_good = first_good + excluded.first_good`,
    ).bind(s.scene, s.players, s.order_sum, s.order_n, s.first_n, s.first_good))
  })

  d.flows.forEach(function (f) {
    S.push(p(
      `INSERT INTO agg_flow (flow, started, done) VALUES (?1, ?2, ?3)
       ON CONFLICT(flow) DO UPDATE SET
         started = started + excluded.started,
         done    = done    + excluded.done`,
    ).bind(f.flow, f.started, f.done))
  })

  d.chapters.forEach(function (c) {
    S.push(p(
      `INSERT INTO agg_chapter (chapter, completions, pct_sum, pct_n)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(chapter) DO UPDATE SET
         completions = completions + excluded.completions,
         pct_sum     = pct_sum     + excluded.pct_sum,
         pct_n       = pct_n       + excluded.pct_n`,
    ).bind(c.chapter, c.completions, c.pct_sum, c.pct_n))
  })

  d.tiers.forEach(function (t) {
    S.push(p(
      `INSERT INTO agg_tier (chapter, tier, n) VALUES (?1, ?2, ?3)
       ON CONFLICT(chapter, tier) DO UPDATE SET n = n + excluded.n`,
    ).bind(t.chapter, t.tier, t.n))
  })

  const now = Date.now()
  d.seen.forEach(function (s) {
    S.push(p(
      `INSERT INTO seen_sid
         (sid, last_at, counted_player, counted_finisher, counted_tutorial, counted_report)
       VALUES (?1, ?2, 1, ?3, ?4, ?5)
       ON CONFLICT(sid) DO UPDATE SET
         last_at          = excluded.last_at,
         counted_player   = 1,
         counted_finisher = MAX(counted_finisher, excluded.counted_finisher),
         counted_tutorial = MAX(counted_tutorial, excluded.counted_tutorial),
         counted_report   = MAX(counted_report,   excluded.counted_report)`,
    ).bind(s.sid, now, s.finisher, s.tutorial, s.report))
  })

  // Last in the batch: the purge. Same transaction as every upsert above, so the
  // rows can never be dropped without their numbers having landed.
  S.push(p(`DELETE FROM events WHERE sid IN (${marks})`).bind(...sids))

  return S
}

async function bumpMeta_(env, sessions, rows) {
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO meta (key, value) VALUES ('last_run', ?1)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ).bind(new Date().toISOString()),
    env.DB.prepare(
      `INSERT INTO meta (key, value) VALUES ('sessions_aggregated', ?1)
       ON CONFLICT(key) DO UPDATE SET
         value = CAST(CAST(value AS INTEGER) + CAST(excluded.value AS INTEGER) AS TEXT)`,
    ).bind(String(sessions)),
    env.DB.prepare(
      `INSERT INTO meta (key, value) VALUES ('rows_purged', ?1)
       ON CONFLICT(key) DO UPDATE SET
         value = CAST(CAST(value AS INTEGER) + CAST(excluded.value AS INTEGER) AS TEXT)`,
    ).bind(String(rows)),
  ])
}

function num(v, fallback) {
  const n = Number(v)
  return isNaN(n) ? fallback : n
}
