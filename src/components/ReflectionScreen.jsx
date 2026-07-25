import { useState } from 'react'
import { useGame } from '../game/GameContext.jsx'
import { CHAPTERS } from '../data/chapters.js'

// Shown once all four actions are played, before the final results: a short
// self-check on what the player actually took away.
//
// Answers live in this component's state only — nothing is stored, sent or
// scored. Players mark themselves by revealing the model answers, which keeps
// the game's "no accounts, no data collected" promise intact.
const LIKERT = ['Very unlikely', 'Unlikely', 'Neutral', 'Likely', 'Very likely']

export default function ReflectionScreen() {
  const { dispatch } = useGame()
  const [named, setNamed] = useState(['', '', '', ''])
  const [meaning, setMeaning] = useState('')
  const [likely, setLikely] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const setNameAt = (i, v) => setNamed((prev) => prev.map((p, j) => (j === i ? v : p)))

  return (
    <div className="screen reflection-screen">
      <div className="reflection-card">
        <p className="title-eyebrow">Before your results</p>
        <h1>What did you take away?</h1>
        <p className="reflection-intro">
          Three quick questions. Nothing here is saved or sent anywhere — answer them, then
          check yourself against the model answers.
        </p>

        <section className="reflection-q">
          <h2>
            <span className="reflection-num">1</span> What are the four key online safety
            actions you learnt from the game?
          </h2>
          <div className="reflection-inputs">
            {named.map((value, i) => (
              <label key={i} className="reflection-field">
                <span className="reflection-field-num">{i + 1}.</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setNameAt(i, e.target.value)}
                  placeholder={`Action ${i + 1}`}
                  autoComplete="off"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="reflection-q">
          <h2>
            <span className="reflection-num">2</span> Briefly explain what each action means.
          </h2>
          <textarea
            className="reflection-textarea"
            rows={6}
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder="In your own words…"
          />
        </section>

        <section className="reflection-q">
          <h2>
            <span className="reflection-num">3</span> After playing the game, how likely are you
            to practise the four key online safety actions?
          </h2>
          <div className="reflection-likert" role="group" aria-label="How likely are you">
            {LIKERT.map((option) => (
              <button
                key={option}
                type="button"
                className={`btn btn-likert${likely === option ? ' is-picked' : ''}`}
                aria-pressed={likely === option}
                onClick={() => setLikely(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        {revealed ? (
          <div className="reflection-answers">
            <p className="reflection-answers-head">✅ The four key online safety actions</p>
            <ol className="reflection-answers-list">
              {CHAPTERS.map((c) => (
                <li key={c.id}>
                  <strong style={{ color: c.color }}>
                    {c.emoji} {c.officialTitle}
                  </strong>
                  <span>{c.short}</span>
                </li>
              ))}
            </ol>
            <p className="reflection-answers-foot">
              How did you do? Anything you couldn&rsquo;t name is worth replaying — that chapter
              is the one that hasn&rsquo;t stuck yet.
            </p>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={() => setRevealed(true)}>
            Show me the answers
          </button>
        )}

        <div className="end-actions">
          <button className="btn btn-primary btn-lg" onClick={() => dispatch({ type: 'SHOW_ENDING' })}>
            See my results →
          </button>
        </div>
      </div>
    </div>
  )
}
