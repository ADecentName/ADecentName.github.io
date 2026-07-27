#!/usr/bin/env node
//
// Posts synthetic play sessions to the analytics endpoint so you can see what
// the dashboard looks like with real volume, before real players exist.
//
// Every event it sends is flagged `test: 1`, so it never touches the reported
// numbers: rebuild with **SafeSteps → Rebuild including test rows** to view it,
// and **SafeSteps → Delete all test rows** to clear it out afterwards.
//
// The sessions walk the actual scene graph in src/data/scenes.js — real scene
// ids, real choice verdicts, real walkthrough flows — so the dashboard renders
// exactly the shape it will have in the field. The *numbers* are invented.
//
// Use:
//   node scripts/seed-analytics.mjs 40        # 40 sessions
//   URL=…/exec node scripts/seed-analytics.mjs 40
//
// With no URL it reads VITE_ANALYTICS_URL out of .env.local.

import { readFile } from 'node:fs/promises'
import { SCENES, CHAPTER_START } from '../src/data/scenes.js'

const SESSIONS = Number(process.argv[2] || 30)
const DRY = process.env.DRY === '1' // build the sessions, print a summary, send nothing

const endpoint = await (async () => {
  if (DRY) return 'dry-run'
  if (process.env.URL) return process.env.URL
  try {
    const env = await readFile('.env.local', 'utf8')
    return env.match(/VITE_ANALYTICS_URL\s*=\s*(\S+)/)?.[1] ?? ''
  } catch {
    return ''
  }
})()

if (!endpoint) {
  console.error('No endpoint. Pass URL=…/exec or put VITE_ANALYTICS_URL in .env.local')
  process.exit(1)
}

// How a cohort behaves, roughly. Tune to taste — these only shape the preview.
const P = {
  openSecondChapter: 0.8, // carries on after chapter 1
  openThirdChapter: 0.7,
  openFourthChapter: 0.62,
  abandonPerScene: 0.015, // quits mid-chapter
  answerWell: 0.55, // picks the best option first time
  startWalkthrough: 0.86, // taps into a phone mock at all
  finishWalkthrough: 0.63, // …and taps it all the way to the receipt
}

const pick = (xs) => xs[Math.floor(Math.random() * xs.length)]
const chance = (p) => Math.random() < p

// Walk one chapter, emitting the same events the game would.
function playChapter(events, chapterId, clock) {
  let sceneId = CHAPTER_START[chapterId]
  let good = 0
  let scored = 0

  for (let guard = 0; guard < 60 && sceneId; guard++) {
    const scene = SCENES[sceneId]
    if (!scene) break
    clock.t += 4000 + Math.random() * 9000
    events.push({ e: 'scene_view', chapter: chapterId, scene: sceneId, t: Math.round(clock.t) })

    if (chance(P.abandonPerScene)) return { done: false, good, scored }

    // Phone walkthroughs: some players tap in, fewer tap all the way through.
    if (scene.panel?.mockup) {
      const flow = scene.panel.mockup
      if (chance(P.startWalkthrough)) {
        clock.t += 2500
        events.push({ e: 'tutorial_step', flow, step: 1, t: Math.round(clock.t) })
        if (chance(P.finishWalkthrough)) {
          clock.t += 4000
          events.push({ e: 'tutorial_complete', flow, t: Math.round(clock.t) })
        }
      }
    }

    if (scene.choices?.length) {
      const scoredChoices = scene.choices.filter((c) => c.feedback)
      if (scoredChoices.length) {
        const best = scoredChoices.filter((c) => c.feedback.verdict === 'good')
        const rest = scoredChoices.filter((c) => c.feedback.verdict !== 'good')
        const choice =
          best.length && chance(P.answerWell) ? pick(best) : pick(rest.length ? rest : best)
        scored++
        if (choice.feedback.verdict === 'good') good++
        clock.t += 3000 + Math.random() * 6000
        events.push({
          e: 'choice',
          chapter: chapterId,
          scene: sceneId,
          pick: scene.choices.indexOf(choice),
          verdict: choice.feedback.verdict,
          t: Math.round(clock.t),
        })
        sceneId = choice.next
      } else {
        sceneId = scene.choices[0].next
      }
    } else {
      sceneId = scene.next
    }

    if (!sceneId) break
  }

  const pct = scored ? Math.round((good / scored) * 100) : 0
  clock.t += 3000
  events.push({
    e: 'chapter_complete',
    chapter: chapterId,
    pct,
    tier: pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low',
    t: Math.round(clock.t),
  })
  return { done: true, good, scored }
}

function makeSession(n) {
  const events = []
  const clock = { t: 1500 }
  events.push({ e: 'game_start', t: 900 })

  const order = ['boundaries', 'think', 'report', 'support']
  const gates = [1, P.openSecondChapter, P.openThirdChapter, P.openFourthChapter]
  let completed = 0

  for (let i = 0; i < order.length; i++) {
    if (!chance(gates[i])) break
    events.push({ e: 'chapter_open', chapter: order[i], t: Math.round(clock.t) })
    const res = playChapter(events, order[i], clock)
    if (!res.done) break
    completed++
    clock.t += 2000
    events.push({ e: 'hub_view', done: completed, t: Math.round(clock.t) })
  }

  if (completed === 4) {
    clock.t += 5000
    events.push({ e: 'reflection_view', t: Math.round(clock.t) })
    clock.t += 30000
    events.push({ e: 'results_view', done: 4, t: Math.round(clock.t) })
  }

  return { sid: `seed-${Date.now().toString(36)}-${n}`, events }
}

// Send in batches of 25, exactly like the client does.
async function post(sid, events) {
  if (DRY) return
  for (let i = 0; i < events.length; i += 25) {
    const body = JSON.stringify({ sid, test: 1, events: events.slice(i, i + 25) })
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  }
}

console.log(
  DRY
    ? `Dry run — building ${SESSIONS} sessions, sending nothing\n`
    : `Seeding ${SESSIONS} sessions → ${endpoint.slice(0, 60)}…\n`,
)

let rows = 0
const tally = {}
for (let n = 0; n < SESSIONS; n++) {
  const { sid, events } = makeSession(n)
  await post(sid, events)
  rows += events.length
  for (const ev of events) tally[ev.e] = (tally[ev.e] || 0) + 1
  if (!DRY) process.stdout.write(`\r  ${n + 1}/${SESSIONS} sessions · ${rows} rows`)
}

if (DRY) {
  console.log(`  ${SESSIONS} sessions → ${rows} events`)
  for (const [e, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(5)}  ${e}`)
  }
  console.log('\nNothing was sent. Drop DRY=1 to seed for real.\n')
} else {
  console.log(`\n\nDone. In the Sheet: SafeSteps → Rebuild including test rows.`)
  console.log(`When finished previewing: SafeSteps → Delete all test rows.\n`)
}
