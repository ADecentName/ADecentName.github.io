# SafeSteps — 60-second pitch video (audience: organisers / IMDA judges)

**v3. Canonical.** Consolidates v2 with the production detail from the retired root-level
`PITCH VIDEO PLAN.md`, and corrects four claims that had gone stale. Earlier drafts are in
`plan archive/`. Nothing else needs to be read alongside this.

For **PROID ASG 2** — 2A Pitch Content (20%, group) · 2B Pitch Delivery and Q&A (10%, individual).

**Goal:** in 60s, show that SafeSteps is a real, playable solution, that each of our three root causes
is answered by a specific mechanic, and that the whole thing measures itself — proven with **gameplay
footage on screen for almost the entire minute**, not slide graphics.

**Format: 1920×1080, 16:9 landscape, 30fps, MP4 (H.264).** Played from a laptop in a presentation.
Deliver a standalone MP4; assume the venue wifi fails.

**Footage-first rule:** every beat is a real screen recording — the game itself, and for the last
proof, the live dashboard. Stat overlays sit *on top of* footage, never as a cut away from it. The
only non-gameplay frames are the final 3 seconds.

**Note on audience.** The 1-min *explainer* in the deck is for youths ("how to play, check our IG").
This is the *pitch* cut for organisers: problem → solution → root-cause coverage → measurement. Same
capture session, different voice-over — record once, cut twice. The vertical IG/TikTok version is a
separate reframe done **after** this landscape edit is locked.

**Budget:** ~150 spoken words ≈ 60s at 150 wpm with pauses. Beats are word-capped; cut a word rather
than speeding up the read — beat 5 needs its pause.

> ### What changed in v3
> - **Corrected: 49 scored choices, not 50.** Machine-counted from `src/data/scenes.js`.
> - **Corrected: clip N is no longer a Google Sheet.** Analytics moved to a Cloudflare Worker + D1.
>   The dashboard is now `https://safe-steps.uk/dashboard/`, key-protected.
> - **Corrected: every URL is `safe-steps.uk`.** `adecentname.github.io` is being switched off.
> - **New: `prototypes.safe-steps.uk` exists** — two static mockups (report confirmation with a
>   SafeSteps checkbox; a report button on the post action bar). Optional insert, see §6.
> - **Added:** the full production stack — voiceover, edit, deck, Q&A, rubric mapping, checklists.
> - **Added:** §9 covers an **AI voice** (ElevenLabs), which is now the chosen route. Annex 1
>   declaration is therefore mandatory — see §14.

---

## 1. Why measurement gets four seconds, and not more

From the IMDA Q&A in our own notes:

> *"IMDA has not tried gamification because **it is not measurable** but they are open to that idea
> for us."*

That is the stated objection to our whole solution type, so it cannot be absent — but naming IMDA in
the voice-over spends words on *them* when the sixty seconds should be spent on *why the design
works*. Beat 7 therefore shows the dashboard and says one plain sentence. The judges who care about
that objection will recognise the answer without being told they asked the question, and the full
measurement stack is a Q&A answer (§13), where it belongs.

## 2. The three root causes

From `solution plan.md`:

> **RC1 — Youths lack the awareness of practising the four key online safety actions.**
> **RC2 — Youths do not recognise and understand the importance and impact of practising them.**
> **RC3 — Youths perceive inconvenience in practising them.**

### RC1 needs rewording before the deck is finalised

IMDA's own briefing says *"awareness is not an issue in Singapore… the issue is people are not
taking action."* Pitching an awareness fix to the stakeholder who told you awareness is solved
invites the one question you cannot answer. The source document already flags it `REWORD – Javier`.

**Reframe it as a recall gap:**

> **RC1 — Youths cannot name or recall the four key online safety actions as a usable set, so the
> actions never translate into specific behaviour.**

IMDA's claim is that youths know the internet is dangerous — not that they can name the four actions,
and the four actions are what the DQ is about. Beat 1 already demonstrates exactly this, and Beat 1's
third sentence ("the ones who can still don't act") concedes IMDA's point in passing, which is why
the video survives the objection even if the deck wording lags.

