import { useGame } from '../game/GameContext.jsx'
import PhoneMock from './PhoneMock.jsx'

// Renders a non-decision scene: a chapter intro, a "Did You Know?" fact card,
// a "how to report" tutorial, or a support-resources card. Each advances via
// the scene's `next`.
export default function InfoPanel({ scene }) {
  const { dispatch } = useGame()
  const p = scene.panel || {}
  const advance = () => dispatch({ type: 'ADVANCE', next: scene.next })

  return (
    <div className={`info-panel info-${p.kind}`}>
      {p.eyebrow && <p className="info-eyebrow">{p.eyebrow}</p>}

      {p.kind === 'didYouKnow' && <p className="info-tag">💡 Did You Know?</p>}
      {p.kind === 'tutorial' && (
        <p className="info-tag">
          📲 {p.platform ? `${p.platform} · ` : ''}
          {p.tagLabel || 'How to report'}
        </p>
      )}
      {p.kind === 'resources' && <p className="info-tag">🫶 Support &amp; Resources</p>}

      {p.title && <h2 className="info-title">{p.title}</h2>}

      {p.stat && <p className="info-stat">{p.stat}</p>}

      {(p.body || []).map((para, i) => (
        <p key={i} className="info-body">
          {para}
        </p>
      ))}

      {p.bullets && (
        <ul className="info-bullets">
          {p.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}

      {p.steps && (
        <ol className="info-steps">
          {p.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      )}

      {p.mockup && <PhoneMock kind={p.mockup} />}

      {p.resources && (
        <ul className="info-resources">
          {p.resources.map((r, i) => (
            <li key={i}>
              <span className="resource-name">{r.name}</span>
              <span className="resource-contact">{r.contact}</span>
            </li>
          ))}
        </ul>
      )}

      {(p.extra || []).map((para, i) => (
        <p key={i} className="info-body">
          {para}
        </p>
      ))}

      {p.footer && <p className="info-footer">{p.footer}</p>}

      {p.source && (
        <a className="info-source" href={p.source.url} target="_blank" rel="noreferrer">
          Source: {p.source.label} ↗
        </a>
      )}

      {p.sources && (
        <div className="info-sources">
          {p.sources.map((s, i) => (
            <a
              key={i}
              className="info-source"
              href={s.url}
              target="_blank"
              rel="noreferrer"
            >
              Source: {s.label} ↗
            </a>
          ))}
        </div>
      )}

      <div className="info-actions">
        <button className="btn btn-primary" onClick={advance}>
          {p.kind === 'intro' ? "Let's begin →" : 'Continue →'}
        </button>
      </div>
    </div>
  )
}
