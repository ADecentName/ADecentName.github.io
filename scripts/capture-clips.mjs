#!/usr/bin/env node
//
// Drives a full SafeSteps playthrough at a filmable pace, so the footage for
// the 60-second pitch video is deterministic and repeatable: same route, same
// dwell times, same framing, every take. It also writes `capture/clip-markers.json`
// so the editor can jump straight to each clip instead of scrubbing 10 minutes
// of master.
//
// It does NOT replace a recorder in the default mode — Playwright just plays
// the game in a clean fullscreen window while OBS records that window at
// 1920x1080. Playwright's own recorder (MODE=video) writes a VP8 .webm, which
// is fine for previewing the route but soft on the game's small text, so don't
// ship it to a projector.
//
// Setup (once):
//   npm i -D playwright && npx playwright install chromium
//
// Use:
//   npm run dev                        # in another terminal
//   node scripts/capture-clips.mjs     # OBS mode: hit record when prompted
//   MODE=video node scripts/capture-clips.mjs
//   SPEED=4 node scripts/capture-clips.mjs        # fast rehearsal, unfilmable
//   URL=https://safe-steps.uk/ node scripts/capture-clips.mjs
//   DASHBOARD_KEY=… node scripts/capture-clips.mjs   # also records clip N
//
// Clip N (the dashboard) is skipped unless DASHBOARD_KEY is set. Pass it in the
// environment, never on the command line in a shared shell — the key is seeded
// straight into localStorage so it never appears in a URL or on screen.
//
// Both modes assume a 1920x1080 display. In OBS mode the browser runs kiosk
// (no tab bar, no URL bar); a white full-frame flash marks t=0 so the markers
// below line up with the OBS timeline — cut on the flash.

import { chromium } from 'playwright'
import { mkdir, writeFile, readdir, rename } from 'node:fs/promises'
import { join } from 'node:path'
import { SCENES } from '../src/data/scenes.js'

const URL = process.env.URL ?? 'http://localhost:5173/'
const MODE = process.env.MODE ?? 'obs' // 'obs' | 'video'
const SPEED = Number(process.env.SPEED ?? 1)
const OUT = 'capture'
// Clip N only. Empty means "skip the dashboard" — the game clips do not need it.
const DASHBOARD_KEY = process.env.DASHBOARD_KEY ?? ''

// Dwell times, in ms before SPEED is applied. These are the pacing of the
// footage — the edit can always speed a beat up, but it cannot slow down a
// frame that was never held.
const T = {
  cursorHop: 900, // travel time between targets
  hover: 550, // sit on a target before clicking
  afterClick: 700, // let the UI settle
  readShort: 1800, // a choice prompt
  readLong: 4200, // a Did-You-Know card
  modal: 4200, // the teaching moment — the money shot, hold it
  meter: 4500, // a meter filling
  hesitate: 1400, // hover the option we are NOT going to pick
}
const ms = (n) => Math.max(30, Math.round(n / SPEED))

// The route. Chapters play in the game's own order; per-scene overrides say
// where we deliberately pick a bad or half-right answer for the footage.
// Everything else auto-picks the highest-scoring option, so the final meters
// land in the top tier without hand-maintaining a click list.
const CHAPTER_ORDER = [
  'Set Boundaries Online',
  'Think Before You Act',
  'Report Inappropriate Content',
  'Engage & Support',
]

const OVERRIDES = {
  // Clip D — go Public on purpose: the consequence is the whole pitch.
  b_s1: /Set your account to Public/i,
  // Clip F — the near-miss: well-intentioned comment, Responsibility still drops.
  r_s1: /Comment/i,
}

// Scene ids worth marking in the master. Keys match the clip letters in the
// video plan (SafeSteps-60s-pitch-video-plan.md).
const CLIP_AT = {
  b_s1: 'D · public-vs-private + feedback modal',
  b_s1_tut: 'E · Instagram privacy walkthrough',
  r_s1: 'F · near-miss comment (Responsibility -5)',
  r_s1_tut: 'G · TikTok report walkthrough',
  r_s1_dyk: 'H · Did You Know + cited sources',
}

// --- scene identification -------------------------------------------------
// The DOM does not carry scene ids, so match what is on screen back to the
// content: a decision by its first choice label, a panel by its title.

const norm = (s) => (s ?? '').replace(/\s+/g, ' ').replace(/ /g, ' ').trim()

const sceneByFirstLabel = new Map()
const sceneByTitle = new Map()
const scoreByLabel = new Map()

for (const scene of Object.values(SCENES)) {
  if (scene.choices?.length) {
    sceneByFirstLabel.set(norm(scene.choices[0].label), scene.id)
    for (const c of scene.choices) {
      const total = Object.values(c.effects ?? {}).reduce((a, b) => a + b, 0)
      scoreByLabel.set(norm(c.label), total)
    }
  }
  if (scene.panel?.title) sceneByTitle.set(norm(scene.panel.title), scene.id)
}

