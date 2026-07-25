// The four chapters of SafeSteps — one per IMDA key online-safety action.
// (Replaces the old actions.js.) Each chapter declares:
//   - the metrics it scores (see metrics.js)
//   - an intro (the "action plan" + game theme shown before scenario 1)
//   - a themed end-of-chapter meter with tier bands
//
// The four key actions, in the order the game presents them:
//   (1) Set boundaries online   (2) Think before you act
//   (3) Report inappropriate content   (4) Engage & Support
// All four keep IMDA's official action names. Action 4, "Engage & Support",
// is written parent-facing by IMDA; here its scenarios are played from a
// youth's point of view (support a friend / seek help yourself).
//
// Keep the `id`s stable — scenes.js maps each scene to a chapter by id and
// CHAPTER_START (in scenes.js) points at each chapter's first scene.

export const CHAPTERS = [
  {
    id: 'boundaries',
    order: 1,
    officialTitle: 'Set Boundaries Online',
    chapterTitle: 'Taking Control',
    short: 'Use privacy tools, pick strong passwords, and balance your screen time.',
    emoji: '🛡️',
    color: '#a78bfa',
    metrics: ['privacy', 'safety', 'wellbeing'],
    meter: {
      name: 'Boundary Meter',
      emoji: '🔥',
      // Highest tier whose `min` <= your % wins.
      tiers: [
        {
          min: 0,
          name: 'Boundary Beginner',
          band: 'low',
          desc: 'You often let technology or others cross your personal boundaries.',
        },
        {
          min: 40,
          name: 'Boundary Builder',
          band: 'mid',
          desc: "You're making good decisions, but there are still areas to improve.",
        },
        {
          min: 70,
          name: 'Boundary Boss',
          band: 'high',
          desc: 'Great job! You actively protect your privacy, use safety tools wisely, and maintain healthy digital habits.',
        },
      ],
    },
  },
  {
    id: 'think',
    order: 2,
    officialTitle: 'Think Before You Act',
    chapterTitle: 'Your Digital Footprint',
    short: 'Be mindful of what you share, spot scams, and post with kindness.',
    emoji: '🧠',
    color: '#ffb02e',
    metrics: ['safety', 'citizenship'],
    meter: {
      name: 'Digital Footprint Score',
      emoji: '👣',
      tiers: [
        {
          min: 0,
          name: 'Footprint at Risk',
          band: 'low',
          desc: 'A few choices revealed too much or reacted in the heat of the moment. Everything you post follows you — pause first.',
        },
        {
          min: 40,
          name: 'Mindful Poster',
          band: 'mid',
          desc: 'You thought twice sometimes. Making the pause automatic keeps your footprint clean and your accounts safe.',
        },
        {
          min: 70,
          name: 'Digital Role Model',
          band: 'high',
          desc: 'You guarded your privacy, dodged the scams, and posted responsibly. Your footprint opens doors, not risks.',
        },
      ],
    },
  },
  {
    id: 'report',
    order: 3,
    officialTitle: 'Report Inappropriate Content',
    chapterTitle: 'Stop the Spread',
    short: 'Recognise harmful content and take action to report it.',
    emoji: '🚩',
    color: '#ff5470',
    metrics: ['awareness', 'responsibility'],
    meter: {
      name: 'Digital Citizenship Score',
      emoji: '🌐',
      tiers: [
        {
          min: 0,
          name: 'Needs Improvement',
          band: 'low',
          desc: 'Some of your choices unintentionally contributed to the spread of harmful content. Remember, every click, view, share, and report can make a difference.',
        },
        {
          min: 50,
          name: 'Developing Digital Citizen',
          band: 'mid',
          desc: "You're beginning to recognise harmful online content, but there are opportunities to make safer and more responsible decisions.",
        },
        {
          min: 70,
          name: 'Responsible Digital Citizen',
          band: 'mid',
          desc: 'You usually made responsible choices, but there were some situations where harmful content could still spread because of your actions or inaction.',
        },
        {
          min: 90,
          name: 'Digital Guardian',
          band: 'high',
          desc: 'Excellent! You consistently recognised harmful content, avoided contributing to its spread, and took responsible action to help create a safer online community.',
        },
      ],
    },
  },
  {
    id: 'support',
    order: 4,
    officialTitle: 'Engage & Support',
    chapterTitle: 'You Are Not Alone',
    short: 'Seek and offer support during difficult moments online.',
    emoji: '🤝',
    color: '#2ecc9b',
    metrics: ['support'],
    meter: {
      name: 'Support Score',
      emoji: '💚',
      tiers: [
        {
          min: 0,
          name: 'Standing By',
          band: 'low',
          desc: 'It was hard to reach out — for yourself or a friend. Remember: some worries are far too heavy to carry alone.',
        },
        {
          min: 40,
          name: 'Caring Ally',
          band: 'mid',
          desc: 'You offered support and reached for help. Keep leaning on trusted people when things get overwhelming.',
        },
        {
          min: 70,
          name: 'Lifeline',
          band: 'high',
          desc: 'You showed up — reaching out, reporting, and getting the right help involved. That is real strength.',
        },
      ],
    },
  },
]

// Convenience lookups -----------------------------------------------------
export const CHAPTER_BY_ID = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]))
export const CHAPTER_IDS = CHAPTERS.map((c) => c.id)

// Highest tier whose threshold the percentage reaches.
export function tierFor(chapter, pct) {
  const tiers = chapter.meter.tiers
  let chosen = tiers[0]
  for (const t of tiers) if (pct >= t.min) chosen = t
  return chosen
}
