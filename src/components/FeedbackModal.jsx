import { useGame } from '../game/GameContext.jsx'

// The teaching moment shown after a scored choice: whether it was safe or
// risky, why, and which IMDA action it maps to.
export default function FeedbackModal({ feedback }) {
  const { dispatch } = useGame()
  const good = feedback.verdict === 'good'

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className={`feedback-modal ${good ? 'is-good' : 'is-risky'}`}>
        <div className="feedback-verdict">
          <span className="feedback-icon">{good ? '✅' : '⚠️'}</span>
          <span>{good ? 'Safe move' : 'Risky move'}</span>
        </div>
        <p className="feedback-note">{feedback.note}</p>
        {feedback.action && (
          <p className="feedback-action">
            <span className="feedback-action-label">Key action</span>
            {feedback.action}
          </p>
        )}
        <button
          className="btn btn-primary"
          onClick={() => dispatch({ type: 'DISMISS_FEEDBACK' })}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
