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
  screen: 'title', // 'title' | 'hub' | 'scene' | 'chapterEnd' | 'reflection' | 'ending'
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

// The choices a scene considers correct: explicitly flagged with `correct`,
// or — for ordinary single-answer scenes — the ones whose feedback is 'good'.
function bestChoices(scene) {
  const choices = scene?.choices || []
  const flagged = choices.filter((c) => c.correct)
  if (flagged.length) return flagged
  return choices.filter((c) => c.feedback?.verdict === 'good')
}

// After a wrong or partly-right answer, surface the better choice and why,
// so the player learns the right action before moving on to "Did You Know?".
function reveal(scene, picked) {
  const best = bestChoices(scene)
  if (!best.length) return null
  // Multi-answer scenes need the whole set; single-answer scenes only need the
  // one pick to be a good one (some scenarios have more than one right answer).
  const answered =
    scene?.select > 1
      ? best.every((c) => picked.includes(c)) && picked.every((c) => best.includes(c))
      : picked.every((c) => best.includes(c))
  if (answered) return null
  // Show the whole correct set, but tick what the player already had so a
  // half-right answer doesn't read as if they missed everything.
  const missed = best.filter((c) => !picked.includes(c))
  return {
    labels: best.map((c) => ({ text: c.label, got: picked.includes(c) })),
    note: missed.map((c) => c.feedback?.note).filter(Boolean).join('\n\n'),
  }
}

// Merge several choices into one feedback payload (multi-select scenes).
function combineFeedback(scene, picked) {
  const effects = {}
  for (const c of picked) {
    for (const [m, d] of Object.entries(c.effects || {})) effects[m] = (effects[m] || 0) + d
  }
  const best = bestChoices(scene)
  const rightCount = picked.filter((c) => best.includes(c)).length
  const verdict =
    rightCount === picked.length && rightCount === best.length
      ? 'good'
      : rightCount > 0
        ? 'mixed'
        : 'risky'
  return {
    verdict,
    parts: picked.map((c) => ({
      label: c.label,
      verdict: c.feedback?.verdict || 'risky',
      note: c.feedback?.note || '',
    })),
    effects,
    action: picked[0]?.feedback?.action || null,
    better: reveal(scene, picked),
  }
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
        const scene = SCENES[state.currentSceneId]
        return {
          ...state,
          scores,
          pendingFeedback: {
            ...choice.feedback,
            effects: choice.effects || null,
            better: reveal(scene, [choice]),
          },
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

    // Multi-answer scenes ("pick the two best actions") score every selected
    // choice and show their consequences together.
    case 'CHOOSE_MULTI': {
      const picked = action.choices || []
      if (!picked.length) return state
      const scene = SCENES[state.currentSceneId]
      const feedback = combineFeedback(scene, picked)
      return {
        ...state,
        scores: applyEffects(state.scores, state.activeChapter, feedback.effects),
        pendingFeedback: feedback,
        nextAfterFeedback: picked[0].next,
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

    // All four actions done: the self-check questions come before the results.
    case 'SHOW_REFLECTION':
      return { ...state, screen: 'reflection' }

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
