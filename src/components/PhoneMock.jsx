import { useState } from 'react'

// Stylised imitations of real app screens, used purely as educational
// walkthroughs inside the game. They don't connect to anything — no login, no
// data — they just show the player where a real setting lives and let them
// navigate to it themselves.
export default function PhoneMock({ kind }) {
  if (kind === 'ig-privacy') return <IgPrivacyMock />
  return null
}

// A navigable mock of the real path to going private on Instagram:
//   Profile  →  (menu)  →  Settings and activity  →  Account privacy  →  toggle
function IgPrivacyMock() {
  // 'profile' | 'settings' | 'privacy' | 'visitor'
  const [screen, setScreen] = useState('profile')
  const [isPrivate, setPrivate] = useState(false)

  const goBack = () =>
    setScreen(
      screen === 'visitor'
        ? 'privacy'
        : screen === 'privacy'
          ? 'settings'
          : 'profile',
    )

  const caption = captionFor(screen, isPrivate)

  return (
    <figure className="phone-guide">
      <div
        className="phone-mock"
        role="group"
        aria-label="Instagram — navigate to Account privacy (educational mockup)"
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

          {screen === 'profile' && <ProfileScreen onMenu={() => setScreen('settings')} />}
          {screen === 'settings' && (
            <SettingsScreen onBack={goBack} onPrivacy={() => setScreen('privacy')} />
          )}
          {screen === 'privacy' && (
            <PrivacyScreen
              onBack={goBack}
              isPrivate={isPrivate}
              onToggle={() => setPrivate((v) => !v)}
              onSeeVisitor={() => setScreen('visitor')}
            />
          )}
          {screen === 'visitor' && <VisitorScreen onBack={goBack} />}
        </div>
      </div>
      <figcaption className="phone-mock-caption">{caption}</figcaption>
    </figure>
  )
}

// --- Screens -------------------------------------------------------------

function ProfileScreen({ onMenu }) {
  return (
    <>
      <div className="ig-profilebar">
        <span className="ig-username">
          mika.sg <ChevronDownIcon />
        </span>
        <span className="ig-topicons">
          <span className="ig-iconbtn" aria-hidden="true">
            <PlusIcon />
          </span>
          <button
            type="button"
            className="ig-iconbtn ig-menu-btn ig-pulse"
            onClick={onMenu}
            aria-label="Open menu and settings"
          >
            <HamburgerIcon />
          </button>
        </span>
      </div>

      <div className="ig-profile-head">
        <span className="ig-avatar" aria-hidden="true" />
        <div className="ig-stats">
          <span className="ig-stat">
            <strong>27</strong>posts
          </span>
          <span className="ig-stat">
            <strong>182</strong>followers
          </span>
          <span className="ig-stat">
            <strong>164</strong>following
          </span>
        </div>
      </div>

      <p className="ig-name">Mika</p>
      <p className="ig-bio">📷 just vibes · 🏫 SG</p>

      <div className="ig-profile-actions">
        <span className="ig-btn">Edit profile</span>
        <span className="ig-btn">Share profile</span>
      </div>

      <div className="ig-tabs" aria-hidden="true">
        <span className="ig-tab is-active">
          <GridIcon />
        </span>
      </div>
      <div className="ig-grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="ig-grid-cell" />
        ))}
      </div>
    </>
  )
}

function SettingsScreen({ onBack, onPrivacy }) {
  return (
    <>
      <NavBar title="Settings and activity" onBack={onBack} />
      <div className="ig-search" aria-hidden="true">
        <SearchIcon />
        <span>Search</span>
      </div>

      <p className="ig-section">Who can see your content</p>
      <button type="button" className="ig-list-row ig-pulse" onClick={onPrivacy}>
        <span className="ig-list-icon" aria-hidden="true">
          <LockIcon />
        </span>
        <span className="ig-list-label">Account privacy</span>
        <span className="ig-chevron-right" aria-hidden="true">
          <ChevronRightIcon />
        </span>
      </button>
      <DisabledRow icon={<StarIcon />} label="Close Friends" />
      <DisabledRow icon={<BlockIcon />} label="Blocked" />

      <p className="ig-section">How others can interact with you</p>
      <DisabledRow icon={<AtIcon />} label="Messages and story replies" />
      <DisabledRow icon={<TagIcon />} label="Tags and mentions" />
    </>
  )
}