### RC3 is the most persuasive of the three

RC1 and RC2 are gaps that need *teaching*. RC3 is a **misperception** — reporting already takes three
taps. A misperception only needs *showing*, and video shows better than any other medium. This is why
Beat 6 is the walkthrough played, not described.

## 3. What the judges are marking

| Root cause | Mechanic | Clip |
|---|---|---|
| 1. Can't name the four actions | Four chapters, one per IMDA action; results locked until all four are done | **B**, **C** |
| 2. Don't recognise importance / impact | Delayed consequences, hidden scores, 49 scored choices with a teaching modal, 11 fact cards / 14 cited sources, meters at the end | **D**, **F**, **H**, **I** |
| 3. Perceive inconvenience | Four interactive walkthroughs of the real report and privacy flows — played, not described | **G**, **E** |
| *IMDA's objection: gamification isn't measurable* | Anonymous per-play counters → funnel, first-attempt correct rate, walkthrough completion | **L**, **N** |

Two points to make out loud if you get the chance:

- Root cause 2 is answered by **scoring near-misses**, not just wrong answers. Commenting "don't do
  this" is well-intentioned and still costs Responsibility — the direct counter to "reporting does
  nothing".
- Root cause 3 is answered by the game *being* what it argues for: the walkthrough is interactive,
  and the game needs no install and no account.

If a beat must be cut, cut **7** entirely and give the four seconds back to beats 5 and 6. Beats 4–6
are the deliverable; everything else is framing.

## 4. What's in the game (verified)

**Machine-counted from `src/data/scenes.js` on 2026-07-28.** Use these numbers.

| | |
|---|---|
| Chapters | **4** — the four key actions under their official names |
| Chapter order | Set Boundaries Online → Think Before You Act → Report Inappropriate Content → Engage & Support |
| Total scenes | **38** |
| Decision points | **14**, including **2 ⭐ bonus questions** (2FA; reporting to authorities) |
| Total choices | **49** |
| Scoring metrics | **7** — 🔒 Privacy · 🛡️ Safety · ❤️ Wellbeing · 🧠 Awareness · 🌐 Responsibility · 👣 Citizenship · 🤝 Support |
| "💡 Did You Know?" fact cards | **11** |
| Cited sources, linked on screen | **14** |
| Real-app walkthroughs | **4** — Instagram privacy · TikTok / YouTube / Instagram reporting |
| Themed meters with tiers | **4** — 🔥 Boundary Meter · 👣 Digital Footprint · 🌐 Digital Citizenship · 💚 Support |
| Chapter endings | **4** |
| End-of-game self-check | **3 questions** — name the four actions, explain them, rate likelihood to practise |
| Analytics | **Anonymous event counters** → Cloudflare D1, aggregated hourly, raw rows purged. No accounts, no PII, no `localStorage` |

> **⚠️ Two claims from earlier drafts are false. Do not repeat them.**
>
> - **"Sixty-three choices"** (in `solution plan.md`'s draft script) and **"50 scored choices"** (v2
>   of this document). The figure is **49**.
> - **"No analytics, no network calls, no data collected."** True when first written; `src/analytics.js`
>   now posts anonymous events to `/collect`. Say **"anonymous, no accounts"** — accurate, and it sets
>   up Beat 7 instead of contradicting it.
>
> **Two further claims are not machine-verifiable** — don't state them as counts without checking by
> hand: *"12 scenarios (3 per chapter)"* is a narrative grouping with no field in the data, and
> *"1 multi-answer decision"* matched no structural pattern.

## 5. Capture session (do this first)

One continuous playthrough of **all four chapters** — the combined results screen only unlocks at
4/4, and a single recording keeps size, cursor and framing consistent. Chapters can be played in any
order; use the game's own.

- **Screen:** desktop Chrome at exactly **1920×1080**, F11 fullscreen so no tab bar, URL bar or
  bookmarks bar is in frame. Never record higher and downscale; the game's text goes soft.
