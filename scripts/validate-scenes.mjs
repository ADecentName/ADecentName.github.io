// Scene-graph integrity check. Run with: node scripts/validate-scenes.mjs
// Verifies every `next` (choice targets and info-scene links) and each
// CHAPTER_START id resolves to a real scene, that each scene is exactly one of
// {decision, info, terminus}, and that every scene is reachable from a start.

import scenes, { SCENES, CHAPTER_START } from '../src/data/scenes.js'
import { CHAPTER_IDS, CHAPTER_BY_ID } from '../src/data/chapters.js'

const errors = []
const warnings = []

// 1. Chapter starts exist and cover every chapter.
for (const id of CHAPTER_IDS) {
  const startId = CHAPTER_START[id]
  if (!startId) errors.push(`No CHAPTER_START entry for chapter "${id}"`)
  else if (!SCENES[startId]) errors.push(`CHAPTER_START["${id}"] -> missing scene "${startId}"`)
}

// 2. Each scene is exactly one type, and all `next` ids resolve.
for (const scene of scenes) {
  const hasChoices = Array.isArray(scene.choices) && scene.choices.length > 0
  const isInfo = !!scene.panel
  const hasEnding = !!scene.ending
  const kinds = [hasChoices, isInfo, hasEnding].filter(Boolean).length
  if (kinds === 0)
    errors.push(`Scene "${scene.id}" is empty (no choices, panel, or ending)`)
  if (kinds > 1)
    errors.push(`Scene "${scene.id}" mixes types (choices/panel/ending) — pick one`)

  if (scene.chapter && !CHAPTER_BY_ID[scene.chapter])
    errors.push(`Scene "${scene.id}" has unknown chapter "${scene.chapter}"`)

  // Info scenes advance via `next`; decision scenes via each choice's `next`.
  if (isInfo) {
    if (!scene.next) errors.push(`Info scene "${scene.id}" has no "next"`)
    else if (!SCENES[scene.next]) errors.push(`Info scene "${scene.id}" -> missing "${scene.next}"`)
  }
  for (const choice of scene.choices || []) {
    if (!choice.next) errors.push(`Scene "${scene.id}": a choice has no "next"`)
    else if (!SCENES[choice.next])
      errors.push(`Scene "${scene.id}": choice -> missing scene "${choice.next}"`)
  }
}

// 3. Reachability from each chapter start.
const reachable = new Set()
for (const startId of Object.values(CHAPTER_START)) {
  const stack = [startId]
  while (stack.length) {
    const id = stack.pop()
    if (reachable.has(id) || !SCENES[id]) continue
    reachable.add(id)
    const s = SCENES[id]
    if (s.next) stack.push(s.next)
    for (const c of s.choices || []) stack.push(c.next)
  }
}
for (const scene of scenes) {
  if (!reachable.has(scene.id))
    warnings.push(`Scene "${scene.id}" is not reachable from any chapter start`)
}

// Report --------------------------------------------------------------
console.log(`Scenes: ${scenes.length} | reachable: ${reachable.size}`)
if (warnings.length) {
  console.warn('\nWarnings:')
  for (const w of warnings) console.warn('  - ' + w)
}
if (errors.length) {
  console.error('\nErrors:')
  for (const e of errors) console.error('  - ' + e)
  console.error(`\nFAILED with ${errors.length} error(s).`)
  process.exit(1)
}
console.log('\nOK — scene graph is valid.')