function PrivacyScreen({ onBack, isPrivate, onToggle, onSeeVisitor }) {
  return (
    <>
      <NavBar title="Account privacy" onBack={onBack} />
      <p className="ig-section">Who can see your content</p>
      <button
        type="button"
        className={`ig-row${isPrivate ? '' : ' ig-pulse'}`}
        onClick={onToggle}
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
      {isPrivate && (
        <button type="button" className="ig-cta ig-pulse" onClick={onSeeVisitor}>
          👀 See what others see now →
        </button>
      )}
    </>
  )
}

// The now-private profile as a stranger (non-follower) sees it: bio and counts
// are still visible, but the posts are hidden behind Instagram's private state.
function VisitorScreen({ onBack }) {
  return (
    <>
      <NavBar title="mika.sg" onBack={onBack} />
      <div className="ig-profile-head">
        <span className="ig-avatar" aria-hidden="true" />
        <div className="ig-stats">
          <span className="ig-stat">
            <strong>27</strong>posts
          </span>
          <span className="ig-stat">
            <strong>182</strong>followers
          </span>
          <span className="ig-stat">
            <strong>164</strong>following
          </span>
        </div>
      </div>
      <p className="ig-name">Mika</p>
      <p className="ig-bio">📷 just vibes · 🏫 SG</p>

      <div className="ig-profile-actions">
        <span className="ig-btn ig-follow">Follow</span>
        <span className="ig-btn">Message</span>
      </div>

      <div className="ig-private-block">
        <span className="ig-private-lock" aria-hidden="true">
          <LockIcon />
        </span>
        <p className="ig-private-title">This account is private</p>
        <p className="ig-private-sub">
          Follow this account to see their photos and videos.
        </p>
      </div>
    </>
  )
}

function captionFor(screen, isPrivate) {
  if (screen === 'profile')
    return '👆 Tap the menu (☰) in the top-right to open your settings.'
  if (screen === 'settings') return '👆 Now tap "Account privacy".'
  if (screen === 'visitor')
    return "🔒 That's a stranger's view — your posts stay hidden until you approve them as a follower."
  return isPrivate
    ? '🔒 Private is on! Now tap "See what others see" to view your profile as a stranger.'
    : '👆 Tap the toggle to switch your account to Private.'
}

function NavBar({ title, onBack }) {
  return (
    <div className="ig-navbar">
      <button type="button" className="ig-back" onClick={onBack} aria-label="Back">
        <ChevronIcon />
      </button>
      <span className="ig-navtitle">{title}</span>
    </div>
  )
}

function DisabledRow({ icon, label }) {
  return (
    <div className="ig-list-row is-disabled" aria-hidden="true">
      <span className="ig-list-icon">{icon}</span>
      <span className="ig-list-label">{label}</span>
      <span className="ig-chevron-right">
        <ChevronRightIcon />
      </span>
    </div>
  )
}

// --- Icons (plain SVG, no external assets) -------------------------------

function ChevronIcon() {
  return (
    <svg width="11" height="19" viewBox="0 0 11 19" fill="none">
      <path d="M9.5 1.5 2 9.5l7.5 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronRightIcon() {
  return (
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
      <path d="M1 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ChevronDownIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
      <path d="M1 1.5 6 6.5l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="1" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="2" />
      <path d="M11 6.5v9M6.5 11h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="1" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 1v20M14 1v20M1 8h20M1 14h20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="m10 2 2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 14.9 5.2 17l.9-5.4L2.2 7.7l5.4-.8L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
function BlockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m5 5 10 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function AtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 10v1.5a2.5 2.5 0 0 0 4 2A8 8 0 1 0 13.5 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function TagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 3h6l8 8-6 6-8-8V3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" />
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
      <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.5" />
      <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
      <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.5" />
    </svg>
  )
}
