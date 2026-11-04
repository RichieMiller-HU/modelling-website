// Richie Miller · Lookbook. Builds the page from ../assets/content.js
// (window.MODEL), lays out the book, and runs the one effect (develop.js)
// on every frame.

import { Plate, motion, webgl } from './develop.js';

const M = window.MODEL;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const url = (p) => (/^(https?:)?\/\//.test(p) ? p : '../' + p);
const sm = (p) => url(p.replace(/\.jpg$/i, '-sm.jpg'));
const pad = (n) => String(n).padStart(2, '0');
const name = `${M.first} ${M.last}`;
const mail = (subject) => `mailto:${M.email}?subject=${encodeURIComponent(subject)}`;
const booking = mail(`Booking enquiry: ${name}`);
const fine = matchMedia('(hover: hover) and (pointer: fine)');

if (!webgl()) document.documentElement.classList.add('plain');

/* Text --------------------------------------------------------------------- */

$$('[data-name]').forEach((el) => (el.textContent = name));
$$('[data-mail]').forEach((el) => (el.href = booking));
$$('[data-email]').forEach((el) => (el.textContent = M.email));
$('[data-city]').textContent = `${M.role}, ${M.city}`;
$('[data-city-plain]').textContent = M.city;
$('[data-available]').textContent = M.available;
$('[data-statement]').textContent = M.statement;
$('[data-copy]').textContent = `© ${new Date().getFullYear()} ${name}`;

const ig = $('[data-ig]');
ig.href = `https://instagram.com/${M.instagram}`;
ig.textContent = `@${M.instagram}`;
ig.target = '_blank';
ig.rel = 'noopener';

const agency = $('[data-agency]');
if (M.agency?.url) {
  agency.innerHTML = '';
  const a = Object.assign(document.createElement('a'), { href: M.agency.url, textContent: M.agency.name, target: '_blank', rel: 'noopener' });
  agency.append(a);
} else agency.textContent = M.agency?.name || 'Independent';

const comp = $('[data-comp]');
const compLink = document.createElement('a');
if (M.compCard) Object.assign(compLink, { href: url(M.compCard), textContent: 'Download PDF', download: '' });
else Object.assign(compLink, { href: mail(`Comp card request: ${name}`), textContent: 'On request' });
comp.append(compLink);

$('[data-base]').innerHTML = '';
$('[data-base]').append(M.city, document.createElement('br'), M.available);

/* Hero ---------------------------------------------------------------------- */

const heroName = $('.hero__name');
heroName.setAttribute('aria-label', name);
const split = (el, text) => {
  el.setAttribute('aria-hidden', 'true');
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch;
    el.append(s);
  }
};
split($('[data-first]'), M.first);
split($('[data-last]'), M.last);

const heroLook = $('.hero__look');
const heroImg = $('.look__img', heroLook);
heroImg.src = url(M.heroLight || M.photos[0].src);
heroImg.alt = `${name}, close-up portrait`;
const hero = new Plate(heroLook, { interactive: false });

/* The book ------------------------------------------------------------------ */

const CHAPTERS = {
  light: { title: 'Light', meta: 'High key, studio', tone: 'light' },
  dark: { title: 'Dark', meta: 'Low key, studio', tone: 'dark' },
  colour: { title: 'Colour', meta: 'Coda', tone: 'warm' },
};
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];

// Chapters in the order content.js first names each key.
const groups = [];
for (const p of M.photos) {
  let g = groups.find((c) => c.key === p.key);
  if (!g) groups.push((g = { key: p.key, photos: [] }));
  g.photos.push(p);
}

const items = []; // every frame the lightbox can show, in page order
const total = M.photos.length;
$('[data-count]').textContent = `${total} looks in ${groups.length} chapter${groups.length > 1 ? 's' : ''}`;

