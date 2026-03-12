import { useState, useEffect } from 'react';
import Game from './components/Game';
const burrowSrc = '/riddle/Riddle-the-badger-burrow.png';

export default function App() {
  // 'showing' → full opacity, 'fading' → transitioning out, 'done' → unmounted
  const [phase, setPhase] = useState('showing');

  // Two conditions must both be true before fading: game mounted + 2s elapsed.
  // Since game logic is synchronous, 'ready' flips immediately on mount.
  const [ready, setReady]     = useState(false);
  const [elapsed, setElapsed] = useState(false);

  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    const t = setTimeout(() => setElapsed(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (ready && elapsed) setPhase('fading');
  }, [ready, elapsed]);

  return (
    <>
      <Game />

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
            <img
              src={burrowSrc}
              alt=""
              style={{ width: '180px', height: '180px', objectFit: 'contain' }}
            />
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
