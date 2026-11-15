// All sound is synthesised on the fly: a plucked-string voice for the lyre and
// a breath of filtered noise for the wind.
let ctx, master, echo;

export function audio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0.8;
  const comp = ctx.createDynamicsCompressor();
  master.connect(comp).connect(ctx.destination);
  // a little stone-hall echo
  echo = ctx.createDelay(1); echo.delayTime.value = 0.27;
  const fb = ctx.createGain(); fb.gain.value = 0.34;
  const damp = ctx.createBiquadFilter(); damp.type = 'lowpass'; damp.frequency.value = 2100;
  const wet = ctx.createGain(); wet.gain.value = 0.3;
  echo.connect(damp).connect(fb).connect(echo);
  damp.connect(wet).connect(master);
  return ctx;
}

export function pluck(freq, when = 0) {
  const c = audio();
  const t = c.currentTime + when;
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.34, t + 0.006);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
  const tone = c.createBiquadFilter(); tone.type = 'lowpass';
  tone.frequency.setValueAtTime(Math.min(9000, freq * 9), t);
  tone.frequency.exponentialRampToValueAtTime(Math.max(500, freq * 2), t + 0.9);
  [[1, 'triangle', 1], [2, 'sine', 0.32], [3, 'sine', 0.12], [4.01, 'sine', 0.05]].forEach(([mult, type, g]) => {
    const o = c.createOscillator(); o.type = type; o.frequency.value = freq * mult;
    o.detune.value = (Math.random() - 0.5) * 5;
    const og = c.createGain(); og.gain.value = g;
    o.connect(og).connect(tone); o.start(t); o.stop(t + 2.5);
  });
  tone.connect(out); out.connect(master); out.connect(echo);
}

let wind = null;
export function setWind(on) {
  const c = audio();
  if (on && !wind) {
    const len = c.sampleRate * 4;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = last * 0.985 + (Math.random() * 2 - 1) * 0.12; d[i] = last; }
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 0.6;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.09;
    const depth = c.createGain(); depth.gain.value = 260;
    lfo.connect(depth).connect(bp.frequency);
    const g = c.createGain(); g.gain.value = 0;
    const swell = c.createOscillator(); swell.frequency.value = 0.05;
    const sd = c.createGain(); sd.gain.value = 0.25;
    src.connect(bp).connect(g).connect(master);
    swell.connect(sd).connect(g.gain);
    src.start(); lfo.start(); swell.start();
    wind = g;
  }
  if (wind) wind.gain.linearRampToValueAtTime(on ? 0.75 : 0, c.currentTime + 1.2);
}
