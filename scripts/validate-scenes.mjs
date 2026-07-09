// Scene-graph integrity check. Run with: node scripts/validate-scenes.mjs
// Verifies every choice `next` and CHAPTER_START id resolves to a real scene,
// that each scene is either a decision (choices) or a terminus (ending) but
// not neither, and that every scene is reachable from a chapter start.

import scenes, { SCENES, CHAPTER_START } from '../src/data/scenes.js'
import { ACTION_IDS } from '../src/data/actions.js'

const errors = []
const warnings = []

// 1. Chapter starts exist and cover every pillar.
for (const pillar of ACTION_IDS) {
  const startId = CHAPTER_START[pillar]
  if (!startId) errors.push(`No CHAPTER_START entry for pillar "${pillar}"`)
  else if (!SCENES[startId]) errors.push(`CHAPTER_START["${pillar}"] -> missing scene "${startId}"`)
}

// 2. Every scene is a decision xor a terminus, and all `next` ids resolve.
for (const scene of scenes) {
  const hasChoices = Array.isArray(scene.choices) && scene.choices.length > 0
  const hasEnding = !!scene.ending
  if (hasChoices && hasEnding)
    errors.push(`Scene "${scene.id}" has BOTH choices and an ending`)
  if (!hasChoices && !hasEnding)
    errors.push(`Scene "${scene.id}" has neither choices nor an ending (dead end)`)

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
    for (const c of SCENES[id].choices || []) stack.push(c.next)
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
