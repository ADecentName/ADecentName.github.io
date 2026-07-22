// The scoring dimensions used across SafeSteps.
//
// Different chapters track different metrics (a chapter declares which ones it
// uses in chapters.js). A choice's `effects` in scenes.js add/subtract points
// on these keys; scoring.js turns accumulated points into 0–100% meters.
//
// Keep the keys stable — scenes.js and chapters.js reference them by string.

export const METRICS = {
  privacy: { key: 'privacy', label: 'Privacy', emoji: '🔒', color: '#a78bfa' },
  safety: { key: 'safety', label: 'Safety', emoji: '🛡️', color: '#4f8cff' },
  wellbeing: { key: 'wellbeing', label: 'Wellbeing', emoji: '❤️', color: '#ff5470' },
  awareness: { key: 'awareness', label: 'Awareness', emoji: '🧠', color: '#ffb02e' },
  responsibility: { key: 'responsibility', label: 'Responsibility', emoji: '🌐', color: '#2ecc9b' },
  citizenship: { key: 'citizenship', label: 'Digital Citizenship', emoji: '🌍', color: '#34d399' },
  support: { key: 'support', label: 'Support', emoji: '🤝', color: '#22d3ee' },
}

export const metricInfo = (key) =>
  METRICS[key] || { key, label: key, emoji: '•', color: '#9aa4b2' }
