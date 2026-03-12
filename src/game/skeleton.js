const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// Y is always a consonant — firm rule per CLAUDE.md.
// Riddle steals the consonants; vowels remain visible in the skeleton.
export function getSkeleton(word) {
  const letters = word.toUpperCase().split('');
  const skeleton = [];
  const consonants = [];
  const consonantPositions = [];

  for (let i = 0; i < letters.length; i++) {
    if (VOWELS.has(letters[i])) {
      skeleton.push(letters[i]); // vowel stays visible
    } else {
      skeleton.push(null);       // consonant is stolen
      consonants.push(letters[i]);
      consonantPositions.push(i);
    }
  }

  return { skeleton, consonants, consonantPositions };
}
