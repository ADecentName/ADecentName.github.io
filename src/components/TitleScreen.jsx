import { useGame } from '../game/GameContext.jsx'
import { ACTIONS } from '../data/actions.js'

export default function TitleScreen() {
  const { dispatch } = useGame()
  return (
    <div className="screen title-screen">
      <div className="title-card">
        <p className="title-eyebrow">An online-safety story</p>
        <h1 className="title-logo">
          Safe<span>Steps</span>
        </h1>
        <p className="title-tagline">
          You are <strong>Mika</strong>. Over four everyday moments online, your choices
          decide how the story goes — and how safe you keep yourself and your friends.
        </p>

        <ul className="title-pillars" aria-label="The four online-safety actions">
          {ACTIONS.map((a) => (
            <li key={a.id} style={{ borderColor: a.color }}>
              <span className="pillar-emoji">{a.emoji}</span>
              <span>{a.officialTitle}</span>
            </li>
          ))}
        </ul>

        <button className="btn btn-primary btn-lg" onClick={() => dispatch({ type: 'START' })}>
          Start
        </button>
        <p className="title-credit">
          Based on IMDA&rsquo;s four key online-safety actions.
        </p>
      </div>
    </div>
  )
}
