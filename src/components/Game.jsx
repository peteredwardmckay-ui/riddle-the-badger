import { useState, useEffect, useRef, useMemo } from 'react';
import { getSkeleton } from '../game/skeleton';
import { getFeedback } from '../game/feedback';
import { getDailyWord, getDailyHint } from '../game/dailyWord';
import { saveResult, getStats } from '../game/streak';
import wordList, { hints } from '../game/wordList';
import britishWords from '../data/british.json';
import GuessGrid from './GuessGrid';
import Keyboard from './Keyboard';
import RiddleCharacter from './RiddleCharacter';
import ResultModal from './ResultModal';
import TutorialModal from './TutorialModal';

const MAX_GUESSES = 5;
const CONSONANTS  = new Set('BCDFGHJKLMNPQRSTVWXYZ'.split(''));

// Computed once — same word for all players on a given day.
const ANSWER = getDailyWord(wordList);
const ANSWER_HINT = getDailyHint(hints);
const { skeleton: SKELETON, consonants: ANSWER_CONSONANTS, consonantPositions: CONSONANT_POSITIONS } = getSkeleton(ANSWER);

function computeKeyStates(guesses, feedbacks) {
  const priority = { correct: 3, present: 2, absent: 1 };
  const states = {};
  guesses.forEach((guess, gi) => {
    [...guess].forEach((letter, li) => {
      const fb = feedbacks[gi]?.[li];
      if (!fb) return;
      if (!states[letter] || priority[fb] > priority[states[letter]]) {
        states[letter] = fb;
      }
    });
  });
  return states;
}

function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadSavedGame() {
  try {
    const raw = localStorage.getItem('rtb_gameState');
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (saved.date !== localDateStr()) return null;
    if (saved.answer !== ANSWER) return null; // word changed (e.g. after a shuffle)
    return saved;
  } catch {
    return null;
  }
}

function saveGame(guesses, feedbacks, gameStatus) {
  try {
    localStorage.setItem('rtb_gameState', JSON.stringify({ date: localDateStr(), answer: ANSWER, guesses, feedbacks, gameStatus }));
  } catch {}
}

function getInitialTutorial() {
  try { return !localStorage.getItem('rtb_tutorialSeen'); } catch { return true; }
}

