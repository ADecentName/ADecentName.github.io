// Game state: a small finite-state machine over screens plus per-chapter,
// per-metric scores. All transitions live here so components stay dumb
// (dispatch intents, render state).

import { CHAPTERS, CHAPTER_IDS } from '../data/chapters.js'
import { SCENES, CHAPTER_START } from '../data/scenes.js'

// scores = { [chapterId]: { [metricKey]: points } } — one bucket per chapter,
// initialised to 0 for each metric that chapter tracks.
const zeroScores = () =>
  Object.fromEntries(
    CHAPTERS.map((c) => [c.id, Object.fromEntries(c.metrics.map((m) => [m, 0]))]),
  )

export const initialState = {
  screen: 'title', // 'title' | 'hub' | 'scene' | 'chapterEnd' | 'ending'
  currentSceneId: null,
  activeChapter: null, // chapter id being played
  scores: zeroScores(),
  completedChapters: [], // chapter ids finished at least once
  pendingFeedback: null, // { verdict, note, action, effects } shown before advancing
  nextAfterFeedback: null, // scene id queued behind the feedback modal
  history: [], // visited scene ids within the current chapter
}

// Apply a choice's effects onto the active chapter's score bucket.
function applyEffects(scores, chapterId, effects) {
  if (!effects || !chapterId) return scores
  const bucket = { ...(scores[chapterId] || {}) }
  for (const [metric, delta] of Object.entries(effects)) {
    bucket[metric] = (bucket[metric] || 0) + delta
  }
  return { ...scores, [chapterId]: bucket }
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
      const scores = applyEffects(state.scores, state.activeChapter, choice.effects)
      // A choice with feedback pauses on the modal before advancing.
      if (choice.feedback) {
        return {
          ...state,
          scores,
          pendingFeedback: { ...choice.feedback, effects: choice.effects || null },
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

    // Info panels (intro / didYouKnow / tutorial / resources) advance via
    // their own `next` with no scoring.
    case 'ADVANCE': {
      const nextId = action.next
      if (!nextId) return state
      return {
        ...state,
        currentSceneId: nextId,
        history: [...state.history, nextId],
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
  CHAPTER_IDS.every((id) => state.completedChapters.includes(id))
