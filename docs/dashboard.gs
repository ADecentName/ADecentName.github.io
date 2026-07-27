// SafeSteps — turns the raw `events` rows into a readable `dashboard` tab.
//
// Paste this into the same Apps Script project as the collector (Extensions →
// Apps Script → + → Script, name it "Dashboard"), save, then reload the Sheet.
// A "SafeSteps" menu appears: **SafeSteps → Rebuild dashboard**.
//
// Everything here ignores rows flagged `test` (the ?test=1 runs), so your own
// checks never move the numbers.

const EVENTS_TAB = 'events'
const DASH_TAB = 'dashboard'

// Column indexes in `events`, read from the header row rather than assumed —
// the `test` column was added after the first version of the collector, so a
// sheet written by the older one has everything shifted one to the left. Read
// positionally and every row there looks flagged, which reads as "no real
// player data" when the data is fine.
const DEFAULT_C = {
  at: 0, sid: 1, test: 2, event: 3, chapter: 4,
  scene: 5, pick: 6, verdict: 7, pct: 8, tier: 9,
  flow: 10, step: 11, ms: 12,
}
let C = DEFAULT_C

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
  }
}

function isTest_(row) {
  return C.test >= 0 && Boolean(row[C.test])
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('SafeSteps')
    .addItem('Rebuild dashboard', 'buildDashboard')
    .addItem('Rebuild including test rows', 'buildDashboardWithTest')
    .addSeparator()
    .addItem('Delete all test rows', 'deleteTestRows')
    .addToUi()
}

// Real players only — this is the one you report from.
function buildDashboard() {
  buildDashboard_(false)
}

// Includes ?test=1 rows, so seeded or hand-made data renders the full report.
// Use it to check the pipeline and the layout before anyone real has played.
function buildDashboardWithTest() {
  buildDashboard_(true)
}

// Clears seeded/test data once you are done previewing.
function deleteTestRows() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(EVENTS_TAB)
  if (!sheet) return
  const values = sheet.getDataRange().getValues()
  C = mapColumns_(values[0] || [])
  if (C.test < 0) {
    SpreadsheetApp.getUi().alert('This sheet has no "test" column — nothing to delete.')
    return
  }
  let removed = 0
  for (let i = values.length - 1; i >= 1; i--) {
    if (values[i][C.test]) {
      sheet.deleteRow(i + 1)
      removed++
    }
  }
  SpreadsheetApp.getUi().alert('Deleted ' + removed + ' test row(s).')
}

function buildDashboard_(includeTest) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const src = ss.getSheetByName(EVENTS_TAB)
  if (!src) throw new Error('No "' + EVENTS_TAB + '" tab yet — collect some data first.')

  const grid = src.getDataRange().getValues()
  C = mapColumns_(grid[0] || [])

  const all = grid.slice(1).filter(function (r) { return r[C.sid] })
  const rows = all.filter(function (r) { return includeTest || !isTest_(r) })

  const sheet = resetDash_(ss)
  let at = 1

  // Say what was found before anything else — an empty report is nearly always
  // a schema problem, not an absence of players.
  const note =
    all.length +
    ' rows · ' +
    all.filter(isTest_).length +
    ' flagged test · ' +
    (C.test >= 0 ? 'test column found' : 'NO test column — collector is out of date')
  sheet.getRange(at, 1).setValue(note).setFontColor('#666').setFontSize(9)
  at += 2

  if (!rows.length) {
    sheet.getRange(at, 1).setValue(
      includeTest
        ? 'No data at all yet.'
        : 'No real player data yet — try "Rebuild including test rows".',
    )
    return
  }

  if (includeTest) {
    sheet.getRange(at, 1).setValue('⚠ Includes test rows — not for reporting')
      .setFontColor('#b00').setFontWeight('bold')
    at += 2
  }
  at = writeHeadline_(sheet, at, rows)
  at = writeFunnel_(sheet, at, rows)
  at = writeAccuracy_(sheet, at, rows)
  at = writeWalkthroughs_(sheet, at, rows)
  at = writeChapters_(sheet, at, rows)

  sheet.setColumnWidth(1, 300)
  sheet.setColumnWidth(2, 110)
  sheet.setColumnWidth(3, 110)
  sheet.setColumnWidth(4, 130)
  ss.setActiveSheet(sheet)
}

// --- sections -------------------------------------------------------------

