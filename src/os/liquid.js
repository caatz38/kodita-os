// ═══════════════════════════════════════════════════════════════════════
//  LIQUID GLASS ENGINE
//  1. Springs   — real spring physics, exported as CSS `linear()` easings
//                 and as JS samplers for "jelly" keyframes.
//  2. Lens maps — a displacement map (how the glass bends what's behind it)
//                 and a specular map (where light catches the rim), computed
//                 from a convex-squircle glass profile + Snell's law (n = 1.5).
//  3. useLiquidGlass — plugs the maps into `backdrop-filter` (Chromium only).
//  4. Wallpaper glass — a pre-blurred wallpaper that windows use as "fake"
//                 frosted glass, so dragging windows costs nothing.
// ═══════════════════════════════════════════════════════════════════════
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const NS = 'http://www.w3.org/2000/svg';

export const supportsRefraction = (() => {
  try {
    return !!navigator.userAgentData?.brands?.some((b) => /Chromium/i.test(b.brand));
  } catch {
    return false;
  }
})();

export const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// ───────────────────────────── 1. SPRINGS ─────────────────────────────

/** Simulate a damped spring from 0 → 1. Returns samples + settle time. */
export function simulateSpring({ stiffness = 300, damping = 22, mass = 1, velocity = 0 } = {}) {
  const dt = 1 / 240;
  let x = 0;
  let v = velocity;
  let t = 0;
  const samples = [0];
  while (t < 3) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
    t += dt;
    samples.push(x);
    if (t > 0.1 && Math.abs(x - 1) < 0.0008 && Math.abs(v) < 0.01) break;
  }
  samples[samples.length - 1] = 1;
  return { samples, duration: t * 1000 };
}

/** Value of a simulated spring at progress p (0..1 of its duration). */
export function sampleAt(sim, p) {
  const s = sim.samples;
  const f = Math.min(Math.max(p, 0), 1) * (s.length - 1);
  const i = Math.floor(f);
  return i >= s.length - 1 ? s[s.length - 1] : s[i] + (s[i + 1] - s[i]) * (f - i);
}

/** CSS `linear()` easing that reproduces the spring. */
export function springEasing(params) {
  const sim = simulateSpring(params);
  const n = 48;
  const pts = Array.from({ length: n + 1 }, (_, i) => +sampleAt(sim, i / n).toFixed(4));
  return { easing: `linear(${pts.join(', ')})`, duration: Math.round(sim.duration), sim };
}

// Named springs used across the OS (tuned to feel like iOS 26).
export const SPRINGS = {
  bouncy: { stiffness: 380, damping: 15 },   // jelly presses, toggles
  pop: { stiffness: 260, damping: 17 },      // menus/panels morphing open
  smooth: { stiffness: 220, damping: 26 },   // windows, maximize
  snappy: { stiffness: 520, damping: 34 },   // small UI motion
  wobbleX: { stiffness: 300, damping: 14 },  // jelly X axis
  wobbleY: { stiffness: 240, damping: 13 },  // jelly Y axis (slightly out of phase)
};

const linearSupported = typeof CSS !== 'undefined' && CSS.supports?.('transition-timing-function', 'linear(0, 1)');
export const EASE = {};
for (const [name, p] of Object.entries(SPRINGS)) {
  const e = springEasing(p);
  EASE[name] = linearSupported ? e : { ...e, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' };
}

/** Publish spring easings as CSS variables: --spring-bouncy, --spring-bouncy-dur, … */
export function installSpringVars() {
  const root = document.documentElement;
  for (const [name, e] of Object.entries(EASE)) {
    root.style.setProperty(`--spring-${name}`, e.easing);
    root.style.setProperty(`--spring-${name}-dur`, `${e.duration}ms`);
  }
}

/**
 * "Jelly" keyframes: morph from a rect to a rect where X and Y scale follow
 * two slightly different springs, so the glass wobbles like liquid.
 * from/to: { x, y, w, h } in screen px.  Returns WAAPI keyframes + duration.
 */
export function jellyKeyframes(from, to, { opacityFrom = 0 } = {}) {
  const sx = simulateSpring(SPRINGS.wobbleX);
  const sy = simulateSpring(SPRINGS.wobbleY);
  const duration = Math.max(sx.duration, sy.duration);
  const n = 40;
  const frames = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const px = sampleAt(sx, (t * duration) / sx.duration);
    const py = sampleAt(sy, (t * duration) / sy.duration);
    const w = from.w + (to.w - from.w) * px;
    const h = from.h + (to.h - from.h) * py;
    const cx = from.x + from.w / 2 + (to.x + to.w / 2 - (from.x + from.w / 2)) * px;
    const cy = from.y + from.h / 2 + (to.y + to.h / 2 - (from.y + from.h / 2)) * py;
    const scaleX = w / to.w;
    const scaleY = h / to.h;
    const tx = cx - (to.x + to.w / 2);
    const ty = cy - (to.y + to.h / 2);
    frames.push({
      offset: t,
      transform: `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`,
      opacity: Math.min(1, opacityFrom + (1 - opacityFrom) * Math.min(1, t * 4)),
      // (no transformOrigin here: animating it would force main-thread animation)
    });
  }
  return { frames, duration };
}

