// Anonymous usage counters — Layer 1 of the measurement plan.
//
// What this collects: which chapters were opened and finished, which scene the
// player was on, which option index they picked and whether it was scored
// good/mixed/risky, how far they got through a report walkthrough, and the
// chapter percentage at the end.
//
// What it never collects: names, emails, IP addresses, free text, or anything
// the player typed (the reflection screen's answers stay in that component and
// are never read from here). The only identifier is a random per-tab id used to
// stitch one play session together; it is not stored beyond the tab and cannot
// be traced back to a person. That keeps the "no accounts, nothing personal
// collected" promise true.
//
// It is OFF unless VITE_ANALYTICS_URL is set at build time, so `npm run dev`
// and anyone's local fork never post anything. See docs/analytics.md for the
// endpoint setup.

const ENDPOINT = import.meta.env.VITE_ANALYTICS_URL || ''
const ON = Boolean(ENDPOINT) && typeof window !== 'undefined'

const FLUSH_AFTER = 10_000 // ms of quiet before sending
const MAX_BATCH = 25 // or send as soon as this many events pile up

const queue = []
let timer = null

// Playing the live site to check the pipeline would otherwise land in the same
// rows as real players. Add ?test=1 to the URL and every event from that tab is
// flagged; flagged rows are purged like any other but never counted.
const IS_TEST = (() => {
  try {
    return new URLSearchParams(location.search).has('test') ? 1 : ''
  } catch {
    return ''
  }
})()

// One random id per tab, so a player's events can be grouped without knowing
// anything about them. Private-mode browsers can throw on sessionStorage.
const sid = (() => {
  if (!ON) return ''
  try {
    let id = sessionStorage.getItem('ss_sid')
    if (!id) {
      id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem('ss_sid', id)
    }
    return id
  } catch {
    return 'nostore-' + Math.random().toString(36).slice(2)
  }
})()

export function track(event, props = {}) {
  if (!ON) return
  queue.push({ e: event, t: Math.round(performance.now()), ...props })
  if (queue.length >= MAX_BATCH) return flush()
  if (!timer) timer = setTimeout(flush, FLUSH_AFTER)
}

export function flush() {
  if (!ON || queue.length === 0) return
  clearTimeout(timer)
  timer = null

  const body = JSON.stringify({ sid, test: IS_TEST, events: queue.splice(0, queue.length) })

  // `keepalive` lets the request outlive the page, which is what navigator
  // .sendBeacon is usually for — but a beacon gives no way to see a failure, and
  // plain fetch does.
  //
  // `mode: 'cors'` is deliberate. The old Apps Script endpoint answered with a
  // redirect and no CORS headers, so this had to be `no-cors` — which made every
  // failure invisible in the browser console and forced debugging from the server
  // side. The Worker returns proper `access-control-allow-origin`, so errors now
  // surface where you would expect them. `text/plain` keeps it a "simple" request
  // with no preflight round-trip on the pagehide path.
  //
  // If you ever point VITE_ANALYTICS_URL back at an Apps Script /exec URL, this
  // must go back to `no-cors` or every post will fail.
  fetch(ENDPOINT, {
    method: 'POST',
    mode: 'cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
  }).catch(() => {
    /* analytics must never break the game */
  })
}

if (ON) {
  addEventListener('pagehide', flush)
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}
