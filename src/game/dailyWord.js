// Use local dates so the word resets at local midnight for each player.
const EPOCH = new Date(2026, 2, 12); // March 12, 2026, local midnight

function dayIndex() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.floor((today - EPOCH) / 86400000));
}

export function getDailyWord(wordList) {
  return wordList[dayIndex() % wordList.length];
}

export function getDailyHint(hintList) {
  return hintList[dayIndex() % hintList.length];
}
