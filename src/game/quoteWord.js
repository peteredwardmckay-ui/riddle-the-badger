// Same epoch and local-date logic as dailyWord.js, but weeks not days.
const EPOCH = new Date(2026, 2, 12); // March 12, 2026, local midnight

export function getWeeklyQuote(quoteList) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayIndex = Math.max(0, Math.floor((today - EPOCH) / 86400000));
  const weekIndex = Math.floor(dayIndex / 7);
  return { quote: quoteList[weekIndex % quoteList.length], weekIndex };
}