// --- cursor overlay -------------------------------------------------------
// Playwright moves a real mouse but the recording has no pointer drawn, so we
// draw one: an arrow that follows mousemove plus a ripple on click. The OS
// cursor is hidden inside the page so there are never two.

function installCursor() {
  if (document.getElementById('__cap_cursor')) return
  const style = document.createElement('style')
  style.textContent = `
    *, *::before, *::after { cursor: none !important; }
    #__cap_cursor { position: fixed; left: 0; top: 0; width: 28px; height: 28px;
      pointer-events: none; z-index: 2147483647; will-change: transform;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,.6)); }
    #__cap_ripple { position: fixed; left: 0; top: 0; width: 18px; height: 18px;
      margin: -9px 0 0 -9px; border-radius: 50%; border: 3px solid #fff;
      pointer-events: none; z-index: 2147483646; opacity: 0; }
    #__cap_ripple.go { animation: __cap_pop .5s ease-out; }
    @keyframes __cap_pop { from { transform: scale(.4); opacity: .95 }
                             to { transform: scale(3.6); opacity: 0 } }
    #__cap_flash { position: fixed; inset: 0; background: #fff;
      z-index: 2147483647; pointer-events: none; }
  `
  document.head.append(style)

  const cursor = document.createElement('div')
  cursor.id = '__cap_cursor'
  cursor.innerHTML =
    '<svg viewBox="0 0 28 28" width="28" height="28">' +
    '<path d="M4 2.5 20.5 10.5 13.2 12.8 10.6 20 4 2.5Z" fill="#fff" stroke="#111"' +
    ' stroke-width="1.5" stroke-linejoin="round"/></svg>'
  const ripple = document.createElement('div')
  ripple.id = '__cap_ripple'
  document.body.append(cursor, ripple)

  const put = (el, x, y) => (el.style.transform = `translate(${x}px, ${y}px)`)
  addEventListener('mousemove', (e) => put(cursor, e.clientX, e.clientY), true)
  addEventListener(
    'mousedown',
    (e) => {
      put(ripple, e.clientX, e.clientY)
      ripple.classList.remove('go')
      void ripple.offsetWidth
      ripple.classList.add('go')
    },
    true,
  )
}

// --- main -----------------------------------------------------------------

