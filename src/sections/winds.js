import { WINDS } from '../data.js';

const f = (n) => Math.round(n * 10) / 10;
const ring = `<circle r="92"/><circle r="86" class="faint"/>${Array.from({ length: 48 }, (_, i) => `<path transform="rotate(${i * 7.5})" d="M0-86v${i % 4 === 0 ? 7 : 3.5}" class="${i % 4 === 0 ? '' : 'faint'}"/>`).join('')}`;

const EMBLEMS = {
  // six wings of a wind dragon
  east() {
    let s = '';
    for (const side of [1, -1]) {
      for (let i = 0; i < 3; i++) {
        const a = -52 + i * 34;
        const len = 70 - i * 9;
        s += `<g transform="scale(${side} 1) rotate(${a})"><path d="M6 0C${f(len * 0.3)} -20 ${f(len * 0.7)} -16 ${len} -34C${f(len * 0.84)} -6 ${f(len * 0.5)} 6 6 0Z"/><path class="faint" d="M10 -1C${f(len * 0.4)} -10 ${f(len * 0.7)} -12 ${f(len * 0.94)} -28"/></g>`;
      }
    }
    return s + '<path d="M0-16L7 0L0 44L-7 0Z"/><circle r="2.4" class="fill"/>';
  },
  // frost crystal with wolf fangs
  north() {
    let s = '';
    for (let i = 0; i < 6; i++) {
      s += `<g transform="rotate(${i * 60})"><path d="M0-10V-70M0-34l-12-12M0-34l12-12M0-52l-8-8M0-52l8-8"/><path class="faint" d="M0-70l-4 7l4 5l4-5z"/></g>`;
    }
    for (let i = 0; i < 6; i++) s += `<path transform="rotate(${i * 60 + 30})" d="M-7-14L0-40L7-14Z"/>`;
    return s + '<circle r="10"/><circle r="2.4" class="fill"/>';
  },
  // dandelion clock
  south() {
    let s = '';
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      const len = i % 2 ? 62 : 72;
      const x = Math.sin(a) * len, y = -Math.cos(a) * len;
      s += `<path class="${i % 2 ? 'faint' : ''}" d="M${f(Math.sin(a) * 12)} ${f(-Math.cos(a) * 12)}L${f(x)} ${f(y)}"/><circle cx="${f(x)}" cy="${f(y)}" r="${i % 2 ? 1.4 : 2.2}" class="${i % 2 ? '' : 'fill'}"/>`;
    }
    for (let i = 0; i < 8; i++) s += `<path transform="rotate(${i * 45})" d="M0-12C5-22 5-28 0-36C-5-28-5-22 0-12Z"/>`;
    return s + '<circle r="6"/>';
  },
  // falcon wings rising
  west() {
    let s = '';
    for (const side of [1, -1]) {
      for (let i = 0; i < 6; i++) {
        const y = 32 - i * 13;
        const span = 22 + i * 7.4;
        s += `<path transform="scale(${side} 1)" class="${i % 2 ? 'faint' : ''}" d="M4 ${y}C${f(span * 0.5)} ${y - 4} ${f(span * 0.9)} ${y - 16} ${f(span)} ${y - 28}C${f(span * 0.78)} ${y - 20} ${f(span * 0.45)} ${y - 14} 4 ${y - 9}"/>`;
      }
    }
    return s + '<path d="M0-62L6-48L0 48L-6-48Z"/><path class="fill" d="M0-72l3.5 6l-3.5 6l-3.5-6z"/>';
  },
};
const POINTER = { east: 90, north: 0, south: 180, west: 270 };

export function initWinds(root) {
  const track = root.querySelector('.winds__track');
  track.insertAdjacentHTML('beforeend', WINDS.map((w, i) => `
    <article class="winds__panel wind" data-wind="${w.id}">
      <span class="wind__letter" aria-hidden="true">${w.letter}</span>
      <figure class="wind__emblem"><svg viewBox="-110 -110 220 220" aria-hidden="true">
        <g class="wind__ring">${ring}</g>
        <path class="fill" transform="rotate(${POINTER[w.id]})" d="M0-104l5 9h-10z"/>
        <g class="wind__glyph">${EMBLEMS[w.id]().replaceAll('3.5', '3.5')}</g>
      </svg></figure>
      <div class="wind__copy">
        <p class="caps wind__dir"><b>0${i + 1}</b> Wind of the ${w.dir}</p>
        <h3>${w.name}</h3>
        <p class="wind__title">${w.title}</p>
        <p class="wind__text">${w.text}</p>
        <p class="wind__seat"><span class="caps">Seat</span>${w.seat}</p>
      </div>
    </article>`).join(''));
}
