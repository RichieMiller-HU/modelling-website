// Develop · the lookbook's one effect, in two moves.
//
// Adapted from "01 · Shadow-first" in Codrops' Lookbook Hover Effects
// (MIT, ../LICENSE-template.txt). A card's colour sweeps over a photograph,
// but the photograph's own tones draw the sweep's edge: the parts nearest
// the card's colour are reached first. An ink card floods a white-studio
// frame through the black shirt and hair before the backdrop; a bone card
// floods a black-studio frame through the lit skin before the dark.
//
// 1. reveal(): each frame starts under its card and, once it scrolls into
//    view, develops out of it like a print in the tray: the tones furthest
//    from the card come up first, so for a moment the figure stands as a
//    silhouette in the card's colour.
// 2. hover / focus / tap: the card comes back in from the side the pointer
//    entered by, and leaves by the far side or the near one, as in the
//    original. On touch, a tap brings the card in; a second tap opens the
//    frame large.
//
// Differences from the original: one WebGL context per look only while it
// moves (created on demand and released at rest, so 14 looks never exceed
// the browser's context limit), the tone reading flips for light cards,
// and the reveal.

import { paint } from './card.js';
import { fullscreen, program, texture, uniforms } from './gl.js';

export const motion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;

const CONFIG = {
  duration: 0.85, // seconds for the card to cross the look on hover
  ease: 'power1.out',
  reveal: 0.9, // seconds for a frame to develop out of its card
  revealEase: 'power2.inOut',
  pull: 0.4, // how far ahead of the sweep the near tones fill, as a share of the look
  light: 0.18, // the hairline of light along the edge, 0 to 1
  rest: 1600, // ms a look keeps its context after it comes to rest
};

const sweeps = {
  left: [1, 0, 0],
  right: [-1, 0, 1],
  top: [0, -1, 1],
  bottom: [0, 1, 0],
};

function locate(el, e) {
  const r = el.getBoundingClientRect();
  const x = gsap.utils.clamp(0, 1, (e.clientX - r.left) / r.width);
  const y = gsap.utils.clamp(0, 1, (e.clientY - r.top) / r.height);
  const gaps = { left: x, right: 1 - x, top: y, bottom: 1 - y };
  const side = Object.keys(gaps).reduce((a, b) => (gaps[b] < gaps[a] ? b : a));
  return { x, y, side };
}
const inward = ({ x, y }, side) => ({ left: x, right: 1 - x, top: y, bottom: 1 - y })[side];

const fragment = `#version 300 es
precision highp float;

uniform sampler2D uPhoto;
uniform sampler2D uCard;
uniform vec2 uResolution;
uniform vec3 uSweep;
uniform vec2 uTones;
uniform float uPull;
uniform float uFlip; // 1 for a light card: its colour reaches the highlights first
uniform float uLead;
uniform float uTrail;
uniform float uLight;
uniform vec3 uRim;

out vec4 color;

float tone(vec2 uv, float level) {
  float l = dot(textureLod(uPhoto, uv, level).rgb, vec3(0.2126, 0.7152, 0.0722));
  return clamp((l - uTones.x) / (uTones.y - uTones.x), 0.0, 1.0);
}

float rim(float t, float edge, float w, float side) {
  float px = side * (t - edge) / w;
  float band = smoothstep(-1.0, 0.0, px) * (1.0 - smoothstep(1.0, 2.5, px));
  float near = 1.0 - smoothstep(0.0, 0.02, abs(t - edge));
  return band * near;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float d = dot(uv, uSweep.xy) + uSweep.z;
  float k = mix(tone(uv, 2.0), tone(uv, 4.5), 0.5);
  k = mix(k, 1.0 - k, uFlip);
  float t = mix(d, k, uPull);
  float w = max(fwidth(t), 1e-5);
  float lead = mix(-0.01, 1.01, uLead);
  float trail = mix(-0.01, 1.01, uTrail);
  float covered = (1.0 - smoothstep(lead - 1.5 * w, lead, t)) * smoothstep(trail - 1.5 * w, trail, t);
  float light = max(rim(t, lead, w, 1.0), rim(t, trail, w, -1.0)) * uLight * (1.0 - covered);
  vec3 card = texture(uCard, uv).rgb;
  color = vec4(card * covered + uRim * light, covered + light);
}`;

