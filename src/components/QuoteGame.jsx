import { useState, useRef, useEffect } from 'react';
import { getWeeklyQuote } from '../game/quoteWord';
import quotes from '../data/quotes.json';
import guessList from '../game/guessList';
import wordList from '../game/wordList';

const VOWELS        = new Set('AEIOU'.split(''));
const ALL_CONSONANTS = 'BCDFGHJKLMNPQRSTVWXYZ'.split('');
const CONSONANTS_SET = new Set(ALL_CONSONANTS);

function getQuoteConsonants(str) {
  const set = new Set();
  for (const ch of str.toUpperCase()) {
    if (CONSONANTS_SET.has(ch)) set.add(ch);
  }
  return set;
}

function daysUntilSaturday() {
  const day = new Date().getDay(); // 0=Sun … 6=Sat
  return day === 6 ? 0 : (6 - day + 7) % 7;
}

// ─── persistence ────────────────────────────────────────────────────────────

function loadSaved(weekIndex) {
  try {
    const raw = localStorage.getItem('rtb_quoteState');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.weekIndex !== weekIndex) return null;
    return { found: new Set(s.found), absent: new Set(s.absent), guessCount: s.guessCount, complete: s.complete };
  } catch { return null; }
}

function persist(weekIndex, found, absent, guessCount, complete) {
  try {
    localStorage.setItem('rtb_quoteState', JSON.stringify({
      weekIndex, found: [...found], absent: [...absent], guessCount, complete,
    }));
  } catch {}
}

// ─── module-level constants (computed once) ─────────────────────────────────

const { quote: QUOTE_DATA, weekIndex: WEEK_INDEX } = getWeeklyQuote(quotes);
const QUOTE_CONSONANTS = getQuoteConsonants(QUOTE_DATA.quote);
const PAR              = QUOTE_CONSONANTS.size;
const _saved           = loadSaved(WEEK_INDEX);

// Valid words: full guess list + all words that appear in the quote itself
const quoteWords  = new Set((QUOTE_DATA.quote.toLowerCase().match(/[a-z]+/g) ?? []).map(w => w.toUpperCase()));
const VALID_WORDS = new Set([...guessList, ...wordList, ...quoteWords]);

// ─── sub-components ──────────────────────────────────────────────────────────

function QuoteDisplay({ quote, found }) {
  const words = quote.split(' ');

  function renderChar(char, key) {
    const upper = char.toUpperCase();
    if (!CONSONANTS_SET.has(upper)) {
      return <span key={key}>{char}</span>;
    }
    if (found.has(upper)) {
      return <span key={key}>{char}</span>;
    }
    return (
      <span
        key={key}
        style={{
          display: 'inline-block',
          width: '1.25rem',
          height: '1.25rem',
          background: 'var(--color-grey-mid)',
          border: '1px solid #aaa',
          borderRadius: '3px',
          verticalAlign: 'middle',
          marginLeft: '2px',
          marginRight: '2px',
        }}
      />
    );
  }

  return (
    <div
      style={{
        fontFamily: 'var(--font-family-display)',
        fontSize: '1.1rem',
        color: 'var(--color-text)',
        lineHeight: 2.9,
        width: '100%',
      }}
    >
      {words.flatMap((word, i) => {
        const wordSpan = (
          <span key={`w${i}`} style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
            {[...word].map((char, j) => renderChar(char, `${i}-${j}`))}
          </span>
        );
        if (i < words.length - 1) {
          return [wordSpan, <span key={`s${i}`} style={{ display: 'inline-block', width: '1.1em' }} />];
        }
        return [wordSpan];
      })}
    </div>
  );
}

function Graveyard({ absent }) {
  const dead = [...absent].sort();
  if (dead.length === 0) return null;
  return (
    <div style={{ width: '100%', fontSize: 'var(--font-size-sm)', color: 'var(--color-absent)', letterSpacing: '0.12em', fontFamily: 'var(--font-family-base)' }}>
      {dead.map(c => (
        <span key={c} style={{ textDecoration: 'line-through', marginRight: '0.4em' }}>{c}</span>
      ))}
    </div>
  );
}

// ─── Saturday lock screen ────────────────────────────────────────────────────

