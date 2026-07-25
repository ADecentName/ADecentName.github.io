import { useGame } from '../game/GameContext.jsx'
import { metricInfo } from '../data/metrics.js'

// The teaching moment shown after a scored choice: whether it was a safe,
// mixed, or risky move, why, the metric changes, and the IMDA action it maps to.
// When the answer wasn't the best one, the correct action is revealed too —
// so the player always learns the right move before the "Did You Know?" card.
const VERDICTS = {
  good: { cls: 'is-good', icon: '✅', label: 'Safe move' },
  mixed: { cls: 'is-mixed', icon: '🟡', label: 'Could be safer' },
  risky: { cls: 'is-risky', icon: '⚠️', label: 'Risky move' },
}

export default function FeedbackModal({ feedback }) {
  const { dispatch } = useGame()
  const v = VERDICTS[feedback.verdict] || VERDICTS.risky
  const effects = feedback.effects || {}
  const deltas = Object.entries(effects).filter(([, d]) => d !== 0)
  const parts = feedback.parts || []
  const better = feedback.better

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className={`feedback-modal ${v.cls}`}>
        <div className="feedback-verdict">
          <span className="feedback-icon">{v.icon}</span>
          <span>{v.label}</span>
        </div>

        {feedback.note && <p className="feedback-note">{feedback.note}</p>}

        {/* Multi-answer scenes: one block per option the player picked. */}
        {parts.map((p, i) => {
          const pv = VERDICTS[p.verdict] || VERDICTS.risky
          return (
            <div key={i} className={`feedback-part ${pv.cls}`}>
              <p className="feedback-part-label">
                {pv.icon} {p.label}
              </p>
              <p className="feedback-note">{p.note}</p>
            </div>
          )
        })}

        {deltas.length > 0 && (
          <div className="feedback-deltas">
            {deltas.map(([metric, delta]) => {
              const m = metricInfo(metric)
              const up = delta > 0
              return (
                <span
                  key={metric}
                  className={`delta-chip ${up ? 'up' : 'down'}`}
                  style={{ '--accent': m.color }}
                >
                  {m.emoji} {m.label} {up ? `+${delta}` : delta}
                </span>
              )
            })}
          </div>
        )}

        {better && (
          <div className="feedback-better">
            <p className="feedback-better-head">
              ✅ {better.labels.length > 1 ? 'The best answers were' : 'The best answer was'}
            </p>
            <ul className="feedback-better-list">
              {better.labels.map((label, i) => (
                <li key={i} className={label.got ? 'is-got' : ''}>
                  {label.text}
                  {label.got && <span className="feedback-better-got">you had this one</span>}
                </li>
              ))}
            </ul>
            {better.note && <p className="feedback-note">{better.note}</p>}
          </div>
        )}

        {feedback.action && (
          <p className="feedback-action">
            <span className="feedback-action-label">Key action</span>
            {feedback.action}
          </p>
        )}

        <button className="btn btn-primary" onClick={() => dispatch({ type: 'DISMISS_FEEDBACK' })}>
          Continue
        </button>
      </div>
    </div>
  )
}
