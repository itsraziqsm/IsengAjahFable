// Painted sky, far ranges and Cider Lake — a single fragment shader working in
// "scene units" (1600 x 900, y down, horizon at 540) so it lines up with the SVG city.

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec3 uFit;            // scale, offsetX, offsetY (css px, top-left origin)
uniform float uTime, uStars, uDpr;
uniform vec2 uPar, uSun, uMoon;
uniform vec3 uSkyTop, uSkyMid, uHorizon, uCloudLit, uCloudShade, uMtnFar, uMtnNear, uWater, uSunCol, uHaze;

const float HORIZON = 540.;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.03 + vec2(17.1, 9.2); a *= .5; }
  return v;
}
float fbm3(vec2 p){
  float v = 0., a = .5;
  for(int i=0;i<3;i++){ v += a*noise(p); p = p*2.1 + vec2(3.1, 7.7); a *= .5; }
  return v;
}

float ridgeFar(float x){
  float n = fbm(vec2(x*.0026 + 3., 1.3));
  float w = x < 1240. ? 330. : 260.;
  float peak = 232.*pow(max(0., 1. - abs(x-1240.)/w), 1.22) + 54.*pow(max(0., 1. - abs(x-1010.)/150.), 1.5);
  float crag = (noise(vec2(x*.03, 4.)) - .5)*20. + (noise(vec2(x*.11, 9.)) - .5)*7.;
  return HORIZON - 30. - n*110. - peak + crag*smoothstep(0., 90., peak + n*50.);
}
float ridgeMid(float x){
  float n = fbm(vec2(x*.0041 + 11., 6.1));
  return HORIZON - 12. - n*92.;
}
float ridgeNear(float x){
  float n = fbm3(vec2(x*.0058 + 40., 2.7));
  float gap = smoothstep(430., 620., x)*(1. - smoothstep(1010., 1220., x));
  return HORIZON - 4. - n*58.*(1. - gap*.82);
}

vec3 above(vec2 p){
  float t = clamp((HORIZON - p.y)/720., 0., 1.);
  vec3 c = mix(uHorizon, uSkyMid, smoothstep(0., .40, t));
  c = mix(c, uSkyTop, smoothstep(.26, 1., t));

  // stars
  vec2 g = p/5.5; vec2 id = floor(g);
  float h = hash(id);
  vec2 sp = fract(g) - .5 - (vec2(hash(id+3.1), hash(id+7.7)) - .5)*.7;
  float tw = .55 + .45*sin(uTime*(1. + h*3.) + h*40.);
  float st = smoothstep(.16*step(.965, h) + .05, 0., length(sp))*step(.90, h)*tw;
  c += st*uStars*smoothstep(0., .3, t)*vec3(.9, .96, 1.);

  // sun
  float ds = length(p - uSun);
  c += uSunCol*(exp(-ds/300.)*.30 + exp(-ds/85.)*.45);
  c = mix(c, vec3(1., .985, .92), smoothstep(36., 33., ds));

  // moon
  float dm = length(p - uMoon);
  float moonUp = smoothstep(HORIZON + 60., HORIZON - 40., uMoon.y);
  c += vec3(.55, .75, .95)*(exp(-dm/190.)*.22 + exp(-dm/52.)*.3)*moonUp;
  float mare = fbm3((p - uMoon)*.055 + 20.);
  vec3 moonCol = mix(vec3(.80, .86, .92), vec3(.97, .98, 1.), smoothstep(.35, .62, mare));
  c = mix(c, moonCol, smoothstep(30., 28.2, dm)*moonUp);

  // clouds — two drifting decks, lit from whichever light is up
  vec2 light = mix(uMoon, uSun, step(uSun.y, HORIZON + 80.));
  vec2 ld = normalize(light - p + .001);
  for(int i=0;i<2;i++){
    float s = i==0 ? 1. : .55;
    vec2 q = vec2((p.x + uPar.x*14.*s)/(760.*s), p.y/(205.*s)) + vec2(uTime*.0075*s + float(i)*5.3, float(i)*2.1);
    float w = fbm3(q*1.7 + uTime*.004);
    float d = fbm(q + w*.55);
    float band = smoothstep(HORIZON + 10., HORIZON - 150., p.y)*(i==0 ? smoothstep(-60., 200., p.y)*.5 + .5 : 1.);
    float cover = smoothstep(.50, .74, d)*band*(i==0 ? .95 : .7)*(1. - exp(-ds/70.)*.9);
    float lit = fbm(q + w*.55 + ld*vec2(.07, .16));
    float sh = clamp((d - lit)*5.5 + .52, 0., 1.);
    vec3 cc = mix(uCloudShade, uCloudLit, sh);
    cc += uSunCol*exp(-ds/360.)*.35*sh;
    c = mix(c, cc, cover);
  }

  // ranges
  float px = p.x + uPar.x*6.;
  float rf = ridgeFar(px);
  if(p.y > rf){
    float k = (p.y - rf)/(HORIZON - rf + 1.);
    vec3 m = mix(uMtnFar, uHaze, .30 + k*.5);
    float rib = noise(vec2((px + (p.y - rf)*.85)*.021, 3.)) + (noise(vec2((px - (p.y - rf)*.5)*.05, 8.)) - .5)*.35;
    float snow = smoothstep(446. + (rib - .5)*70., 400. + (rib - .5)*40., p.y);
    float lit = step(.5, rib);
    m = mix(m, mix(m, vec3(1.), .34 + .3*lit), snow);
    m = mix(m, m*.84, (1. - lit)*(1. - k)*.55*(1. - snow));
    c = mix(c, m, .94);
  }
  px = p.x + uPar.x*10.;
  float rm = ridgeMid(px);
  if(p.y > rm){
    float k = (p.y - rm)/(HORIZON - rm + 1.);
    vec3 m = mix(mix(uMtnFar, uMtnNear, .55), uHaze, k*.55);
    c = mix(m, m*.9, step(.52, noise(vec2(px*.02 + p.y*.02, p.y*.02)))*(1. - k)*.5);
  }
  px = p.x + uPar.x*16.;
  float rn = ridgeNear(px);
  if(p.y > rn){
    float k = (p.y - rn)/(HORIZON - rn + 1.);
    float trees = noise(vec2(px*.09, 2.))*5.*(1. - k);
    vec3 m = mix(uMtnNear, uHaze, k*.38);
    c = (p.y > rn + trees) ? m : mix(c, m, .0);
  }
  return c;
}

