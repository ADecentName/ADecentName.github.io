// SafeSteps analytics backend — Cloudflare Worker + D1.
//
// Replaces the Google Apps Script collector and the Sheets dashboard. Three
// routes and a cron:
//
//   POST /collect         the game posts batched anonymous events here
//   GET  /dashboard.json  the aggregates, key-gated
//   GET  /health          returns "ok"
//   cron  hourly          aggregate settled sessions, delete their raw rows
//
// What is stored: which chapters were opened and finished, which scene the player
// was on, which option they picked and whether it scored good/mixed/risky, how
// far they got through a report walkthrough, and the chapter percentage at the
// end. Never names, emails, free text, or anything typed into the reflection
// screen. The only identifier is a random per-tab id.
//
// IP addresses are deliberately not read. Cloudflare offers CF-Connecting-IP on
// every request; touching it would break the "nothing personal collected"
// promise, so it is never referenced here. Do not add it for debugging.

import { aggregateAndPurge } from './aggregate.js'

const MAX_BODY_BYTES = 64 * 1024
const MAX_EVENTS = 200
const MAX_STR = 64

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') return preflight_(request, env)

    if (url.pathname === '/health') {
      return text_('ok', 200, cors_(request, env))
    }

    if (url.pathname === '/collect') {
      if (request.method !== 'POST') return text_('method not allowed', 405, cors_(request, env))
      return collect_(request, env, ctx)
    }

    if (url.pathname === '/dashboard.json') {
      if (!authorised_(url, env)) return json_({ error: 'unauthorised' }, 401, cors_(request, env))
      return json_(await report_(env), 200, cors_(request, env))
    }

    // Manual aggregation, for verifying the pipeline without waiting for the cron.
    if (url.pathname === '/admin/aggregate') {
      if (!authorised_(url, env)) return json_({ error: 'unauthorised' }, 401, cors_(request, env))
      return json_(await aggregateAndPurge(env), 200, cors_(request, env))
    }

    return text_('not found', 404, cors_(request, env))
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(aggregateAndPurge(env))
  },
}

// --- collection -----------------------------------------------------------

async function collect_(request, env, ctx) {
  const declared = Number(request.headers.get('content-length') || 0)
  if (declared > MAX_BODY_BYTES) return text_('too large', 413, cors_(request, env))

  let body
  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) return text_('too large', 413, cors_(request, env))
    body = JSON.parse(raw)
  } catch {
    return text_('bad request', 400, cors_(request, env))
  }

  const sid = str_(body && body.sid, 40)
  const events = body && Array.isArray(body.events) ? body.events.slice(0, MAX_EVENTS) : []
  if (!sid || !events.length) return text_('', 204, cors_(request, env))

  const test = body.test ? 1 : 0
  const now = Date.now()

  const stmts = events.map(function (ev) {
    return env.DB.prepare(
      `INSERT INTO events
         (received_at, sid, test, event, chapter, scene, pick, verdict, pct, tier, flow, step, ms)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)`,
    ).bind(
      now,
      sid,
      test,
      str_(ev && ev.e, 40),
      str_(ev && ev.chapter, MAX_STR),
      str_(ev && ev.scene, MAX_STR),
      str_(ev && ev.pick, MAX_STR),
      str_(ev && ev.verdict, MAX_STR),
      numOrNull_(ev && ev.pct),
      str_(ev && ev.tier, MAX_STR),
      str_(ev && ev.flow, MAX_STR),
      numOrNull_(ev && ev.step),
      numOrNull_(ev && ev.t),
    )
  })

  // The response does not wait on the insert: the game fires these on pagehide
  // and must never be slowed by us. Failures surface in `wrangler tail`.
  ctx.waitUntil(env.DB.batch(stmts))

  return text_('', 204, cors_(request, env))
}

// --- the report -----------------------------------------------------------