- **Browser zoom:** check at 100% first. If scenario text reads small in a 1920-wide window, raise to
  110–125% *before* recording — scaling in the browser stays sharp, scaling in the edit does not.
- **Record `https://safe-steps.uk`**, the plain URL — not `?test=1`. No reason to flag the capture
  run, and one less thing to explain. (`safesteps.iamanoobirl.workers.dev` is the fallback if the
  custom domain misbehaves, but keep it out of frame.)
- **Pace:** natural reading speed. Speed-ramp the reading in the edit; never speed up the frame where
  a consequence or score change lands.
- **Cursor:** move deliberately. Hover the option you are *about* to reject for a second before
  clicking. Turn on cursor-highlight — a bare arrow is invisible on a projector.

| Clip | Scene | What to capture |
|---|---|---|
| **A** | title → Start | Title screen, one click in |
| **B** | hub | The four chapter cards, cursor panning across all four |
| **C** | `b_intro` | The "Set Boundaries Online" action card |
| **D** | `b_s1` | Public-vs-private prompt · hover Private · click **Public** · the consequence · the modal showing Privacy −10, Safety −10, Wellbeing −10 |
| **E** | `b_s1_tut` | The interactive Instagram mockup — Settings → Account privacy → toggle **Private** |
| **F** | `r_s1` | Click **B · Comment "Don't do this."** → the *mixed* feedback: Awareness +5, **Responsibility −5** |
| **G** | `r_s1_tut` | The TikTok mockup — share arrow → Report → pick a reason (**three taps** — this is the number Beat 6 speaks) |
| **H** | `r_s1_dyk` | A Did-You-Know card scrolled to show the **cited sources** |
| **I** | `b_end` | The Boundary Meter filling, tier name landing |
| **J** | ending screen | All four meters together |
| **L** | reflection screen | The three-question self-check before the results |
| **N** | **the dashboard** | *Not the game* — `https://safe-steps.uk/dashboard/`, key required. The headline block, the funnel, the walkthrough completion rate. **Read §8 first.** |
| **P** | *(optional)* | `https://prototypes.safe-steps.uk` — the report-button mockup and the SafeSteps checkbox. See §6. |

Clips D, E, F, G are the root-cause proof; **N** is the measurement proof. If shoot time is short,
capture those five first.

**Clips N and P are recorded separately** — same 1920×1080, browser zoom up so text is legible on a
projector.

### Automated capture — `npm run capture`

`scripts/capture-clips.mjs` plays the whole route so every take is identical. It draws its own cursor
with click ripples, hovers the option it is about to reject, taps through the phone walkthroughs,
fills the reflection screen, and writes `capture/clip-markers.json` — timecoded in/out for every clip
above (except **N** and **P**, which are not the game).

```bash
npm i -D playwright && npx playwright install chromium   # once — not currently installed
npm run dev                                              # terminal 1
npm run capture                                          # terminal 2
```

It opens kiosk-fullscreen, counts down 5 seconds so you can start OBS, then flashes one white frame
at t=0. **Cut the OBS take to that flash** and the markers line up. `SPEED=4` for a rehearsal;
`MODE=video` uses Playwright's own recorder (WebM — fine for checking the route, too soft for a
projector).

The route is derived from the content, not a hard-coded click list: highest-scoring option everywhere
except two deliberate overrides — **Public** in `b_s1` and **Comment "Don't do this"** in `r_s1`, the
two clips the pitch is built on.

## 6. Shot list / script

**The division of labour: the picture shows the scenario, the voice explains the mechanism.** Beats
4–6 never narrate what is happening on screen — the viewer can see the account go public and the
meters drop. The voice-over spends those seconds on *why that design defeats that root cause*, which
is the thing being marked. Never let the two say the same thing.

