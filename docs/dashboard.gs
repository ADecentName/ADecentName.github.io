// SafeSteps — incremental aggregation so raw events can be purged on a schedule.
//
// Paste this into the same Apps Script project as the collector (Extensions →
// Apps Script → + → Script, name it "Dashboard"), save, then reload the Sheet.
// A "SafeSteps" menu appears.
//
// HOW THIS DIFFERS FROM A PLAIN REBUILD
// The old version recomputed everything from the raw `events` tab every run, so
// the numbers only existed for as long as the raw rows did. This version folds
// settled sessions into a small, permanent `agg` tab and then deletes their raw
// rows. `events` stays roughly constant in size no matter how many people play,
// so the dashboard keeps working forever — which is the whole point.
//
// THE TRADE YOU ARE MAKING
// Once raw rows are gone you can only ever compute the metrics `agg` already
// stores. The aggregates are marginal counts, not joint ones, so a *new*
// question about a past period ("did players who failed r_s1 drop out more?")
// is permanently unanswerable. If you want a new metric, add it here BEFORE the
// data it needs gets purged.

const EVENTS_TAB = 'events'
const DASH_TAB = 'dashboard'
const AGG_TAB = 'agg'

// Bumped whenever the meaning of a stored metric changes. Old aggregates cannot
// be recomputed after a purge, so a mismatch is reported rather than merged —
// silently adding v1 counts to v2 counts is the one unrecoverable mistake here.
const SCHEMA_VERSION = 1

// A session is only aggregated once it has been quiet this long. Sessions must
// never be split across two aggregation runs: half a session in each run would
// double-count the player and could pick the wrong "first attempt" at a scene.
// Longer than the longest plausible playthrough is the safe setting.
const SETTLE_MINUTES = 45

// Apps Script kills a run at 6 minutes. Whole sessions only — never a partial
// one, for the reason above — so this is a soft cap, not exact.
const MAX_ROWS_PER_RUN = 20000

// ?test=1 rows are deleted with everything else but never counted. Flip to true
// only to preview the layout against seeded data, then use "Reset all
// aggregates" — leaving it on quietly folds fake sessions into your real
// totals, and after the purge there is no way to subtract them again.
const AGGREGATE_TEST_ROWS = false

// Column indexes in `events`, read from the header row rather than assumed —
// the `test` column was added after the first version of the collector, so a
// sheet written by the older one has everything shifted one to the left. Read
// positionally and every row there looks flagged, which reads as "no real
// player data" when the data is fine.
let C = null

// Maps header names to indexes. A missing `test` column comes back as -1,
// which the filters read as "this sheet cannot flag test rows".
function mapColumns_(header) {
  const idx = {}
  header.forEach(function (h, i) {
    idx[String(h).trim().toLowerCase()] = i
  })
  const at = function (name, fallback) {
    return idx[name] === undefined ? fallback : idx[name]
  }
  return {
    at: at('received_at', 0),
    sid: at('sid', 1),
    test: idx.test === undefined ? -1 : idx.test,
    event: at('event', 2),
    chapter: at('chapter', 3),
    scene: at('scene', 4),
    pick: at('pick', 5),
    verdict: at('verdict', 6),
    pct: at('pct', 7),
    tier: at('tier', 8),
    flow: at('flow', 9),
    step: at('step', 10),
    ms: at('ms_since_load', 11),
    batch: idx.batch === undefined ? -1 : idx.batch,
    width: header.length,
  }
}

function isTest_(row) {
  return C.test >= 0 && Boolean(row[C.test])
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SafeSteps')
    .addItem('Rebuild dashboard', 'buildDashboard')
    .addItem('Aggregate & purge now', 'aggregateAndPurge')
    .addSeparator()
    .addItem('Install hourly aggregation', 'installTrigger')
    .addItem('Remove hourly aggregation', 'removeTrigger')
    .addSeparator()
    .addItem('Reset all aggregates', 'resetAggregates')
    .addToUi()
}

