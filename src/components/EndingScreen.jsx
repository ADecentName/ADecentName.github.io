import { useGame } from '../game/GameContext.jsx'
import { ACTIONS } from '../data/actions.js'

// Display range used to draw the per-pillar bars. Scores can go slightly
// negative on a fully-risky playthrough; this range keeps bars readable.
const MIN = -5
const MAX = 9

function tier(score) {
  if (score >= 4) return 'high'
  if (score >= 1) return 'mid'
  return 'low'
}

function pct(score) {
  const clamped = Math.max(MIN, Math.min(MAX, score))
  return Math.round(((clamped - MIN) / (MAX - MIN)) * 100)
}

export default function EndingScreen() {
  const { state, dispatch } = useGame()
  const total = ACTIONS.reduce((sum, a) => sum + state.scores[a.id], 0)

  return (
    <div className="screen results-screen">
      <div className="results-card">
        <p className="title-eyebrow">Your results</p>
        <h1>How safe were your steps?</h1>
        <p className="results-total">
          Total score: <strong>{total > 0 ? `+${total}` : total}</strong>
        </p>

        <ul className="results-bars">
          {ACTIONS.map((a) => {
            const score = state.scores[a.id]
            const t = tier(score)
            return (
              <li key={a.id} className="results-row">
                <div className="results-row-head">
                  <span className="results-emoji">{a.emoji}</span>
                  <span className="results-name">{a.officialTitle}</span>
                  <span className={`results-badge tier-${t}`}>
                    {t === 'high' ? 'Strong' : t === 'mid' ? 'Getting there' : 'Work on this'}
                  </span>
                </div>
                <div className="results-bar-track">
                  <div
                    className="results-bar-fill"
                    style={{ width: `${pct(score)}%`, background: a.color }}
                  />
                </div>
                <p className="results-blurb">{a.endingBlurbs[t]}</p>
              </li>
            )
          })}
        </ul>

        <div className="end-actions">
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'GO_HUB' })}>
            Back to chapters
          </button>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'RESET' })}>
            Play again
          </button>
        </div>
      </div>
    </div>
  )
}
