import { useGame } from '../game/GameContext.jsx'
import { allChaptersComplete } from '../game/reducer.js'
import { ACTIONS } from '../data/actions.js'

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
        {ACTIONS.map((a, i) => {
          const complete = state.completedChapters.includes(a.id)
          return (
            <button
              key={a.id}
              className={`chapter-card${complete ? ' is-complete' : ''}`}
              style={{ '--accent': a.color }}
              onClick={() => dispatch({ type: 'OPEN_CHAPTER', chapter: a.id })}
            >
              <div className="chapter-card-top">
                <span className="chapter-emoji">{a.emoji}</span>
                <span className="chapter-num">Chapter {i + 1}</span>
                {complete && <span className="chapter-check" aria-label="Completed">✓</span>}
              </div>
              <h2 className="chapter-name">{a.chapterTitle}</h2>
              <p className="chapter-action">{a.officialTitle}</p>
              <p className="chapter-short">{a.short}</p>
              <span className="chapter-cta">{complete ? 'Replay' : 'Play'} →</span>
            </button>
          )
        })}
      </div>

      <footer className="hub-footer">
        <button
          className="btn btn-primary btn-lg"
          disabled={!done}
          onClick={() => dispatch({ type: 'SHOW_ENDING' })}
        >
          {done ? 'See your results' : `Finish all 4 chapters to see results (${state.completedChapters.length}/4)`}
        </button>
      </footer>
    </div>
  )
}
