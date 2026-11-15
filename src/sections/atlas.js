import { PLACES } from '../data.js';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;

// closed Catmull-Rom spline through points → cubic Béziers
function smoothClosed(p) {
  const n = p.length;
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
function roughen(points, r, amount, passes = 2) {
  let p = points;
  for (let k = 0; k < passes; k++) {
    const out = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1;
      const off = (r() - 0.5) * amount * (len / 90);
      out.push(a, [(a[0] + b[0]) / 2 - (dy / len) * off, (a[1] + b[1]) / 2 + (dx / len) * off]);
    }
    p = out;
    amount *= 0.55;
  }
  return p;
}

export function initAtlas(root) {
  const svg = root.querySelector('.atlas__map svg');
  svg.setAttribute('viewBox', '-50 -30 1110 790');
  const r = rng(2600);

  const coast = roughen([[70, 170], [100, 90], [180, 48], [270, 72], [340, 40], [420, 74], [500, 46], [570, 62], [640, 26], [730, 42], [806, 14], [846, 62], [800, 130], [834, 190], [790, 250], [852, 300], [912, 350], [884, 412], [822, 442], [880, 500], [918, 572], [850, 622], [760, 640], [700, 692], [600, 702], [520, 660], [430, 692], [330, 668], [260, 702], [160, 650], [110, 580], [40, 520], [72, 430], [30, 340], [82, 260]], r, 26);
  const landD = smoothClosed(coast);
  const lakePts = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    lakePts.push([468 + Math.cos(a) * (88 + r() * 16), 252 + Math.sin(a) * (62 + r() * 12)]);
  }
  const lakeD = smoothClosed(lakePts);
  const reefD = smoothClosed(roughen([[940, 176], [978, 186], [984, 214], [956, 226], [932, 206]], r, 14, 1));

  // glyphs
  const peak = (x, y, s) => (s *= 1.3, `<path class="ink" d="M${f(x - s)} ${f(y)}L${f(x - s * 0.1)} ${f(y - s * 1.35)}L${f(x + s * 0.28)} ${f(y - s * 0.7)}L${f(x + s)} ${f(y)}"/><path class="ink thin" d="M${f(x)} ${f(y - s * 1.1)}l${f(s * 0.3)} ${f(s * 0.95)}M${f(x + s * 0.2)} ${f(y - s * 0.62)}l${f(s * 0.28)} ${f(s * 0.55)}M${f(x - s * 0.06)} ${f(y - s * 0.7)}l${f(s * 0.16)} ${f(s * 0.6)}"/>`);
  const pine = (x, y, s) => (s *= 1.3, `<path class="ink" d="M${f(x)} ${f(y)}v${f(-s * 0.3)}M${f(x - s * 0.42)} ${f(y - s * 0.3)}L${f(x)} ${f(y - s * 1.3)}L${f(x + s * 0.42)} ${f(y - s * 0.3)}Z"/>`);
  const leafy = (x, y, s) => (s *= 1.35, `<path class="ink" d="M${f(x)} ${f(y)}v${f(-s * 0.45)}"/><path class="ink" d="M${f(x - s * 0.5)} ${f(y - s * 0.5)}a${f(s * 0.5)} ${f(s * 0.52)} 0 1 1 ${f(s)} 0z"/>`);
  const scatter = (n, cx, cy, rx, ry, fn, smin, smax, avoid = []) => {
    const items = [];
    let guard = 0;
    while (items.length < n && guard++ < n * 30) {
      const a = r() * Math.PI * 2, q = Math.sqrt(r());
      const x = cx + Math.cos(a) * rx * q, y = cy + Math.sin(a) * ry * q;
      if (avoid.some(([ax, ay, ar]) => Math.hypot(x - ax, y - ay) < ar)) continue;
      items.push([x, y, smin + r() * (smax - smin)]);
    }
    return items.sort((a, b) => a[1] - b[1]).map((i) => fn(...i)).join('');
  };

  const pinAvoid = PLACES.map((p) => [p.x, p.y, 40]);
  let terrain = '';
  terrain += scatter(9, 700, 96, 96, 34, peak, 13, 22, pinAvoid);                 // Stormbearer
  terrain += scatter(11, 152, 178, 100, 82, peak, 12, 19, [[150, 160, 74]]);      // Brightcrown ring
  terrain += scatter(11, 612, 606, 118, 60, peak, 18, 32, [[612, 572, 58]]);      // Dragonspine
  terrain += scatter(6, 330, 560, 70, 40, peak, 11, 17);
  terrain += scatter(26, 290, 414, 80, 58, pine, 9, 14, [[286, 384, 50]]);        // Wolvendom
  terrain += scatter(12, 590, 268, 34, 34, leafy, 8, 12, pinAvoid);               // Whispering Woods
  terrain += scatter(9, 770, 300, 60, 40, leafy, 8, 11);
  terrain += scatter(8, 420, 560, 60, 40, leafy, 8, 11);
  terrain += scatter(7, 760, 520, 50, 40, leafy, 8, 11);

  // vineyards
  let vines = '';
  for (let i = 0; i < 6; i++) vines += `M${150 + i * 3} ${572 + i * 7}l${70 - i * 4} -9`;
  // sea wavelets
  let waves = '';
  for (let i = 0; i < 70; i++) {
    const x = -40 + r() * 1090, y = -20 + r() * 770;
    waves += `M${f(x)} ${f(y)}q4 -4 8 0t8 0`;
  }
  // old capital
  let ruins = '';
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + 0.3;
    if (i === 3) continue;
    ruins += `M${f(150 + Math.cos(a) * 24 - 2.5)} ${f(176 + Math.sin(a) * 18)}v-7h5v7`;
  }

  const roads = [
    'M468 292C470 330 458 360 462 392',
    'M462 400C400 420 350 404 300 408',
    'M455 404C380 470 300 520 206 546',
    'M540 250C580 230 600 200 624 182',
    'M534 262C590 300 630 330 646 366',
    'M650 380C650 450 630 510 616 566',
    'M276 398C230 330 180 250 156 196',
  ];

  const labels = [
    ['Cider Lake', 468, 300, 0], ['Stormbearer Mtns.', 704, 138, -4], ['Starsnatch Cliff', 770, 176, 0],
    ['Whispering Woods', 600, 322, 0], ['Falcon Coast', 800, 366, 8], ['Dadaupa Gorge', 760, 450, 0],
    ['Cape Oath', 836, 590, 0], ['Musk Reef', 958, 246, 0], ['Brightcrown Mtns.', 150, 276, 0], ['Windwail Highland', 340, 498, -6],
  ];

  const pins = PLACES.map((p, i) => `
    <g class="pin" data-id="${p.id}" tabindex="0" role="button" aria-label="${p.name}" transform="translate(${p.x} ${p.y})">
      <circle class="pin__halo" r="20"/>
      <path class="pin__mark" d="M0-13.5L11 0L0 13.5L-11 0Z"/>
      <text class="pin__n" y="4.4">${i + 1}</text>
      <text class="pin__label" y="-25">${p.name}</text>
    </g>`).join('');

  svg.innerHTML = `
    <defs>
      <clipPath id="landClip"><path d="${landD}"/></clipPath>
      <pattern id="lakeHatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6" class="ink thin"/></pattern>
    </defs>
    ${Array.from({ length: 16 }, (_, i) => `<path class="rhumb" transform="rotate(${i * 22.5} 986 668)" d="M986 668V-900"/>`).join('')}
    <path class="waves" d="${waves}"/>
    <g class="shoal">
      <path d="${landD}" style="stroke-width:44"/><path d="${landD}" class="shoal__gap" style="stroke-width:42"/>
      <path d="${landD}" style="stroke-width:28"/><path d="${landD}" class="shoal__gap" style="stroke-width:26"/>
      <path d="${landD}" style="stroke-width:13"/><path d="${landD}" class="shoal__gap" style="stroke-width:11"/>
      <path d="${reefD}" style="stroke-width:13"/><path d="${reefD}" class="shoal__gap" style="stroke-width:11"/>
    </g>
    <path class="land" d="${landD}"/><path class="land" d="${reefD}"/>
    <path class="river" d="M500 196C520 150 506 96 532 44"/>
    <path class="lake" d="${lakeD}"/><path d="${lakeD}" fill="url(#lakeHatch)" opacity=".5"/>
    <g clip-path="url(#landClip)">${terrain}<path class="ink thin" d="${vines}"/><path class="ink" d="${ruins}"/><path class="ink" d="M146 180v-22l4-6l4 6v22"/></g>
    ${roads.map((d) => `<path class="road" d="${d}"/>`).join('')}
    <g class="citymark" transform="translate(468 256)">
      <path class="isle" d="M-30 6C-24-8-10-13 2-13C18-13 30-6 32 6C24 15 8 17-2 17C-16 17-26 14-30 6Z"/>
      <path class="ink" d="M-20 4v-8h5v-4h4v4h6v-14l3-7l3 7v14h6v-5h4v5h6v8"/>
      <path class="ink" d="M10 14C26 22 30 34 28 48"/>
    </g>
    <g class="oakmark" transform="translate(648 366)"><path class="ink" d="M0 12v-12"/><path class="ink" d="M-13-2a13 13 0 1 1 26 0a8 8 0 0 1-13 4a8 8 0 0 1-13-4z"/></g>
    ${labels.map(([t, x, y, rot]) => `<text class="maplabel" x="${x}" y="${y}" transform="rotate(${rot} ${x} ${y})">${t}</text>`).join('')}
    <g class="ship" transform="translate(962 452)"><path class="ink" d="M-17 0h34l-7 9h-20z"/><path class="ink" d="M0 0v-30M1-28c11 5 13 14 13 23h-13M-1-23c-9 4-10 11-10 18h10"/></g>
    <path class="gust" d="M-10 380c16-12 36-6 36 9s-19 14-21 2M900 60c16-12 36-6 36 9s-19 14-21 2M380 742c16-12 36-6 36 9s-19 14-21 2"/>
    <g class="rose" transform="translate(986 668)">
      <circle r="46" class="ink thin"/><circle r="38" class="ink thin" stroke-dasharray="1 5"/>
      <path class="ink" d="M0-56L7-7L0 0L-7-7Z"/><path class="ink-fill" d="M0-56L7-7L0 0Z"/>
      <path class="ink" d="M0 46L7 7L0 0L-7 7ZM46 0L7 7L0 0L7-7ZM-46 0L-7 7L0 0L-7-7Z"/>
      <path class="ink thin" d="M24-24L5-5M24 24L5 5M-24 24L-5 5M-24-24L-5-5"/>
      <text class="rose__n" y="-62">N</text>
    </g>
    <g class="cartouche" transform="translate(-22 8)">
      <text class="cartouche__t" y="0">Mondstadt</text>
      <path class="ink thin" d="M0 14h300"/>
      <text class="cartouche__s" y="36">Northeast of Teyvat · drawn from memory</text>
    </g>
    <g class="scale" transform="translate(-22 720)"><path class="ink" d="M0 0h120M0-4v8M40-3v6M80-3v6M120-4v8"/><text class="maplabel" x="60" y="-9">one day on foot</text></g>
    ${pins}`;

  // index + card
  const index = root.querySelector('.atlas__index');
  index.innerHTML = PLACES.map((p, i) => `<li><button type="button" data-id="${p.id}"><span>${String(i + 1).padStart(2, '0')}</span>${p.name}</button></li>`).join('');
  const card = root.querySelector('.atlas__card');
  const el = {
    kind: card.querySelector('.atlas__kind'), name: card.querySelector('.atlas__name'),
    text: card.querySelector('.atlas__text'), note: card.querySelector('.atlas__note'),
  };
  let current = null;
  const select = (id) => {
    if (id === current) return;
    current = id;
    const p = PLACES.find((x) => x.id === id);
    svg.querySelectorAll('.pin').forEach((n) => n.classList.toggle('is-active', n.dataset.id === id));
    index.querySelectorAll('button').forEach((n) => n.setAttribute('aria-current', n.dataset.id === id));
    card.classList.remove('is-in');
    void card.offsetWidth;
    el.kind.textContent = p.kind; el.name.textContent = p.name; el.text.textContent = p.text; el.note.textContent = p.note;
    card.classList.add('is-in');
  };
  root.addEventListener('click', (e) => { const t = e.target.closest('[data-id]'); if (t) select(t.dataset.id); });
  root.addEventListener('pointerover', (e) => { const t = e.target.closest('.pin'); if (t) select(t.dataset.id); });
  svg.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.pin')) { e.preventDefault(); select(e.target.closest('.pin').dataset.id); } });
  select('city');
}
