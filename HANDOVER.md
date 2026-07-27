# SafeSteps — handover

Last updated **27 July 2026**. Written so someone who has never opened this repo
can run it, change it, read its data, and film it.

**Live:** <https://adecentname.github.io/>
**What it is:** a browser choose-your-path game teaching IMDA's four key
online-safety actions, built for the PROID project. React + Vite, deployed to
GitHub Pages on every push to `main`. No backend, no accounts, no login.

---

## 1. Status at handover

| Piece | State |
|---|---|
| The game — 4 chapters, 15 decisions, 63 options, 11 fact cards, 4 walkthroughs | **Done and live** |
| Reflection self-check before the final results | **Done** — the three questions from the project plan |
| Anonymous usage counters | **Done and live**, posting to a Google Sheet |
| Dashboard that aggregates the counters | **Done** — Apps Script, run from a menu in the Sheet |
| Repeatable capture script for the pitch video | **Done**, not yet used for a real take |
| The 60-second pitch video | **Planned, not filmed** — see §6 |
| A real pilot with actual students | **Not started** — see §7 |

---

## 2. Run it

```bash
npm install
npm run dev        # open the printed http://localhost:5173
npm run build      # production build into dist/
node scripts/validate-scenes.mjs   # check the scene graph after editing content
```

Push to `main` and GitHub Actions builds and publishes automatically
(`.github/workflows/deploy.yml`). Nothing else to do.

---

## 3. Repo map

```
src/
  data/         metrics.js · chapters.js (the 4 chapters + meters) · scenes.js (all content)
  game/         reducer.js (state machine) · GameContext.jsx · scoring.js (% and tiers)
  engine/       SceneEngine.jsx — renders whatever scene you are on
  components/   Title, Hub, DialogueBox, ChoiceList, InfoPanel, PhoneMock,
                FeedbackModal, ScoreHUD, ChapterEndScreen, ReflectionScreen, EndingScreen
  analytics.js  anonymous counters (off unless an endpoint is configured)
scripts/
  validate-scenes.mjs    scene-graph integrity check — run after editing content
  capture-clips.mjs      drives a filmable playthrough for the video (§6)
  seed-analytics.mjs     posts fake sessions so the dashboard can be tested (§5)
docs/
  analytics.md           the counters: what they collect, endpoint setup, how to read
  dashboard.gs           paste-into-Apps-Script aggregator
  pitch-video-plan.md    the 60-second video: shot list, script, capture notes
```

---

## 4. Editing the game

All content is in `src/data/scenes.js`. A scene is one of three shapes:

- **decision** — `choices[]`, each with `effects` (score changes) and `feedback`
  (the teaching moment shown in the modal)
- **info panel** — `intro` / `didYouKnow` / `tutorial` / `resources`, advancing
  via `next`
- **terminus** — ends the chapter

Score bounds are derived from the scenes automatically, so `scoring.js` needs no
tuning when you add or remove options. **Run `node scripts/validate-scenes.mjs`
after any content edit** — it catches unreachable scenes and dangling `next` ids,
which are otherwise a blank screen in the browser.

The four chapters and their meters live in `src/data/chapters.js`. Chapter ids
are referenced by scene prefixes (`b_`, `t_`, `r_`, `s_`), so do not rename them.

---

## 5. The data

Read `docs/analytics.md` first — it is the full reference. Short version:

**What is collected.** Anonymously: which chapters were opened and finished,
which scene the player was on, which option they picked and whether it scored
good/mixed/risky, how far they got through a report walkthrough, and the chapter
percentage at the end. **Never**: names, emails, IP addresses, or anything typed
into the reflection screen. The only identifier is a random per-tab id.

Say "no accounts, nothing personal collected" — **not** "no data collected".

**Where it goes.** `VITE_ANALYTICS_URL` → a Google Apps Script web app → a
Google Sheet. The URL is stored as the `ANALYTICS_URL` repository secret and
injected at build time. With no secret set, the build ships with counters
disabled and the game posts nothing — that is the default for forks and local dev.

**The Sheet and the script project are not linked here on purpose** — ask the
team for them rather than putting them in a public repo. The `events` tab is the
raw log; the `dashboard` tab is the readable report.

