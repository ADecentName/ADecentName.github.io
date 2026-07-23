import { useState } from 'react'

// Stylised imitations of real app screens, used purely as educational
// walkthroughs inside the game. They don't connect to anything — no login, no
// data — they just show the player where a real setting lives and let them
// practise the tap.
export default function PhoneMock({ kind }) {
  if (kind === 'ig-privacy') return <IgPrivacyMock />
  return null
}

// A mock of Instagram's "Account privacy" screen, laid out to match the real
// page: a "Who can see your content" section with a "Private account" toggle,
// and help text that swaps between the public and private descriptions exactly
// as the live setting does.
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

          <p className="ig-section">Who can see your content</p>

          <button
            type="button"
            className="ig-row"
            onClick={() => setPrivate((v) => !v)}
            aria-pressed={isPrivate}
          >
            <span className="ig-row-label">Private account</span>
            <span className={`ig-toggle${isPrivate ? ' is-on' : ''}`} aria-hidden="true">
              <span className="ig-knob" />
            </span>
          </button>

          <p className="ig-help">
            {isPrivate
              ? 'When your account is private, only the followers you approve can see what you share, including your photos or videos on hashtag and location pages, and your followers and following lists. Certain info on your profile, like your profile picture and username, is visible to everyone on and off Instagram.'
              : "When your account is public, your profile and posts can be seen by anyone, on or off Instagram, even if they don't have an Instagram account."}
          </p>
        </div>
      </div>

      <figcaption className="phone-mock-caption">
        {isPrivate
          ? '🔒 Private is on — that single switch is the root fix. (Tap again to compare.)'
          : '👆 Try it — tap the toggle to switch your account to Private.'}
      </figcaption>
    </figure>
  )
}
