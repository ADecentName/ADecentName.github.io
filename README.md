# SafeSteps

A short, choose-your-path **educational game about staying safe online**, built with React + Vite.
You play as a student across four chapters — one for each of **IMDA's four key online-safety
actions**. Each chapter runs a few real-world scenarios, scores your choices on its own metrics,
and reveals a themed meter at the end:

| Chapter | Key action | Scenarios | Meter |
|---|---|---|---|
| 🛡️ Taking Control | **Set Boundaries Online** | Public vs private account · password + 2FA · screen-time balance | 🔥 **Boundary Meter** (Privacy · Safety · Wellbeing) |
| 🧠 Your Digital Footprint | **Think Before You Act** | Oversharing a selfie · e-commerce scam · posting with kindness | 👣 **Digital Footprint Score** (Safety · Citizenship) |
| 🚩 Stop the Spread | **Report Inappropriate Content** | Shoplifting video · viral fight clip · rumour account | 🌐 **Digital Citizenship Score** (Awareness · Responsibility) |
| 🤝 You Are Not Alone | **Engage & Support** | Scam aftermath · fake AI video of a friend · being cyberbullied | 💚 **Support Score** |

Every scored choice pops a **teaching moment** (safe / could-be-safer / risky, why, and the
metric change). Scenarios are followed by **"Did You Know?"** fact cards (with sources),
short **"how to report"** tutorials for TikTok / YouTube / Instagram, and **bonus questions**.
The support chapter surfaces real Singapore helplines. Finish all four chapters for a combined
results screen.

> The four chapters use IMDA's official action names (**Set Boundaries Online · Think Before You
> Act · Report Inappropriate Content · Engage & Support**), in IMDA's order. IMDA writes the
> fourth action for parents ("engage & support your child"); here its scenarios are played from a
> teenager's point of view — supporting a friend, or seeking help yourself. The self-harm branch
> in the source brief was reframed responsibly as "reach out / retaliate / bottle it up", paired
> with Singapore helpline resources.

## Run locally

```bash
npm install
npm run dev      # open the printed http://localhost:… URL
```

## Other scripts

```bash
npm run build                      # production build into dist/
npm run preview                    # preview the production build
node scripts/validate-scenes.mjs   # check the scene graph after editing content
```

## Deployment

Pushing to the `main` branch triggers the GitHub Actions workflow in
`.github/workflows/deploy.yml`, which builds the app and publishes it to **GitHub Pages**.
In the repository, set **Settings → Pages → Source** to **GitHub Actions** once.

## Project structure

```
src/
  data/         metrics.js (score dimensions) + chapters.js (the 4 chapters & meters)
                + scenes.js (all branching content)
  game/         reducer.js + GameContext.jsx (state machine) + scoring.js (% + tiers)
  engine/       SceneEngine.jsx (renders the current scene)
  components/   Title, Hub, DialogueBox, ChoiceList, InfoPanel, FeedbackModal,
                ScoreHUD, ChapterEndScreen, EndingScreen
  styles/       global.css
scripts/        validate-scenes.mjs (scene-graph integrity check)
```

Content lives in `src/data/`. A scene is one of three shapes — a **decision** (choices with
`effects` + `feedback`), an **info panel** (`intro` / `didYouKnow` / `tutorial` / `resources`,
advancing via `next`), or a **terminus** (`ending`). Metric score bounds are derived
automatically from the scenes, so `scoring.js` needs no manual tuning when you edit content.
Run the validator after editing.

---

Educational project based on [IMDA's online-safety resources](https://www.imda.gov.sg/regulations-and-licensing-listing/content-standards-and-classification/standards-and-classification/internet/online-safety).
