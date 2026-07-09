// Game state: a small finite-state machine over screens plus per-pillar scores.
// All transitions live here so components stay dumb (dispatch intents, render state).

import { ACTION_IDS } from '../data/actions.js'
import { SCENES, CHAPTER_START } from '../data/scenes.js'

const zeroScores = () => Object.fromEntries(ACTION_IDS.map((id) => [id, 0]))

export const initialState = {
  screen: 'title', // 'title' | 'hub' | 'scene' | 'chapterEnd' | 'ending'
  currentSceneId: null,
  activeChapter: null, // pillar id of the chapter being played
  scores: zeroScores(), // { boundaries, think, report, support }
  completedChapters: [], // pillar ids finished at least once
  pendingFeedback: null, // feedback object to show before advancing
  nextAfterFeedback: null, // scene id queued behind the feedback modal
  history: [], // visited scene ids within the current chapter (for Back)
}

function applyEffects(scores, effects) {
  if (!effects) return scores
  const next = { ...scores }
  for (const [pillar, delta] of Object.entries(effects)) {
    if (pillar in next) next[pillar] += delta
  }
  return next
}

export function reducer(state, action) {
  switch (action.type) {
    case 'START':
      return { ...state, screen: 'hub' }

    case 'OPEN_CHAPTER': {
      const startId = CHAPTER_START[action.chapter]
      if (!startId) return state
      return {
        ...state,
        screen: 'scene',
        activeChapter: action.chapter,
        currentSceneId: startId,
        pendingFeedback: null,
        nextAfterFeedback: null,
        history: [startId],
      }
    }

    case 'CHOOSE': {
      const { choice } = action
      const scores = applyEffects(state.scores, choice.effects)
      // A choice with feedback pauses on the modal before advancing.
      if (choice.feedback) {
        return {
          ...state,
          scores,
          pendingFeedback: choice.feedback,
          nextAfterFeedback: choice.next,
        }
      }
      // "Continue" beats (no feedback) advance immediately.
      return {
        ...state,
        scores,
        currentSceneId: choice.next,
        history: [...state.history, choice.next],
      }
    }

    case 'DISMISS_FEEDBACK': {
      const nextId = state.nextAfterFeedback
      return {
        ...state,
        currentSceneId: nextId,
        pendingFeedback: null,
        nextAfterFeedback: null,
        history: [...state.history, nextId],
      }
    }

    case 'FINISH_CHAPTER': {
      const done = state.completedChapters.includes(state.activeChapter)
        ? state.completedChapters
        : [...state.completedChapters, state.activeChapter]
      return { ...state, screen: 'chapterEnd', completedChapters: done }
    }

    case 'GO_HUB':
      return {
        ...state,
        screen: 'hub',
        currentSceneId: null,
        activeChapter: null,
        pendingFeedback: null,
        nextAfterFeedback: null,
        history: [],
      }

    case 'SHOW_ENDING':
      return { ...state, screen: 'ending' }

    case 'RESET':
      return { ...initialState, scores: zeroScores() }

    default:
      return state
  }
}

// Selectors --------------------------------------------------------------

export const getScene = (state) => SCENES[state.currentSceneId] || null

export const allChaptersComplete = (state) =>
  ACTION_IDS.every((id) => state.completedChapters.includes(id))