// --- the scheduled job ----------------------------------------------------

// Folds every settled session into `agg`, then deletes its raw rows.
//
// Crash safety. Unlike the old rebuild this is NOT idempotent — applying the
// same rows twice inflates every number permanently, with no raw data left to
// check against. So each run stamps the rows it is claiming with a batch token
// and records the delta under that token before merging it. Whatever step a
// crash interrupts, the next run can tell what already happened:
//
//   tagged, no pending, token > last_token  → delta never recorded; recompute
//   tagged, pending exists                  → recorded but not merged; merge it
//   tagged, token <= last_token             → already merged; just delete rows
function aggregateAndPurge() {
  const lock = LockService.getScriptLock()
  if (!lock.tryLock(30000)) return // another run (or the hourly trigger) has it
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const src = ss.getSheetByName(EVENTS_TAB)
    if (!src) return

    ensureBatchColumn_(src)
    const store = readStore_(ss)
    if (Number(store.meta.schema_version) !== SCHEMA_VERSION) {
      throw new Error(
        'The `agg` tab was written by schema v' + store.meta.schema_version +
        ' but this script is v' + SCHEMA_VERSION + '. Stored aggregates cannot ' +
        'be recomputed after a purge — reconcile by hand, or use "Reset all ' +
        'aggregates" if you are willing to lose the history.',
      )
    }

    let grid = src.getDataRange().getValues()
    C = mapColumns_(grid[0] || [])
    if (C.batch < 0) return

    recoverTaggedRows_(ss, src, grid, store)

    // Re-read: recovery may have deleted rows and shifted every index below.
    grid = src.getDataRange().getValues()
    claimAndMerge_(ss, src, grid, store)
  } finally {
    lock.releaseLock()
  }
}

// Phase 0 — deal with rows left tagged by an interrupted run.
function recoverTaggedRows_(ss, src, grid, store) {
  const byToken = {}
  for (let i = 1; i < grid.length; i++) {
    const t = grid[i][C.batch]
    if (t === '' || t === null || t === undefined) continue
    const key = String(t)
    ;(byToken[key] = byToken[key] || []).push(i)
  }
  const tokens = Object.keys(byToken).sort(function (a, b) { return Number(a) - Number(b) })
  if (!tokens.length) return

  let touched = false
  tokens.forEach(function (key) {
    const token = Number(key)
    if (store.meta.pending[key]) {
      mergeInto_(store.totals, store.meta.pending[key])
      delete store.meta.pending[key]
      touched = true
    } else if (token > Number(store.meta.last_token)) {
      // Tagged but never recorded — the delta is still derivable from the rows.
      const rows = byToken[key].map(function (i) { return grid[i] })
      mergeInto_(store.totals, reduceRows_(rows))
      touched = true
    }
    if (token > Number(store.meta.last_token)) store.meta.last_token = token
  })

  // Durable before deleting anything. If the delete below fails, the rows stay
  // tagged with a token <= last_token and the next run simply removes them.
  if (touched) writeStore_(ss, store)

  const indices = []
  tokens.forEach(function (key) { Array.prototype.push.apply(indices, byToken[key]) })
  deleteRowIndices_(src, indices)
}

