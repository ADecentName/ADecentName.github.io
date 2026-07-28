# SafeSteps on Cloudflare — one Worker serves everything

The game, the dashboard page and the analytics API all run from a single Cloudflare
Worker on one hostname. Nothing depends on GitHub Pages, and nothing depends on a
personal Google account.

```
/                     the game            (static asset)
/dashboard/           the report page     (static asset)
POST /collect         batched anonymous events
GET  /dashboard.json  the aggregates, key-gated
GET  /health          returns "ok"
POST /admin/aggregate aggregate now instead of waiting for the cron, key-gated
cron  hourly          fold settled sessions into agg_*, delete their raw rows
```

Static assets are matched first; only non-file paths fall through to
`src/index.js`. Because the game is served by the same Worker it posts to, the
requests are **same-origin** — there is no CORS to get wrong, and the endpoints are
plain relative paths (`/collect`), so there is no URL to keep in sync.

## How it stays small forever

`events` is transient. Every hour the cron finds sessions quiet for
`SETTLE_MINUTES`, folds them into the `agg_*` tables, and deletes their rows — in a
single D1 batch, which is one transaction. Either the numbers move and the rows go,
or neither happens.

Everything stored is a **count or a sum**, never a percentage or an average: those
cannot be merged across runs without silently weighting a 3-player week like a
300-player one. Rates are computed when `/dashboard.json` is read.

**The trade.** After a purge you can only compute the metrics `agg_*` already
stores. They are marginal counts, not joint ones, so a *new* question about a past
period ("did players who failed `r_s1` drop out more often?") is permanently
unanswerable. **Add a metric before the data it needs is purged**, not after.

---

## 1. First-time setup

> **For a first deploy, follow [`../docs/cloudflare-setup.md`](../docs/cloudflare-setup.md)
> instead** — it is the same steps plus the account setup, the domain, the
> verification passes and the CI wiring, in order, with checkpoints. What follows
> here is the short version for someone who already knows the platform.

You need a Cloudflare account (free, no card). No domain required — see §7 for the
one reason you may want one anyway.

```bash
# from the repo root — the Worker deploys ../dist, so the site must exist first
npm ci
npm run build

cd worker
npm install
npx wrangler login                 # opens a browser
npx wrangler d1 create safesteps   # prints a database_id
```

Paste that `database_id` into `wrangler.toml` over
`PUT_YOUR_D1_DATABASE_ID_HERE`. Then:

```bash
npx wrangler d1 migrations apply safesteps --remote   # create the tables
npx wrangler secret put DASHBOARD_KEY                 # paste a long random string
npx wrangler deploy
```

Generate the key with:

```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

`deploy` prints the URL, e.g. `https://safesteps.<subdomain>.workers.dev`. Check
all three surfaces:

```bash
curl https://safesteps.<subdomain>.workers.dev/health   # -> ok
curl -sI https://safesteps.<subdomain>.workers.dev/      | head -1   # -> 200
curl -sI https://safesteps.<subdomain>.workers.dev/dashboard/ | head -1   # -> 200
```

## 2. Continuous deployment

Two repository secrets (**Settings → Secrets and variables → Actions**) and every
push to `main` builds the site, runs the tests, migrates and deploys:

| Secret | Where |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → **Edit Cloudflare Workers** template, then add **D1: Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard, right-hand sidebar |

Optionally set a repository **variable** `SITE_URL` to your Worker origin and the
workflow smoke-tests `/health`, `/` and `/dashboard/` after each deploy.

There are **no URL secrets to configure.** The endpoints are same-origin relative
paths set in the workflow. `DASHBOARD_KEY` is a Worker secret, set once in §1, and
survives deploys.

> Pushing anything under `.github/workflows/` needs a token with `workflow` scope.
> If a push is rejected for that: `gh auth refresh -h github.com -s workflow`.

## 3. Local development

```bash
npm run dev        # the game, at localhost:5173 — analytics off by default
```

Counters stay silent locally unless you set them in `.env.local` (git-ignored):

```
VITE_ANALYTICS_URL=/collect
VITE_DASHBOARD_URL=/dashboard.json
```

…but relative paths only resolve against a server that has the Worker routes, so
for end-to-end testing run the Worker instead:

```bash
cd worker
npx wrangler dev            # serves ../dist AND the API on one port
npx wrangler dev --test-scheduled   # then hit /__scheduled to fire the cron
```

> **Windows/Git Bash gotcha.** Git Bash rewrites an env var whose value starts with
> `/` into a Windows path, so `VITE_ANALYTICS_URL=/collect npm run build` silently
> bakes in `C:/Program Files/Git/collect`. Use PowerShell (`$env:VITE_ANALYTICS_URL
> = '/collect'`), or prefix with `MSYS_NO_PATHCONV=1`. CI runs Linux and is
> unaffected.

## 4. Reading the numbers

`https://<your-worker>/dashboard/` — paste the `DASHBOARD_KEY` once and it is
remembered on that machine. Or straight from the API:

