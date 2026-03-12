// Standard Wordle multi-pass algorithm applied to consonants only.
// answerConsonants and guessConsonants are arrays of single uppercase letters.
export function getFeedback(answerConsonants, guessConsonants) {
  const result = new Array(guessConsonants.length).fill('absent');
  const pool = [...answerConsonants]; // consumed as matches are found

  // Pass 1: correct position
  for (let i = 0; i < guessConsonants.length; i++) {
    if (guessConsonants[i] === pool[i]) {
      result[i] = 'correct';
      pool[i] = null;
    }
  }

  // Pass 2: present but wrong position
  for (let i = 0; i < guessConsonants.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = pool.indexOf(guessConsonants[i]);
    if (idx !== -1) {
      result[i] = 'present';
      pool[idx] = null;
    }
  }

  return result;
}
