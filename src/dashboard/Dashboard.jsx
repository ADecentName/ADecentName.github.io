// Reads GET /dashboard.json from the Worker and renders the same five blocks the
// Sheets dashboard did.
//
// The key is NOT baked into this bundle. This page ships publicly, so anything
// compiled in would be readable by anyone who views source — that is not a
// secret, it is a decoration. Instead it comes from ?key= on the URL or is typed
// in once and remembered in localStorage on the reader's own machine.

import React, { useCallback, useEffect, useState } from 'react'

const API = import.meta.env.VITE_DASHBOARD_URL || ''
const STORE = 'ss_dashboard_key'

function readKey() {
  try {
    const fromUrl = new URLSearchParams(location.search).get('key')
    if (fromUrl) {
      localStorage.setItem(STORE, fromUrl)
      return fromUrl
    }
    return localStorage.getItem(STORE) || ''
  } catch {
    return ''
  }
}

export default function Dashboard() {
  const [key, setKey] = useState(readKey)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (k) => {
    if (!API) {
      setError('VITE_DASHBOARD_URL was not set at build time, so this page has no endpoint to read.')
      return
    }
    if (!k) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}?key=${encodeURIComponent(k)}`)
      if (res.status === 401) {
        setError('That key was rejected.')
        setData(null)
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (e) {
      setError(`Could not reach the analytics endpoint (${e.message}).`)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(key) }, [load, key])

  if (!key) {
    return (
      <main className="dash">
        <h1>SafeSteps — dashboard</h1>
        <p className="muted">Aggregate counts only. No personal data is collected or stored.</p>
        <form
          className="keyform"
          onSubmit={(e) => {
            e.preventDefault()
            const v = new FormData(e.currentTarget).get('key')
            try { localStorage.setItem(STORE, v) } catch { /* private mode */ }
            setKey(v)
          }}
        >
          <label htmlFor="key">Dashboard key</label>
          <input id="key" name="key" type="password" autoComplete="off" required />
          <button type="submit">Open</button>
        </form>
        {error && <p className="error">{error}</p>}
      </main>
    )
  }

  return (
    <main className="dash">
      <header className="dash-head">
        <h1>SafeSteps — dashboard</h1>
        <button className="ghost" onClick={() => load(key)} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
        <button
          className="ghost"
          onClick={() => {
            try { localStorage.removeItem(STORE) } catch { /* private mode */ }
            setKey('')
            setData(null)
          }}
        >
          Forget key
        </button>
      </header>

      {error && <p className="error">{error}</p>}
      {!data && !error && <p className="muted">Loading…</p>}

      {data && (
        <>
          <Diagnostic d={data} />
          {data.counting_test_rows && (
            <p className="warn">
              AGGREGATE_TEST_ROWS is on — these totals include seeded rows and are not reportable.
            </p>
          )}
          {!data.headline.players ? (
            <p className="muted">
              Nothing aggregated yet.
              {data.raw_waiting
                ? ` ${data.raw_waiting} raw rows are still inside the ${data.settle_minutes}-minute settle window.`
                : ''}
            </p>
          ) : (
            <>
              <Headline d={data} />
              <Funnel rows={data.funnel} />
              <Accuracy rows={data.accuracy} />
              <Walkthroughs rows={data.walkthroughs} />
              <Chapters rows={data.chapters} />
            </>
          )}
        </>
      )}
    </main>
  )
}

// An empty report is nearly always a pipeline problem, not an absence of players
// — so say what was found before showing any numbers.
function Diagnostic({ d }) {
  return (
    <p className="diag">
      schema v{d.schema_version} · {d.sessions_aggregated} sessions aggregated ·{' '}
      {d.rows_purged} raw rows purged · {d.raw_waiting} not yet settled · last run{' '}
      {d.last_run ? new Date(d.last_run).toLocaleString() : 'never'}
    </p>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function Headline({ d }) {
  const h = d.headline
  return (
    <Section title="Headline">
      <table>
        <tbody>
          <Stat label="Players" value={h.players} note="Anyone who opened the game" />
          <Stat
            label="Finished all four chapters"
            value={h.finishers}
            rate={h.finish_rate}
            note="Does the format hold attention?"
          />
          <Stat
            label="Completed a report walkthrough"
            value={h.finished_report}
            rate={h.report_completion_rate}
            note="Root cause 3 — share of those who reached one"
          />
        </tbody>
      </table>
    </Section>
  )
}

function Stat({ label, value, rate, note }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className="num">{value}</td>
      <td className="num">{rate === null || rate === undefined ? '' : `${rate}%`}</td>
      <td className="note">{note}</td>
    </tr>
  )
}

function Funnel({ rows }) {
  if (!rows || !rows.length) return null
  // Highlight the worst single drop — the scene most worth rewriting.
  let worst = 0
  rows.forEach((r) => { if ((r.lost_here || 0) > worst) worst = r.lost_here || 0 })
  return (
    <Section title="Drop-off — players who reached each scene">
      <table>
        <thead>
          <tr><th>Scene</th><th className="num">Players</th><th className="num">% of start</th><th className="num">Lost here</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.scene} className={worst > 0 && r.lost_here === worst ? 'bad-row' : ''}>
              <th scope="row">{r.scene}</th>
              <td className="num">{r.players}</td>
              <td className="num">{r.pct_of_start === null ? '' : `${r.pct_of_start}%`}</td>
              <td className="num">{r.lost_here === null ? '' : `-${r.lost_here}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Bars rows={rows.map((r) => ({ label: r.scene, value: r.players }))} />
    </Section>
  )
}

