// Time-of-day palette. One source of truth for the shader sky and the SVG city.
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

const KEYS = [
  {
    h: 0, name: 'Midnight',
    skyTop: '#040a1c', skyMid: '#0b2141', horizon: '#1d5262',
    cloudLit: '#35607c', cloudShade: '#0c1d33',
    mtnFar: '#16324c', mtnNear: '#0b1c2d', water: '#0a2538',
    wall: '#3d5670', wallShade: '#22344c', roof: '#3b3a5c', roofShade: '#232544',
    stone: '#34506a', stoneShade: '#1c3047', rock: '#152a3e', rockShade: '#0b1a2a',
    leaf: '#17384a', leafShade: '#0c2334', fg: '#050f1b', fgRim: '#0e2b3a',
    haze: '#17405a', glow: 1, stars: 1, sunCol: '#ffd9a0', ink: '#eaf6f2',
  },
  {
    h: 5.6, name: 'Dawn',
    skyTop: '#27456f', skyMid: '#c98f9c', horizon: '#ffd7a6',
    cloudLit: '#ffdcc9', cloudShade: '#8a7fa6',
    mtnFar: '#93a0c2', mtnNear: '#55688f', water: '#7f8fb4',
    wall: '#e3c4b4', wallShade: '#9f8aa0', roof: '#c06a5c', roofShade: '#804a5e',
    stone: '#b9a9b4', stoneShade: '#7b7594', rock: '#5f6588', rockShade: '#3f4468',
    leaf: '#56768a', leafShade: '#3a546f', fg: '#1a2440', fgRim: '#4b4f73',
    haze: '#e0b3ae', glow: 0.55, stars: 0.15, sunCol: '#ffe3b0', ink: '#fff7ec',
  },
  {
    h: 8.5, name: 'Morning',
    skyTop: '#2a78bf', skyMid: '#84c6e6', horizon: '#e4f4e6',
    cloudLit: '#ffffff', cloudShade: '#a3c8de',
    mtnFar: '#9fcbd9', mtnNear: '#5ea79c', water: '#55adc2',
    wall: '#f4e6cc', wallShade: '#b9b3a8', roof: '#cf6a47', roofShade: '#964a3c',
    stone: '#d5d2c0', stoneShade: '#98a39f', rock: '#7d9488', rockShade: '#506d68',
    leaf: '#5fa776', leafShade: '#3a7a62', fg: '#14443f', fgRim: '#3a8a62',
    haze: '#bfe3e6', glow: 0, stars: 0, sunCol: '#fffbe6', ink: '#ffffff',
  },
  {
    h: 15, name: 'Afternoon',
    skyTop: '#2670b8', skyMid: '#7dbfe2', horizon: '#eaf3da',
    cloudLit: '#fffdf4', cloudShade: '#9dc0d8',
    mtnFar: '#a2c9d6', mtnNear: '#62a596', water: '#57a9bf',
    wall: '#f6e7c8', wallShade: '#bbb1a2', roof: '#d16c44', roofShade: '#964a39',
    stone: '#d8d2ba', stoneShade: '#9aa29b', rock: '#80947f', rockShade: '#526c62',
    leaf: '#66a86e', leafShade: '#3d7a5c', fg: '#15443c', fgRim: '#3d8a5e',
    haze: '#c8e4dd', glow: 0, stars: 0, sunCol: '#fff6d8', ink: '#ffffff',
  },
  {
    h: 18.4, name: 'Dusk',
    skyTop: '#232f66', skyMid: '#c0607a', horizon: '#ffc56f',
    cloudLit: '#ffbf8e', cloudShade: '#6a4a80',
    mtnFar: '#7d6a99', mtnNear: '#41406d', water: '#6c5a8e',
    wall: '#f0b98a', wallShade: '#8a5f7b', roof: '#b9503f', roofShade: '#6a3152',
    stone: '#c79a86', stoneShade: '#6f5479', rock: '#54456f', rockShade: '#322a52',
    leaf: '#4b5f6e', leafShade: '#2e3a58', fg: '#15142f', fgRim: '#4a3560',
    haze: '#e59a78', glow: 0.75, stars: 0.1, sunCol: '#ffd591', ink: '#fff5e6',
  },
  {
    h: 20.2, name: 'Nightfall',
    skyTop: '#070f2a', skyMid: '#1a2d5c', horizon: '#4a5f86',
    cloudLit: '#4a668f', cloudShade: '#121f3d',
    mtnFar: '#1d3558', mtnNear: '#0e1f38', water: '#10294a',
    wall: '#46597a', wallShade: '#273752', roof: '#44395f', roofShade: '#282645',
    stone: '#3a5070', stoneShade: '#1f314c', rock: '#182b44', rockShade: '#0c1a2d',
    leaf: '#193850', leafShade: '#0d2337', fg: '#060f1e', fgRim: '#12293f',
    haze: '#23426a', glow: 1, stars: 0.8, sunCol: '#ffd9a0', ink: '#eef4fa',
  },
];

const COLOR_KEYS = Object.keys(KEYS[0]).filter((k) => typeof KEYS[0][k] === 'string' && KEYS[0][k][0] === '#');
const PARSED = KEYS.map((k) => {
  const o = { h: k.h, name: k.name, glow: k.glow, stars: k.stars };
  for (const c of COLOR_KEYS) o[c] = hex(k[c]);
  return o;
});

const smooth = (t) => t * t * (3 - 2 * t);

export function paletteAt(hour) {
  hour = ((hour % 24) + 24) % 24;
  let i = PARSED.length - 1;
  for (let k = 0; k < PARSED.length; k++) if (PARSED[k].h <= hour) i = k;
  const a = PARSED[i];
  const b = PARSED[(i + 1) % PARSED.length];
  const span = ((b.h - a.h + 24) % 24) || 24;
  const t = smooth(((hour - a.h + 24) % 24) / span);
  const out = { glow: a.glow + (b.glow - a.glow) * t, stars: a.stars + (b.stars - a.stars) * t };
  for (const c of COLOR_KEYS) out[c] = a[c].map((v, n) => v + (b[c][n] - v) * t);
  out.name = t < 0.5 ? a.name : b.name;

  // Sun and moon ride opposite arcs. Scene units: 1600 x 900, horizon at y = 540.
  const ang = ((hour - 6) / 12) * Math.PI;
  out.sun = [800 + Math.cos(ang) * 470, 560 - Math.sin(ang) * 430];
  out.moon = [800 - Math.cos(ang) * 420, 540 + Math.sin(ang) * 400];
  return out;
}

export const toCss = (c) => `rgb(${c.map((v) => Math.round(v * 255)).join(' ')})`;
export const CSS_VARS = ['wall', 'wallShade', 'roof', 'roofShade', 'stone', 'stoneShade', 'rock', 'rockShade', 'leaf', 'leafShade', 'fg', 'fgRim', 'haze', 'water', 'horizon', 'skyTop', 'ink'];
