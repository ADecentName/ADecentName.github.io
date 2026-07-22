// Turns accumulated points into 0–100% meters for each chapter.
//
// A chapter's score for a metric is bounded by the best/worst it is possible
// to earn on that metric across the chapter's decision scenes. We derive those
// bounds automatically from scenes.js (sum of the max and min delta available
// at each scored decision), so content edits stay in one place.
//
//   pct = (points - minTotal) / (maxTotal - minTotal) * 100   (clamped 0–100)
//
// A chapter's overall meter is the average of its tracked metrics' percentages.

import scenes from '../data/scenes.js'
import { CHAPTER_BY_ID, tierFor } from '../data/chapters.js'

// Precompute per-chapter, per-metric {min,max} point bounds.
const BOUNDS = (() => {
  const byChapter = {}
  for (const scene of scenes) {
    const scored = (scene.choices || []).filter((c) => c.effects)
    if (scored.length === 0) continue
    const ch = (byChapter[scene.chapter] ||= {})
    // Per metric appearing in this decision, add the best and worst delta.
    const metrics = new Set()
    for (const c of scored) for (const m of Object.keys(c.effects)) metrics.add(m)
    for (const m of metrics) {
      const deltas = scored.map((c) => c.effects[m] || 0)
      const b = (ch[m] ||= { min: 0, max: 0 })
      b.max += Math.max(...deltas, 0)
      b.min += Math.min(...deltas, 0)
    }
  }
  return byChapter
})()

// Percentage (0–100) for one metric in one chapter given raw points.
export function metricPct(chapterId, metric, points) {
  const b = BOUNDS[chapterId]?.[metric]
  if (!b || b.max === b.min) return points >= 0 ? 100 : 0
  const pct = ((points - b.min) / (b.max - b.min)) * 100
  return Math.round(Math.max(0, Math.min(100, pct)))
}

// Full result for a chapter: each tracked metric's %, the combined meter %,
// and the tier band it falls into.
export function chapterResult(chapterId, chapterScores = {}) {
  const chapter = CHAPTER_BY_ID[chapterId]
  if (!chapter) return null
  const metrics = chapter.metrics.map((m) => ({
    key: m,
    points: chapterScores[m] || 0,
    pct: metricPct(chapterId, m, chapterScores[m] || 0),
  }))
  const overall = Math.round(
    metrics.reduce((sum, m) => sum + m.pct, 0) / (metrics.length || 1),
  )
  return { chapter, metrics, overall, tier: tierFor(chapter, overall) }
}