function lookMarkup(p, n, chapterTitle, wide) {
  const fig = document.createElement('figure');
  fig.className = 'look' + (motion ? ' is-veiled' : '');
  const img = document.createElement('img');
  img.className = 'look__img';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = `${name}, ${p.caption.toLowerCase()}`;
  img.src = sm(p.src);
  img.srcset = `${sm(p.src)} 900w, ${url(p.src)} ${p.fit === 'landscape' ? 2000 : 1333}w`;
  img.sizes = wide
    ? '(max-width: 760px) 96vw, (max-width: 1100px) 64vw, 48vw'
    : '(max-width: 760px) 48vw, (max-width: 1100px) 32vw, 24vw';
  const card = document.createElement('figcaption');
  card.className = 'look__card';
  card.innerHTML = `<span class="look__label">Look</span><span class="look__num">${pad(n)}</span><span class="look__pieces"></span>`;
  const pieces = $('.look__pieces', card);
  pieces.append(p.caption, document.createElement('br'), chapterTitle);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'look__open';
  btn.setAttribute('aria-label', `Look ${pad(n)}, ${p.caption}: view large`);
  fig.append(img, card, btn);
  return fig;
}

// Which spans close a chapter's last row at `cols` columns: the title cell
// at 1, 2 (a row's width of two) or 4 (two by two) cells, with or without
// the first portrait as a two-by-two feature.
function pack(photos, cols) {
  const sum = photos.reduce((a, p) => a + (p.fit === 'landscape' ? 2 : 1), 0);
  const first = photos.findIndex((p) => p.fit !== 'landscape');
  // On two columns the title takes a row of its own height above the frames.
  const prefs =
    cols === 2
      ? [[0, 1], [0, 0]]
      : [[1, 0], [1, 1], [2, 0], [2, 1], [4, 0], [4, 1]];
  for (const [head, feat] of prefs) {
    if (feat && first < 0) continue;
    if ((head + sum + feat * 3) % cols === 0) return { head, feature: feat ? first : -1 };
  }
  return { head: cols === 2 ? 0 : 1, feature: -1 };
}

const chaptersEl = $('.book__chapters');
let n = 0;
groups.forEach((g, gi) => {
  const c = CHAPTERS[g.key] || { title: g.key, meta: '', tone: 'light' };
  const section = document.createElement('section');
  section.className = `chapter chapter--${g.key} wrap`;
  section.dataset.tone = c.tone;
  section.id = gi === 0 ? 'book-start' : `chapter-${g.key}`;
  section.setAttribute('aria-label', `Chapter ${ROMAN[gi]}: ${c.title}`);
  const grid = document.createElement('div');
  grid.className = 'grid';
  const head = document.createElement('div');
  head.className = 'cell head';
  head.innerHTML = `<span class="head__index">${ROMAN[gi] || gi + 1}</span><h3 class="head__title">${c.title}</h3><p class="head__meta muted">${c.meta}<br />${g.photos.length} look${g.photos.length > 1 ? 's' : ''}</p>`;
  grid.append(head);
  g.cells = g.photos.map((p) => {
    n++;
    const cell = document.createElement('div');
    cell.className = 'cell' + (p.fit === 'landscape' ? ' cell--wide' : '');
    const fig = lookMarkup(p, n, c.title, true);
    cell.append(fig);
    grid.append(cell);
    items.push({ p, n, chapter: c.title, look: fig });
    return cell;
  });
  g.head = head;
  section.append(grid);
  chaptersEl.append(section);
});

// Digitals: a chapter of their own, after the book, while there are any.
if (M.digitals?.length) {
  const sec = $('#digitals');
  sec.hidden = false;
  sec.classList.add('chapter--light');
  const grid = $('.grid', sec);
  const g = { key: 'digitals', photos: M.digitals.map((d) => ({ fit: 'portrait', key: 'light', ...d })), head: $('.head', sec) };
  g.cells = g.photos.map((p, i) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const fig = lookMarkup(p, i + 1, 'Digital', false);
    $('.look__label', fig).textContent = 'Digital';
    cell.append(fig);
    grid.append(cell);
    items.push({ p, n: i + 1, chapter: 'Digital', look: fig });
    return cell;
  });
  groups.push(g);
}

if (M.clients?.length) {
  $('#clients').hidden = false;
  $('.clients__list').append(...M.clients.map((c) => Object.assign(document.createElement('li'), { textContent: c })));
}