| # | Time | Gameplay on screen | Voice-over (say exactly this) | Edit treatment |
|---|---|---|---|---|
| 1 | 0:00–0:08 | **D** opening — the public/private prompt, cursor hesitating | "Ask a poly student to name IMDA's four online-safety actions. Most can't. The ones who can still don't act." | Cold open on gameplay, no logo. Grey out the four action names on the last word. |
| 2 | 0:08–0:14 | **D** continues — the click lands on **Public** | "Eighty-eight percent know privacy settings exist. Under half switch them on. That's the gap." | Two bars in the lower third, side by side; gameplay running underneath. Caption `source: IMDA`. |
| 3 | 0:14–0:20 | **A** → **B** → **C** | "SafeSteps turns all four actions into decisions you live through — browser, ten minutes." | Quick 3-cut. No stats yet; save the counters. |
| 4 | 0:20–0:30 | **B** — cursor across the four chapter cards, names popping | "They can't name the actions — so the actions aren't a message inside the game. They're its structure. One chapter each, and no results until all four." | Let the four names finish appearing on "all four". The claim is *unavoidable exposure*, so the visual must show all four, not three. |
| 5 | 0:30–0:42 | **D** payoff — consequence, modal, meters dropping → **F** | "They don't feel it matters — so nothing here is asserted, it's experienced. Scores stay hidden, consequences arrive later, and even a well-meant comment costs you." | **The one beat with no speed-up.** Hold the modal in silence ~1s before "consequences arrive later". Cut to **F** on "well-meant comment" — the Responsibility −5 is the punchline. |
| 6 | 0:42–0:53 | **G**, then **E** | "They think reporting is a hassle — and you can't argue someone out of that, so they do it. Three taps, anonymous. The belief doesn't survive the rehearsal." | Punch in, phone left-of-centre, "1 · Share → 2 · Report → 3 · Reason" building on the empty right. Hard cut to **E** on "rehearsal". |
| 7 | 0:53–0:57 | **N** — the dashboard | "And every play reports back — where they quit, what they learned." | 4s. Funnel chart, then the walkthrough completion rate. No numbers unless a real sample size is on screen — see §8. |
| 8 | 0:57–1:00 | **J**, then end card | "No install, no account. Play it — link's on screen." | Four meters fill, freeze, dim → large QR centre-left, `safe-steps.uk` typed beside it, handles under. Hold 3 full seconds. |

Word count: 19 + 14 + 14 + 26 + 27 + 28 + 12 + 10 = **150 words** ≈ 150 wpm.

### On "three taps"

Beat 6 says three because clip **G** shows TikTok's *existing* flow: share arrow → Report → reason.
That is the point — reporting is already easy today, and the belief that it isn't is the root cause.
Our prototype's two-tap shortcut is a *proposed improvement* and a different claim. Don't merge them.

### The optional prototype insert (clip P)

`prototypes.safe-steps.uk` holds two mockups: the report confirmation with a "Report submitted
because of SafeSteps" checkbox, and a report button on the post action bar. Neither is a live
Instagram feature.

**They do not belong in Beat 6** — that beat argues the belief doesn't survive rehearsal, and cutting
to a mockup weakens it by swapping real footage for a proposal. If you want them in, the checkbox
belongs in **Beat 7** with the measurement, costing ~4 words: *"and a report can say it came from
us."* Trim Beat 4 to pay for it.

**If any prototype footage appears, burn in `PROPOSED — not a live Instagram feature`.** An assessor
who knows Instagram and sees it unlabelled reads it as a false claim, and discounts everything after.

### The three "why" sentences, on their own

If the video is doing its job, a judge could close their eyes during beats 4–6 and still hear the
argument:

1. **Not a message in the game — the structure of it.** You cannot reach a result without playing all
   four actions, so exposure is not something we hope for.
2. **Nothing is asserted; it is experienced.** Hidden scores remove the quiz instinct, delayed
   consequences make the cost feel earned, and scoring well-meant near-misses attacks the specific
   belief that reporting achieves nothing.
3. **You cannot argue someone out of "it's a hassle" — so they do it.** The walkthrough is the real
   flow, and a belief about friction does not survive having performed the thing in three taps.

## 7. Fix these before filming

