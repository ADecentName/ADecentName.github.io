import { useGame } from '../game/GameContext.jsx'
import { CHAPTER_BY_ID } from '../data/chapters.js'
import { metricInfo } from '../data/metrics.js'
import { metricPct } from '../game/scoring.js'

// Live readout of the active chapter's tracked metrics as small meters.
// Only shown while a chapter is being played.
export default function ScoreHUD() {
  const { state } = useGame()
  const chapter = CHAPTER_BY_ID[state.activeChapter]
  if (!chapter) return null
  const bucket = state.scores[chapter.id] || {}

  return (
    <div className="score-hud" aria-label="Your live scores this chapter">
      {chapter.metrics.map((key) => {
        const m = metricInfo(key)
        const pct = metricPct(chapter.id, key, bucket[key] || 0)
        return (
          <div key={key} className="hud-pill" style={{ '--accent': m.color }} title={m.label}>
            <span className="hud-emoji">{m.emoji}</span>
            <span className="hud-bar" aria-hidden="true">
              <span className="hud-bar-fill" style={{ width: `${pct}%` }} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
