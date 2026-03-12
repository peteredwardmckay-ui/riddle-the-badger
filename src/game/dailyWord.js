// Use local dates so the word resets at local midnight for each player.
const EPOCH = new Date(2026, 2, 12); // March 12, 2026, local midnight

export function getDailyWord(wordList) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayIndex = Math.max(0, Math.floor((today - EPOCH) / 86400000));
  return wordList[dayIndex % wordList.length];
}
