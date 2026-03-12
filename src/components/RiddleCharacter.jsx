import idleLight   from '../assets/riddle/Riddle-the-badger.png';
import revealLight  from '../assets/riddle/Riddle-the-badger-burrow.png';
import winLight     from '../assets/riddle/Riddle-the-badger-Win.png';
import lossLight    from '../assets/riddle/Riddle-the-badger-Loss.png';

import idleDark   from '../assets/riddle/Riddle-the-badger-darkmode.png';
import revealDark from '../assets/riddle/Riddle-the-badger-burrow-darkmode.png';
import winDark    from '../assets/riddle/Riddle-the-badger-Win-darkmode.png';
import lossDark   from '../assets/riddle/Riddle-the-badger-Loss-darkmode.png';

const IMAGES = {
  light: { idle: idleLight, reveal: revealLight, win: winLight,  loss: lossLight  },
  dark:  { idle: idleDark,  reveal: revealDark,  win: winDark,   loss: lossDark   },
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
