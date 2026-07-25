import { useGame } from '../game/GameContext.jsx'
import { allChaptersComplete } from '../game/reducer.js'
import { CHAPTERS } from '../data/chapters.js'

// Chapter select. One card per IMDA action; shows completion state and,
// once all four are done, unlocks the final summary.
export default function Hub() {
  const { state, dispatch } = useGame()
  const done = allChaptersComplete(state)

  return (
    <div className="screen hub-screen">
      <header className="hub-header">
        <h1>Choose a chapter</h1>
        <p>Each chapter is one of the four key online-safety actions. Play them in any order.</p>
      </header>

      <div className="hub-grid">
        {CHAPTERS.map((c) => {
          const complete = state.completedChapters.includes(c.id)
          return (
            <button
              key={c.id}
              className={`chapter-card${complete ? ' is-complete' : ''}`}
              style={{ '--accent': c.color }}
              onClick={() => dispatch({ type: 'OPEN_CHAPTER', chapter: c.id })}
            >
              <div className="chapter-card-top">
                <span className="chapter-emoji">{c.emoji}</span>
                <span className="chapter-num">Chapter {c.order}</span>
                {complete && <span className="chapter-check" aria-label="Completed">✓</span>}
              </div>
              <h2 className="chapter-name">{c.chapterTitle}</h2>
              <p className="chapter-action">{c.officialTitle}</p>
              <p className="chapter-short">{c.short}</p>
              <span className="chapter-cta">
                {complete ? 'Replay' : 'Play'} · {c.meter.emoji} {c.meter.name} →
              </span>
            </button>
          )
        })}
      </div>

      <footer className="hub-footer">
        <button
          className="btn btn-primary btn-lg"
          disabled={!done}
          onClick={() => dispatch({ type: 'SHOW_REFLECTION' })}
        >
          {done
            ? 'See your final results'
            : `Finish all 4 chapters to see results (${state.completedChapters.length}/4)`}
        </button>
      </footer>
    </div>
  )
}
