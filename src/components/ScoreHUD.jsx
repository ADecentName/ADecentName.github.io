import { useGame } from '../game/GameContext.jsx'
import { ACTIONS } from '../data/actions.js'

// Compact always-visible readout of the four pillar scores during a scene.
// The active chapter's pillar is highlighted.
export default function ScoreHUD() {
  const { state } = useGame()
  return (
    <div className="score-hud" aria-label="Your online-safety scores">
      {ACTIONS.map((a) => {
        const active = state.activeChapter === a.id
        const score = state.scores[a.id]
        return (
          <div
            key={a.id}
            className={`hud-pill${active ? ' is-active' : ''}`}
            style={{ '--accent': a.color }}
            title={a.officialTitle}
          >
            <span className="hud-emoji">{a.emoji}</span>
            <span className="hud-score">{score > 0 ? `+${score}` : score}</span>
          </div>
        )
      })}
    </div>
  )
}