function SaturdayLock({ onBack }) {
  const days = daysUntilSaturday();
  return (
    <div
      style={{
        maxWidth: '375px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        gap: '1rem',
      }}
    >
      <p style={{ margin: 0, fontFamily: 'var(--font-family-display)', fontStyle: 'italic', fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-stripe)', textAlign: 'center' }}>
        Come back Saturday.
      </p>
      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-gold)', fontFamily: 'var(--font-family-display)', fontStyle: 'italic' }}>
        {days === 1 ? 'Tomorrow.' : `${days} days.`}
      </p>
      <button
        onClick={onBack}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1.25rem',
          background: 'none',
          border: '1px solid var(--color-stripe)',
          borderRadius: '6px',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-stripe)',
          cursor: 'pointer',
          fontFamily: 'var(--font-family-base)',
        }}
      >
        Back to today's game.
      </button>
    </div>
  );
}

// ─── quote share canvas ───────────────────────────────────────────────────────

const C = {
  bg:     '#FBF7EF',
  stripe: '#2B2B2B',
  gold:   '#C8900A',
};
const W       = 400;
const STRIPE_W = 8;
const PAD_L   = STRIPE_W + 20;
const PAD_R   = 20;

async function buildQuoteCanvas(guessCount, par) {
  const imgSize = 210;
  const H = 410;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  // Left stripe
  ctx.fillStyle = C.stripe;
  ctx.fillRect(0, 0, STRIPE_W, H);

  // Title
  let y = 38;
  ctx.fillStyle = C.stripe;
  ctx.font = 'bold 17px "Lora", Georgia, serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('RIDDLE THE BADGER', PAD_L, y);
  y += 22;

  // Tagline
  ctx.fillStyle = C.gold;
  ctx.font = 'italic 12px "Lora", Georgia, serif';
  ctx.fillText('A E — I O U. The rest are mine.', PAD_L, y);
  y += 18;

  // Divider
  ctx.strokeStyle = C.stripe;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD_L, y);
  ctx.lineTo(W - PAD_R, y);
  ctx.stroke();
  y += 30;

  // "Quoterday."
  ctx.fillStyle = C.stripe;
  ctx.font = 'bold 26px "Lora", Georgia, serif';
  ctx.fillText('Quoterday.', PAD_L, y);
  y += 34;

  // Score line
  ctx.fillStyle = C.stripe;
  ctx.font = '15px "Lora", Georgia, serif';
  ctx.fillText(`Solved in ${guessCount}. Par: ${par}.`, PAD_L, y);
  y += 24;

  // AEIOU illustration — centred below score line
  const img = new Image();
  img.src = '/riddle/Riddle-the-badger-AEIOU.png';
  await img.decode().catch(() => {});
  const imgX = Math.round((W - imgSize) / 2);
  ctx.drawImage(img, imgX, y, imgSize, imgSize);
  y += imgSize + 14;

  // URL — centred
  ctx.fillStyle = C.gold;
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('riddlethebadger.com', W / 2, y);
  ctx.textAlign = 'left';

  return canvas;
}

// ─── completion modal ────────────────────────────────────────────────────────

