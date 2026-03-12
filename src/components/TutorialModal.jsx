export default function TutorialModal({ onClose }) {
  const legend = [
    { color: 'var(--color-correct)', label: 'Right letter, right place.' },
    { color: 'var(--color-present)', label: 'Right letter, wrong place.' },
    { color: 'var(--color-absent)',  label: 'Not in the word.' },
  ];

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
          I have taken your consonants. The vowels remain — yours to keep.
        </p>

        <p style={{ margin: 0, fontSize: 'var(--font-size-base)', color: 'var(--color-text)', lineHeight: 1.5 }}>
          Guess the word in five attempts. Each guess must be a real word.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {legend.map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '20px',
                  height: '20px',
                  borderRadius: '3px',
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{label}</span>
            </div>
          ))}
        </div>

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
