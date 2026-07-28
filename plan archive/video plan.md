# SafeSteps — 30-second demo video plan

For **PROID ASG 2: Solution Pitch** (ASG 2A Pitch Content 20% group · ASG 2B Delivery 10% individual).

## 1. What this video is for

The tasksheet never asks for a video — it asks for **prototypes** ("images, sketches,
storyboards, physical mock-ups etc") that "illustrate how it works" under *Solution features*,
and the 2B rubric rewards **"visual aids that strongly support and enhance the pitch."**
A 30-second screen recording of the working game is the strongest form of prototype available
to us: it is not a sketch of a solution, it is the solution running.

Two consequences for the design:

- **It lives on the *Solution features* slide** of the deck (one slide, video fills ~80% of it,
  DQ / problem framing stays on earlier slides). Deck cap is 25 slides excluding title and
  references.
- **It has no voiceover.** The presenter narrates live over it. 2B marks *your* vocal delivery,
  tone, pace and audience engagement — a baked-in VO competes with the speaker and scores
  nothing. On-screen captions carry the meaning if the room can't hear well. (An optional VO
  script is in §4 in case the team is told to submit a self-contained video.)
- 30s of a 15-minute pitch is ~3% of the time budget. It should *earn* attention, then hand
  back to the speaker on a frozen final frame.

## 2. Spec

| Item | Value |
|---|---|
| Length | 30s exactly (frame 0:00–0:30), final frame freezes so it can hold on screen |
| Resolution | 1920×1080, 30fps, H.264 .mp4 |
| Audio | none (or instrumental bed at ~15% if the venue is loud) |
| Captions | burned-in, bottom third, one short line per shot |
| Source | record the **live deployed build** at `https://adecentname.github.io/` |
| Embed | PowerPoint → Insert → Video → **This Device** (embed, never link), Start: **Automatically** |

Recording the live URL rather than `npm run dev` matters for the *Feasibility* criterion — it is
already deployed, free to host, and runs in any browser with no install.

## 3. Shot list

Narrative arc: **mistake → consequence → evidence → fix → score.** That deliberately mirrors
problem → root cause → solution, so the video argues the pitch's structure, not just its features.

| # | In–Out | Screen | On-screen action | Caption | Why it's in the cut |
|---|---|---|---|---|---|
| 1 | 0:00–0:03 | Title screen | All four IMDA pillars visible under the SafeSteps logo; cursor clicks **Start playing** | `All 4 IMDA safety actions — one game` | Cohesiveness: the whole solution in one frame |
| 2 | 0:03–0:05 | Chapter select (Hub) | 4 chapter cards on screen; click **Chapter 1 · Taking Control** | `4 chapters · 12 real scenarios` | Scope, in 2 seconds |
| 3 | 0:05–0:11 | Scenario 1 decision | "Your First Social Media Account" text; cursor hovers both options, then clicks **🌍 Set your account to Public** | `You choose — just like real life` | Value: shows the interactive core |
| 4 | 0:11–0:16 | Feedback modal (risky) | **⚠️ Risky move** header, strangers/DMs/nasty comments, then the delta chips **🔒 −10 ❤️ −10 🛡️ −10** | `Consequences, not lectures` | The single most important shot — this is the learning loop |
| 5 | 0:16–0:19 | 💡 Did You Know? card | The **80% of stalking victims experienced cyberstalking** stat, with `Source: … ↗` visible at the bottom | `Every fact cited` | Feasibility/credibility; also covers in-text citation expectations |
| 6 | 0:19–0:26 | Instagram tutorial mockup | Four taps: **☰ menu → Account privacy → Private toggle ON → 👀 See what others see** ending on *"This account is private"* | `Then you actually fix it` | Creativity: the unique feature — learn *and* do the real setting |
| 7 | 0:26–0:30 | Chapter end meter | Privacy / Safety / Wellbeing bars, then the combined **🔥 Boundary Meter** + tier name. **Freeze on last frame.** | `🔥 Boundary Meter` → hold `Play it: adecentname.github.io` | Payoff + a call to action the audience can act on during Q&A |

**Deliberate choice — show the wrong answer.** Picking *Public* costs 6 seconds of screen time
but buys the whole story: the bad outcome (shot 4) creates the need that the research (5) explains
and the Instagram walkthrough (6) resolves. Showing the safe answer instead would be 30 seconds of
a game agreeing with itself.

### Shot notes for the editor

- **Shot 4:** do *not* try to show the whole feedback paragraph — the audience can't read it in 5s.
  Punch in (~120% scale) on the ⚠️ verdict line, then push down to the three delta chips. The chips
  are the readable, memorable part.
