// The full branching narrative for SafeSteps.
//
// The game is a directed graph of scenes. Each chapter (see chapters.js) maps
// to one IMDA action and runs a few scenarios. A scenario is one decision
// scene: several options, each with an `effects` score change and a `feedback`
// consequence shown in a modal. All options of a scenario reconverge onto the
// same next scene, which is usually a "Did You Know?" info panel or a short
// "how to report" tutorial before the next scenario.
//
// This content follows the design brief ("game plan") one-to-one, in its
// order — Set Boundaries Online, Report Inappropriate Content, Think Before
// You Act, Engage & Support — keeping every scenario, consequence, bonus
// question, tutorial and "Did You Know?" fact.
//
// Scene shapes:
//   Decision   { id, chapter, speaker, background, text, bonus?,
//                choices: [ { label, next, effects:{metric:+/-N},
//                             feedback:{ verdict:'good'|'mixed'|'risky', note,
//                                        action } } ] }
//   Info       { id, chapter, background, panel:{ kind, ... }, next }
//                kinds: 'intro' | 'didYouKnow' | 'tutorial' | 'resources'
//                fields: eyebrow, title, stat, body[], bullets[], steps[],
//                        resources[], extra[], footer, source{}, sources[]
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
        'Set Boundaries Online: use privacy and safety tools effectively, and manage your screen time responsibly.',
        "Throughout the game, you'll make choices just like you would in real life. Every decision affects your Privacy, Safety or Wellbeing. At the end, we'll reveal how strong your Boundary Meter is.",
      ],
    },
    next: 'b_s1',
  },
  {
    id: 'b_s1',
    chapter: 'boundaries',
    speaker: 'Phone',
    background: 'app_signup',
    text:
      "Scenario 1 — Your First Social Media Account 📱\n\nYour friends have been talking about Instagram and TikTok, so you've decided to create your very first account. As you set up your profile, the app asks whether you want your account to be Private or Public. A public account could help you gain more followers — but anyone can view your posts. A private account means only people you approve can see what you share. What would you choose?",
    choices: [
      {
        label: '🌍 Set your account to Public',
        next: 'b_s1_dyk',
        effects: { privacy: -10, wellbeing: -10, safety: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'A few days later, your follower count starts growing quickly. It feels exciting to see more people liking your posts. Then things begin to change. Strangers start sending you messages — some asking personal questions, others sharing suspicious links. You notice comments on your latest photo: "You\'re so ugly," "Nobody likes your posts," "Delete your account." The negative comments leave you feeling upset and anxious. A public account allows anyone, including strangers, to view your profile, send you messages, comment on your posts, or even use the information you share to engage in cyberstalking.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: '🔒 Set your account to Private',
        next: 'b_s1_dyk',
        effects: { privacy: 10, wellbeing: 10, safety: 10 },
        feedback: {
          verdict: 'good',
          note:
            "A few days later, your friends start following your account and you happily accept their requests. You feel comfortable sharing photos and updates because only the people you approve can see them. One day, you receive a follow request from someone you don't recognise. Since your account is private, they can't see your posts unless you accept — so you decide not to, keeping your account safe and your personal moments shared only with people you know. A private account gives you greater control over who can view your content and interact with you, and reduces unwanted access from strangers.",
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
      title: 'Anyone with a profile could become a victim of cyberstalking',
      stat: 'Around 80% of stalking victims experienced cyberstalking — and 69% of them experienced substantial emotional distress.',
      body: ['Cyberstalkers are strangers who may:'],
      bullets: [
        '📍 Monitor your profile, posts, photos and location to track your daily activities and who you interact with.',
        '👤 Create fake accounts to follow or contact you.',
        '📢 Share your personal information without your consent (doxxing).',
        '🚶 In some cases, escalate online stalking into real-life stalking.',
      ],
      extra: [
        '💙 Cyberstalking can harm both your mental and physical wellbeing. Victims often experience fear, anxiety and depression. Some even develop stress-related health problems such as insomnia, gastrointestinal issues or headaches from being constantly watched or monitored.',
        'A well-known public figure on social media was repeatedly harassed by an online stalker who sent threatening messages and shared their personal information online. The stalking eventually escalated beyond the internet, with the stalker attempting to approach the victim in person. The incident resulted in legal action and increased security measures.',
      ],
      footer:
        '🛡️ That is why it is important to keep your account private and only allow trusted friends and family to follow you. This helps reduce the risk of cyberstalkers accessing your personal information and tracking your daily activities, which could be used to harm or harass you.',
      sources: [
        {
          label: 'Cyberstalking statistics 2024 — SafeHome.org',
          url: 'https://www.safehome.org/data/cyberstalking-statistics/',
        },
        {
          label: 'The dark path of online stalking — Digital Resistance',
          url: 'https://www.digitalresistance.org.uk/the-dark-path-of-online-stalking-unveiling-its-meaning-and-impact/',
        },
      ],
    },
    next: 'b_s1_tut',
  },
  {
    id: 'b_s1_tut',
    chapter: 'boundaries',
    background: 'app_signup',
    panel: {
      kind: 'tutorial',
      platform: 'Instagram',
      tagLabel: 'How to go private',
      title: "Let's make your Instagram account private",
      body: [
        'Fixing this at the root is quick — try it yourself on the phone below. Tap through from your profile to Settings, then into Account privacy, and switch on Private account.',
      ],
      mockup: 'ig-privacy',
      footer:
        'Once private, only people you approve can follow you and see your posts. You can switch back anytime — but private is the safer default.',
    },
    next: 'b_s2',
  },
  {
    id: 'b_s2',
    chapter: 'boundaries',
    speaker: 'Phone',
    background: 'app_signup',
    text:
      "Scenario 2 — Password Challenge\n\nYou've just created your TikTok account and are excited to start posting videos. Before you can log in, TikTok asks you to create a password. Which password do you choose?",
    choices: [
      {
        label: 'A · Password123',
        next: 'b_2fa',
        effects: { safety: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'A week later, you try to log in but your password no longer works. A hacker used an automated tool to guess your easy password and gained access to your account. They change your profile picture, post inappropriate videos, and send messages pretending to be you.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: 'B · Nancy2005',
        next: 'b_2fa',
        effects: { safety: -5 },
        feedback: {
          verdict: 'mixed',
          note:
            'Your account remains safe for now. However, your password includes personal information such as your name and birth year. Someone who knows you — or who finds this information on your social media — could easily guess it. Your account is still at risk.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label: 'C · N7!pQ#29Lm@',
        next: 'b_2fa',
        effects: { safety: 10 },
        feedback: {
          verdict: 'good',
          note:
            "Several weeks later, a hacker's automated program tries thousands of common passwords to access your account. Your long, unique password makes it much harder for attackers to crack — the attack fails and your account stays secure.",
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
    text:
      'Bonus question\n\nA pop-up appears on your screen: "Would you like to enable Two-Factor Authentication (2FA)?"',
    choices: [
      {
        label: '✅ Yes, enable 2FA',
        next: 'b_s2_dyk',
        effects: { safety: 10 },
        feedback: {
          verdict: 'good',
          note:
            "A hacker manages to obtain your password and tries to log into your account. Before they can sign in, a verification code is sent to your phone. Since the hacker doesn't have the code, the login attempt is blocked and your account remains secure.",
          action: 'Set Boundaries Online',
        },
      },
      {
        label: '✖ No, it seems unnecessary',
        next: 'b_s2_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'You choose to skip Two-Factor Authentication because it seems unnecessary. A few days later, a hacker gets hold of your password and tries to log in. Since there is no second verification step, they are able to access your account immediately and take control of it.',
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
      title: 'Social media hacking is rising rapidly',
      stat: 'In 2025, about 429 million social media accounts had already been hacked — experts estimate this could reach 580 million by year end. That is 34% more than the year before!',
      body: ['Once hackers gain access to an account:'],
      bullets: [
        '🔒 70% of victims are locked out of their own accounts.',
        '👤 71% have their accounts used by hackers to impersonate them.',
        '🔗 73% experience hacks across multiple platforms, especially when they reuse the same password.',
      ],
      footer:
        "🛡️ Protect your account before it's too late! Use a strong, unique password for every account and enable two-factor authentication (2FA) now.",
      source: {
        label: 'Social media hacking statistics 2026 — StationX',
        url: 'https://app.stationx.net/articles/social-media-hacking-statistics',
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
      "Scenario 3 — Managing Screen Time\n\nYou just finished your classes at 2 PM. Your group assignment is due next week and your teammates have scheduled a discussion today. You also need to study for exams next week. At the same time: 🍽️ your family is having dinner tonight, 📱 your favourite TikTok creator has started a 5-hour livestream, 📺 a new 2-hour episode of your favourite show just dropped on YouTube, 🎮 your friends invite you to game online, and ⚽ your friends are playing soccer this evening. How do you spend your day?",
    choices: [
      {
        label:
          '⭐ Study 3h · group discussion 2h · family dinner 1h · soccer 2h · TikTok Live 1h. No gaming, no show.',
        next: 'b_s3_dyk',
        effects: { wellbeing: 30 },
        feedback: {
          verdict: 'good',
          note:
            'Excellent Balance ⭐: You prioritised your academic responsibilities while still making time for your family, physical activity and a little entertainment. By using screen time in moderation, you maintained a healthy balance between your online and offline life without missing what mattered most.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label:
          '👍 Study 2h · discussion 2h · watch show 2h · TikTok Live 2h · family dinner 30m. No gaming, no soccer.',
        next: 'b_s3_dyk',
        effects: { wellbeing: 20 },
        feedback: {
          verdict: 'mixed',
          note:
            'Better Balance: You prioritised your academic responsibilities and enjoyed some entertainment without letting it take over your day. Although you missed out on physical activity and more time with family and friends, you made a conscious decision to sacrifice gaming to maintain a fairly healthy balance between your online and offline activities.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label:
          '🎮 Study 1h · discussion 1h · watch show 2h · TikTok Live 3h · gaming 3h · family dinner 30m. No soccer.',
        next: 'b_s3_dyk',
        effects: { wellbeing: -20 },
        feedback: {
          verdict: 'risky',
          note:
            'Poor Balance: You spent a large portion of your day on entertainment, leaving less time for your studies, group discussion and family. You also missed out on physical activity. While you managed to complete some responsibilities, excessive recreational screen time reduced the balance between your online and offline life.',
          action: 'Set Boundaries Online',
        },
      },
      {
        label:
          '📱 Study 30m · discussion 30m · TikTok Live 5h · gaming 5h · watch show 2h. Skip family dinner, no exercise.',
        next: 'b_s3_dyk',
        effects: { wellbeing: -30 },
        feedback: {
          verdict: 'risky',
          note:
            'Terrible Balance: You spent almost your entire day on recreational screen time, leaving very little time for your studies and group discussion. You also skipped family dinner and missed out on physical activity. Excessive recreational screen time causes you to neglect your responsibilities and relationships, resulting in a very unhealthy balance between your online and offline life — this can negatively affect your wellbeing over time.',
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
      stat: 'People who spend over 5 hours a day on digital devices are 70% more likely to experience suicidal thoughts or behaviours than those who spend less than 1 hour a day.',
      body: [
        'Spending more than 5 hours a day on digital devices has been linked to poorer mental wellbeing. Take regular breaks and balance screen time with offline activities to support your mental wellbeing.',
      ],
      bullets: [
        '😴 Too much screen time can affect your sleep and lead to sleep deprivation. Poor sleep is linked to depression and mood disorders. Try putting your devices away before bedtime to improve your sleep quality.',
        '📚 Excessive recreational screen time reduces your attention span and creativity while limiting problem-solving. Balance online entertainment with studying, hobbies and physical activity to keep your mind active.',
        '👀 Looking at screens for long periods can cause Computer Vision Syndrome — eye strain, headaches, blurred vision, dry eyes and neck or shoulder pain. Follow the 20-20-20 rule: every 20 minutes, look at something about 20 feet (6 metres) away for 20 seconds.',
      ],
      footer:
        "Managing screen time isn't about avoiding technology. It's about making intentional choices so that digital activities don't replace sleep, physical activity, social interaction or other important parts of daily life.",
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
    text: "Let's see how well you protected your digital boundaries today.",
    ending: {
      title: 'Chapter complete — Set Boundaries Online',
      text: "Boundaries are decisions you make once so you don't have to fight them every night: who can see you, how you protect your account, and how you spend your time.",
    },
  },

  // ============================================================
  // CHAPTER 2 — REPORT INAPPROPRIATE CONTENT: "Stop the Spread"
  // ============================================================
  {
    id: 'r_intro',
    chapter: 'report',
    background: 'phone_feed',
    panel: {
      kind: 'intro',
      eyebrow: 'Action 2 · Report Inappropriate Content',
      title: 'Can you stop the spread?',
      body: [
        'Report Inappropriate Content: recognise online risks and take action to report harmful content.',
        'Harmful online content spreads every day, but your choices can make a difference. Will you help harmful content spread, or will you stop it?',
        "Throughout the game, you'll face situations based on real online experiences. Every decision affects your 🧠 Awareness and 🌐 Responsibility. At the end, these scores determine your 🌐 Digital Citizenship Score — revealing how well you recognise harmful online content and take responsible action to create a safer online community.",
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
      'Scenario 1 — "It\'s Just a Funny Video... Right?"\n\nWhile scrolling through TikTok after school, you come across a video where an influencer jokes about shoplifting from convenience stores. The creator laughs while showing stolen snacks and captions the video: "Big companies won\'t miss a few dollars. Try it if you\'re broke 😂." The video has over 100,000 likes and comments like "Legend! 😂", "I\'m going to try this," "Nothing will happen," "Free food hack!" You don\'t plan to copy it, but you notice many users praising the video. What do you do?',
    choices: [
      {
        label: "A · Ignore it because you won't copy it.",
        next: 'r_s1_bonus',
        effects: { awareness: 5, responsibility: -5 },
        feedback: {
          verdict: 'mixed',
          note:
            'Many people think this is enough, but harmful content can still influence others. Although you choose not to imitate the behaviour, simply ignoring the video allows it to remain online and continue reaching other users. Some viewers, especially younger audiences, may be influenced to see shoplifting as funny or harmless. Reporting the video is a more effective way to help stop the spread of harmful content.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'B · Comment "Don\'t do this."',
        next: 'r_s1_bonus',
        effects: { awareness: 5, responsibility: -5 },
        feedback: {
          verdict: 'mixed',
          note:
            "Your intention is to discourage others from copying the behaviour. However, commenting still boosts engagement and increases the video's visibility. A better approach is to report the video instead of interacting with it.",
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'C · Report the video.',
        next: 'r_s1_bonus',
        effects: { awareness: 10, responsibility: 10 },
        feedback: {
          verdict: 'good',
          note:
            'This is the most effective response. You recognised that the video promotes illegal behaviour and took appropriate action. Reporting alerts TikTok to review whether it violates its Community Guidelines. TikTok can then remove the video and take action against the account, such as restricting or banning it, helping to reduce the spread of harmful content. By avoiding further engagement, you also reduce the chances of increasing its visibility.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'D · Share it privately with your friends to warn them.',
        next: 'r_s1_bonus',
        effects: { awareness: 5, responsibility: -5 },
        feedback: {
          verdict: 'mixed',
          note:
            'Your intention is to protect your friends, but forwarding the video and simply warning them is not the most effective approach, because the video remains online and can continue reaching more people. A better approach is to tell your friends about the harmful content and encourage them to report it. Multiple reports can help alert TikTok to review the content for potential violations of its Community Guidelines.',
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
      'Bonus question\n\nThe creator appears to be showing stolen items and encourages viewers to shoplift. Should you also report this to the relevant authorities?',
    choices: [
      {
        label: 'A · Yes — it appears to show and encourage a criminal offence.',
        next: 'r_s1_tut',
        effects: { awareness: 5, responsibility: 5 },
        feedback: {
          verdict: 'good',
          note:
            'Shoplifting is a criminal offence. While reporting the video to TikTok allows the platform to review and remove content that violates its Community Guidelines, reporting content that appears to show and encourage illegal activity to the relevant authorities helps prevent further offences and protect the public from real-world harm.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'B · No — reporting to TikTok is enough, the platform handles everything.',
        next: 'r_s1_tut',
        effects: { responsibility: -5 },
        feedback: {
          verdict: 'risky',
          note:
            'TikTok can review the content and take action if it violates its Community Guidelines, such as removing the video or restricting the account. However, because the video appears to show and encourage a criminal offence, it may also require investigation by the relevant authorities. Reporting to both TikTok and the relevant authorities helps address both the online content and any potential real-world harm.',
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
      title: "Let's learn how to report a video on TikTok",
      steps: [
        'Tap the Share arrow (➡) on the right of the video.',
        'Scroll the menu and tap "Report".',
        'Choose the reason that fits — e.g. "Illegal activities and regulated goods".',
        'Follow the prompts and submit. Reports are anonymous.',
      ],
      footer:
        'Reporting takes seconds and is completely anonymous — the creator never sees who reported them. It really is that convenient.',
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
        'Did you know that people can be influenced by others? According to Social Influence Theory (Davlembayeva and Papagiannidis, 2026), individuals change their attitudes or behaviours because of the influence of others. When someone is influenced, they usually react in different ways:',
      ],
      bullets: [
        '🫂 Compliance — they change their behaviour to fit in.',
        '⭐ Identification — they change because they admire or want to be like someone, such as an influencer.',
        '🧩 Internalisation — they change because they truly believe the behaviour is acceptable.',
      ],
      extra: [
        'When harmful videos like this shoplifting scenario circulate online, youths may comply by stealing to fit in with what appears to be a popular trend; others may identify with the influencer and imitate their behaviour because they admire or trust them; while some may internalise the message and begin believing that stealing from large companies is harmless or morally acceptable.',
      ],
      footer:
        "🚨 That's why reporting harmful content matters. Reporting helps remove videos that promote illegal behaviour, which reduces their exposure and limits their influence on others. By reporting, you're helping create a safer online environment.",
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
      'Scenario 2 — "A Viral Fight Video"\n\nWhile you scroll through YouTube, a video appears titled "School Fight in Singapore Caught on Camera! 😱 Watch What Happens Next!" The thumbnail shows one student punching another while a crowd watches and records. The video has over 3 million views, with comments like "Best fight I\'ve seen this year!", "They deserved it," and "Watch until the end!" You\'re curious because so many people have watched it. What do you do?',
    choices: [
      {
        label:
          'A · Watch the entire video without liking, commenting, sharing or subscribing — you just want to know what happened.',
        next: 'r_s2_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'You may think that simply watching has no impact because you did not like, comment, share or subscribe. However, your view and watch time still count as engagement. As a result, YouTube recommends the video to more users because it interprets it as engaging content, increasing exposure to violent content. At the same time, you expose yourself to distressing content that can gradually make real-life violence seem more normal.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'B · Skip the video and continue scrolling.',
        next: 'r_s2_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'mixed',
          note:
            "You avoid exposing yourself to violent content. However, the video remains on the platform and continues to reach more users because it hasn't been reported. As more people view, like, comment on or share it, the platform may recommend it to more users, exposing them to harmful content and potentially contributing to the normalisation of violence.",
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: "C · Share the video with your friends because it's trending.",
        next: 'r_s2_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'Sharing the video is one of the quickest ways to expose people to violent content. As more users receive and reshare it, the video can spread rapidly to a wider audience, increasing the number of people exposed to harmful content. This may influence them to view violence as entertainment rather than recognising the harm it can cause.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'D · Report the video as it appears to promote violence.',
        next: 'r_s2_tut',
        effects: { awareness: 10, responsibility: 10 },
        feedback: {
          verdict: 'good',
          note:
            'Great choice! You avoid exposing yourself to harmful content and help the platform review whether the video violates its Community Guidelines. This helps remove the video, which reduces the chances of it reaching more users and helps create a safer online environment.',
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
      title: "Let's learn how to report an account and video on YouTube",
      steps: [
        'Tap the three dots (⋮) below or beside the video.',
        'Tap "Report".',
        'Select the reason — e.g. "Violent or repulsive content".',
        'Add detail if asked, then submit. You can also report the whole channel from its About page.',
      ],
      footer:
        'Reporting flags the video for human review — it does not tell the uploader who reported it.',
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
        'A study by The Lancet Regional Health – Americas (2023) found that exposure to violent content can reduce empathy and increase aggressive thoughts, anger and aggressive behaviour.',
        'Moreover, the more time people spend watching violent content on screens, the more likely they are to engage in bullying or cyberbullying.',
      ],
      footer:
        'That is why you need to take action by reporting violent content — it helps reduce its spread and limits the number of people exposed to it. This prevents others from becoming desensitised to violence, reduces the risk of harmful behaviours being normalised, and protects users from the harmful effects identified in the study. It also protects the younger generation, who are particularly vulnerable to being influenced by harmful online content.',
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
      'Scenario 3 — The Rumour Account\n\nYou come across an account called @SGGirlsTea09. The account regularly posts rumours about Singaporean girls and shares their photos without their consent to publicly humiliate them. Most posts have negative comments, and many users have shared them on their Instagram Stories to spread and support the rumours. Example comments: "I always knew she was fake." "Everyone should unfollow her." "Tag your friends so they know." "Share this so more people know." You\'re unsure whether the rumours are true, but you can see that many people are joining in. What do you do?',
    choices: [
      {
        label: 'A · Report the account for bullying and harassment.',
        next: 'r_s3_tut',
        effects: { awareness: 10, responsibility: 10 },
        feedback: {
          verdict: 'good',
          note:
            'Your report enables Instagram to delete the posts and suspend the account, as it violates Community Guidelines. This helps reduce the spread of harmful rumours and prevent further humiliation of the girls involved. Your action also helps protect them from ongoing cyberbullying and reduces the risk of emotional and psychological harm caused by false accusations and public humiliation.',
          action: 'Report Inappropriate Content',
        },
      },
      {
        label:
          'B · Share the account with your friends and ask, "Do you think all these posts are true?"',
        next: 'r_s3_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'risky',
          note:
            "Even if you're only asking for others' opinions, sharing the account spreads unverified rumours to more people. This can intensify the cyberbullying and cause further harm to the girls' emotional and psychological wellbeing.",
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'C · Join in by leaving negative comments or reposting the post.',
        next: 'r_s3_tut',
        effects: { awareness: -10, responsibility: -10 },
        feedback: {
          verdict: 'risky',
          note:
            "By leaving negative comments or reposting the post on your own account, you contribute to the spread of harmful rumours and cyberbullying. Even if you believe the rumours are true, commenting negatively or sharing unverified content can damage the girls' reputation, increase their emotional and psychological distress, and encourage others to continue harassing and humiliating them.",
          action: 'Report Inappropriate Content',
        },
      },
      {
        label: 'D · Repost it to "raise awareness" and warn others not to believe the rumours.',
        next: 'r_s3_tut',
        effects: { awareness: -10, responsibility: 5 },
        feedback: {
          verdict: 'mixed',
          note:
            "Although your intention is to raise awareness and warn others, reposting the post exposes more people to the harmful rumour. Some users may believe or share the allegations instead of reporting the account, causing further harm to the targeted person's reputation and emotional wellbeing. A better approach is to report the account.",
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
      title: "Let's learn how to report an Instagram account",
      steps: [
        'Open the profile and tap the three dots (⋯) at the top right.',
        'Tap "Report".',
        'Choose "Report account", then a reason — e.g. "Bullying or harassment".',
        'Follow the prompts and submit. Multiple reports help Instagram review faster.',
      ],
      footer:
        'Reporting is anonymous — the account owner is never told who reported them.',
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
      stat: 'Victims of cyberbullying are about twice as likely to experience symptoms of mental-health problems as those who have not been cyberbullied (CNA, 2024).',
      body: [
        'Cyberbullying is one of the most common forms of harmful content experienced online (Abdullah, 2024). Globally, studies have found that between 5% and 59% of people have experienced cyberbullying (Fadhli et al., 2022).',
        'Cyberbullying also increases the risk of suicidal thoughts and behaviours. According to the Interpersonal Theory of Suicide, cyberbullying can make victims experience:',
      ],
      bullets: [
        '🕳️ Thwarted belongingness — feeling lonely, rejected, or as though they do not belong.',
        '🪨 Perceived burdensomeness — believing they are a burden to others.',
      ],
      extra: [
        'When these feelings become intense, they may heighten suicidal thoughts or the desire for suicide.',
      ],
      footer:
        '🚨 This is why cyberbullying should never be treated as "just a joke." Reporting harmful posts, refusing to share them, and supporting the victim can prevent cyberbullying and create a safer online environment.',
      sources: [
        {
          label: '74% of users encounter harmful content — The Straits Times',
          url: 'https://www.straitstimes.com/singapore/74-of-internet-users-encounter-harmful-content-like-cyber-bullying-mddi-survey',
        },
        {
          label: 'Social media use & youth mental health — CNA',
          url: 'https://www.channelnewsasia.com/singapore/youth-depression-anxiety-stress-social-media-body-image-cyberbullying-4617641',
        },
        {
          label: 'Cyberbullying & suicidal behaviour — PMC',
          url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9141303/',
        },
      ],
    },
    next: 'r_end',
  },
  {
    id: 'r_end',
    chapter: 'report',
    speaker: 'Mika',
    background: 'bedroom_day',
    text: "Let's see what kind of digital citizen you are.",
    ending: {
      title: 'Chapter complete — Report Inappropriate Content',
      text: "You don't have to confront anyone to make things safer. Recognise the harm, refuse to spread it, and report — reporting is anonymous, and it is never \"snitching\".",
    },
  },

  // ============================================================
  // CHAPTER 3 — THINK BEFORE YOU ACT: "Your Digital Footprint"
  // ============================================================
  {
    id: 't_intro',
    chapter: 'think',
    background: 'phone_feed',
    panel: {
      kind: 'intro',
      eyebrow: 'Action 3 · Think Before You Act',
      title: 'Every post leaves a footprint.',
      body: [
        'Think Before You Act: be mindful of your digital footprint and approach online content with kindness and critical thinking.',
        "Your choices here affect your Safety and your Digital Citizenship. Pause before you share, click, or post — once it's out there, you can't take it back.",
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
      "Scenario 1 — Can Everyone See This?\n\nYou're about to post a selfie at your favourite cafe that you visit regularly after school. The photo includes 📍 your live location and 🏫 your school uniform logo. What do you do?",
    choices: [
      {
        label:
          "A · Upload the photo as-is with live location on — it's not exposing personal details.",
        next: 't_s1_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'risky',
          note:
            "You may think this photo with your live location on is harmless because it doesn't include your home address or phone number. However, your school logo and live location are valuable clues. Someone with bad intentions could use them to identify where you study, locate where you are, or even wait for you near your school or current location to follow you home. Strangers can piece together small details over time to learn far more about you than you realise.",
          action: 'Think Before You Act',
        },
      },
      {
        label: 'B · Turn off the live location and blur the school logo before posting.',
        next: 't_s1_dyk',
        effects: { safety: 10 },
        feedback: {
          verdict: 'good',
          note:
            'Great choice! By turning off your live location and hiding your school logo, you reduce the amount of personal information strangers can learn about you while still sharing your experience online. Limiting what you share makes it harder for someone with bad intentions to piece together details about your daily life, identify you, or track your routine.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'C · Blur the school logo but leave the live location on.',
        next: 't_s1_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'mixed',
          note:
            'You have hidden one piece of personal information, but your live location still reveals your exact whereabouts. This could make it easier for strangers to locate you in real time.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'D · Blur the school logo, but add the location tag after you leave.',
        next: 't_s1_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'mixed',
          note:
            "Adding the location after you've left is safer than sharing your live location. However, since you regularly visit the cafe after school, someone with bad intentions may use the location tag to deliberately find or approach you there.",
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
        'Stalking has become easier through social media. A survivor known as "Penny" (not her real name, to protect her anonymity) regularly shared her day-to-day life on a public account, tagging her locations. An obsessive follower used these posts to learn more about her, eventually uncovering her home address.',
        "What began as cyberstalking escalated into a real-world attack. The stalker confronted Penny outside her home, sexually harassed and assaulted her. When Penny called the police, the stalker punched her in the face. Penny's father heard the commotion and rushed to protect her but was shot in both thighs.",
      ],
      extra: [
        '🎮 Lesson learned: seemingly harmless posts can sometimes lead to life-threatening consequences when they reveal too much personal information. Everything you post contributes to your digital footprint — a record of information others may be able to access and piece together over time.',
      ],
      footer:
        '🧠 Posting on social media is completely normal, but think before you post. Ask: Does this reveal my location, school, workplace or daily routine? Do I really need to tag this location? Could someone misuse this information? Not every moment needs to be shared.',
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
      'Scenario 2 — E-Commerce Scams\n\nYou\'ve been looking for a new pair of Apple AirPods because your current ones stopped working. While scrolling through TikTok Shop, you find a listing for the latest AirPods at S$100 less than the usual retail price. The listing has many positive reviews, so you place an order. A few minutes later, the seller messages: "Hi! To enjoy an extra S$20 discount, let\'s complete the payment through Telegram or WhatsApp instead of TikTok Shop. This helps us avoid platform fees." The deal is tempting and you really need a new pair. What do you do?',
    choices: [
      {
        label:
          'A · Continue on Telegram/WhatsApp — the seller has many 5-star reviews on TikTok Shop.',
        next: 't_s2_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'Positive reviews can be fake or manipulated. Even if the seller appears trustworthy, moving the transaction outside TikTok Shop means you lose buyer protection — such as the ability to request a refund or report the seller through the platform if something goes wrong.',
          action: 'Think Before You Act',
        },
      },
      {
        label: 'B · Keep all communication and payment within TikTok Shop.',
        next: 't_s2_dyk',
        effects: { safety: 10 },
        feedback: {
          verdict: 'good',
          note:
            "Great choice! Keeping the transaction within TikTok Shop protects you with the platform's buyer-protection policies. If the seller fails to deliver the item or asks you to move the transaction elsewhere, you can report them and request a refund through the platform.",
          action: 'Think Before You Act',
        },
      },
      {
        label:
          'C · Ask the seller why they want to move off TikTok Shop, then continue if it sounds reasonable.',
        next: 't_s2_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'mixed',
          note:
            "Scammers often give convincing reasons such as avoiding platform fees or offering a bigger discount. Even if the explanation sounds genuine, moving the transaction outside TikTok Shop means you lose the platform's buyer protection, such as the ability to request a refund or report the seller.",
          action: 'Think Before You Act',
        },
      },
      {
        label:
          'D · Continue on Telegram/WhatsApp, but only pay after the seller sends a photo of the AirPods.',
        next: 't_s2_dyk',
        effects: { safety: -10 },
        feedback: {
          verdict: 'mixed',
          note:
            "A photo is not proof that the seller is genuine. Scammers often use stolen photos or videos. By moving the transaction outside TikTok Shop, you lose the platform's buyer protection, such as the ability to request a refund or report the seller if something goes wrong.",
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
      stat: 'In 2024, the Singapore Police Force received at least 179 reports of this scam, with victims losing at least S$399,000 in total.',
      body: [
        'Some e-commerce scammers trick victims into making multiple payments. After receiving the initial payment, they may falsely claim that your parcel has been held at customs and ask you to pay additional fees to release it. Victims often realise they have been scammed only when the item never arrives, the seller becomes uncontactable, or the seller\'s account is removed from the shopping platform.',
      ],
      footer:
        'This is why it is important to practise Think Before You Act. If a seller asks you to move your conversation or payment to another platform, treat it as a red flag and think carefully before taking any action. Keep all communication and payments within the official e-commerce platform to stay protected.',
      source: {
        label: 'Police advisory on e-commerce scams — SPF',
        url: 'https://www.police.gov.sg/media-hub/news/2025/01/20250124_police_advisory_on_ecommerce_scams_through_sale_of_products',
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
      "Scenario 3 — Think Before You Share\n\nYou come across a viral video on Instagram of a man making misogynistic remarks and body-shaming women. The comments are filled with people arguing — some sharing the video to expose his behaviour, others mocking him with insults and hateful comments. You disagree with what he said and want others to know it's wrong. What do you do?",
    choices: [
      {
        label:
          'A · Publicly post a video insulting and attacking him to show everyone how terrible he is.',
        next: 't_s3_dyk',
        effects: { citizenship: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'Although your intention is to call out harmful behaviour and stand up against misogyny, insulting someone publicly contributes to online hostility. Your comments also become part of your digital footprint and may affect your online reputation. It may also encourage others to join in the harassment instead of having a respectful discussion about why his behaviour is harmful. A better approach is to respond respectfully by addressing the behaviour rather than attacking the person.',
          action: 'Think Before You Act',
        },
      },
      {
        label:
          'B · Publicly post a respectful commentary explaining why his actions are wrong, without abusive language.',
        next: 't_s3_dyk',
        effects: { citizenship: 10 },
        feedback: {
          verdict: 'good',
          note:
            "Great choice! You raised awareness while remaining respectful. By focusing on why his behaviour is harmful instead of attacking him personally, you're more likely to encourage constructive discussion and help others understand the issue. Your thoughtful response also leaves a positive digital footprint and helps protect your online reputation by modelling responsible digital citizenship.",
          action: 'Think Before You Act',
        },
      },
      {
        label: "C · Join the comments by making fun of the man's appearance to teach him a lesson.",
        next: 't_s3_dyk',
        effects: { citizenship: -10 },
        feedback: {
          verdict: 'risky',
          note:
            "Responding to body-shaming with more body-shaming doesn't solve the problem. It contributes to the same harmful behaviour and can damage your own online reputation.",
          action: 'Think Before You Act',
        },
      },
      {
        label: 'D · Privately send the video to your group chat so everyone can mock the creator.',
        next: 't_s3_dyk',
        effects: { citizenship: -10 },
        feedback: {
          verdict: 'mixed',
          note:
            "Even though you didn't post the video publicly, sharing it in a group chat still spreads the content to more people. Mocking the creator can encourage a culture of ridicule and negativity, making others more likely to join in instead of responding respectfully. Your messages can also be screenshotted and shared beyond the group, which could damage your online reputation.",
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
        'Your online posts, comments and replies all become part of your digital footprint. Employers, schools and universities may look at your social media profiles when evaluating you.',
        'A well-known example involved a student named Naomi, who excitedly announced on Twitter/X that she had secured an internship with NASA. Her post included profanity, and when a former NASA engineer advised her to be mindful of her language, she responded with more offensive remarks. The exchange attracted widespread attention, and her internship offer was later withdrawn.',
        "Today, employers don't just look at your qualifications. They may also consider whether your recent online behaviour reflects professionalism, respect and good judgement.",
      ],
      footer:
        '🧠 Think Before You Act. Before you post, comment or share, ask: Would I be comfortable if my future employer or teacher saw this? Does this reflect the kind of person I want others to see? Am I contributing positively, respectfully and responsibly online? Your digital footprint can open doors or close them — make every post count.',
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
  // CHAPTER 4 — ENGAGE & SUPPORT: "You Are Not Alone"
  // ============================================================
  {
    id: 's_intro',
    chapter: 'support',
    background: 'phone_dm',
    panel: {
      kind: 'intro',
      eyebrow: 'Action 4 · Engage & Support',
      title: 'Nobody should face it alone.',
      body: [
        'Engage & Support: provide and seek support during difficult situations, fostering a culture of reaching out and open communication.',
        'Difficult moments happen to everyone online — scams, harassment, cyberbullying. Your choices here shape your Support Score. Sometimes the bravest, kindest thing is to ask for help, or to help someone else ask.',
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
      'Scenario 1 — Telegram Scam Link\n\nYou receive a Telegram message from an account using the H&M logo and the display name "H&M Singapore Rewards". The profile looks legitimate. It reads: "🎉 Congratulations! As part of our H&M Singapore Mid-Year Rewards Campaign, you\'ve been selected to receive a FREE S$300 H&M Gift Card! Valid today only. Only the first 100 customers can claim. Tap the link to verify your details and claim your voucher: hm-rewards-sg.com/claim." Excited, you tap the link and enter your personal and banking details to "verify your identity." A few minutes later, you receive a notification that money has been transferred out of your bank account without your permission. What do you do?',
    choices: [
      {
        label:
          'A · Try to recover the money yourself — message the scammer and search online for solutions.',
        next: 's_s1_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'Trying to handle the scam alone delays getting professional help. The scammer is unlikely to respond, and the delay gives them more time to move or withdraw your money, which reduces the chances of recovering it. Dealing with the situation on your own can also increase feelings of stress, anxiety and being overwhelmed.',
          action: 'Engage & Support',
        },
      },
      {
        label: 'B · Share what happened with a trusted family member or friend.',
        next: 's_s1_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note:
            "Great choice! A scam can be overwhelming and it's normal to feel shocked or embarrassed. Reaching out for support helps you stay calm and act quickly. A trusted family member or friend can listen, reassure you, and support you emotionally while you contact your bank and report the scam. You don't have to face this alone — having someone by your side makes a stressful situation feel more manageable.",
          action: 'Engage & Support',
        },
      },
      {
        label: 'C · Immediately contact your bank and report the scam to the authorities.',
        next: 's_s1_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note:
            'Excellent choice! Reporting the scam immediately gives your bank the best chance of freezing suspicious transactions and helps the authorities investigate. Seeking help early can reduce further financial losses and improve the chances of recovering your money.',
          action: 'Engage & Support',
        },
      },
      {
        label: "D · Keep it to yourself and don't take any action.",
        next: 's_s1_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'Many scam victims feel embarrassed or blame themselves and believe nothing can be done. However, keeping the scam a secret delays getting help from your bank and the authorities, which can increase financial losses and reduce your chances of recovery. By not telling anyone, you may also miss the comfort and reassurance that trusted family and friends can provide, making the experience more emotionally overwhelming.',
          action: 'Engage & Support',
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
        'Scam victims often experience more than financial loss. The stress of losing money can lead to anxiety, depression, low mood, sleep problems, panic attacks, trauma and even paranoia, which can affect your daily and social functioning.',
      ],
      footer:
        '❤️ Reaching out makes a difference. Trusted family members and friends can help you get back on your feet by sharing your burdens and providing practical, financial and emotional support. Reporting the scam to your bank and the authorities also helps protect your accounts and supports efforts to stop scammers from targeting others.',
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
      'Scenario 2 — Fake AI Video\n\nSomeone creates an AI-generated fake video of your friend making racist and offensive remarks and shares it on TikTok and Instagram. The video quickly goes viral, and your friend starts receiving hateful comments and threatening messages from strangers. The threats become so severe that your friend is afraid to leave home and no longer wants to attend class. What do you do?',
    choices: [
      {
        label: "A · Ignore the situation because it's not your problem.",
        next: 's_s2_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'Ignoring the situation leaves your friend to cope with the threats and hateful comments alone. Without emotional support, they may feel even more isolated, frightened and overwhelmed. The harmful content may also continue to spread if no one reports it.',
          action: 'Engage & Support',
        },
      },
      {
        label: 'B · Comfort your friend and encourage them to seek support.',
        next: 's_s2_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note:
            'Great choice! Offering emotional support reassures your friend that they are not alone and helps reduce feelings of fear, shame and isolation. Encouraging them to seek help also increases the likelihood that they will take action to protect themselves and their wellbeing.',
          action: 'Engage & Support',
        },
      },
      {
        label: "C · Share the video with your friends because it's trending.",
        next: 's_s2_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note:
            "Sharing the video exposes more people to the fake content, increasing its reach and causing further harm to your friend's reputation and emotional wellbeing. It may also encourage more people to join in the harassment, making the situation even more distressing for your friend.",
          action: 'Engage & Support',
        },
      },
      {
        label:
          'D · Help your friend save screenshots and evidence, then report the content to the platform and the police.',
        next: 's_s2_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note:
            'Excellent choice! Saving evidence helps preserve important information for investigations. Reporting the content to the platform can help remove the harmful posts, while reporting the threats to the police allows them to investigate and take appropriate action. Your support also shows your friend that they do not have to face the situation alone.',
          action: 'Engage & Support',
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
      title: 'Your support can make a difference',
      stat: 'Research indicates that 10–40% of young people experience cyberbullying, and about 50% of victims do not know the identity of their aggressor.',
      body: [
        "This uncertainty increases victims' fear, distress and feelings of powerlessness. Cyberbullying can also affect a victim's sleep, confidence, self-esteem and willingness to attend school.",
        'Studies have further found that cyberbullying may have even stronger links to anxiety, depressive symptoms and suicidal ideation than traditional bullying.',
      ],
      footer:
        '❤️ That is why your support can make a difference. By checking in on a friend, listening without judgement, reassuring them that the abuse is not their fault, and encouraging them to seek help, you can help them feel less alone and more confident to reach out. Sometimes, knowing that someone cares is the first step towards recovery.',
      source: {
        label: 'Psychosocial impacts of cybervictimisation — ScienceDirect',
        url: 'https://www.sciencedirect.com/science/article/pii/S0190740919310990',
      },
    },
    next: 's_s3',
  },
  {
    id: 's_s3',
    chapter: 'support',
    wip: true,
    speaker: 'Narrator',
    background: 'phone_dm',
    text:
      'Scenario 3 — This Time, It\'s You\n\nFor weeks, a group has been cyberbullying you — cruel comments, edited photos, a fake "hate page". It\'s wearing you down and you feel completely alone. What do you do?',
    choices: [
      {
        label: '🫂 Reach out — tell a trusted adult, friend, or a helpline how you feel.',
        next: 's_s3_dyk',
        effects: { support: 10 },
        feedback: {
          verdict: 'good',
          note:
            "This is the bravest and strongest choice. Sharing what you're going through means you don't carry it alone — a trusted person or a helpline can support you emotionally and help you report and stop the bullying. Reaching out is never weakness.",
          action: 'Engage & Support',
        },
      },
      {
        label: '💢 Retaliate — fire back with insults of your own.',
        next: 's_s3_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note:
            "It's understandable to want to hit back, but retaliating usually escalates the conflict and can drag you into the same harmful behaviour, often making things worse. Instead: block, save evidence, report it, and tell someone you trust.",
          action: 'Engage & Support',
        },
      },
      {
        label: '🤐 Keep it to yourself and bottle it up.',
        next: 's_s3_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note:
            'Staying silent can feel safer, but bottling it up lets the hurt grow and leaves you isolated with it. You deserve support — telling someone you trust is the first step to feeling lighter and getting the bullying stopped.',
          action: 'Engage & Support',
        },
      },
      {
        label: '💔 Turn the hurt inward and consider harming yourself.',
        next: 's_s3_dyk',
        effects: { support: -10 },
        feedback: {
          verdict: 'risky',
          note:
            "When the pain feels this heavy, it can seem like it will never stop — but hurting yourself is not the answer, and this moment does not have to be faced alone. Please reach out right now to someone you trust or a helpline. In Singapore you can call the Samaritans of Singapore (SOS) at 1767, or 999/995 in an emergency. You matter, the bullying is not your fault, and support is available.",
          action: 'Engage & Support',
        },
      },
    ],
  },
  {
    id: 's_s3_dyk',
    chapter: 'support',
    wip: true,
    background: 'phone_dm',
    panel: {
      kind: 'resources',
      title: 'Bottling it up hurts — reaching out helps',
      body: [
        'Psychologists find that suppressing emotions ("bottling up") is linked to higher stress, anxiety and low mood over time, and can make problems feel bigger and lonelier. Naming how you feel to someone you trust actually lowers that distress.',
        "If you or a friend is struggling, you don't have to cope alone. In Singapore, these free, confidential lines can help:",
      ],
      resources: [
        { name: 'Samaritans of Singapore (SOS)', contact: '1767 · CareText 9151 1767 (24h)' },
        { name: 'IMH Mental Health Helpline', contact: '6389 2222 (24h)' },
        { name: 'Tinkle Friend (for children)', contact: '1800 274 4788' },
        { name: 'National Anti-Scam Hotline', contact: '1799' },
      ],
      footer:
        'If someone is in immediate danger, call 999 or 995. Reaching out is strength, not weakness.',
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
      title: 'Chapter complete — Engage & Support',
      text: "Whether you're helping a friend or struggling yourself, one message can start it. And when a worry is too big, telling a trusted adult — or a helpline — is strength. You were never meant to carry it alone.",
    },
  },
]

// Index by id for O(1) lookups by the engine.
export const SCENES = Object.fromEntries(scenes.map((s) => [s.id, s]))

// The intro scene for each chapter (pillar id -> scene id).
export const CHAPTER_START = {
  boundaries: 'b_intro',
  report: 'r_intro',
  think: 't_intro',
  support: 's_intro',
}

export default scenes
