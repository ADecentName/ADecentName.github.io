import { useGame } from '../game/GameContext.jsx'
import { CHAPTERS } from '../data/chapters.js'

export default function TitleScreen() {
  const { dispatch } = useGame()
  return (
    <div className="screen title-screen">
      <div className="title-card">
        <p className="title-eyebrow">Welcome to</p>
        <h1 className="title-logo">
          Safe<span>Steps</span>
        </h1>
        <p className="title-tagline">
          Get ready to play, learn and test your knowledge! This interactive educational
          game will help you learn and practise the <strong>four key online safety
          actions</strong> by IMDA. Think carefully, make smart choices, and see how well
          you can stay safe online.
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