// Phase 1 — claim the settled sessions and fold them in.
function claimAndMerge_(ss, src, grid, store) {
  const rows = grid.slice(1)
  if (!rows.length) return

  const cutoff = nowMs_() - SETTLE_MINUTES * 60 * 1000
  const lastSeen = {}
  rows.forEach(function (r) {
    const sid = r[C.sid]
    if (!sid) return
    const t = toMs_(r[C.at])
    if (lastSeen[sid] === undefined || t > lastSeen[sid]) lastSeen[sid] = t
  })

  // Group by sid so a session is claimed whole or not at all.
  const bySid = {}
  rows.forEach(function (r, i) {
    const sid = r[C.sid]
    if (!sid) return
    if (r[C.batch] !== '' && r[C.batch] !== null && r[C.batch] !== undefined) return
    if (lastSeen[sid] > cutoff) return // still playing
    ;(bySid[sid] = bySid[sid] || []).push(i + 1) // +1: grid index, header at 0
  })

  const claimed = []
  Object.keys(bySid).forEach(function (sid) {
    if (claimed.length >= MAX_ROWS_PER_RUN) return
    Array.prototype.push.apply(claimed, bySid[sid])
  })
  if (!claimed.length) return

  const token = Number(store.meta.last_token) + 1

  // Tag first. A crash here leaves rows tagged with no pending delta, which
  // recovery recomputes from the rows themselves.
  writeBatchTokens_(src, claimed, token)

  const counted = claimed
    .map(function (i) { return grid[i] })
    .filter(function (r) { return AGGREGATE_TEST_ROWS || !isTest_(r) })

  const delta = reduceRows_(counted)
  store.meta.pending[String(token)] = delta
  writeStore_(ss, store) // delta is now durable even if the merge dies

  mergeInto_(store.totals, delta)
  delete store.meta.pending[String(token)]
  store.meta.last_token = token
  store.meta.last_run = new Date().toISOString()
  store.meta.rows_purged = Number(store.meta.rows_purged || 0) + claimed.length
  writeStore_(ss, store)

  deleteRowIndices_(src, claimed)
}

// --- reducing raw rows to a delta ----------------------------------------

// Every metric here is a count or a sum, never a percentage or an average —
// those are computed at render time. Storing an average would silently weight a
// 3-player month equally against a 300-player month.
function reduceRows_(rows) {
  const delta = { headline: {}, scene: {}, flow: {}, chapter: {} }
  if (!rows.length) return delta

  const sids = {}
  const finishers = {}
  const sawTutorial = {}
  const finishedReport = {}
  const sceneSids = {}
  const flowStarted = {}
  const flowDone = {}
  const first = {}

  rows.forEach(function (r) {
    const sid = r[C.sid]
    const event = r[C.event]
    if (!sid) return
    sids[sid] = 1

    if (event === 'results_view') finishers[sid] = 1
    if (event === 'tutorial_step' || event === 'tutorial_complete') sawTutorial[sid] = 1
    if (event === 'tutorial_complete' && r[C.flow] !== 'ig-privacy') finishedReport[sid] = 1

    if ((event === 'scene_view' || event === 'choice') && r[C.scene]) {
      const id = r[C.scene]
      const s = (sceneSids[id] = sceneSids[id] || { sids: {}, ms_sum: 0, ms_n: 0 })
      s.sids[sid] = 1
      const ms = Number(r[C.ms])
      if (r[C.ms] !== '' && !isNaN(ms)) { s.ms_sum += ms; s.ms_n++ }
    }

    if (r[C.flow]) {
      const f = r[C.flow]
      ;(flowStarted[f] = flowStarted[f] || {})[sid] = 1
      if (event === 'tutorial_complete') (flowDone[f] = flowDone[f] || {})[sid] = 1
    }

    // First answer only, per player per scene: did they get it right unprompted?
    // Resolved here, while the raw rows still exist — all of one player's
    // attempts at a scene are in the same session, which is why claiming whole
    // sessions matters.
    if (event === 'choice' && r[C.verdict] !== 'continue') {
      const key = sid + '|' + r[C.scene]
      const ms = Number(r[C.ms] || 0)
      if (!first[key] || ms < first[key].ms) {
        first[key] = { ms: ms, scene: r[C.scene], verdict: r[C.verdict] }
      }
    }

    if (event === 'chapter_complete') {
      const id = r[C.chapter] || '(none)'
      const c = (delta.chapter[id] = delta.chapter[id] ||
        { completions: 0, pct_sum: 0, pct_n: 0, tiers: {} })
      c.completions++
      const pct = Number(r[C.pct])
      if (r[C.pct] !== '' && !isNaN(pct)) { c.pct_sum += pct; c.pct_n++ }
      if (r[C.tier]) c.tiers[r[C.tier]] = (c.tiers[r[C.tier]] || 0) + 1
    }
  })

  delta.headline = {
    players: Object.keys(sids).length,
    finishers: Object.keys(finishers).length,
    saw_tutorial: Object.keys(sawTutorial).length,
    finished_report: Object.keys(finishedReport).length,
  }

  Object.keys(sceneSids).forEach(function (id) {
    const s = sceneSids[id]
    delta.scene[id] = {
      players: Object.keys(s.sids).length,
      order_sum: s.ms_sum,
      order_n: s.ms_n,
      first_n: 0,
      first_good: 0,
    }
  })

  Object.keys(first).forEach(function (k) {
    const f = first[k]
    const s = (delta.scene[f.scene] = delta.scene[f.scene] ||
      { players: 0, order_sum: 0, order_n: 0, first_n: 0, first_good: 0 })
    s.first_n++
    if (f.verdict === 'good') s.first_good++
  })

  Object.keys(flowStarted).forEach(function (f) {
    delta.flow[f] = {
      started: Object.keys(flowStarted[f]).length,
      done: Object.keys(flowDone[f] || {}).length,
    }
  })

  return delta
}