// The photograph's darkest and lightest tones (2nd and 98th percentiles).
function range(img) {
  const c = document.createElement('canvas');
  c.width = 40;
  c.height = 60;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const { data } = ctx.getImageData(0, 0, c.width, c.height);
  const l = [];
  for (let i = 0; i < data.length; i += 4) {
    l.push((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255);
  }
  l.sort((a, b) => a - b);
  return [l[Math.floor(l.length * 0.02)], Math.max(l[Math.floor(l.length * 0.98)], l[Math.floor(l.length * 0.02)] + 0.05)];
}

function lightness(rgb) {
  const [r, g, b] = rgb.match(/[\d.]+/g).map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

let supported = null;
export function webgl() {
  if (supported === null) {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    supported = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }
  return supported;
}

// One look: its photograph, its card, and the canvas that draws between
// them while anything moves.
export class Plate {
  constructor(look, { interactive = true, onOpen } = {}) {
    this.look = look;
    this.img = look.querySelector('.look__img');
    this.card = look.querySelector('.look__card');
    this.interactive = interactive;
    this.onOpen = onOpen;
    this.edges = { lead: 0, trail: 0 };
    this.from = null;
    this.shown = false;
    this.ready = false; // revealed and taking hovers
    this.gl = null;
    this.timer = 0;
    this.paper = document.createElement('canvas');

    new ResizeObserver(() => this.gl && this.size()).observe(look);
    if (interactive) this.bind();
  }

  // Creates the canvas and its context when the look first needs to move.
  ensure() {
    if (this.gl) return true;
    if (!webgl() || !this.img.complete || !this.img.naturalWidth) return false;
    const canvas = document.createElement('canvas');
    canvas.className = 'look__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl2', { antialias: false });
    if (!gl) return false;
    try {
      const prog = program(gl, fullscreen, fragment);
      gl.useProgram(prog);
      this.u = uniforms(gl, prog);
      texture(gl, 0, this.img, { mipmaps: true });
      this.cardTex = gl.createTexture();
      gl.uniform1i(this.u.uPhoto, 0);
      gl.uniform1i(this.u.uCard, 1);
      this.tones ||= range(this.img);
      gl.uniform2f(this.u.uTones, ...this.tones);
      gl.uniform1f(this.u.uPull, CONFIG.pull);
      gl.uniform1f(this.u.uLight, CONFIG.light);
      const bg = getComputedStyle(this.card).backgroundColor;
      const light = lightness(bg) > 0.5;
      gl.uniform1f(this.u.uFlip, light ? 1 : 0);
      gl.uniform3f(this.u.uRim, ...(light ? [0.05, 0.05, 0.05] : [1, 0.97, 0.92]));
    } catch (error) {
      console.warn(error);
      supported = false;
      return false;
    }
    this.gl = gl;
    this.img.after(canvas);
    this.size();
    return true;
  }

  size() {
    const { gl, look } = this;
    const { width, height } = look.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = Math.min(devicePixelRatio, 2);
    gl.canvas.width = Math.round(width * dpr);
    gl.canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform2f(this.u.uResolution, gl.canvas.width, gl.canvas.height);
    paint(this.paper, this.card, look, gl.canvas.width / width);
    texture(gl, 1, this.paper, { tex: this.cardTex });
    this.render();
  }

  render() {
    if (!this.gl) return;
    const { gl, u, edges } = this;
    gl.uniform1f(u.uLead, edges.lead);
    gl.uniform1f(u.uTrail, edges.trail);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // Releases the context once the look has been still for a while.
  park() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!this.gl || this.shown || (this.edges.lead > 0 && this.edges.trail < 1)) return;
      this.gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.gl.canvas.remove();
      this.gl = null;
    }, CONFIG.rest);
  }

  // The frame develops out of its card. `veil` is the CSS card covering it
  // until now; it's lifted in the same frame the canvas takes over.
  reveal({ duration = CONFIG.reveal, delay = 0 } = {}) {
    const done = () => {
      this.ready = true;
      this.look.classList.add('is-developed');
    };
    if (!motion || !this.ensure()) {
      this.look.classList.remove('is-veiled');
      done();
      return;
    }
    gsap.killTweensOf(this.edges);
    this.edges.lead = 1;
    this.edges.trail = 0;
    this.gl.uniform3f(this.u.uSweep, ...sweeps.bottom);
    this.render();
    this.look.classList.remove('is-veiled');
    gsap.to(this.edges, {
      lead: 0,
      duration,
      delay,
      ease: CONFIG.revealEase,
      onUpdate: () => this.render(),
      onComplete: () => {
        this.edges.lead = this.edges.trail = 0;
        this.render();
        done();
        this.park();
      },
    });
  }

  move(edge, to) {
    gsap.to(this.edges, {
      [edge]: to,
      duration: CONFIG.duration * motion,
      ease: CONFIG.ease,
      overwrite: 'auto',
      onUpdate: () => this.render(),
      onComplete: () => this.rest(),
    });
  }

  rest() {
    const { edges } = this;
    if (edges.lead > 0 && edges.trail < 1) return;
    gsap.killTweensOf(edges);
    edges.lead = edges.trail = 0;
    this.from = null;
    this.render();
    this.park();
  }

  enter(side) {
    if (!this.ready) return;
    if (!this.ensure()) {
      this.look.classList.add('is-carded');
      this.shown = true;
      return;
    }
    clearTimeout(this.timer);
    this.shown = true;
    if (this.from) this.move('trail', 0);
    else {
      this.from = side;
      this.gl.uniform3f(this.u.uSweep, ...sweeps[side]);
    }
    this.move('lead', 1);
  }

  // `far`: whether the pointer left by the far half.
  leave(far) {
    this.shown = false;
    this.look.classList.remove('is-carded');
    if (!this.from || !this.gl) return;
    this.move(far ? 'trail' : 'lead', far ? 1 : 0);
  }

  bind() {
    const { look } = this;
    const btn = look.querySelector('.look__open');
    let downType = '';
    let wasShown = false;

    look.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      this.enter(locate(look, e).side);
    });
    look.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch') return;
      if (!this.from) return this.leave(false);
      this.leave(inward(locate(look, e), this.from) > 0.5);
    });
    look.addEventListener('pointerdown', (e) => {
      downType = e.pointerType;
      wasShown = this.shown;
    });

    // Touch has no hover: the first tap brings the card in from the side
    // nearest it, the second opens the frame. Mouse and keyboard open at once.
    btn.addEventListener('click', (e) => {
      if (downType === 'touch' && !wasShown && this.ready && motion) {
        Plate.active?.leave(true);
        Plate.active = this;
        this.enter(locate(look, e).side);
      } else {
        if (downType === 'touch') this.leave(true);
        this.onOpen?.();
      }
      downType = '';
    });

    btn.addEventListener('focus', () => {
      if (btn.matches(':focus-visible')) this.enter('left');
    });
    btn.addEventListener('blur', () => this.shown && downType !== 'touch' && this.leave(true));

    // A card brought in by a tap goes once its look has scrolled away.
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && this.shown) this.leave(true);
    }).observe(look);
  }
}
