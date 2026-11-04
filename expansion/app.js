/* Richie Miller · Expansion
   The scroll-driven "image expanding out of the words" mechanic is adapted from
   Codrops' ImageExpansionTypography (MIT, see LICENSE-template.txt): there, a
   window opens inside a line of type with GSAP Flip. Here the window is a hole
   in the line, and a full-bleed layer behind the type is clipped to that hole,
   so the same photograph can keep opening until it fills the screen. */
(() => {
  "use strict";
  const M = window.MODEL || {};
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const url = (p) => (!p ? "" : /^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : "../" + p);
  const small = (p) => p.replace(/(\.[a-z]+)$/i, "-sm$1");
  const ease = {
    io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
  };

  /* Where the face sits in each frame (fractions). Used to crop full-bleed and
     to aim the small window at the eyes. Unknown files fall back to upper third. */
  const FACE = {
    "rm-04": [0.55, 0.24], "rm-05": [0.5, 0.14], "rm-06": [0.5, 0.18], "rm-09": [0.46, 0.18],
    "rm-10": [0.6, 0.16], "rm-12": [0.57, 0.25], "rm-13": [0.62, 0.32], "rm-14": [0.5, 0.18],
    "rm-16": [0.36, 0.24], "rm-17": [0.5, 0.2], "rm-18": [0.35, 0.3], "rm-19": [0.48, 0.3], "rm-20": [0.48, 0.2],
  };
  const faceOf = (src) => FACE[(String(src).match(/rm-\d+/) || [])[0]] || [0.5, 0.3];

  /* ------------------------------------------------------------------ content */
  const first = M.first || "", last = M.last || "";
  const fullname = `${first} ${last}`.trim();
  const email = M.email || "";
  const [eUser, eDomain] = email.includes("@") ? [email.split("@")[0] + "@", email.split("@").slice(1).join("@")] : [email, ""];
  const fills = {
    first, last, fullname,
    role: M.role, city: M.city, available: M.available,
    statement: M.statement,
    "email-a": eUser, "email-b": eDomain,
  };
  $$("[data-m]").forEach((el) => { const v = fills[el.dataset.m]; if (v != null) el.textContent = v; });
  $$("[data-m=fullname]").forEach((el) => !fullname && el.remove());
  if (fullname) document.title = `${fullname} — ${M.role || "Model"}`;

  const mailto = (subject) => `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  $$("[data-mailto]").forEach((a) => {
    if (!email) return;
    a.href = mailto(`Booking enquiry — ${fullname}`);
    if (a.classList.contains("contact__mail")) a.setAttribute("aria-label", `Email ${email}`);
  });

  const ig = $("[data-m-ig]");
  if (M.instagram) { ig.href = `https://www.instagram.com/${encodeURIComponent(M.instagram)}/`; ig.textContent = "@" + M.instagram; }
  else ig.closest("div").remove();

  const ag = $("[data-m-agency]");
  if (M.agency && M.agency.name) {
    ag.innerHTML = M.agency.url ? `<a href="${esc(M.agency.url)}" target="_blank" rel="noopener">${esc(M.agency.name)}</a>` : esc(M.agency.name);
  } else ag.closest("div").remove();

  const comp = $("[data-m-comp]");
  comp.innerHTML = M.compCard
    ? `<a href="${esc(url(M.compCard))}" download>Download PDF</a>`
    : email ? `<a href="${esc(mailto(`Comp card request — ${fullname}`))}">On request</a>` : "On request";

  // hero / brief images
  $$("[data-m-src]").forEach((img) => {
    const src = M[img.dataset.mSrc] || (M.photos && M.photos[0] && M.photos[0].src);
    if (!src) return;
    img.src = url(src);
    const f = faceOf(src);
    img.dataset.face = f.join(" ");
    img.style.objectPosition = `${f[0] * 100}% ${f[1] * 100}%`;
  });

  const photos = (M.photos || []).filter((p) => p && p.src);
  // statement window: the first landscape of the light chapter reads best in a wide slot
  const sayImg = $("[data-say] img");
  if (sayImg) {
    const p = photos.find((x) => x.key === "light" && x.fit === "landscape") || photos[0];
    if (p) {
      sayImg.src = url(p.src);
      const f = faceOf(p.src);
      sayImg.style.objectPosition = `${f[0] * 100}% ${f[1] * 100}%`;
    } else sayImg.parentElement.remove();
  }

  // film
  const film = $("#film");
  const video = $("[data-m-video]");
  if (M.video && M.video.src) {
    video.src = url(M.video.src);
    if (M.video.poster) video.poster = url(M.video.poster);
    video.style.objectPosition = "44% 34%";
  } else {
    film.remove();
    $$('a[href="#film"]').forEach((a) => a.remove());
  }

  /* ---------------------------------------------------------------- the book */
  const order = [];
  const chapters = $$(".chapter");
  const known = chapters.map((c) => c.dataset.key);
  // anything without a known key joins the light chapter so nothing is lost
  const byKey = (k) => photos.filter((p) => (known.includes(p.key) ? p.key : "light") === k);
  const slotSizes = {
    "s-a1": "(max-width: 700px) 100vw, 48vw", "s-a2": "(max-width: 700px) 67vw, 32vw",
    "s-b1": "(max-width: 700px) 67vw, 32vw", "s-b2": "(max-width: 700px) 84vw, 48vw",
    "s-lone-r": "(max-width: 700px) 84vw, 40vw", "s-lone-l": "(max-width: 700px) 84vw, 40vw",
    "s-wide": "100vw", "s-wide-i": "(max-width: 700px) 100vw, 82vw", "s-coda": "(max-width: 700px) 100vw, 40vw",
  };
  const fig = (p, slot) => {
    const n = order.push(p);
    const land = p.fit === "landscape";
    const s = url(p.src), sm = url(small(p.src));
    const [fx, fy] = faceOf(p.src);
    return `<figure class="ph ${slot} fit-${land ? "landscape" : "portrait"}" data-reveal>
      <button class="ph__btn" type="button" data-i="${n - 1}" aria-label="View photo ${n}: ${esc(p.caption || "")}">
        <img src="${esc(sm)}" srcset="${esc(sm)} ${land ? 900 : 600}w, ${esc(s)} ${land ? 2000 : 1333}w" sizes="${slotSizes[slot]}"
          width="${land ? 900 : 600}" height="${land ? 600 : 900}" loading="lazy" decoding="async"
          style="object-position:${fx * 100}% ${Math.min(fy * 100, 50)}%" alt="${esc(fullname)}${p.caption ? ", " + esc(p.caption) : ""}" />
      </button>
      <figcaption class="label"><span class="ph__n">${pad(n)}</span><span>${esc(p.caption || "")}</span></figcaption>
    </figure>`;
  };
  chapters.forEach((ch) => {
    let items = byKey(ch.dataset.key);
    if (!items.length) { ch.hidden = true; return; }
    const startN = order.length + 1;
    // a chapter that opens with a full-bleed expansion of one of its own frames:
    // that frame is counted here, captioned on the stage, and not repeated in the grid
    const stage = ch.previousElementSibling && ch.previousElementSibling.matches(".xp") ? ch.previousElementSibling : null;
    const stageImg = stage && $(".xp__media img", stage);
    const lead = stageImg && items.find((p) => stageImg.getAttribute("src") === url(p.src));
    if (lead) {
      const n = order.push(lead);
      items = items.filter((p) => p !== lead);
      stage.insertAdjacentHTML("beforeend", `<div class="xp__cap label" style="opacity:0">
        <span><span class="ph__n">${pad(n)}</span>${esc(lead.caption || "")}</span>
        <button class="ph__btn ph__btn--text" type="button" data-i="${n - 1}" aria-label="View photo ${n}: ${esc(lead.caption || "")}">View frame</button></div>`);
    }
    let html = "", i = 0, pair = 0, lone = 0, wide = 0;
    if (ch.classList.contains("chapter--coda") && items.length === 1) {
      html += `<div class="row">${fig(items[0], "s-coda")}</div>`;
    } else {
      while (i < items.length) {
        const a = items[i], b = items[i + 1];
        if (a.fit === "landscape") { html += `<div class="row">${fig(a, wide++ % 2 ? "s-wide-i" : "s-wide")}</div>`; i += 1; }
        else if (b && b.fit !== "landscape") {
          const [c1, c2] = pair++ % 2 ? ["s-b1", "s-b2"] : ["s-a1", "s-a2"];
          html += `<div class="row">${fig(a, c1)}${fig(b, c2)}</div>`; i += 2;
        } else { html += `<div class="row">${fig(a, lone++ % 2 ? "s-lone-l" : "s-lone-r")}</div>`; i += 1; }
      }
    }
    const endN = order.length;
    const range = startN === endN ? pad(startN) : `${pad(startN)}–${pad(endN)}`;
    ch.innerHTML = `<header class="ch-head">
        <p class="label">The book <span class="muted">— ${esc(ch.dataset.no)}</span></p>
        <h2 class="ch-title">${esc(ch.dataset.title)}</h2>
        <p class="label ch-count muted">${range}</p>
      </header><div class="rows">${html}</div>`;
  });
  const total = order.length;
  if (!total) $$('a[href="#book"]').forEach((a) => a.remove());

  /* ----------------------------------------------------------- measurements */
  const statsEl = $("#stats");
  (M.stats || []).forEach(([label, metric, imperial]) => {
    const m = String(metric || "").match(/^([\d.,]+)\s*(.*)$/);
    const val = m ? `${esc(m[1])}${m[2] ? `<span class="unit">${esc(m[2])}</span>` : ""}` : esc(metric);
    statsEl.insertAdjacentHTML("beforeend",
      `<div class="st" data-reveal><dt class="label">${esc(label)}</dt><dd class="st__m${m ? "" : " is-word"}">${val}</dd><dd class="st__i">${esc(imperial || "")}</dd></div>`);
  });
  if (!statsEl.children.length) { $("#measurements").remove(); $$('a[href="#measurements"]').forEach((a) => a.remove()); }

  /* ------------------------------------------- digitals + clients, if present */
  if (M.digitals && M.digitals.length) {
    const d = $("#digitals"); d.hidden = false;
    $(".digitals__grid", d).innerHTML = M.digitals.map((x) =>
      `<figure class="ph fit-portrait"><div class="ph__btn" style="cursor:auto"><img src="${esc(url(x.src))}" alt="${esc(fullname)}, digital${x.caption ? ": " + esc(x.caption) : ""}" loading="lazy" decoding="async" width="600" height="900" /></div><figcaption class="label">${esc(x.caption || "")}</figcaption></figure>`).join("");
  } else $("#digitals").remove();
  if (M.clients && M.clients.length) {
    const c = $("#clients"); c.hidden = false;
    $(".clients__list", c).innerHTML = M.clients.map((x) => `<li>${esc(x)}</li>`).join("");
  } else $("#clients").remove();

  /* --------------------------------------------------------- copy the email */
  const copyBtn = $("[data-copy]");
  if (!email) copyBtn.remove();
  else copyBtn.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(email); copyBtn.textContent = "Copied"; }
    catch { copyBtn.textContent = email; }
    setTimeout(() => (copyBtn.textContent = "Copy email"), 2200);
  });

  /* ------------------------------------------------- fit the email to the width */
  const mail = $(".contact__mail");
  const fitMail = () => {
    if (!mail) return;
    mail.style.fontSize = "100px";
    const spans = $$("span", mail);
    const phone = matchMedia("(max-width: 700px)").matches;
    const w = phone ? Math.max(...spans.map((s) => s.getBoundingClientRect().width)) : spans.reduce((a, s) => a + s.getBoundingClientRect().width, 0);
    const avail = mail.parentElement.clientWidth - parseFloat(getComputedStyle(mail.parentElement).paddingLeft) * 2;
    mail.style.fontSize = Math.min(100 * (avail / w) * 0.985, innerWidth * 0.11) + "px";
  };

  /* --------------------------------------------------------------- lightbox */
  const lb = $("#lb"), lbImg = $(".lb__img", lb), lbCount = $(".lb__count", lb), lbCap = $(".lb__cap", lb);
  let cur = 0, lastFocus = null, lenis = null;
  const show = (i, from) => {
    cur = (i + total) % total;
    const p = order[cur];
    lbImg.src = url(small(p.src));
    const full = new Image(); full.src = url(p.src);
    full.decode().then(() => { if (order[cur] === p) lbImg.src = full.src; }).catch(() => {});
    lbImg.alt = `${fullname}${p.caption ? ", " + p.caption : ""}`;
    lbCount.textContent = `${pad(cur + 1)} / ${pad(total)}`;
    lbCap.textContent = p.caption || "";
    [cur - 1, cur + 1].forEach((j) => { const q = order[(j + total) % total]; if (q) new Image().src = url(q.src); });
    if (!reduce && window.gsap) {
      if (from) {
        lbImg.decode().catch(() => {}).then(() => {
          const a = from.getBoundingClientRect(), b = lbImg.getBoundingClientRect();
          if (!b.width) return;
          gsap.fromTo(lbImg, { x: a.left + a.width / 2 - (b.left + b.width / 2), y: a.top + a.height / 2 - (b.top + b.height / 2), scale: a.height / b.height },
            { x: 0, y: 0, scale: 1, duration: 0.9, ease: "expo.out" });
        });
      } else gsap.fromTo(lbImg, { opacity: 0.2 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    }
  };
  const open = (i, from) => {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.documentElement.style.overflow = "hidden";
    lenis && lenis.stop();
    show(i, from && $("img", from));
    if (!reduce && window.gsap) gsap.fromTo(lb, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    $(".lb__close", lb).focus({ preventScroll: true });
  };
  const close = () => {
    lb.hidden = true;
    document.documentElement.style.overflow = "";
    lenis && lenis.start();
    lastFocus && lastFocus.focus({ preventScroll: true });
  };
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".ph__btn[data-i]");
    if (b) open(+b.dataset.i, b);
  });
  $(".lb__prev", lb).addEventListener("click", () => show(cur - 1));
  $(".lb__next", lb).addEventListener("click", () => show(cur + 1));
  $(".lb__close", lb).addEventListener("click", close);
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb__fig")) close(); });
  lbImg.addEventListener("click", (e) => {
    if (moved) return;
    const r = lbImg.getBoundingClientRect();
    show(e.clientX < r.left + r.width / 3 ? cur - 1 : cur + 1);
  });
  let sx = 0, sy = 0, moved = false;
  lb.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; moved = false; });
  lb.addEventListener("pointerup", (e) => {
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { moved = true; show(dx < 0 ? cur + 1 : cur - 1); }
    else if (dy > 90 && e.pointerType !== "mouse") { moved = true; close(); }
  });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(cur + 1);
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "Tab") {
      const f = $$("button", lb); const i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });

  /* ------------------------------------------------------- film play / pause */
  const toggle = $(".film__toggle");
  let userPaused = reduce;
  const syncToggle = () => { if (!toggle) return; toggle.textContent = video.paused ? "Play" : "Pause"; toggle.setAttribute("aria-pressed", String(video.paused)); };
  if (film && video) {
    toggle.hidden = false;
    video.addEventListener("play", syncToggle); video.addEventListener("pause", syncToggle);
    toggle.addEventListener("click", () => { if (video.paused) { userPaused = false; video.play().catch(() => {}); } else { userPaused = true; video.pause(); } });
    syncToggle();
    // the film holds on its first frame while the window opens in the words,
    // and starts rolling as the window grows to full bleed (see filmGate below)
    new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) video.pause();
      else if (!userPaused && (reduce || !window.gsap)) video.play().catch(() => {});
    }, { threshold: 0.15 }).observe(film);
  }

  /* -------------------------------------------------------------- reveals */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* ================================================================ EXPANSION
     a = how far the window inside the line has opened (0..1)
     b = how far that window has grown to full bleed (0..1)                  */
  class Expansion {
    constructor(el, { s0 = 1.2, push = 0.85, eyeLine = 0.32, fadeExtras = [] } = {}) {
      this.eyeLine = eyeLine;
      this.el = el;
      this.win = $(".xp-win", el);
      this.media = $(".xp__media", el);
      this.m = $("img, video", this.media);
      this.words = $$(".xp-w", el);
      this.cap = $(".xp__cap", el);
      this.extras = fadeExtras;
      this.s0 = s0; this.push = push;
      this.a = 0; this.b = 0; this.vec = []; this.hideWords = false;
      const set = () => this.measure();
      this.m.addEventListener(this.m.tagName === "VIDEO" ? "loadedmetadata" : "load", set);
    }
    dims() {
      const m = this.m;
      return [m.naturalWidth || m.videoWidth || +m.getAttribute("width") || 16, m.naturalHeight || m.videoHeight || +m.getAttribute("height") || 9];
    }
    measure() {
      if (this.moved) this.words.forEach((w) => (w.style.transform = ""));
      this.el.style.setProperty("--open", 1);
      const wr = this.win.getBoundingClientRect();
      const cx = wr.left + wr.width / 2, cy = wr.top + wr.height / 2;
      this.D = Math.hypot(this.el.clientWidth, this.el.clientHeight) * 0.5;
      this.vec = this.words.map((w) => {
        const r = w.getBoundingClientRect();
        let dx = r.left + r.width / 2 - cx, dy = (r.top + r.height / 2 - cy) * 1.6;
        const l = Math.hypot(dx, dy) || 1;
        return [dx / l, dy / l];
      });
      this.render(this.a, this.b);
    }
    render(a, b) {
      this.a = a; this.b = b;
      const ea = ease.io(clamp(a)), eb = ease.io(clamp(b)), k = 1 - eb;
      this.el.style.setProperty("--open", ea.toFixed(4));
      const W = this.el.clientWidth, H = this.el.clientHeight;
      const sr = this.el.getBoundingClientRect(), wr = this.win.getBoundingClientRect();
      const L = wr.left - sr.left, T = wr.top - sr.top, R = W - (wr.right - sr.left), B = H - (wr.bottom - sr.top);
      this.media.style.clipPath = ea <= 0.0005 && eb === 0 ? "inset(50% 50% 50% 50%)" : `inset(${(T * k).toFixed(2)}px ${(R * k).toFixed(2)}px ${(B * k).toFixed(2)}px ${(L * k).toFixed(2)}px)`;

      // crop so the eyes sit high in the full-bleed frame, aim them at the window,
      // then let the frame settle as it opens
      const [fx, fy] = (this.m.dataset.face || "0.5 0.3").split(" ").map(Number);
      const [iw, ih] = this.dims();
      const sc = Math.max(W / iw, H / ih), rw = iw * sc, rh = ih * sc;
      const ox = clamp(W * 0.5 - fx * rw, W - rw, 0), oy = clamp(H * this.eyeLine - fy * rh, H - rh, 0);
      const pos = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
      if (this.pos !== pos) { this.m.style.objectPosition = pos; this.pos = pos; }
      const faceX = ox + fx * rw, faceY = oy + fy * rh;
      const s = lerp(this.s0 + 0.12 * (1 - ea), 1, eb);
      const wcx = L + (W - L - R) / 2, wcy = T + (H - T - B) / 2;
      let tx = (wcx - faceX) * k, ty = (wcy - faceY) * k;
      const cl = L * k, cr = W - R * k, ct = T * k, cb = H - B * k;
      const fit = (t, lo, hi) => (lo <= hi ? clamp(t, lo, hi) : t);
      tx = fit(tx, cr - faceX - (W - faceX) * s, cl - faceX + faceX * s);
      ty = fit(ty, cb - faceY - (H - faceY) * s, ct - faceY + faceY * s);
      this.m.style.transformOrigin = `${faceX}px ${faceY}px`;
      this.m.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;

      // the words are pushed out of frame by the opening image
      const mv = ease.in(clamp(b * 1.15)) * this.D * this.push;
      const op = this.hideWords ? 0 : 1 - clamp((b - 0.45) / 0.4);
      if (mv > 0.1 || this.moved || op < 1 || this.faded) {
        this.words.forEach((w, i) => {
          const [vx, vy] = this.vec[i] || [0, 0];
          w.style.transform = mv > 0.1 ? `translate3d(${(vx * mv).toFixed(1)}px, ${(vy * mv).toFixed(1)}px, 0)` : "";
          w.style.opacity = op < 1 ? op : "";
        });
        this.moved = mv > 0.1; this.faded = op < 1;
      }
      const xo = 1 - clamp(b / 0.25);
      this.extras.forEach((x) => (x.style.opacity = xo));
      if (this.cap) {
        const ci = clamp((b - 0.82) / 0.18);
        this.cap.style.opacity = ci;
        this.cap.style.visibility = ci > 0 ? "visible" : "hidden";
      }
    }
  }

  /* ============================================================ BOOT MOTION */
  const boot = () => {
    fitMail();
    addEventListener("resize", fitMail);
    const hasGsap = window.gsap && window.ScrollTrigger;
    const heroEl = $('[data-xp="hero"]'), briefEl = $('[data-xp="brief"]'), filmEl = $('[data-xp="film"]');
    const hero = heroEl && new Expansion(heroEl, { s0: 1.1, push: 0.9, fadeExtras: [$(".hero__meta", heroEl)] });
    const brief = briefEl && new Expansion(briefEl, { s0: 1.25, push: 0.8 });
    const filmX = filmEl && new Expansion(filmEl, { s0: 1.2, push: 0.8 });
    const all = [hero, brief, filmX].filter(Boolean);
    all.forEach((x) => x.measure());

    // say: in-flow opening, like the template's centred effect
    const say = $("[data-say]");
    const renderSay = (p) => {
      const e = ease.io(clamp(p));
      say.style.setProperty("--open", e.toFixed(4));
      say.style.setProperty("--s", lerp(1.45, 1.02, e).toFixed(4));
    };

    if (reduce || !hasGsap) {
      document.documentElement.classList.add("reduce");
      hero && hero.render(1, 0);
      brief && brief.render(1, 0);
      $$(".xp__cap").forEach((c) => { c.style.opacity = 1; c.style.visibility = "visible"; });
      if (filmX) { filmX.hideWords = true; filmX.render(1, 1); }
      renderSay(1);
      addEventListener("resize", () => { all.forEach((x) => x.measure()); });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    lenis = new Lenis({ lerp: 0.11 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);

    // anchors through Lenis
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      const t = id === "#top" ? 0 : $(id);
      if (t === null) return;
      e.preventDefault();
      lenis.scrollTo(t, { duration: 1.6 });
    });

    // HERO: the name opens on arrival; scrolling takes the close-up to full bleed
    if (hero) {
      const st = { a: 0, b: 0 };
      heroEl.classList.add("is-masked");
      hero.render(0, 0);
      const tl = gsap.timeline({ delay: 0.25 });
      tl.from(hero.words, { yPercent: 108, duration: 1.5, ease: "expo.out", stagger: 0.09 })
        .from([".bar", ".hero__meta"], { opacity: 0, duration: 1.2, ease: "power2.out" }, 0.5)
        .to(st, { a: 1, duration: 1.7, ease: "expo.inOut", onUpdate: () => hero.render(st.a, st.b) }, 0.55)
        .add(() => heroEl.classList.remove("is-masked"));
      ScrollTrigger.create({
        trigger: heroEl, pin: true, start: "top top", end: "+=130%",
        onUpdate: (self) => {
          st.b = self.progress;
          if (st.b > 0) heroEl.classList.remove("is-masked");
          hero.render(st.a, st.b);
        },
      });
    }

    const pinned = (x, len, gate) => ScrollTrigger.create({
      trigger: x.el, pin: true, start: "top top", end: `+=${len}%`,
      onUpdate: (self) => {
        const p = self.progress, b = clamp((p - 0.36) / 0.52);
        x.render(clamp(p / 0.3), b);
        gate && gate(b);
      },
    });
    brief && pinned(brief, 210);
    const filmGate = (b) => {
      if (b > 0.02) { if (video.paused && !userPaused) video.play().catch(() => {}); }
      else if (!video.paused) { video.pause(); video.currentTime = 0; }
    };
    filmX && pinned(filmX, 210, filmGate);

    ScrollTrigger.create({ trigger: say, start: "top 82%", end: "top 18%", onUpdate: (s) => renderSay(s.progress) });
    renderSay(0);
    gsap.fromTo(".say__body", { y: 70 }, { y: -50, ease: "none", scrollTrigger: { trigger: say, start: "top bottom", end: "bottom top", scrub: true } });

    // nav state
    $$(".bar__nav a").forEach((a) => {
      const t = $(a.getAttribute("href"));
      t && ScrollTrigger.create({ trigger: t, start: "top 50%", end: "bottom 50%", onToggle: (s) => a.classList.toggle("is-on", s.isActive) });
    });

    ScrollTrigger.addEventListener("refresh", () => all.forEach((x) => x.measure()));
    ScrollTrigger.refresh();
  };

  const fontsReady = document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]) : Promise.resolve();
  fontsReady.then(boot);
})();
