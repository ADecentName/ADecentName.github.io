import { useGame } from '../game/GameContext.jsx'

// Renders a scene's choices as buttons. A "continue" beat (single choice,
// no feedback) is styled as a plain advance button.
export default function ChoiceList({ scene }) {
  const { dispatch } = useGame()
  const choices = scene.choices || []
  const isContinue = choices.length === 1 && !choices[0].feedback

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
