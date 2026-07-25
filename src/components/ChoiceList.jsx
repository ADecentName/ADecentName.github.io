import { useState } from 'react'
import { useGame } from '../game/GameContext.jsx'

// Renders a scene's choices as buttons. A "continue" beat (single choice,
// no feedback) is styled as a plain advance button. A scene with `select: n`
// asks the player to pick n options and confirm.
export default function ChoiceList({ scene }) {
  const { dispatch } = useGame()
  const choices = scene.choices || []
  const isContinue = choices.length === 1 && !choices[0].feedback

  if (scene.select > 1) return <MultiChoiceList scene={scene} count={scene.select} />

  return (
    <div className={`choice-list${isContinue ? ' is-continue' : ''}`}>
      {choices.map((choice, i) => (
        <button
          key={i}
          className={isContinue ? 'btn btn-continue' : 'btn btn-choice'}
          onClick={() => dispatch({ type: 'CHOOSE', choice })}
        >
          {choice.label}
        </button>
      ))}
    </div>
  )
}

// "Pick the two best actions" — toggle selections, then confirm. Selecting
// beyond the limit drops the oldest pick so the player is never stuck.
function MultiChoiceList({ scene, count }) {
  const { dispatch } = useGame()
  const [picked, setPicked] = useState([])
  const choices = scene.choices || []

  const toggle = (i) =>
    setPicked((prev) =>
      prev.includes(i)
        ? prev.filter((p) => p !== i)
        : [...prev, i].slice(-count),
    )

  const ready = picked.length === count

  return (
    <div className="choice-list is-multi">
      <p className="choice-multi-hint">
        Select {count} — {picked.length}/{count} chosen
      </p>
      {choices.map((choice, i) => {
        const on = picked.includes(i)
        return (
          <button
            key={i}
            type="button"
            className={`btn btn-choice btn-choice-multi${on ? ' is-picked' : ''}`}
            aria-pressed={on}
            onClick={() => toggle(i)}
          >
            <span className="choice-check" aria-hidden="true">
              {on ? '✓' : ''}
            </span>
            {choice.label}
          </button>
        )
      })}
      <button
        className="btn btn-primary btn-confirm"
        disabled={!ready}
        onClick={() =>
          dispatch({ type: 'CHOOSE_MULTI', choices: picked.map((i) => choices[i]) })
        }
      >
        {ready ? 'Confirm my answers →' : `Pick ${count - picked.length} more`}
      </button>
    </div>
  )
}