void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y)/uDpr;
  vec2 p = (px - uFit.yz)/uFit.x;
  vec3 col;
  if(p.y <= HORIZON){
    col = above(p);
  } else {
    float d = p.y - HORIZON;
    float k = clamp(d/360., 0., 1.);
    float rip = (noise(vec2(p.x*.012, d*.16 - uTime*.5)) - .5)*(8. + d*.22)
              + sin(d*.55 + uTime*1.1 + p.x*.02)*(1. + k*3.);
    vec2 rp = vec2(p.x + rip, HORIZON - d*(.92 + k*.5));
    vec3 refl = above(rp);
    col = mix(refl, uWater, .34 + k*.38);
    // brushed bands of calmer water
    float band = smoothstep(.56, .72, noise(vec2(p.x*.0035 + uTime*.01, d*.085)));
    col = mix(col, mix(uWater, uHorizon, .5), band*.16*(1. - k*.5));
    // glitter path beneath the light
    vec2 light = mix(uMoon, uSun, step(uSun.y, HORIZON + 80.));
    float lane = exp(-pow((p.x - light.x)/(34. + d*.75), 2.));
    float spark = smoothstep(.62, .9, noise(vec2(p.x*.11, d*.42 - uTime*1.6)));
    float up = smoothstep(HORIZON + 160., HORIZON - 60., light.y);
    col += uSunCol*lane*(spark*.85 + .12)*up*(1. - k*.45);
    col = mix(col, uHaze, smoothstep(26., 0., d)*.35);
  }
  // vignette + dither
  vec2 v = gl_FragCoord.xy/uRes - .5;
  col *= 1. - dot(v, v)*.38;
  col += (hash(gl_FragCoord.xy + fract(uTime)) - .5)/180.;
  gl_FragColor = vec4(col, 1.);
}`;

const UNIFORMS = ['uRes', 'uFit', 'uTime', 'uStars', 'uDpr', 'uPar', 'uSun', 'uMoon', 'uSkyTop', 'uSkyMid', 'uHorizon', 'uCloudLit', 'uCloudShade', 'uMtnFar', 'uMtnNear', 'uWater', 'uSunCol', 'uHaze'];

export function createSky(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(UNIFORMS.map((n) => [n, gl.getUniformLocation(prog, n)]));

  let dpr = 1, w = 0, h = 0;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  return {
    resize,
    render(pal, time, par, fit) {
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform3f(u.uFit, fit.scale, fit.x, fit.y);
      gl.uniform1f(u.uTime, time);
      gl.uniform1f(u.uDpr, dpr);
      gl.uniform1f(u.uStars, pal.stars);
      gl.uniform2f(u.uPar, par.x, par.y);
      gl.uniform2f(u.uSun, pal.sun[0], pal.sun[1]);
      gl.uniform2f(u.uMoon, pal.moon[0], pal.moon[1]);
      gl.uniform3fv(u.uSkyTop, pal.skyTop);
      gl.uniform3fv(u.uSkyMid, pal.skyMid);
      gl.uniform3fv(u.uHorizon, pal.horizon);
      gl.uniform3fv(u.uCloudLit, pal.cloudLit);
      gl.uniform3fv(u.uCloudShade, pal.cloudShade);
      gl.uniform3fv(u.uMtnFar, pal.mtnFar);
      gl.uniform3fv(u.uMtnNear, pal.mtnNear);
      gl.uniform3fv(u.uWater, pal.water);
      gl.uniform3fv(u.uSunCol, pal.sunCol);
      gl.uniform3fv(u.uHaze, pal.haze);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
