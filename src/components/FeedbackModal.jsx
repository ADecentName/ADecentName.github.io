import { useGame } from '../game/GameContext.jsx'
import { metricInfo } from '../data/metrics.js'

// The teaching moment shown after a scored choice: whether it was a safe,
// mixed, or risky move, why, the metric changes, and the IMDA action it maps to.
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

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className={`feedback-modal ${v.cls}`}>
        <div className="feedback-verdict">
          <span className="feedback-icon">{v.icon}</span>
          <span>{v.label}</span>
        </div>

        <p className="feedback-note">{feedback.note}</p>

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
