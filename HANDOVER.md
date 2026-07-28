# SafeSteps — handover

Last updated **27 July 2026**. Written so someone who has never opened this repo
can run it, change it, read its data, and film it.

**Live:** the Cloudflare Worker URL printed by the first deploy — set it here once
you have it (`https://safesteps.<subdomain>.workers.dev`).
**What it is:** a browser choose-your-path game teaching IMDA's four key
online-safety actions, built for the PROID project. React + Vite, served by a
single Cloudflare Worker that also handles the anonymous usage counters, deployed
on every push to `main`. No accounts, no login, nothing personal collected.

---

## 1. Status at handover

| Piece | State |
|---|---|
| The game — 4 chapters, 15 decisions, 63 options, 11 fact cards, 4 walkthroughs | **Done and live** |
| Reflection self-check before the final results | **Done** — the three questions from the project plan |
| Anonymous usage counters | **Done**, posting same-origin to the Worker |
| Hosting + analytics backend — one Cloudflare Worker, D1, hourly purge | **Built, never deployed** — `worker/README.md` §1 is the from-scratch setup |
| Dashboard page at `/dashboard/` | **Built** — key-gated, aggregates only |
| Repeatable capture script for the pitch video | **Done**, not yet used for a real take |
| The 60-second pitch video | **Planned, not filmed** — see §6 |
| A real pilot with actual students | **Not started** — see §7 |

---

## 2. Run it

```bash
npm install
npm run dev        # the game alone, at the printed http://localhost:5173
npm run build      # production build into dist/
node scripts/validate-scenes.mjs   # check the scene graph after editing content

cd worker && npx wrangler dev      # game + dashboard + API together, one port
cd worker && npm test              # the analytics aggregation checks
```

Push to `main` and GitHub Actions builds, tests, migrates and deploys the Worker
automatically (`.github/workflows/deploy.yml`). Nothing else to do — but the
**first** deploy needs a one-time Cloudflare setup: `worker/README.md` §1.

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
  dashboard/    the reporting page served at /dashboard/
worker/         the analytics backend — Cloudflare Worker + D1
  README.md              setup, deployment, and the things that will bite you
  src/index.js           /collect · /dashboard.json · /health · hourly cron
  src/aggregate.js       folds settled sessions into agg_*, deletes raw rows
  migrations/            D1 schema
scripts/
  validate-scenes.mjs    scene-graph integrity check — run after editing content
  capture-clips.mjs      drives a filmable playthrough for the video (§6)
  seed-analytics.mjs     posts fake sessions so the dashboard can be tested (§5)
docs/
  analytics.md           the counters: what they collect, how to read them
  dashboard.gs           LEGACY Apps Script aggregator, superseded by worker/
  pitch-video-plan.md    the 60-second video: shot list, script, capture notes
```

The game builds to two pages, not one: `index.html` (the game) and
`dashboard/index.html` (the report). Both come out of the same `npm run build`.

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

**Where it goes.** The game posts to `/collect` on its own origin — the same Worker
that served it — and the Worker writes to D1. Relative path, so there is no URL to
configure and no CORS. Local dev posts nothing unless you set
`VITE_ANALYTICS_URL` in `.env.local`. Everything about the backend is in the repo
under `worker/`, so there is no account-shaped hole in this handover:
`worker/README.md` §1 is a from-scratch setup.

**Reading it.** `https://<the Worker URL>/dashboard/` — paste the
`DASHBOARD_KEY` once and it is remembered on that machine. You get headline
numbers, a scene funnel with the worst drop flagged, first-attempt correct rate
per scenario, walkthrough completion, and per-chapter scores. Or
`curl "…/dashboard.json?key=…"`.

**Raw events are purged on a schedule.** Every hour the Worker's cron folds
sessions quiet for 45 minutes into the permanent `agg_*` tables and deletes their
raw rows, in one atomic D1 batch. `events` never grows without bound and the
dashboard keeps working indefinitely, with nothing to click. The cost: after a
purge you can only compute the metrics `agg_*` already stores, so **add any new
metric before the data it needs is purged**.

**The old Google Sheet pipeline is superseded.** `docs/dashboard.gs` and the Apps
Script half of `docs/analytics.md` are kept only for reading the historical Sheet.

The three numbers worth reporting:

1. **Report-walkthrough completion rate** — evidence for root cause 3, because it
   is a rehearsed action rather than a claim about awareness.
2. **First-attempt correct rate, chapter 1 vs chapter 4** — a learning curve out
   of data the game already scores.
3. **Finish rate** — whether the format holds attention, which is the premise of
   the entire solution.

**Testing without polluting the numbers.** Play with `?test=1` on the URL and
every row is flagged. Flagged rows are purged with everything else but never
counted, so your own checks can never move the numbers.

To see a full-looking report before real players exist:

```bash
node scripts/seed-analytics.mjs 40     # 40 fake sessions, all flagged test
DRY=1 node scripts/seed-analytics.mjs 40   # build them, send nothing
```

then follow `worker/README.md` §5 — briefly: set `AGGREGATE_TEST_ROWS = "true"` in
`worker/wrangler.toml`, deploy, trigger `/admin/aggregate`, read the dashboard,
then **set it back and reset the aggregates** (§6 there). Seeded sessions folded
into the real totals cannot be subtracted again once their raw rows are purged —
resetting is the only way back.

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

- **`worker/README.md` §7 is the backend's own list of traps.** Read it before
  touching anything under `worker/`.
- **Aggregation is not reversible.** Raw rows are deleted once folded into `agg_*`.
  The D1 batch makes it atomic, so a crash cannot half-apply it — but a wrong
  *metric definition* shipped for a week is a week of numbers you cannot recompute.
- **The last ~45 minutes of play is never in the dashboard.** Sessions must be
  quiet for `SETTLE_MINUTES` before they are aggregated, so a session can never
  be split across two runs. Just-finished playthroughs show up on the next hourly
  run — the diagnostic line at the top says how many rows are still waiting.
- **`?test=1` rows are never counted.** That is the point, but it looks exactly
  like "the analytics are broken" — check the diagnostic line, which reports
  sessions aggregated, rows purged, and rows still settling.
- **`npm run build` now emits two pages** — the game and `/dashboard/`. If you
  change `vite.config.js`, keep both entries or the dashboard silently vanishes.
- **`wrangler deploy` uploads whatever is in `dist/`.** Deploying by hand without
  building first ships a stale site. CI always builds fresh.
- **`*.workers.dev` is blocked on some school networks.** The game itself is served
  from there now, so a blocked network means students cannot play at all — not just
  that analytics go missing. Test on the school's own wifi before a pilot, or put a
  custom domain in front (`worker/README.md` §7).
- **Events are batched.** They send after ~10s of quiet, every 25 events, or when
  the tab is hidden or closed. Nothing appears the instant you click.
- **Analytics failures are visible in the browser console now.** The Worker
  returns proper CORS headers, so the client posts with `mode: 'cors'` and a
  broken endpoint shows up where you would expect. This was impossible with Apps
  Script. Server side: `cd worker && npx wrangler tail`. If you ever point
  `VITE_ANALYTICS_URL` back at an Apps Script `/exec` URL, `src/analytics.js` must
  go back to `no-cors` or every post fails.
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