1. **The 🚧 badge still renders.** `src/data/scenes.js` sets `wip: true` on `s_s3` and `s_s3_dyk` in
   the **Engage & Support** chapter, and `src/engine/SceneEngine.jsx:54` renders *"🚧 Work in progress
   — this scenario is still being written"* whenever it's set. §5 requires a full four-chapter
   playthrough, so you will pass through them. Finish the scenario, drop the flag, or keep those two
   scenes out of frame.
2. **Turn off Cloudflare Web Analytics.** The zone injects a third-party beacon
   (`static.cloudflareinsights.com`) into every HTML page on `safe-steps.uk`. It contradicts the
   privacy story and it is not yours. Dashboard → Analytics & Logs → Web Analytics.
3. **Pick a campaign name.** `solution plan.md` wants the checkbox to read *"because of our **Low
   five** campaign"*; the built prototype says *"because of **SafeSteps**"*. It is legible on camera
   if clip P is used. Decide, then redeploy the prototype.
4. **Install Playwright** if you want `npm run capture` — see §5.
5. **Say 49, never 63 or 50.**

## 8. ⚠ Honesty rule for beat 7

The database currently holds **test rows only** — the aggregates were reset after the deployment
check. Whatever appears in clip N must not imply a study that has not happened.

- **Safe:** show the dashboard as *instrumentation* — the funnel, the labels, the structure — and let
  the VO say "every play reports back". That is a true claim about capability.
- **Also safe:** run a real pilot with one class first and show those numbers, captioned with the
  sample size (`n = 34, Nanyang Poly, Aug 2026`).
- **Never:** show seeded numbers, or any number at all, without a visible sample size. A judge who
  asks "how many players is that?" and gets a vague answer has just found the weakest point in the
  pitch.

If there is no pilot before filming, blur or crop the numeric columns in clip N and keep the chart
shapes. The point of the beat is *that* it measures, not what it currently says.

## 9. Voiceover — AI (ElevenLabs)

**Do this first.** Lay the VO on the timeline, then cut picture to the words — never the reverse, or
the last beat always ends up rushed.

**Model: Eleven Multilingual v2.** ElevenLabs' docs recommend it for high-quality narration and
professional content, and it is the most consistent across separate generations — which matters
because this track is assembled from eight clips. Eleven v3 has more emotional range and inline audio
tags but is less predictable; Flash/Turbo trade quality for latency you don't need. **Test one beat in
v2 and v3, pick one, then generate everything in that model** — switching mid-track changes timbre
like switching voices would.

**Voice: choose from the Voice Library, not Default voices** (Defaults are being retired and expire
31 Dec 2026). Filter in this order: **accent** — Singaporean first, then neutral British or
Australian, since a generic American narrator is the weakest option for a pitch to IMDA; **use case**
Narrator or Professional, never Conversational; **age** late 20s–30s. Reject anything that sounds like
a movie trailer — "the belief doesn't survive the rehearsal" is a dry line and a hype voice fights it.
Pick a voice clearly distinct from whoever presents (§11), so the room hears two people.

**Audition on Beat 1 and Beat 6.** Beat 1 tests whether it pronounces **IMDA** correctly and can hold
a level register without sounding bored; Beat 6 tests whether it can land the closing line as a
statement rather than a sell. Both, or reject it.

**Settings:**

| | Beats 1–2 (level) | Beats 3–8 (lifted) |
|---|---|---|
| Stability | 50 | 35–40 |
| Similarity | 75 | 75 — *never change* |
| Style | 0 | 0, up to ~20 only if flat |
| Speaker Boost | On | On — *never change* |
| Speed | 0.95 | 1.00 |

Lower stability gives broader emotional range; higher gives a monotone. Similarity and Speaker Boost
affect timbre — changing them mid-script makes the stitch audible. Speed clamps to 0.7–1.2 and is
your timing lever if the read misses the 60s frame; adjust it rather than rewriting the script.

