# SafeSteps — 60-second pitch video: complete plan and script

**Canonical plan.** Supersedes `video plan.md`, `video plan (voiceover).md` and
`video plan (organiser pitch).md`. Self-contained — you shouldn't need the earlier drafts.

Audience: organisers (IMDA / schools / youth agencies) and the ASG 2 assessment panel.
Length: 60s. Voiceover: yes, one human voice, 148 words.
The script alone, formatted for the person recording it, is in `VO script.md`.

---

## 1. The argument the video has to make

The root cause we're addressing is **youths not knowing the four key online-safety actions.**
The video has to answer *why they don't know* — because that's what makes the solution
non-obvious. Three failures, each answered by a specific mechanic:

| Why youths don't know the four actions | What SafeSteps does about it | Where it's visible |
|---|---|---|
| **The actions are abstract labels.** "Set boundaries online" is a phrase on a poster, attached to no memory. | Each action becomes a chapter of lived scenarios with its own named score — *Boundary Meter*, *Digital Citizenship Score*. The label attaches to a story and a number. | Beats 3, 8 |
| **Knowing ≠ doing.** A teen can recite "keep your account private" and still not know where the setting is. | Four walkthroughs of the real apps. The player performs the taps — Instagram privacy, then reporting on TikTok, YouTube and Instagram. | Beat 6 |
| **Real life has no feedback loop.** Oversharing costs you months later, invisibly and unrecoverably — so nothing teaches the lesson. | The game compresses the delay to three seconds and makes it survivable: choose, then watch the consequence arrive, scored. | Beats 4, 5 |

The third row is the pitch's core claim. **Awareness campaigns tell; SafeSteps rehearses.**
And the near-miss scoring (beat 5) corrects the single most common false belief — that not
joining in is the same as taking action.

## 2. What's actually in the game (all verified in the source)

Use these numbers; they're counted, not estimated.

| | |
|---|---|
| Chapters | **4** — IMDA's four actions, official names, IMDA's order |
| Scenarios | **12** (3 per chapter) |
| Scenes | **38** |
| Decision points | **15**, including **2 ⭐ bonus questions** (2FA; reporting to authorities) |
| Total choices | **63** |
| Scoring metrics | **7** — 🔒 Privacy · 🛡️ Safety · ❤️ Wellbeing · 🧠 Awareness · 🌐 Responsibility · 🌐 Digital Citizenship · 🤝 Support |
| "💡 Did You Know?" fact cards | **11** |
| Cited sources, linked on screen | **14** |
| Real-app walkthroughs | **4** — Instagram privacy · TikTok / YouTube / Instagram reporting |
| Themed meters with tiers | **4** — 🔥 Boundary Meter · 🌐 Digital Citizenship Score · 👣 Digital Footprint Score · 💚 Support Score |
| Network calls / accounts / analytics / stored data | **0** (no `fetch`, no analytics, no `localStorage` anywhere in `src/`) |

**Mechanics worth naming in the pitch:**

- **Consequence-first loop.** Scenario → choice → *the story of what happens days later* → verdict
  (✅ Safe move / 🟡 Could be safer / ⚠️ Risky move) → metric deltas → fact card → walkthrough.
- **Graded, multi-metric scoring — not right/wrong.** `Nancy2005` is Safety −5, not −10. Commenting
  "don't do this" is Awareness **+5** *and* Responsibility **−5**. A choice can be well-intentioned
  and still harmful, and the scoreboard says so.
- **Deferred reveal.** Scores stay hidden during play. The chapter ends on *"Let's see how well you
  did"* → metric bars → the combined themed meter → a tier (*Boundary Beginner / Builder / Boss*).
- **A resource-allocation scenario, not just multiple choice.** The screen-time scenario is a whole
  day budgeted across study, group work, family dinner, soccer, TikTok Live and gaming — and it
  swings Wellbeing by **±30**, three times a normal choice. Priorities, not trivia.
- **Safeguarding designed in.** The cyberbullying scenario's hardest option carries no methods and
  routes straight to SOS 1767, IMH 6389 2222, Tinkle Friend 1800 274 4788, the National Anti-Scam
  Hotline 1799, and 999/995.
