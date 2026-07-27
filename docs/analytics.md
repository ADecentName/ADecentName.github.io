# Layer 1 — anonymous usage counters

The evidence the game can produce about itself: how many people started, how far
they got, where they dropped out, how well they answered, and — the important
one — **how many tapped a report walkthrough all the way to the receipt screen**.
That last number is a rehearsal of the action, not a claim about awareness, so
it is the strongest thing to put against root cause 3.

It is off by default. Nothing is sent unless `VITE_ANALYTICS_URL` is set at
build time, so local dev and forks stay silent.

## What is collected

| Event | Fields | Answers |
|---|---|---|
| `game_start` | — | how many opened the game |
| `chapter_open` | `chapter` | which action people pick first |
| `scene_view` | `chapter`, `scene` | the drop-off funnel, scene by scene |
| `choice` | `chapter`, `scene`, `pick`, `verdict` | first-attempt correct rate per scenario |
| `choice_multi` | `chapter`, `scene`, `pick` | same, for the two-answer scene |
| `tutorial_step` | `flow`, `step` | how far into a walkthrough people get |
| `tutorial_complete` | `flow` | **completed the real report / privacy flow** |
| `chapter_complete` | `chapter`, `pct`, `tier` | score distribution per chapter |
| `reflection_view`, `results_view` | `done` | how many finish all four |

Every row also carries a random per-tab id (`sid`) so one play session can be
grouped together, a timestamp, and a `test` flag.

**Testing against the live site:** open it with `?test=1` on the end of the URL
— e.g. `https://adecentname.github.io/?test=1` — and every row from that tab is
marked, so your own checks never contaminate the real numbers.

**Not collected:** names, emails, IP addresses, the reflection screen's typed
answers, or any free text. The `sid` is random, lives in `sessionStorage`, and
cannot be traced to a person. Keep the wording in the deck as "no accounts,
nothing personal collected" — the older "no data collected" line stops being
true once this is switched on.

## Endpoint: Google Apps Script → Google Sheet

Free, no server, no card, and the data lands in a Sheet you can chart straight
into the deck. (If you outgrow it, a Cloudflare Worker + D1 is the same client
code with a different URL.)

### Step 1 — the Sheet

1. Go to <https://sheets.new> (signed in with the account that will own the
   data — use one the whole group can access, not a personal side account).
2. Name it something like `SafeSteps analytics`.
3. Copy the id out of the address bar. The URL looks like
   `docs.google.com/spreadsheets/d/`**`1a2B3c…xYz`**`/edit#gid=0` — you want the
   long middle part, not the whole URL.

### Step 2 — the script

4. In that Sheet: **Extensions → Apps Script**. A new tab opens on a file
   called `Code.gs` containing an empty `myFunction`.
5. Select everything in that file and paste the script below over it.
6. On line 2, replace `PUT_YOUR_SPREADSHEET_ID_HERE` with the id from step 3.
   Keep the quotes.
7. **Ctrl+S** to save. Rename the project (top left, "Untitled project") to
   `SafeSteps analytics` so it is findable later.

### Step 3 — deploy it as a web app

8. Top right: **Deploy → New deployment**.
9. Click the **gear icon** next to "Select type" and choose **Web app**.
10. Set **Execute as: Me** and **Who has access: Anyone**.
    - It must be **Anyone**, not "Anyone with a Google account" — players are
      not signed in, and the wrong setting fails silently.
11. **Deploy**. Google will ask you to authorise: **Authorize access** → pick
    your account → you will hit a scary screen saying *"Google hasn't verified
    this app"*. That is expected for your own script: **Advanced → Go to
    SafeSteps analytics (unsafe) → Allow**.
12. Copy the **Web app URL**. It ends in `/exec`. (There is also a `/dev` URL —
    that one only works while you are signed in. Always use `/exec`.)
13. Paste the `/exec` URL into a browser tab. It should show `ok`, and nothing
    else. If it does, the endpoint is live.

> **If you edit `Code.gs` later**, the live deployment keeps running the old
> code until you publish a new version: **Deploy → Manage deployments →** pencil
> icon **→ Version: New version → Deploy**. The URL stays the same.

```javascript
// SafeSteps — receives batched anonymous events and appends them as rows.
const SHEET_ID = 'PUT_YOUR_SPREADSHEET_ID_HERE'
const TAB = 'events'
const HEADERS = [
  'received_at', 'sid', 'test', 'event', 'chapter', 'scene',
  'pick', 'verdict', 'pct', 'tier', 'flow', 'step', 'ms_since_load',
]

function doGet() {
  return ContentService.createTextOutput('ok')
}

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.waitLock(20000) // concurrent players append at the same time
  try {
    const payload = JSON.parse(e.postData.contents)
    const sid = String(payload.sid || '').slice(0, 40)
    const test = payload.test ? 1 : '' // rows from a ?test=1 tab
    const events = (payload.events || []).slice(0, 200) // cap a bad actor
    if (!events.length) return ContentService.createTextOutput('ok')

    const now = new Date()
    const rows = events.map(function (ev) {
      return [
        now, sid, test, String(ev.e || '').slice(0, 40),
        ev.chapter || '', ev.scene || '',
        ev.pick === undefined ? '' : ev.pick,
        ev.verdict || '',
        ev.pct === undefined ? '' : ev.pct,
        ev.tier || '', ev.flow || '',
        ev.step === undefined ? '' : ev.step,
        ev.t || '',
      ]
    })

    const sheet = getTab_()
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows)
    return ContentService.createTextOutput('ok')
  } catch (err) {
    console.error(err)
    return ContentService.createTextOutput('error')
  } finally {
    lock.releaseLock()
  }
}

function getTab_() {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  let sheet = ss.getSheetByName(TAB)
  if (!sheet) {
    sheet = ss.insertSheet(TAB)
    sheet.appendRow(HEADERS)
    sheet.setFrozenRows(1)
  }
  return sheet
}
```

