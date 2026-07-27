import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react'
import { reducer, initialState } from './reducer.js'
import { chapterResult } from './scoring.js'
import { SCENES } from '../data/scenes.js'
import { track, flush } from '../analytics.js'

const GameContext = createContext(null)

// Anonymous counters hang off dispatch, not off the reducer — a reducer must
// stay pure, and React re-runs it in development, which would double-count
// every event. Here each intent is reported exactly once, from the state as it
// was *before* the transition. See src/analytics.js for what is (and is not)
// collected; it no-ops entirely unless VITE_ANALYTICS_URL is set.
function report(state, action) {
  switch (action.type) {
    case 'START':
      return track('game_start')

    case 'OPEN_CHAPTER':
      return track('chapter_open', { chapter: action.chapter })

    case 'CHOOSE': {
      const scene = SCENES[state.currentSceneId]
      return track('choice', {
        chapter: state.activeChapter,
        scene: state.currentSceneId,
        pick: scene?.choices?.indexOf(action.choice) ?? -1,
        verdict: action.choice.feedback?.verdict ?? 'continue',
      })
    }

    case 'CHOOSE_MULTI': {
      const scene = SCENES[state.currentSceneId]
      const picks = (action.choices || []).map((c) => scene?.choices?.indexOf(c) ?? -1)
      return track('choice_multi', {
        chapter: state.activeChapter,
        scene: state.currentSceneId,
        pick: picks.join('+'),
      })
    }

    case 'ADVANCE':
      return track('scene_view', { chapter: state.activeChapter, scene: action.next })

    case 'DISMISS_FEEDBACK':
      return track('scene_view', {
        chapter: state.activeChapter,
        scene: state.nextAfterFeedback,
      })

    case 'FINISH_CHAPTER': {
      const result = chapterResult(state.activeChapter, state.scores[state.activeChapter])
      return track('chapter_complete', {
        chapter: state.activeChapter,
        pct: result?.overall,
        tier: result?.tier?.name,
      })
    }

    case 'GO_HUB':
      return track('hub_view', { done: state.completedChapters.length })

    case 'SHOW_REFLECTION':
      return track('reflection_view')

    case 'SHOW_ENDING':
      // End of the run — send whatever is still queued rather than hoping the
      // player leaves the tab in a way that fires pagehide.
      track('results_view', { done: state.completedChapters.length })
      return flush()

    default:
      return undefined
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Report against the current state without making the callback depend on it.
  const stateRef = useRef(state)
  stateRef.current = state

  const trackedDispatch = useCallback((action) => {
    try {
      report(stateRef.current, action)
    } catch {
      /* never let a counter break a transition */
    }
    dispatch(action)
  }, [])

  const value = useMemo(
    () => ({ state, dispatch: trackedDispatch }),
    [state, trackedDispatch],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
