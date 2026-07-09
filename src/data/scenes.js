// The full branching narrative for SafeSteps.
//
// The game is a directed graph of scenes. Each chapter maps to one IMDA
// pillar (see actions.js) and is a self-contained branching story: an intro,
// a few decision points (safe path / risky path that recovers), and a
// terminus scene that carries an `ending` recap.
//
// Scene shape:
//   {
//     id, chapter, speaker, background, text,
//     choices: [                    // present on decision + "continue" scenes
//       {
//         label,                    // button text
//         next,                     // id of the next scene
//         effects?: { pillarId: +/-N },   // score deltas (optional)
//         feedback?: {              // teaching moment shown before continuing
//           verdict: 'good' | 'risky',
//           note,                   // why this choice was safe / risky
//           action,                 // official IMDA action title it maps to
//         },
//       },
//     ],
//     ending?: { title, text },     // present on terminus scenes (no choices)
//   }
//
// The intro scene of each chapter is registered in CHAPTER_START below.
// A scene is a "continue" beat when its single choice has no feedback.

export const CHARACTERS = {
  Mika: { name: 'Mika', color: '#a78bfa' }, // the player character
  Narrator: { name: '', color: '#9aa4b2' },
  Phone: { name: '📱', color: '#5eead4' },
  Jules: { name: 'Jules', color: '#f59e0b' }, // best friend
  Sam: { name: 'Sam', color: '#60a5fa' }, // classmate
  Coach: { name: 'Ms Tan', color: '#34d399' }, // trusted adult
}

