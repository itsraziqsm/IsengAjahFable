// Shuffled soundtrack. Every audio file in src/music/ is discovered at build time.
const files = import.meta.glob('./music/*.{mp3,ogg,m4a,wav}', { eager: true, query: '?url', import: 'default' });
export const TRACKS = Object.entries(files).map(([path, url]) => ({
  url,
  title: decodeURIComponent(path.split('/').pop()).replace(/\.[^.]+$/, '').replace(/^[\d.\s_-]+(?=\S)/, '').trim(),
}));

const VOLUME = 0.7;
let el = null, bag = [], current = null, fadeRaf = 0, duckTimer = 0, ducked = false, wanted = false;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn({ playing: wanted, title: current?.title ?? '' }));
export const onMusic = (fn) => { listeners.add(fn); emit(); };

function draw() {
  if (!bag.length) {
    bag = TRACKS.slice();
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; }
    // never the same piece twice in a row across a reshuffle
    if (bag.length > 1 && bag[bag.length - 1] === current) bag.unshift(bag.pop());
  }
  return bag.pop();
}

function fadeTo(target, ms, done) {
  cancelAnimationFrame(fadeRaf);
  const from = el.volume, t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    el.volume = Math.max(0, Math.min(1, from + (target - from) * k));
    if (k < 1) fadeRaf = requestAnimationFrame(step); else done?.();
  };
  fadeRaf = requestAnimationFrame(step);
}
const level = () => (ducked ? VOLUME * 0.3 : VOLUME);

function load(track) {
  current = track;
  el.src = track.url;
  el.volume = 0;
  const p = el.play();
  if (p) p.then(() => fadeTo(level(), 1800)).catch(() => { wanted = false; emit(); });
  emit();
}

export function playMusic() {
  if (!TRACKS.length) return false;
  if (!el) {
    el = new Audio();
    el.preload = 'auto';
    el.addEventListener('ended', () => load(draw()));
    el.addEventListener('error', () => { if (wanted && TRACKS.length > 1) load(draw()); });
  }
  wanted = true;
  if (!current) load(draw());
  else el.play().then(() => fadeTo(level(), 900)).catch(() => { wanted = false; emit(); });
  emit();
  return true;
}
export function pauseMusic() {
  if (!el) return;
  wanted = false;
  fadeTo(0, 500, () => el.pause());
  emit();
}
export function nextMusic() {
  if (!el || !current) return playMusic();
  wanted = true;
  fadeTo(0, 350, () => load(draw()));
}
export const isPlaying = () => wanted;

// soften the soundtrack while someone is playing the lyre
export function duck() {
  if (!el || !wanted) return;
  if (!ducked) { ducked = true; fadeTo(level(), 300); }
  clearTimeout(duckTimer);
  duckTimer = setTimeout(() => { ducked = false; if (wanted) fadeTo(level(), 1600); }, 3500);
}
