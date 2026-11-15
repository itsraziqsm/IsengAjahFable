import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/500.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/eb-garamond/400.css';
import '@fontsource/eb-garamond/400-italic.css';
import './styles/base.css';
import './styles/hero.css';
import './styles/chrome.css';
import './styles/paper.css';
import './styles/dark.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initHero } from './scene/hero.js';
import { initAtlas } from './sections/atlas.js';
import { initWinds } from './sections/winds.js';
import { initPeople } from './sections/people.js';
import { initLyre } from './sections/lyre.js';
import { setWind } from './audio.js';
import { TRACKS, playMusic, pauseMusic, nextMusic, onMusic } from './music.js';
import { FESTIVALS } from './data.js';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ---------- build
const heroEl = $('.hero');
const hero = initHero(heroEl);
window.__hero = hero;
$('.dial__ticks').innerHTML = Array.from({ length: 24 }, (_, i) => `<path transform="rotate(${i * 15})" d="M0-52v${i % 6 === 0 ? 5 : 2.5}"/>`).join('');
initAtlas($('.atlas'));
initWinds($('.winds'));
initPeople($('.people'));
initLyre($('.lyre'));

$('.feasts__list').innerHTML = FESTIVALS.map((f, i) => `
  <li class="feast" data-reveal>
    <p class="feast__season"><span class="caps">${f.season}</span><b>${['i', 'ii', 'iii'][i]}</b></p>
    <div class="feast__main"><h3>${f.name}</h3><p class="feast__span">${f.span}</p></div>
    <p class="feast__text">${f.text}</p>
  </li>`).join('');

// skyline for the footer
{
  let s = 5;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const hills = (base, amp, step) => {
    let d = `M0 220L0 ${base}`;
    for (let x = 0; x <= 1600; x += step) d += `L${x} ${(base - amp * (0.5 + 0.5 * Math.sin(x * 0.004 + base)) - r() * amp * 0.25).toFixed(1)}`;
    return d + 'L1600 220Z';
  };
  let town = 'M0 220';
  for (let x = 0; x < 1600;) {
    const w = 14 + r() * 22, h = 150 - 42 * Math.exp(-(((x - 800) / 420) ** 2)) - r() * 22;
    if (r() > 0.86) { town += `L${x} ${h - 4}L${x + 5} ${h - 46}L${x + 10} ${h - 4}`; x += 10; continue; }
    town += `L${x} ${h}L${x + w / 2} ${h - 9 - r() * 8}L${x + w} ${h}`;
    x += w;
  }
  town += 'L1600 220Z';
  $('.outro__ridge').innerHTML = `<path class="r1" d="${hills(120, 70, 40)}"/><path class="r2" d="${town}"/>`;
}

// split display headings into rising words
$$('[data-split]').forEach((h) => {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w.trim()) { frag.append(w); return; }
          const o = document.createElement('span'); o.className = 'word';
          const i = document.createElement('span'); i.textContent = w;
          o.append(i); frag.append(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeName !== 'BR') walk(n);
    });
  };
  walk(h);
});

// chapter rail
const sections = $$('[data-section]');
const NUM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI'];
const rail = $('.rail ol');
rail.innerHTML = sections.map((s, i) => `<li><a href="#${s.id}"><span>${NUM[i] ? NUM[i] + ' · ' : ''}${s.dataset.section}</span><i></i></a></li>`).join('');
const railLinks = $$('a', rail);

// ---------- smooth scroll
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = $(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView();
});

