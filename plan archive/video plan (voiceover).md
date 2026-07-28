# SafeSteps — 30-second demo video plan (with voiceover)

For **PROID ASG 2: Solution Pitch** (ASG 2A Pitch Content 20% group · ASG 2B Delivery 10% individual).
This supersedes `video plan.md`, which planned a silent version narrated live.

## 1. What changes now that there's a VO

Adding a voiceover makes the video **self-contained** rather than a backing track for the
presenter. Four knock-on consequences, all of which affect the plan:

1. **The presenter must go quiet for 30 seconds.** Two people talking at once loses marks for
   both. So the speaker needs a scripted **hand-off line before** and **landing line after**
   (§5) — the video earns no 2B marks itself, so the seconds either side of it have to work
   harder.
2. **Edit picture to audio, not audio to picture.** Record the VO first, lay it on the timeline,
   then cut the screen recording to hit the words. Doing it the other way round always ends with
   a rushed final line.
3. **Fewer, longer beats.** Sentences need room to breathe. The silent plan had 7 shots; this one
   has **6** — the title and chapter-select merge into one opening move, and the extra second
   goes to the Instagram walkthrough.
4. **New failure mode: rooms with no audio.** Plenty of classroom HDMI setups output no sound.
   That's why subtitles are burned in below (§2) — if the audio dies, the video still argues its
   case and the presenter can pick up the script live.

## 2. Spec

| Item | Value |
|---|---|
| Length | 30s (VO runs 0:00–0:28, final ~1.5s is silence on the freeze frame) |
| Resolution | 1920×1080, 30fps, H.264 .mp4 |
| Voiceover | one human voice, ~74 words, conversational-clear (~2.7 words/sec) |
| Music | optional instrumental bed at ~10% under the voice; cut it entirely if in doubt |
| Subtitles | burned in, bottom third, matching the VO — insurance against a silent room |
| Graphic callouts | only 2 (see shots 3 and 6) — the voice carries everything else |
| Source | record the **live deployed build** at `https://adecentname.github.io/` |
| Embed | PowerPoint → Insert → Video → **This Device** (embed, never link), Start: **Automatically** |

Recording the live URL rather than `npm run dev` matters for the *Feasibility* criterion — it is
already deployed, free to host, and runs in any browser with no install.

## 3. The script, locked to picture

Narrative arc: **mistake → consequence → evidence → fix → score.** That mirrors problem → root
cause → solution, so the video argues the pitch's structure, not just its features.

| # | In–Out | VO line | Words | Screen |
|---|---|---|---|---|
| 1 | 0:00–0:04 | "SafeSteps: a free browser game covering all four IMDA safety actions." | 11 | Title screen with the four pillars visible → click **Start playing** → chapter-select grid. One continuous move. |
| 2 | 0:04–0:10 | "Chapter one — your first account. Public, or private? Let's pick public." | 12 | Scenario 1 text; cursor hovers both options, then clicks **🌍 Set your account to Public** |
| 3 | 0:10–0:15 | "Days later: strangers in your DMs, hate comments — and your scores drop." | 13 | **⚠️ Risky move** modal. Push in on the verdict line, then down to the chips **🔒 −10 ❤️ −10 🛡️ −10**. *Callout 1: circle the chips.* |
| 4 | 0:15–0:18 | "Then the research behind it, cited on screen." | 8 | 💡 Did You Know? card — the **80% of stalking victims experienced cyberstalking** stat with `Source: … ↗` visible |
| 5 | 0:18–0:25 | "And the fix: we walk you through making your real account private — then show what a stranger sees now." | 19 | Instagram mockup, four taps: **☰ → Account privacy → Private toggle ON → 👀 See what others see**, landing on *"This account is private"* |
| 6 | 0:25–0:30 | "Every chapter scores you. It's live today — play it yourself." | 11 | Privacy/Safety/Wellbeing bars fill → **🔥 Boundary Meter** + tier. Freeze. *Callout 2: `adecentname.github.io`* |
| | | **Total** | **74** | |

**Write and read it in second person.** "You," never "he/she" — it matches the game's own voice,
it's what an interactive demo should sound like, and it sidesteps guessing at the player
character's pronouns.

**Deliberate choice — show the wrong answer.** Picking *Public* costs 6 seconds but buys the whole
story: the bad outcome (shot 3) creates the need that the research (4) explains and the Instagram
walkthrough (5) resolves. Showing the safe answer would be 30 seconds of the game agreeing with itself.

### If you're over time
Trim in this order — never speed up the read:
1. Shot 4 → "Then the cited research." (4 words, saves ~1.5s)
2. Shot 1 → "SafeSteps: all four IMDA safety actions." (6 words, saves ~1.8s)
3. Shot 6 → "It's live today — play it yourself." (7 words)

Do **not** trim shots 3 or 5. They are the consequence and the innovation — the two things the
rubric actually pays for.

### Shot notes for the editor
- **Shot 3:** don't try to show the whole feedback paragraph — nobody reads it in 5s. Punch in
  (~120%) on the ⚠️ verdict, then push down to the delta chips, landing the push on the word
  "drop."
- **Shot 5:** the mockup already pulses a highlight on the next tap target (`ig-pulse`), so the
  taps read clearly with no annotation. Land the tap on "private" and hold ~0.5s on *"This account
  is private"* under the words "what a stranger sees now."
- **Shot 6:** the bars animate on mount — enter the screen clean, don't cut mid-fill.
- Browser zoom **110–125%** (`Ctrl` `+`) before recording. Laptop-sized text is unreadable projected.

## 4. Recording the voice

**Who reads it:** the clearest, steadiest speaker on the team — but **not** the person presenting
that slide. Hearing the same voice recorded and then live is jarring, and it wastes an opportunity
to feature a second team member.