export default function Game({ theme, toggleTheme, quoteAvailable, onToggleMode, guessList }) {
  // Read saved game lazily on each mount so toggling back from quote mode
  // picks up the completed state rather than the stale module-load snapshot.
  const [initialSaved] = useState(loadSavedGame);

  const [guesses, setGuesses]           = useState(() => initialSaved?.guesses    ?? []);
  const [feedbacks, setFeedbacks]       = useState(() => initialSaved?.feedbacks  ?? []);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus]     = useState(() => initialSaved?.gameStatus ?? 'playing');
  const [error, setError]               = useState('');
  const [modalOpen, setModalOpen]       = useState(() => initialSaved?.gameStatus === 'won' || initialSaved?.gameStatus === 'lost');
  const [stats, setStats]               = useState(() => initialSaved ? getStats() : null);
  const [tutorialOpen, setTutorialOpen] = useState(getInitialTutorial);
  const [hintVisible, setHintVisible] = useState(false);

  const VALID_WORDS = useMemo(() => new Set([...guessList, ...wordList, ...britishWords]), [guessList]);

  const handleKeyRef = useRef(null);

  function handleKey(key) {
    if (gameStatus !== 'playing') return;

    if (key === 'BACKSPACE') {
      setCurrentGuess(g => g.slice(0, -1));
      setError('');
      return;
    }

    if (key === 'ENTER') {
      if (currentGuess.length < ANSWER_CONSONANTS.length) {
        setError('Not enough consonants.');
        return;
      }

      // Reconstruct the full word from skeleton + guessed consonants
      const wordArr = [...SKELETON];
      [...currentGuess].forEach((c, i) => {
        wordArr[CONSONANT_POSITIONS[i]] = c;
      });
      const word = wordArr.join('');

      if (!VALID_WORDS.has(word)) {
        setError('Not a valid word.');
        return;
      }

      const feedback     = getFeedback(ANSWER_CONSONANTS, [...currentGuess]);
      const newGuesses   = [...guesses, currentGuess];
      const newFeedbacks = [...feedbacks, feedback];

      setGuesses(newGuesses);
      setFeedbacks(newFeedbacks);
      setCurrentGuess('');
      setError('');

      if (feedback.every(f => f === 'correct')) {
        setGameStatus('won');
        setStats(saveResult({ won: true,  guesses: newGuesses.length }));
        saveGame(newGuesses, newFeedbacks, 'won');
        setModalOpen(true);
        window.gtag?.('event', 'puzzle_solved', { word: ANSWER, guesses: newGuesses.length });
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameStatus('lost');
        setStats(saveResult({ won: false, guesses: newGuesses.length }));
        saveGame(newGuesses, newFeedbacks, 'lost');
        setModalOpen(true);
        window.gtag?.('event', 'puzzle_failed', { word: ANSWER });
      }
      return;
    }

    // Consonant input
    if (currentGuess.length >= ANSWER_CONSONANTS.length) return;
    setCurrentGuess(g => g + key);
    setError('');
  }

  handleKeyRef.current = handleKey;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Backspace')  handleKeyRef.current('BACKSPACE');
      else if (e.key === 'Enter') handleKeyRef.current('ENTER');
      else if (CONSONANTS.has(e.key.toUpperCase())) handleKeyRef.current(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const gameOver    = gameStatus !== 'playing';
  const keyStates   = computeKeyStates(guesses, feedbacks);
  const riddleState = gameStatus === 'won' ? 'win' : gameStatus === 'lost' ? 'loss' : 'idle';

  const btnStyle = (active) => ({
    position: 'absolute',
    background: 'none',
    border: 'none',
    cursor: active ? 'pointer' : 'default',
    fontSize: '1.1rem',
    color: active ? 'var(--color-stripe)' : 'var(--color-grey-mid)',
    lineHeight: 1,
    padding: '0.25rem',
  });

  return (
    <div
      style={{
        maxWidth: '375px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        minHeight: '100dvh',
      }}
    >
      <header style={{ width: '100%', borderBottom: '2px solid var(--color-stripe)', paddingBottom: '0.75rem', position: 'relative' }}>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            fontFamily: 'var(--font-family-display)',
            letterSpacing: '0.02em',
            color: 'var(--color-stripe)',
          }}
        >
          Riddle the Badger
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-family-display)', fontStyle: 'italic', color: 'var(--color-gold)' }}>
          A E — I O U. The rest are mine.
        </p>
        {/* Mode toggle — ¶ icon, active only on Saturdays */}
        <button
          onClick={quoteAvailable ? onToggleMode : undefined}
          aria-label="Saturday quote mode"
          title={quoteAvailable ? 'Saturday quote' : 'Available on Saturdays'}
          style={{
            ...btnStyle(quoteAvailable),
            top: 0,
            right: '4rem',
            color: quoteAvailable ? 'var(--color-gold)' : 'var(--color-grey-mid)',
          }}
        >
          ¶
        </button>
        {/* Tutorial */}
        <button
          onClick={() => setTutorialOpen(true)}
          aria-label="How to play"
          style={{ ...btnStyle(true), top: 0, right: '2rem' }}
        >
          ?
        </button>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ ...btnStyle(true), top: 0, right: 0, fontSize: '1.25rem' }}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      <RiddleCharacter state={riddleState} theme={theme} />

      <GuessGrid
        skeleton={SKELETON}
        guesses={guesses}
        feedbacks={feedbacks}
        currentGuess={currentGuess}
        maxGuesses={MAX_GUESSES}
        gameOver={gameOver}
      />

      <div style={{ width: '100%', minHeight: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        {!gameOver && (
          <div style={{ minHeight: '1.25rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-absent)', fontWeight: 600 }}>
            {error}
          </div>
        )}
        {hintVisible ? (
          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', fontFamily: 'var(--font-family-display)', fontStyle: 'italic', textAlign: 'center' }}>
            {ANSWER_HINT}
          </p>
        ) : (
          <button
            onClick={() => setHintVisible(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-gold)',
              fontFamily: 'var(--font-family-display)',
              padding: '0.25rem 0.5rem',
            }}
          >
            hint
          </button>
        )}
      </div>

      {!gameOver && (
        <div style={{ marginTop: 'auto', width: '100%' }}>
          <Keyboard onKey={handleKey} keyStates={keyStates} />
        </div>
      )}

      {tutorialOpen && (
        <TutorialModal
          onClose={() => {
            try { localStorage.setItem('rtb_tutorialSeen', '1'); } catch {}
            setTutorialOpen(false);
          }}
        />
      )}

      {modalOpen && (
        <ResultModal
          gameStatus={gameStatus}
          answer={ANSWER}
          guesses={guesses}
          feedbacks={feedbacks}
          skeleton={SKELETON}
          stats={stats}
          onClose={() => setModalOpen(false)}
        />
      )}

      <footer
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          paddingBottom: '0.5rem',
          width: '100%',
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-stripe)',
          fontFamily: 'var(--font-family-base)',
        }}
      >
        © {new Date().getFullYear()} Peter McKay
        <br />
        <span style={{ fontSize: '0.8em', opacity: 0.7 }}>
          This site uses Google Analytics to collect anonymous usage data.
        </span>
        <br />
        <a
          href="https://ko-fi.com/petermckay"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-stripe)', textDecoration: 'underline' }}
        >
          Ko-fi
        </a>
      </footer>
    </div>
  );
}
