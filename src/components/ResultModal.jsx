import ShareButton from './ShareButton';

export default function ResultModal({ gameStatus, answer, guesses = [], feedbacks = [], skeleton = [], stats = null, onClose }) {
  const won = gameStatus === 'won';

  const winPct = stats && stats.totalPlayed > 0
    ? Math.round((stats.totalWon / stats.totalPlayed) * 100)
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'var(--color-bg)',
          border: '2px solid var(--color-stripe)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '320px',
          padding: '2rem 1.5rem 1.5rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: 'var(--color-stripe)',
            lineHeight: 1,
            padding: '0.25rem',
          }}
        >
          ×
        </button>

        <p style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-stripe)' }}>
          {won ? 'You got it.' : 'Riddle wins today.'}
        </p>

        <p style={{ margin: 0, fontSize: 'var(--font-size-base)', color: 'var(--color-text)' }}>
          {won ? `Solved in ${guesses.length}/5.` : `The word was ${answer}.`}
        </p>

        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginTop: '0.25rem',
            }}
          >
            {[
              { value: stats.totalPlayed, label: 'Played' },
              { value: winPct + '%',      label: 'Won' },
              { value: stats.streak,      label: 'Streak' },
            ].map(({ value, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-stripe)' }}>
                  {value}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        <ShareButton
          gameStatus={gameStatus}
          skeleton={skeleton}
          guesses={guesses}
          feedbacks={feedbacks}
        />

        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-gold)' }}>
          Come back tomorrow.
        </p>
      </div>
    </div>
  );
}