// ---------- scroll choreography
function choreograph() {
  // hero drifts apart as you leave
  ScrollTrigger.create({
    trigger: heroEl, start: 'top top', end: 'bottom top',
    onUpdate: (st) => { hero.state.scroll = st.progress * innerHeight; },
  });
  gsap.to('.hero__title', { yPercent: -40, opacity: 0, ease: 'none', scrollTrigger: { trigger: heroEl, start: 'top top', end: '70% top', scrub: true } });
  gsap.to('.dial, .hero__hint, .hero__scroll', { opacity: 0, ease: 'none', scrollTrigger: { trigger: heroEl, start: '5% top', end: '30% top', scrub: true } });

  if (!reduced) {
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, { y: 34, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-split]').forEach((h) => {
      gsap.from($$('.word > span', h), { yPercent: 110, duration: 1.15, ease: 'power4.out', stagger: 0.07, scrollTrigger: { trigger: h, start: 'top 86%' } });
    });
    gsap.to('.mill__blades', { rotation: 300, svgOrigin: '0 0', ease: 'none', scrollTrigger: { trigger: '.prologue', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    gsap.from('.atlas__map .pin', { opacity: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08, scrollTrigger: { trigger: '.atlas__map', start: 'top 60%' } });
  }

  // the four winds: vertical scroll becomes a walk east → west
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const track = $('.winds__track');
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.winds', pin: true, scrub: reduced ? true : 0.6, start: 'top top', end: () => '+=' + dist(), invalidateOnRefresh: true,
        snap: reduced ? false : { snapTo: (v) => { const stops = [0, ...$$('.wind').map((p) => p.offsetLeft / dist())]; return stops.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a)); }, duration: { min: 0.3, max: 0.9 }, delay: 0.25, ease: 'power2.inOut' },
        onUpdate: (st) => { $('.winds__progress i').style.transform = `scaleX(${st.progress})`; },
      },
    });
    $$('.wind').forEach((p) => {
      gsap.fromTo($('.wind__ring', p), { rotation: -50, svgOrigin: '0 0' }, { rotation: 50, svgOrigin: '0 0', ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.fromTo($('.wind__letter', p), { xPercent: 22 }, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.from($$('.wind__copy > *', p), { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 62%' } });
    });
  });

  // chrome follows the paper / night rhythm of the page
  const header = $('.chrome');
  const railEl = $('.rail');
  sections.forEach((s, i) => {
    const paper = s.classList.contains('paper');
    ScrollTrigger.create({ trigger: s, start: 'top 44px', end: 'bottom 44px', onToggle: (st) => st.isActive && header.classList.toggle('on-paper', paper) });
    ScrollTrigger.create({
      trigger: s, start: 'top center', end: 'bottom center',
      onToggle: (st) => {
        if (!st.isActive) return;
        railEl.classList.toggle('on-paper', paper);
        railLinks.forEach((a, k) => a.classList.toggle('is-active', k === i));
      },
    });
  });
  ScrollTrigger.create({ trigger: '.outro', start: 'top center', onToggle: (st) => railEl.classList.toggle('is-hidden', st.isActive) });
}

// ---------- sound: shuffled soundtrack over a bed of wind
const soundBtn = $('.chrome__sound');
const soundLabel = $('.chrome__soundlabel');
const nextBtn = $('.chrome__next');
const hasMusic = TRACKS.length > 0;
let soundOn = false;
const setSound = (on) => {
  soundOn = on;
  soundBtn.setAttribute('aria-pressed', on);
  soundBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music');
  setWind(on, hasMusic ? 0.22 : 0.75);
  if (hasMusic) on ? playMusic() : pauseMusic();
  else soundLabel.textContent = on ? 'Wind on' : 'Wind off';
};
if (hasMusic) {
  nextBtn.hidden = TRACKS.length < 2;
  onMusic(({ playing, title }) => {
    soundLabel.textContent = playing && title ? title : 'Sound off';
    soundLabel.classList.toggle('is-title', playing && !!title);
    if (!playing && soundOn) setSound(false); // autoplay was refused
  });
  nextBtn.addEventListener('click', () => { if (!soundOn) setSound(true); else nextMusic(); });
  // browsers only allow audio after a gesture: begin on the first one
  const first = (e) => {
    removeEventListener('pointerdown', first, true); removeEventListener('keydown', first, true);
    if (!soundOn && !e.target.closest?.('.chrome__audio')) setSound(true);
  };
  addEventListener('pointerdown', first, true); addEventListener('keydown', first, true);
}
soundBtn.addEventListener('click', () => setSound(!soundOn));

// ---------- curtain up
const loader = $('.loader');
const begin = () => {
  choreograph();
  ScrollTrigger.refresh();
  document.documentElement.classList.add('is-ready');
  if (reduced) { loader.remove(); return; }
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.25, ease: 'power4.inOut' })
    .add(() => loader.remove())
    .from('.hero__layer.hero__fg', { yPercent: 12, duration: 2, ease: 'power3.out' }, 0.15)
    .from('.hero__layer.hero__city', { yPercent: 5, duration: 2.2 }, 0.15)
    .from('.hero h1 span', { yPercent: 60, opacity: 0, filter: 'blur(10px)', duration: 1.5, stagger: 0.07 }, 0.55)
    .from('.hero__over, .hero .rule', { opacity: 0, y: 14, duration: 1.2, stagger: 0.12 }, 1.2)
    .from('.dial, .hero__hint, .hero__scroll, .chrome, .rail', { opacity: 0, duration: 1.4, stagger: 0.08, clearProps: 'opacity' }, 1.6);
};
const minTime = new Promise((res) => setTimeout(res, reduced ? 0 : 1900));
Promise.all([document.fonts.ready, minTime]).then(begin);
