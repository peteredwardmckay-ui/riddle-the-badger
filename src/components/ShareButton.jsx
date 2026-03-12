import { useState } from 'react';

const idleSrc = '/riddle/Riddle-the-badger.png';

// Fixed palette — share graphic is always light mode so it looks good anywhere
const C = {
  bg:          '#FBF7EF',
  stripe:      '#2B2B2B',
  gold:        '#C8900A',
  text:        '#1A1A1A',
  correct:     '#3B6FCC',
  present:     '#E07060',
  absent:      '#6B2737',
  givenBg:     '#FEF0C7',
  givenBorder: '#C8900A',
  givenText:   '#6B4A00',
  emptyBg:     '#FFFFFF',
  emptyBorder: '#DDDDDD',
};

const W        = 400;
const STRIPE_W = 8;
const PAD_L    = STRIPE_W + 20;
const PAD_R    = 20;
const GAP      = 4;

function calcTileSize(numTiles) {
  const available = W - PAD_L - PAD_R;
  const size = Math.floor((available + GAP) / numTiles) - GAP;
  return Math.min(size, 44);
}

function tile(ctx, x, y, size, bg, border, letter, letterColor) {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
  if (letter) {
    ctx.fillStyle = letterColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x + size / 2, y + size / 2 + 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
}

async function buildCanvas(skeleton, guesses, feedbacks, gameStatus) {
  const ts = calcTileSize(skeleton.length);

  // Calculate canvas height dynamically
  const headerH  = 100;
  const skelH    = ts + 12;
  const gridH    = guesses.length * (ts + GAP);
  const footerH  = 70;
  const H = headerH + skelH + gridH + footerH;

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

  // Burrow illustration — top right
  const idleImg = new Image();
  idleImg.src = idleSrc;
  await idleImg.decode().catch(() => {});
  const imgSize = 52;
  ctx.drawImage(idleImg, W - PAD_R - imgSize, 14, imgSize, imgSize);

  // Title
  let y = 32;
  ctx.fillStyle = C.stripe;
  ctx.font = 'bold 17px "Lora", Georgia, serif';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('RIDDLE THE BADGER', PAD_L, y);
  y += 20;

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
  y += 16;

  // Skeleton row — vowels shown, consonant slots empty
  ctx.font = `bold ${Math.round(ts * 0.44)}px ui-monospace, "Courier New", monospace`;
  skeleton.forEach((cell, i) => {
    const tx = PAD_L + i * (ts + GAP);
    if (cell !== null) {
      tile(ctx, tx, y, ts, C.givenBg, C.givenBorder, cell, C.givenText);
    } else {
      tile(ctx, tx, y, ts, C.emptyBg, C.emptyBorder, null, null);
    }
  });
  y += ts + 12;

  // Guess rows — colours only, no letters
  guesses.forEach((_, gi) => {
    const fb = feedbacks[gi] ?? [];
    let ci = 0;
    skeleton.forEach((cell, si) => {
      const tx = PAD_L + si * (ts + GAP);
      if (cell !== null) {
        tile(ctx, tx, y, ts, C.givenBg, C.givenBorder, null, null);
      } else {
        const state = fb[ci++];
        const bg     = state === 'correct' ? C.correct
                     : state === 'present' ? C.present
                     : state === 'absent'  ? C.absent
                     : C.emptyBg;
        const border = state ? bg : C.emptyBorder;
        tile(ctx, tx, y, ts, bg, border, null, null);
      }
    });
    y += ts + GAP;
  });

  y += 20;

  // Result line
  ctx.fillStyle = C.stripe;
  ctx.font = 'bold 15px "Lora", Georgia, serif';
  ctx.fillText(
    gameStatus === 'won' ? `Solved in ${guesses.length}/5.` : 'Riddle wins today.',
    PAD_L, y
  );
  y += 22;

  // URL
  ctx.fillStyle = C.gold;
  ctx.font = '12px system-ui, -apple-system, sans-serif';
  ctx.fillText('riddlethebadger.com', PAD_L, y);

  return canvas;
}

export default function ShareButton({ gameStatus, skeleton = [], guesses = [], feedbacks = [] }) {
  const [label, setLabel] = useState('Share result');

  const shareText = gameStatus === 'won'
    ? `AEIOU. — Riddle the Badger\nriddlethebadger.com`
    : `Riddle wins today.\nriddlethebadger.com`;

  async function handleShare() {
    // Try canvas + native share (mobile)
    try {
      const canvas = await buildCanvas(skeleton, guesses, feedbacks, gameStatus);
      const blob   = await new Promise((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png')
      );
      const file = new File([blob], 'riddle-the-badger.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: shareText });
        return;
      }
    } catch {}

    // Text-only share sheet (some mobile browsers)
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
        return;
      }
    } catch {}

    // Desktop fallback: copy text to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      // Last resort for browsers blocking clipboard API
      const ta = document.createElement('textarea');
      ta.value = shareText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setLabel('Copied!');
    setTimeout(() => setLabel('Share result'), 2000);
  }

  return (
    <button
      onClick={handleShare}
      style={{
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
      {label}
    </button>
  );
}
