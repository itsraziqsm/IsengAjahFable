import { LYRE_ROWS, SOLFEGE, TUNE } from '../data.js';
import { pluck } from '../audio.js';

const SEMIS = [0, 2, 4, 5, 7, 9, 11];
const W = 840, H = 150;

export function initLyre(root) {
  const keysEl = root.querySelector('.lyre__keys');
  const svg = root.querySelector('.lyre__strings');
  const playBtn = root.querySelector('.lyre__play');
  const notes = {}; // letter → { freq, btn, string }

  keysEl.innerHTML = LYRE_ROWS.map((row, ri) => `<div class="lyre__row" data-octave="${row.octave}">${[...row.keys].map((k, i) => `<button type="button" class="key" data-key="${k}" aria-label="${SOLFEGE[i]}, octave ${row.octave}"><b>${SOLFEGE[i]}</b><kbd>${k}</kbd>${'<i></i>'.repeat(3 - ri)}</button>`).join('')}</div>`).join('');

  // strings run low → high, left → right, under a harp-shaped neck
  const order = [...LYRE_ROWS].reverse().flatMap((row) => [...row.keys].map((k, i) => ({ k, freq: 261.63 * 2 ** (row.octave - 4) * 2 ** (SEMIS[i] / 12) })));
  const strings = order.map((n, i) => {
    const x = 30 + (i / 20) * (W - 60);
    const top = 16 + 78 * (i / 20) ** 1.5;
    return { ...n, x, top, amp: 0, t0: 0 };
  });
  svg.innerHTML = `<path class="lyre__neck" d="M10 ${strings[0].top - 8}C${W * 0.4} ${strings[8].top - 26} ${W * 0.7} ${strings[15].top - 14} ${W - 10} ${strings[20].top - 6}"/><path class="lyre__base" d="M10 ${H - 6}H${W - 10}"/>` +
    strings.map((s, i) => `<g class="string" data-key="${s.k}"><path class="string__hit" d="M${s.x} ${s.top - 6}V${H - 6}"/><path class="string__line" d="M${s.x} ${s.top - 6}V${H - 6}"/><circle cx="${s.x}" cy="${s.top - 6}" r="2.2"/></g>`).join('');
  strings.forEach((s) => {
    s.line = svg.querySelector(`.string[data-key="${s.k}"] .string__line`);
    s.g = s.line.parentNode;
    notes[s.k] = { freq: s.freq, btn: keysEl.querySelector(`[data-key="${s.k}"]`), string: s };
  });

  let raf = 0;
  const animate = (now) => {
    let alive = false;
    for (const s of strings) {
      if (s.amp < 0.05) { if (s.amp !== 0) { s.amp = 0; s.line.setAttribute('d', `M${s.x} ${s.top - 6}V${H - 6}`); s.g.classList.remove('is-on'); } continue; }
      alive = true;
      const age = (now - s.t0) / 1000;
      s.amp = 9 * Math.exp(-age * 2.6);
      const dx = Math.sin(age * 46) * s.amp;
      const mid = (s.top - 6 + H - 6) / 2;
      s.line.setAttribute('d', `M${s.x} ${s.top - 6}Q${(s.x + dx * 2).toFixed(2)} ${mid} ${s.x} ${H - 6}`);
    }
    raf = alive ? requestAnimationFrame(animate) : 0;
  };

  const play = (k, when = 0) => {
    const n = notes[k];
    if (!n) return;
    pluck(n.freq, when);
    const fire = () => {
      n.string.amp = 9; n.string.t0 = performance.now(); n.string.g.classList.add('is-on');
      n.btn.classList.remove('is-hit'); void n.btn.offsetWidth; n.btn.classList.add('is-hit');
      if (!raf) raf = requestAnimationFrame(animate);
    };
    when ? setTimeout(fire, when * 1000) : fire();
  };

  root.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('[data-key]');
    if (t) { e.preventDefault(); play(t.dataset.key); }
  });
  // glide across strings like a real glissando
  svg.addEventListener('pointerover', (e) => { if (e.buttons) { const t = e.target.closest('[data-key]'); if (t) play(t.dataset.key); } });
  keysEl.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset.key) { e.preventDefault(); play(e.target.dataset.key); } });

  let inView = false;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.25 }).observe(root);
  addEventListener('keydown', (e) => {
    if (!inView || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toUpperCase();
    if (notes[k]) play(k);
  });

  let timers = [];
  const stop = () => { timers.forEach(clearTimeout); timers = []; playBtn.classList.remove('is-playing'); playBtn.querySelector('span').textContent = 'Play something for me'; };
  playBtn.addEventListener('click', () => {
    if (timers.length) return stop();
    playBtn.classList.add('is-playing');
    playBtn.querySelector('span').textContent = 'Stop';
    const beat = 0.34;
    let t = 0.05;
    for (const [k, len] of TUNE) {
      if (k) timers.push(setTimeout(() => play(k), t * 1000));
      t += len * beat;
    }
    timers.push(setTimeout(stop, t * 1000 + 400));
  });
}