let cols = 0;
function layout() {
  const now = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cols'), 10) || 4;
  if (now === cols) return;
  cols = now;
  for (const g of groups) {
    const { head, feature } = pack(g.photos, cols);
    g.head.classList.toggle('head--2', head === 2);
    g.head.classList.toggle('head--4', head === 4);
    g.head.classList.toggle('head--row', head === 0);
    g.head.parentElement.classList.toggle('grid--headed', head === 0);
    g.cells.forEach((cell, i) => {
      const wide = g.photos[i].fit === 'landscape';
      cell.classList.toggle('cell--feature', i === feature);
      $('img', cell).sizes =
        wide || i === feature
          ? '(max-width: 760px) 96vw, (max-width: 1100px) 64vw, 48vw'
          : '(max-width: 760px) 48vw, (max-width: 1100px) 32vw, 24vw';
    });
  }
}
layout();
addEventListener('resize', layout);

/* The effect on every frame ------------------------------------------------- */

const plates = items.map((it, i) => (it.plate = new Plate(it.look, { onOpen: () => lightbox.open(i) })));

const ready = (img) =>
  (img.complete && img.naturalWidth ? Promise.resolve() : new Promise((r) => img.addEventListener('load', r, { once: true }))).then(() =>
    img.decode().catch(() => {}),
  );

const fonts = Promise.all([
  document.fonts.load('300 64px "Nyght Serif"'),
  document.fonts.load('400 13px "Schibsted Grotesk"'),
  document.fonts.load('500 13px "Schibsted Grotesk"'),
]).catch(() => {});

let started = false;
const queue = [];
const develop = new IntersectionObserver(
  (entries) => {
    let k = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      develop.unobserve(e.target);
      const plate = plates.find((p) => p.look === e.target);
      const delay = k++ * 0.14;
      const go = () =>
        Promise.all([ready(plate.img), fonts]).then(() => plate.reveal({ delay }));
      started ? go() : queue.push(go);
    }
  },
  { threshold: 0.22, rootMargin: '0px 0px -6% 0px' },
);
plates.forEach((p) => {
  develop.observe(p.look);
  p.img.addEventListener('error', () => p.look.classList.remove('is-veiled'), { once: true });
});

/* Tone: the page goes dark for the dark chapter and the film --------------- */

const themeMeta = $('meta[name="theme-color"]');
const tones = { light: '#f2f2f0', dark: '#0c0b0a', warm: '#120d0a' };
const toner = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      document.documentElement.dataset.tone = e.target.dataset.tone;
      themeMeta.content = tones[e.target.dataset.tone];
    }
  },
  { rootMargin: '-50% 0px -50% 0px' },
);
$$('[data-tone]:not(html)').forEach((el) => toner.observe(el));

/* Film ---------------------------------------------------------------------- */

const video = $('.film__video');
const toggle = $('.film__toggle');
if (!M.video?.src) {
  $('#film').hidden = true;
  $('[data-if="video"]').hidden = true;
} else {
  video.poster = url(M.video.poster);
  let wanted = motion; // autoplay unless the visitor prefers less motion
  let seen = false;
  const sync = () => {
    const playing = !video.paused;
    toggle.textContent = playing ? 'Pause' : 'Play';
    toggle.setAttribute('aria-pressed', String(playing));
  };
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  video.addEventListener('loadedmetadata', () => {
    const s = Math.round(video.duration);
    if (s) $('[data-duration]').textContent = `Studio, ${Math.floor(s / 60)}:${pad(s % 60)}`;
  });
  const load = () => {
    if (!video.src) video.src = url(M.video.src);
  };
  new IntersectionObserver(([e]) => e.isIntersecting && load(), { rootMargin: '600px 0px' }).observe(video);
  new IntersectionObserver(
    ([e]) => {
      seen = e.isIntersecting;
      if (seen && wanted) video.play().catch(() => {});
      else video.pause();
    },
    { threshold: 0.35 },
  ).observe(video);
  toggle.addEventListener('click', () => {
    load();
    wanted = video.paused;
    if (wanted) video.play().catch(() => {});
    else video.pause();
  });
}

/* Measurements -------------------------------------------------------------- */