- **Evidence and theory, cited on screen.** SPF (179 scam reports, ≥ S$399,000), MDDI, IMH/CNA,
  Lancet Regional Health – Americas, plus Social Influence Theory (compliance / identification /
  internalisation) explaining *why* harmful trends spread.
- **Content is data, not code.** Scenarios live in `src/data/scenes.js` with
  `scripts/validate-scenes.mjs` checking the scene graph — a new scam or deepfake trend ships
  without touching application code.

---

## 3. The script

**148 words · ~2.5 words/sec · second person · one human voice.** Read the numbers slowly; they're
the credibility and they're the easiest thing to fumble.

### ACT 1 — The root cause (0:00–0:17)

**Beat 1 · 0:00–0:06 · 15 words**
> "Ask a teenager to name IMDA's four online-safety actions. Most can't. They've seen the posters."

*Visual:* the four action names as flat poster-style text on the game's dark background — deliberately
static and dull. Then it dissolves into the SafeSteps title screen, where the same four names sit as
live chapter pillars. The dissolve is the thesis: same content, different delivery.

**Beat 2 · 0:06–0:11 · 14 words**
> "Posters tell you a rule. They never let you feel what breaking it costs."

*Visual:* hold on the title screen's four pillars. Let it breathe — this line carries the whole pitch.

**Beat 3 · 0:11–0:17 · 15 words**
> "SafeSteps is a browser game that turns all four actions into decisions you live through."

*Visual:* click **Start playing** → the four chapter cards. Kicker text bottom-left:
`4 chapters · 12 scenarios · 63 choices`

### ACT 2 — Mechanics (0:17–0:32)

**Beat 4 · 0:17–0:25 · 17 words**
> "Twelve scenarios, sixty-three choices. Go public, and days later the strangers arrive — Privacy,
> Safety, Wellbeing all drop."

*Visual:* Scenario 1 → click **🌍 Set your account to Public** → **⚠️ Risky move** modal → push down
onto the chips `🔒 −10 ❤️ −10 🛡️ −10`. Land the push on the word "drop."

**Beat 5 · 0:25–0:32 · 15 words**
> "It scores near-misses too. Commenting 'don't do this' raises awareness — and still spreads the video."

*Visual:* the shoplifting scenario → **`B · Comment "Don't do this."`** → 🟡 *Could be safer* with
`🧠 +5` and `🌐 −5`. **Keep the choice label and both chips in one frame.** The contradiction has to
read in five seconds.

### ACT 3 — Special features (0:32–0:46)

**Beat 6 · 0:32–0:40 · 19 words**
> "Then it closes the real gap — walkthroughs of the actual apps. Go private, and see what a stranger
> sees."

*Visual:* the Instagram mockup, four taps: ☰ → **Account privacy** → toggle **Private** ON → 👀 →
*"This account is private."* Hold 0.5s on that final state. Then a fast 1s triple-cut of the TikTok,
YouTube and Instagram reporting walkthroughs. Kicker: `4 real-app walkthroughs`

**Beat 7 · 0:40–0:46 · 16 words**
> "Eleven fact cards. Fourteen cited sources. Singapore police figures, and the psychology of why
> trends spread."

*Visual:* a Did You Know card — the SPF figure (179 reports, ≥ S$399,000) — punch in on
`Source: … ↗`, then cut to the Social Influence Theory card.

### ACT 4 — Outcome and adoptability (0:46–1:00)

**Beat 8 · 0:46–0:53 · 19 words**
> "Scores stay hidden until the end. Then four meters reveal whether you're a Boundary Boss — or a
> Digital Guardian."

*Visual:* *"Let's see how well you did"* → the metric bars filling → the 🔥 Boundary Meter and its
tier → the final results screen with all four meters.

**Beat 9 · 0:53–1:00 · 18 words**
> "No install, no accounts, no data collected. Free to host. The helplines are built in. Ready to
> pilot."

*Visual:* the Support & Resources card (SOS 1767, IMH, Tinkle Friend, 999/995) held ~2s on
"helplines are built in" — then the freeze frame: `adecentname.github.io` with
`browser · no accounts · no tracking · free to host`.

### Word budget per beat

