/* Richie Miller — "Elastic".
 * The book's column lag follows Codrops' Elastic Grid Scroll, demo 01 (MIT, see LICENSE-template.txt):
 * CSS decides the column count, JS reads it, deals the items into columns and gives each column
 * its own ScrollSmoother lag. Everything else (dealing by height, chapters, lightbox, film) is ours.
 */
(() => {
  'use strict';

  const M = window.MODEL;
  if (!M) return;

  // ─────────────── Helpers ───────────────
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const url = (p) => (/^(https?:)?\/\//.test(p) || p.startsWith('/') ? p : '../' + p); // content.js paths are repo-root relative
  const small = (p) => url(p.replace(/\.jpg$/i, '-sm.jpg'));
  const pad = (n) => String(n).padStart(2, '0');
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fullName = `${M.first} ${M.last}`;
  const mailto = (subject) => `mailto:${M.email}?subject=${encodeURIComponent(subject)}`;
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  const CHAPTER = { light: 'High key', dark: 'Low key', colour: 'Colour' };
  const ORDER = ['light', 'dark', 'colour'];

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  if (!reduce) document.documentElement.classList.add('has-motion');

  const smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth: reduce ? 0 : 1.15,
    effects: true,
    normalizeScroll: true,
  });

  // ─────────────── Sequence: chapters light → dark → colour ───────────────
  // Stable sort by chapter. The hero frame is moved a few places into its chapter
  // so the book does not open on the picture the visitor has just seen.
  const keyRank = (k) => { const i = ORDER.indexOf(k); return i < 0 ? ORDER.length : i; };
  const photos = M.photos.map((p, i) => ({ ...p, i })).sort((a, b) => keyRank(a.key) - keyRank(b.key) || a.i - b.i);
  const heroIdx = photos.findIndex((p) => p.src === M.heroLight);
  if (heroIdx > -1) {
    const [h] = photos.splice(heroIdx, 1);
    const sameKey = photos.filter((p) => p.key === h.key).length;
    const at = photos.findIndex((p) => p.key === h.key) + Math.min(3, sameKey);
    photos.splice(Math.max(0, at), 0, h);
  }

  // ─────────────── Static text ───────────────
  $('.bar__name').textContent = fullName;
  const words = $$('.hero__word');
  words[0].textContent = M.first;
  words[1].textContent = M.last;
  $('.hero__name').setAttribute('aria-label', fullName);
  $('.hero__role').innerHTML = `${esc(M.role)}<span>${esc(M.city)}</span>`;
  $('.hero__avail').innerHTML = `Available<span>${esc(M.available)}</span>`;
  const heroImg = $('.hero__img');
  heroImg.src = url(M.heroLight || photos[0].src);
  heroImg.alt = `${fullName}, close-up portrait`;

  $('.book__statement').textContent = M.statement;
  const chapters = [];
  photos.forEach((p, n) => {
    const c = chapters[chapters.length - 1];
    if (c && c.key === p.key) c.to = n; else chapters.push({ key: p.key, from: n, to: n });
  });
  $('.book__index').innerHTML = chapters.map((c, i) =>
    `<li><span>${ROMAN[i] || i + 1}</span><span>${esc(CHAPTER[c.key] || c.key)}</span><span>${c.from === c.to ? pad(c.from + 1) : `${pad(c.from + 1)}–${pad(c.to + 1)}`}</span></li>`).join('');

  // ─────────────── Book items ───────────────
  // Portraits get a measured rhythm of widths so 13 frames read as a layout, not a wall of equal tiles.
  const WIDTHS = [1, 0.8, 1, 0.88, 0.72, 1, 0.84];
  const grid = $('.grid');
  let portraitN = 0;
  const items = photos.map((p, n) => {
    const land = p.fit === 'landscape';
    const pn = land ? -1 : portraitN++; // portrait ordinal, picks a width from WIDTHS
    const ar = land ? 2 / 3 : 3 / 2; // height / width of the frame
    const fig = el('figure', 'item');
    fig.style.setProperty('--ar', land ? '3 / 2' : '2 / 3');
    fig.dataset.key = p.key;
    const fullW = land ? 2000 : 1333, smW = land ? 900 : 600;
    fig.innerHTML =
      `<button type="button" aria-label="View photo ${n + 1} of ${photos.length}: ${esc(p.caption || '')}">` +
      `<span class="item__frame"><img class="item__img" src="${small(p.src)}" srcset="${small(p.src)} ${smW}w, ${url(p.src)} ${fullW}w" ` +
      `sizes="(min-width: 65em) 31vw, 46vw" loading="lazy" decoding="async" alt="${esc(fullName)} — ${esc(p.caption || '')}"></span></button>` +
      `<figcaption class="item__cap"><span>${pad(n + 1)}</span><span>${esc(p.caption || '')}</span></figcaption>`;
    const img = $('img', fig);
    const done = () => img.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done(); else { img.addEventListener('load', done); img.addEventListener('error', done); }
    $('button', fig).addEventListener('click', () => openLightbox(n));
    grid.appendChild(fig);
    return { fig, img, w: 1, pn, ar, photo: p, n };
  });

  // ─────────────── Elastic grid ───────────────
  let lagEffects = [];
  let currentColumnCount = 0;

  /** Column count as CSS computes it (never hard-coded). */
  const getColumnCount = () => getComputedStyle(grid).getPropertyValue('grid-template-columns').split(' ').filter(Boolean).length;

  /** Kill lag effects, unwrap columns, restore the original order. */
  const clearGrid = () => {
    lagEffects.forEach((e) => e.kill());
    lagEffects = [];
    $$('.grid__column', grid).forEach((c) => c.remove());
    items.forEach(({ fig }) => { fig.classList.remove('item--r'); grid.appendChild(fig); });
  };

  /** Row gap in px, as the CSS custom property resolves at this width. */
  const rowGap = () => {
    const g = getComputedStyle(document.documentElement).getPropertyValue('--r-gap').trim();
    return g.endsWith('vw') ? (parseFloat(g) * innerWidth) / 100 : parseFloat(g) || 40;
  };

  /**
   * Deal items to the shortest column (in column-width units), keeping the reading order,
   * with staggered column starts. The width rhythm is rotated until the columns end closest
   * together, so whatever the photo count the grid never trails off into one long column.
   */
  const deal = (n) => {
    const gs = getComputedStyle(grid);
    const colW = (grid.clientWidth - parseFloat(gs.paddingLeft) * 2 - parseFloat(gs.columnGap) * (n - 1)) / n;
    const unitGap = rowGap() / colW;
    const offsets = n >= 3 ? [0, 0.5, 0.2, 0.35, 0.1] : n === 2 ? [0, 0.42] : [0];
    let best = null;
    for (let rot = 0; rot < WIDTHS.length; rot++) {
      const heights = Array.from({ length: n }, (_, i) => offsets[i] || 0);
      const cols = Array.from({ length: n }, () => []);
      const ws = items.map((it) => (it.pn < 0 || n === 1 ? 1 : WIDTHS[(it.pn + rot) % WIDTHS.length]));
      items.forEach((it, k) => {
        let c = 0;
        for (let i = 1; i < n; i++) if (heights[i] < heights[c] - 0.02) c = i;
        cols[c].push(it);
        heights[c] += ws[k] * it.ar + 0.08 + unitGap;
      });
      const slack = Math.max(...heights) - Math.min(...heights);
      if (!best || slack < best.slack - 0.01) best = { slack, cols, ws };
    }
    items.forEach((it, k) => { it.w = best.ws[k]; it.fig.style.setProperty('--w', it.w); });
    return { cols: best.cols, offsets, colW };
  };

  /** Let the shorter columns breathe (wider row gaps) so all columns end on one line at rest. */
  const justify = () => {
    const cols = $$('.grid__column', grid);
    cols.forEach((c) => (c.style.rowGap = ''));
    const base = rowGap();
    const hs = cols.map((c) => c.offsetHeight);
    const target = Math.max(...hs);
    cols.forEach((c, i) => {
      const k = c.children.length;
      if (k < 2) return;
      const extra = Math.min((target - hs[i]) / (k - 1), base * 1.6);
      c.style.rowGap = `${base + extra}px`;
    });
  };

  const buildGrid = () => {
    clearGrid();
    const n = getColumnCount();
    currentColumnCount = n;
    const { cols, offsets, colW } = deal(n);
    const mid = (n - 1) / 2;
    const frag = document.createDocumentFragment();
    cols.forEach((col, i) => {
      const c = el('div', 'grid__column');
      c.style.paddingTop = `${Math.round((offsets[i] || 0) * colW)}px`;
      col.forEach((it, k) => {
        // lean narrower frames toward the page centre; the middle column alternates
        if (it.w < 1) {
          const right = i < mid || (i === mid && k % 2 === 1);
          it.fig.classList.toggle('item--r', right);
        }
        c.appendChild(it.fig);
      });
      frag.appendChild(c);
      // Lag: demo 01's centre-out lag for 3+ columns; a stair (demo 03) for 2, where centre-out would be flat
      const lag = n >= 3 ? 0.22 + Math.abs(i - mid) * 0.42 : n === 2 ? 0.14 + i * 0.32 : 0.2;
      c.dataset.lag = lag;
    });
    grid.appendChild(frag);
    justify();
    if (!reduce) $$('.grid__column', grid).forEach((c) => lagEffects.push(...smoother.effects(c, { speed: 1, lag: +c.dataset.lag })));
    ScrollTrigger.refresh();
  };

  // ─────────────── Digitals & clients (hidden while empty) ───────────────
  if (M.digitals && M.digitals.length) {
    const d = $('#digitals');
    d.hidden = false;
    $('.digitals__row', d).innerHTML = M.digitals.map((p) =>
      `<figure><div class="item__frame" style="--ar:3 / 4"><img class="item__img is-loaded" src="${url(p.src)}" loading="lazy" decoding="async" alt="${esc(fullName)} digital — ${esc(p.caption || '')}"></div><figcaption class="item__cap"><span>${esc(p.caption || '')}</span></figcaption></figure>`).join('');
  }
  if (M.clients && M.clients.length) {
    const c = $('#clients');
    c.hidden = false;
    $('.clients__list', c).innerHTML = M.clients.map((n) => `<li>${esc(n)}</li>`).join('');
  }

  // ─────────────── Measurements ───────────────
  $('.stats__grid').innerHTML = M.stats.map(([label, metric, imperial]) => {
    const m = /^([\d.,]+)\s*(.*)$/.exec(metric || '');
    const v = m
      ? `<span class="stat__v">${esc(m[1])}${m[2] ? `<small>${esc(m[2])}</small>` : ''}</span>`
      : `<span class="stat__v stat__v--word">${esc(metric)}</span>`;
    return `<div class="stat" data-reveal><dt class="label">${esc(label)}</dt><dd>${v}<span class="stat__i">${esc(imperial || '')}</span></dd></div>`;
  }).join('');

  // ─────────────── Contact ───────────────
  const mail = $('.contact__mail');
  const [u, dom] = M.email.split('@');
  mail.href = mailto(`Booking enquiry — ${fullName}`);
  mail.innerHTML = `<span>${esc(u)}@</span><span>${esc(dom || '')}</span>`;
  mail.setAttribute('aria-label', `Email ${M.email}`);
  const ig = $('.contact__ig');
  ig.href = `https://instagram.com/${M.instagram}`;
  ig.textContent = `@${M.instagram}`;
  const ag = $('.contact__agency');
  ag.innerHTML = M.agency && M.agency.url
    ? `<a href="${esc(M.agency.url)}" target="_blank" rel="noopener">${esc(M.agency.name)}</a>`
    : esc((M.agency && M.agency.name) || 'Independent');
  $('.contact__comp').innerHTML = M.compCard
    ? `<a href="${esc(url(M.compCard))}" target="_blank" rel="noopener">Download PDF</a>`
    : `<a href="${mailto(`Comp card request — ${fullName}`)}">On request</a>`;
  const copy = $('.contact__copy');
  copy.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(M.email); copy.textContent = 'Copied'; }
    catch (e) { copy.textContent = M.email; }
    setTimeout(() => (copy.textContent = 'Copy address'), 2200);
  });
  $('.foot__base').textContent = `${M.city} — ${M.available}`;
  $('.foot__copy').textContent = `© ${new Date().getFullYear()} ${fullName}`;

  // ─────────────── Nav ───────────────
  $$('[data-to]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const t = a.dataset.to;
    smoother.scrollTo(t === '#top' ? 0 : t, !reduce, 'top top');
  }));

  // ─────────────── Film ───────────────
  const video = $('.film__video');
  const toggle = $('.film__toggle');
  let userPaused = reduce; // reduced motion: never autoplay
  let videoReady = false;
  const fmt = (s) => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
  const loadVideo = () => {
    if (videoReady || !M.video || !M.video.src) return;
    videoReady = true;
    if (M.video.poster) video.poster = url(M.video.poster);
    video.src = url(M.video.src);
    video.preload = 'metadata';
  };
  const setToggle = () => {
    const on = !video.paused;
    toggle.setAttribute('aria-pressed', String(on));
    toggle.querySelector('span').textContent = on ? 'Pause' : 'Play';
  };
  video.addEventListener('play', setToggle);
  video.addEventListener('pause', setToggle);
  video.addEventListener('loadedmetadata', () => { $('.film__dur').textContent = fmt(video.duration); });
  video.addEventListener('timeupdate', () => { $('.film__cur').textContent = fmt(video.currentTime); });
  toggle.addEventListener('click', () => {
    loadVideo();
    if (video.paused) { userPaused = false; video.play().catch(() => {}); } else { userPaused = true; video.pause(); }
  });
  if (!M.video || !M.video.src) $('#film').hidden = true;
  ScrollTrigger.create({ trigger: '.film', start: 'top bottom+=80%', once: true, onEnter: loadVideo });
  ScrollTrigger.create({
    trigger: '.film__frame', start: 'top 85%', end: 'bottom 15%',
    onToggle: (s) => { if (s.isActive && !userPaused) { loadVideo(); video.play().catch(() => {}); } else if (!s.isActive) video.pause(); },
  });

  // ─────────────── Chapters & ground ───────────────
  // The page turns low-key with the book: bone while the high-key frames pass, coal once the dark set arrives.
  const chapterEl = $('.bar__chapter');
  const chapterText = $('span', chapterEl);
  const meta = $('meta[name="theme-color"]');
  const book = $('.book');
  let dark = null, chap = null;
  const updateChapter = () => {
    const line = innerHeight * 0.55;
    let current = null;
    for (const it of items) { if (it.fig.getBoundingClientRect().top < line) current = it.photo.key; }
    const br = book.getBoundingClientRect();
    const inBook = br.top < innerHeight * 0.5 && br.bottom > innerHeight * 0.5 && current;
    const firstDark = items.find((it) => it.photo.key !== 'light');
    const isDark = firstDark ? firstDark.fig.getBoundingClientRect().top < line || br.bottom < line : false;
    if (isDark !== dark) {
      dark = isDark;
      document.documentElement.classList.toggle('is-dark', dark);
      meta.content = dark ? '#0d0c0b' : '#ebe7e0';
    }
    const label = inBook ? `${ROMAN[chapters.findIndex((c) => c.key === current)] || ''}. ${CHAPTER[current] || current}` : null;
    if (label !== chap) {
      chap = label;
      chapterEl.classList.toggle('is-on', !!label);
      if (label) chapterText.textContent = label;
    }
  };
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: updateChapter, onRefresh: updateChapter });

  // ─────────────── Motion ───────────────
  const intro = () => {
    if (reduce) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo('.hero__clip', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.7, ease: 'expo.inOut' }, 0)
      .fromTo('.hero__img', { scale: 1.28 }, { scale: 1, duration: 2.6 }, 0.1)
      .fromTo('.hero__word', { yPercent: 108 }, { yPercent: 0, duration: 1.6, stagger: 0.12 }, 0.75)
      .fromTo('.hero__meta > *, .bar', { opacity: 0 }, { opacity: 1, duration: 1.2, stagger: 0.08, ease: 'power2.out' }, 1.2);
  };

  const scrollMotion = () => {
    if (reduce) return;
    // Hero: the name opens outward and the portrait settles back as the book takes over
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero__line--first', { xPercent: -16, ease: 'none' }, 0)
      .to('.hero__line--last', { xPercent: 16, ease: 'none' }, 0)
      .to('.hero__frame', { scale: 0.9, yPercent: 8, ease: 'none' }, 0);

    // Reveals
    $$('[data-reveal]').forEach((r) => {
      gsap.to(r, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 90%', once: true } });
    });

    // Film: the frame opens to the full width, the picture settles inside it
    const mm = gsap.matchMedia();
    mm.add('(min-width: 48em)', () => {
      gsap.fromTo('.film__frame', { scale: 0.8 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.film__stage', start: 'top bottom', end: 'top 12%', scrub: true } });
    });
    gsap.fromTo('.film__video', { scale: 1.22 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.film__stage', start: 'top bottom', end: 'bottom top', scrub: true } });
  };

  // ─────────────── Lightbox ───────────────
  const lb = $('.lb');
  const lbBg = $('.lb__bg', lb);
  let lbIndex = -1, lbImg = null, lastFocus = null, animating = false;
  const fit = (nw, nh) => {
    const vw = innerWidth, vh = innerHeight;
    const mw = vw - (vw < 768 ? 32 : 160), mh = vh - (vw < 768 ? 150 : 140);
    const s = Math.min(mw / nw, mh / nh);
    const w = nw * s, h = nh * s;
    return { x: (vw - w) / 2, y: (vh - h) / 2, w, h };
  };
  const natural = (it) => (it.img.naturalWidth ? [it.img.naturalWidth, it.img.naturalHeight] : it.photo.fit === 'landscape' ? [3, 2] : [2, 3]);
  const setText = (i) => {
    $('.lb__count', lb).textContent = `${pad(i + 1)} / ${pad(items.length)}`;
    const p = items[i].photo;
    const ch = CHAPTER[p.key] || '';
    const cap = p.caption || '';
    $('.lb__cap', lb).textContent = !ch || cap.toLowerCase().includes(ch.toLowerCase()) ? cap : `${cap} — ${ch}`;
  };
  const makeImg = (it) => {
    const im = el('img', 'lb__img');
    im.alt = it.img.alt;
    im.src = it.img.currentSrc || it.img.src;
    const hi = new Image();
    hi.src = url(it.photo.src);
    hi.decode().then(() => { if (im.isConnected) im.src = hi.src; }).catch(() => {});
    lb.appendChild(im);
    return im;
  };
  const place = (im, r) => gsap.set(im, { x: r.x, y: r.y, width: r.w, height: r.h });

  function openLightbox(i) {
    if (animating) return;
    lastFocus = document.activeElement;
    lbIndex = i;
    const it = items[i];
    const r = it.img.getBoundingClientRect();
    smoother.paused(true);
    lb.hidden = false;
    setText(i);
    lbImg = makeImg(it);
    const [nw, nh] = natural(it);
    const t = fit(nw, nh);
    place(lbImg, { x: r.left, y: r.top, w: r.width, h: r.height });
    it.img.style.visibility = 'hidden';
    animating = true;
    const d = reduce ? 0 : 1;
    gsap.to(lbBg, { opacity: 1, duration: 0.7 * d, ease: 'power2.out' });
    gsap.to(lbImg, { x: t.x, y: t.y, width: t.w, height: t.h, duration: 1.05 * d, ease: 'expo.inOut', onComplete: () => { animating = false; } });
    lb.classList.add('is-open');
    document.addEventListener('keydown', onKey);
    $('.lb__close', lb).focus({ preventScroll: true });
  }

  function closeLightbox() {
    if (lbIndex < 0 || animating) return;
    const it = items[lbIndex];
    const r = it.img.getBoundingClientRect();
    const onScreen = r.bottom > 0 && r.top < innerHeight;
    animating = true;
    lb.classList.remove('is-open');
    const d = reduce ? 0 : 1;
    const done = () => {
      it.img.style.visibility = '';
      $$('.lb__img', lb).forEach((x) => x.remove());
      lb.hidden = true; lbIndex = -1; animating = false;
      smoother.paused(false);
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    };
    if (onScreen) gsap.to(lbImg, { x: r.left, y: r.top, width: r.width, height: r.height, duration: 0.9 * d, ease: 'expo.inOut', onComplete: done });
    else gsap.to(lbImg, { opacity: 0, duration: 0.4 * d, onComplete: done });
    gsap.to(lbBg, { opacity: 0, duration: 0.8 * d, delay: 0.15 * d, ease: 'power2.inOut' });
    document.removeEventListener('keydown', onKey);
  }

  function step(dir) {
    if (lbIndex < 0 || animating) return;
    const prev = items[lbIndex];
    prev.img.style.visibility = '';
    lbIndex = (lbIndex + dir + items.length) % items.length;
    const it = items[lbIndex];
    it.img.style.visibility = 'hidden';
    setText(lbIndex);
    const old = lbImg;
    lbImg = makeImg(it);
    const [nw, nh] = natural(it);
    place(lbImg, fit(nw, nh));
    const d = reduce ? 0 : 1;
    gsap.fromTo(lbImg, { opacity: 0, xPercent: dir * 3 }, { opacity: 1, xPercent: 0, duration: 0.8 * d, ease: 'expo.out' });
    gsap.to(old, { opacity: 0, duration: 0.5 * d, ease: 'power2.out', onComplete: () => old.remove() });
  }

  function onKey(e) {
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') { // keep focus inside the viewer
      const f = $$('button:not([tabindex="-1"])', lb);
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }
  $('.lb__close', lb).addEventListener('click', closeLightbox);
  ['.lb__prev', '.lb__p'].forEach((s) => $(s, lb).addEventListener('click', () => step(-1)));
  ['.lb__next', '.lb__n'].forEach((s) => $(s, lb).addEventListener('click', () => step(1)));
  let tx = 0, ty = 0;
  lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 80) closeLightbox();
  }, { passive: true });
  addEventListener('resize', () => { if (lbIndex > -1 && lbImg && !animating) place(lbImg, fit(...natural(items[lbIndex]))); });

  // ─────────────── Resize: rebuild only when the column count changes ───────────────
  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (getColumnCount() !== currentColumnCount) buildGrid(); else { justify(); ScrollTrigger.refresh(); } }, 120);
  });

  // ─────────────── Start ───────────────
  const ready = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    heroImg.decode ? heroImg.decode().catch(() => {}) : Promise.resolve(),
  ]);
  const timeout = new Promise((r) => setTimeout(r, 3500));
  Promise.race([ready, timeout]).then(() => {
    buildGrid();
    if (!reduce) {
      gsap.set('.hero__clip', { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set('.hero__word', { yPercent: 108 });
      gsap.set('.hero__meta > *, .bar', { opacity: 0 });
    }
    document.documentElement.classList.remove('is-loading');
    intro();
    scrollMotion();
    ScrollTrigger.refresh();
    updateChapter();
  });
})();