/** Tiny JS spring for things driven every frame (the taskbar droplet). */
export class Spring {
  constructor(value = 0, { stiffness = 420, damping = 30, mass = 1 } = {}) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.k = stiffness;
    this.c = damping;
    this.m = mass;
  }
  step(dt) {
    const a = (-this.k * (this.value - this.target) - this.c * this.velocity) / this.m;
    this.velocity += a * dt;
    this.value += this.velocity * dt;
  }
  get settled() {
    return Math.abs(this.value - this.target) < 0.01 && Math.abs(this.velocity) < 0.05;
  }
}

export const isLiquid = () => document.documentElement.dataset.material === 'liquid';

// While anything animates, glass switches to cheap frosting (class "lg-busy" on <html>);
// the refraction comes back as soon as everything has settled.
let busyCount = 0;
export function trackBusy(anim) {
  if (!anim) return anim;
  busyCount++;
  document.documentElement.classList.add('lg-busy');
  let done = false;
  const end = () => {
    if (done) return;
    done = true;
    busyCount = Math.max(0, busyCount - 1);
    if (!busyCount) document.documentElement.classList.remove('lg-busy');
  };
  anim.finished.then(end, end);
  return anim;
}

const rectOf = (r) => ({ x: r.left, y: r.top, w: r.width, h: r.height });

/**
 * Morph an element in with jelly springs, starting from another rect
 * (e.g. the button that opened it). Returns `settled` = animation finished,
 * which is when the expensive refraction is switched on.
 *   getFrom(toDOMRect) → {x,y,w,h} | null
 */
export function useMorphIn(ref, getFrom, { active = true, opacityFrom = 0 } = {}) {
  const [settled, setSettled] = useState(false);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !active) {
      setSettled(false);
      return;
    }
    if (!isLiquid() || prefersReducedMotion()) {
      setSettled(true);
      return;
    }
    setSettled(false);
    node.getAnimations().forEach((a) => a.cancel()); // e.g. a closing animation still holding its end state
    const to = node.getBoundingClientRect();
    const from = getFrom(to);
    if (!from || !to.width) {
      setSettled(true);
      return;
    }
    const { frames, duration } = jellyKeyframes(from, rectOf(to), { opacityFrom });
    const anim = trackBusy(node.animate(frames, { duration }));
    anim.onfinish = () => setSettled(true);
    return () => anim.cancel();
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
  return settled;
}

