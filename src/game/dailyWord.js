// Use Date.UTC for both sides so timezone offsets can't produce a negative index.
const EPOCH = Date.UTC(2026, 2, 12); // March 12, 2026, 00:00 UTC

export function getDailyWord(wordList) {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayIndex = Math.max(0, Math.floor((todayUTC - EPOCH) / 86400000));
  return wordList[dayIndex % wordList.length];
}
