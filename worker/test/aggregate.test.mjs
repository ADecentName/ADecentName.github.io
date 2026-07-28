// Verifies aggregate.js against a stubbed D1 — no wrangler, no network, no
// database. Run with `npm test` from worker/.
//
// What this pins down is the part that cannot be fixed after the fact: once raw
// events are purged, a wrong metric definition is a wrong number forever. So the
// checks are about *meaning* — that a player is counted once, that "first
// attempt" is the earliest answer and not the last, that flagged rows never reach
// the totals, and that the DELETE shares a transaction with the upserts.

import { aggregateAndPurge } from '../src/aggregate.js'

let failures = 0
function check(name, actual, expected) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) {
    console.log(`  FAIL ${name}: got ${a}, want ${e}`)
    failures++
  } else {
    console.log(`  ok   ${name} = ${a}`)
  }
}

function makeDB({ settled, rows, seen }) {
  const batches = []
  const stmt = (sql) => ({
    sql,
    binds: [],
    bind(...args) { this.binds = args; return this },
    async all() {
      if (sql.includes('GROUP BY sid')) return { results: settled.map((sid) => ({ sid })) }
      if (sql.includes('FROM events WHERE sid IN')) return { results: rows }
      if (sql.includes('FROM seen_sid WHERE sid IN')) return { results: seen }
      return { results: [] }
    },
    async first() { return {} },
    async run() { return {} },
  })
  return {
    batches,
    prepare(sql) { return stmt(sql) },
    async batch(stmts) { batches.push(stmts); return [] },
  }
}

// Pulls the bound values for a given table out of the captured batches.
function upserts(db, table) {
  const out = []
  db.batches.forEach((b) => b.forEach((s) => {
    if (s.sql.includes(`INTO ${table}`)) out.push(s.binds)
  }))
  return out
}

function headline(db) {
  const h = {}
  upserts(db, 'agg_headline').forEach(([metric, value]) => { h[metric] = value })
  return h
}

// sid a: answers b_s1 correctly first, then wrongly — so first_good must count it
// as correct. sid b: answers wrongly. sid c: flagged test.
const rows = [
  { sid: 'a', test: 0, event: 'scene_view', scene: 'b_s1', ms: 1000 },
  { sid: 'a', test: 0, event: 'choice', scene: 'b_s1', verdict: 'good', ms: 1200 },
  { sid: 'a', test: 0, event: 'choice', scene: 'b_s1', verdict: 'risky', ms: 1500 },
  { sid: 'a', test: 0, event: 'tutorial_step', flow: 'tiktok-report', ms: 2000 },
  { sid: 'a', test: 0, event: 'tutorial_complete', flow: 'tiktok-report', ms: 2500 },
  { sid: 'a', test: 0, event: 'chapter_complete', chapter: 'boundaries', pct: 80, tier: 'Boundary Master' },
  { sid: 'a', test: 0, event: 'results_view', ms: 3000 },
  { sid: 'b', test: 0, event: 'scene_view', scene: 'b_s1', ms: 900 },
  { sid: 'b', test: 0, event: 'choice', scene: 'b_s1', verdict: 'risky', ms: 1100 },
  { sid: 'c', test: 1, event: 'scene_view', scene: 'b_s1', ms: 800 },
  { sid: 'c', test: 1, event: 'choice', scene: 'b_s1', verdict: 'good', ms: 950 },
]

console.log('\ncase 1 — fresh sids, test rows excluded')
{
  const db = makeDB({ settled: ['a', 'b', 'c'], rows, seen: [] })
  const res = await aggregateAndPurge({ DB: db, SETTLE_MINUTES: '45' })

  check('sessions', res.sessions, 3)
  check('rows purged', res.rows, 11)

  const h = headline(db)
  check('players', h.players, 2)          // c is flagged, so it is not counted
  check('finishers', h.finishers, 1)
  check('saw_tutorial', h.saw_tutorial, 1)
  check('finished_report', h.finished_report, 1)

  // scene, players, order_sum, order_n, first_n, first_good
  const scene = upserts(db, 'agg_scene')[0]
  check('scene id', scene[0], 'b_s1')
  check('scene players', scene[1], 2)
  check('first_n', scene[4], 2)
  check('first_good', scene[5], 1)        // earliest answer wins, not the latest

  check('flow', upserts(db, 'agg_flow')[0], ['tiktok-report', 1, 1])
  check('chapter', upserts(db, 'agg_chapter')[0], ['boundaries', 1, 80, 1])
  // Tier names contain spaces; an earlier version joined chapter+tier into one
  // string key and split it back apart, which corrupted them.
  check('tier name survives', upserts(db, 'agg_tier')[0], ['boundaries', 'Boundary Master', 1])

  const deletes = db.batches.flat().filter((s) => s.sql.startsWith('DELETE FROM events'))
  check('one DELETE', deletes.length, 1)
  check('DELETE covers every settled sid', deletes[0].binds, ['a', 'b', 'c'])
  const sameBatch = db.batches.some((b) =>
    b.some((s) => s.sql.includes('INTO agg_headline')) &&
    b.some((s) => s.sql.startsWith('DELETE FROM events')))
  check('DELETE shares the batch with the upserts', sameBatch, true)
}

console.log('\ncase 2 — sid a already counted, so it must not count twice')
{
  const db = makeDB({
    settled: ['a', 'b'],
    rows: rows.filter((r) => r.sid !== 'c'),
    seen: [{ sid: 'a', counted_player: 1, counted_finisher: 1, counted_tutorial: 1, counted_report: 1 }],
  })
  await aggregateAndPurge({ DB: db, SETTLE_MINUTES: '45' })
  const h = headline(db)
  check('players (only b is new)', h.players, 1)
  check('finishers (a already counted)', h.finishers, undefined)
  check('finished_report (a already counted)', h.finished_report, undefined)
}

console.log('\ncase 3 — AGGREGATE_TEST_ROWS counts the flagged session')
{
  const db = makeDB({ settled: ['a', 'b', 'c'], rows, seen: [] })
  await aggregateAndPurge({ DB: db, SETTLE_MINUTES: '45', AGGREGATE_TEST_ROWS: 'true' })
  check('players includes c', headline(db).players, 3)
  check('first_good includes c', upserts(db, 'agg_scene')[0][5], 2)
}

console.log('\ncase 4 — nothing settled yet')
{
  const db = makeDB({ settled: [], rows: [], seen: [] })
  const res = await aggregateAndPurge({ DB: db, SETTLE_MINUTES: '45' })
  check('no-op', res, { sessions: 0, rows: 0, chunks: 0 })
  check('nothing written', db.batches.length, 0)
}

console.log(failures ? `\n${failures} FAILURE(S)\n` : '\nall checks passed\n')
process.exit(failures ? 1 : 0)