function CompletionModal({ guessCount, quoteData, onClose }) {
  const [shareLabel, setShareLabel] = useState('Share result');
  const shareText = `A E — I O U. The rest are mine.\nQuoterday. Solved in ${guessCount}. Par: ${PAR}.\nriddlethebadger.com`;

  async function handleShare() {
    // Try canvas + native share (mobile)
    try {
      const canvas = await buildQuoteCanvas(guessCount, PAR);
      const blob   = await new Promise((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
      );
      const file = new File([blob], 'riddle-quoterday.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
        return;
      }
    } catch {}

    // Text-only share sheet
    try {
      if (navigator.share) { await navigator.share({ text: shareText }); return; }
    } catch {}

    // Desktop: clipboard
    try { await navigator.clipboard.writeText(shareText); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = shareText;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setShareLabel('Copied!');
    setTimeout(() => setShareLabel('Share result'), 2000);
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'var(--color-overlay)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '1rem',
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
          gap: '0.75rem',
        }}
      >
        <p style={{ margin: 0, fontFamily: 'var(--font-family-display)', fontStyle: 'italic', fontSize: 'var(--font-size-base)', color: 'var(--color-text)', lineHeight: 1.6 }}>
          "{quoteData.quote}"
        </p>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-stripe)', fontWeight: 600 }}>
          — {quoteData.author}, <em>{quoteData.work}</em>, {quoteData.year}
        </p>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-gold)', fontFamily: 'var(--font-family-display)', fontStyle: 'italic' }}>
          {quoteData.riddleComment}
        </p>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
          Solved in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}. Par: {PAR}.
        </p>
        <button
          onClick={handleShare}
          style={{
            width: '100%', padding: '0.65rem 1rem',
            background: 'var(--color-stripe)', color: '#fff',
            border: 'none', borderRadius: '6px',
            fontSize: 'var(--font-size-base)', fontWeight: 700,
            fontFamily: 'var(--font-family-base)', cursor: 'pointer', letterSpacing: '0.02em',
          }}
        >
          {shareLabel}
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '0.65rem 1rem',
            background: 'none', color: 'var(--color-stripe)',
            border: '1px solid var(--color-stripe)', borderRadius: '6px',
            fontSize: 'var(--font-size-base)', fontWeight: 700,
            fontFamily: 'var(--font-family-base)', cursor: 'pointer', letterSpacing: '0.02em',
          }}
        >
          Come back Saturday.
        </button>
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function QuoteGame({ theme, toggleTheme, quoteAvailable, onToggleMode }) {
  const isSaturday = new Date().getDay() === 6;

  const [found,      setFound]      = useState(_saved?.found      ?? new Set());
  const [absent,     setAbsent]     = useState(_saved?.absent     ?? new Set());
  const [guessCount, setGuessCount] = useState(_saved?.guessCount ?? 0);
  const [complete,   setComplete]   = useState(_saved?.complete   ?? false);
  const [input,      setInput]      = useState('');
  const [error,      setError]      = useState('');
  const [modalOpen,  setModalOpen]  = useState(_saved?.complete   ?? false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  if (!isSaturday) {
    return <SaturdayLock onBack={onToggleMode} />;
  }

  function handleSubmit() {
    const word = input.trim().toUpperCase();
    setInput('');
    if (!word) return;

    if (!VALID_WORDS.has(word)) {
      setError('Not a valid word.');
      return;
    }

    setError('');
    const newFound  = new Set(found);
    const newAbsent = new Set(absent);

    for (const ch of new Set([...word])) {
      if (!CONSONANTS_SET.has(ch)) continue;
      if (QUOTE_CONSONANTS.has(ch)) newFound.add(ch);
      else                          newAbsent.add(ch);
    }

    const newCount    = guessCount + 1;
    const isComplete  = [...QUOTE_CONSONANTS].every(c => newFound.has(c));

    setFound(newFound);
    setAbsent(newAbsent);
    setGuessCount(newCount);
    if (isComplete) { setComplete(true); setModalOpen(true); }
    persist(WEEK_INDEX, newFound, newAbsent, newCount, isComplete);
  }

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
        padding: '1rem 1rem 100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        minHeight: '100dvh',
      }}
    >
      <header style={{ width: '100%', borderBottom: '2px solid var(--color-stripe)', paddingBottom: '0.75rem', position: 'relative' }}>
        <h1 style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 700, fontFamily: 'var(--font-family-display)', letterSpacing: '0.02em', color: 'var(--color-stripe)' }}>
          Riddle the Badger
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-family-display)', fontStyle: 'italic', color: 'var(--color-gold)' }}>
          Saturday Quote
        </p>
        <button onClick={onToggleMode} aria-label="Switch to daily game" style={{ ...btnStyle(true), top: 0, right: '2rem' }}>¶</button>
        <button onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} style={{ ...btnStyle(true), top: 0, right: 0, fontSize: '1.25rem' }}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>

      <QuoteDisplay quote={QUOTE_DATA.quote} found={found} />

      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
          Par: {PAR} consonants.
        </span>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-stripe)', fontWeight: 600 }}>
          Guesses: {guessCount}
        </span>
      </div>

      <Graveyard absent={absent} />

      {/* Fixed bottom bar — input only */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '375px',
          background: 'var(--color-bg)',
          borderTop: '2px solid var(--color-stripe)',
          padding: '0.75rem 1rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
        }}
      >

        {!complete && (
          <>
            <div style={{ minHeight: '1rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-absent)', fontWeight: 600 }}>
              {error}
            </div>
            <div style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => { setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, '')); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="Type a word…"
                maxLength={15}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.75rem',
                  border: '2px solid var(--color-stripe)',
                  borderRadius: '6px',
                  fontSize: 'var(--font-size-base)',
                  fontFamily: 'var(--font-family-base)',
                  fontWeight: 700,
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  outline: 'none',
                  letterSpacing: '0.08em',
                }}
              />
              <button
                onClick={handleSubmit}
                style={{
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
                Enter
              </button>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <CompletionModal
          guessCount={guessCount}
          quoteData={QUOTE_DATA}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
