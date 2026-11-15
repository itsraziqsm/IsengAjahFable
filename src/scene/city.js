// Mondstadt, drawn procedurally: an island city of tiered roofs, three windmills
// and a cathedral. Every shape is two-tone (lit / shade) and takes its colour from
// CSS variables, so the whole town follows the time of day.

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;
const pts = (a) => a.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');
const poly = (cls, a) => `<polygon class="${cls}" points="${pts(a)}"/>`;
const rect = (cls, x, y, w, h) => `<rect class="${cls}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/>`;

function house(r, x, base, w, h, roofH) {
  const top = base - h;
  let s = rect('w', x, top, w, h) + rect('ws', x + w * 0.62, top, w * 0.38, h);
  // half-timber framing
  if (r() > 0.35) {
    s += `<path class="beam" d="M${f(x)} ${f(top + h * 0.48)}h${f(w)}M${f(x + w * 0.62)} ${f(top)}v${f(h)}${r() > 0.5 ? `M${f(x + 2)} ${f(top + h * 0.48)}l${f(w * 0.3)} ${f(h * 0.5)}` : ''}"/>`;
  }
  const cols = Math.max(1, Math.floor(w / 11));
  const rows = h > 30 ? 2 : 1;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (r() < 0.25) continue;
      const wx = x + (w / cols) * (i + 0.5) - 1.6;
      const wy = top + 6 + j * (h * 0.46);
      s += `<rect class="win${r() > 0.45 ? ' on' : ''}" x="${f(wx)}" y="${f(wy)}" width="3.2" height="5.2" style="--d:${f(r() * 6)}s"/>`;
    }
  }
  if (r() > 0.5) {
    // gable facing us
    s += poly('r', [[x - 3, top + 1], [x + w / 2, top - roofH * 1.35], [x + w + 3, top + 1]]);
    s += poly('rs', [[x + w / 2, top - roofH * 1.35], [x + w + 3, top + 1], [x + w * 0.62, top + 1]]);
  } else {
    s += poly('r', [[x - 3, top + 1], [x + 4, top - roofH], [x + w - 4, top - roofH], [x + w + 3, top + 1]]);
    s += poly('rs', [[x + w * 0.62, top - roofH], [x + w - 4, top - roofH], [x + w + 3, top + 1], [x + w * 0.62, top + 1]]);
    if (r() > 0.4) s += rect('ss', x + w * 0.2, top - roofH - 6, 4, 8);
    if (r() > 0.5) s += poly('r', [[x + w * 0.36, top - 1], [x + w * 0.45, top - roofH * 0.7], [x + w * 0.54, top - 1]]);
  }
  return s;
}

function tree(r, x, base, size) {
  let s = rect('ks', x - 1, base - size * 0.6, 2, size * 0.6);
  const n = 3 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const cx = x + (r() - 0.5) * size * 0.9;
    const cy = base - size * (0.55 + r() * 0.5);
    const rad = size * (0.3 + r() * 0.2);
    s += `<circle class="ls" cx="${f(cx + 1.5)}" cy="${f(cy + 1.5)}" r="${f(rad)}"/><circle class="l" cx="${f(cx - 1)}" cy="${f(cy - 1)}" r="${f(rad * 0.82)}"/>`;
  }
  return s;
}

function tower(x, base, w, h, roofH, cls = 's') {
  const top = base - h;
  let s = rect(cls, x - w / 2, top, w, h) + rect(cls + 's', x + w * 0.12, top, w * 0.38, h);
  s += rect(cls + 's', x - w / 2 - 1.5, top - 2, w + 3, 3);
  s += poly('t', [[x - w / 2 - 2, top - 2], [x, top - 2 - roofH], [x + w / 2 + 2, top - 2]]);
  s += poly('ts', [[x, top - 2 - roofH], [x + w / 2 + 2, top - 2], [x + w * 0.12, top - 2]]);
  s += `<rect class="win on" x="${f(x - 1.4)}" y="${f(top + 8)}" width="2.8" height="7" rx="1.4"/>`;
  return s;
}

