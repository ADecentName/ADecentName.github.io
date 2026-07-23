import { useState } from 'react'

// Stylised imitations of real app screens, used purely as educational
// walkthroughs inside the game. They don't connect to anything — no login, no
// data — they just show the player where a real setting lives and let them
// practise the tap.
export default function PhoneMock({ kind }) {
  if (kind === 'ig-privacy') return <IgPrivacyMock />
  return null
}

// A mock of Instagram's "Account privacy" screen with a working Private-account
// toggle, so the player can try switching their account to private.
function IgPrivacyMock() {
  const [isPrivate, setPrivate] = useState(false)

  return (
    <figure className="phone-guide">
      <div
        className="phone-mock"
        role="group"
        aria-label="Instagram Account privacy settings — educational mockup"
      >
        <div className="ig-screen">
          <div className="ig-statusbar" aria-hidden="true">
            <span>9:41</span>
            <span>📶&nbsp;&nbsp;🔋</span>
          </div>
          <div className="ig-header">
            <span className="ig-back" aria-hidden="true">‹</span>
            <span className="ig-title">Account privacy</span>
          </div>

          <button
            type="button"
            className="ig-row"
            onClick={() => setPrivate((v) => !v)}
            aria-pressed={isPrivate}
          >
            <span className="ig-row-label">
              <span className="ig-lock" aria-hidden="true">🔒</span> Private account
            </span>
            <span className={`ig-toggle${isPrivate ? ' is-on' : ''}`} aria-hidden="true">
              <span className="ig-knob" />
            </span>
          </button>

          <p className="ig-help">
            When your account is private, only people you approve can see your photos and
            videos. Your existing followers won&rsquo;t be affected.
          </p>

          {isPrivate && (
            <div className="ig-confirm" role="status">
              ✓ Your account is now private — only people you approve can see your posts.
            </div>
          )}
        </div>
      </div>
      <figcaption className="phone-mock-caption">
        {isPrivate
          ? '🔒 Done! That single switch is the root fix. (Tap again to compare.)'
          : '👆 Try it — tap the toggle to switch your account to Private.'}
      </figcaption>
    </figure>
  )
}
