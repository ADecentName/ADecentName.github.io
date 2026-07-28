# SafeSteps — 30-second organiser pitch video (with voiceover)

Supersedes `video plan.md` and `video plan (voiceover).md`, which both planned a chronological
walkthrough. Same length and VO, different genre.

## 1. Why this is a different video, not a re-edit

A walkthrough answers *"how do you play it?"* Organisers aren't asking that. They're asking
**"does this fit our framework, will it actually change behaviour, and can we deploy it?"**

So the structure changes from chronological to **claim-driven**. The cut is a montage, not a
playthrough, and the governing rule is:

> **One claim per beat, every claim proved by what's on screen.** Never show a UI element that
> isn't evidence for the sentence being spoken.

That also means footage gets recorded **out of order, beat by beat** — you are not capturing one
continuous session any more.

## 2. The six claims

| # | Claim | Proof on screen | Why an organiser cares |
|---|---|---|---|
| 1 | Covers **all four IMDA actions**, official names, IMDA's order | Title screen with the four pillars → chapter grid | Maps onto a framework they already endorse — nothing new to justify |
| 2 | **Consequence-first, not a quiz** | Choice → ⚠️ *Risky move* → the story of what happens days later → `🔒 −10 ❤️ −10 🛡️ −10` | Knowledge doesn't change behaviour; rehearsing the consequence does |
| 3 | **Scores near-misses, not just right and wrong** | "Comment *Don't do this*" → `🧠 +5` **and** `🌐 −5`, verdict *Could be safer* | The pedagogically distinctive claim — it teaches that good intentions can still amplify harm. A right/wrong quiz cannot express this. |
| 4 | **Learn it, then actually do it** | Instagram privacy mockup: 4 taps to *Private*, then the stranger's-eye view (plus TikTok / YouTube / Instagram reporting walkthroughs) | Behaviour change on the real platforms, not recall |
| 5 | **Singapore-specific and cited** | Did You Know card with the SPF figure — 179 reports, ≥ S$399,000 — and a visible `Source: … ↗` | Evidence-based and locally defensible to their own stakeholders |
| 6 | **Deployable and private by design** | Results screen + caption: browser, no login, no data | Procurement reality: no install, no accounts, no PDPA exposure, no licence cost |

Claim 6 is verified, not marketing: there is no `fetch`, no analytics, no `localStorage` and no
`sessionStorage` anywhere in `src/` or `index.html`. Nothing leaves the browser. The app mockups
connect to nothing.

## 3. Shot list and VO, locked to picture

| # | In–Out | VO line | Words | Screen |
|---|---|---|---|---|
| 1 | 0:00–0:05 | "SafeSteps covers all four IMDA online-safety actions — twelve scenarios, one browser tab." | 13 | Title screen, four pillars readable → one quick move to the chapter grid |
| 2 | 0:05–0:11 | "It doesn't quiz you. You choose, then live with it: days later, the strangers arrive." | 15 | Click **🌍 Public** → **⚠️ Risky move** → push down to the three delta chips |
| 3 | 0:11–0:16 | "It scores near-misses too — good intentions that still spread harm." | 11 | The *Comment "Don't do this"* choice, then `🧠 +5` / `🌐 −5` — **label and chips in the same frame** |
| 4 | 0:16–0:22 | "Then it hands you the real thing: make your account private, see what a stranger sees." | 16 | Instagram mockup: ☰ → Account privacy → toggle ON → 👀 → *"This account is private"* |
| 5 | 0:22–0:26 | "Every statistic is Singapore-specific, cited on screen." | 7 | SPF scam figure, punch in on `Source: … ↗` |
| 6 | 0:26–0:30 | "No install, no login, no data collected. Ready to pilot." | 10 | Results screen → freeze on `adecentname.github.io` + `browser · no accounts · no tracking · free to host` |
| | | **Total** | **72** | |

Read in second person, one human voice, ~2.6 words/sec. Beat 5 is deliberately word-light so the
citation has time to land.

**Beat 3 is the smartest five seconds in the video** — it is the one thing no competing quiz app
can show. Frame the choice label and the `+5 / −5` chips together (split-screen, or a cut that
keeps the label visible) so the contradiction reads instantly: intention good, effect harmful.
If a beat has to be reshot until it's right, it's this one.

### If you run long
Trim beat 5 → "Every statistic is cited." (4 words), then beat 1 → "All four IMDA actions, twelve
scenarios." (6). Never trim beats 3 or 4 — they carry *Creativity*, the criterion with the most
headroom.

## 4. What 30 seconds cannot carry