function windmill(x, base, h, span, speed) {
  const top = base - h;
  const wB = h * 0.24, wT = h * 0.13;
  let s = poly('w', [[x - wB, base], [x - wT, top], [x + wT, top], [x + wB, base]]);
  s += poly('ws', [[x + wT * 0.2, top], [x + wT, top], [x + wB, base], [x + wB * 0.3, base]]);
  s += rect('beam-fill', x - wB * 0.86, base - h * 0.42, wB * 1.72, 1.6);
  s += `<rect class="win on" x="${f(x - 1.6)}" y="${f(base - h * 0.34)}" width="3.2" height="6" rx="1.6"/>`;
  s += poly('r', [[x - wT - 3, top + 1], [x, top - h * 0.2], [x + wT + 3, top + 1]]);
  s += poly('rs', [[x, top - h * 0.2], [x + wT + 3, top + 1], [x + wT * 0.2, top + 1]]);
  let blades = '';
  for (let i = 0; i < 4; i++) {
    blades += `<g transform="rotate(${i * 90})"><path class="spar" d="M0 0V${f(-span)}"/><path class="sail" d="M1.2 ${f(-span * 0.22)}L${f(span * 0.2)} ${f(-span * 0.26)}L${f(span * 0.2)} ${f(-span * 0.98)}L1.2 ${f(-span * 0.98)}Z"/><path class="lattice" d="M1.2 ${f(-span * 0.5)}H${f(span * 0.2)}M1.2 ${f(-span * 0.74)}H${f(span * 0.2)}M${f(span * 0.1)} ${f(-span * 0.24)}V${f(-span * 0.98)}"/></g>`;
  }
  s += `<g transform="translate(${f(x)} ${f(top - h * 0.03)})"><g class="blades" style="animation-duration:${speed}s">${blades}</g><circle class="ss" r="2.6"/></g>`;
  return s;
}

function cathedral(cx, base) {
  let s = '';
  // great spire behind the nave
  s += rect('s', cx - 13, base - 150, 26, 150) + rect('ss', cx + 3, base - 150, 10, 150);
  s += poly('t', [[cx - 16, base - 148], [cx, base - 236], [cx + 16, base - 148]]);
  s += poly('ts', [[cx, base - 236], [cx + 16, base - 148], [cx + 3, base - 148]]);
  s += `<path class="spar" d="M${cx} ${base - 236}v-13M${cx - 4} ${base - 243}h8"/>`;
  s += `<rect class="win on" x="${cx - 2}" y="${base - 138}" width="4" height="12" rx="2"/>`;
  // nave
  s += rect('s', cx - 44, base - 70, 88, 70) + rect('ss', cx + 12, base - 70, 32, 70);
  s += poly('t', [[cx - 48, base - 68], [cx, base - 116], [cx + 48, base - 68]]);
  s += poly('ts', [[cx, base - 116], [cx + 48, base - 68], [cx + 12, base - 68]]);
  s += `<circle class="ss" cx="${cx}" cy="${base - 50}" r="11"/><circle class="win on rose" cx="${cx}" cy="${base - 50}" r="8.4"/>`;
  s += `<path class="tracery" d="M${cx - 8.4} ${base - 50}h16.8M${cx} ${base - 58.4}v16.8M${cx - 6} ${base - 56}l12 12M${cx + 6} ${base - 56}l-12 12"/>`;
  s += `<path class="door" d="M${cx - 7} ${base}v-18a7 7 0 0 1 14 0v18z"/>`;
  for (const dx of [-30, -19, 19, 30]) s += `<rect class="win on" x="${cx + dx - 1.8}" y="${base - 44}" width="3.6" height="16" rx="1.8"/>`;
  // twin towers
  for (const side of [-1, 1]) {
    const tx = cx + side * 56;
    s += rect('s', tx - 11, base - 112, 22, 112) + rect('ss', tx + 2, base - 112, 9, 112);
    s += rect('ss', tx - 13, base - 114, 26, 3) + rect('ss', tx - 12, base - 66, 24, 2);
    s += poly('t', [[tx - 13, base - 113], [tx, base - 172], [tx + 13, base - 113]]);
    s += poly('ts', [[tx, base - 172], [tx + 13, base - 113], [tx + 2, base - 113]]);
    s += `<rect class="win on" x="${tx - 1.8}" y="${base - 102}" width="3.6" height="13" rx="1.8"/><rect class="win" x="${tx - 1.8}" y="${base - 54}" width="3.6" height="11" rx="1.8"/>`;
  }
  // steps
  s += rect('ss', cx - 64, base - 3, 128, 3);
  return s;
}

