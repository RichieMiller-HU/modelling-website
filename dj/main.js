/* Richie Miller — DJ. Behaviour. Reads everything from window.DJ (content.js). */
(function () {
  'use strict';
  const C = window.DJ || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const mq = (q) => window.matchMedia(q).matches;
  const REDUCED = mq('(prefers-reduced-motion: reduce)');
  const DESKTOP = mq('(min-width: 900px)');
  const FINE = mq('(hover: hover) and (pointer: fine)');
  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cleanTitle = (t) => String(t).replace(/[\p{Extended_Pictographic}️]/gu, '').replace(/\s+/g, ' ').replace(/\s*\|\s*$/, '').trim();
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const tcode = (t) => `${pad(t / 60)}:${pad(t % 60)}:${pad((t % 1) * 30)}`;
  const safePlay = (v) => { try { const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* autoplay refused */ } };
  const alias = C.alias || C.name || 'Richie Miller';
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const onFontsReady = (fn) => { fontsReady.then(() => { fn(); requestAnimationFrame(fn); }); };

  /* ---------- fill text slots ---------- */
  const fill = (sel, val) => $$(sel).forEach((el) => { el.textContent = val; });
  fill('[data-alias]', alias);
  fill('[data-name]', C.name || alias);
  fill('[data-role]', C.role || 'DJ');
  fill('[data-city]', C.city || '');
  fill('[data-status]', C.status || '');
  fill('[data-year]', C.year || new Date().getFullYear());
  fill('[data-setcount]', (C.sets || []).length);
  fill('[data-alias-short]', alias.split(/\s+/)[0].toUpperCase());
  const heroWhere = $('.hero-where');
  if (heroWhere) {
    if (C.genresConfirmed && Array.isArray(C.genres) && C.genres.length) heroWhere.textContent = C.genres.join(' · ');
    else heroWhere.hidden = true;
  }
  if (!C.status) $('.hero-status').hidden = true;

  const bioEl = $('[data-bio]');
  if (bioEl) { bioEl.textContent = C.bio || ''; if (C.bioIsPlaceholder) bioEl.classList.add('todo'); if (!C.bio) bioEl.hidden = true; }
  const genresEl = $('[data-genres]');
  if (genresEl && C.genresConfirmed && Array.isArray(C.genres) && C.genres.length) {
    genresEl.innerHTML = C.genres.map((g) => `<li>${esc(g)}</li>`).join('');
    genresEl.hidden = false;
  }

  /* ---------- listen strip (only links that exist) ---------- */
  const listen = [['SoundCloud', C.soundcloud], ['Mixcloud', C.mixcloud], ['Spotify', C.spotify]].filter((x) => x[1]);
  const listenEl = $('[data-listen]');
  if (listenEl && listen.length) {
    listenEl.innerHTML = listen.map(([n, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${n} ↗</a></li>`).join('');
    listenEl.hidden = false;
  }

  /* ---------- booking ---------- */
  const mail = $('#mailLink');
  if (mail && C.email) {
    const subj = encodeURIComponent(`Booking enquiry — ${alias}`);
    mail.href = `mailto:${C.email}?subject=${subj}`;
    mail.textContent = C.email;
  }
  const links = [];
  if (C.instagram) links.push([`Instagram @${C.instagram}`, `https://www.instagram.com/${C.instagram}/`]);
  if (C.youtubeChannel) links.push(['YouTube', C.youtubeChannel]);
  listen.forEach(([n, u]) => links.push([n, u]));
  if (C.pressKit) {
    if (C.pressKit.mode === 'url' && C.pressKit.url) links.push([C.pressKit.label || 'Press kit', C.pressKit.url]);
    else if (C.email) links.push([`${C.pressKit.label || 'Press kit'} — on request`, `mailto:${C.email}?subject=${encodeURIComponent(`${C.pressKit.label || 'Press kit'} request — ${alias}`)}`]);
  }
  const bookLinks = $('#bookLinks');
  if (bookLinks) bookLinks.innerHTML = links.map(([n, u]) => `<li><a href="${esc(u)}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''}>${esc(n)}${/^https?:/.test(u) ? ' ↗' : ''}</a></li>`).join('');
  const back = $('#backLink'); if (back && C.otherSitesLink) back.href = C.otherSitesLink;

  /* ---------- dates (hidden while empty) ---------- */
  const dates = (C.dates || []).filter((d) => d && d.date);
  if (dates.length) {
    const sec = $('#dates'); sec.hidden = false; const nav = $('[data-nav-dates]'); if (nav) nav.hidden = false;
    const fmt = (iso) => { const d = new Date(iso + 'T12:00:00'); return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); };
    $('#dateList').innerHTML = dates.map((d) => `<li class="rv"><span class="d">${esc(fmt(d.date))}</span><span class="v">${esc(d.venue || '')}</span><span>${esc(d.city || '')}</span>${d.url ? `<a href="${esc(d.url)}" target="_blank" rel="noopener">Tickets ↗</a>` : '<span></span>'}</li>`).join('');
  }

  /* ---------- sets ---------- */
  const grid = $('#setGrid');
  (C.sets || []).forEach((s, i) => {
    const li = document.createElement('li'); li.className = 'set rv';
    const title = cleanTitle(s.title || 'Live set');
    li.innerHTML = `
      <button class="set-thumb grain" type="button" aria-label="Play: ${esc(title)}">
        <img src="assets/yt/${esc(s.id)}.jpg" alt="" width="1280" height="720" loading="${i ? 'lazy' : 'eager'}" decoding="async">
        <span class="tcode cap">Set ${pad(i + 1)}</span>
        <span class="play cap">Play</span>
      </button>
      <div class="set-meta">
        <p class="cap"><span>YouTube</span><span>${pad(i + 1)} / ${pad(C.sets.length)}</span></p>
        <h3 class="set-title">${esc(title)}</h3>
        <a class="set-link cap" href="https://www.youtube.com/watch?v=${esc(s.id)}" target="_blank" rel="noopener">Open on YouTube ↗</a>
      </div>`;
    grid.appendChild(li);
    $('.set-thumb', li).addEventListener('click', function () {
      if (this.querySelector('iframe')) return;
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(s.id)}?autoplay=1&rel=0&modestbranding=1`;
      f.title = title; f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.setAttribute('allowfullscreen', ''); f.referrerPolicy = 'strict-origin-when-cross-origin';
      this.appendChild(f);
    });
  });

  /* ---------- photos (real) / stills (footage fallback) ---------- */
  const photos = (C.photos || []).filter((p) => p && p.src);
  const stillsTrack = $('#stillsTrack'), stillsEl = $('#stills');
  const phTrack = $('#phTrack'), phSec = $('#photos');
  if (photos.length) {
    // Real photos take over; the footage stills strip would only repeat the idea, so it goes.
    if (stillsEl) stillsEl.remove();
    phSec.hidden = false;
    const nav = $('[data-nav-photos]'); if (nav) nav.hidden = false;
    const bIdx = $('[data-bio-idx]'); if (bIdx) bIdx.textContent = '04';
    const dIdx = $('[data-dates-idx]'); if (dIdx) dIdx.textContent = '05';
    const caps = Array.from(new Set(photos.map((p) => p.caption).filter(Boolean)));
    const note = $('[data-photo-note]'); if (note) { if (caps.length === 1) note.textContent = caps[0] + '.'; else note.remove(); }
    photos.forEach((p, i) => {
      const land = p.fit ? p.fit === 'landscape' : p.w > p.h;
      const li = document.createElement('li'); li.className = 'ph ' + (land ? 'l' : 'p');
      li.innerHTML = `
        <button class="ph-btn grain" type="button" data-i="${i}" aria-label="Open photo ${i + 1} of ${photos.length}: ${esc(p.alt || p.caption || '')}">
          <img src="${esc(p.src)}-sm.jpg" srcset="${esc(p.src)}-sm.jpg 800w, ${esc(p.src)}.jpg 1800w" sizes="${land ? '(min-width: 900px) 62vw, 88vw' : '(min-width: 900px) 42vw, 70vw'}" alt="${esc(p.alt || '')}" width="${p.w || (land ? 1800 : 1440)}" height="${p.h || (land ? 1200 : 1800)}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
          <span class="n cap">${pad(i + 1)}</span>
        </button>
        <p class="ph-cap cap"><span>${esc(p.caption || '')}</span><span>${pad(i + 1)} / ${pad(photos.length)}</span></p>`;
      phTrack.appendChild(li);
    });
    // the line of type the strip slides through
    const run = $('#phRun');
    const runUnit = `<span>${esc(caps[0] || 'Studio session')}</span><i></i><span class="o">${esc(alias)}</span><i></i>`;
    if (run) run.innerHTML = runUnit.repeat(4);
  } else {
    if (phSec) phSec.remove();
    (C.stills || []).forEach((p, i) => {
      const li = document.createElement('li'); li.className = (p.w > p.h ? 'l' : 'p') + ' grain';
      li.innerHTML = `<img src="${esc(p.src)}-sm.jpg" alt="${esc(p.alt || '')}" width="${p.w}" height="${p.h}" loading="lazy" decoding="async"><span class="n cap">${pad(i + 1)}</span>`;
      stillsTrack.appendChild(li);
    });
  }

  /* ---------- video helpers ---------- */
  const srcOf = (v) => v + '.mp4', posterOf = (v) => v + '.jpg';
  const makeVideo = (base, eager) => {
    const v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('disablepictureinpicture', '');
    v.preload = eager ? 'auto' : 'none'; v.poster = posterOf(base);
    if (eager) { v.src = srcOf(base); v.autoplay = true; v.addEventListener('loadeddata', () => safePlay(v), { once: true }); }
    else v.dataset.src = srcOf(base);
    return v;
  };
  const makePoster = (base) => { const i = document.createElement('img'); i.src = posterOf(base); i.alt = ''; i.decoding = 'async'; return i; };
  // Load and play a lazy video when it is near the viewport; pause when far away.
  const lazyVideos = [];
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) { if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); } safePlay(v); }
    else if (v.src) v.pause();
  }), { rootMargin: '60% 0px' });
  const watch = (v) => { lazyVideos.push(v); io.observe(v); };

  /* ---------- hero media ---------- */
  const heroMedia = $('#heroMedia');
  const heroClips = DESKTOP ? (C.video.heroTriptych || [C.video.heroMobile]) : [C.video.heroMobile];
  heroClips.forEach((base) => {
    const col = document.createElement('div'); col.className = 'col';
    col.appendChild(REDUCED ? makePoster(base) : makeVideo(base, true));
    heroMedia.appendChild(col);
  });

  /* ---------- live video ---------- */
  const liveVideo = $('#liveVideo'), liveFrame = $('#liveFrame');
  const liveBase = DESKTOP ? C.video.live : C.video.liveMobile;
  if (REDUCED) { liveVideo.replaceWith(makePoster(liveBase)); }
  else { liveVideo.poster = posterOf(liveBase); liveVideo.dataset.src = srcOf(liveBase); watch(liveVideo); }
  const liveTc = $('#liveTc');
  if (liveTc && !REDUCED) liveVideo.addEventListener('timeupdate', () => { liveTc.textContent = tcode(liveVideo.currentTime); });

  /* ---------- bio video (desktop) / poster (phones) ---------- */
  const bioMedia = $('#bioMedia'), bioVideo = $('#bioVideo'), bioPoster = $('#bioPoster');
  bioPoster.src = posterOf(C.video.bio);
  if (DESKTOP && !REDUCED) { bioVideo.poster = posterOf(C.video.bio); bioVideo.dataset.src = srcOf(C.video.bio); watch(bioVideo); }
  else bioMedia.classList.add('poster');

  /* ---------- fit the booking word to the column ---------- */
  const bookWord = $('#bookWord');
  const fitBook = () => {
    if (!bookWord) return;
    const spans = $$('span', bookWord);
    const avail = bookWord.clientWidth - 2;
    if (mq('(min-width: 900px)')) {
      // one line, "BOOK RICHIE", filling the column
      spans.forEach((el) => { el.style.fontSize = ''; });
      bookWord.style.fontSize = '100px';
      const w = spans.reduce((a, el) => a + el.getBoundingClientRect().width, 0) + 0.14 * 100 * (spans.length - 1);
      bookWord.style.fontSize = Math.min((100 * avail) / w, window.innerHeight * 0.5) + 'px';
    } else {
      // stacked, each word filling the width
      bookWord.style.fontSize = '';
      spans.forEach((el) => {
        el.style.fontSize = '100px';
        const w = el.getBoundingClientRect().width || 1;
        el.style.fontSize = (100 * avail) / w + 'px';
      });
    }
  };
  onFontsReady(fitBook);
  window.addEventListener('resize', fitBook);

  /* ---------- reveal on scroll ---------- */
  $$('.sec-head, .bio-text, .bio-media, .book-row, .book-word').forEach((el) => el.classList.add('rv'));
  const rio = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.rv').forEach((el, i) => { el.style.transition = `opacity 1s var(--ease) ${(i % 3) * 90}ms, transform 1.1s var(--ease) ${(i % 3) * 90}ms`; rio.observe(el); });

  /* ---------- smooth scroll (desktop, fine pointer only) ---------- */
  let lenis = null;
  if (hasGsap && typeof Lenis !== 'undefined' && DESKTOP && FINE && !REDUCED) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return; const t = $(id); if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: 0, duration: 1.4 }); else t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  }));

  /* ---------- the veil: name cut out of the ink, footage bleeding through ---------- */
  const veil = $('#veil'), ink = $('.veil-ink'), textG = $('#veilText'), outG = $('#veilOutline'), torch = $('#torch');
  const L = [[$('#veilL1'), $('#outL1')], [$('#veilL2'), $('#outL2')]];
  const words = alias.toUpperCase().split(/\s+/);
  const lines = words.length >= 2 ? [words[0], words.slice(1).join(' ')] : [alias.toUpperCase(), ''];
  L.forEach((pair, i) => pair.forEach((t) => { t.textContent = lines[i]; }));
  ink.classList.add('solid'); // stays solid ink until the font is ready and the text is measured
  document.body.classList.add('hero-intro');

  let veilState = { scale: 1, cx: 0, cy: 0 };
  const applyVeil = () => {
    const tr = `translate(${veilState.cx} ${veilState.cy}) scale(${veilState.scale}) translate(${-veilState.cx} ${-veilState.cy})`;
    textG.setAttribute('transform', tr); outG.setAttribute('transform', tr);
  };
  const fitVeil = () => {
    const W = veil.clientWidth, H = veil.clientHeight; if (!W || !H) return;
    veil.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const g = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--g')) || 24;
    const avail = W - g * 2;
    // Measure on the rendered outline copy: text inside <defs><mask> has no layout box.
    const metrics = L.map(([, m]) => {
      if (!m.textContent) return null;
      m.setAttribute('font-size', 100); m.setAttribute('x', 0); m.setAttribute('y', 0);
      const len = m.getComputedTextLength() || 1;
      const fs = (100 * avail) / len;
      m.setAttribute('font-size', fs);
      let bb; try { bb = m.getBBox(); } catch (e) { bb = null; }
      if (!bb || !bb.height) bb = { y: -fs * 0.72, height: fs * 0.74 }; // Big Shoulders cap metrics, approx.
      return { fs, bb };
    });
    const live = metrics.filter(Boolean);
    let gap = live.length > 1 ? live[0].fs * 0.06 : 0;
    let total = live.reduce((a, m) => a + m.bb.height, 0) + gap * (live.length - 1);
    // Never taller than ~72% of the viewport: shrink every line by the same factor and centre the block.
    const k = Math.min(1, (H * 0.78) / total);
    if (k < 1) { live.forEach((m) => { m.fs *= k; m.bb = { y: m.bb.y * k, height: m.bb.height * k }; }); gap *= k; total *= k; }
    let y = (H - total) / 2 * 1.02; // block centred, a hair lower than optical centre
    metrics.forEach((m, i) => {
      if (!m) { L[i].forEach((t) => t.removeAttribute('font-size')); return; }
      const baseline = y - m.bb.y; // bb.y is negative (above baseline) when y=0
      L[i].forEach((t) => { t.setAttribute('font-size', m.fs); t.setAttribute('x', W / 2); t.setAttribute('y', baseline); t.style.textAnchor = 'middle'; });
      y += m.bb.height + gap;
    });
    veilState.cx = W / 2; veilState.cy = H / 2; applyVeil();
  };
  fontsReady.then(() => {
    fitVeil();
    requestAnimationFrame(() => {
      fitVeil();
      ink.classList.remove('solid');
      if (hasGsap && !REDUCED) {
        gsap.fromTo(veilState, { scale: 1.22 }, { scale: 1, duration: 1.8, ease: 'expo.out', onUpdate: applyVeil, onComplete: () => { document.body.classList.remove('hero-intro'); setupHeroScroll(); } });
      } else { document.body.classList.remove('hero-intro'); setupHeroScroll(); }
    });
  });
  let fitT; window.addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(() => { fitVeil(); ScrollTrigger && ScrollTrigger.refresh(); }, 120); });

  // Scroll: the letters grow into the footage and the ink thins out, then the next section rides over the hero.
  function setupHeroScroll() {
    if (!hasGsap || REDUCED) return;
    const st = { p: 0 };
    gsap.to(st, {
      p: 1, ease: 'none',
      scrollTrigger: { trigger: '.hero-wrap', start: 'top top', end: 'bottom bottom', scrub: 0.4 },
      onUpdate() {
        veilState.scale = 1 + st.p * 2.4; applyVeil();
        ink.setAttribute('fill-opacity', (0.9 - st.p * 0.75).toFixed(3));
        outG.style.opacity = (1 - st.p * 1.6).toFixed(3);
      },
    });
    gsap.to('#heroMedia', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero-wrap', start: 'top top', end: 'bottom bottom', scrub: true } });
  }

  // Torch: a hole in the veil follows the cursor (fine pointers only).
  if (FINE && !REDUCED && hasGsap) {
    const hero = $('#hero');
    const pos = { x: -999, y: -999 };
    const paint = () => { torch.setAttribute('cx', pos.x); torch.setAttribute('cy', pos.y); };
    const toX = gsap.quickTo(pos, 'x', { duration: 0.55, ease: 'power3', onUpdate: paint });
    const toY = gsap.quickTo(pos, 'y', { duration: 0.55, ease: 'power3', onUpdate: paint });
    const r = { v: 0 };
    const setR = (n) => gsap.to(r, { v: n, duration: 0.9, ease: 'expo.out', onUpdate: () => torch.setAttribute('r', r.v) });
    let lit = false;
    hero.addEventListener('pointermove', (e) => {
      const b = hero.getBoundingClientRect(); const x = e.clientX - b.left, y = e.clientY - b.top;
      if (!lit) { lit = true; pos.x = x; pos.y = y; paint(); setR(Math.min(220, window.innerWidth * 0.13)); }
      toX(x); toY(y);
    });
    hero.addEventListener('pointerleave', () => { lit = false; setR(0); });
  }

  /* ---------- marquee: constant drift plus scroll velocity ---------- */
  const track = $('#marqueeTrack');
  const items = [alias, C.city || '', C.role || 'DJ', 'Sets', 'Live', 'Booking'].filter(Boolean);
  const unit = items.map((w, i) => `<span class="${i % 3 === 1 ? 'o' : i % 3 === 2 ? 'r' : ''}">${esc(w)}</span><i></i>`).join('');
  track.innerHTML = unit + unit + unit + unit;
  if (!REDUCED) {
    let x = 0, vel = 0, lastY = window.scrollY, unitW = 0;
    const measure = () => { unitW = track.scrollWidth / 4; };
    measure(); window.addEventListener('resize', measure);
    const tick = (ts, dt) => {
      const y = window.scrollY; const dy = y - lastY; lastY = y;
      vel += (dy - vel) * 0.12;
      const speed = 0.6 + Math.min(Math.abs(vel), 60) * 0.14;
      const dir = vel < -0.5 ? 1 : -1;
      x += dir * speed * (dt ? Math.min(dt * 60, 3) : 1);
      if (unitW) { if (x <= -unitW) x += unitW; if (x > 0) x -= unitW; }
      const skew = Math.max(-10, Math.min(10, vel * 0.18));
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    };
    if (hasGsap) gsap.ticker.add((t, dtms) => tick(t, dtms / 1000)); else { let p = performance.now(); const loop = (t) => { tick(t, (t - p) / 1000); p = t; requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
  }

  /* ---------- live: the frame opens to full bleed as you scroll ---------- */
  if (hasGsap && !REDUCED) {
    const target = $('.live-video', liveFrame) || $('img', liveFrame);
    const from = DESKTOP ? [28, 30] : [18, 16];
    gsap.fromTo(target, { clipPath: `inset(${from[0]}% ${from[1]}% ${from[0]}% ${from[1]}%)` }, {
      clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
      scrollTrigger: { trigger: '#liveStage', start: 'top 70%', end: 'top -40%', scrub: 0.5 },
    });
    // photos / stills: pinned horizontal scrub on desktop; native horizontal scroll on phones
    if (DESKTOP && photos.length) {
      const stage = $('#phStage'), run = $('#phRun');
      const dist = () => Math.max(0, phTrack.scrollWidth - window.innerWidth);
      const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
      tl.to(phTrack, { x: () => -dist(), ease: 'none' }, 0);
      if (run) tl.fromTo(run, { x: () => -window.innerWidth * 0.1 }, { x: () => -dist() * 0.45 - window.innerWidth * 0.1, ease: 'none' }, 0);
    }
    if (DESKTOP && !photos.length && stillsEl) {
      const dist = () => Math.max(0, stillsTrack.scrollWidth - window.innerWidth);
      gsap.to(stillsTrack, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: stillsEl, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
    }
  }

  /* ---------- full-screen photo viewer: click, arrows, Esc, swipe ---------- */
  const viewer = $('#viewer');
  if (viewer && photos.length) {
    const vImg = $('#viewerImg'), vCap = $('#viewerCap'), vN = $('#viewerN');
    let cur = 0, opener = null, hideT = 0;
    const preload = (i) => { const im = new Image(); im.src = photos[(i + photos.length) % photos.length].src + '.jpg'; };
    const show = (i, dir) => {
      cur = (i + photos.length) % photos.length; const p = photos[cur];
      vImg.classList.remove('in'); vImg.style.setProperty('--dx', (dir || 0) * 40 + 'px');
      vImg.src = p.src + '-sm.jpg';                       // instant, then the full-size file
      const full = new Image(); full.onload = () => { if (photos[cur] === p) vImg.src = full.src; }; full.src = p.src + '.jpg';
      vImg.alt = p.alt || ''; vImg.width = p.w || 1440; vImg.height = p.h || 1800;
      vCap.textContent = p.caption || ''; vN.textContent = `${pad(cur + 1)} / ${pad(photos.length)}`;
      requestAnimationFrame(() => requestAnimationFrame(() => vImg.classList.add('in')));
      preload(cur + 1); preload(cur - 1);
    };
    const open = (i, from) => {
      clearTimeout(hideT);
      opener = from || document.activeElement; viewer.hidden = false; document.documentElement.classList.add('viewing');
      if (lenis) lenis.stop();
      show(i, 0); requestAnimationFrame(() => viewer.classList.add('open'));
      $('#viewerClose').focus({ preventScroll: true });
    };
    const close = () => {
      viewer.classList.remove('open'); document.documentElement.classList.remove('viewing');
      if (lenis) lenis.start();
      hideT = setTimeout(() => { viewer.hidden = true; }, REDUCED ? 0 : 320);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    };
    phTrack.addEventListener('click', (e) => { const b = e.target.closest('.ph-btn'); if (b) open(+b.dataset.i, b); });
    $('#viewerPrev').addEventListener('click', (e) => { e.stopPropagation(); show(cur - 1, -1); });
    $('#viewerNext').addEventListener('click', (e) => { e.stopPropagation(); show(cur + 1, 1); });
    $('#viewerClose').addEventListener('click', close);
    viewer.addEventListener('click', (e) => { if (e.target === viewer || e.target.classList.contains('viewer-fig')) close(); });
    document.addEventListener('keydown', (e) => {
      if (viewer.hidden || !viewer.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(cur + 1, 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(cur - 1, -1); }
      else if (e.key === 'Tab') { // keep focus inside the dialog
        const f = $$('button', viewer); const k = f.indexOf(document.activeElement);
        e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    let sx = null, sy = 0;
    viewer.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
    viewer.addEventListener('pointerup', (e) => {
      if (sx === null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) show(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });
  }

  /* ---------- pause everything when the tab is hidden ---------- */
  document.addEventListener('visibilitychange', () => {
    $$('video').forEach((v) => { if (document.hidden) v.pause(); else if (v.src) safePlay(v); });
  });

  // Refresh ScrollTrigger once images have settled.
  if (hasGsap) window.addEventListener('load', () => ScrollTrigger.refresh());
})();