/** Shrink an element back into a rect (closing). */
export function morphOut(node, toRect, duration = 220) {
  if (!node || !isLiquid() || prefersReducedMotion()) return null;
  const r = node.getBoundingClientRect();
  if (!r.width || !toRect) return null;
  const tx = toRect.x + toRect.w / 2 - (r.left + r.width / 2);
  const ty = toRect.y + toRect.h / 2 - (r.top + r.height / 2);
  return trackBusy(node.animate(
    [
      { transform: 'none', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(${toRect.w / r.width}, ${toRect.h / r.height})`, opacity: 0 },
    ],
    { duration, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' }
  ));
}

export const domRect = (selector) => {
  const n = typeof selector === 'string' ? document.querySelector(selector) : selector;
  return n ? rectOf(n.getBoundingClientRect()) : null;
};

// ───────────────────────────── 2. LENS MAPS ─────────────────────────────

const N_GLASS = 1.5;
// Convex squircle profile: height of the glass at x (0 = outer edge, 1 = end of bezel).
const profile = (x) => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

// Precompute refraction displacement (normalized 0..1) along the bezel.
const BEZEL_SAMPLES = 128;
const bezelCurve = (() => {
  const out = new Float32Array(BEZEL_SAMPLES);
  let max = 0;
  for (let i = 0; i < BEZEL_SAMPLES; i++) {
    const x = Math.min(Math.max(i / (BEZEL_SAMPLES - 1), 0.001), 0.999);
    const d = 0.001;
    const slope = (profile(Math.min(x + d, 1)) - profile(Math.max(x - d, 0))) / (2 * d);
    const th1 = Math.atan(slope); // incidence angle vs surface normal (rays straight down)
    const th2 = Math.asin(Math.sin(th1) / N_GLASS); // Snell's law
    const disp = Math.tan(th1 - th2) * profile(x); // lateral shift through the glass thickness
    out[i] = disp;
    if (disp > max) max = disp;
  }
  for (let i = 0; i < BEZEL_SAMPLES; i++) out[i] /= max || 1;
  return out;
})();

// Signed-distance info for a rounded rectangle: distance inside + outward normal.
function sdRoundRect(px, py, hw, hh, r) {
  const qx = Math.abs(px) - (hw - r);
  const qy = Math.abs(py) - (hh - r);
  const dist = -(Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r);
  let nx = 0;
  let ny = 0;
  if (qx > 0 && qy > 0) {
    const l = Math.hypot(qx, qy) || 1;
    nx = (qx / l) * Math.sign(px);
    ny = (qy / l) * Math.sign(py);
  } else if (qx > qy) nx = Math.sign(px);
  else ny = Math.sign(py);
  return { dist, nx, ny };
}

const mapCache = new Map();
/** Displacement + specular maps for a w×h glass with corner radius r and bezel width b. */
export function lensMaps(w, h, r, bezel) {
  const key = `${w}x${h}r${r}b${bezel}`;
  if (mapCache.has(key)) return mapCache.get(key);
  const radius = Math.min(r, w / 2, h / 2);
  const b = Math.min(bezel, radius, w / 2, h / 2);
  const disp = new ImageData(w, h);
  const spec = new ImageData(w, h);
  const D = disp.data;
  const S = spec.data;
  const hw = w / 2;
  const hh = h / 2;
  // Light comes from the top-left (-60°) like Apple's default.
  const lx = Math.cos((-120 * Math.PI) / 180);
  const ly = Math.sin((-120 * Math.PI) / 180);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const { dist, nx, ny } = sdRoundRect(x + 0.5 - hw, y + 0.5 - hh, hw, hh, radius);
      const i = (y * w + x) * 4;
      const u = dist / b; // 0 at rim → 1 at end of bezel
      let m = 0;
      if (u >= 0 && u < 1) m = bezelCurve[Math.min(BEZEL_SAMPLES - 1, Math.floor(u * (BEZEL_SAMPLES - 1)))];
      // sample from further inside → content bends/magnifies at the edges
      D[i] = 128 - nx * m * 127;
      D[i + 1] = 128 - ny * m * 127;
      D[i + 2] = 128;
      D[i + 3] = 255;
      // specular: bright where the rim faces the light (and a softer bounce opposite)
      if (u >= 0 && u < 0.6) {
        const facing = nx * lx + ny * ly;
        const rim = Math.pow(1 - u / 0.6, 2.4);
        const a = (Math.max(0, facing) ** 1.6 * 0.95 + Math.max(0, -facing) ** 2 * 0.4) * rim;
        S[i] = S[i + 1] = S[i + 2] = 255;
        S[i + 3] = Math.round(Math.min(1, a) * 255);
      }
    }
  }
  const toURL = (img) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d').putImageData(img, 0, 0);
    return c.toDataURL();
  };
  const maps = { displacement: toURL(disp), specular: toURL(spec) };
  if (mapCache.size > 40) mapCache.clear();
  mapCache.set(key, maps);
  return maps;
}

// ───────────────────────────── 3. useLiquidGlass ─────────────────────────────

let defs = null;
function getDefs() {
  if (defs) return defs;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  Object.assign(svg.style, { position: 'absolute', width: '0', height: '0', overflow: 'hidden', pointerEvents: 'none' });
  defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
}
const el = (name, attrs) => {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};

let counter = 0;

/**
 * Liquid Glass on an element.
 *  enabled  – glass at all (frosted blur + specular rim)
 *  refract  – bend the backdrop (only while the element is NOT animating — that's the expensive part)
 *  aberration – split R/G/B slightly at the edges (only on small, static glass)
 */
export function useLiquidGlass(ref, { enabled = true, refract = true, radius = 24, bezel = 20, scale = 60, blur = 8, saturate = 180, aberration = false } = {}) {
  const plain = `blur(${blur}px) saturate(${saturate}%)`;
  const filterId = useRef(null);
  const [ready, setReady] = useState(false);

  // Build the filter + lens maps once per size (not on every open — decoding maps is costly).
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    node.style.backdropFilter = plain;

    let filter = null;
    let images = [];
    if (supportsRefraction) {
      const id = `lg-${++counter}`;
      filter = el('filter', { id, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB', x: 0, y: 0 });
      const img = el('feImage', { x: 0, y: 0, preserveAspectRatio: 'none', result: 'map' });
      images = [img];
      filter.appendChild(img);
      if (aberration) {
        const chan = (s, matrix, result) => {
          filter.appendChild(el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale: s, xChannelSelector: 'R', yChannelSelector: 'G', result: `${result}d` }));
          filter.appendChild(el('feColorMatrix', { in: `${result}d`, type: 'matrix', values: matrix, result }));
        };
        chan(scale, '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', 'r');
        chan(scale * 0.93, '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', 'g');
        chan(scale * 0.86, '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0', 'b');
        filter.appendChild(el('feBlend', { in: 'r', in2: 'g', mode: 'screen', result: 'rg' }));
        filter.appendChild(el('feBlend', { in: 'rg', in2: 'b', mode: 'screen' }));
      } else {
        filter.appendChild(el('feDisplacementMap', { in: 'SourceGraphic', in2: 'map', scale, xChannelSelector: 'R', yChannelSelector: 'G' }));
      }
      getDefs().appendChild(filter);
      filterId.current = id;
    }

    let lastKey = '';
    const apply = () => {
      const w = Math.round(node.offsetWidth);
      const h = Math.round(node.offsetHeight);
      if (!w || !h) return;
      const key = `${w}x${h}`;
      if (key === lastKey) return;
      lastKey = key;
      const maps = lensMaps(w, h, radius, bezel);
      node.style.setProperty('--lg-specular', `url(${maps.specular})`);
      if (filter) {
        for (const n of [filter, ...images]) {
          n.setAttribute('width', String(w));
          n.setAttribute('height', String(h));
        }
        images.forEach((n) => n.setAttribute('href', maps.displacement));
        setReady(true);
      }
    };
    apply();

    let t = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(apply, 80);
    });
    ro.observe(node);
    return () => {
      ro.disconnect();
      clearTimeout(t);
      filter?.remove();
      filterId.current = null;
      setReady(false);
      node.style.backdropFilter = '';
    };
  }, [ref, enabled, radius, bezel, scale, aberration]); // eslint-disable-line react-hooks/exhaustive-deps

  // Turning refraction on/off is just a style switch.
  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    node.style.backdropFilter = refract && ready && filterId.current ? `url(#${filterId.current}) ${plain}` : plain;
  }, [ref, enabled, refract, ready, plain]);
}

// ───────────────────────────── 4. WALLPAPER GLASS ─────────────────────────────

/** Pre-blur the wallpaper once; windows use it as frosted glass (no live blur needed). */
export function useWallpaperGlass(src, enabled) {
  const [url, setUrl] = useState(null);
  const [vp, setVp] = useState(() => `${window.innerWidth}x${window.innerHeight}`);

  useEffect(() => {
    let t = 0;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setVp(`${window.innerWidth}x${window.innerHeight}`), 300);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!enabled || !src) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      // Same "cover" crop as the desktop wallpaper, at low resolution (it's blurred anyway).
      const [vw, vh] = vp.split('x').map(Number);
      const w = 480;
      const h = Math.round((vh / vw) * w);
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d');
      ctx.filter = 'blur(7px) saturate(1.7) brightness(1.04)';
      ctx.drawImage(img, (w - dw) / 2 - 16, (h - dh) / 2 - 16, dw + 32, dh + 32);
      setUrl(c.toDataURL('image/jpeg', 0.85));
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, enabled, vp]);

  useEffect(() => {
    const root = document.documentElement;
    if (url && enabled) root.style.setProperty('--wall-glass', `url(${url})`);
    else root.style.removeProperty('--wall-glass');
  }, [url, enabled]);
}