| Beat | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | Total |
|---|---|---|---|---|---|---|---|---|---|---|
| Seconds | 6 | 5 | 6 | 8 | 7 | 8 | 6 | 7 | 7 | **60** |
| Words | 15 | 14 | 15 | 17 | 15 | 19 | 16 | 19 | 18 | **148** |

**If you run long,** trim in this order: beat 7 → "Fourteen cited sources, including Singapore police
figures." (8) · beat 3 → "SafeSteps turns all four into decisions you live through." (10) · beat 1 →
"Ask a teenager to name IMDA's four safety actions. Most can't." (11). **Never trim beats 2, 5 or 6** —
they are the thesis, the distinctive mechanic, and the root-cause answer.

---

## 4. Recording the voiceover

Do this **first**. Lay the VO on the timeline, then cut picture to the words — never the reverse, or
the last beat always ends up rushed.

- **Who:** the clearest, steadiest speaker — but **not** whoever presents that slide. Hearing the
  same voice recorded then live is jarring, and it wastes a chance to feature a second member.
- **Use a real voice, not AI.** More authentic for a youth-safety pitch, and one less thing to
  declare and defend in Annex 1.
- Quietest room, soft furnishings, curtains closed. **Aircon and fans off** — their hum ruins more
  student VO than anything else.
- Phone voice memo is fine: ~15cm away, slightly **off-axis** so plosives don't thump. Do Not Disturb
  on. Clap once before each take for sync.
- **3 full takes**, then pickups for any fumbled line. Read ~10% slower than feels natural — nerves
  speed everyone up, and this script has numbers in it.
- Target **57 seconds of speech in the 60-second frame**. Stopwatch it before you commit.
- Free cleanup: **Adobe Podcast Enhance** (browser, free) makes a phone recording sound
  broadcast-grade in one pass. Audacity noise reduction is the offline fallback.
- Music optional, instrumental, ~10%, ducked under every line. Cut it entirely if in doubt.

## 5. ⚠️ Record from latest — the live site is rolled back

`adecentname.github.io` currently serves `7b20405`, which **has no `PhoneMock.jsx`**. Beat 6 — the
root-cause answer — does not exist there, and the title screen and chapter data differ.

**Option A · record latest locally, leave the rollback alone:**
```bash
git worktree add ../SafeSteps-latest pre-revert-latest
cd ../SafeSteps-latest && npm install && npm run dev
```
Record in fullscreen (`F11`), which hides the address bar — `localhost` never appears.

**Option B · roll the site forward first, then record the real URL:**
```bash
git revert b20381b && git push
```
Choose this if you want the address bar visible as proof it's deployed.

Either way, **beat 9's end frame shows that URL and the claim is only true once you've rolled
forward** — so roll forward before pitch day regardless.

## 6. Screen capture

- Chrome, new window, no bookmarks bar, no visible extensions, `F11` fullscreen.
- **Browser zoom 110–125%** (`Ctrl` `+`). Text sized for a laptop is unreadable projected.
- Hard-refresh before each take so no animation is cached mid-state.
- Windows Settings → Accessibility → Mouse pointer: **larger, coloured** pointer so it tracks on a
  projector. The cursor is evidence of interactivity in beats 4–6; keep it out of frame elsewhere.
- **OBS Studio** (cleanest) or `Win`+`G`. 1080p, 30fps, display capture.
- Move the mouse slowly; pause ~0.5s before every click; no jiggle.
- **Capture beat by beat, in any order.** This is a montage, not a playthrough — you can reshoot one
  claim without redoing the run. Shoot beat 6 separately; it has the most taps.
- Fresh game state for beats 1–3 (title screen, 0/4 chapters). You'll need a *completed* run for
  beat 8's final results screen — play all four chapters once before shooting that beat.

## 7. Edit

- Trim dead air between clicks. That's where 90 seconds of footage becomes 60.
- Speed navigation (beats 1, 3) to ~1.25×. Keep beats 5, 6 and 8 at 1.0×.
- **Punch-ins are mandatory, not stylistic:** the delta chips (beats 4, 5) and the source link
  (beat 7) are small UI. Assume the projector is worse than your monitor.
- **Kicker text for every spoken number** — `63 choices`, `4 real-app walkthroughs`,
  `14 cited sources`. Spoken numbers don't stick; seen-and-heard numbers do.
