import { CHARACTERS } from '../data/scenes.js'

// The visual-novel dialogue plate: speaker name + the scene's line of text.
export default function DialogueBox({ scene }) {
  const character = CHARACTERS[scene.speaker] || { name: scene.speaker, color: '#cbd5e1' }
  return (
    <div className="dialogue-box">
      {character.name && (
        <div className="dialogue-speaker" style={{ color: character.color }}>
          {character.name}
        </div>
      )}
      <p className="dialogue-text">{scene.text}</p>
    </div>
  )
}