function statue(x, base) {
  // Barbatos, hands cupped to the sky
  return `<g class="statue">${rect('ss', x - 7, base - 9, 14, 9)}${rect('s', x - 5, base - 13, 10, 5)}
    <path class="s" d="M${x - 3.4} ${base - 13}l1.6-15h3.6l1.6 15z"/>
    <circle class="s" cx="${x}" cy="${base - 31}" r="2.6"/>
    <path class="s" d="M${x - 1.5} ${base - 26}c-6-1-11-7-14-13 5 2 9 2 14 6zM${x + 1.5} ${base - 26}c6-1 11-7 14-13-5 2-9 2-14 6z"/>
    <path class="spar" d="M${x - 1.8} ${base - 27}l-4-8M${x + 1.8} ${base - 27}l4-8"/></g>`;
}

function wall(r, x0, x1, base, h) {
  const top = base - h;
  let s = rect('s', x0, top, x1 - x0, h);
  s += rect('ss', x0, top + h * 0.55, x1 - x0, h * 0.45);
  let cren = '';
  for (let x = x0; x < x1 - 4; x += 9) cren += `M${f(x)} ${f(top)}v-3.5h4.5v3.5`;
  s += `<path class="s" d="${cren}z"/>`;
  let courses = '';
  for (let i = 0; i < 46; i++) {
    const bx = x0 + r() * (x1 - x0 - 12);
    courses += `M${f(bx)} ${f(top + 3 + r() * (h - 6))}h${f(5 + r() * 8)}`;
  }
  s += `<path class="mortar" d="${courses}"/>`;
  return s;
}

function bridge(x0, x1, deck) {
  let s = '';
  const span = 74;
  let d = `M${x0} ${deck}H${x1}V${deck + 30}`;
  for (let x = x1; x > x0 + 20; x -= span) {
    const a = Math.max(x - span, x0);
    const w = x - a;
    d += `H${f(x - 9)}V${deck + 22}a${f((w - 18) / 2)} 15 0 0 0 ${f(-(w - 18))} 0V${deck + 30}`;
  }
  d += `H${x0}Z`;
  s += `<path class="s" d="${d}"/>` + rect('ss', x0, deck + 5, x1 - x0, 3) + rect('s', x0, deck - 3, x1 - x0, 3.4);
  for (let x = x0 + 30; x < x1; x += span) s += rect('ss', x - 2, deck - 9, 4, 9) + `<circle class="lamp" cx="${x}" cy="${deck - 11}" r="2"/>`;
  return s;
}