- **Burn in subtitles.** Plenty of classroom HDMI setups output no sound; subtitles mean the video
  still argues its case, and the presenter can pick up the script live.
- Style subtitles and kickers in the game's own accents (`#a78bfa` purple, `#ff5470` red) so video
  and deck read as one system.
- Freeze the final frame so it holds while the presenter talks.
- Export 1080p H.264 .mp4. Confirm the duration reads 1:00.

## 8. Presenter's hand-off (protects your ASG 2B marks)

The video is scored under 2A, not 2B — a full minute of silence is a long time to earn nothing.
Bracket it:

> **Before:** "Rather than describe it — here's SafeSteps in sixty seconds."
>
> *[video plays · presenter silent, facing the audience, not the screen]*
>
> **After:** "So: the consequence lands before the lecture does, every claim is sourced, and it ends
> with a teenager changing a real setting on their own phone."

**Rehearse the stillness.** Standing composed for sixty seconds reads as confidence; fidgeting with
the laptop reads as the opposite, and body language is explicitly marked.

## 9. Deck integration

- One slide, under **Solution features**. Video fills ~80%; the DQ and problem framing stay on
  earlier slides. Deck cap is 25 slides excluding title and references.
- Insert → Video → **This Device** — embedded, never linked, so it survives the wrong laptop.
- Playback: Start **Automatically**; uncheck *Rewind after Playing* so the last frame holds.
- **Test sound through the actual room's projector/HDMI** at presentation volume, with the laptop
  unmuted and Windows output on the right device. Before pitch day, not on it.
- Hidden backup slide with 6 stills (beats 1, 4, 5, 6, 7, 9) in case AV fails entirely.
- Copy the .mp4 to a USB alongside the deck.

## 10. Q&A ammunition

| They'll ask | Answer |
|---|---|
| Whose framework? | IMDA's four key online-safety actions — official names, IMDA's order |
| Evidence base? | 14 sources linked on screen: SPF (179 reports, ≥ S$399k), MDDI survey, IMH/CNA, Lancet Regional Health – Americas, SafeHome, PMC screen-time review |
| Theory? | Social Influence Theory (compliance / identification / internalisation) for why harmful trends spread; Interpersonal Theory of Suicide for cyberbullying harm |
| Data and privacy? | No accounts, no analytics, no storage, no network calls. The app mockups connect to nothing and collect nothing |
| Safeguarding for minors? | Hardest option carries no methods and redirects immediately to SOS 1767 / IMH / Tinkle Friend / 999-995 |
| Measuring impact? | 7 metrics → 4 chapter meters + a combined score; usable as a pre/post instrument |
| Running cost? | Static hosting, free tier. No licences, no backend, no per-seat cost |
| Can we extend it? | Scenarios are data in `scenes.js`, with a scene-graph validator. New scam, new trend, same-day ship |
| Why not just a quiz? | A quiz can't score a near-miss. Beat 5 — good intention, harmful effect — is the lesson quizzes structurally cannot teach |

## 11. Rubric mapping and Annex 1

| ASG 2A criterion | Evidence in the video |
|---|---|
| **Value** — addresses the problem and its root causes | Beats 1–2 name the root cause; beats 4–5 show the mechanism that answers it |
| **Feasibility** — persuasive evidence it works in the real world | Beats 7 and 9: cited evidence, already deployed, zero install, no backend, free hosting, helplines built in |
| **Creativity** — novel and unique features | Beats 5 and 6: graded near-miss scoring, and interactive walkthroughs of the real apps |
| **Overall quality and cohesiveness** | Beats 3 and 8: 7 metrics resolving into 4 themed meters across all four actions — one system, not four mini-games |

| ASG 2B criterion | How this serves it |
|---|---|
| Visual aids that strongly support the pitch | Self-contained, subtitled, exactly 60s, freezes on a frame the presenter can talk over |
| Vocal delivery and body language | Protected by §8's bracket — and by rehearsing the minute of stillness |
| Audience engagement | Final frame is a live URL; invite the panel to play it during Q&A |

**Annex 1.** If AI drafts or polishes the VO script, generates the voice, writes subtitles or makes
music, declare it (statements 3 and/or 5) with the prompt and how the output was used.
Non-submission of the declaration form is **−5%**.