// Distinct-player counts add across runs because a sid is per-tab, sessions are
// claimed whole, and a claimed session's rows are deleted — so no sid is ever
// counted by two runs.
function mergeInto_(totals, delta) {
  addFlat_(totals.headline, delta.headline)
  Object.keys(delta.scene || {}).forEach(function (id) {
    totals.scene[id] = totals.scene[id] ||
      { players: 0, order_sum: 0, order_n: 0, first_n: 0, first_good: 0 }
    addFlat_(totals.scene[id], delta.scene[id])
  })
  Object.keys(delta.flow || {}).forEach(function (id) {
    totals.flow[id] = totals.flow[id] || { started: 0, done: 0 }
    addFlat_(totals.flow[id], delta.flow[id])
  })
  Object.keys(delta.chapter || {}).forEach(function (id) {
    const c = (totals.chapter[id] = totals.chapter[id] ||
      { completions: 0, pct_sum: 0, pct_n: 0, tiers: {} })
    c.completions += Number(delta.chapter[id].completions || 0)
    c.pct_sum += Number(delta.chapter[id].pct_sum || 0)
    c.pct_n += Number(delta.chapter[id].pct_n || 0)
    const tiers = delta.chapter[id].tiers || {}
    Object.keys(tiers).forEach(function (t) {
      c.tiers[t] = (c.tiers[t] || 0) + Number(tiers[t])
    })
  })
}

function addFlat_(target, source) {
  Object.keys(source || {}).forEach(function (k) {
    target[k] = Number(target[k] || 0) + Number(source[k] || 0)
  })
}

// --- the aggregate store --------------------------------------------------

