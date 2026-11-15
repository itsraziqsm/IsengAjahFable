import { PEOPLE, ELEMENT_COLOR } from '../data.js';

export function initPeople(root) {
  const list = root.querySelector('.people__list');
  const svg = root.querySelector('.people__sky svg');
  const art = root.querySelector('.people__art');
  const fig = root.querySelector('.people__sky');
  const q = (s) => root.querySelector(s);
  const el = { title: q('.people__title'), name: q('.people__name'), text: q('.people__text'), element: q('.people__element'), weapon: q('.people__weapon'), role: q('.people__role'), sign: q('.people__sign') };
  const card = q('.people__card');

  list.innerHTML = PEOPLE.map((p, i) => `<li><button type="button" role="tab" data-id="${p.id}" style="--el:${ELEMENT_COLOR[p.element]}"><i></i><span>${p.name}</span><small>${String(i + 1).padStart(2, '0')}</small></button></li>`).join('');

  let current = null;
  const select = (id) => {
    if (id === current) return;
    current = id;
    const p = PEOPLE.find((x) => x.id === id);
    root.style.setProperty('--el', ELEMENT_COLOR[p.element]);
    list.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', b.dataset.id === id));

    const lines = p.links.map(([a, b], i) => {
      const [x1, y1] = p.stars[a], [x2, y2] = p.stars[b];
      return `<line pathLength="1" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="--i:${i}"/>`;
    }).join('');
    const stars = p.stars.map(([x, y], i) => {
      const big = i % 3 === 0;
      return `<g class="star" style="--i:${i}" transform="translate(${x} ${y})"><circle class="star__halo" r="${big ? 4.2 : 2.8}"/><path d="M0-${big ? 2.6 : 1.7}Q0 0 ${big ? 2.6 : 1.7} 0Q0 0 0 ${big ? 2.6 : 1.7}Q0 0-${big ? 2.6 : 1.7} 0Q0 0 0-${big ? 2.6 : 1.7}Z"/></g>`;
    }).join('');
    svg.innerHTML = `<circle class="orbit" cx="50" cy="50" r="47"/><circle class="orbit dash" cx="50" cy="50" r="41"/><g class="links">${lines}</g>${stars}`;

    card.classList.remove('is-in');
    void card.offsetWidth;
    el.title.textContent = p.title; el.name.textContent = p.name; el.text.textContent = p.text;
    el.element.textContent = p.element; el.weapon.textContent = p.weapon; el.role.textContent = p.role; el.sign.textContent = p.sign;
    card.classList.add('is-in');

    // optional portrait: drop a file at public/art/<id>.png (or .webp) and it appears here
    art.hidden = true; fig.classList.remove('has-art');
    const tryLoad = (exts) => {
      if (!exts.length) return;
      const probe = new Image();
      probe.onload = () => { if (current !== id) return; art.src = probe.src; art.alt = `Portrait of ${p.name}`; art.hidden = false; fig.classList.add('has-art'); };
      probe.onerror = () => tryLoad(exts.slice(1));
      probe.src = `${import.meta.env.BASE_URL}art/${id}.${exts[0]}`;
    };
    tryLoad(['webp', 'png']);
  };

  list.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) select(b.dataset.id); });
  list.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    e.preventDefault();
    const i = PEOPLE.findIndex((p) => p.id === current);
    const n = PEOPLE[(i + (e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1) + PEOPLE.length) % PEOPLE.length];
    select(n.id);
    list.querySelector(`[data-id="${n.id}"]`).focus();
  });
  select('venti');

  // backdrop stars, drawn once
  const canvas = root.querySelector('.people__stars');
  const paint = () => {
    const w = root.clientWidth, h = root.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    const c = canvas.getContext('2d');
    c.scale(dpr, dpr);
    let s = 9;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < (w * h) / 5200; i++) {
      const x = rnd() * w, y = rnd() * h, r = rnd() ** 3 * 1.5 + 0.25;
      c.fillStyle = `rgba(${200 + rnd() * 55},${225 + rnd() * 30},255,${0.2 + rnd() * 0.6})`;
      c.beginPath(); c.arc(x, y, r, 0, 6.3); c.fill();
    }
  };
  paint();
  let to; addEventListener('resize', () => { clearTimeout(to); to = setTimeout(paint, 200); });
}