export function buildCity() {
  const r = rng(1104);
  const WATER = 604;
  const tiers = [];

  // rows of houses, back to front
  const row = (x0, x1, base, hMin, hMax, fog) => {
    let s = '';
    let x = x0;
    while (x < x1) {
      const w = 15 + r() * 15;
      const h = hMin + r() * (hMax - hMin);
      if (r() < 0.16) { s += tree(r, x + 6, base, 14 + r() * 10); x += 11; continue; }
      s += house(r, x, base, w, h, 8 + r() * 8);
      x += w + (r() < 0.3 ? 4 + r() * 5 : -1);
    }
    return `<g style="--fog:${fog}">${s}</g>`;
  };

  // far tier: cathedral close
  tiers.push(`<g style="--fog:.34">${rect('s', 696, 452, 328, 34)}${rect('ss', 696, 462, 328, 24)}${cathedral(858, 452)}${statue(772, 452)}${tree(r, 730, 452, 22)}${tree(r, 962, 452, 24)}${tree(r, 990, 452, 18)}${tower(706, 452, 13, 38, 20)}</g>`);
  tiers.push(row(628, 760, 486, 20, 34, 0.26) + row(930, 1086, 486, 20, 36, 0.26));
  tiers.push(`<g style="--fog:.22">${windmill(1066, 486, 62, 40, 19)}${tower(790, 488, 15, 30, 16)}${tower(926, 488, 15, 30, 16)}${rect('s', 790, 470, 136, 18)}${rect('ss', 790, 480, 136, 8)}<path class="door" d="M848 488v-12a10 10 0 0 1 20 0v12z"/></g>`);
  tiers.push(row(566, 1132, 520, 22, 38, 0.16));
  tiers.push(`<g style="--fog:.12">${windmill(612, 520, 78, 50, 15)}${tower(1010, 522, 20, 58, 26)}${rect('s', 1022, 478, 42, 44)}${rect('ss', 1048, 478, 16, 44)}${poly('r', [[1018, 480], [1043, 458], [1068, 480]])}${poly('rs', [[1043, 458], [1068, 480], [1048, 480]])}<rect class="win on" x="1030" y="488" width="4" height="8"/><rect class="win on" x="1039" y="488" width="4" height="8"/><rect class="win" x="1030" y="504" width="4" height="8"/></g>`);
  tiers.push(row(500, 1180, 552, 20, 36, 0.06));
  tiers.push(`<g style="--fog:.04">${windmill(880, 552, 92, 58, 12)}${tree(r, 548, 552, 22)}${tree(r, 1150, 552, 20)}</g>`);

  // ramparts
  let ramparts = wall(r, 462, 1218, 574, 24);
  for (const x of [470, 590, 715, 840, 965, 1090, 1210]) ramparts += tower(x, 576, 22, 36, 20);
  ramparts += `<path class="door" d="M1196 574v-13a8 8 0 0 1 16 0v13z"/>`;

  // island rock: a faceted cliff under the ramparts
  let island = '';
  const top = [], bot = [];
  for (let x = 424; x <= 1256; x += 26) top.push([x + (r() - 0.5) * 8, 571 + (r() - 0.5) * 5]);
  for (let x = 1268; x >= 412; x -= 26) bot.push([x + (r() - 0.5) * 8, WATER + 3 + (r() - 0.5) * 3]);
  island += poly('k', [...top, ...bot]);
  for (let x = 420; x < 1250; x += 14 + r() * 26) {
    const w2 = 8 + r() * 16;
    const y0 = 573 + r() * 4;
    island += poly(r() > 0.5 ? 'ks soft' : 'kl soft', [[x, y0], [x + w2, y0 + r() * 3], [x + w2 * (0.6 + r() * 0.5), WATER + 4], [x - 3 + r() * 6, WATER + 4]]);
  }
  for (let x = 440; x < 1240; x += 30 + r() * 60) island += `<circle class="l" cx="${f(x)}" cy="${f(573 + r() * 3)}" r="${f(3 + r() * 4)}"/>`;
  const town = `<g>${tiers.join('')}<g style="--fog:0">${bridge(1214, 1720, 566)}${ramparts}${island}</g></g>`;

  return `
  <defs>
    <linearGradient id="reflFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".62"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="reflMask" maskUnits="userSpaceOnUse" x="0" y="${WATER}" width="1800" height="330"><rect x="0" y="${WATER}" width="1800" height="330" fill="url(#reflFade)"/></mask>
    <filter id="ripple" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".006 .11" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="13" xChannelSelector="R" yChannelSelector="G"/></filter>
  </defs>
  <g class="reflection" mask="url(#reflMask)"><g filter="url(#ripple)"><g transform="translate(0 ${WATER * 2 + 4}) scale(1 -1)">${town}</g></g></g>
  <rect class="mist" x="300" y="${WATER - 4}" width="1100" height="14"/>
  ${town}`;
}

