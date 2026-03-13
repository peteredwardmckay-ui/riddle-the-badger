import { useState, useEffect } from 'react';
import Game from './components/Game';
import QuoteGame from './components/QuoteGame';

const burrowSrc = '/riddle/Riddle-the-badger-burrow.png';

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('rtb_theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const isSaturday     = new Date().getDay() === 6 || new URLSearchParams(window.location.search).has('testSaturday');
const quoteAvailable = isSaturday;

export default function App() {
  const [phase, setPhase]       = useState('showing');
  const [ready, setReady]       = useState(false);
  const [elapsed, setElapsed]   = useState(false);
  const [theme, setTheme]       = useState(getInitialTheme);
  const [gameMode, setGameMode] = useState('daily');

  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    const t = setTimeout(() => setElapsed(true), 1000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (ready && elapsed) setPhase('fading');
  }, [ready, elapsed]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('rtb_theme', theme); } catch {}
  }, [theme]);

  function toggleTheme() { setTheme(t => t === 'dark' ? 'light' : 'dark'); }
  function toggleMode()  { setGameMode(m => m === 'daily' ? 'quote' : 'daily'); }

  return (
    <>
      {gameMode === 'daily'
        ? <Game   theme={theme} toggleTheme={toggleTheme} quoteAvailable={quoteAvailable} onToggleMode={toggleMode} />
        : <QuoteGame theme={theme} toggleTheme={toggleTheme} quoteAvailable={quoteAvailable} onToggleMode={toggleMode} />
      }

      {phase !== 'done' && (
        <div
          onTransitionEnd={() => { if (phase === 'fading') setPhase('done'); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            opacity: phase === 'fading' ? 0 : 1,
            transition: 'opacity 0.6s ease',
            pointerEvents: phase === 'fading' ? 'none' : 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <img src={burrowSrc} alt="" style={{ width: '180px', height: '180px', objectFit: 'contain' }} />
            <p style={{
              margin: 0,
              fontFamily: 'var(--font-family-display)',
              fontWeight: 700,
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-stripe)',
              letterSpacing: '0.02em',
            }}>
              Riddle is loading...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
