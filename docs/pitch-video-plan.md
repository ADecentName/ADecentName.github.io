# SafeSteps — 60-second pitch video (audience: organisers / IMDA judges)

**v2.** The game is now live and instrumented, so the pitch has a fourth thing to
prove and one beat has been swapped to carry it. See *What changed from v1* at
the end.

**Goal:** in 60s, show that SafeSteps is a real, playable solution, that each of
our three root causes is answered by a specific mechanic, and that the whole
thing measures itself — proven with **gameplay footage on screen for almost the
entire minute**, not slide graphics.

**Format: 1920×1080, 16:9 landscape, 30fps, MP4 (H.264).** Played from a laptop
in a presentation. Deliver a standalone MP4; assume the venue wifi fails.

**Footage-first rule:** every beat is a real screen recording — the game itself,
and for the last proof, the live dashboard. Stat overlays sit *on top of*
footage, never as a cut away from it. The only non-gameplay frames are the final
3 seconds.

**Note on audience.** The 1-min *explainer* in the deck is for youths ("how to
play, check our IG"). This is the *pitch* cut for organisers: problem → solution
→ root-cause coverage → measurement. Same capture session, different voice-over
— record once, cut twice. The vertical IG/TikTok version is a separate reframe
done **after** this landscape edit is locked.

**Budget:** ~150 spoken words ≈ 60s at 150 wpm with pauses. Beats are
word-capped; cut a word rather than speeding up the read — beat 5 needs its
pause.

---

## Why measurement gets four seconds, and not more

From the IMDA Q&A in our own notes:

> *"IMDA has not tried gamification because **it is not measurable** but they
> are open to that idea for us."*

That is the stated objection to our whole solution type, so it cannot be absent
— but naming IMDA in the voice-over spends words on *them* when the sixty
seconds should be spent on *why the design works*. Beat 7 therefore shows the
dashboard and says one plain sentence. The judges who care about that objection
will recognise the answer without being told they asked the question, and the
full measurement stack is a Q&A answer (bottom of this doc), where it belongs.

---

## Part 1 — Capture session (do this first)

One continuous playthrough of **all four chapters** — the combined results
screen only unlocks at 4/4, and a single recording keeps size, cursor and
framing consistent. Chapters can be played in any order; use the game's own.

- **Screen:** desktop Chrome at exactly **1920×1080**, F11 fullscreen so no tab
  bar, URL bar or bookmarks bar is in frame. Never record higher and downscale;
  the game's text goes soft.
- **Browser zoom:** check at 100% first. If the scenario text reads small in a
  1920-wide window, raise browser zoom to 110–125% *before* recording — scaling
  in the browser stays sharp, scaling in the edit does not.
- **Play the plain URL, not `?test=1`** — no reason to flag the capture run, and
  one less thing to explain.
- **Pace:** natural reading speed. Speed-ramp the reading in the edit; never
  speed up the frame where a consequence or score change lands.
- **Cursor:** move deliberately. Hover the option you are *about* to reject for a
  second before clicking. Turn on cursor-highlight — a bare arrow is invisible
  on a projector.

| Clip | Scene | What to capture |
|---|---|---|
| **A** | title → Start | Title screen, one click in |
| **B** | hub | The four chapter cards, cursor panning across all four |
| **C** | `b_intro` | The "Set Boundaries Online" action card |
| **D** | `b_s1` | Public-vs-private prompt · hover Private · click **Public** · the consequence · the modal showing Privacy −10, Safety −10, Wellbeing −10 |
| **E** | `b_s1_tut` | The interactive Instagram mockup — tap Settings → Account privacy → toggle **Private** |
| **F** | `r_s1` | Click **B · Comment "Don't do this."** → the *mixed* feedback: Awareness +5, **Responsibility −5** |
| **G** | `r_s1_tut` | The TikTok mockup — share arrow → Report → pick a reason |
| **H** | `r_s1_dyk` | A Did-You-Know card scrolled to show the **cited sources** |
| **I** | `b_end` | The Boundary Meter filling, tier name landing |
| **J** | ending screen | All four meters together |
| **L** | reflection screen | The three-question self-check before the results |
| **N** | **the dashboard** | *Not the game* — a separate recording of the Sheet's `dashboard` tab: the headline block, the funnel chart, the walkthrough completion rate |

Clips D, E, F, G are the root-cause proof; **N** is the measurement proof. If
shoot time is short, capture those five first.

**Clip N is recorded separately** — same 1920×1080, browser zoom up so the
numbers are legible on a projector, scrolling slowly from the headline block to
the funnel chart.

### Automated capture — `npm run capture`

`scripts/capture-clips.mjs` plays the whole route so every take is identical.
It draws its own cursor with click ripples, hovers the option it is about to
reject, taps through the phone walkthroughs, fills the reflection screen, and
writes `capture/clip-markers.json` — timecoded in/out for every clip above
(except **N**, which is not the game).

```bash
npm i -D playwright && npx playwright install chromium   # once
npm run dev                                              # terminal 1
npm run capture                                          # terminal 2
```

It opens kiosk-fullscreen, counts down 5 seconds so you can start OBS, then
flashes one white frame at t=0. **Cut the OBS take to that flash** and the
markers line up. `SPEED=4` for a rehearsal; `MODE=video` uses Playwright's own
recorder (WebM — fine for checking the route, too soft for a projector).

The route is derived from the content, not a hard-coded click list: highest-
scoring option everywhere except two deliberate overrides — **Public** in `b_s1`
and **Comment "Don't do this"** in `r_s1`, the two clips the pitch is built on.

---

## Part 2 — Shot list / script

**The division of labour: the picture shows the scenario, the voice explains the
mechanism.** Beats 4–6 never narrate what is happening on screen — the viewer
can see the account go public and the meters drop. The voice-over spends those
seconds on *why that design defeats that root cause*, which is the thing being
marked. Never let the two say the same thing.

| # | Time | Gameplay on screen | Voice-over (say exactly this) | Edit treatment |
|---|---|---|---|---|
| 1 | 0:00–0:08 | **D** opening — the public/private prompt, cursor hesitating | "Ask a poly student to name IMDA's four online-safety actions. Most can't. The ones who can still don't act." | Cold open on gameplay, no logo. Grey out the four action names on the last word. |
| 2 | 0:08–0:14 | **D** continues — the click lands on **Public** | "Eighty-eight percent know privacy settings exist. Under half switch them on. That's the gap." | Two bars in the lower third, side by side; gameplay running underneath. |
| 3 | 0:14–0:20 | **A** → **B** → **C** | "SafeSteps turns all four actions into decisions you live through — browser, ten minutes." | Quick 3-cut. No stats yet; save the counters. |
| 4 | 0:20–0:30 | **B** — cursor across the four chapter cards, names popping | "They can't name the actions — so the actions aren't a message inside the game. They're its structure. One chapter each, and no results until all four." | Let the four names finish appearing on "all four". The claim is *unavoidable exposure*, so the visual must show all four, not three. |
| 5 | 0:30–0:42 | **D** payoff — consequence, modal, meters dropping → **F** | "They don't feel it matters — so nothing here is asserted, it's experienced. Scores stay hidden, consequences arrive later, and even a well-meant comment costs you." | **The one beat with no speed-up.** Hold the modal in silence ~1s before "consequences arrive later". Cut to **F** on "well-meant comment" — the Responsibility −5 is the punchline. |
| 6 | 0:42–0:53 | **G**, then **E** | "They think reporting is a hassle — and you can't argue someone out of that, so they do it. Three taps, anonymous. The belief doesn't survive the rehearsal." | Punch in, phone left-of-centre, "1 · Share → 2 · Report → 3 · Reason" building on the empty right. Hard cut to **E** on "rehearsal". |
| 7 | 0:53–0:57 | **N** — the dashboard | "And every play reports back — where they quit, what they learned." | 4s. Funnel chart, then the walkthrough completion rate. No numbers unless a real sample size is on screen (see below). |
| 8 | 0:57–1:00 | **J**, then end card | "No install, no account. Play it — link's on screen." | Four meters fill, freeze, dim → large QR centre-left, typed URL beside it, handles under. Hold 3 full seconds. |

Word count: 19 + 14 + 14 + 26 + 27 + 28 + 12 + 10 = **150 words** ≈ 150 wpm.

### The three "why" sentences, on their own

If the video is doing its job, a judge could close their eyes during beats 4–6
and still hear the argument:

1. **Not a message in the game — the structure of it.** You cannot reach a result
   without playing all four actions, so exposure is not something we hope for.
2. **Nothing is asserted; it is experienced.** Hidden scores remove the quiz
   instinct, delayed consequences make the cost feel earned, and scoring
   well-meant near-misses attacks the specific belief that reporting achieves
   nothing.
3. **You cannot argue someone out of "it's a hassle" — so they do it.** The
   walkthrough is the real flow, and a belief about friction does not survive
   having performed the thing in three taps.

---

## What the judges are marking

| Root cause | Mechanic | Clip |
|---|---|---|
| 1. Don't know the four actions | Four chapters, one per IMDA action; results locked until all four are done | **B**, **C** |
| 2. Don't recognise importance / impact | Delayed consequences, hidden scores, 50 scored choices with a teaching modal, 11 fact cards / 14 cited sources, meters at the end | **D**, **F**, **H**, **I** |
| 3. Perceive inconvenience | Four interactive walkthroughs of the real report and privacy flows — played, not described | **G**, **E** |
| *IMDA's objection: gamification isn't measurable* | Anonymous per-play counters → funnel, first-attempt correct rate, walkthrough completion | **L**, **N** |

Two points to make out loud if you get the chance:

- Root cause 2 is answered by **scoring near-misses**, not just wrong answers.
  Commenting "don't do this" is well-intentioned and still costs Responsibility
  — the direct counter to "reporting does nothing".
- Root cause 3 is answered by the game *being* what it argues for: the
  walkthrough is interactive, and the game needs no install and no account.

If a beat must be cut, cut **7** entirely and give the four seconds back to
beats 5 and 6. Beats 4–6 are the deliverable; everything else is framing.

---

## ⚠ Honesty rule for beat 7

Right now the Sheet holds **two real playthroughs** plus seeded and probe rows.
Whatever appears in clip N must not imply a study that has not happened.

- **Safe:** show the dashboard as *instrumentation* — the funnel, the labels, the
  structure — and let the VO say "every play reports back". That is a true claim
  about capability.
- **Also safe:** run a real pilot with one class first and show those numbers,
  captioned with the sample size (`n = 34, Nanyang Poly, Aug 2026`).
- **Never:** show seeded numbers, or any number at all, without a visible sample
  size. A judge who asks "how many players is that?" and gets a vague answer has
  just found the weakest point in the pitch.

If there is no pilot before filming, blur or crop the numeric columns in clip N
and keep the chart shapes. The point of the beat is *that* it measures, not what
it currently says.

---

## Production notes

- **Captions burned in** — venue speakers may be bad or the laptop muted, and
  captions read as polish either way. Caption the score changes too (−10, −5).
- **Text size for a projector:** ≥48px at 1920×1080 for captions, 64px+ for stat
  overlays; everything inside a 5% safe margin. Play it fullscreen and stand 3
  metres back — if you squint, it is too small.
- **Contrast:** white text on solid dark bars, no thin fonts, never text directly
  on busy gameplay.
- **Sound:** no music under beats 1–2 or the beat-5 pause. In at beat 3, ducked
  at 5, back at 7. Voice-over ~−16 LUFS, music ~12dB under it.
- **Export & playback:** MP4 / H.264, 1920×1080, 30fps, 8–12 Mbps, AAC 192kbps.
  Play from the local file in VLC, not a browser tab or Drive link. Keep the MP4
  on the desktop as a backup even if it is embedded in the deck, and test on the
  actual venue laptop.
- **Influencer USP:** still not in this cut — no room, and it is not a
  root-cause answer. Keep it in the deck, or add a 10s tag if 70s is allowed.
- **Beat 5 is the whole video.** If only one moment is edited well, make it that
  one: choice → delay → strangers arrive → three meters drop.

## Measurement detail (Q&A answers, not in the video)

- **In-game, automatic:** anonymous counters — chapter funnel, first-attempt
  correct rate per scenario, report-walkthrough completion, finish rate. No
  accounts, no personal data. See [`analytics.md`](analytics.md).
- **Self-check:** the reflection screen (name the four actions · explain each ·
  likelihood to practise), shown before the results. Nothing is stored — it is
  retrieval practice, not evidence.
- **Pre / post / 4-week:** re-run Q8, Q9 and Q10 from the primary survey. The
  shift on the Q10 barrier items is the headline number.
- **Comparison group:** one class plays SafeSteps, one gets the standard talk;
  same post-survey. This is what makes the claim causal rather than anecdotal.

---

## What changed from v1

- **Beats 4–6 now argue instead of narrate.** They used to describe what was on
  screen ("go public, and days later the strangers arrive"), which wasted the
  voice-over on something the picture already says. Each now states the
  mechanism and why it defeats that specific root cause. They grew from 7–10s
  each to 10–12s each; the whole script went 136 → 150 words.
- **The IMDA callback is out of the voice-over.** Beat 7 is now four seconds of
  dashboard and one plain sentence. Naming the objection spent words on the
  audience instead of on the design; the answer is still visible, and the full
  measurement stack moved to the Q&A section.
- **Fact-card count dropped from the script.** The sources still appear on screen
  in clip **H** during beat 5 — seen, not narrated.
- Added clip **N** (dashboard) and clip **L** (reflection screen, which does
  exist in the build — earlier noted otherwise in error).
- Beat 8 line changed from "link in bio" to something that makes sense to a room.
- Added the honesty rule: no numbers on screen without a sample size.