// `agg` is a flat scope/key/metric/value grid so it stays human-readable — you
// can open it and see exactly what the dashboard is built from.
function readStore_(ss) {
  let sheet = ss.getSheetByName(AGG_TAB)
  if (!sheet) {
    sheet = ss.insertSheet(AGG_TAB)
    sheet.appendRow(['scope', 'key', 'metric', 'value'])
    sheet.setFrozenRows(1)
    sheet.getRange(2, 1, 1, 4).setValues([['meta', '', 'schema_version', SCHEMA_VERSION]])
  }
  const store = {
    meta: { schema_version: SCHEMA_VERSION, last_token: 0, last_run: '', rows_purged: 0, pending: {} },
    totals: { headline: {}, scene: {}, flow: {}, chapter: {} },
  }
  const grid = sheet.getDataRange().getValues()
  for (let i = 1; i < grid.length; i++) {
    const scope = String(grid[i][0])
    const key = String(grid[i][1])
    const metric = String(grid[i][2])
    const value = grid[i][3]
    if (scope === 'meta') {
      if (metric === 'pending') {
        try { store.meta.pending = JSON.parse(value || '{}') } catch (e) { store.meta.pending = {} }
      } else {
        store.meta[metric] = value
      }
    } else if (scope === 'headline') {
      store.totals.headline[metric] = Number(value)
    } else if (scope === 'scene' || scope === 'flow') {
      store.totals[scope][key] = store.totals[scope][key] || {}
      store.totals[scope][key][metric] = Number(value)
    } else if (scope === 'chapter') {
      const c = (store.totals.chapter[key] = store.totals.chapter[key] ||
        { completions: 0, pct_sum: 0, pct_n: 0, tiers: {} })
      if (metric.indexOf('tier:') === 0) c.tiers[metric.slice(5)] = Number(value)
      else c[metric] = Number(value)
    }
  }
  return store
}

// One setValues call over a tab of a couple hundred rows — small enough to treat
// as atomic. It is bounded by the number of scenes, flows and chapters, so it
// does not grow with the number of players.
function writeStore_(ss, store) {
  const sheet = ss.getSheetByName(AGG_TAB) || ss.insertSheet(AGG_TAB)
  const out = [['scope', 'key', 'metric', 'value']]
  out.push(['meta', '', 'schema_version', SCHEMA_VERSION])
  out.push(['meta', '', 'last_token', Number(store.meta.last_token || 0)])
  out.push(['meta', '', 'last_run', store.meta.last_run || ''])
  out.push(['meta', '', 'rows_purged', Number(store.meta.rows_purged || 0)])
  out.push(['meta', '', 'pending', JSON.stringify(store.meta.pending || {})])

  Object.keys(store.totals.headline).sort().forEach(function (m) {
    out.push(['headline', '', m, Number(store.totals.headline[m] || 0)])
  })
  ;['scene', 'flow'].forEach(function (scope) {
    Object.keys(store.totals[scope]).sort().forEach(function (key) {
      Object.keys(store.totals[scope][key]).sort().forEach(function (m) {
        out.push([scope, key, m, Number(store.totals[scope][key][m] || 0)])
      })
    })
  })
  Object.keys(store.totals.chapter).sort().forEach(function (key) {
    const c = store.totals.chapter[key]
    out.push(['chapter', key, 'completions', Number(c.completions || 0)])
    out.push(['chapter', key, 'pct_sum', Number(c.pct_sum || 0)])
    out.push(['chapter', key, 'pct_n', Number(c.pct_n || 0)])
    Object.keys(c.tiers || {}).sort().forEach(function (t) {
      out.push(['chapter', key, 'tier:' + t, Number(c.tiers[t])])
    })
  })

  sheet.clear()
  sheet.getRange(1, 1, out.length, 4).setValues(out)
  sheet.setFrozenRows(1)
  SpreadsheetApp.flush()
}

// Destructive: throws away every aggregate. Only for switching
// AGGREGATE_TEST_ROWS back off, or a schema change you accept losing history to.
function resetAggregates() {
  const ui = SpreadsheetApp.getUi()
  const answer = ui.alert(
    'Reset all aggregates?',
    'This deletes every stored number permanently. Raw events that were already ' +
    'purged cannot be recomputed, so the history is gone for good.',
    ui.ButtonSet.YES_NO,
  )
  if (answer !== ui.Button.YES) return
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName(AGG_TAB)
  if (sheet) ss.deleteSheet(sheet)
  readStore_(ss)
  ui.alert('Aggregates reset.')
}

// --- raw sheet plumbing ---------------------------------------------------

