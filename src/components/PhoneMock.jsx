import { useState } from 'react'

// Stylised imitations of real app screens, used purely as educational
// walkthroughs inside the game. They don't connect to anything — no login, no
// data — they just show the player where a real setting lives and let them
// practise the tap.
export default function PhoneMock({ kind }) {
  if (kind === 'ig-privacy') return <IgPrivacyMock />
  return null
}

// A mock of Instagram's "Account privacy" screen, laid out and styled to match
// the real page: iOS status bar, an "Account privacy" nav bar, a "Who can see
// your content" section, a "Private account" toggle row, and help text that
// swaps between Instagram's actual public/private descriptions as the toggle
// flips.
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
            <span className="ig-time">9:41</span>
            <span className="ig-status-icons">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </span>
          </div>

          <div className="ig-navbar">
            <span className="ig-back" aria-hidden="true">
              <ChevronIcon />
            </span>
            <span className="ig-navtitle">Account privacy</span>
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

// --- Tiny status-bar / nav icons (plain SVG, no external assets) ---------

function ChevronIcon() {
  return (
    <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
      <path
        d="M9.5 1.5 2 9.5l7.5 8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SignalIcon() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5" width="3" height="7" rx="1" />
      <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
      <path d="M8.5 2C5.4 2 2.6 3.2.5 5.1l1.6 1.7C3.8 5.2 6 4.2 8.5 4.2S13.2 5.2 14.9 6.8l1.6-1.7C14.4 3.2 11.6 2 8.5 2Z" />
      <path d="M8.5 6.1c-1.8 0-3.5.7-4.8 1.9l1.7 1.7c.8-.8 1.9-1.3 3.1-1.3s2.3.5 3.1 1.3l1.7-1.7A6.9 6.9 0 0 0 8.5 6.1Z" />
      <circle cx="8.5" cy="10.8" r="1.4" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width="22"
        height="12"
        rx="3.5"
        stroke="currentColor"
        strokeOpacity="0.5"
      />
      <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
      <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.5" />
    </svg>
  )
}
