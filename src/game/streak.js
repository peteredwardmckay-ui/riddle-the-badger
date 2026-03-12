const KEYS = {
  streak:      'rtb_streak',
  lastPlayed:  'rtb_lastPlayed',
  totalPlayed: 'rtb_totalPlayed',
  totalWon:    'rtb_totalWon',
  history:     'rtb_history',
};

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  // a and b are "YYYY-MM-DD" strings
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function load() {
  try {
    return {
      streak:      parseInt(localStorage.getItem(KEYS.streak)  ?? '0', 10),
      lastPlayed:  localStorage.getItem(KEYS.lastPlayed)        ?? null,
      totalPlayed: parseInt(localStorage.getItem(KEYS.totalPlayed) ?? '0', 10),
      totalWon:    parseInt(localStorage.getItem(KEYS.totalWon)    ?? '0', 10),
      history:     JSON.parse(localStorage.getItem(KEYS.history)   ?? '{}'),
    };
  } catch {
    return { streak: 0, lastPlayed: null, totalPlayed: 0, totalWon: 0, history: {} };
  }
}

// Returns current stats without modifying anything.
export function getStats() {
  return load();
}

// Returns true if today's puzzle has already been played.
export function alreadyPlayedToday() {
  const { lastPlayed } = load();
  return lastPlayed === today();
}

// Call once on game end. result: { won: bool, guesses: number }
// Returns the updated stats object.
export function saveResult({ won, guesses }) {
  const data  = load();
  const date  = today();

  // Guard: don't double-count if somehow called twice
  if (data.lastPlayed === date) return data;

  const gap = data.lastPlayed ? daysBetween(data.lastPlayed, date) : null;

  const newStreak = won
    ? (gap === 1 ? data.streak + 1 : 1)  // extend streak only on consecutive days
    : 0;                                   // loss always resets streak

  const updated = {
    streak:      newStreak,
    lastPlayed:  date,
    totalPlayed: data.totalPlayed + 1,
    totalWon:    data.totalWon + (won ? 1 : 0),
    history:     { ...data.history, [date]: { result: won ? 'won' : 'lost', guesses } },
  };

  try {
    localStorage.setItem(KEYS.streak,      String(updated.streak));
    localStorage.setItem(KEYS.lastPlayed,  updated.lastPlayed);
    localStorage.setItem(KEYS.totalPlayed, String(updated.totalPlayed));
    localStorage.setItem(KEYS.totalWon,    String(updated.totalWon));
    localStorage.setItem(KEYS.history,     JSON.stringify(updated.history));
  } catch {
    // localStorage unavailable (private browsing etc.) — fail silently
  }

  return updated;
}
