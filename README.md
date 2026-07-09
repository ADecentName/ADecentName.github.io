# SafeSteps

A short, choose-your-path **visual novel about staying safe online**, built with React + Vite.
You play **Mika**, a student, across four everyday online moments — one chapter for each of
**IMDA's four key online-safety actions**:

| Chapter | Key action | About |
|---|---|---|
| 🛡️ Late Night, Loud Chat | **Set boundaries online** | Screen-time limits, what you share, privacy settings |
| 🧠 The Screenshot | **Think before you act** | Pause before you post, forward, click, or reply |
| 🚩 Piling On | **Report inappropriate content** | Block, report, and keep evidence |
| 🤝 Are You Okay? | **Reach out & support** | Support a friend; know when to tell a trusted adult |

Each choice is scored and followed by a short explanation of *why* it was a safe or risky
move. Finish all four chapters to see a per-action results breakdown.

> IMDA's official fourth action is *"Engage & support your child"* (parent-facing). Because the
> player here is a teenager, it is reframed as *"Reach out & support"* so it is playable from a
> youth's point of view.

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
  data/         actions.js (the 4 IMDA pillars) + scenes.js (all branching content)
  game/         reducer.js + GameContext.jsx (state machine)
  engine/       SceneEngine.jsx (renders the current scene)
  components/   Title, Hub, DialogueBox, ChoiceList, FeedbackModal, ScoreHUD, endings
  styles/       global.css
scripts/        validate-scenes.mjs (scene-graph integrity check)
```

Adding or editing content is done entirely in `src/data/scenes.js` — the engine renders
whatever scene it is pointed at.

---

Educational project based on [IMDA's online-safety resources](https://www.imda.gov.sg/regulations-and-licensing-listing/content-standards-and-classification/standards-and-classification/internet/online-safety).
