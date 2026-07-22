// The full branching narrative for SafeSteps.
//
// The game is a directed graph of scenes. Each chapter (see chapters.js) maps
// to one IMDA action and runs a few scenarios. A scenario is one decision
// scene: several options, each with an `effects` score change and a `feedback`
// consequence shown in a modal. All options of a scenario reconverge onto the
// same next scene, which is usually a "Did You Know?" info panel or a short
// "how to report" tutorial before the next scenario.
//
// Scene shapes:
//   Decision   { id, chapter, speaker, background, text, bonus?,
//                choices: [ { label, next, effects:{metric:+/-N},
//                             feedback:{ verdict:'good'|'mixed'|'risky', note,
//                                        action } } ] }
//   Info       { id, chapter, background, panel:{ kind, ... }, next }
//                kinds: 'intro' | 'didYouKnow' | 'tutorial' | 'resources'
//   Terminus   { id, chapter, speaker, background, text, ending:{ title, text } }
//
// CHAPTER_START (bottom) registers each chapter's first scene.

export const CHARACTERS = {
  Mika: { name: 'Mika', color: '#a78bfa' }, // the player character ("you")
  Narrator: { name: '', color: '#9aa4b2' },
  Phone: { name: '📱', color: '#5eead4' },
  Jules: { name: 'Jules', color: '#f59e0b' }, // best friend
  Seller: { name: 'Seller', color: '#60a5fa' },
  Reward: { name: '🎉 "H&M Rewards"', color: '#ff5470' },
}

