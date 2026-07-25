import { useGame } from '../game/GameContext.jsx'
import { allChaptersComplete, getScene } from '../game/reducer.js'
import { chapterResult } from '../game/scoring.js'
import { metricInfo } from '../data/metrics.js'

// End-of-chapter reveal: "let's see how you did" — the tracked metric bars
// first, then the combined themed meter (Boundary Meter, Digital Citizenship
// Score, …) with its tier.
export default function ChapterEndScreen() {
  const { state, dispatch } = useGame()
  const scene = getScene(state)
  const ending = scene?.ending
  const result = chapterResult(state.activeChapter, state.scores[state.activeChapter])
  const done = allChaptersComplete(state)

  if (!result) return null
  const { chapter, metrics, overall, tier } = result

  return (
    <div className="screen end-screen">
      <div className="end-card" style={{ '--accent': chapter.color }}>
        <span className="end-emoji">{chapter.emoji}</span>
        <h1>{ending?.title || 'Chapter complete'}</h1>
        <p className="end-text">{ending?.text}</p>

        <p className="meter-intro">Let&rsquo;s see how well you did.</p>

        <ul className="meter-bars">
          {metrics.map((m) => {
            const info = metricInfo(m.key)
            return (
              <li key={m.key} className="meter-row">
                <div className="meter-row-head">
                  <span>
                    {info.emoji} {info.label}
                  </span>
                  <strong>{m.pct}%</strong>
                </div>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{ width: `${m.pct}%`, background: info.color }}
                  />
                </div>
              </li>
            )
          })}
        </ul>

        <div className={`meter-combined tier-${tier.band}`}>
          <span className="meter-combined-label">
            {chapter.meter.emoji} {chapter.meter.name}
          </span>
          <span className="meter-combined-pct">{overall}%</span>
          <span className="meter-combined-tier">{tier.name}</span>
          <p className="meter-combined-desc">{tier.desc}</p>
        </div>

        <div className="end-actions">
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'GO_HUB' })}>
            Back to chapters
          </button>
          {done && (
            <button
              className="btn btn-primary"
              onClick={() => dispatch({ type: 'SHOW_REFLECTION' })}
            >
              See final results →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
