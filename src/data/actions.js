// The four IMDA key online-safety actions, framed for a youth/student player.
// These are the "pillars" scored across the game and shown in the HUD, hub,
// and ending screen. Keep the `id`s stable — scenes.js references them in
// choice `effects` and each chapter maps to one pillar.
//
// Reference: IMDA / Digital for Life — healthy digital habits:
//   (1) Set boundaries online  (2) Think before you act
//   (3) Report inappropriate content  (4) Engage & support your child
// Action 4 is recast here as "Reach out & support" so it is playable from a
// teen's point of view (help a friend, involve a trusted adult).

export const ACTIONS = [
  {
    id: 'boundaries',
    officialTitle: 'Set boundaries online',
    chapterTitle: 'Late Night, Loud Chat',
    short: 'Manage your screen time, privacy, and what you share.',
    emoji: '🛡️',
    color: '#4f8cff',
    // How well the player did on this pillar, message shown on the ending screen.
    endingBlurbs: {
      high: 'You set clear limits — on your time, your data, and your privacy.',
      mid: 'You set some boundaries, but a few slipped. Small habits add up.',
      low: 'Boundaries kept getting blurry. Deciding your limits in advance makes them easier to keep.',
    },
  },
  {
    id: 'think',
    officialTitle: 'Think before you act',
    chapterTitle: 'The Screenshot',
    short: 'Pause before you post, forward, click, or reply.',
    emoji: '🧠',
    color: '#ffb02e',
    endingBlurbs: {
      high: 'You paused before acting — that pause is your best defence online.',
      mid: 'You thought twice sometimes. Making the pause automatic is the goal.',
      low: 'A few choices were made in the heat of the moment. Once it is sent, you cannot unsend it.',
    },
  },
  {
    id: 'report',
    officialTitle: 'Report inappropriate content',
    chapterTitle: 'Piling On',
    short: 'Block and report harmful content and behaviour.',
    emoji: '🚩',
    color: '#ff5470',
    endingBlurbs: {
      high: 'You spoke up and used report tools — that helps keep everyone safer.',
      mid: 'You reported some things. When in doubt, reporting is always a safe move.',
      low: 'Some harmful content went unreported. Reporting is anonymous and it is never "snitching".',
    },
  },
  {
    id: 'support',
    officialTitle: 'Reach out & support',
    chapterTitle: 'Are You Okay?',
    short: 'Support a friend, and know when to involve a trusted adult.',
    emoji: '🤝',
    color: '#2ecc9b',
    endingBlurbs: {
      high: 'You showed up for a friend and knew when to get an adult involved.',
      mid: 'You offered support. Remember: some worries are too big to carry alone.',
      low: 'A friend needed help and it was hard to act. Telling a trusted adult is strength, not betrayal.',
    },
  },
]

// Convenience lookups
export const ACTION_BY_ID = Object.fromEntries(ACTIONS.map((a) => [a.id, a]))
export const ACTION_IDS = ACTIONS.map((a) => a.id)

// Map an official action title (used in scene feedback) back to a pillar id.
export const ACTION_ID_BY_TITLE = Object.fromEntries(
  ACTIONS.map((a) => [a.officialTitle, a.id]),
)