**Reading it.** In the Sheet: **SafeSteps → Rebuild dashboard**. You get headline
numbers, a scene funnel with the worst drop flagged, first-attempt correct rate
per scenario, walkthrough completion, and per-chapter scores. The three numbers
worth reporting:

1. **Report-walkthrough completion rate** — evidence for root cause 3, because it
   is a rehearsed action rather than a claim about awareness.
2. **First-attempt correct rate, chapter 1 vs chapter 4** — a learning curve out
   of data the game already scores.
3. **Finish rate** — whether the format holds attention, which is the premise of
   the entire solution.

**Testing without polluting the numbers.** Play with `?test=1` on the URL and
every row is flagged; the normal rebuild excludes them. To see a full-looking
report before real players exist:

```bash
node scripts/seed-analytics.mjs 40     # 40 fake sessions, all flagged test
DRY=1 node scripts/seed-analytics.mjs 40   # build them, send nothing
```

then **SafeSteps → Rebuild including test rows**, and **Delete all test rows**
when finished.

---

## 6. The pitch video

`docs/pitch-video-plan.md` is the working plan: 1920×1080 landscape for
presentation playback, gameplay footage for almost the whole minute, a
shot-by-shot table with the exact voice-over, and the reasoning behind each beat.

Beats 4–6 are the deliverable — one per root cause, each stating *why the design
defeats that belief* rather than narrating what is on screen. If time forces a
cut, cut the measurement beat, never those three.

`npm run capture` drives a filmable playthrough automatically (deterministic
route, drawn cursor, click ripples) and writes `capture/clip-markers.json` with
timecodes for every clip in the plan. Needs `npm i -D playwright && npx
playwright install chromium` once. It has not been used for a real take yet, so
expect to fix a selector or two.

**Do not put numbers from the dashboard on screen without a visible sample size.**
There has been no pilot yet; showing seeded data as results is the fastest way to
lose a judge's trust.

---

## 7. What is left

1. **Run a pilot.** One class, real players, no `?test=1`. Everything above is
   instrumentation with almost nothing in it.
2. **Pre / post / 4-week survey.** Re-run Q8, Q9 and Q10 from the primary survey
   around the pilot. The shift on the Q10 barrier items ("too troublesome",
   "reporting seems ineffective") is the headline result, because those items
   measure the root causes in the project's own words.
3. **A comparison group** — one class plays the game, one gets the standard talk,
   same post-survey. This is what makes the claim causal instead of anecdotal.
4. **Film the video.** Plan is ready; capture script is ready; nothing is shot.
5. **Decide on the reflection screen.** It currently teaches (forced recall) but
   collects nothing. Shortening it to tap-to-select chips would cut the typing
   friction on mobile without losing the recall.

---

## 8. Things that will bite you

- **Editing the Apps Script does nothing until you redeploy.** Save is not
  publish: **Deploy → Manage deployments → pencil → Version: New version**. The
  URL stays the same. This has already cost us an afternoon once.
- **The dashboard is a snapshot.** It only changes when `buildDashboard` runs
  from the menu or a time trigger. Playing the game does not update it.
- **`?test=1` rows are invisible to the normal rebuild.** That is the point, but
  it looks exactly like "the analytics are broken" — check the diagnostic line at
  the top of the dashboard, which says how many rows are flagged.
- **Events are batched.** They send after ~10s of quiet, every 25 events, or when
  the tab is hidden or closed. Nothing appears the instant you click.
- **Analytics failures are invisible in the browser console** (the request is
  `no-cors` on purpose). Debug from **Apps Script → Executions** instead.
- **Pushing changes to `.github/workflows/` needs a token with `workflow` scope.**
  If a push is rejected for that reason: `gh auth refresh -h github.com -s workflow`.
- **The endpoint URL is not a secret.** It ships inside the public JS bundle
  either way; the repository secret only keeps it out of git history.
- **The scene validator is not optional.** A dangling `next` renders a blank
  screen with no error.

---

## 9. Provenance

Content follows the team's game plan one-to-one — every scenario, consequence,
bonus question, tutorial and "Did You Know?" fact. The four chapters use IMDA's
official action names in IMDA's order. IMDA writes the fourth action
("Engage & Support") for parents; here it is played from a teenager's point of
view. The final scenario's self-harm option is written responsibly: no methods, a
clear message that it is not the answer, and an immediate redirect to Singapore
crisis helplines. Do not soften or remove those helplines when editing.