// The collector writes 13 columns and knows nothing about this one, so rows it
// appends leave `batch` blank — which is exactly "not yet claimed".
function ensureBatchColumn_(src) {
  const width = src.getLastColumn()
  const header = src.getRange(1, 1, 1, width).getValues()[0]
  const has = header.some(function (h) { return String(h).trim().toLowerCase() === 'batch' })
  if (has) return
  src.getRange(1, width + 1).setValue('batch')
  SpreadsheetApp.flush()
}

function writeBatchTokens_(src, indices, token) {
  const col = C.batch + 1
  collapse_(indices).forEach(function (run) {
    const values = []
    for (let i = 0; i < run.count; i++) values.push([token])
    src.getRange(run.start + 1, col, run.count, 1).setValues(values)
  })
  SpreadsheetApp.flush()
}

// Deletes bottom-up in contiguous runs — one deleteRows call per run instead of
// one per row, which is the difference between seconds and a timeout.
function deleteRowIndices_(src, indices) {
  const runs = collapse_(indices)
  for (let i = runs.length - 1; i >= 0; i--) {
    src.deleteRows(runs[i].start + 1, runs[i].count)
  }
  SpreadsheetApp.flush()
}

// [3,4,5,9,10] → [{start:3,count:3},{start:9,count:2}]
function collapse_(indices) {
  const sorted = indices.slice().sort(function (a, b) { return a - b })
  const runs = []
  sorted.forEach(function (i) {
    const last = runs[runs.length - 1]
    if (last && i === last.start + last.count) last.count++
    else runs.push({ start: i, count: 1 })
  })
  return runs
}

function nowMs_() {
  return new Date().getTime()
}

function toMs_(v) {
  if (v instanceof Date) return v.getTime()
  const t = Date.parse(String(v))
  return isNaN(t) ? 0 : t // unparseable means legacy, i.e. old enough to settle
}

// --- triggers -------------------------------------------------------------

function installTrigger() {
  removeTrigger_()
  ScriptApp.newTrigger('aggregateAndPurge').timeBased().everyHours(1).create()
  SpreadsheetApp.getUi().alert(
    'Hourly aggregation installed. Sessions quiet for ' + SETTLE_MINUTES +
    ' minutes get folded into `agg` and their raw rows deleted.',
  )
}

function removeTrigger() {
  removeTrigger_()
  SpreadsheetApp.getUi().alert('Hourly aggregation removed. Raw events will now accumulate.')
}

function removeTrigger_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'aggregateAndPurge') ScriptApp.deleteTrigger(t)
  })
}

// --- rendering ------------------------------------------------------------

// Aggregates first so the report is as fresh as the settle window allows, then
// renders from `agg` only. Safe to run as often as you like.
function buildDashboard() {
  aggregateAndPurge()

  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const store = readStore_(ss)
  const totals = store.totals
  const sheet = resetDash_(ss)
  let at = 1

  // Say what was found before anything else — an empty report is nearly always
  // a schema or pipeline problem, not an absence of players.
  const src = ss.getSheetByName(EVENTS_TAB)
  const rawWaiting = src ? Math.max(0, src.getLastRow() - 1) : 0
  const note =
    'schema v' + SCHEMA_VERSION +
    ' · ' + Number(totals.headline.players || 0) + ' sessions aggregated' +
    ' · ' + Number(store.meta.rows_purged || 0) + ' raw rows purged' +
    ' · ' + rawWaiting + ' raw rows not yet settled' +
    ' · last run ' + (store.meta.last_run || 'never') +
    (AGGREGATE_TEST_ROWS ? ' · ⚠ TEST ROWS ARE BEING COUNTED' : '')
  sheet.getRange(at, 1).setValue(note).setFontColor('#666').setFontSize(9)
  at += 2

  if (!Number(totals.headline.players)) {
    sheet.getRange(at, 1).setValue(
      rawWaiting
        ? 'Nothing aggregated yet — ' + rawWaiting + ' raw rows are still inside the ' +
          SETTLE_MINUTES + '-minute settle window. Run this again later.'
        : 'No player data yet.',
    )
    return
  }

  if (AGGREGATE_TEST_ROWS) {
    sheet.getRange(at, 1).setValue('⚠ AGGREGATE_TEST_ROWS is on — these totals include seeded rows and are not reportable')
      .setFontColor('#b00').setFontWeight('bold')
    at += 2
  }

  at = writeHeadline_(sheet, at, totals)
  at = writeFunnel_(sheet, at, totals)
  at = writeAccuracy_(sheet, at, totals)
  at = writeWalkthroughs_(sheet, at, totals)
  at = writeChapters_(sheet, at, totals)

  sheet.setColumnWidth(1, 300)
  sheet.setColumnWidth(2, 110)
  sheet.setColumnWidth(3, 110)
  sheet.setColumnWidth(4, 130)
  ss.setActiveSheet(sheet)
}

