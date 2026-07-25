import { useGame } from '../game/GameContext.jsx'
import { CHAPTERS } from '../data/chapters.js'

export default function TitleScreen() {
  const { dispatch } = useGame()
  return (
    <div className="screen title-screen">
      <div className="title-card">
        <p className="title-eyebrow">An interactive online-safety game</p>
        <h1 className="title-logo">
          Safe<span>Steps</span>
        </h1>
        <p className="title-tagline">
          Welcome! Get ready to play, learn and test your knowledge. Practise the{' '}
          <strong>four key online-safety actions</strong> by IMDA — think carefully, make
          smart choices, and see how safe you can stay online.
        </p>

        <ul className="title-pillars" aria-label="The four online-safety actions">
          {CHAPTERS.map((c) => (
            <li key={c.id} style={{ borderColor: c.color }}>
              <span className="pillar-emoji">{c.emoji}</span>
              <span>{c.officialTitle}</span>
            </li>
          ))}
        </ul>

        <button className="btn btn-primary btn-lg" onClick={() => dispatch({ type: 'START' })}>
          Start playing
        </button>
        <p className="title-credit">Have fun playing while learning!</p>
      </div>
    </div>
  )
}