- **Shot 6:** the mockup already pulses a highlight on the next tap target (`ig-pulse`), so the taps
  read clearly on video with no added annotation. Pause ~0.4s on the *"This account is private"*
  state — that reveal is the punchline of the feature.
- **Shot 7:** the meter bars animate on mount, so enter the screen cleanly rather than cutting
  mid-fill.
- Zoom the browser to **110–125%** (`Ctrl` `+`) before recording. Text sized for a laptop is
  unreadable on a projector.

## 4. Narration

**Live script (presenter talks over the video, ~75 words / 30s — this is the recommended option):**

> "SafeSteps covers all four IMDA safety actions. Here, our player picks a public account —
> and immediately lives the consequence: strangers in the DMs, hate comments, and the game
> scores it. Then we show *why*, with cited research — 80% of stalking victims are cyberstalked.
> And then, the part that actually changes behaviour: we walk them through making their real
> Instagram account private, and show them exactly what a stranger sees. Every chapter ends
> with a score. It's live in the browser right now."

Practise this to hit the beats — "consequence" on shot 4, "cited research" on 5, "make it private"
on 6. Landing narration on visual cues is exactly what "visual aids that *enhance* the pitch" means.

**If a self-contained VO is required instead:** record the same script, but trim to ~65 words and
duck any music to 5%.

## 5. Production checklist

**Setup**
- [ ] Chrome, new window, no bookmarks bar, no extensions visible; `F11` fullscreen
- [ ] Browser zoom 110–125%; hard-refresh so nothing is cached mid-animation
- [ ] Windows Settings → Accessibility → Mouse pointer: bump **size** and use a **coloured**
      pointer so the cursor is trackable on a projector
- [ ] Fresh game state (the video must open on the title screen with 0/4 chapters done)

**Capture**
- [ ] OBS Studio (cleanest) or `Win`+`G` Game Bar; 1080p/30fps, display capture
- [ ] Move the mouse **slowly**, pause ~0.5s before every click, never jiggle
- [ ] Record 3–4 takes of the whole run, plus a separate take of shot 6 alone (it has the most taps)
- [ ] Record ~45–60s of raw footage; you are cutting *down* to 30s, not stretching up

**Edit** (Clipchamp is built into Windows 11; CapCut also fine)
- [ ] Trim dead air between clicks — this is where the 30s comes from
- [ ] Speed menu navigation (shots 1–2) to ~1.25×; keep shots 4 and 6 at 1.0×
- [ ] Add the 7 captions; use the game's own accent colours (chapter 1 purple `#a78bfa`) so the
      video matches the deck
- [ ] Add the zoom pushes in shot 4
- [ ] Final frame: freeze + `Play it: adecentname.github.io`
- [ ] Export 1080p H.264 mp4; confirm duration reads 0:30

**Deck integration**
- [ ] Insert → Video → **This Device** (embedded, so it survives the wrong laptop)
- [ ] Playback: Start **Automatically**, uncheck *Rewind after Playing* so the last frame holds
- [ ] Test on the actual presentation laptop, in Slide Show mode, with sound muted
- [ ] Hidden backup slide with 5 stills (shots 1, 4, 5, 6, 7) in case AV fails
- [ ] Copy the mp4 to a USB alongside the deck

## 6. Rubric mapping (use this to justify the video in the deck / Q&A)

| ASG 2A criterion | Which shots earn it |
|---|---|
| **Value** — addresses the problem and key root causes relevant to the DQ | 3–4: teens don't feel the consequence of a privacy setting until it's too late; the game makes the consequence immediate and survivable |
| **Feasibility** — persuasive evidence it works in the real world | 5 (cited sources), 7 (already deployed, browser-based, zero install, free hosting — a school can run it tomorrow) |
| **Creativity** — novel and unique features | 6: an interactive imitation of the *real* Instagram privacy path, plus the stranger's-eye view — it teaches the setting *and* has the player perform it |
| **Overall quality & cohesiveness** | 1, 2 and 7: one consistent metric/meter system across all four IMDA actions, not four disconnected mini-games |

| ASG 2B criterion | How the video serves it |
|---|---|
| Visual aids that strongly support and enhance the pitch | Silent, captioned, 30s, ends on a frozen frame — supports the speaker instead of replacing them |
| Audience engagement | The final frame is a URL; invite the panel to play it during Q&A |
| Q&A understanding | Know cold: what each metric does, why we show the *wrong* choice, where every stat comes from |

## 7. Two things to settle before recording

1. **Team name / class on the end frame?** Not needed — the deck's title slide covers it, and it
   would cost caption space. Skip unless your tutor asks for it.
2. **Gen-AI declaration.** If AI is used to draft captions or the narration script, it must be
   declared in **Annex 1** (statement 3 and/or 5) with the prompt and how the output was used.
   Non-submission of the declaration is −5%.