const statsEl = $('.stats__list');
for (const [label, metric, imperial] of M.stats) {
  const div = document.createElement('div');
  div.className = 'stat';
  const dt = Object.assign(document.createElement('dt'), { textContent: label });
  const dd = document.createElement('dd');
  const m = /^([\d.,]+)\s*(.*)$/.exec(metric);
  if (m) {
    dd.append(m[1]);
    if (m[2]) dd.append(Object.assign(document.createElement('span'), { className: 'unit', textContent: m[2] }));
  } else {
    dd.textContent = metric;
    dd.classList.add('is-word');
  }
  dd.append(Object.assign(document.createElement('span'), { className: 'alt', textContent: imperial || '' }));
  div.append(dt, dd);
  statsEl.append(div);
}

/* Lightbox ------------------------------------------------------------------ */

const lightbox = (() => {
  const el = $('.lb');
  const img = $('.lb__img', el);
  const bar = $('.lb__bar', el);
  const num = $('.lb__num', el);
  const title = $('.lb__title', el);
  const close = $('.lb__close', el);
  let index = -1;
  let opener = null;
  let busy = false;

  const box = () => {
    const narrow = innerWidth <= 760;
    const top = narrow ? 64 : 72;
    const bottom = narrow ? 96 : 72;
    const side = narrow ? 16 : 24;
    return { left: side, top, width: innerWidth - side * 2, height: innerHeight - top - bottom };
  };

  const fit = (ratio) => {
    const b = box();
    let w = b.width;
    let h = w / ratio;
    if (h > b.height) {
      h = b.height;
      w = h * ratio;
    }
    return { left: b.left + (b.width - w) / 2, top: b.top + (b.height - h) / 2, width: w, height: h };
  };

  const place = (r) => Object.assign(img.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });

  // The transform and clip that make the full frame at `f` look exactly like
  // the cropped cell at `c`.
  const from = (c, f) => {
    const s = Math.max(c.width / f.width, c.height / f.height);
    const ix = (f.width - c.width / s) / 2;
    const iy = (f.height - c.height / s) / 2;
    return { x: c.left - f.left - ix * s, y: c.top - f.top - iy * s, scale: s, clipPath: `inset(${iy}px ${ix}px ${iy}px ${ix}px)` };
  };

  const ratioOf = (it) => {
    const i = $('.look__img', it.look);
    return i.naturalWidth ? i.naturalWidth / i.naturalHeight : it.p.fit === 'landscape' ? 1.5 : 2 / 3;
  };

  const caption = (it) => {
    el.dataset.key = it.p.key || 'light';
    num.textContent = `${pad(it.n)} / ${pad(items.length)}`;
    title.innerHTML = '';
    title.append(it.p.caption, Object.assign(document.createElement('span'), { className: 'muted lb__chapter', textContent: it.chapter }));
    el.setAttribute('aria-label', `Look ${pad(it.n)}, ${it.p.caption}`);
  };

  const sharpen = (it, i) => {
    const big = new Image();
    big.src = url(it.p.src);
    big.decode().then(() => index === i && (img.src = big.src)).catch(() => {});
  };

  const visible = (r) => r.bottom > 0 && r.top < innerHeight && r.width > 0;

  function open(i) {
    if (busy || index >= 0) return;
    const it = items[i];
    index = i;
    opener = document.activeElement;
    caption(it);
    const cellImg = $('.look__img', it.look);
    img.src = cellImg.currentSrc || sm(it.p.src);
    img.alt = cellImg.alt;
    const f = fit(ratioOf(it));
    place(f);
    el.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    close.focus({ preventScroll: true });
    sharpen(it, i);
    if (!motion) return;
    busy = true;
    gsap.fromTo(el, { '--lb-fade': 0 }, { '--lb-fade': 1, duration: 0.6, ease: 'power2.out' });
    gsap.fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.45 });
    gsap.fromTo(img, from(it.look.getBoundingClientRect(), f), {
      x: 0,
      y: 0,
      scale: 1,
      clipPath: 'inset(0px 0px 0px 0px)',
      duration: 0.95,
      ease: 'expo.inOut',
      onComplete: () => (busy = false),
    });
  }

  function shut() {
    if (busy || index < 0) return;
    const it = items[index];
    const done = () => {
      el.hidden = true;
      img.removeAttribute('style');
      gsap.set(img, { clearProps: 'all' });
      gsap.set(bar, { clearProps: 'opacity' });
      document.documentElement.style.overflow = '';
      index = -1;
      busy = false;
      $('.look__open', it.look).focus({ preventScroll: true });
    };
    if (!motion) return done();
    busy = true;
    const c = it.look.getBoundingClientRect();
    const f = fit(ratioOf(it));
    gsap.to(bar, { opacity: 0, duration: 0.25 });
    gsap.to(el, { '--lb-fade': 0, duration: 0.6, delay: 0.25, ease: 'power2.inOut' });
    if (visible(c)) gsap.to(img, { ...from(c, f), duration: 0.8, ease: 'expo.inOut', onComplete: done });
    else gsap.to(img, { opacity: 0, duration: 0.4, onComplete: done });
  }

  function go(d) {
    if (busy || index < 0) return;
    const i = (index + d + items.length) % items.length;
    const it = items[i];
    index = i;
    busy = true;
    const pre = new Image();
    pre.src = sm(it.p.src);
    const swap = () => {
      caption(it);
      img.src = pre.src;
      img.alt = $('.look__img', it.look).alt;
      place(fit(pre.naturalWidth ? pre.naturalWidth / pre.naturalHeight : ratioOf(it)));
      sharpen(it, i);
      gsap.fromTo(img, { opacity: 0, x: 24 * d }, { opacity: 1, x: 0, duration: 0.5 * motion, ease: 'power3.out', onComplete: () => (busy = false) });
    };
    gsap.to(img, {
      opacity: 0,
      x: -24 * d,
      duration: 0.25 * motion,
      ease: 'power2.in',
      onComplete: () => pre.decode().then(swap, swap),
    });
    // Keep the page under the lightbox on the frame being shown, so closing
    // lands on it.
    const r = it.look.getBoundingClientRect();
    if (!visible(r)) scrollTo({ top: scrollY + r.top - (innerHeight - r.height) / 2, behavior: 'instant' });
  }

  $('.lb__prev', el).addEventListener('click', () => go(-1));
  $('.lb__next', el).addEventListener('click', () => go(1));
  close.addEventListener('click', shut);

  // Click the backdrop to close; swipe sideways on touch to move on.
  let sx = 0;
  let sy = 0;
  const stage = $('.lb__stage', el);
  stage.addEventListener('pointerdown', (e) => {
    sx = e.clientX;
    sy = e.clientY;
  });
  stage.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 6 && Math.abs(dy) < 6 && e.target === stage) shut();
  });

  addEventListener('keydown', (e) => {
    if (index < 0) return;
    if (e.key === 'Escape') shut();
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'Tab') {
      const f = $$('button', bar);
      const at = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  addEventListener('resize', () => {
    if (index >= 0 && !busy) place(fit(img.naturalWidth / img.naturalHeight || ratioOf(items[index])));
  });

  return { open };
})();

/* The name in the footer, set to the full measure. */
const footName = $('.foot__name');
const fitName = () => {
  footName.style.fontSize = '100px';
  const w = footName.parentElement.clientWidth - parseFloat(getComputedStyle(footName.parentElement).paddingLeft) * 2;
  footName.style.fontSize = ((100 * w) / footName.getBoundingClientRect().width) * 0.99 + 'px';
};
fonts.then(fitName);
addEventListener('resize', fitName);

/* Start --------------------------------------------------------------------- */

const timeout = new Promise((r) => setTimeout(r, 3500));
Promise.race([Promise.all([fonts, document.fonts.ready, ready(heroImg)]), timeout]).then(() => {
  document.body.classList.remove('loading');
  started = true;
  if (motion) {
    gsap.from('.hero__name .char', { yPercent: 108, duration: 1.3, ease: 'expo.out', stagger: 0.045, delay: 0.1 });
    gsap.from('.hero__foot > *', { opacity: 0, y: 14, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.7 });
  }
  hero.reveal({ duration: 2.4, delay: 0.15 });
  queue.splice(0).forEach((go) => go());
});
