/* Richie Miller — Noir II. All content comes from ../assets/content.js (window.MODEL). */
(() => {
  "use strict";
  const M = window.MODEL, d = document, html = d.documentElement;
  const $ = (s, r = d) => r.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const base = html.dataset.base || "";
  const url = (p) => (/^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : base + p);
  const sm = (p) => url(p.replace(/\.jpg$/i, "-sm.jpg"));
  const pad = (n) => String(n).padStart(2, "0");
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const DESK = "(min-width: 900px) and (hover: hover) and (pointer: fine)";
  const portrait = () => matchMedia("(max-aspect-ratio: 1/1)").matches;
  const isHz = () => matchMedia(DESK).matches && !reduce;
  const full = `${M.first} ${M.last}`;
  const mail = (s = `Booking enquiry — ${full}`) => `mailto:${M.email}?subject=${encodeURIComponent(s)}`;
  const KEYS = { light: "High key", dark: "Low key", colour: "Colour" };
  const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
  const WORDS = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split(" ");
  const word = (n) => WORDS[n] || String(n);
  const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  history.scrollRestoration = "manual";
  if (!reduce) html.classList.add("motion");
  if (fine && !reduce) html.classList.add("has-cur");

  /* chapters, in the order they first appear in content.js (light → dark → colour) */
  const order = [...new Set(M.photos.map((p) => p.key))];
  const photos = order.flatMap((k) => M.photos.filter((p) => p.key === k));
  const N = photos.length;

  /* ---------------- content ---------------- */
  const masked = (text) => [...text].map((c) => `<span class="mk"><span>${c}</span></span>`).join("");
  const h1 = $(".hero-name"), hn1 = $(".hn-1"), hn2 = $(".hn-2");
  h1.setAttribute("aria-label", full);
  hn1.innerHTML = masked(M.first); hn2.innerHTML = masked(M.last);
  hn1.setAttribute("aria-hidden", "true"); hn2.setAttribute("aria-hidden", "true");
  $(".nav-mark").textContent = full;
  $("#h-role").textContent = M.role;
  $("#h-city").textContent = M.city;

  const heroV = $(".hero-frame video"), filmV = $(".film-frame video");
  heroV.poster = filmV.poster = url(M.video.poster);
  heroV.src = url(M.video.src);
  filmV.src = url(M.video.src);

  $("#statement").innerHTML = M.statement.split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  const facts = [["Based", M.city], ["Available", M.available]];
  if (M.stats[0]) facts.push([M.stats[0][0], [M.stats[0][1], M.stats[0][2]].filter(Boolean).join(" / ")]);
  if (M.clients && M.clients.length) facts.push(["Selected clients", M.clients.join(", ")]);
  $("#facts").innerHTML = facts.map(([k, v]) => `<div><span class="lbl mute">${k}</span><span>${v}</span></div>`).join("");

  /* the book */
  const track = $("#track");
  const hzAtBuild = isHz();
  const chapNames = order.map((k) => KEYS[k] || cap1(k));
  track.innerHTML = `<div class="book-intro"><h2 class="d-l">Selected work</h2><p>${cap1(word(N))} frames in ${word(order.length)} chapters: ${chapNames.join(", ").toLowerCase()}. Select any image to see it large.</p></div>`;
  let gi = 0;
  order.forEach((k, ci) => {
    const list = photos.filter((p) => p.key === k);
    const chap = d.createElement("div");
    chap.className = `chap chap-${ci + 1}`;
    chap.innerHTML = `<span class="d-s">${ROMAN[ci] || ci + 1}</span><span class="lbl">${chapNames[ci]}</span><span class="lbl mute num">${pad(gi + 1)}${list.length > 1 ? "—" + pad(gi + list.length) : ""}</span>`;
    track.append(chap);
    let pc = 0, slot = 0; /* portrait counter (desktop rhythm), mobile slot cycle */
    const SLOTS = ["full", "pair", "right", "left"];
    for (let j = 0; j < list.length; j++) {
      const p = list[j], i = gi + j, land = p.fit === "landscape";
      let dk, al, mob;
      if (land) { dk = "d-land"; al = "a-c"; mob = "m-bleed"; }
      else {
        dk = pc % 2 ? "d-m" : "d-l"; al = pc % 2 ? (pc % 4 === 1 ? "a-e" : "a-s") : "a-c"; pc++;
        let s = SLOTS[slot % SLOTS.length]; slot++;
        if (s === "pair") { const nx = list[j + 1]; s = nx && nx.fit !== "landscape" ? "pa" : "right"; }
        else if (p._pb) s = "pb";
        if (s === "pa") list[j + 1]._pb = true;
        mob = "m-" + s;
        if (p._pb) { mob = "m-pb"; slot--; }
      }
      delete p._pb;
      track.append(figure(p, i, `${dk} ${al} ${mob}`, mob));
    }
    gi += list.length;
  });
  const endPad = d.createElement("div"); endPad.className = "book-end"; endPad.setAttribute("aria-hidden", "true"); track.append(endPad);
  $("#bk-t").textContent = pad(N);

  function figure(p, i, cls, mob) {
    const f = d.createElement("figure");
    f.className = `ph ${cls}`;
    f.dataset.cursor = "View"; f.tabIndex = 0; f.setAttribute("role", "button");
    f.setAttribute("aria-label", `Open photo ${i + 1} of ${N}: ${p.caption}`);
    const ar = p.fit === "landscape" ? "3/2" : "2/3";
    const mSize = mob === "m-pa" || mob === "m-pb" ? "50vw" : mob === "m-full" || mob === "m-bleed" ? "100vw" : "84vw";
    const lazy = !hzAtBuild && i > 1;
    f.innerHTML = `<div class="clip" style="--ar:${ar}"><img src="${sm(p.src)}" srcset="${sm(p.src)} 900w, ${url(p.src)} 2000w" sizes="(min-width: 900px) 34vw, ${mSize}" alt="${p.caption}" ${lazy ? 'loading="lazy"' : ""} decoding="async"></div><figcaption><span class="lbl num">${pad(i + 1)}</span><span class="lbl mute">${p.caption}</span></figcaption>`;
    const img = $("img", f);
    const setAr = () => { if (img.naturalWidth) { f.firstChild.style.setProperty("--ar", `${img.naturalWidth}/${img.naturalHeight}`); refreshSoon(); } };
    img.complete ? setAr() : img.addEventListener("load", setAr, { once: true });
    f.addEventListener("click", () => lightbox(photos, i, f));
    f.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); lightbox(photos, i, f); } });
    return f;
  }

  /* close-up */
  const cuSrc = M.closeUpDark || photos[0].src;
  const cuIdx = Math.max(0, photos.findIndex((p) => p.src === cuSrc));
  const cuImg = $("#cu-img"), cuF = $("#cu-frame");
  cuImg.src = url(cuSrc); cuImg.alt = photos[cuIdx] ? photos[cuIdx].caption : "Close-up";
  $("#cu-c").textContent = `${pad(cuIdx + 1)} / ${pad(N)} — ${photos[cuIdx] ? photos[cuIdx].caption : ""}`;
  /* where the eyes sit in the close-up frame, as a fraction of the image (x, y) */
  const CU_FOCUS = [0.36, 0.25];
  let cuDim = [2, 3], cuApply = () => {};
  /* cover-fit geometry shared by the <img> fallback and the WebGL shader, so both frame identically */
  const cuGeo = () => {
    const W = cuF.clientWidth || innerWidth, H = cuF.clientHeight || innerHeight;
    const ra = W / H, ri = cuDim[0] / cuDim[1];
    const sz = ra > ri ? [1, ri / ra] : [ra / ri, 1];
    const o = [0, 1].map((k) => clamp(CU_FOCUS[k] - sz[k] / 2, 0, 1 - sz[k]));
    const fs = [0, 1].map((k) => (CU_FOCUS[k] - o[k]) / sz[k]);
    const pos = o.map((v, k) => (sz[k] < 1 ? (v / (1 - sz[k])) * 100 : 50));
    return { W, H, sz, o, fs, pos };
  };
  const cuLayout = () => { const g = cuGeo(); cuImg.style.objectPosition = `${g.pos[0]}% ${g.pos[1]}%`; cuApply(); };
  cuImg.addEventListener("load", () => { cuDim = [cuImg.naturalWidth, cuImg.naturalHeight]; cuLayout(); });
  addEventListener("resize", cuLayout);
  const openCu = () => lightbox(photos, cuIdx, cuF);
  cuF.addEventListener("click", openCu);
  cuF.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCu(); } });

  /* digitals: hidden while empty */
  if (!M.digitals || !M.digitals.length) $$("[data-hide-empty=digitals]").forEach((e) => e.remove());
  else {
    const dg = $("#dg");
    M.digitals.forEach((p, i) => {
      const f = d.createElement("figure"); f.className = "ph"; f.dataset.cursor = "View"; f.tabIndex = 0;
      f.innerHTML = `<div class="clip"><img src="${url(p.src)}" alt="Digital — ${p.caption}" loading="lazy" decoding="async"></div><figcaption><span class="lbl">${p.caption}</span><span class="lbl mute num">${pad(i + 1)}</span></figcaption>`;
      f.onclick = () => lightbox(M.digitals, i, f); dg.append(f);
    });
  }

  /* measurements */
  const statsEl = $("#stats");
  statsEl.innerHTML = M.stats.map((s) => `<div><dt class="lbl mute">${s[0]}</dt><dd><span class="num">${s[1]}</span></dd></div>`).join("");
  let unit = 1;
  $$(".unit button").forEach((b) => b.addEventListener("click", () => {
    const u = +b.dataset.u; if (u === unit) return; unit = u;
    $$(".unit button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    const spans = $$("dd span", statsEl);
    M.stats.forEach((s, i) => {
      const el = spans[i], next = s[u] || s[1];
      if (el.textContent === next) return;
      if (reduce) { el.textContent = next; return; }
      gsap.timeline().to(el, { yPercent: -110, duration: 0.35, ease: "power2.in", delay: i * 0.03 })
        .add(() => { el.textContent = next; }).fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "expo.out" });
    });
  }));

  /* contact */
  const ctMail = $("#ct-mail"); ctMail.href = mail(); $("#ct-t").textContent = `Book ${M.first}`;
  /* the closing line is set to the full measure, edge to edge */
  const fitCta = () => {
    ctMail.style.fontSize = "100px";
    const t = $("#ct-t").getBoundingClientRect().width, arr = 100 * 0.42, gap = 100 * 0.18;
    const avail = ctMail.parentNode.clientWidth;
    if (t) ctMail.style.fontSize = `${Math.min(340, (100 * avail) / (t + arr + gap)) - 0.5}px`;
  };
  fitCta(); addEventListener("resize", fitCta); d.fonts && d.fonts.ready.then(fitCta);
  const cm = $("#c-mail"); cm.href = mail(); cm.textContent = M.email;
  const ig = $("#c-ig"); ig.href = `https://instagram.com/${M.instagram}`; ig.textContent = "@" + M.instagram;
  const ag = $("#c-ag");
  if (M.agency && M.agency.url) { const a = d.createElement("a"); a.href = M.agency.url; a.target = "_blank"; a.rel = "noopener"; a.textContent = M.agency.name; ag.replaceWith(a); }
  else ag.textContent = (M.agency && M.agency.name) || "Independent";
  const cc = $("#c-cc");
  if (M.compCard) { cc.href = url(M.compCard); cc.textContent = "Download PDF"; cc.setAttribute("download", ""); }
  else { cc.href = mail(`Comp card request — ${full}`); cc.textContent = "On request"; }
  const copyB = $("#c-copy");
  copyB.addEventListener("click", () => {
    const done = () => { copyB.textContent = "Copied"; setTimeout(() => (copyB.textContent = "Copy address"), 2200); };
    if (navigator.clipboard) navigator.clipboard.writeText(M.email).then(done, () => (location.href = mail()));
    else location.href = mail();
  });
  $("#f-l").textContent = `© ${new Date().getFullYear()} ${full}`;
  const clock = $("#clock");
  const tick = () => {
    if (!/budapest/i.test(M.city)) { clock.textContent = M.available; return; }
    try { clock.textContent = `${M.city} ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Budapest" }).format(new Date())}`; } catch (e) { clock.textContent = M.city; }
  };
  tick(); setInterval(tick, 30000);

  /* film controls */
  let userPaused = false;
  const snd = $("#snd"), pp = $("#pp");
  const setSound = (on) => { filmV.muted = !on; snd.textContent = on ? "Sound off" : "Sound on"; if (on) { userPaused = false; pp.textContent = "Pause"; filmV.play().catch(() => {}); } };
  snd.addEventListener("click", () => setSound(filmV.muted));
  $(".film-frame").addEventListener("click", () => setSound(filmV.muted));
  pp.addEventListener("click", () => {
    if (filmV.paused) { userPaused = false; filmV.play().catch(() => {}); pp.textContent = "Pause"; }
    else { userPaused = true; filmV.pause(); pp.textContent = "Play"; }
  });
  filmV.addEventListener("loadedmetadata", () => {
    const s = Math.round(filmV.duration || 0); if (s) $("#dur").textContent = `— ${Math.floor(s / 60)}:${pad(s % 60)}`;
  });
  const vio = (v, isFilm) => new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!(isFilm && userPaused)) v.play().catch(() => {}); }
    else { v.pause(); if (isFilm && !v.muted) setSound(false); }
  }, { threshold: 0.2 }).observe(v);
  vio(heroV, false); vio(filmV, true);

  /* image reveals (curtain, not clip-path, so lazy images still load) */
  if (!reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px -4% -8% 0px", threshold: 0.12 });
    $$(".ph").forEach((f) => io.observe(f));
  }

  /* ---------------- lightbox ---------------- */
  if (!fine) $(".lb-foot").innerHTML = "<span>Swipe to browse</span><span>Swipe down to close</span>";
  const lb = $(".lb"), lbImg = $(".lb-stage img"), lbN = $("#lb-n"), lbC = $("#lb-c"), lbX = $(".lb-x");
  let lbList = [], lbI = 0, lbFrom = null, lbOpen = false, lbTok = 0;
  const lbShow = (dir = 0) => {
    const p = lbList[lbI], tok = ++lbTok;
    lbN.textContent = `${pad(lbI + 1)} / ${pad(lbList.length)}`; lbC.textContent = p.caption || "";
    const im = new Image(); im.src = url(p.src);
    const swap = () => {
      if (tok !== lbTok) return;
      lbImg.src = im.src; lbImg.alt = p.caption || "";
      if (reduce) return;
      gsap.fromTo(lbImg, { opacity: 0, x: dir * 40, scale: dir ? 1 : 0.97 }, { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "expo.out", overwrite: true });
    };
    (im.decode ? im.decode() : Promise.resolve()).then(swap, swap);
    if (!reduce) gsap.to(lbImg, { opacity: 0.0, duration: 0.2 });
  };
  const lbGo = (dx) => { lbI = (lbI + dx + lbList.length) % lbList.length; lbShow(dx); };
  function lightbox(list, i, from) {
    lbList = list; lbI = i; lbFrom = from || null; lbOpen = true;
    lb.classList.add("open"); lenis && lenis.stop(); html.style.overflow = "hidden";
    lbShow(0);
    if (!reduce) gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    lbX.focus({ preventScroll: true });
  }
  const lbClose = () => {
    if (!lbOpen) return; lbOpen = false;
    const end = () => { lb.classList.remove("open"); lbImg.removeAttribute("src"); };
    reduce ? end() : gsap.to(lb, { opacity: 0, duration: 0.4, ease: "power2.in", onComplete: end });
    html.style.overflow = ""; lenis && lenis.start();
    lbFrom && lbFrom.focus({ preventScroll: true });
  };
  lbX.addEventListener("click", lbClose);
  $(".lb-prev").addEventListener("click", () => lbGo(-1));
  $(".lb-next").addEventListener("click", () => lbGo(1));
  d.addEventListener("keydown", (e) => {
    if (!lbOpen) return;
    if (e.key === "Escape") lbClose();
    else if (e.key === "ArrowRight") lbGo(1);
    else if (e.key === "ArrowLeft") lbGo(-1);
    else if (e.key === "Tab") { /* keep focus inside the dialog */
      const f = [lbX, $(".lb-prev"), $(".lb-next")]; const k = f.indexOf(d.activeElement);
      e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  let tx = 0, ty = 0;
  lb.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) lbGo(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) lbClose();
  }, { passive: true });

  /* ---------------- cursor ---------------- */
  if (fine && !reduce) {
    const c = d.createElement("div"); c.className = "cur"; c.setAttribute("aria-hidden", "true");
    c.innerHTML = '<span class="cur-d"></span><span class="cur-l"></span>'; d.body.append(c);
    const qx = gsap.quickTo(c, "x", { duration: 0.45, ease: "power3" }), qy = gsap.quickTo(c, "y", { duration: 0.45, ease: "power3" });
    const lab = $(".cur-l", c);
    addEventListener("pointermove", (e) => { qx(e.clientX); qy(e.clientY); c.classList.add("on"); }, { passive: true });
    d.addEventListener("pointerleave", () => c.classList.remove("on"));
    d.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor]");
      let l = t ? t.dataset.cursor : "";
      if (t && t.classList.contains("film-frame")) l = filmV.muted ? "Sound on" : "Sound off";
      c.classList.toggle("big", !!t); lab.textContent = l;
      c.classList.toggle("link", !t && !!e.target.closest("a,button"));
    });
  }

  /* ---------------- smooth scroll + scroll-driven motion ---------------- */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  let lenis = null, gl = null;
  var rT; function refreshSoon() { clearTimeout(rT); rT = setTimeout(() => ScrollTrigger.refresh(), 120); }
  addEventListener("load", refreshSoon);
  d.fonts && d.fonts.ready.then(refreshSoon);

  /* anchor links: smooth via Lenis on desktop, native elsewhere */
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); const t = id === "#top" ? 0 : $(id); if (t === null) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else if (t === 0) scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    else t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }));

  /* nav: wordmark appears once the hero name is gone; current section underline */
  const navMark = $(".nav-mark");
  ScrollTrigger.create({ start: () => $(".profile").offsetTop - innerHeight * 0.6, end: "max", onToggle: (s) => navMark.classList.toggle("on", s.isActive) });
  [["#work", ".book"], ["#film", ".film"], ["#measurements", ".meas"], ["#contact", ".ct"]].forEach(([h, s]) => {
    const link = $(`.nav a[href="${h}"]`), sec = $(s); if (!link || !sec) return;
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (st) => link.setAttribute("aria-current", st.isActive) });
  });

  const mm = gsap.matchMedia();

  /* desktop with a mouse: Lenis + the pinned horizontal book */
  mm.add(`${DESK} and (prefers-reduced-motion: no-preference)`, () => {
    html.classList.add("hz");
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => lenis && lenis.raf(t * 1000);
    gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);

    const sec = $(".book"), bar = $(".book-bar i"), figs = $$(".ph", track);
    const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const setH = () => { sec.style.height = `${dist() * 0.82 + innerHeight}px`; };
    setH(); ScrollTrigger.addEventListener("refreshInit", setH);
    const ch = $("#bk-ch"), bn = $("#bk-n");
    let cur = -1;
    const setIdx = (i) => { if (i === cur) return; cur = i; bn.textContent = pad(i + 1); const ci = order.indexOf(photos[i].key); ch.textContent = `${ROMAN[ci] || ci + 1} — ${chapNames[ci]}`; };
    /* the frame whose centre is nearest the reading line (58% of the width) is "current" */
    const track2 = () => { const x = -gsap.getProperty(track, "x") + innerWidth * 0.58; let best = 0, bd = 1e9;
      figs.forEach((f, i) => { const c = f.offsetLeft + f.offsetWidth / 2, dd = Math.abs(c - x); if (dd < bd) { bd = dd; best = i; } }); setIdx(best); };
    const tween = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true, onUpdate: (s) => { gsap.set(bar, { scaleX: s.progress }); track2(); } },
    });
    setIdx(0);
    figs.forEach((f, i) => {
      gsap.fromTo($("img", f), { xPercent: 4.5 }, { xPercent: -4.5, ease: "none", scrollTrigger: { trigger: f, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
    });
    refreshSoon();
    return () => {
      html.classList.remove("hz");
      ScrollTrigger.removeEventListener("refreshInit", setH);
      sec.style.height = ""; gsap.set(track, { clearProps: "transform" }); figs.forEach((f) => gsap.set($("img", f), { clearProps: "transform" }));
      gsap.ticker.remove(raf); lenis.destroy(); lenis = null;
    };
  });

  /* every device without reduced motion: hero, statement, close-up, film */
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const scrub = matchMedia(DESK).matches ? true : 0.5;
    const pinH = () => $(".hero-pin").offsetHeight;
    const mOff = () => $(".hero-meta").offsetLeft;

    /* hero: the studio film shrinks while the name splits around it */
    const geo = () => {
      const vw = innerWidth, vh = pinH(), m = mOff();
      if (!portrait()) {
        const g = vw * 0.024;
        const s = clamp((vw - 2 * m - 2 * g - hn1.offsetWidth - hn2.offsetWidth) / vw, 0.28, 0.48);
        return { s, x1: m - hn1.offsetLeft, y1: 0, x2: vw - m - (hn2.offsetLeft + hn2.offsetWidth), y2: 0 };
      }
      const s = 0.5, fh = vh * s, top = (vh - fh) / 2, g = vh * 0.012;
      return { s, x1: m - hn1.offsetLeft, y1: top - g - (hn1.offsetTop + hn1.offsetHeight), x2: vw - m - (hn2.offsetLeft + hn2.offsetWidth), y2: top + fh + g - hn2.offsetTop };
    };
    const ht = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom bottom", scrub, invalidateOnRefresh: true } });
    ht.to(".hero-frame", { scale: () => geo().s, ease: "power2.inOut", duration: 1 }, 0)
      .to(".hero-shade", { opacity: 0, ease: "power1.in", duration: 0.8 }, 0)
      .to(hn1, { x: () => geo().x1, y: () => geo().y1, ease: "power2.inOut", duration: 1 }, 0)
      .to(hn2, { x: () => geo().x2, y: () => geo().y2, ease: "power2.inOut", duration: 1 }, 0)
      .to(".hero-meta", { opacity: 0, ease: "none", duration: 0.25 }, 0)
      .to({}, { duration: 0.18 });

    /* statement: words light up with the scroll */
    const words = $$("#statement .w");
    gsap.to(words, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: "#statement", start: "top 80%", end: "bottom 50%", scrub: true } });

    /* close-up: a slit of the portrait opens to full bleed */
    /* the slit starts centred on the eyes, then the frame glides back to its natural crop */
    const win = () => (portrait() ? [22, 25] : [19, 38.5]);
    const inset = () => { const [y, x] = win(); return `inset(${y}% ${x}% ${y}% ${x}%)`; };
    const z = { e: 0 };
    cuApply = () => {
      const g = cuGeo(), e = z.e, s = 1.32 - 0.32 * e;
      const dx = (g.fs[0] - 0.5) * (1 - e), dy = (g.fs[1] - 0.5) * (1 - e);
      gsap.set(cuImg, { scale: s, x: -dx * s * g.W, y: -dy * s * g.H });
      if (gl) gl.set(s, dx, dy, g);
    };
    const ct = gsap.timeline({ scrollTrigger: { trigger: ".cu", start: "top top", end: "bottom bottom", scrub, invalidateOnRefresh: true,
      onUpdate: (s) => gl && gl.vel(s.getVelocity()) } });
    ct.fromTo(cuF, { clipPath: inset }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 }, 0)
      .fromTo(z, { e: 0 }, { e: 1, ease: "power2.inOut", duration: 1, onUpdate: () => cuApply() }, 0)
      .fromTo(".cu-cap", { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, 0.85)
      .to({}, { duration: 0.22 });
    /* the slit is already visible while the section scrolls into place */
    gsap.set(cuF, { clipPath: inset() }); cuApply();

    /* film: grows to full screen, swallowing the words */
    const s0 = () => (portrait() ? 0.72 : 0.36);
    const wOff = () => (portrait() ? 0 : innerWidth * s0() / 2 + innerWidth * 0.022);
    gsap.set(".film-w", { yPercent: () => (portrait() ? 0 : -50) });
    const ft = gsap.timeline({ scrollTrigger: { trigger: ".film", start: "top top", end: "bottom bottom", scrub, invalidateOnRefresh: true } });
    ft.fromTo(".film-frame", { scale: s0 }, { scale: 1, ease: "power2.inOut", duration: 1 }, 0)
      .fromTo(".film-w1", { x: () => -wOff(), opacity: 1 }, { x: () => -wOff() - innerWidth * (portrait() ? 0 : 0.08), opacity: () => (portrait() ? 1 : 0), ease: "power2.in", duration: 0.55 }, 0)
      .fromTo(".film-w2", { x: () => wOff(), opacity: 1 }, { x: () => wOff() + innerWidth * (portrait() ? 0 : 0.08), opacity: () => (portrait() ? 1 : 0), ease: "power2.in", duration: 0.55 }, 0)
      .to({}, { duration: 0.3 });

    return () => { cuApply = () => {}; gsap.set([cuF, ".film-frame", ".hero-frame", hn1, hn2, cuImg, ".film-w", words], { clearProps: "all" }); };
  });

  /* ---------------- WebGL close-up: a whisper of bend on fast scroll ---------------- */
  if (!reduce) { gl = glImage(cuF, url(cuSrc)); cuApply(); }

  function glImage(host, src) {
    const c = d.createElement("canvas"); c.setAttribute("aria-hidden", "true");
    const opts = { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power", preserveDrawingBuffer: false };
    let g = null, v2 = false;
    try { g = c.getContext("webgl2", opts); v2 = !!g; if (!g) g = c.getContext("webgl", opts); } catch (e) { g = null; }
    if (!g) return null;
    const vs = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
    /* same cover-fit maths as the <img> (o = crop origin, z = visible size), plus zoom s, offset dd, bend k */
    const fs = `precision highp float;varying vec2 v;uniform sampler2D t;uniform vec2 o,z,dd;uniform float s,k;
      void main(){
        vec2 uv=vec2(v.x,1.-v.y);
        vec2 q=(uv-.5)/s+.5+dd;
        q.y+=sin(clamp(q.x,0.,1.)*3.14159265)*k*.02;
        q=clamp(q,0.,1.);
        vec2 tc=o+q*z;
        float sp=abs(k)*.003;
        vec4 c=texture2D(t,tc);
        gl_FragColor=vec4(texture2D(t,tc+vec2(0.,sp)).r,c.g,texture2D(t,tc-vec2(0.,sp)).b,1.);
      }`;
    const sh = (type, src) => { const x = g.createShader(type); g.shaderSource(x, src); g.compileShader(x); return g.getShaderParameter(x, g.COMPILE_STATUS) ? x : null; };
    const a = sh(g.VERTEX_SHADER, vs), b = sh(g.FRAGMENT_SHADER, fs); if (!a || !b) return null;
    const pr = g.createProgram(); g.attachShader(pr, a); g.attachShader(pr, b); g.linkProgram(pr);
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
    g.useProgram(pr);
    const buf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(pr, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = {}; ["t", "o", "z", "dd", "s", "k"].forEach((n) => (U[n] = g.getUniformLocation(pr, n)));
    let ready = false, dead = false, kv = 0, kt = 0, dirty = true, visible = false, w = 0, h = 0;
    const st = { s: 1.32, dx: 0, dy: 0, o: [0, 0], z: [1, 1] };
    const tex = g.createTexture();
    const im = new Image(); im.decoding = "async";
    im.onload = () => {
      if (dead) return;
      g.bindTexture(g.TEXTURE_2D, tex);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, im);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      if (v2) { g.generateMipmap(g.TEXTURE_2D); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR); }
      else g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.uniform1i(U.t, 0);
      cuDim = [im.naturalWidth, im.naturalHeight]; cuLayout();
      ready = true; dirty = true; draw();
      requestAnimationFrame(() => c.classList.add("on"));
    };
    im.src = src;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = Math.round(host.clientWidth * dpr); h = Math.round(host.clientHeight * dpr);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; dirty = true; }
    };
    const draw = () => {
      if (!ready || dead || !w) return;
      g.viewport(0, 0, w, h);
      g.uniform2f(U.o, st.o[0], st.o[1]); g.uniform2f(U.z, st.z[0], st.z[1]); g.uniform2f(U.dd, st.dx, st.dy);
      g.uniform1f(U.s, st.s); g.uniform1f(U.k, kv);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4); dirty = false;
    };
    const loop = () => {
      if (!visible || dead) return;
      kt *= 0.9;
      const nk = kv + (kt - kv) * 0.12;
      if (Math.abs(nk - kv) > 1e-4 || Math.abs(nk) > 1e-4) { kv = Math.abs(nk) < 2e-4 ? 0 : nk; dirty = true; }
      if (dirty) draw();
    };
    c.addEventListener("webglcontextlost", (e) => { e.preventDefault(); dead = true; c.remove(); gl = null; gsap.ticker.remove(loop); });
    host.append(c); size();
    new ResizeObserver(() => { size(); draw(); }).observe(host);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) dirty = true; }).observe(host);
    gsap.ticker.add(loop);
    return {
      set: (s, dx, dy, geo) => { st.s = s; st.dx = dx; st.dy = dy; st.o = geo.o; st.z = geo.sz; dirty = true; },
      vel: (pxs) => { kt = clamp(pxs / 4500, -1, 1); },
    };
  }

  /* ---------------- intro ---------------- */
  const chars = $$(".hn .mk>span"), meta = $$(".hero-meta > *");
  if (reduce) { html.classList.add("no-pre"); $(".pre").remove(); heroV.play().catch(() => {}); return; }
  scrollTo(0, 0);
  html.style.overflow = "hidden"; lenis && lenis.stop();
  gsap.set(chars, { yPercent: 115 }); gsap.set(meta, { opacity: 0 }); gsap.set(heroV, { scale: 1.12 });
  const loadImg = (s) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = s; });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  gsap.to(".pre-bar i", { scaleX: 0.7, duration: 1.2, ease: "power2.out" });
  Promise.race([Promise.all([d.fonts ? d.fonts.ready : 0, loadImg(url(M.video.poster)), wait(420)]), wait(3000)]).then(() => {
    heroV.play().catch(() => {});
    gsap.timeline()
      .to(".pre-bar i", { scaleX: 1, duration: 0.35, ease: "power2.inOut", overwrite: true })
      .to(".pre", { yPercent: -100, duration: 1.05, ease: "expo.inOut" }, "+=.05")
      .add(() => { html.style.overflow = ""; lenis && lenis.start(); }, "-=.5")
      .to(heroV, { scale: 1, duration: 2, ease: "expo.out" }, "<.2")
      .to(chars, { yPercent: 0, duration: 1.25, ease: "expo.out", stagger: 0.032 }, "<.05")
      .to(meta, { opacity: 1, duration: 0.9, ease: "power1.out", clearProps: "opacity" }, "<.5")
      .add(() => { const p = $(".pre"); p && p.remove(); ScrollTrigger.refresh(); });
  });
})();