// The cliff we are standing on: a dark stage of grass, dandelions and one old oak.
export function buildForeground() {
  const r = rng(77);
  const ground = (x) => 822 - 104 * Math.exp(-(((x - 120) / 300) ** 2)) - 86 * Math.exp(-(((x - 1570) / 310) ** 2)) + 16 * Math.sin(x * 0.006);
  let d = 'M-80 900';
  for (let x = -80; x <= 1680; x += 20) d += `L${x} ${f(ground(x))}`;
  d += 'L1680 900Z';

  const groups = Array.from({ length: 9 }, () => '');
  for (let i = 0; i < 520; i++) {
    const x = -60 + r() * 1720;
    const y = ground(x) + 5;
    const len = 12 + r() * 30;
    const lean = (r() - 0.35) * 14;
    const wd = 1.4 + r() * 1.8;
    groups[i % 9] += `<path class="${r() > 0.72 ? 'blade rim' : 'blade'}" d="M${f(x - wd)} ${f(y)}Q${f(x + lean * 0.3)} ${f(y - len * 0.6)} ${f(x + lean)} ${f(y - len)}Q${f(x + lean * 0.5 + wd)} ${f(y - len * 0.5)} ${f(x + wd)} ${f(y)}Z"/>`;
  }
  const puffs = [];
  for (let i = 0; i < 26; i++) {
    const x = r() < 0.5 ? 20 + r() * 420 : 1120 + r() * 470;
    const y = ground(x) + 4;
    const len = 34 + r() * 46;
    const lean = (r() - 0.3) * 16;
    const hx = x + lean, hy = y - len, rad = 5.5 + r() * 3.5;
    let rays = '';
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * Math.PI * 2;
      rays += `M${f(hx)} ${f(hy)}l${f(Math.cos(a) * rad)} ${f(Math.sin(a) * rad)}`;
    }
    puffs.push(`<g class="sway" style="--o:${f(x)}px ${f(y)}px;--d:${f(-r() * 6)}s;--a:${f(1.5 + r() * 2.5)}deg"><path class="stem" d="M${f(x)} ${f(y)}Q${f(x + lean * 0.2)} ${f(y - len * 0.6)} ${f(hx)} ${f(hy)}"/><circle class="puff" cx="${f(hx)}" cy="${f(hy)}" r="${f(rad)}"/><path class="rays" d="${rays}"/></g>`);
  }

  // oak on the left bluff
  let canopy = '';
  const blobs = [[30, 130, 150], [190, 40, 120], [-30, 300, 120], [96, 250, 84], [340, -30, 110], [470, -50, 80]];
  for (let i = 0; i < 16; i++) { const b = blobs[i % 6]; const a = 0.2 + r() * 1.9; blobs.push([b[0] + Math.cos(a) * b[2] * 0.9, b[1] + Math.sin(a) * b[2] * 0.9, 16 + r() * 22]); }
  for (const [x, y, rad] of blobs) canopy += `<circle class="fgf" cx="${x}" cy="${y}" r="${rad}"/>`;
  let leaves = '';
  for (let i = 0; i < 170; i++) {
    const a = r() * Math.PI * 2;
    const b = blobs[Math.floor(r() * blobs.length)];
    const x = b[0] + Math.cos(a) * b[2] * (0.95 + r() * 0.16);
    const y = b[1] + Math.sin(a) * b[2] * (0.95 + r() * 0.16);
    if (y < 30 || x < 20) continue;
    leaves += `<ellipse class="${r() > 0.6 ? 'fgr' : 'fgf'}" cx="${f(x)}" cy="${f(y)}" rx="${f(7 + r() * 9)}" ry="${f(4 + r() * 4)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`;
  }
  const oak = `<g class="oak"><path class="fgf" d="M40 900C70 760 96 610 86 430C82 350 110 300 150 250L196 276C168 330 152 372 158 440C170 590 186 750 236 900Z"/><path class="fgf" d="M150 430C196 392 232 356 262 250l20 10C262 372 226 424 176 470Z"/><g class="sway" style="--o:120px 300px;--d:-2s;--a:.6deg">${canopy}${leaves}</g></g>`;

  return `${oak}<path class="fgf" d="${d}"/>${groups.map((g, i) => `<g class="sway" style="--o:800px 860px;--d:${-i * 0.7}s;--a:${0.5 + (i % 3) * 0.25}deg">${g}</g>`).join('')}${puffs.join('')}`;
}