const scenes = [
  // ============================================================
  // CHAPTER 1 — BOUNDARIES: "Late Night, Loud Chat"
  // ============================================================
  {
    id: 'b_start',
    chapter: 'boundaries',
    speaker: 'Narrator',
    background: 'bedroom_night',
    text: "It's 1:14 a.m. The class group chat is 212 messages deep and still buzzing. You have a test in the morning.",
    choices: [
      {
        label: 'Put the phone on charge across the room and sleep.',
        next: 'b_game',
        effects: { boundaries: 2 },
        feedback: {
          verdict: 'good',
          note: 'Deciding your limit in advance — and physically moving the phone away — is one of the simplest boundaries there is. Sleep beats FOMO.',
          action: 'Set boundaries online',
        },
      },
      {
        label: 'Just five more minutes. You can catch up.',
        next: 'b_groggy',
        effects: { boundaries: -1 },
        feedback: {
          verdict: 'risky',
          note: '"Five more minutes" rarely is. Endless chats are designed to keep you scrolling. A set cut-off time protects your sleep and your focus.',
          action: 'Set boundaries online',
        },
      },
    ],
  },
  {
    id: 'b_groggy',
    chapter: 'boundaries',
    speaker: 'Narrator',
    background: 'bedroom_night',
    text: 'Five minutes becomes ninety. You finally sleep at 2:40 a.m. and wake up foggy, thumbs already reaching for the phone.',
    choices: [{ label: 'Continue…', next: 'b_game' }],
  },
  {
    id: 'b_game',
    chapter: 'boundaries',
    speaker: 'Phone',
    background: 'app_signup',
    text: 'A trending game wants you to sign up. "To find friends nearby, share your real name and exact location."',
    choices: [
      {
        label: 'Use a nickname and skip the location permission.',
        next: 'b_privacy',
        effects: { boundaries: 2 },
        feedback: {
          verdict: 'good',
          note: 'Apps rarely need your real name or precise location to work. Sharing the minimum is a boundary that protects you from strangers and data misuse.',
          action: 'Set boundaries online',
        },
      },
      {
        label: 'Enter your real name and allow exact location.',
        next: 'b_privacy',
        effects: { boundaries: -2 },
        feedback: {
          verdict: 'risky',
          note: 'Your real name plus live location can let strangers identify and find you. Once shared, you cannot control where that data goes.',
          action: 'Set boundaries online',
        },
      },
    ],
  },
  {
    id: 'b_privacy',
    chapter: 'boundaries',
    speaker: 'Phone',
    background: 'app_signup',
    text: 'Setup done. By default your profile — and everything you post — is set to Public. Anyone can see it.',
    choices: [
      {
        label: 'Switch the account to Friends-only.',
        next: 'b_end',
        effects: { boundaries: 2 },
        feedback: {
          verdict: 'good',
          note: 'Checking privacy settings the moment you join takes seconds and decides who can see your life. Friends-only is a strong default.',
          action: 'Set boundaries online',
        },
      },
      {
        label: 'Leave it public — more followers, right?',
        next: 'b_end',
        effects: { boundaries: -1 },
        feedback: {
          verdict: 'risky',
          note: 'A public account means anyone — including people you would never let in — can see your posts, photos, and routines. Reach is not worth losing control of who is watching.',
          action: 'Set boundaries online',
        },
      },
    ],
  },
  {
    id: 'b_end',
    chapter: 'boundaries',
    speaker: 'Mika',
    background: 'bedroom_day',
    text: 'Phone on the desk, settings sorted. The chat can wait.',
    ending: {
      title: 'Chapter 1 complete — Set boundaries online',
      text: 'Boundaries are decisions you make once so you do not have to fight them every night: a cut-off time, the minimum you share, and who gets to see it.',
    },
  },

  // ============================================================
  // CHAPTER 2 — THINK: "The Screenshot"
  // ============================================================
  {
    id: 't_start',
    chapter: 'think',
    speaker: 'Jules',
    background: 'school_corridor',
    text: 'Jules sends you a screenshot: an embarrassing DM supposedly from Sam in your class. "😂 forward this to everyone."',
    choices: [
      {
        label: "Don't forward it. You don't even know if it's real.",
        next: 't_link',
        effects: { think: 2 },
        feedback: {
          verdict: 'good',
          note: 'Screenshots are easy to fake and easy to take out of context. Pausing to ask "is this true, and who could it hurt?" is exactly the habit that keeps you and others safe.',
          action: 'Think before you act',
        },
      },
      {
        label: 'Forward it to the group. Everyone will laugh.',
        next: 't_regret',
        effects: { think: -2, support: -1 },
        feedback: {
          verdict: 'risky',
          note: 'Forwarding spreads possible lies and can become bullying in seconds. Once it is sent you cannot unsend it — and you may be the one who spread it.',
          action: 'Think before you act',
        },
      },
    ],
  },
  {
    id: 't_regret',
    chapter: 'think',
    speaker: 'Narrator',
    background: 'school_corridor',
    text: 'Within minutes it is everywhere. By lunch, Sam has gone quiet and left the group chat. The screenshot, it turns out, was edited.',
    choices: [{ label: 'Continue…', next: 't_link' }],
  },
  {
    id: 't_link',
    chapter: 'think',
    speaker: 'Phone',
    background: 'phone_dm',
    text: 'A DM from an unknown account: "FREE game skins!! Claim in 10 min 👉 skinz-drop.link. Just log in with your game password."',
    choices: [
      {
        label: 'Ignore and delete it. Real prizes never ask for your password.',
        next: 't_post',
        effects: { think: 2 },
        feedback: {
          verdict: 'good',
          note: 'Urgency ("10 min!") plus a login request is a classic phishing combo. No legitimate service asks for your password through a random link.',
          action: 'Think before you act',
        },
      },
      {
        label: 'Tap the link and log in — free skins!',
        next: 't_phished',
        effects: { think: -2 },
        feedback: {
          verdict: 'risky',
          note: 'That page harvests your password. Scammers manufacture urgency so you act before you think. Slow down and the trick falls apart.',
          action: 'Think before you act',
        },
      },
    ],
  },
  {
    id: 't_phished',
    chapter: 'think',
    speaker: 'Narrator',
    background: 'phone_dm',
    text: 'The page glitches. Minutes later, your account is logging in from another country and messaging your friends the same link.',
    choices: [{ label: 'Continue…', next: 't_post' }],
  },
  {
    id: 't_post',
    chapter: 'think',
    speaker: 'Mika',
    background: 'bedroom_day',
    text: 'You are about to post an angry reply to a comment that annoyed you. Your thumb hovers over "Send".',
    choices: [
      {
        label: 'Wait. Re-read it. Would you say this to their face?',
        next: 't_end',
        effects: { think: 2 },
        feedback: {
          verdict: 'good',
          note: 'The pause before "Send" is your superpower. A post made in anger can follow you for years; a breath costs you nothing.',
          action: 'Think before you act',
        },
      },
      {
        label: 'Send it while you are fired up.',
        next: 't_end',
        effects: { think: -1 },
        feedback: {
          verdict: 'risky',
          note: 'Heat-of-the-moment posts are the ones people screenshot. What feels satisfying now can be permanent and public.',
          action: 'Think before you act',
        },
      },
    ],
  },
  {
    id: 't_end',
    chapter: 'think',
    speaker: 'Mika',
    background: 'bedroom_day',
    text: 'You lock the phone and breathe. The internet can wait for a calmer you.',
    ending: {
      title: 'Chapter 2 complete — Think before you act',
      text: 'Before you post, forward, click, or reply, ask three quick questions: Is it true? Could it hurt someone? Would I be okay if this were permanent?',
    },
  },

  // ============================================================
  // CHAPTER 3 — REPORT: "Piling On"
  // ============================================================
  {
    id: 'r_start',
    chapter: 'report',
    speaker: 'Narrator',
    background: 'phone_feed',
    text: "On a class post, comments are piling onto Sam: name-calling, a cruel nickname, laughing emojis. It's getting worse by the minute.",
    choices: [
      {
        label: "Report the harmful comments and don't join in.",
        next: 'r_stranger',
        effects: { report: 2, support: 1 },
        feedback: {
          verdict: 'good',
          note: 'Reporting flags harmful content to the platform so it can be removed. It is usually anonymous — reporting is not "snitching", it is refusing to let bullying stand.',
          action: 'Report inappropriate content',
        },
      },
      {
        label: 'Scroll past. Not your problem.',
        next: 'r_worse',
        effects: { report: -1 },
        feedback: {
          verdict: 'risky',
          note: 'Silence lets pile-ons grow. You do not have to fight anyone — reporting takes two taps and helps stop the harm.',
          action: 'Report inappropriate content',
        },
      },
      {
        label: 'Add a "😂" so you fit in.',
        next: 'r_worse',
        effects: { report: -2, support: -2 },
        feedback: {
          verdict: 'risky',
          note: 'Even a laughing emoji is a pile-on. Every reaction tells the target more people are against them — and tells the platform this is acceptable.',
          action: 'Report inappropriate content',
        },
      },
    ],
  },
  {
    id: 'r_worse',
    chapter: 'report',
    speaker: 'Narrator',
    background: 'phone_feed',
    text: 'The thread keeps growing. Nobody has reported it, so nothing gets taken down.',
    choices: [{ label: 'Continue…', next: 'r_stranger' }],
  },
  {
    id: 'r_stranger',
    chapter: 'report',
    speaker: 'Phone',
    background: 'phone_dm',
    text: 'A stranger DMs you: an inappropriate photo and "send me one back, don\'t tell anyone 🤫".',
    choices: [
      {
        label: 'Block the account and report it. Do not reply.',
        next: 'r_evidence',
        effects: { report: 2, support: 1 },
        feedback: {
          verdict: 'good',
          note: 'Blocking cuts off contact; reporting alerts the platform (and, for content like this, can trigger real safeguards). "Don\'t tell anyone" is exactly the part you should not obey.',
          action: 'Report inappropriate content',
        },
      },
      {
        label: 'Reply and ask them to stop.',
        next: 'r_evidence',
        effects: { report: -1 },
        feedback: {
          verdict: 'risky',
          note: 'Engaging tells them the account is active and can invite more. The safe move is no reply, then block and report.',
          action: 'Report inappropriate content',
        },
      },
    ],
  },
  {
    id: 'r_evidence',
    chapter: 'report',
    speaker: 'Mika',
    background: 'phone_dm',
    text: 'Before blocking, you take a screenshot as evidence — then report.',
    choices: [
      {
        label: 'Keep the screenshot in case an adult needs to see it.',
        next: 'r_end',
        effects: { report: 1, support: 1 },
        feedback: {
          verdict: 'good',
          note: 'Saving evidence before you block means the report can be followed up. You are building a record, not spreading the content.',
          action: 'Report inappropriate content',
        },
      },
      {
        label: 'Just delete everything and move on.',
        next: 'r_end',
        effects: { report: 0 },
        feedback: {
          verdict: 'risky',
          note: 'Understandable — but without evidence it is harder for a trusted adult or the platform to act. A single screenshot can make the difference.',
          action: 'Report inappropriate content',
        },
      },
    ],
  },
  {
    id: 'r_end',
    chapter: 'report',
    speaker: 'Mika',
    background: 'bedroom_day',
    text: 'Blocked, reported, evidence saved. The account is gone from your feed.',
    ending: {
      title: 'Chapter 3 complete — Report inappropriate content',
      text: 'You do not have to confront anyone to make things safer. Block, report, and keep evidence — reporting is anonymous, and it is never snitching.',
    },
  },

  // ============================================================
  // CHAPTER 4 — SUPPORT: "Are You Okay?"
  // ============================================================
  {
    id: 's_start',
    chapter: 'support',
    speaker: 'Narrator',
    background: 'phone_feed',
    text: 'Jules has been posting dark, worrying things late at night: "what\'s even the point" and "nobody would notice if I disappeared".',
    choices: [
      {
        label: 'Message Jules privately: "Saw your posts. Are you okay? I\'m here."',
        next: 's_listen',
        effects: { support: 2 },
        feedback: {
          verdict: 'good',
          note: 'Reaching out privately and without judgement tells a struggling friend they are not alone. You do not need the perfect words — showing up is what matters.',
          action: 'Reach out & support',
        },
      },
      {
        label: 'Comment "haha dramatic 💀" so it seems light.',
        next: 's_awkward',
        effects: { support: -2 },
        feedback: {
          verdict: 'risky',
          note: 'Making a joke of it can make someone feel more alone and unseen. Take posts like these seriously, even if you feel unsure.',
          action: 'Reach out & support',
        },
      },
      {
        label: 'Do nothing. Maybe they just want attention.',
        next: 's_awkward',
        effects: { support: -1 },
        feedback: {
          verdict: 'risky',
          note: '"Attention-seeking" is often "help-seeking". Ignoring it is a risk no friend should take alone — a short message costs little and can mean a lot.',
          action: 'Reach out & support',
        },
      },
    ],
  },
  {
    id: 's_awkward',
    chapter: 'support',
    speaker: 'Narrator',
    background: 'phone_feed',
    text: 'The posts keep coming and get bleaker. You feel a knot in your stomach — this is bigger than a joke.',
    choices: [{ label: 'Continue…', next: 's_listen' }],
  },
  {
    id: 's_listen',
    chapter: 'support',
    speaker: 'Jules',
    background: 'phone_dm',
    text: 'Jules replies: "honestly? not okay. but don\'t tell anyone. promise you won\'t."',
    choices: [
      {
        label: 'Keep listening — but don\'t promise total secrecy.',
        next: 's_adult',
        effects: { support: 2 },
        feedback: {
          verdict: 'good',
          note: 'You can be a caring listener without promising to hide something dangerous. Be honest: "I care too much to keep this to myself."',
          action: 'Reach out & support',
        },
      },
      {
        label: 'Promise to keep it a total secret, no matter what.',
        next: 's_adult',
        effects: { support: -2 },
        feedback: {
          verdict: 'risky',
          note: 'Some worries are too heavy for a friend to carry alone. A promise of total secrecy can trap you both. It is okay — and kind — to involve someone who can help.',
          action: 'Reach out & support',
        },
      },
    ],
  },
  {
    id: 's_adult',
    chapter: 'support',
    speaker: 'Narrator',
    background: 'school_corridor',
    text: 'Jules is safe for tonight, but clearly struggling. Ms Tan, your form teacher, is someone you both trust.',
    choices: [
      {
        label: 'Tell Ms Tan what\'s happening so Jules can get real help.',
        next: 's_end',
        effects: { support: 2, report: 1 },
        feedback: {
          verdict: 'good',
          note: 'Telling a trusted adult is not betrayal — it is getting your friend support you are not trained to give. This is the bravest and kindest choice.',
          action: 'Reach out & support',
        },
      },
      {
        label: 'Handle it alone. You can be there for Jules yourself.',
        next: 's_end',
        effects: { support: -1 },
        feedback: {
          verdict: 'risky',
          note: 'Your care matters, but you should not carry this alone. A trusted adult can connect Jules with proper help — and support you too.',
          action: 'Reach out & support',
        },
      },
    ],
  },
  {
    id: 's_end',
    chapter: 'support',
    speaker: 'Mika',
    background: 'school_corridor',
    text: 'Ms Tan takes it seriously and checks in with Jules. It feels less heavy, shared.',
    ending: {
      title: 'Chapter 4 complete — Reach out & support',
      text: 'Showing up for a friend online can start with one message. And when a worry is too big, telling a trusted adult is strength — you were never meant to carry it alone.',
    },
  },
]

// Index by id for O(1) lookups by the engine.
export const SCENES = Object.fromEntries(scenes.map((s) => [s.id, s]))

// The intro scene for each chapter (pillar id -> scene id).
export const CHAPTER_START = {
  boundaries: 'b_start',
  think: 't_start',
  report: 'r_start',
  support: 's_start',
}

export default scenes