## Wiring the URL in

### Step 4 — test locally first

14. In the project root (next to `package.json`), create a file named exactly
    `.env.local` containing one line — no quotes, no spaces around the `=`:

    ```
    VITE_ANALYTICS_URL=https://script.google.com/macros/s/AKfy…/exec
    ```

    It is already git-ignored by the `*.local` rule, so the URL never gets
    committed.
15. **Restart `npm run dev`.** Vite only reads env files at startup — a running
    dev server will not pick it up.
16. Play through one chapter, then close the tab (that forces a flush).
17. Open the Sheet. An `events` tab should have appeared with rows in it.

### Step 5 — turn it on for the live site

18. On GitHub: repo → **Settings → Secrets and variables → Actions**.
19. **New repository secret**. Name it exactly `ANALYTICS_URL`, paste the
    `/exec` URL as the value, **Add secret**.
20. Rebuild so the secret gets baked in: push any commit, or go to **Actions →
    Deploy to GitHub Pages → Run workflow**.
21. Once the run is green, play a chapter on the live URL and confirm new rows
    land in the Sheet.

### When nothing arrives

The client posts with `no-cors`, which means the browser console will not show
you the failure — so debug from the other end:

- **Apps Script → Executions** (left sidebar) lists every `doPost` call and its
  errors. No executions at all means the request never arrived: wrong URL, or
  the deployment's access is not set to **Anyone**.
- Executions present but no rows: `SHEET_ID` is wrong, or the deployment is
  running an older version of the code (see the note at the end of step 3).
- Nothing anywhere, locally: confirm the file is `.env.local` in the project
  root — not `env.local`, not inside `src/` — and that you restarted the dev
  server.
- Remember events are batched: they flush after ~10 seconds of quiet, every 25
  events, or when the tab is hidden or closed. Do not expect a row the instant
  you click something.

## Reading it — the dashboard tab

Raw event rows are unreadable by design; the aggregation lives in
[`dashboard.gs`](dashboard.gs). Paste it into the **same** Apps Script project
as the collector (**Extensions → Apps Script → +** next to Files **→ Script**,
name it `Dashboard`), save, then reload the Sheet. A **SafeSteps → Rebuild
dashboard** menu appears; run it whenever you want fresh numbers.

It writes a `dashboard` tab with five blocks, ignoring every `?test=1` row:

- **Headline** — players, finish rate, and report-walkthrough completion rate.
  These are the three numbers for the slide.
- **Drop-off** — players reaching each scene, ordered by where it falls in a
  typical run, with the single worst drop highlighted in red. That scene is the
  one to rewrite.
- **First-attempt correct rate** — per scenario, counting only each player's
  *first* answer, colour-coded red/amber/green. A low rate means the scenario
  taught something they did not already know; a high rate means it is too easy
  to be worth its slot.
- **Walkthroughs** — started vs completed per flow, with a chart. This is the
  root-cause-3 number.
- **Chapters** — completions, average meter, and the tier spread.

To keep it current without clicking: **Triggers** (clock icon in Apps Script) →
**Add trigger** → `buildDashboard`, time-driven, daily.

### Doing it by hand instead

Make a second tab and point these at `events`. Two hundred players is a few
thousand rows — well inside what a Sheet handles.

Columns are `A received_at · B sid · C test · D event · E chapter · F scene ·
G pick · H verdict · I pct · J tier · K flow · L step · M ms_since_load`. Every
formula below filters `C=""`, which drops your own `?test=1` runs.

```
Players            =COUNTA(UNIQUE(FILTER(events!B:B, events!D:D="game_start",
                                         events!C:C="")))
Finished all four  =COUNTA(UNIQUE(FILTER(events!B:B, events!D:D="results_view",
                                         events!C:C="")))
Report walkthroughs completed
                   =COUNTA(UNIQUE(FILTER(events!B:B, events!D:D="tutorial_complete",
                                         events!K:K<>"ig-privacy", events!C:C="")))
First-attempt correct, one scene
                   =COUNTIFS(events!F:F,"r_s1", events!H:H,"good", events!C:C,"")
                    / COUNTIFS(events!F:F,"r_s1", events!D:D,"choice", events!C:C,"")
```

For the funnel, pivot `scene_view` by `scene` counting distinct `sid` — the
step where the count falls off a cliff is the scene to rewrite.

Three numbers worth putting on a slide:

- **Walkthrough completion rate** — completed report flows ÷ players who reached
  a tutorial scene. Root cause 3, measured by behaviour.
- **First-attempt correct rate, chapter 1 vs chapter 4** — a learning curve from
  data you already score. Root cause 2.
- **Finish rate** — finished all four ÷ started. Whether the format holds
  attention at all, which is the premise of the whole solution.
