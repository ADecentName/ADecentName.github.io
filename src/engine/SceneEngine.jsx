import { useGame } from '../game/GameContext.jsx'
import { getScene } from '../game/reducer.js'
import { CHAPTER_BY_ID } from '../data/chapters.js'
import DialogueBox from '../components/DialogueBox.jsx'
import ChoiceList from '../components/ChoiceList.jsx'
import InfoPanel from '../components/InfoPanel.jsx'
import FeedbackModal from '../components/FeedbackModal.jsx'
import ScoreHUD from '../components/ScoreHUD.jsx'

// Orchestrates the current scene: background + dialogue/info + choices, the
// feedback modal, and the transition to the chapter-end screen at a terminus.
export default function SceneEngine() {
  const { state, dispatch } = useGame()
  const scene = getScene(state)
  const chapter = CHAPTER_BY_ID[state.activeChapter]

  if (!scene) {
    return (
      <div className="screen scene-screen">
        <p>Something went wrong loading this scene.</p>
        <button className="btn btn-primary" onClick={() => dispatch({ type: 'GO_HUB' })}>
          Back to chapters
        </button>
      </div>
    )
  }

  const isInfo = !!scene.panel
  const isTerminus = !!scene.ending

  return (
    <div className={`screen scene-screen bg-${scene.background || 'default'}`}>
      <div className="scene-topbar">
        <button className="btn btn-ghost" onClick={() => dispatch({ type: 'GO_HUB' })}>
          ← Chapters
        </button>
        {chapter && (
          <span className="scene-chapter-tag" style={{ '--accent': chapter.color }}>
            {chapter.emoji} {chapter.officialTitle}
          </span>
        )}
        <ScoreHUD />
      </div>

      <div className="scene-stage">
        {!isInfo && scene.speaker && scene.speaker !== 'Narrator' && (
          <div className="scene-sprite" aria-hidden="true">
            {spriteFor(scene.speaker)}
          </div>
        )}
      </div>

      <div className="scene-bottom">
        {scene.wip && (
          <div className="scene-wip-badge" role="status">
            🚧 Work in progress — this scenario is still being written
          </div>
        )}
        {isInfo ? (
          <InfoPanel scene={scene} />
        ) : (
          <>
            {scene.bonus && <div className="scene-bonus-badge">⭐ Bonus question</div>}
            <DialogueBox scene={scene} />
            {isTerminus ? (
              <div className="choice-list is-continue">
                <button
                  className="btn btn-continue"
                  onClick={() => dispatch({ type: 'FINISH_CHAPTER' })}
                >
                  See your result →
                </button>
              </div>
            ) : (
              <ChoiceList scene={scene} />
            )}
          </>
        )}
      </div>

      {state.pendingFeedback && <FeedbackModal feedback={state.pendingFeedback} />}
    </div>
  )
}

// Placeholder "sprites" — an emoji per speaker. Swap for real art later.
function spriteFor(speaker) {
  const map = {
    Mika: '🧑🏻',
    Jules: '🧑🏽‍🦱',
    Seller: '🧑🏻‍💻',
    Reward: '🎁',
    Phone: '📱',
  }
  return map[speaker] || '💬'
}