**Use a real human voice, not an AI voice.** It sounds more authentic for a youth-safety pitch, and
a synthetic voice is one more thing to declare and defend in Annex 1 (see §7).

- Quietest room in the house, soft furnishings, curtains closed. **Aircon and fans off** — their
  hum is the single most common ruin of student VO.
- Phone voice memo is fine. Hold it ~15cm away and slightly **off to the side** of your mouth, not
  straight on, so plosives ("p", "b") don't thump.
- Phone on Do Not Disturb. Clap once before each take for easy sync.
- Record **3 full takes**, then pickups of any line you fumbled. Read ~10% slower than feels
  natural; nerves speed everyone up.
- Target **28 seconds of speech**. Time it with a stopwatch before you commit.
- Free cleanup: run the file through **Adobe Podcast Enhance** (free, browser) — one pass makes a
  phone recording sound broadcast-grade. Audacity noise reduction is the offline alternative.
- Voice sits loud and clear at the front; if you add music, keep it around 10% and duck it further
  under every line.

## 5. Presenter's hand-off (protects your 2B marks)

The 30s of video is scored under 2A, not 2B. Bracket it so your own delivery still shows:

> **Before (spoken live, then stop talking):** "Rather than describe it — here's SafeSteps in
> thirty seconds."
>
> *[video plays, presenter silent, facing the audience not the screen]*
>
> **After (spoken live):** "So: the consequence lands before the lecture does, every claim is
> sourced, and it ends with the player changing a real setting on their own phone."

Practise the *silence*. Standing still and composed for 30 seconds while a video plays reads as
confidence; fidgeting with the laptop reads as the opposite, and body language is explicitly marked.

## 6. Production checklist

**Order of work — do not reshuffle**
1. Lock the script (§3), read aloud with a stopwatch
2. Record and clean the VO
3. Lay VO on the timeline
4. Record the screen capture
5. Cut picture to the audio
6. Subtitles, 2 callouts, freeze frame
7. Export, embed, test in the room

**Screen capture setup**
- [ ] Chrome, new window, no bookmarks bar, no visible extensions; `F11` fullscreen
- [ ] Zoom 110–125%; hard-refresh so no animation is cached
- [ ] Windows Settings → Accessibility → Mouse pointer: bigger, **coloured** pointer so it's
      trackable on a projector
- [ ] Fresh game state — the video must open on the title screen at 0/4 chapters
- [ ] OBS Studio (cleanest) or `Win`+`G`; 1080p/30fps, display capture
- [ ] Mouse moves **slowly**, ~0.5s pause before every click, no jiggle
- [ ] Capture 45–60s of raw footage plus a separate take of shot 5 alone (most taps); you're
      cutting *down* to 30s

**Edit** (Clipchamp ships with Windows 11; CapCut also fine)
- [ ] Trim dead air between clicks — that's where the 30s comes from
- [ ] Speed the opening move (shot 1) to ~1.25×; keep shots 3 and 5 at 1.0×
- [ ] Subtitles in the game's own accent colour (chapter 1 purple `#a78bfa`) so video and deck match
- [ ] Zoom push in shot 3; circle callout on the delta chips
- [ ] Freeze final frame + `adecentname.github.io`
- [ ] Export 1080p H.264 mp4; confirm it reads 0:30

**Deck integration and the audio test**
- [ ] Insert → Video → **This Device** (embedded, so it survives the wrong laptop)
- [ ] Playback: Start **Automatically**; uncheck *Rewind after Playing* so the last frame holds
- [ ] **Test sound through the actual room's HDMI/projector**, at presentation volume, with the
      laptop unmuted and Windows output set to the right device. Do this before pitch day, not on it.
- [ ] Hidden backup slide with 5 stills (shots 1, 3, 4, 5, 6) in case AV fails entirely
- [ ] Copy the mp4 to a USB alongside the deck

## 7. Rubric mapping (for the deck and Q&A)

| ASG 2A criterion | Which shots earn it |
|---|---|
| **Value** — addresses the problem and key root causes relevant to the DQ | 2–3: teens don't feel the cost of a privacy setting until it's too late; the game makes that consequence immediate and survivable |
| **Feasibility** — persuasive evidence it works in the real world | 4 (cited sources), 6 (already deployed, browser-based, zero install, free hosting — a school could run it tomorrow) |
| **Creativity** — novel and unique features | 5: an interactive imitation of the *real* Instagram privacy path plus the stranger's-eye view — it teaches the setting **and** has the player perform it |
| **Overall quality & cohesiveness** | 1 and 6: one consistent metric/meter system across all four IMDA actions, not four disconnected mini-games |

| ASG 2B criterion | How this version serves it |
|---|---|
| Visual aids that strongly support and enhance the pitch | Self-contained, subtitled, exactly 30s, ends on a frozen frame the presenter can talk over |
| Vocal delivery / body language | Protected by the scripted bracket in §5 — and by rehearsing the 30s of stillness |
| Audience engagement | Final frame is a live URL; invite the panel to play it during Q&A |
| Q&A understanding | Know cold: what each metric does, why the video shows the *wrong* choice, and the source of every stat |

## 8. Two things to settle before recording

1. **Team name / class on the end frame?** Not needed — the title slide covers it, and it competes
   with the URL. Skip unless your tutor asks.
2. **Gen-AI declaration (Annex 1).** Anything AI touched must be declared with the prompt and how
   the output was used: a drafted or polished VO script (statements 3 and/or 5), an AI-generated
   voice (statement 5 — another reason to record a real one), AI-generated music, or AI-written
   subtitles. Non-submission of the declaration form is **−5%**.
