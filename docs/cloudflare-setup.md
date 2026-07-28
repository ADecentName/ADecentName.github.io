# Deploying SafeSteps to Cloudflare — first-time runbook

Takes the repo from "nothing deployed" to "game, dashboard and analytics live on
your own domain, redeploying on every push". Written to be followed top to bottom
by someone who has never used Cloudflare.

**Time:** about 45 minutes, plus however long the domain takes to register.
**Cost:** free, except the domain (~US$10–12/yr, or ~S$40–60 for a `.sg`).

**Prerequisites:** Node 20+, the repo cloned, and this branch checked out. All
commands assume **PowerShell** — see the warning at E1 for why Git Bash breaks one
of them.

Reference material lives in [`../worker/README.md`](../worker/README.md): what the
Worker does, how the aggregation works, and the traps in its §8.

---

## Phase A — Cloudflare account

**A1.** Sign up at <https://dash.cloudflare.com>. Free, no card needed.

**A2.** When prompted, pick your `workers.dev` subdomain (e.g. `van-vuong`). If you
skip it, the first `wrangler deploy` asks again.

**A3.** Note your **Account ID** — dashboard right sidebar, or **Workers & Pages**
→ the ID under your account name. Needed in Phase I.

---

## Phase B — Install and authorise wrangler

**B1.**

```
cd C:\Work\ADecentName.github.io\worker
npm install
```

**B2.** Log in. Opens a browser:

```
npx wrangler login
```

> **Checkpoint:** `npx wrangler whoami` shows your email and account.

---

## Phase C — Create the database

**C1.**

```
npx wrangler d1 create safesteps
```

**C2.** It prints a block like:

```toml
[[d1_databases]]
binding = "DB"
database_name = "safesteps"
database_id = "a1b2c3d4-...."
```

Copy that `database_id` into `worker/wrangler.toml`, replacing
`PUT_YOUR_D1_DATABASE_ID_HERE`. Keep the quotes. It is an identifier, not a
credential — safe to commit.

**C3.** Create the tables:

```
npx wrangler d1 migrations apply safesteps --remote
```

> **Checkpoint:**
> ```
> npx wrangler d1 execute safesteps --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
> ```
> Lists `events`, `agg_headline`, `agg_scene`, `agg_flow`, `agg_chapter`,
> `agg_tier`, `seen_sid`, `meta`.

---

## Phase D — Dashboard key

**D1.** Generate one:

```
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

**D2.** Store it as a Worker secret:

```
npx wrangler secret put DASHBOARD_KEY
```

Paste when prompted. **Save the string somewhere** — it is write-only from here,
and it is how you open the dashboard.

---

## Phase E — First deploy

**E1.** Build the site.

> ⚠️ **Use PowerShell, not Git Bash.** Git Bash rewrites an env var whose value
> starts with `/` into a Windows path, so `VITE_ANALYTICS_URL=/collect` silently
> becomes `C:/Program Files/Git/collect`. CI runs Linux and is unaffected — this
> only bites manual builds. In Git Bash, prefix with `MSYS_NO_PATHCONV=1`.

The Worker ships whatever is in `dist/`, and a build **without** these env vars
produces a site with the counters silently disabled — which then makes Phase F look
broken for no reason.

```
cd C:\Work\ADecentName.github.io
$env:VITE_ANALYTICS_URL='/collect'; $env:VITE_DASHBOARD_URL='/dashboard.json'; $env:VITE_BASE='/'; npm run build
```

**E2.** Deploy:

```
cd worker
npx wrangler deploy
```

**E3.** Note the URL it prints: `https://safesteps.<subdomain>.workers.dev`

> **Checkpoint** — all three surfaces:
> ```
> curl https://safesteps.<subdomain>.workers.dev/health
> curl -sI https://safesteps.<subdomain>.workers.dev/ | Select-Object -First 1
> curl -sI https://safesteps.<subdomain>.workers.dev/dashboard/ | Select-Object -First 1
> ```
> Expect `ok`, `HTTP/2 200`, `HTTP/2 200`. Open the URL in a browser and play a
> little — the game should work fully.

---

## Phase F — Verify collection

**F1.** Open `https://safesteps.<subdomain>.workers.dev/?test=1`, play through one
chapter, then **close the tab** — that forces the flush.

**F2.** Check rows landed:

```
npx wrangler d1 execute safesteps --remote --command "SELECT COUNT(*) AS n FROM events"
```

Non-zero means client → Worker → D1 works. This touches no aggregates and needs no
config changes.

**If it is zero:** run `npx wrangler tail` in a second terminal and replay. The most
likely cause is E1 having been run without the env vars — check the browser console
for a request to `/collect`.

---

## Phase G — Verify aggregation

The fiddly part. It temporarily disables two safety guards, so read G6 and G7
before you start.

**G1.** In `worker/wrangler.toml` set:

```toml
SETTLE_MINUTES = "0"
AGGREGATE_TEST_ROWS = "true"
```

**G2.** `npx wrangler deploy`

**G3.** Trigger it:

```
curl -X POST "https://safesteps.<subdomain>.workers.dev/admin/aggregate?key=YOUR_KEY"
```

Returns `{"sessions":N,"rows":M,"chunks":1}`.

**G4.** Open `/dashboard/`, paste the key, confirm the five blocks render with
sensible numbers.