const marks = []
let t0 = 0
const now = () => Date.now() - t0
const tc = (n) => {
  const s = Math.max(0, n) / 1000
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(2).padStart(5, '0')}`
}
const mark = (clip, edge) => {
  marks.push({ clip, edge, ms: now(), tc: tc(now()) })
  console.log(`  ${tc(now())}  ${edge === 'in' ? '▶' : '■'} ${clip}`)
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({
  headless: false,
  args:
    MODE === 'obs'
      ? ['--kiosk', '--window-position=0,0', '--window-size=1920,1080', '--disable-infobars']
      : ['--window-position=0,0'],
})

// `deviceScaleFactor` may only be passed alongside an explicit viewport —
// Playwright throws if it is combined with `viewport: null`. External-recorder
// mode wants the real window (null) so kiosk fills whatever display you have, so
// the two options have to be set as a pair, not merged.
const context = await browser.newContext({
  ...(MODE === 'obs'
    ? { viewport: null }
    : { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 }),
  ...(MODE === 'video'
    ? { recordVideo: { dir: join(OUT, 'raw'), size: { width: 1920, height: 1080 } } }
    : {}),
})

await context.addInitScript(installCursor)

// Playwright starts from a clean profile, so the key saved in your everyday
// Chrome is not here. Seed it for this origin before any page loads: the
// dashboard reads localStorage first, so it opens without a prompt and the key
// never appears in a URL, in the address bar, or in the recording.
if (DASHBOARD_KEY) {
  await context.addInitScript((k) => {
    try {
      localStorage.setItem('ss_dashboard_key', k)
    } catch {
      /* private mode — the dashboard will just ask */
    }
  }, DASHBOARD_KEY)
}

const page = await context.newPage()
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('.title-screen')

// --- pointer + click helpers ---------------------------------------------

const loc = (sel, opts) => page.locator(sel, opts)
const seen = async (sel) => (await page.locator(sel).count()) > 0 && page.locator(sel).first().isVisible()

async function centreOf(l) {
  await l.scrollIntoViewIfNeeded()
  const box = await l.boundingBox()
  if (!box) throw new Error('no bounding box for target')
  return [box.x + box.width / 2, box.y + box.height / 2]
}

async function moveTo(l, { travel = T.cursorHop } = {}) {
  const [x, y] = await centreOf(l)
  await page.mouse.move(x, y, { steps: Math.max(8, Math.round(travel / 16 / SPEED)) })
  return [x, y]
}

async function tap(l, { hover = T.hover, after = T.afterClick } = {}) {
  const [x, y] = await moveTo(l)
  await page.waitForTimeout(ms(hover))
  await page.mouse.click(x, y)
  await page.waitForTimeout(ms(after))
}

// Hover the option we are about to reject. This is the beat that makes the
// footage read as a decision rather than a demo.
async function hesitateOver(l) {
  await moveTo(l)
  await page.waitForTimeout(ms(T.hesitate))
}

// Long fact cards scroll; reveal the source links slowly enough to read.
async function revealRest(l) {
  const overflow = await l.evaluate((el) => el.scrollHeight - el.clientHeight)
  if (overflow <= 8) return
  const [x, y] = await centreOf(l)
  await page.mouse.move(x, y, { steps: 10 })
  for (let done = 0; done < overflow; done += 90) {
    await page.mouse.wheel(0, 90)
    await page.waitForTimeout(ms(160))
  }
  await page.waitForTimeout(ms(T.readShort))
}

// The dashboard scrolls the window, not an inner element, so revealRest cannot
// drive it.
async function scrollPageSlowly() {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  )
  if (overflow <= 8) return
  for (let done = 0; done < overflow; done += 90) {
    await page.mouse.wheel(0, 90)
    await page.waitForTimeout(ms(160))
  }
}

// --- game-aware steps -----------------------------------------------------

async function currentDecisionId() {
  const first = await loc('button.btn-choice').first().innerText()
  return sceneByFirstLabel.get(norm(first))
}

async function currentPanelId() {
  if (!(await seen('.info-title'))) return undefined
  return sceneByTitle.get(norm(await loc('.info-title').first().innerText()))
}

async function decide() {
  const id = await currentDecisionId()
  const clip = id && CLIP_AT[id]
  if (clip) mark(clip, 'in')

  const buttons = loc('button.btn-choice')
  const labels = (await buttons.allInnerTexts()).map(norm)
  await page.waitForTimeout(ms(T.readShort + labels.join(' ').length * 12))

  const override = id && OVERRIDES[id]
  let pick = override ? labels.findIndex((l) => override.test(l)) : -1

  if (pick < 0) {
    // Best-scoring option, straight from the content — no click list to maintain.
    let best = -Infinity
    labels.forEach((l, i) => {
      const s = scoreByLabel.get(l)
      if (s !== undefined && s > best) [best, pick] = [s, i]
    })
  }
  if (pick < 0) {
    console.warn(`  ! no scored match for "${labels[0]}" — taking the first option`)
    pick = 0
  }

  // Linger on a different option first, then commit.
  if (labels.length > 1) await hesitateOver(buttons.nth(pick === 0 ? 1 : 0))
  await tap(buttons.nth(pick))

  if (await seen('.modal-overlay')) {
    await page.waitForTimeout(ms(T.modal))
    await tap(loc('.feedback-modal button.btn-primary'))
  }
  if (clip) mark(clip, 'out')
}

async function panel() {
  const id = await currentPanelId()
  const clip = id && CLIP_AT[id]
  if (clip) mark(clip, 'in')

  const body = loc('.info-panel')
  await page.waitForTimeout(ms(T.readLong))
  await revealRest(body)

  // Tutorials mark their next target with .ig-pulse — tap through the flow.
  for (let i = 0; i < 8 && (await seen('.ig-pulse')); i++) {
    await tap(loc('.ig-pulse').first(), { hover: T.hover, after: 1100 })
  }

  await tap(loc('.info-panel button.btn-primary'))
  if (clip) mark(clip, 'out')
}

async function step() {
  if (await seen('.modal-overlay')) {
    await page.waitForTimeout(ms(T.modal))
    return tap(loc('.feedback-modal button.btn-primary'))
  }
  if (await seen('.info-panel')) return panel()
  if (await seen('button.btn-choice')) return decide()
  if (await seen('button.btn-confirm')) return tap(loc('button.btn-confirm'))
  if (await seen('button.btn-continue')) return tap(loc('button.btn-continue'))
  throw new Error('stuck: no known control on screen')
}

async function playChapter(officialTitle, { last }) {
  console.log(`\n▸ ${officialTitle}`)
  await tap(loc('.chapter-card', { hasText: officialTitle }))

  for (let guard = 0; guard < 80; guard++) {
    if (await seen('.end-screen')) break
    await step()
  }

  // Clip I — the chapter meter filling.
  mark(`I · ${officialTitle} meter`, 'in')
  await page.waitForTimeout(ms(T.meter))
  mark(`I · ${officialTitle} meter`, 'out')

  await tap(loc(last ? '.end-screen button.btn-primary' : '.end-screen button.btn-ghost'))
}

// --- the take -------------------------------------------------------------

if (MODE === 'obs') {
  console.log('\n  Start the OBS recording now. Capture begins on the white flash.')
  for (let n = 5; n > 0; n--) {
    console.log(`  ${n}…`)
    await page.waitForTimeout(1000)
  }
}

// Sync slate: one white frame at t=0 so markers line up with the OBS timeline.
await page.evaluate(() => {
  const f = document.createElement('div')
  f.id = '__cap_flash'
  document.body.append(f)
  setTimeout(() => f.remove(), 200)
})
t0 = Date.now()
console.log('\n  ● rolling\n')

// Clip A — title screen.
mark('A · title screen', 'in')
await page.waitForTimeout(ms(T.readLong))
await tap(loc('button.btn-primary', { hasText: 'Start playing' }))
mark('A · title screen', 'out')

// Clip B — the hub: four chapters, one per IMDA action.
await page.waitForSelector('.hub-screen')
mark('B · hub, four chapters', 'in')
for (const title of CHAPTER_ORDER) await moveTo(loc('.chapter-card', { hasText: title }))
await page.waitForTimeout(ms(T.readShort))
mark('B · hub, four chapters', 'out')

for (const [i, title] of CHAPTER_ORDER.entries()) {
  await playChapter(title, { last: i === CHAPTER_ORDER.length - 1 })
}

// The reflection screen — the three-question self-check that gates the results.
await page.waitForSelector('.reflection-screen')
mark('L · reflection self-check', 'in')
const answers = [
  'Set Boundaries Online',
  'Think Before You Act',
  'Report Inappropriate Content',
  'Engage & Support',
]
for (const [i, a] of answers.entries()) {
  const field = loc('.reflection-inputs input').nth(i)
  await tap(field, { after: 120 })
  await field.type(a, { delay: ms(55) })
}
await tap(loc('.btn-likert', { hasText: 'Very likely' }))
await tap(loc('button.btn-ghost', { hasText: 'Show me the answers' }))
await page.waitForTimeout(ms(T.readLong))
mark('L · reflection self-check', 'out')
await tap(loc('button.btn-primary', { hasText: 'See my results' }))

// Clip J — all four meters together.
await page.waitForSelector('.results-screen')
mark('J · final four meters', 'in')
await revealRest(loc('.results-screen'))
await page.waitForTimeout(ms(T.meter))
mark('J · final four meters', 'out')

// Clip N — the dashboard. Not the game: this is the measurement proof, and the
// only clip needing a credential. Left last on purpose, so a rejected key costs
// you nothing — every game clip is already recorded by this point.
if (DASHBOARD_KEY) {
  // `URL` here is the string from the environment, which shadows the global URL
  // constructor — build the path by hand rather than with `new URL()`.
  const dashUrl = `${URL.endsWith('/') ? URL : `${URL}/`}dashboard/`
  await page.goto(dashUrl, { waitUntil: 'networkidle' })

  // `.dash-head` only renders once a key is accepted; `.keyform` means it wasn't.
  const unlocked = await page
    .waitForSelector('.dash-head', { timeout: 15000 })
    .then(() => true)
    .catch(() => false)

  if (unlocked) {
    mark('N · dashboard', 'in')
    await page.waitForTimeout(ms(T.readLong))
    await scrollPageSlowly()
    await page.waitForTimeout(ms(T.readShort))
    mark('N · dashboard', 'out')
  } else {
    console.log('\n  ⚠ dashboard did not unlock — key rejected or /dashboard.json 401.')
    console.log('    Clip N skipped. Every game clip above is unaffected.\n')
  }
} else {
  console.log('\n  ⓘ DASHBOARD_KEY not set — clip N skipped. Game clips unaffected.\n')
}

// --- write markers --------------------------------------------------------

const markerPath = join(OUT, 'clip-markers.json')
await writeFile(
  markerPath,
  JSON.stringify({ url: URL, mode: MODE, speed: SPEED, total: tc(now()), marks }, null, 2),
)

await context.close()
await browser.close()

if (MODE === 'video') {
  const dir = join(OUT, 'raw')
  const [file] = (await readdir(dir)).filter((f) => f.endsWith('.webm'))
  if (file) {
    await rename(join(dir, file), join(OUT, 'master-preview.webm'))
    console.log(`\n  preview → ${join(OUT, 'master-preview.webm')}  (webm, preview only)`)
  }
}

console.log(`\n  runtime ${tc(now())}`)
console.log(`  markers → ${markerPath}`)
console.log('  Markers are relative to the white flash — align the OBS take to that frame.\n')
