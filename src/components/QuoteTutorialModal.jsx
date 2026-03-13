export default function QuoteTutorialModal({ onClose }) {
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
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--font-family-display)', fontStyle: 'italic', fontSize: 'var(--font-size-base)', color: 'var(--color-gold)', lineHeight: 1.5 }}>
          I have taken the consonants from a sentence. The vowels remain.
        </p>

        <p style={{ margin: 0, fontSize: 'var(--font-size-base)', color: 'var(--color-text)', lineHeight: 1.5 }}>
          Guess words to recover what is mine. Each consonant you find will appear throughout the sentence wherever it belongs.
        </p>

        <p style={{ margin: 0, fontSize: 'var(--font-size-base)', color: 'var(--color-text)', lineHeight: 1.5 }}>
          There is no limit to your guesses. There is only your score.
        </p>

        <p style={{ margin: 0, fontFamily: 'var(--font-family-display)', fontStyle: 'italic', fontSize: 'var(--font-size-sm)', color: 'var(--color-gold)' }}>
          A E — I O U. The rest are mine.
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: '0.25rem',
            width: '100%',
            padding: '0.65rem 1rem',
            background: 'var(--color-stripe)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'var(--font-size-base)',
            fontWeight: 700,
            fontFamily: 'var(--font-family-base)',
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          I understand.
        </button>
      </div>
    </div>
  );
}