**G5.** Confirm the purge happened:

```
npx wrangler d1 execute safesteps --remote --command "SELECT COUNT(*) AS n FROM events"
```

Back to 0 — the rows were folded in and deleted.

**G6. Revert — not optional.** Set `SETTLE_MINUTES = "45"` and
`AGGREGATE_TEST_ROWS = "false"`, then `npx wrangler deploy`.

**G7.** Reset the aggregates so the test session is not in the real totals:

```
npx wrangler d1 execute safesteps --remote --command "DELETE FROM agg_headline; DELETE FROM agg_scene; DELETE FROM agg_flow; DELETE FROM agg_chapter; DELETE FROM agg_tier; DELETE FROM seen_sid; DELETE FROM meta WHERE key IN ('last_run','sessions_aggregated','rows_purged');"
```

Leaving `AGGREGATE_TEST_ROWS` on quietly folds fake sessions into real numbers, and
once raw rows are purged they cannot be subtracted again. **G6 and G7 are the two
steps not to skip.**

`SETTLE_MINUTES = "0"` also means a session can be aggregated while it is still
being played, which is exactly the split-session double-count the setting exists to
prevent. Never leave it at `0` with real players.

---

## Phase H — Custom domain

Optional to deploy, but strongly advised before a school pilot:
**`*.workers.dev` is a shared subdomain that gets abused, so some school and
corporate networks block it wholesale** — and since the game itself is served from
there, a block means students cannot play at all. A custom domain routes around it.

**H1.** Buy it. **Domain Registration** in the Cloudflare sidebar for
`.com`/`.org`/`.net` — at-cost, no markup, and no DNS work since the domain already
lives at Cloudflare. For `.sg`, buy from an SGNIC-accredited reseller and point its
nameservers at Cloudflare via **Add a site**.

**H2.** **Workers & Pages** → `safesteps` → **Settings** → **Domains & Routes** →
**Add** → **Custom domain**.

**H3.** Enter the hostname — apex (`safesteps.org`) or subdomain
(`play.safesteps.org`). Cloudflare creates the DNS record and issues the TLS
certificate automatically.

> **Checkpoint:** `curl https://<your-domain>/health` returns `ok`. The
> `workers.dev` URL keeps working alongside it, which is handy for your own testing.

Nothing in the code changes — the analytics endpoints are relative paths, so they
follow whatever hostname serves the page.

---

## Phase I — Automate deploys

**I1.** Repo → **Settings → Secrets and variables → Actions** → add:

| Secret | Value |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | from A3 |
| `CLOUDFLARE_API_TOKEN` | My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** template, then add **D1: Edit** |

**I2.** Optional but useful — a repository **variable** (not a secret) `SITE_URL` set
to `https://<your-domain>`, so CI smoke-tests `/health`, `/` and `/dashboard/` after
each deploy.

**I3.** Commit the `database_id` and the reverted vars:

```
cd C:\Work\ADecentName.github.io
git add worker/wrangler.toml
git commit -m "Point wrangler at the created D1 database"
git push
```

**I4.** Merge the PR. That triggers `.github/workflows/deploy.yml`, which builds,
validates the scene graph, tests the aggregation, migrates and deploys. Watch it go
green in **Actions**.

> Merging **before** I1 and I3 will fail the workflow — no credentials, and no
> `database_id`. That is expected, not a broken branch.

---

## Phase J — Clean up

**J1.** Turn off GitHub Pages: **Settings → Pages → Source → None**. Otherwise
`adecentname.github.io` serves a stale copy of the game indefinitely, which is worse
than serving nothing.

**J2.** Update the URL references now that the domain is real:

- `HANDOVER.md` line 7 — the live URL placeholder
- `worker/README.md` §1 and §7 — the `workers.dev` examples
- `HANDOVER.md` — the `*.workers.dev` blocking warning becomes historical
- `docs/analytics.md` — the `<your-domain>` placeholder in the `?test=1` note

**J3.** Decide on `docs/dashboard.gs` — ~500 lines of legacy Apps Script, kept only
for reading the historical Google Sheet. Delete it and the Apps Script half of
`docs/analytics.md` once you are sure nobody needs the old Sheet.

---

## Before real students

**J4.** Load the game on the school's **actual wifi**. With a custom domain this
should be fine, but confirm rather than assume — and do a `?test=1` playthrough from
that network so you know collection works there too.

**J5.** Then the things already on the list in `HANDOVER.md` §7: run the pilot, the
pre/post survey, the comparison group, and film the video.

---

## Which steps need a browser

A1–A2, B2, H1–H3, I1–I2, J1. Everything else is terminal.

## If something goes wrong

| Symptom | Look at |
|---|---|
| `/` returns 404 | `npm run build` was not run, or `dist/` is empty |
| Game loads, no rows in `events` | E1 built without the env vars — check the console for `/collect` |
| `/dashboard.json` returns 401 | wrong key, or `DASHBOARD_KEY` was never set (D2) |
| Dashboard renders but all zeros | nothing aggregated yet; the diagnostic line says how many rows are still settling |
| `d1 migrations apply` cannot find the database | `database_id` still says `PUT_YOUR_D1_DATABASE_ID_HERE` |
| Anything server-side | `npx wrangler tail` |
