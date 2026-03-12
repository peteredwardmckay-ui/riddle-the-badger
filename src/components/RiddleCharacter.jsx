const IMAGES = {
  light: {
    idle:   '/riddle/Riddle-the-badger.png',
    reveal: '/riddle/Riddle-the-badger-burrow.png',
    win:    '/riddle/Riddle-the-badger-Win.png',
    loss:   '/riddle/Riddle-the-badger-Loss.png',
  },
  dark: {
    idle:   '/riddle/Riddle-the-badger-darkmode.png',
    reveal: '/riddle/Riddle-the-badger-burrow-darkmode.png',
    win:    '/riddle/Riddle-the-badger-Win-darkmode.png',
    loss:   '/riddle/Riddle-the-badger-Loss-darkmode.png',
  },
};

export default function RiddleCharacter({ state = 'idle', theme = 'light' }) {
  const set = IMAGES[theme] ?? IMAGES.light;
  const src = set[state] ?? set.idle;
  return (
    <img
      src={src}
      alt={`Riddle the Badger — ${state}`}
      style={{ width: '120px', height: '120px', objectFit: 'contain' }}
    />
  );
}