// The three numbers that belong on a slide.
function writeHeadline_(sheet, at, totals) {
  const h = totals.headline
  const players = Number(h.players || 0)
  const finishers = Number(h.finishers || 0)
  const sawTutorial = Number(h.saw_tutorial || 0)
  const finishedReport = Number(h.finished_report || 0)

  at = title_(sheet, at, 'Headline')
  const data = [
    ['Players', players, '', 'Anyone who opened the game'],
    ['Finished all four chapters', finishers, pct_(finishers, players),
      'Does the format hold attention?'],
    ['Completed a report walkthrough', finishedReport, pct_(finishedReport, sawTutorial),
      'Root cause 3 — rehearsed the action, share of those who reached one'],
  ]
  sheet.getRange(at, 1, data.length, 4).setValues(data)
  sheet.getRange(at, 2, data.length, 2).setHorizontalAlignment('right')
  sheet.getRange(at, 4, data.length, 1).setFontColor('#666').setFontSize(9)
  return at + data.length + 2
}

// Where players stop. Ordered by mean ms-since-load rather than the median the
// old version used: medians cannot be merged across runs, means can (sum ÷ n).
function writeFunnel_(sheet, at, totals) {
  const scenes = Object.keys(totals.scene)
    .filter(function (id) { return Number(totals.scene[id].players) > 0 })
    .map(function (id) {
      const s = totals.scene[id]
      return {
        id: id,
        players: Number(s.players),
        order: Number(s.order_n) ? Number(s.order_sum) / Number(s.order_n) : Number.MAX_SAFE_INTEGER,
      }
    })
    .sort(function (a, b) { return a.order - b.order })
  if (!scenes.length) return at

  at = title_(sheet, at, 'Drop-off — players who reached each scene')
  const top = scenes[0].players
  const data = scenes.map(function (s, i) {
    const lost = i === 0 ? '' : scenes[i - 1].players - s.players
    return [s.id, s.players, pct_(s.players, top), lost === '' ? '' : '-' + lost]
  })
  sheet.getRange(at, 1, 1, 4).setValues([['Scene', 'Players', '% of start', 'Lost here']])
    .setFontWeight('bold').setFontSize(9)
  sheet.getRange(at + 1, 1, data.length, 4).setValues(data)

  chart_(sheet, sheet.getRange(at + 1, 1, data.length, 2), 'Scene funnel', at)

  // Flag the worst single drop — the scene most worth rewriting.
  let worst = 0, worstAt = -1
  scenes.forEach(function (s, i) {
    if (i === 0) return
    const lost = scenes[i - 1].players - s.players
    if (lost > worst) { worst = lost; worstAt = i }
  })
  if (worstAt > 0 && worst > 0) {
    sheet.getRange(at + 1 + worstAt, 1, 1, 4).setBackground('#fde8e8')
  }
  return at + data.length + 3
}

