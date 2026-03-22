const IMAGES = {
  idle:   '/riddle/Riddle-the-badger.png',
  reveal: '/riddle/Riddle-the-badger-burrow.png',
  win:    '/riddle/Riddle-the-badger-Win.png',
  loss:   '/riddle/Riddle-the-badger-Loss.png',
};

export default function RiddleCharacter({ state = 'idle', theme = 'light' }) {
  const src = IMAGES[state] ?? IMAGES.idle;
  return (
    <img
      src={src}
      alt={`Riddle the Badger — ${state}`}
      style={{
        width: '120px',
        height: '120px',
        objectFit: 'contain',
        filter: theme === 'dark' ? 'invert(1)' : 'none',
      }}
    />
  );
}