Two claims that genuinely matter to organisers do not fit, and I'd rather name them than quietly
drop them:

- **Safeguarding.** The hardest scenario — a friend being cyberbullied, including the
  turn-the-hurt-inward option — is written with no methods and routes straight to SOS 1767,
  IMH 6389 2222, Tinkle Friend 1800 274 4788, the National Anti-Scam Hotline 1799, and 999/995.
  For anyone deploying this to minors, this is often the *first* question, not a footnote.
- **Extensibility.** Scenarios live in `src/data/scenes.js` as data, with
  `scripts/validate-scenes.mjs` checking scene-graph integrity — so a new scam or deepfake trend
  can be added and shipped without touching application code.

**Recommendation:** keep the 30s cut for the deck, and if the organiser format allows **45s**, add
these two beats verbatim:

| # | In–Out | VO line | Screen |
|---|---|---|---|
| 7 | 0:30–0:37 | "The hardest scenario routes straight to Singapore helplines. Safeguarding is designed in, not bolted on." | Support & Resources card — SOS, IMH, Tinkle Friend, 999/995 |
| 8 | 0:37–0:45 | "And scenarios are data, not code. New scam, new deepfake trend — written, validated, shipped the same day." | Split: `scenes.js` scrolling beside the resulting scenario in-game |

## 5. Production notes specific to a montage

- **Capture beat by beat**, in whatever order is convenient. No continuous session, so you can
  reshoot one claim without redoing the run.
- **Punch-ins are mandatory,** not stylistic — the delta chips (beats 2, 3) and the source link
  (beat 5) are small UI. Assume the projector is worse than your monitor.
- **The cursor is evidence** in beats 2–4 (it proves interactivity); keep it out of the way in
  beats 1, 5 and 6.
- **Never show the chapter grid twice.** Organisers read a menu once.
- Beat 6 alternative if you have time: a 3-up of the same page on phone / laptop / Chromebook sells
  "runs anywhere" faster than any caption.
- Everything else — VO recording technique, subtitles as insurance against a silent room, the
  presenter's hand-off lines, PPT embedding and the audio test — carries over unchanged from
  `video plan (voiceover).md` §4–6. Don't re-derive it.

## 6. ⚠️ Record from latest — the live site is currently rolled back

You asked me to roll `adecentname.github.io` back to `7b20405`, and that's what's live right now.
**That version has no `PhoneMock.jsx`** — so beat 4, the strongest claim in the video, does not
exist on the live site, and the title screen and chapter data differ too. Recording the live URL
today would produce a video that can't make its own case.

**Option A — record latest locally, leave the rollback alone:**
```bash
git worktree add ../SafeSteps-latest pre-revert-latest
cd ../SafeSteps-latest && npm install && npm run dev
```
Record that in fullscreen (`F11`), which hides the address bar — so `localhost` never appears.

**Option B — roll the site forward first, then record the real URL:**
```bash
git revert b20381b && git push
```
Wait for the Pages deploy, then record `adecentname.github.io`. Choose this if you want the
address bar visible as proof it's deployed.

Either way: **beat 6's end frame shows that URL, and the claim is only true once you've rolled
forward.** Roll forward before pitch day.

## 7. Q&A ammunition

| They'll ask | Answer |
|---|---|
| Whose framework? | IMDA's four key online-safety actions — official names, IMDA's order |
| What's the evidence base? | SafeHome (cyberstalking), Lancet Regional Health – Americas (violent content), SPF (179 reports, ≥ S$399k), MDDI survey, IMH/CNA, PMC screen-time review — all linked on screen |
| Data and privacy? | No accounts, no analytics, no storage, no network calls; the app mockups connect to nothing and collect nothing |
| Safeguarding for minors? | Self-harm option carries no methods and redirects immediately to SOS 1767 / IMH / Tinkle Friend / 999-995 |
| How would we measure impact? | Per-chapter meters plus a combined score — usable as a pre/post instrument |
| Running cost? | Static hosting, free tier; no licences, no backend |
| Can we extend it? | Scenarios are data in `scenes.js` with a scene-graph validator |

## 8. Assignment housekeeping

Still an ASG 2 artefact: claims 3–4 are the *Creativity* evidence, claims 5–6 the *Feasibility*
evidence, claim 1 the *Cohesiveness* evidence, and claim 2 the *Value* evidence — that mapping is
the reason to organise the video by claim rather than chronology.

If AI drafts or polishes the VO script, generates the voice, or writes the subtitles, declare it in
**Annex 1** (statements 3 and/or 5) with the prompt and how the output was used. Non-submission of
the form is −5%.