**Workflow:** generate **2–3 full-script takes first**, then per-beat pickups only where a take is
wrong. Beat-by-beat from scratch loses prosody between clips. Change stability at exactly one seam —
between Beat 2 and Beat 3, where the music also comes in — and listen to that join specifically.

**Do not generate the Beat 5 pause.** Cut ~1s of silence in the editor, timed against the modal
appearing. Baked-in silence is always slightly wrong.

**Export** WAV/PCM if your tier allows, else 192kbps MP3. Name files `vo-01`…`vo-08`. Normalise the
assembled track to ~−16 LUFS with music ~12dB under.

**Pronunciation traps:** test **IMDA** in isolation — in a pitch *to IMDA*, that is the one word the
room will catch. Numbers are written as words in the script ("Eighty-eight percent") deliberately;
keep them that way. Beat 8 says "link's on screen" so nothing has to read the URL aloud.

**Log the voice name, model and both settings rows as you go** — required for Annex 1 (§14).

*If you revert to a human voice:* quietest room, aircon off, phone at ~15cm slightly off-axis, clap
for sync, 3 full takes then pickups, read 10% slower than feels natural, clean up with Adobe Podcast
Enhance. Target ~52s of speech in the 60s frame.

## 10. Edit

- Trim dead air between clicks. That's where three minutes of footage becomes sixty seconds.
- Speed-ramp reading in beats 1–4 to ~1.25×. Keep beats 5, 6, 7 and 8 at 1.0×.
- **Punch-ins are mandatory, not stylistic:** the delta chips (beat 5), the `🧠 +5 / 🌐 −5` pair
  (beat 5) and the self-check's four empty fields must be legible. Assume the projector is worse than
  your monitor.
- **Captions burned in** — venue speakers may be bad or the laptop muted, and captions read as polish
  either way. Caption the score changes too (−10, −5).
- **Text size for a projector:** ≥48px at 1920×1080 for captions, 64px+ for stat overlays; everything
  inside a 5% safe margin. Play it fullscreen and stand 3 metres back — if you squint, it's too small.
- **Contrast:** white text on solid dark bars, no thin fonts, never text directly on busy gameplay.
- Style captions in the game's own accents (`#a78bfa` purple, `#ff5470` red) so video and deck read as
  one system.
- **Sound:** no music under beats 1–2 or the beat-5 pause. In at beat 3, ducked at 5, back at 7.
  Voice-over ~−16 LUFS, music ~12dB under it.
- Freeze the final frame so it holds while the presenter talks.
- **Export:** MP4 / H.264, 1920×1080, 30fps, 8–12 Mbps, AAC 192kbps. Confirm duration reads 1:00 or
  under. Play from the local file in VLC, not a browser tab or Drive link.
- Tools: **Clipchamp** ships with Windows 11; CapCut also fine.

## 11. Presenter's hand-off

The video is scored under 2A, not 2B — a minute of silence is a long time to earn nothing. Bracket it:

> **Before:** "We found three root causes: youths can't name the four key actions, they don't feel why
> they matter, and they think reporting is a hassle that changes nothing. Here's how SafeSteps answers
> all three — in one minute."
>
> *[video plays · presenter silent, facing the audience, not the screen]*
>
> **After:** "That third one is the one we'd stress. Reporting already takes three taps — the barrier
> is belief, not effort. Every fact in there is one of fourteen cited sources, and it ends with a
> teenager naming all four actions and changing a real setting on their own phone."

**Rehearse the stillness.** A minute is long enough that fidgeting reads as nerves, and body language
is explicitly marked. Using an AI voice does not cost you 2B marks — those come from this hand-off,
not from the video's narration.

## 12. Deck integration

- One slide, under **Solution features**. Video fills ~80%; DQ and problem framing stay earlier.
- Insert → Video → **This Device** — embedded, never linked, so it survives the wrong laptop.
- Playback: Start **Automatically**; uncheck *Rewind after Playing* so the last frame holds.
- **Test sound through the actual room's projector/HDMI** at presentation volume, laptop unmuted,
  Windows output on the right device. Before pitch day, not on it.