function Accuracy({ rows }) {
  if (!rows || !rows.length) return null
  const band = (rate) => (rate < 34 ? 'bad' : rate < 67 ? 'mid' : 'good')
  return (
    <Section title="First-attempt correct rate — did they already know?">
      <table>
        <thead>
          <tr><th>Scenario</th><th className="num">Correct</th><th className="num">Answers</th><th className="num">Rate</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.scene}>
              <th scope="row">{r.scene}</th>
              <td className="num">{r.correct}</td>
              <td className="num">{r.answers}</td>
              <td className={`num cell-${band(r.rate ?? 0)}`}>{r.rate === null ? '' : `${r.rate}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}

function Walkthroughs({ rows }) {
  if (!rows || !rows.length) return null
  return (
    <Section title="Walkthroughs — reached vs completed">
      <table>
        <thead>
          <tr><th>Flow</th><th className="num">Started</th><th className="num">Completed</th><th className="num">Rate</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.flow}>
              <th scope="row">{r.flow}</th>
              <td className="num">{r.started}</td>
              <td className="num">{r.completed}</td>
              <td className="num">{r.rate === null ? '' : `${r.rate}%`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Bars rows={rows.map((r) => ({ label: r.flow, value: r.completed }))} />
    </Section>
  )
}

function Chapters({ rows }) {
  if (!rows || !rows.length) return null
  return (
    <Section title="Chapters — completions and scores">
      <table>
        <thead>
          <tr><th>Chapter</th><th className="num">Completions</th><th className="num">Avg meter</th><th>Tiers</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.chapter}>
              <th scope="row">{r.chapter}</th>
              <td className="num">{r.completions}</td>
              <td className="num">{r.avg_meter === null ? '' : `${r.avg_meter}%`}</td>
              <td className="note">{r.tiers.map((t) => `${t.tier} ×${t.n}`).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  )
}

// Inline CSS bars rather than a charting library — one dependency avoided, and it
// prints and scales without a canvas.
function Bars({ rows }) {
  const max = rows.reduce((m, r) => Math.max(m, r.value), 0)
  if (!max) return null
  return (
    <ul className="bars">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="bar-label">{r.label}</span>
          <span className="bar-track">
            <span className="bar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="bar-value">{r.value}</span>
        </li>
      ))}
    </ul>
  )
}