// First answer only, per player per scene — resolved at aggregation time.
function writeAccuracy_(sheet, at, totals) {
  const scenes = Object.keys(totals.scene)
    .filter(function (id) { return Number(totals.scene[id].first_n) > 0 })
    .sort()
  if (!scenes.length) return at

  at = title_(sheet, at, 'First-attempt correct rate — did they already know?')
  const data = scenes.map(function (id) {
    const s = totals.scene[id]
    return [id, Number(s.first_good), Number(s.first_n), pct_(s.first_good, s.first_n)]
  })
  sheet.getRange(at, 1, 1, 4).setValues([['Scenario', 'Correct', 'Answers', 'Rate']])
    .setFontWeight('bold').setFontSize(9)
  sheet.getRange(at + 1, 1, data.length, 4).setValues(data)

  // Lowest rates first is what you want to read, so colour rather than re-sort.
  for (let i = 0; i < data.length; i++) {
    const s = totals.scene[scenes[i]]
    const rate = Number(s.first_good) / Number(s.first_n)
    sheet.getRange(at + 1 + i, 4).setBackground(
      rate < 0.34 ? '#fde8e8' : rate < 0.67 ? '#fff4d6' : '#e6f4ea',
    )
  }
  return at + data.length + 3
}

// How deep into each phone walkthrough people actually tap.
function writeWalkthroughs_(sheet, at, totals) {
  const names = Object.keys(totals.flow).sort()
  if (!names.length) return at

  at = title_(sheet, at, 'Walkthroughs — reached vs completed')
  const data = names.map(function (n) {
    const started = Number(totals.flow[n].started || 0)
    const done = Number(totals.flow[n].done || 0)
    return [n, started, done, pct_(done, started)]
  })
  sheet.getRange(at, 1, 1, 4).setValues([['Flow', 'Started', 'Completed', 'Rate']])
    .setFontWeight('bold').setFontSize(9)
  sheet.getRange(at + 1, 1, data.length, 4).setValues(data)
  chart_(sheet, sheet.getRange(at + 1, 1, data.length, 3), 'Walkthrough completion', at)
  return at + data.length + 3
}

// Chapter completions, average meter, and the tier spread.
function writeChapters_(sheet, at, totals) {
  const ids = Object.keys(totals.chapter).sort()
  if (!ids.length) return at

  at = title_(sheet, at, 'Chapters — completions and scores')
  const data = ids.map(function (id) {
    const c = totals.chapter[id]
    const avg = Number(c.pct_n) ? Math.round(Number(c.pct_sum) / Number(c.pct_n)) + '%' : ''
    const tiers = Object.keys(c.tiers || {}).sort().map(function (t) {
      return t + ' ×' + c.tiers[t]
    }).join(', ')
    return [id, Number(c.completions), avg, tiers]
  })
  sheet.getRange(at, 1, 1, 4).setValues([['Chapter', 'Completions', 'Avg meter', 'Tiers']])
    .setFontWeight('bold').setFontSize(9)
  sheet.getRange(at + 1, 1, data.length, 4).setValues(data)
  return at + data.length + 3
}

// --- helpers --------------------------------------------------------------

function resetDash_(ss) {
  let sheet = ss.getSheetByName(DASH_TAB)
  if (!sheet) return ss.insertSheet(DASH_TAB)
  sheet.getCharts().forEach(function (c) { sheet.removeChart(c) })
  sheet.clear()
  return sheet
}

function title_(sheet, at, text) {
  sheet.getRange(at, 1).setValue(text).setFontWeight('bold').setFontSize(12)
  return at + 1
}

function pct_(a, b) {
  return b ? Math.round((a / b) * 100) + '%' : ''
}

function chart_(sheet, range, title, anchorRow) {
  const chart = sheet
    .newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(range)
    .setPosition(anchorRow, 6, 0, 0)
    .setOption('title', title)
    .setOption('legend', { position: 'none' })
    .setOption('height', 260)
    .setOption('width', 520)
    .build()
  sheet.insertChart(chart)
}