- Hidden backup slide with 8 stills (one per beat) in case AV fails entirely.
- Copy the .mp4 to a USB alongside the deck, and keep it on the desktop even if embedded.

## 13. Q&A ammunition

| They'll ask | Answer |
|---|---|
| Whose framework? | The four key online-safety actions under their official names. Order is Set Boundaries → Think Before You Act → Report Inappropriate Content → Engage & Support; any chapter can be played first |
| Which root cause does which feature serve? | RC1 (recall) — four named chapters, results locked until 4/4, the end self-check. RC2 (importance) — delayed consequences, hidden scores, near-miss grading, 11 cited fact cards. RC3 (perceived inconvenience) — four real-app walkthroughs |
| But IMDA says awareness isn't the problem | Agreed — that's why RC1 is a *recall* gap. Youths know the internet is dangerous; they can't name the four actions, and the actions are what the DQ is about |
| **Data and privacy?** | **Anonymous event counters only — no accounts, no login, no personal data, nothing in `localStorage`. Events go to Cloudflare D1, are aggregated hourly, and the raw rows are then deleted. The app mockups connect to nothing** |
| How do you measure impact? | Chapter funnel, first-attempt correct rate per scenario, walkthrough completion, finish rate. Then pre/post/4-week re-runs of survey Q8–Q10, with the Q10 barrier items as the headline. A comparison class gets the standard talk instead — that's what makes it causal rather than anecdotal |
| Evidence base? | 14 sources linked on screen: SPF (179 reports, ≥ S$399k), MDDI survey, IMH/CNA, Lancet Regional Health – Americas, SafeHome, PMC screen-time review |
| Theory? | Social Influence Theory (compliance / identification / internalisation) for why harmful trends spread; Interpersonal Theory of Suicide for cyberbullying harm |
| Safeguarding for minors? | The hardest cyberbullying option carries no methods and redirects immediately to SOS 1767 / IMH / Tinkle Friend / 999-995 |
| Is the report button real? | The walkthroughs are the real apps — reporting already takes three taps today. The one-tap button on the post is our proposal, labelled as such |
| Running cost? | Cloudflare Worker free tier; the only cost is the domain, ~£10/yr. No licences, no per-seat cost |
| Can we extend it? | Scenarios are data in `scenes.js` with a scene-graph validator. New scam, new trend, same-day ship |
| Why not just a quiz? | A quiz can't score a near-miss. Commenting "don't do this" — good intention, harmful effect — is the lesson quizzes structurally cannot teach |
| Influencer angle? | Not in this cut — it's a distribution mechanism, not a root-cause answer. Pricing research is in the deck |

## 14. Rubric mapping and Annex 1

| ASG 2A criterion | Evidence in the video |
|---|---|
| **Value** — addresses the problem and its root causes | Beats 1–2 establish the gap; beats 4, 5 and 6 each open by naming a root cause before showing the mechanic that answers it. Every beat is traceable to one of the three |
| **Feasibility** — persuasive evidence it works in the real world | Beat 8: deployed at a live URL, zero install, no backend to run, free tier. Beat 5 carries the 14-source evidence base. Beat 7 shows the measurement instrument, which is what IMDA said gamification lacked |
| **Creativity** — novel and unique features | Beat 5's near-miss scoring (good intention, harmful effect) and Beat 6's interactive walkthroughs of the real report flow |
| **Overall quality and cohesiveness** | Beat 7: 7 metrics resolving into 4 themed meters across all four actions, plus a self-check that measures the root cause it set out to fix — one system, not four mini-games |

| ASG 2B criterion | How this serves it |
|---|---|
| Visual aids that strongly support the pitch | Self-contained, captioned, exactly 60s, freezes on a frame the presenter can talk over |
| Vocal delivery and body language | Protected by §11's bracket — and by rehearsing the minute of stillness |
| Audience engagement | Final frame is a live URL and QR; invite the panel to play it during Q&A |

