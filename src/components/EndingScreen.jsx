import { useGame } from '../game/GameContext.jsx'
import { CHAPTERS } from '../data/chapters.js'
import { chapterResult } from '../game/scoring.js'

// Final results: each chapter's themed meter + tier, and an overall
// online-safety percentage across all four IMDA actions.
export default function EndingScreen() {
  const { state, dispatch } = useGame()

  const results = CHAPTERS.map((c) => chapterResult(c.id, state.scores[c.id])).filter(Boolean)
  const overall = results.length
    ? Math.round(results.reduce((s, r) => s + r.overall, 0) / results.length)
    : 0
  const overallBand = overall >= 70 ? 'high' : overall >= 40 ? 'mid' : 'low'
  const overallLabel =
    overallBand === 'high'
      ? 'Online-Safety Champion 🏆'
      : overallBand === 'mid'
        ? 'Getting Safer 🌱'
        : 'Just Starting Out 🧭'

  return (
    <div className="screen results-screen">
      <div className="results-card">
        <p className="title-eyebrow">Your final results</p>
        <h1>How safe were your steps?</h1>

        <div className={`overall-badge tier-${overallBand}`}>
          <span className="overall-pct">{overall}%</span>
          <span className="overall-label">{overallLabel}</span>
          <span className="overall-sub">across all four online-safety actions</span>
        </div>

        <ul className="results-bars">
          {results.map((r) => (
            <li key={r.chapter.id} className="results-row">
              <div className="results-row-head">
                <span className="results-emoji">{r.chapter.emoji}</span>
                <span className="results-name">{r.chapter.officialTitle}</span>
                <span className={`results-badge tier-${r.tier.band}`}>{r.tier.name}</span>
              </div>
              <div className="results-bar-track">
                <div
                  className="results-bar-fill"
                  style={{ width: `${r.overall}%`, background: r.chapter.color }}
                />
              </div>
              <p className="results-blurb">
                {r.chapter.meter.emoji} {r.chapter.meter.name}: <strong>{r.overall}%</strong> ·{' '}
                {r.tier.desc}
              </p>
            </li>
          ))}
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
