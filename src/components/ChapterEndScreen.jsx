import { useGame } from '../game/GameContext.jsx'
import { getScene, allChaptersComplete } from '../game/reducer.js'
import { ACTION_BY_ID } from '../data/actions.js'

// Recap shown at the end of a chapter: the terminus text, the pillar score
// earned, and a route onward (results if everything is done, else back to hub).
export default function ChapterEndScreen() {
  const { state, dispatch } = useGame()
  const scene = getScene(state)
  const chapter = ACTION_BY_ID[state.activeChapter]
  const ending = scene?.ending
  const pillarScore = chapter ? state.scores[chapter.id] : 0
  const done = allChaptersComplete(state)

  return (
    <div className="screen end-screen">
      <div className="end-card" style={{ '--accent': chapter?.color || '#4f8cff' }}>
        <span className="end-emoji">{chapter?.emoji}</span>
        <h1>{ending?.title || 'Chapter complete'}</h1>
        <p className="end-text">{ending?.text}</p>

        {chapter && (
          <div className="end-scoreline">
            <span>{chapter.officialTitle}</span>
            <strong>{pillarScore > 0 ? `+${pillarScore}` : pillarScore} pts</strong>
          </div>
        )}

        <div className="end-actions">
          <button className="btn btn-ghost" onClick={() => dispatch({ type: 'GO_HUB' })}>
            Back to chapters
          </button>
          {done && (
            <button className="btn btn-primary" onClick={() => dispatch({ type: 'SHOW_ENDING' })}>
              See your results →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