**Annex 1 — mandatory now.** The voice-over is AI-generated, so declare it (statements 3 and/or 5)
with the prompt/script submitted, the provider, model, voice and settings, and how the output was
used. **Non-submission of the declaration form is −5%**; missing in-text citations and reference list
is another −5%. Declare any AI use in the script drafting too.

## 15. Measurement detail (Q&A, not in the video)

- **In-game, automatic:** anonymous counters — chapter funnel, first-attempt correct rate per
  scenario, report-walkthrough completion, finish rate. No accounts, no personal data. See
  [`analytics.md`](analytics.md).
- **Self-check:** the reflection screen (name the four actions · explain each · likelihood to
  practise), shown before results. Nothing is stored — it is retrieval practice, not evidence.
- **Pre / post / 4-week:** re-run Q8, Q9 and Q10 from the primary survey. The shift on the Q10 barrier
  items is the headline number.
- **Comparison group:** one class plays SafeSteps, one gets the standard talk; same post-survey. This
  is what makes the claim causal rather than anecdotal.

---

## Appendix A — the silent variant

Use only if the video must play muted. Captions replace the VO and the presenter narrates live, which
suits 2B's vocal-delivery marks better than the voiced cut.

| # | In–Out | Screen | Caption |
|---|---|---|---|
| 1 | 0:00–0:08 | **D** opening; action names greying out | `Most can't name all four` |
| 2 | 0:08–0:14 | Two bars over gameplay | `88% know how. Under half do.` — `source: IMDA` |
| 3 | 0:14–0:20 | **A** → **B** → **C** | `Four actions. Ten minutes. In a browser.` |
| 4 | 0:20–0:30 | **B**, four names appearing | `Not a message in the game — its structure` |
| 5 | 0:30–0:42 | **D** payoff → **F** | `Nothing asserted. Experienced.`<br>`Even a well-meant comment costs you.` |
| 6 | 0:42–0:53 | **G** → **E** | `Reporting is three taps`<br>`The belief doesn't survive the rehearsal` |
| 7 | 0:53–0:57 | **N** dashboard | `Every play reports back` |
| 8 | 0:57–1:00 | **J** → end card | `Play it: safe-steps.uk` |

Live narration (~150 words, ~60s): *"Three root causes. Youths can't name the four key safety actions.
They don't feel why they matter. And they think reporting is a hassle that changes nothing. So the
actions aren't a message inside the game — they're its structure: one chapter each, and no results
until all four are done. Nothing is asserted, it's experienced. Scores stay hidden, consequences
arrive days later, and even a well-meant comment costs you — commenting 'don't do this' raises
Awareness and lowers Responsibility, because the video still spreads. Then the hassle belief: you
can't argue someone out of it, so we make them do it. Three taps in the real TikTok flow, and the
belief doesn't survive the rehearsal. Every play reports back anonymously — where they quit, what they
learned. It's live in the browser right now, and it costs about ten pounds a year to run."*

## Appendix B — production order checklist

Do not reshuffle steps 1–6.

1. [ ] Resolve §7 — the 🚧 flag, the beacon, the campaign name, Playwright
2. [ ] Lock the script (§6); read aloud with a stopwatch
3. [ ] Audition voices on Beats 1 and 6; lock model, voice and settings (§9)
4. [ ] Generate 2–3 full takes, then pickups; assemble and normalise the VO track
5. [ ] Confirm `safe-steps.uk` is serving the current build
6. [ ] Capture clips per §5 — play all four chapters once first; record N (and P if used) separately
7. [ ] Cut picture to the audio (§10)
8. [ ] Captions, punch-ins, the Beat 5 silence, `PROPOSED` label if clip P is used, freeze frame
9. [ ] Export 1080p H.264, confirm 1:00 or under
10. [ ] Embed in the deck, uncheck *Rewind after Playing* (§12)
11. [ ] **Test video and audio in the actual room**
12. [ ] Build the 8-still backup slide; copy the .mp4 to USB
13. [ ] Rehearse the hand-off and the minute of stillness (§11)
14. [ ] Complete Annex 1 — provider, model, voice, settings, script (§14)
