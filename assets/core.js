/* Shared, dependency-free motion toolkit for all concepts. */
(function () {
  const M = window.MODEL;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const base = document.documentElement.dataset.base || "";
  const url = (p) => (/^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : base + p);

  /* ---------- scroll loop (one rAF for everything) ---------- */
  const subs = [];
  let ticking = false;
  const run = () => { ticking = false; for (const f of subs) f(scrollY, innerHeight); };
  const onFrame = (f) => { subs.push(f); f(scrollY, innerHeight); };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  addEventListener("resize", () => requestAnimationFrame(run));
  /* progress of el through the viewport: 0 when its top hits the bottom, 1 when its bottom hits the top */
  const progress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp((innerHeight - r.top) / (innerHeight + r.height));
  };
  /* progress through a sticky track: 0 at start of pin, 1 at end */
  const pinProgress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  };

  /* ---------- reveals ---------- */
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { rootMargin: "0px 0px -12% 0px" }
  );
  const reveal = (root = document) => $$("[data-reveal]", root).forEach((el) => io.observe(el));

  /* split text into masked words/chars for staggered rises */
  const split = (el, by = "word") => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";
    const parts = by === "char" ? [...text] : text.split(/(\s+)/);
    let i = 0;
    parts.forEach((p) => {
      if (/^\s+$/.test(p)) { el.append(" "); return; }
      const o = document.createElement("span"); o.className = "sx"; o.setAttribute("aria-hidden", "true");
      const n = document.createElement("span"); n.className = "sx-i"; n.textContent = p === " " ? " " : p;
      n.style.setProperty("--i", i++);
      o.append(n); el.append(o);
    });
    return el;
  };

  /* ---------- custom cursor ---------- */
  const cursor = () => {
    if (!fine || reduce) return;
    const c = document.createElement("div");
    c.className = "cur"; c.innerHTML = '<span class="cur-l"></span>';
    document.body.append(c);
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; c.classList.add("on"); });
    document.addEventListener("pointerleave", () => c.classList.remove("on"));
    (function loop() { cx = lerp(cx, x, 0.2); cy = lerp(cy, y, 0.2); c.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
    document.addEventListener("pointerover", (e) => {
      const t = e.target.closest("[data-cursor]");
      c.classList.toggle("big", !!t);
      c.querySelector(".cur-l").textContent = t ? t.dataset.cursor : "";
      c.classList.toggle("link", !t && !!e.target.closest("a,button"));
    });
  };

  /* ---------- magnetic elements ---------- */
  const magnetic = (sel = "[data-magnetic]") => {
    if (!fine || reduce) return;
    $$(sel).forEach((el) => {
      const s = +el.dataset.magnetic || 0.3;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * s}px,${(e.clientY - r.top - r.height / 2) * s}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  };

  /* ---------- lightbox ---------- */
  let lb;
  const lightbox = (list, start) => {
    if (!lb) {
      lb = document.createElement("div");
      lb.className = "lb";
      lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Photo viewer");
      lb.innerHTML = '<img alt=""><p class="lb-cap"></p><button class="lb-x" aria-label="Close">Close</button><button class="lb-p" aria-label="Previous" data-cursor="Prev"></button><button class="lb-n" aria-label="Next" data-cursor="Next"></button>';
      document.body.append(lb);
      lb.querySelector(".lb-x").onclick = () => close();
      lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    }
    let i = start;
    const img = lb.querySelector("img"), cap = lb.querySelector(".lb-cap");
    const show = () => {
      img.classList.remove("ld"); img.src = url(list[i].src); img.alt = list[i].caption || "";
      cap.textContent = `${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")} — ${list[i].caption || ""}`;
    };
    img.onload = () => img.classList.add("ld");
    const go = (d) => { i = (i + d + list.length) % list.length; show(); };
    lb.querySelector(".lb-p").onclick = () => go(-1);
    lb.querySelector(".lb-n").onclick = () => go(1);
    const key = (e) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    let tx = 0;
    lb.ontouchstart = (e) => (tx = e.touches[0].clientX);
    lb.ontouchend = (e) => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); };
    function close() { lb.classList.remove("open"); document.removeEventListener("keydown", key); document.documentElement.style.overflow = ""; }
    document.addEventListener("keydown", key);
    document.documentElement.style.overflow = "hidden";
    show(); lb.classList.add("open"); lb.querySelector(".lb-x").focus();
  };

  /* ---------- preloader: waits for hero media, min duration for the moment ---------- */
  const preload = (srcs, onTick, min = 1400) =>
    new Promise((res) => {
      let done = 0; const t0 = performance.now(); let shown = 0;
      const total = srcs.length || 1;
      srcs.forEach((s) => { const im = new Image(); im.onload = im.onerror = () => done++; im.src = url(s); });
      (function loop() {
        const target = Math.min(done / total, (performance.now() - t0) / min);
        shown = lerp(shown, target, 0.12);
        onTick(Math.round(shown * 100));
        if (shown > 0.995) { onTick(100); res(); } else requestAnimationFrame(loop);
      })();
      if (reduce) { onTick(100); res(); }
    });

  /* lazy autoplaying muted video that pauses offscreen (saves battery/bandwidth) */
  const smartVideo = (v) => {
    new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.15 }).observe(v);
  };

  const mail = () => `mailto:${M.email}?subject=${encodeURIComponent("Booking enquiry — " + M.first + " " + M.last)}`;
  const ig = () => `https://instagram.com/${M.instagram}`;
  const pad = (n) => String(n).padStart(2, "0");
  const sm = (p) => url(p.replace(/\.jpg$/, "-sm.jpg"));
  const byKey = (...keys) => keys.flatMap((k) => M.photos.filter((p) => p.key === k));

  window.K = { M, $, $$, clamp, lerp, url, reduce, fine, onFrame, progress, pinProgress, reveal, split, cursor, magnetic, lightbox, preload, smartVideo, mail, ig, pad, sm, byKey };
})();
