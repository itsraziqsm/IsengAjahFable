import { createSky } from './sky.js';
import { buildCity, buildForeground } from './city.js';
import { paletteAt, toCss, CSS_VARS } from './palette.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initHero(root) {
  const skyCanvas = root.querySelector('.hero__sky');
  const cityEl = root.querySelector('.hero__city');
  const fgEl = root.querySelector('.hero__fg');
  const seedCanvas = root.querySelector('.hero__seeds');
  cityEl.innerHTML = buildCity();
  fgEl.innerHTML = buildForeground();

  let sky = null;
  try { sky = createSky(skyCanvas); } catch (e) { console.warn('Sky shader unavailable', e); }
  if (!sky) root.classList.add('hero--nogl');

  const state = { hour: 17.0, par: { x: 0, y: 0 }, tpar: { x: 0, y: 0 }, visible: true, hold: 0, scroll: 0 };
  const fit = { scale: 1, x: 0, y: 0 };
  let W = 0, H = 0;

  // ---------- dandelion seeds
  const ctx = seedCanvas.getContext('2d');
  let seeds = [];
  const spawn = (anywhere) => ({
    x: anywhere ? Math.random() * W : -30 - Math.random() * 200,
    y: H * (0.25 + Math.random() * 0.7),
    z: 0.35 + Math.random() * 0.9,
    ph: Math.random() * 6.28,
    rot: Math.random() * 6.28,
    vy: -(4 + Math.random() * 10),
  });

  const resize = () => {
    W = root.clientWidth; H = root.clientHeight;
    fit.scale = Math.max(W / 1600, H / 900);
    fit.x = (W - 1600 * fit.scale) / 2;
    fit.y = H - 900 * fit.scale;
    sky?.resize();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    seedCanvas.width = W * dpr; seedCanvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(46, W / 30));
    seeds = Array.from({ length: n }, () => spawn(true));
  };
  resize();
  addEventListener('resize', resize);

  root.addEventListener('pointermove', (e) => {
    state.tpar.x = (e.clientX / W - 0.5) * 2;
    state.tpar.y = (e.clientY / H - 0.5) * 2;
  });
  new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; }).observe(root);

  // ---------- palette → CSS
  let lastHour = -1;
  let ink = [1, 1, 1];
  const applyPalette = (pal) => {
    for (const k of CSS_VARS) root.style.setProperty('--' + k, toCss(pal[k]));
    root.style.setProperty('--glow', pal.glow.toFixed(3));
    ink = pal.ink;
  };

  // ---------- sundial
  const dial = root.querySelector('.dial');
  const hand = dial.querySelector('.dial__hand');
  const timeEl = dial.querySelector('.dial__time');
  const nameEl = dial.querySelector('.dial__name');
  const setHour = (h, fromUser) => {
    state.hour = ((h % 24) + 24) % 24;
    if (fromUser) state.hold = 14;
  };
  const hourFromEvent = (e) => {
    const b = dial.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2));
    return ((a + Math.PI / 2) / (Math.PI * 2)) * 24 + 12; // noon on top
  };
  let dragging = false;
  dial.addEventListener('pointerdown', (e) => { dragging = true; dial.setPointerCapture(e.pointerId); setHour(hourFromEvent(e), true); });
  dial.addEventListener('pointermove', (e) => { if (dragging) setHour(hourFromEvent(e), true); });
  dial.addEventListener('pointerup', () => { dragging = false; });
  dial.addEventListener('pointercancel', () => { dragging = false; });
  dial.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 0.5, ArrowUp: 0.5, ArrowLeft: -0.5, ArrowDown: -0.5, PageUp: 3, PageDown: -3 }[e.key];
    if (step) { e.preventDefault(); setHour(state.hour + step, true); }
  });

  const updateDial = (pal) => {
    const deg = ((state.hour - 12) / 24) * 360;
    hand.style.transform = `rotate(${deg}deg)`;
    const hh = Math.floor(state.hour), mm = Math.floor((state.hour % 1) * 60);
    const label = `${String(hh).padStart(2, '0')}:${String(mm - (mm % 5)).padStart(2, '0')}`;
    if (timeEl.textContent !== label) {
      timeEl.textContent = label;
      nameEl.textContent = pal.name;
      dial.setAttribute('aria-valuenow', state.hour.toFixed(1));
      dial.setAttribute('aria-valuetext', `${label}, ${pal.name}`);
    }
    dial.classList.toggle('is-night', state.hour < 5.5 || state.hour > 19);
  };

  // ---------- loop
  let prev = performance.now();
  let t = 0;
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    if (!state.visible) return;
    t += dt;
    if (state.hold > 0) state.hold -= dt;
    else if (!reduced && !dragging) state.hour = (state.hour + (dt / 60) * (state.hour > 20.5 || state.hour < 4.5 ? 3 : 1)) % 24;

    state.par.x += (state.tpar.x - state.par.x) * 0.05;
    state.par.y += (state.tpar.y - state.par.y) * 0.05;

    const pal = paletteAt(state.hour);
    if (Math.abs(state.hour - lastHour) > 0.008) { applyPalette(pal); updateDial(pal); lastHour = state.hour; }
    sky?.render(pal, t, state.par, fit);

    cityEl.style.transform = `translate3d(${(-state.par.x * 7).toFixed(2)}px, ${(-state.par.y * 3 + state.scroll * 0.12).toFixed(2)}px, 0)`;
    fgEl.style.transform = `translate3d(${(-state.par.x * 22).toFixed(2)}px, ${(-state.par.y * 8 - state.scroll * 0.1).toFixed(2)}px, 0)`;

    // seeds
    ctx.clearRect(0, 0, W, H);
    const col = ink.map((v) => Math.round(v * 255)).join(',');
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const gust = 26 + Math.sin(t * 0.35 + s.ph) * 14;
      s.x += (gust * s.z + state.par.x * 6) * dt * (reduced ? 0.3 : 1);
      s.y += (s.vy + Math.sin(t * 0.9 + s.ph) * 12) * dt * s.z;
      s.rot = Math.sin(t * 0.8 + s.ph) * 0.5 + 0.35;
      if (s.x > W + 40 || s.y < -40) seeds[i] = spawn(false);
      const L = 7 * s.z + 3;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = Math.min(1, 0.35 + s.z * 0.5);
      ctx.strokeStyle = `rgba(${col},.9)`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, L); ctx.lineTo(0, 0);
      for (let k = -3; k <= 3; k++) { ctx.moveTo(0, 0); ctx.lineTo(Math.sin(k * 0.42) * L * 0.8, -Math.cos(k * 0.42) * L * 0.8); }
      ctx.stroke();
      ctx.fillStyle = `rgba(${col},.95)`;
      ctx.beginPath(); ctx.arc(0, L, 0.9 * s.z + 0.4, 0, 6.3); ctx.fill();
      const g = ctx.createRadialGradient(0, -L * 0.3, 0, 0, -L * 0.3, L * 1.6);
      g.addColorStop(0, `rgba(${col},.28)`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, -L * 0.3, L * 1.6, 0, 6.3); ctx.fill();
      ctx.restore();
    }
  };
  applyPalette(paletteAt(state.hour));
  requestAnimationFrame(frame);

  return { state, setHour };
}