const scenes = [
  // ============================================================
  // CHAPTER 1 — SET BOUNDARIES ONLINE: "Taking Control"
  // ============================================================
  {
    id: 'b_intro',
    chapter: 'boundaries',
    background: 'bedroom_night',
    panel: {
      kind: 'intro',
      eyebrow: 'Action 1 · Set Boundaries Online',
      title: 'Can you survive without your online life taking control of you?',
      body: [
        'Use privacy and safety tools well, and manage your screen time responsibly.',
        "Throughout this chapter you'll make choices just like you would in real life. Every decision affects your Privacy, Safety or Wellbeing. At the end, we'll reveal how strong your Boundary Meter is.",
      ],
    },
    next: 'b_s1',
  },
  {
    id: 'b_s1',
    chapter: 'boundaries',
    speaker: 'Phone',
    background: 'app_signup',
    text: "Your first social media account! Instagram asks: do you want your account to be Public or Private? Public could grow your following fast — but anyone can see your posts.",
    choices: [
      {
        label: '🌍 Set your account to Public',
        next: 'b_s1_dyk',
        effects: { privacy: -10, wellbeing: -10, safety: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Your followers grow fast — but so do the problems. Strangers start messaging you, some asking personal questions, others dropping suspicious links. Comments turn cruel: "You\'re so ugly," "Delete your account." A public account lets anyone view your profile, message you, and even piece together your info to stalk you.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: '🔒 Set your account to Private',
        next: 'b_s1_dyk',
        effects: { privacy: 10, wellbeing: 10, safety: 10 },
        feedback: {
          verdict: 'good',
          note: 'Your friends follow and you approve them happily. When a stranger you don\'t recognise requests to follow, you simply decline — they can\'t see a thing. A private account gives you control over who views your content, and cuts off unwanted access from strangers.',
          action: 'Set Boundaries Online',
        },
      },
    ],
  },
  {
    id: 'b_s1_dyk',
    chapter: 'boundaries',
    background: 'app_signup',
    panel: {
      kind: 'didYouKnow',
      title: 'Cyberstalking is more common than you think',
      stat: 'Around 80% of stalking victims experienced cyberstalking — and 69% of them suffered substantial emotional distress.',
      body: ['Cyberstalkers are often strangers who may:'],
      bullets: [
        '📍 Monitor your profile, posts, photos and location to track your daily life.',
        '👤 Create fake accounts to follow or contact you.',
        '📢 Share your personal information without consent (doxxing).',
        '🚶 Escalate from online stalking into real-life stalking.',
      ],
      footer:
        '💙 That is why keeping your account private — and only letting trusted people follow you — reduces the risk of a stalker tracking or harming you.',
      source: {
        label: 'Cyberstalking statistics — SafeHome.org',
        url: 'https://www.safehome.org/data/cyberstalking-statistics/',
      },
    },
    next: 'b_s2',
  },
  {
    id: 'b_s2',
    chapter: 'boundaries',
    speaker: 'Phone',
    background: 'app_signup',
    text: 'Time to create a password for your new account. Which do you choose?',
    choices: [
      {
        label: 'Password123',
        next: 'b_2fa',
        effects: { safety: -10 },
        feedback: {
          verdict: 'risky',
          note: 'A week later you can\'t log in. A hacker\'s automated tool guessed your easy password in seconds, changed your profile picture, posted inappropriate videos and messaged people pretending to be you.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: 'Nancy2005',
        next: 'b_2fa',
        effects: { safety: -5 },
        feedback: {
          verdict: 'mixed',
          note: 'Safe for now — but your password contains your name and birth year. Anyone who knows you, or finds those details on your socials, could guess it. Your account is still at risk.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: 'N7!pQ#29Lm@',
        next: 'b_2fa',
        effects: { safety: 10 },
        feedback: {
          verdict: 'good',
          note: 'Weeks later a hacker\'s program tries thousands of common passwords against your account. Your long, unique password makes it far too hard to crack — the attack fails and your account stays secure.',
          action: 'Set Boundaries Online',
        },
      },
    ],
  },
  {
    id: 'b_2fa',
    chapter: 'boundaries',
    bonus: true,
    speaker: 'Phone',
    background: 'app_signup',
    text: 'Bonus: A pop-up appears — "Would you like to enable Two-Factor Authentication (2FA)?"',
    choices: [
      {
        label: '✅ Yes, enable 2FA',
        next: 'b_s2_dyk',
        effects: { safety: 10 },
        feedback: {
          verdict: 'good',
          note: 'Later a hacker gets hold of your password and tries to log in. A verification code is sent to your phone — and since they don\'t have it, the login is blocked. Your account stays secure.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: '✖ No, it seems unnecessary',
        next: 'b_s2_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'risky',
          note: 'A few days later a hacker gets your password. With no second verification step, they walk straight in and take control of your account immediately.',
          action: 'Set Boundaries Online',
        },
      },
    ],
  },
  {
    id: 'b_s2_dyk',
    chapter: 'boundaries',
    background: 'app_signup',
    panel: {
      kind: 'didYouKnow',
      title: 'Account hacking is rising fast',
      stat: 'In 2025 about 429 million social media accounts had already been hacked — 34% more than the year before.',
      body: ['Once hackers gain access to an account:'],
      bullets: [
        '🔒 70% of victims are locked out of their own accounts.',
        '👤 71% have their account used to impersonate them.',
        '🔗 73% get hacked across multiple platforms — especially when they reuse the same password.',
      ],
      footer:
        '🛡️ Protect your account before it\'s too late: use a strong, unique password for every account and turn on two-factor authentication.',
      source: {
        label: 'Social media hacking statistics — StationX',
        url: 'https://www.stationx.net/social-media-hacking-statistics/',
      },
    },
    next: 'b_s3',
  },
  {
    id: 'b_s3',
    chapter: 'boundaries',
    speaker: 'Narrator',
    background: 'bedroom_day',
    text:
      "Classes end at 2 PM. A group assignment is due next week and exams are coming. Tonight there's also family dinner, a 5-hour TikTok livestream, a new 2-hour show, an online gaming invite, and soccer with friends. How do you spend your day?",
    choices: [
      {
        label: '⭐ Study 3h · group discussion 2h · family dinner 1h · soccer 2h · TikTok 1h. No gaming, no show.',
        next: 'b_s3_dyk',
        effects: { wellbeing: 30 },
        feedback: {
          verdict: 'good',
          note: 'Excellent balance! You put your studies first while still making time for family, exercise and a little entertainment. Screen time in moderation — a healthy balance between your online and offline life without missing what matters most.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: '📚 Study 2h · discussion 2h · show 2h · TikTok 2h · dinner 30m. No gaming, no soccer.',
        next: 'b_s3_dyk',
        effects: { wellbeing: 20 },
        feedback: {
          verdict: 'mixed',
          note: 'Better balance. You handled your studies and enjoyed some entertainment without letting it take over. You missed out on exercise and more time with family and friends, but you kept things fairly healthy overall.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: '🎮 Study 1h · discussion 1h · show 2h · TikTok 3h · gaming 3h · dinner 30m. No soccer.',
        next: 'b_s3_dyk',
        effects: { wellbeing: -20 },
        feedback: {
          verdict: 'risky',
          note: 'Poor balance. A big chunk of your day went to entertainment, leaving little for studies, your group and family — and no exercise at all. Excessive recreational screen time crowded out the things that keep you well.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: '📱 Study 30m · discussion 30m · TikTok 5h · gaming 5h · show 2h. Skip dinner, no exercise.',
        next: 'b_s3_dyk',
        effects: { wellbeing: -30 },
        feedback: {
          verdict: 'risky',
          note: 'Terrible balance. Almost the entire day went to screens. You neglected your studies and group, skipped family dinner, and missed physical activity entirely. Over time this kind of imbalance takes a real toll on your wellbeing.',
          action: 'Set Boundaries Online',
        },
      },
    ],
  },
  {
    id: 'b_s3_dyk',
    chapter: 'boundaries',
    background: 'bedroom_day',
    panel: {
      kind: 'didYouKnow',
      title: 'Screen time and your wellbeing',
      stat: 'People who spend over 5 hours a day on devices are 70% more likely to experience suicidal thoughts than those who spend under 1 hour.',
      body: [
        'Managing screen time isn\'t about avoiding technology — it\'s about making intentional choices so digital life doesn\'t replace sleep, movement and real connection.',
      ],
      bullets: [
        '😴 Too much screen time hurts sleep, which is linked to low mood and trouble focusing. Put devices away before bed.',
        '📚 Excessive screen time shrinks attention span and creativity. Balance it with hobbies and physical activity.',
        '👀 Long screen sessions cause eye strain and headaches. Follow the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.',
      ],
      source: {
        label: 'The hazards of excessive screen time — PMC',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10852174/',
      },
    },
    next: 'b_end',
  },
  {
    id: 'b_end',
    chapter: 'boundaries',
    speaker: 'Mika',
    background: 'bedroom_day',
    text: 'Account locked down, password strong, screen time in check. The chat can wait.',
    ending: {
      title: 'Chapter complete — Set Boundaries Online',
      text: 'Boundaries are decisions you make once so you don\'t have to fight them every night: who can see you, how you protect your account, and how you spend your time.',
    },
  },

  // ============================================================
  // CHAPTER 2 — THINK BEFORE YOU ACT: "Your Digital Footprint"
  // ============================================================
  {
    id: 't_intro',
    chapter: 'think',
    background: 'phone_feed',
    panel: {
      kind: 'intro',
      eyebrow: 'Action 2 · Think Before You Act',
      title: 'Every post leaves a footprint.',
      body: [
        'Be mindful of your digital footprint, and approach online content with kindness and critical thinking.',
        'Your choices here affect your Safety and your Digital Citizenship. Pause before you share, click, or post — once it\'s out there, you can\'t take it back.',
      ],
    },
    next: 't_s1',
  },
  {
    id: 't_s1',
    chapter: 'think',
    speaker: 'Mika',
    background: 'phone_feed',
    text:
      "You're about to post a selfie at the cafe you visit every day after school. The photo shows your live location and your school uniform logo. What do you do?",
    choices: [
      {
        label: 'Post it as-is with live location on — it\'s not really personal info.',
        next: 't_s1_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'risky',
          note: 'It feels harmless — no home address, no phone number. But your school logo and live location are valuable clues. Someone with bad intentions could work out where you study, find you right now, or wait near your school to follow you home. Small details add up.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Turn off live location and blur the school logo before posting.',
        next: 't_s1_dyk',
        effects: { safety: 10 },
        feedback: {
          verdict: 'good',
          note: 'Great choice! You still share your moment, but reveal far less. Limiting personal details makes it much harder for a stranger to identify you, track your routine, or find you in real life.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Blur the school logo, but leave live location on.',
        next: 't_s1_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'mixed',
          note: 'You hid one clue, but your live location still shows exactly where you are right now — making it easy for a stranger to locate you in real time.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Blur the logo and add the location tag only after you leave.',
        next: 't_s1_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'mixed',
          note: 'Tagging after you leave beats sharing live location — but since you visit this cafe every day, someone could still use the tag to find or approach you there.',
          action: 'Think Before You Act',
        },
      },
    ],
  },
  {
    id: 't_s1_dyk',
    chapter: 'think',
    background: 'phone_feed',
    panel: {
      kind: 'didYouKnow',
      title: '"Penny\'s" story: when a follower became a stalker',
      body: [
        'Penny (not her real name) regularly shared her daily life on a public account, tagging her locations. An obsessive follower used those posts to learn her routine — and eventually her home address.',
        'What began as cyberstalking escalated into a real-world attack outside her home. It shows how seemingly harmless posts can reveal too much.',
      ],
      footer:
        '🧠 Before you post, ask: Does this reveal my location, school or routine? Do I really need to tag this? Could someone misuse it? Not every moment needs to be shared.',
      source: {
        label: 'When a follower became a stalker — The Cyber Helpline',
        url: 'https://www.thecyberhelpline.com/helpline-blog/2024/4/4/the-dangers-of-an-obsessive-social-media-follower-a-survivors-story',
      },
    },
    next: 't_s2',
  },
  {
    id: 't_s2',
    chapter: 'think',
    speaker: 'Seller',
    background: 'phone_dm',
    text:
      'On TikTok Shop you find the latest AirPods for S$100 below retail, with glowing reviews, so you order. The seller messages: "For an extra S$20 off, let\'s pay through Telegram or WhatsApp instead — it helps us avoid platform fees." What do you do?',
    choices: [
      {
        label: 'Continue on Telegram/WhatsApp — the seller has tons of 5-star reviews.',
        next: 't_s2_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Reviews can be fake or bought. The moment you move the payment off TikTok Shop, you lose buyer protection — no way to request a refund or report the seller through the platform if things go wrong.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Keep all communication and payment inside TikTok Shop.',
        next: 't_s2_dyk',
        effects: { safety: 10 },
        feedback: {
          verdict: 'good',
          note: 'Great choice! Staying on-platform keeps you covered by buyer protection. If the item never arrives or the seller acts shady, you can report them and request a refund.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Ask why they want to move off-platform, then continue if it sounds reasonable.',
        next: 't_s2_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'mixed',
          note: 'Scammers always have a convincing reason — "avoiding fees", "bigger discount". However genuine it sounds, moving off TikTok Shop still strips away your buyer protection.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Move off-platform, but only pay after they send a photo of the AirPods.',
        next: 't_s2_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'mixed',
          note: 'A photo proves nothing — scammers reuse stolen images. Off-platform, you still lose the ability to get a refund or report the seller.',
          action: 'Think Before You Act',
        },
      },
    ],
  },
  {
    id: 't_s2_dyk',
    chapter: 'think',
    background: 'phone_dm',
    panel: {
      kind: 'didYouKnow',
      title: 'E-commerce scams in Singapore',
      stat: 'In 2024 the Singapore Police received at least 179 reports of this scam, with victims losing at least S$399,000.',
      body: [
        'Some scammers trick victims into paying more than once — claiming a parcel is "held at customs" and demanding extra fees. Victims often realise only when the item never arrives and the seller vanishes.',
      ],
      footer:
        '🛡️ Think Before You Act: if a seller asks you to move the conversation or payment off-platform, treat it as a red flag. Keep everything within the official platform to stay protected.',
      source: {
        label: 'Police advisory on e-commerce scams — SPF',
        url: 'https://www.police.gov.sg/media-hub/police-news',
      },
    },
    next: 't_s3',
  },
  {
    id: 't_s3',
    chapter: 'think',
    speaker: 'Narrator',
    background: 'phone_feed',
    text:
      'A viral clip shows a man making misogynistic, body-shaming remarks. The comments are a war zone — some exposing him, others hurling insults. You disagree with him and want people to know it\'s wrong. What do you do?',
    choices: [
      {
        label: 'Post your own video insulting and attacking him to show how terrible he is.',
        next: 't_s3_dyk',
        effects: { citizenship: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Your cause is right, but insulting him publicly just adds to the hostility — and becomes part of your own digital footprint. It can also spur others to pile on instead of having a real conversation about why his behaviour is harmful.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Post a respectful commentary explaining why his actions are wrong — no abuse.',
        next: 't_s3_dyk',
        effects: { citizenship: 10 },
        feedback: {
          verdict: 'good',
          note: 'Great choice! You raised awareness while staying respectful. Focusing on the behaviour, not attacking the person, invites real discussion — and leaves a positive footprint that protects your own reputation.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Join the comments making fun of his appearance to teach him a lesson.',
        next: 't_s3_dyk',
        effects: { citizenship: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Answering body-shaming with more body-shaming solves nothing — it fuels the same harmful behaviour and can damage your own reputation.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'Send it to your group chat so everyone can mock the creator privately.',
        next: 't_s3_dyk',
        effects: { citizenship: -10 },
        feedback: {
          verdict: 'mixed',
          note: 'Even in a private chat, sharing spreads the content and encourages a culture of ridicule. Screenshots leak — your messages can travel far beyond the group and follow you.',
          action: 'Think Before You Act',
        },
      },
    ],
  },
  {
    id: 't_s3_dyk',
    chapter: 'think',
    background: 'phone_feed',
    panel: {
      kind: 'didYouKnow',
      title: 'Your digital footprint can open — or close — doors',
      body: [
        'Your posts, comments and replies all become part of your digital footprint. Employers, schools and universities may look at your social media when evaluating you.',
        'A student named Naomi excitedly announced a NASA internship on Twitter/X — but her post included profanity, and when advised to be mindful she replied with more offensive remarks. The exchange went viral and her internship offer was withdrawn.',
      ],
      footer:
        '🧠 Before you post, ask: Would I be okay if a future employer or teacher saw this? Does it reflect who I want to be? Am I contributing respectfully? Make every post count.',
      source: {
        label: 'What employers see when they Google you — CNA',
        url: 'https://www.channelnewsasia.com/today/adulting/social-media-history-jobseeker-employer-assessment-prospect-6016426',
      },
    },
    next: 't_end',
  },
  {
    id: 't_end',
    chapter: 'think',
    speaker: 'Mika',
    background: 'bedroom_day',
    text: 'You lock the phone and breathe. The internet can wait for a calmer, wiser you.',
    ending: {
      title: 'Chapter complete — Think Before You Act',
      text: 'Before you post, share, or click, pause on three questions: Is it true? Could it hurt someone? Would I be okay if this were permanent?',
    },
  },

  // ============================================================
  // CHAPTER 3 — REPORT INAPPROPRIATE CONTENT: "Stop the Spread"
  // ============================================================
  {
    id: 'r_intro',
    chapter: 'report',
    background: 'phone_feed',
    panel: {
      kind: 'intro',
      eyebrow: 'Action 3 · Report Inappropriate Content',
      title: 'Can you stop the spread?',
      body: [
        'Harmful content spreads every day — but your choices can make a difference. Will you help it spread, or stop it?',
        'Each decision affects your 🧠 Awareness and 🌐 Responsibility. Together they form your Digital Citizenship Score — how well you recognise harmful content and act to create a safer community.',
      ],
    },
    next: 'r_s1',
  },
  {
    id: 'r_s1',
    chapter: 'report',
    speaker: 'Narrator',
    background: 'phone_feed',
    text:
      'An influencer jokes about shoplifting from convenience stores, showing stolen snacks: "Big companies won\'t miss a few dollars. Try it if you\'re broke 😂." It has 100,000+ likes and comments like "Legend!" and "I\'m gonna try this." You won\'t copy it — but what do you do?',
    choices: [
      {
        label: 'Ignore it — you won\'t copy it anyway.',
        next: 'r_s1_bonus',
        effects: { awareness: 5, responsibility: -5 },
        feedback: {
          verdict: 'mixed',
          note: 'Many people think this is enough, but ignoring it leaves the video online to keep reaching others. Younger viewers especially may start seeing shoplifting as funny or harmless. Reporting is a far more effective way to stop the spread.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Comment "Don\'t do this."',
        next: 'r_s1_bonus',
        effects: { awareness: 5, responsibility: -5 },
        feedback: {
          verdict: 'mixed',
          note: 'Your intention is good, but any comment boosts engagement and pushes the video to more feeds. Reporting it — rather than interacting — is the better move.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Report the video.',
        next: 'r_s1_bonus',
        effects: { awareness: 10, responsibility: 10 },
        feedback: {
          verdict: 'good',
          note: 'The most effective response. You recognised it promotes illegal behaviour and flagged it for review against Community Guidelines. The platform can remove it and restrict the account — and by not engaging, you avoid boosting its reach.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Share it privately with friends to warn them.',
        next: 'r_s1_bonus',
        effects: { awareness: 5, responsibility: -5 },
        feedback: {
          verdict: 'mixed',
          note: 'You mean well, but forwarding it keeps the video circulating and reaching more people. Better: tell your friends about it and encourage them to report it too — multiple reports help the platform act faster.',
          action: 'Report Inappropriate Content',
        },
      },
    ],
  },
  {
    id: 'r_s1_bonus',
    chapter: 'report',
    bonus: true,
    speaker: 'Narrator',
    background: 'phone_feed',
    text:
      'The creator is showing stolen items and encouraging others to shoplift. Should you also report this to the relevant authorities?',
    choices: [
      {
        label: 'Yes — it shows and encourages a criminal offence.',
        next: 'r_s1_tut',
        effects: { awareness: 5, responsibility: 5 },
        feedback: {
          verdict: 'good',
          note: 'Correct. Reporting to TikTok gets the content reviewed and removed — but because the video shows and encourages a crime, alerting the authorities helps prevent further offences and protects the public from real-world harm.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'No — reporting to TikTok is enough, the platform handles everything.',
        next: 'r_s1_tut',
        effects: { responsibility: -5 },
        feedback: {
          verdict: 'risky',
          note: 'TikTok can remove the video and restrict the account, but it can\'t investigate a crime. Since the video shows and encourages a criminal offence, reporting to both the platform and the authorities addresses the online content and the real-world harm.',
          action: 'Report Inappropriate Content',
        },
      },
    ],
  },
  {
    id: 'r_s1_tut',
    chapter: 'report',
    background: 'phone_feed',
    panel: {
      kind: 'tutorial',
      platform: 'TikTok',
      title: 'How to report a video on TikTok',
      steps: [
        'Tap the Share arrow (➡) on the right of the video.',
        'Scroll the menu and tap "Report".',
        'Choose the reason that fits — e.g. "Illegal activities and regulated goods".',
        'Follow the prompts and submit. Reports are anonymous.',
      ],
      footer: 'Reporting takes seconds and is completely anonymous — the creator never sees who reported them.',
    },
    next: 'r_s1_dyk',
  },
  {
    id: 'r_s1_dyk',
    chapter: 'report',
    background: 'phone_feed',
    panel: {
      kind: 'didYouKnow',
      title: 'Why reporting matters: Social Influence Theory',
      body: [
        'People change their attitudes and behaviour because of others (Davlembayeva & Papagiannidis). It happens three ways:',
      ],
      bullets: [
        '🫂 Compliance — changing behaviour to fit in.',
        '⭐ Identification — copying someone they admire, like an influencer.',
        '🧩 Internalisation — genuinely coming to believe the behaviour is okay.',
      ],
      footer:
        '🚨 That\'s why reporting harmful content matters. Removing videos that promote illegal behaviour reduces their exposure and limits their influence — helping build a safer online environment.',
      source: {
        label: 'Social Influence Theory — TheoryHub',
        url: 'https://open.ncl.ac.uk/theories/15/social-influence-theory/',
      },
    },
    next: 'r_s2',
  },
  {
    id: 'r_s2',
    chapter: 'report',
    speaker: 'Narrator',
    background: 'phone_feed',
    text:
      'A YouTube video titled "School Fight in Singapore Caught on Camera! 😱" shows one student punching another while a crowd records. It has 3 million+ views and comments like "Best fight this year!" You\'re curious. What do you do?',
    choices: [
      {
        label: 'Watch the whole thing — no like/comment/share — just to see what happened.',
        next: 'r_s2_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'risky',
          note: 'You didn\'t interact, but your view and watch time still count as engagement. YouTube reads that as "engaging content" and pushes it to more people. You also expose yourself to distress and slowly normalise real-life violence.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Skip it and keep scrolling.',
        next: 'r_s2_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'mixed',
          note: 'You avoid the content, but the video stays up and keeps reaching others because nobody reported it. As more people engage, the platform recommends it further, spreading violent content and normalising it.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Share it with friends — it\'s trending and everyone\'s talking.',
        next: 'r_s2_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Sharing is one of the fastest ways to spread violent content. As people reshare, it reaches a wider audience and risks turning violence into entertainment rather than something to recognise as harmful.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Report the video for promoting violence.',
        next: 'r_s2_tut',
        effects: { awareness: 10, responsibility: 10 },
        feedback: {
          verdict: 'good',
          note: 'Great choice! You protect yourself from harmful content and help the platform review it against Community Guidelines. Removing it reduces its reach and helps create a safer environment.',
          action: 'Report Inappropriate Content',
        },
      },
    ],
  },
  {
    id: 'r_s2_tut',
    chapter: 'report',
    background: 'phone_feed',
    panel: {
      kind: 'tutorial',
      platform: 'YouTube',
      title: 'How to report a video on YouTube',
      steps: [
        'Tap the three dots (⋮) below or beside the video.',
        'Tap "Report".',
        'Select the reason — e.g. "Violent or repulsive content".',
        'Add detail if asked, then submit. You can also report the whole channel from its About page.',
      ],
      footer: 'Reporting flags the video for human review — it does not tell the uploader who reported it.',
    },
    next: 'r_s2_dyk',
  },
  {
    id: 'r_s2_dyk',
    chapter: 'report',
    background: 'phone_feed',
    panel: {
      kind: 'didYouKnow',
      title: 'Violent content changes how we think',
      body: [
        'A 2023 study in The Lancet Regional Health – Americas found that exposure to violent content can reduce empathy and increase aggressive thoughts, anger and behaviour.',
        'The more time people spend watching violent content, the more likely they are to engage in bullying or cyberbullying.',
      ],
      footer:
        '🚩 Reporting violent content limits how far it spreads and how many people it reaches — helping prevent desensitisation and protecting younger, more vulnerable users.',
      source: {
        label: 'Screen violence & youth mental health — PMC',
        url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10025407/',
      },
    },
    next: 'r_s3',
  },
  {
    id: 'r_s3',
    chapter: 'report',
    speaker: 'Narrator',
    background: 'phone_feed',
    text:
      'An account, @SGGirlsTea09, posts rumours about girls and shares their photos without consent to humiliate them. The comments are cruel — "Everyone should unfollow her," "Share this so more people know" — and many are reposting it to their Stories. You don\'t know if it\'s true, but people are piling on. What do you do?',
    choices: [
      {
        label: 'Report the account for bullying and harassment.',
        next: 'r_s3_tut',
        effects: { awareness: 10, responsibility: 10 },
        feedback: {
          verdict: 'good',
          note: 'Your report lets Instagram delete the posts and suspend the account for violating Community Guidelines. That slows the spread of harmful rumours, prevents further humiliation, and protects the girls from ongoing emotional harm.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Share the account with friends, asking "Do you think these are true?"',
        next: 'r_s3_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Even just asking, sharing spreads unverified rumours to more people. It intensifies the cyberbullying and causes further harm to the girls\' emotional and psychological wellbeing.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Join in — leave a negative comment or repost it.',
        next: 'r_s3_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Commenting or reposting adds fuel to the rumours and the bullying. Even if you believe them, it damages reputations, deepens the targets\' distress, and encourages others to keep harassing them.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'Repost it to "raise awareness" and warn others not to believe it.',
        next: 'r_s3_tut',
        effects: { awareness: -10, responsibility: 5 },
        feedback: {
          verdict: 'mixed',
          note: 'Good intention, wrong tool. Reposting exposes more people to the harmful rumour — and some will believe or reshare it instead of reporting. The better move is to report the account.',
          action: 'Report Inappropriate Content',
        },
      },
    ],
  },
  {
    id: 'r_s3_tut',
    chapter: 'report',
    background: 'phone_feed',
    panel: {
      kind: 'tutorial',
      platform: 'Instagram',
      title: 'How to report an account on Instagram',
      steps: [
        'Open the profile and tap the three dots (⋯) at the top right.',
        'Tap "Report".',
        'Choose "Report account", then a reason — e.g. "Bullying or harassment".',
        'Follow the prompts and submit. Multiple reports help Instagram review faster.',
      ],
      footer: 'Reporting is anonymous — the account owner is never told who reported them.',
    },
    next: 'r_s3_dyk',
  },
  {
    id: 'r_s3_dyk',
    chapter: 'report',
    background: 'phone_feed',
    panel: {
      kind: 'didYouKnow',
      title: 'Cyberbullying is never "just a joke"',
      stat: 'Victims of cyberbullying are about twice as likely to experience symptoms of mental-health problems as those who haven\'t been bullied.',
      body: [
        'Cyberbullying is one of the most common online harms — globally, studies find 5%–59% of people have experienced it.',
        'It can also raise the risk of suicidal thoughts. The Interpersonal Theory of Suicide describes two feelings it can create: thwarted belongingness (feeling rejected and alone) and perceived burdensomeness (feeling like a burden).',
      ],
      footer:
        '🚨 That\'s why reporting harmful posts, refusing to share them, and supporting the victim matters — it helps prevent cyberbullying and builds a safer online space.',
      source: {
        label: '74% of users encounter harmful content — The Straits Times',
        url: 'https://www.straitstimes.com/singapore/74-of-internet-users-encounter-harmful-content-like-cyber-bullying-mddi-survey',
      },
    },
    next: 'r_end',
  },
  {
    id: 'r_end',
    chapter: 'report',
    speaker: 'Mika',
    background: 'bedroom_day',
    text: 'Reported, not shared, not fuelled. A little less harm reaching a little further today.',
    ending: {
      title: 'Chapter complete — Report Inappropriate Content',
      text: 'You don\'t have to confront anyone to make things safer. Recognise the harm, refuse to spread it, and report — reporting is anonymous, and it is never "snitching".',
    },
  },

  // ============================================================
  // CHAPTER 4 — REACH OUT & SUPPORT: "You Are Not Alone"
  // ============================================================
  {
    id: 's_intro',
    chapter: 'support',
    background: 'phone_dm',
    panel: {
      kind: 'intro',
      eyebrow: 'Action 4 · Reach Out & Support',
      title: 'Nobody should face it alone.',
      body: [
        'Provide and seek support during difficult moments — building a habit of reaching out and open communication.',
        'Your choices here shape your Support Score. Sometimes the bravest, kindest thing is to ask for help, or to help someone else ask.',
      ],
    },
    next: 's_s1',
  },
  {
    id: 's_s1',
    chapter: 'support',
    speaker: 'Reward',
    background: 'phone_dm',
    text:
      'A Telegram account with the H&M logo, "H&M Singapore Rewards", messages: "🎉 You\'ve won a FREE S$300 gift card! Today only — first 100 customers. Tap to verify: hm-rewards-sg.com/claim." Excited, you tap and enter your details. Minutes later, money is transferred out of your bank account. What now?',
    choices: [
      {
        label: 'Try to recover the money yourself — message the scammer, search for fixes.',
        next: 's_s1_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Handling it alone delays real help. The scammer won\'t respond, and the delay gives them time to move your money — lowering your chances of getting it back. Facing it alone also piles on stress and anxiety.',
          action: 'Reach Out & Support',
        },
      },
      {
        label: 'Tell a trusted family member or friend what happened.',
        next: 's_s1_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note: 'Great choice! A scam is overwhelming, and feeling shocked or embarrassed is normal. A trusted person can steady you, reassure you, and support you while you contact your bank and report it. You don\'t have to face this alone.',
          action: 'Reach Out & Support',
        },
      },
      {
        label: 'Immediately contact your bank and report the scam to the authorities.',
        next: 's_s1_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note: 'Excellent! Reporting fast gives your bank the best chance to freeze suspicious transactions and helps the authorities investigate. Acting early reduces losses and improves your chances of recovering the money.',
          action: 'Reach Out & Support',
        },
      },
      {
        label: 'Keep it to yourself and do nothing.',
        next: 's_s1_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Many victims feel embarrassed and stay silent — but that delays help from your bank and the authorities, increasing losses. It also cuts you off from the comfort trusted people can give, making everything feel heavier.',
          action: 'Reach Out & Support',
        },
      },
    ],
  },
  {
    id: 's_s1_dyk',
    chapter: 'support',
    background: 'phone_dm',
    panel: {
      kind: 'didYouKnow',
      title: 'Scams cost more than money',
      body: [
        'Losing money to a scam can lead to anxiety, depression, low mood, sleep problems, panic attacks, trauma and even paranoia — affecting your daily and social life.',
      ],
      footer:
        '❤️ Reaching out makes a difference. Trusted people can share the burden and give practical and emotional support, and reporting to your bank and the authorities helps protect your accounts and stop scammers targeting others.',
      source: {
        label: 'Recovering after a scam — TOUCH',
        url: 'https://www.touch.org.sg/get-assistance/tips-and-articles/the-road-to-recovery-after-encountering-a-scam.html',
      },
    },
    next: 's_s2',
  },
  {
    id: 's_s2',
    chapter: 'support',
    speaker: 'Narrator',
    background: 'phone_feed',
    text:
      'Someone made an AI-generated fake video of your friend saying racist, offensive things, and posted it to Telegram and Instagram. It goes viral. Your friend is flooded with hateful, threatening messages — and is now too afraid to leave home or come to class. What do you do?',
    choices: [
      {
        label: 'Ignore it — it\'s not your problem.',
        next: 's_s2_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Ignoring it leaves your friend to face the threats alone. Without support they may feel even more isolated and frightened — and the fake video keeps spreading if no one reports it.',
          action: 'Reach Out & Support',
        },
      },
      {
        label: 'Comfort your friend and encourage them to seek support.',
        next: 's_s2_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note: 'Great choice! Emotional support reassures your friend they\'re not alone and eases the fear, shame and isolation. Encouraging them to get help makes them more likely to take steps to protect themselves.',
          action: 'Reach Out & Support',
        },
      },
      {
        label: 'Share the video with friends because it\'s trending.',
        next: 's_s2_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Sharing exposes more people to the fake, increasing its reach and harming your friend further. It can also draw more people into the harassment, making everything more distressing for them.',
          action: 'Reach Out & Support',
        },
      },
      {
        label: 'Help them save screenshots as evidence, then report it to the platform and police.',
        next: 's_s2_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note: 'Excellent! Saving evidence preserves what investigators need. Reporting to the platform can get the posts removed, and reporting the threats to the police lets them act. Your help also shows your friend they\'re not alone.',
          action: 'Reach Out & Support',
        },
      },
    ],
  },
  {
    id: 's_s2_dyk',
    chapter: 'support',
    background: 'phone_feed',
    panel: {
      kind: 'didYouKnow',
      title: 'Support is powerful',
      body: [
        'Research shows that having someone step in and support you makes a real difference when you\'re facing cyberbullying — it reduces distress and helps people cope and recover.',
        'A single person who listens, believes, and helps report the content can change how the whole experience feels for a victim.',
      ],
      footer: '🤝 You don\'t need the perfect words. Showing up — and helping them get help — is what matters most.',
      source: {
        label: 'Support & cyberbullying — ScienceDirect',
        url: 'https://www.sciencedirect.com/science/article/pii/S0190740919310990',
      },
    },
    next: 's_s3',
  },
  {
    id: 's_s3',
    chapter: 'support',
    speaker: 'Narrator',
    background: 'phone_dm',
    text:
      'This time it\'s you. For weeks, a group has been mocking you online — cruel comments, edited photos, a fake "hate page". It\'s wearing you down and you feel completely alone. What do you do?',
    choices: [
      {
        label: 'Reach out — tell a trusted adult, friend, or a helpline how you feel.',
        next: 's_s3_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note: 'This is the bravest and strongest choice. Sharing what you\'re going through means you don\'t carry it alone — a trusted person or helpline can support you emotionally and help you report and stop the bullying. Reaching out is never weakness.',
          action: 'Reach Out & Support',
        },
      },
      {
        label: 'Retaliate — fire back with insults of your own.',
        next: 's_s3_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note: 'It\'s understandable to want to hit back, but retaliating usually escalates the conflict and can drag you into the same harmful behaviour — often making things worse. Report, block, save evidence, and tell someone you trust instead.',
          action: 'Reach Out & Support',
        },
      },
      {
        label: 'Keep it to yourself and bottle it up.',
        next: 's_s3_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note: 'Staying silent can feel safer, but bottling it up lets the hurt grow and leaves you isolated with it. You deserve support — telling someone you trust is the first step to feeling lighter and getting the bullying stopped.',
          action: 'Reach Out & Support',
        },
      },
    ],
  },
  {
    id: 's_s3_dyk',
    chapter: 'support',
    background: 'phone_dm',
    panel: {
      kind: 'resources',
      title: 'Bottling it up hurts — reaching out helps',
      body: [
        'Psychologists find that suppressing emotions ("bottling up") is linked to higher stress, anxiety and low mood over time, and can make problems feel bigger and lonelier. Naming how you feel to someone you trust actually lowers that distress.',
        'If you or a friend is struggling, you don\'t have to cope alone. In Singapore, these free, confidential lines can help:',
      ],
      resources: [
        { name: 'Samaritans of Singapore (SOS)', contact: '1767 · CareText 9151 1767 (24h)' },
        { name: 'IMH Mental Health Helpline', contact: '6389 2222 (24h)' },
        { name: 'Tinkle Friend (for children)', contact: '1800 274 4788' },
        { name: 'National Anti-Scam Hotline', contact: '1799' },
      ],
      footer: 'If someone is in immediate danger, call 999 or 995. Reaching out is strength, not weakness.',
    },
    next: 's_end',
  },
  {
    id: 's_end',
    chapter: 'support',
    speaker: 'Mika',
    background: 'school_corridor',
    text: 'Shared, reported, and no longer carried alone. It already feels a little lighter.',
    ending: {
      title: 'Chapter complete — Reach Out & Support',
      text: 'Whether you\'re helping a friend or struggling yourself, one message can start it. And when a worry is too big, telling a trusted adult — or a helpline — is strength. You were never meant to carry it alone.',
    },
  },
]

// Index by id for O(1) lookups by the engine.
export const SCENES = Object.fromEntries(scenes.map((s) => [s.id, s]))

// The intro scene for each chapter (pillar id -> scene id).
export const CHAPTER_START = {
  boundaries: 'b_intro',
  think: 't_intro',
  report: 'r_intro',
  support: 's_intro',
}

export default scenes