// The three numbers that belong on a slide.
function writeHeadline_(sheet, at, rows) {
  const players = distinct_(rows, function (r) { return r[C.sid] })
  const finishers = distinct_(
    rows.filter(function (r) { return r[C.event] === 'results_view' }),
    function (r) { return r[C.sid] },
  )
  const sawTutorial = distinct_(
    rows.filter(function (r) {
      return r[C.event] === 'tutorial_step' || r[C.event] === 'tutorial_complete'
    }),
    function (r) { return r[C.sid] },
  )
  const finishedReport = distinct_(
    rows.filter(function (r) {
      return r[C.event] === 'tutorial_complete' && r[C.flow] !== 'ig-privacy'
    }),
    function (r) { return r[C.sid] },
  )

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

// Where players stop. Scenes are ordered by how early they typically appear.
function writeFunnel_(sheet, at, rows) {
  const views = rows.filter(function (r) {
    return (r[C.event] === 'scene_view' || r[C.event] === 'choice') && r[C.scene]
  })
  const byScene = {}
  views.forEach(function (r) {
    const s = (byScene[r[C.scene]] = byScene[r[C.scene]] || { sids: {}, ms: [] })
    s.sids[r[C.sid]] = 1
    if (r[C.ms]) s.ms.push(Number(r[C.ms]))
  })

  const scenes = Object.keys(byScene)
    .map(function (id) {
      return { id: id, players: Object.keys(byScene[id].sids).length, order: median_(byScene[id].ms) }
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

// First answer only, per player per scene: did they get it right unprompted?
function writeAccuracy_(sheet, at, rows) {
  const first = {}
  rows
    .filter(function (r) { return r[C.event] === 'choice' && r[C.verdict] !== 'continue' })
    .forEach(function (r) {
      const key = r[C.sid] + '|' + r[C.scene]
      const ms = Number(r[C.ms] || 0)
      if (!first[key] || ms < first[key].ms) {
        first[key] = { ms: ms, scene: r[C.scene], chapter: r[C.chapter], verdict: r[C.verdict] }
      }
    })

  const byScene = {}
  Object.keys(first).forEach(function (k) {
    const f = first[k]
    const s = (byScene[f.scene] = byScene[f.scene] || { n: 0, good: 0, chapter: f.chapter })
    s.n++
    if (f.verdict === 'good') s.good++
  })

  const scenes = Object.keys(byScene).sort()
  if (!scenes.length) return at

  at = title_(sheet, at, 'First-attempt correct rate — did they already know?')
  const data = scenes.map(function (id) {
    const s = byScene[id]
    return [id + '  (' + s.chapter + ')', s.good, s.n, pct_(s.good, s.n)]
  })
  sheet.getRange(at, 1, 1, 4).setValues([['Scenario', 'Correct', 'Answers', 'Rate']])
    .setFontWeight('bold').setFontSize(9)
  sheet.getRange(at + 1, 1, data.length, 4).setValues(data)

  // Lowest rates first is what you want to read, so colour rather than re-sort.
  for (let i = 0; i < data.length; i++) {
    const rate = byScene[scenes[i]].good / byScene[scenes[i]].n
    sheet.getRange(at + 1 + i, 4).setBackground(
      rate < 0.34 ? '#fde8e8' : rate < 0.67 ? '#fff4d6' : '#e6f4ea',
    )
  }
  return at + data.length + 3
}

// How deep into each phone walkthrough people actually tap.
function writeWalkthroughs_(sheet, at, rows) {
  const flows = {}
  rows
    .filter(function (r) { return r[C.flow] })
    .forEach(function (r) {
      const f = (flows[r[C.flow]] = flows[r[C.flow]] || { started: {}, done: {} })
      f.started[r[C.sid]] = 1
      if (r[C.event] === 'tutorial_complete') f.done[r[C.sid]] = 1
    })

  const names = Object.keys(flows).sort()
  if (!names.length) return at

  at = title_(sheet, at, 'Walkthroughs — reached vs completed')
  const data = names.map(function (n) {
    const started = Object.keys(flows[n].started).length
    const done = Object.keys(flows[n].done).length
    return [n, started, done, pct_(done, started)]
  })
  sheet.getRange(at, 1, 1, 4).setValues([['Flow', 'Started', 'Completed', 'Rate']])
    .setFontWeight('bold').setFontSize(9)
  sheet.getRange(at + 1, 1, data.length, 4).setValues(data)
  chart_(sheet, sheet.getRange(at + 1, 1, data.length, 3), 'Walkthrough completion', at)
  return at + data.length + 3
}

// Chapter completions, average meter, and the tier spread.
function writeChapters_(sheet, at, rows) {
  const done = rows.filter(function (r) { return r[C.event] === 'chapter_complete' })
  if (!done.length) return at

  const byChapter = {}
  done.forEach(function (r) {
    const c = (byChapter[r[C.chapter]] = byChapter[r[C.chapter]] || { n: 0, pct: [], tiers: {} })
    c.n++
    if (r[C.pct] !== '') c.pct.push(Number(r[C.pct]))
    if (r[C.tier]) c.tiers[r[C.tier]] = (c.tiers[r[C.tier]] || 0) + 1
  })

  at = title_(sheet, at, 'Chapters — completions and scores')
  const data = Object.keys(byChapter).sort().map(function (id) {
    const c = byChapter[id]
    const avg = c.pct.length
      ? Math.round(c.pct.reduce(function (a, b) { return a + b }, 0) / c.pct.length) + '%'
      : ''
    const tiers = Object.keys(c.tiers).map(function (t) { return t + ' ×' + c.tiers[t] }).join(', ')
    return [id, c.n, avg, tiers]
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

function distinct_(rows, key) {
  const seen = {}
  rows.forEach(function (r) { seen[key(r)] = 1 })
  return Object.keys(seen).length
}

function pct_(a, b) {
  return b ? Math.round((a / b) * 100) + '%' : ''
}

function median_(xs) {
  if (!xs.length) return Number.MAX_SAFE_INTEGER
  const s = xs.slice().sort(function (a, b) { return a - b })
  return s[Math.floor(s.length / 2)]
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