```bash
curl "https://<your-worker>/dashboard.json?key=YOUR_KEY" | jq .headline
```

The diagnostic line at the top reports sessions aggregated, rows purged, rows still
inside the settle window, and when the cron last ran. An empty report is nearly
always a pipeline problem, not an absence of players — read that line first.

Inspect the tables directly if you prefer:

```bash
npx wrangler d1 execute safesteps --remote --command "SELECT * FROM agg_scene"
```

## 5. Previewing with seeded data

```bash
node scripts/seed-analytics.mjs 40     # 40 fake sessions, all flagged test
DRY=1 node scripts/seed-analytics.mjs 40   # build them, send nothing
```

Flagged rows are purged like any other but never counted. To see them:

1. Set `AGGREGATE_TEST_ROWS = "true"` in `wrangler.toml`, `npx wrangler deploy`.
2. Drop `SETTLE_MINUTES` to `"0"` if you do not want to wait 45 minutes, deploy.
3. `curl -X POST "https://<your-worker>/admin/aggregate?key=YOUR_KEY"`.
4. Read the dashboard.
5. **Set both back**, deploy, and reset the aggregates (§6).

Seeded sessions folded into the real totals cannot be subtracted once their raw rows
are purged. Resetting is the only way back — which is why step 5 is not optional.

`SETTLE_MINUTES = "0"` means a session can be aggregated while it is still being
played, which is exactly the split-session double-count the setting exists to
prevent. Never leave it at `0` with real players.

## 6. Resetting the aggregates

Destructive — throws away every stored number, and purged raw events cannot be
recomputed.

```bash
npx wrangler d1 execute safesteps --remote --command \
  "DELETE FROM agg_headline; DELETE FROM agg_scene; DELETE FROM agg_flow; \
   DELETE FROM agg_chapter; DELETE FROM agg_tier; DELETE FROM seen_sid; \
   DELETE FROM meta WHERE key IN ('last_run','sessions_aggregated','rows_purged');"
```

## 7. Do you need a domain?

Not to deploy — `*.workers.dev` is free and works. But now that the **game** is
served from it, this matters more than it did when only analytics lived there:

**`*.workers.dev` is a shared subdomain that gets abused, so some school and
corporate networks block it wholesale.** On GitHub Pages that risk fell only on the
analytics; here it falls on the game. A blocked network means students cannot play
at all.

For a school pilot, either buy a domain (~$10–12/yr, Cloudflare Registrar is
cheapest and needs no DNS work) or test on the school's actual wifi first. Adding
one to a deployed Worker:

1. Cloudflare dashboard → **Workers & Pages** → `safesteps` → **Settings** →
   **Domains & Routes** → **Add** → **Custom domain**.
2. Enter e.g. `safesteps.example.sg`. Cloudflare creates the DNS record and the
   certificate; the `workers.dev` URL keeps working alongside it.

Nothing in the code changes — the endpoints are relative, so they follow whatever
hostname serves the page.

## 8. Things that will bite you

- **`wrangler deploy` uploads `../dist`.** Run `npm run build` from the repo root
  first, or you will ship whatever the last build left there. CI always builds fresh.
- **Aggregation is not reversible.** Raw rows are deleted once folded in. The D1
  batch makes it atomic, so a crash cannot half-apply it — but a wrong *metric
  definition* shipped for a week is a week of numbers you cannot recompute.
- **The last ~45 minutes of play is never on the dashboard.** Sessions must settle
  first. The diagnostic line says how many rows are waiting.
- **`?test=1` rows are never counted.** That looks exactly like "the analytics are
  broken" — check the diagnostic line.
- **Failures are visible now.** Same-origin posts, real status codes, so a broken
  endpoint shows up in the browser console. Server side: `npx wrangler tail`.
- **IP addresses are deliberately never read.** Cloudflare offers
  `CF-Connecting-IP` on every request; using it would break the "nothing personal
  collected" promise. Do not add it for debugging.
- **Free-tier limits** are 100k Worker requests/day and 5 GB D1. Static asset
  requests do not count against the Worker request limit. A class of 30 is a few
  hundred API calls, and the purge keeps `events` near-empty.

## 9. What replaced what

| Old | New |
|---|---|
| GitHub Pages hosting | Worker static assets, same origin as the API |
| Apps Script `doPost` collector | `POST /collect` |
| `docs/dashboard.gs` menu rebuild | hourly cron + `GET /dashboard.json` |
| Sheets `events` tab | D1 `events` table (purged hourly) |
| Sheets `agg`/`dashboard` tabs | D1 `agg_*` tables + `/dashboard/` page |
| Batch tokens, pending deltas, crash recovery | one atomic D1 batch |
| Two deploy workflows | one `.github/workflows/deploy.yml` |
| Manual **Deploy → New version** | push to `main` |

`docs/dashboard.gs` and the Apps Script half of `docs/analytics.md` are kept only
for reading the historical Sheet. They are no longer the live pipeline.
