const STATE_STYLES = {
  consonant: {
    background: 'var(--color-given-bg)',
    borderColor: 'var(--color-given-border)',
    color: 'var(--color-given-text)',
  },
  empty: {
    background: 'var(--color-empty)',
    borderColor: 'var(--color-grey-mid)',
    color: 'transparent',
  },
  pending: {
    background: 'var(--color-empty)',
    borderColor: 'var(--color-stripe)',
    color: 'var(--color-text)',
  },
  correct: {
    background: 'var(--color-correct)',
    borderColor: 'var(--color-correct)',
    color: '#fff',
  },
  present: {
    background: 'var(--color-present)',
    borderColor: 'var(--color-present)',
    color: '#fff',
  },
  absent: {
    background: 'var(--color-absent)',
    borderColor: 'var(--color-absent)',
    color: '#fff',
  },
};

export default function Tile({ letter = '', state = 'empty', size = 44 }) {
  const s = STATE_STYLES[state] ?? STATE_STYLES.empty;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.max(13, Math.floor(size * 0.42))}px`,
        fontWeight: 700,
        fontFamily: 'var(--font-family-mono)',
        border: '2px solid',
        borderRadius: '4px',
        userSelect: 'none',
        ...s,
      }}
    >
      {letter}
    </div>
  );
}