// Rates are computed here, not stored — the tables hold only counts and sums so
// they can be merged across runs.
async function report_(env) {
  const [headline, scenes, flows, chapters, tiers, meta, waiting] = await Promise.all([
    env.DB.prepare(`SELECT metric, value FROM agg_headline`).all(),
    env.DB.prepare(`SELECT * FROM agg_scene`).all(),
    env.DB.prepare(`SELECT * FROM agg_flow ORDER BY flow`).all(),
    env.DB.prepare(`SELECT * FROM agg_chapter ORDER BY chapter`).all(),
    env.DB.prepare(`SELECT * FROM agg_tier ORDER BY chapter, tier`).all(),
    env.DB.prepare(`SELECT key, value FROM meta`).all(),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM events`).first(),
  ])

  const h = {}
  ;(headline.results || []).forEach(function (r) { h[r.metric] = Number(r.value) })

  const m = {}
  ;(meta.results || []).forEach(function (r) { m[r.key] = r.value })

  // Ordered by mean ms-since-load. A median would not be mergeable across runs,
  // which is why the aggregate stores a sum and a count instead.
  const funnel = (scenes.results || [])
    .filter(function (s) { return Number(s.players) > 0 })
    .map(function (s) {
      return {
        scene: s.scene,
        players: Number(s.players),
        order: Number(s.order_n) ? Number(s.order_sum) / Number(s.order_n) : Number.MAX_SAFE_INTEGER,
      }
    })
    .sort(function (a, b) { return a.order - b.order })

  const top = funnel.length ? funnel[0].players : 0
  const drop = funnel.map(function (s, i) {
    return {
      scene: s.scene,
      players: s.players,
      pct_of_start: rate_(s.players, top),
      lost_here: i === 0 ? null : funnel[i - 1].players - s.players,
    }
  })

  const accuracy = (scenes.results || [])
    .filter(function (s) { return Number(s.first_n) > 0 })
    .map(function (s) {
      return {
        scene: s.scene,
        correct: Number(s.first_good),
        answers: Number(s.first_n),
        rate: rate_(s.first_good, s.first_n),
      }
    })
    .sort(function (a, b) { return a.scene < b.scene ? -1 : 1 })

  const tierBy = {}
  ;(tiers.results || []).forEach(function (t) {
    ;(tierBy[t.chapter] = tierBy[t.chapter] || []).push({ tier: t.tier, n: Number(t.n) })
  })

  return {
    schema_version: m.schema_version || '1',
    last_run: m.last_run || null,
    sessions_aggregated: Number(m.sessions_aggregated || 0),
    rows_purged: Number(m.rows_purged || 0),
    raw_waiting: Number((waiting && waiting.n) || 0),
    settle_minutes: Number(env.SETTLE_MINUTES || 45),
    counting_test_rows: String(env.AGGREGATE_TEST_ROWS) === 'true',
    headline: {
      players: Number(h.players || 0),
      finishers: Number(h.finishers || 0),
      finish_rate: rate_(h.finishers, h.players),
      saw_tutorial: Number(h.saw_tutorial || 0),
      finished_report: Number(h.finished_report || 0),
      report_completion_rate: rate_(h.finished_report, h.saw_tutorial),
    },
    funnel: drop,
    accuracy: accuracy,
    walkthroughs: (flows.results || []).map(function (f) {
      return {
        flow: f.flow,
        started: Number(f.started),
        completed: Number(f.done),
        rate: rate_(f.done, f.started),
      }
    }),
    chapters: (chapters.results || []).map(function (c) {
      return {
        chapter: c.chapter,
        completions: Number(c.completions),
        avg_meter: Number(c.pct_n) ? Math.round(Number(c.pct_sum) / Number(c.pct_n)) : null,
        tiers: tierBy[c.chapter] || [],
      }
    }),
  }
}

// --- helpers --------------------------------------------------------------

// The dashboard key is not a password protecting anything personal — the payload
// is aggregate counts. It exists so the numbers are not trivially scrapeable
// before there is a pilot to put them in context.
function authorised_(url, env) {
  const want = String(env.DASHBOARD_KEY || '')
  if (!want) return false
  return timingSafeEqual_(url.searchParams.get('key') || '', want)
}

function timingSafeEqual_(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ALLOWED_ORIGINS is a comma-separated list. Unset means "*", which is correct
// for a public game with no cookies and no credentials — but set it once the site
// origin is stable so a fork cannot quietly post into your numbers.
function cors_(request, env) {
  const allowed = String(env.ALLOWED_ORIGINS || '').split(',')
    .map(function (s) { return s.trim() }).filter(Boolean)
  const origin = request.headers.get('origin') || ''
  const value = !allowed.length ? '*' : (allowed.indexOf(origin) >= 0 ? origin : allowed[0])
  return {
    'access-control-allow-origin': value,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  }
}

function preflight_(request, env) {
  return new Response(null, { status: 204, headers: cors_(request, env) })
}

function str_(v, max) {
  if (v === null || v === undefined) return null
  const s = String(v)
  return s.length > max ? s.slice(0, max) : s
}

function numOrNull_(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

function rate_(a, b) {
  return Number(b) ? Math.round((Number(a) / Number(b)) * 100) : null
}

function json_(obj, status, headers) {
  return new Response(JSON.stringify(obj, null, 2), {
    status: status,
    headers: Object.assign({ 'content-type': 'application/json;charset=utf-8', 'cache-control': 'no-store' }, headers),
  })
}

function text_(body, status, headers) {
  return new Response(body || null, {
    status: status,
    headers: Object.assign({ 'content-type': 'text/plain;charset=utf-8' }, headers),
  })
}
