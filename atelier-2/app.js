/* Atelier II — Richie Miller. All content from ../assets/content.js (window.MODEL). */
(() => {
"use strict";
const M = window.MODEL;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const U = (p) => (/^(https?:)?\/\//.test(p) || p.startsWith("/") ? p : "../" + p);
const SM = (p) => U(p.replace(/\.jpg$/i, "-sm.jpg"));
const pad = (n) => String(n).padStart(2, "0");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const html = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(pointer: fine)").matches;
const full = `${M.first} ${M.last}`;
const mail = () => `mailto:${M.email}?subject=${encodeURIComponent("Booking enquiry — " + full)}`;
const ig = `https://instagram.com/${M.instagram}`;
const KEYS = { light: "High key", dark: "Low key", colour: "Colour" };
const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
const WORDS = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty".split(" ");
const word = (n) => WORDS[n] || String(n);
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
CustomEase.create("io", "0.76,0,0.24,1");
CustomEase.create("o", "0.16,1,0.3,1");
gsap.defaults({ ease: "o" });

/* ---------------- smooth scroll ---------------- */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.095, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const scrollToY = (y, d = 1.4) => {
  if (lenis) lenis.scrollTo(y, { duration: d, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
  else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
};
const lock = (on) => { if (lenis) on ? lenis.stop() : lenis.start(); html.style.overflow = on ? "hidden" : ""; };

/* ---------------- the model: plates, chapters, pages ---------------- */
const P = M.photos.map((p, i) => ({ ...p, n: i + 1 }));
const cover = P.find((p) => p.src === M.heroLight) || P[0];
const order = [];
P.forEach((p) => { if (!order.includes(p.key)) order.push(p.key); });
const chapters = order.map((k, i) => ({ key: k, roman: ROMAN[i] || String(i + 1), title: KEYS[k] || cap1(k), all: P.filter((p) => p.key === k), photos: P.filter((p) => p.key === k && p !== cover) }));

const BOOK_START = 4;               // 1 cover, 2–3 contents
const pages = [];
let lastCh = chapters[0];
chapters.forEach((ch) => {
  if (!ch.photos.length) return;
  if (pages.length % 2) pages.push({ type: "blank", ch: lastCh });   // openers always fall on a verso
  pages.push({ type: "opener", ch });
  let spread = false;
  ch.photos.forEach((p) => {
    if (p.fit === "landscape" && pages.length % 2 === 0 && !spread) { spread = true; pages.push({ type: "spread", p, ch, half: 0 }, { type: "spread", p, ch, half: 1 }); }
    else pages.push({ type: "photo", p, ch });
  });
  lastCh = ch;
});
if (pages.length % 2) pages.push({ type: "blank", ch: lastCh });
pages.forEach((pg, i) => (pg.no = BOOK_START + i));
/* art direction per spread: one bleed, one plate; landscapes sit as plates; alternate sides for rhythm */
let alt = 0;
for (let i = 0; i < pages.length; i += 2) {
  const L = pages[i], R = pages[i + 1];
  const ph = [L, R].filter((x) => x.type === "photo");
  if (ph.length === 2) {
    const land = ph.filter((x) => x.p.fit === "landscape");
    if (land.length === 1) { land[0].style = "plate"; ph.find((x) => x !== land[0]).style = "bleed"; }
    else if (land.length === 2) { L.style = R.style = "plate"; }
    else { L.style = alt ? "bleed" : "plate"; R.style = alt ? "plate" : "bleed"; alt ^= 1; }
  } else ph.forEach((x) => (x.style = x.p.fit === "landscape" ? "plate" : "bleed"));
}
const LAST = pages.length ? pages[pages.length - 1].no : BOOK_START - 1;
const FOLIO = { contents: [2, 3], book: [BOOK_START, LAST], film: [LAST + 1, LAST + 2], stats: [LAST + 3, LAST + 4] };
const pageOf = (p) => pages.findIndex((pg) => pg.p === p);
const refOf = (p) => {
  if (p === cover) return "Cover";
  const i = pageOf(p); if (i < 0) return "";
  return pages[i].type === "spread" ? `${pages[i].no}–${pages[i].no + 1}` : String(pages[i].no);
};
const chRange = (ch) => {
  const ps = pages.filter((pg) => pg.ch === ch && pg.type !== "blank");
  const nums = ch.photos.map((p) => p.n);
  return { pages: ps.length ? `${ps[0].no}–${ps[ps.length - 1].no}` : "", plates: nums.length > 1 ? `${pad(nums[0])}–${pad(nums[nums.length - 1])}` : pad(nums[0] || 0), count: ch.all.length };
};

/* ---------------- static copy ---------------- */
$("#nav-r").textContent = `${M.role}, ${M.city}`;
const NAV = [["#contents", "Contents", FOLIO.contents[0]], ["#book", "Book", FOLIO.book[0]], ["#film", "Film", FOLIO.film[0]], ["#stats", "Measurements", FOLIO.stats[0]], ["#contact", "Contact", ""]];
$("#nav-l").innerHTML = NAV.map(([h, t, n]) => `<li><a href="${h}">${t}${n ? `<sup>${n}</sup>` : ""}</a></li>`).join("");
$("#menu-l").innerHTML = NAV.map(([h, t, n]) => `<li><a href="${h}"><span class="m">${t}</span><span class="a a-m">${n ? "p. " + n : "Back cover"}</span></a></li>`).join("");
$("#menu-f").textContent = `${M.role}, ${M.city}. ${M.available}.`;
$("#cv-city").textContent = M.city;
$("#cv-av").textContent = M.available;
$("#cv-st").textContent = M.statement.replace(/\s+—\s+/g, ", ").replace(/\s*,\s*,/g, ",");
const cvIm = $("#cv-im");
cvIm.src = U(cover.src); cvIm.alt = `${full} — ${cover.caption}`;
const nameHTML = (s) => s.split(" ").map((w) => `<span class="w"><span class="wi">${esc(w)}</span></span>`).join(" ");
const cvName = $("#cv-name");
cvName.innerHTML = `<span class="nm-in">${nameHTML(full)}</span>`; cvName.setAttribute("aria-label", full);
$("#bk-name").innerHTML = `<span class="nm-in">${esc(full)}</span>`;

const foot = (l, r, ml = full, mr = "") => `<span class="fo">${l}</span><span class="rh fl">${ml}</span><span class="rh fr">${mr}</span><span class="fo">${r}</span>`;
$("#toc-f").innerHTML = foot(FOLIO.contents[0], FOLIO.contents[1], full, "Contents");
$("#film-f").innerHTML = foot(FOLIO.film[0], FOLIO.film[1], full, "Studio film");
$("#stats-f").innerHTML = foot(FOLIO.stats[0], FOLIO.stats[1], full, "Measurements");
$("#toc-p").textContent = `${cap1(word(P.length))} plates in ${word(chapters.length)} chapters: ${chapters.map((c) => c.title.toLowerCase()).join(", ").replace(/, ([^,]*)$/, " and $1")}. ${fine ? "Hover a title to see the frame, select it to turn to its page." : "Tap a title to turn to its page."}`;

/* measurements */
$("#tbl").innerHTML = M.stats.map((s) => `<div class="tbl-r"><span class="a a-m">${esc(s[0])}</span>${s[2] ? `<span class="v">${esc(s[1])}</span><span class="v i">${esc(s[2])}</span>` : `<span class="v w2">${esc(s[1])}</span>`}</div>`).join("");
$("#stats-p").innerHTML = M.digitals && M.digitals.length
  ? `Comp-card figures in metric and imperial. Natural-light digitals follow.`
  : `Comp-card figures in metric and imperial. Natural-light digitals are <a class="ul" href="${mail()}">available on request</a>.`;

/* back cover */
const bm = $("#bk-mail"); bm.textContent = M.email; bm.href = mail();
$("#bk-m").href = mail(); $("#bk-ig").href = ig; $("#bk-ig").textContent = `Instagram @${M.instagram}`;
$("#bk-city").textContent = M.city; $("#bk-av").textContent = M.available;
$("#bk-ag").innerHTML = M.agency && M.agency.url ? `<a class="ul" href="${esc(M.agency.url)}" target="_blank" rel="noopener">${esc(M.agency.name)}</a>` : esc((M.agency && M.agency.name) || "Independent");
$("#bk-cc").innerHTML = M.compCard ? `<a class="ul" href="${esc(U(M.compCard))}" download>Download PDF</a>` : `<a class="ul" href="${mail()}">On request</a>`;
$("#bk-c").textContent = `© ${new Date().getFullYear()} ${full}`;
const cp = $("#bk-copy");
cp.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(M.email); cp.textContent = "Address copied"; } catch (e) { location.href = mail(); return; }
  setTimeout(() => (cp.textContent = "Copy address"), 1800);
});

/* ---------------- name fitting: the name always spans the measure exactly ---------------- */
const fit = (el) => {
  const inner = $(".nm-in", el); if (!inner) return;
  el.style.fontSize = "100px";
  const w = inner.getBoundingClientRect().width;
  const target = el.parentElement.clientWidth - parseFloat(getComputedStyle(el.parentElement).paddingLeft) - parseFloat(getComputedStyle(el.parentElement).paddingRight);
  el.style.fontSize = (100 * target / (w - 4.5)) + "px";   // the R hangs .035em into the margin (optical alignment)
};
const fitAll = () => { fit(cvName); fit($("#bk-name")); };

/* ---------------- contents ---------------- */
const rowsEl = $("#rows");
chapters.forEach((ch) => {
  const r = chRange(ch);
  rowsEl.insertAdjacentHTML("beforeend", `<div class="toc-ch a"><span>${ch.roman}</span><span>${esc(ch.title)}</span><span>${r.pages ? "pp. " + r.pages : ""}</span></div>`);
  ch.all.forEach((p) => {
    const ref = refOf(p);
    rowsEl.insertAdjacentHTML("beforeend", `<a class="row" href="#book" data-n="${p.n}"><span class="a n">${pad(p.n)}</span><span class="ti">${esc(p.caption)}</span><span class="a ft">${esc(p.fit)}</span><span class="th"><img src="${SM(p.src)}" alt="" loading="lazy" decoding="async"></span><span class="a rf">${ref === "Cover" ? "Cover" : (fine && innerWidth > 759 ? "p. " : "") + ref.split("–")[0]}</span></a>`);
  });
});

/* cursor-follow preview */
const fl = $("#float"), flc = $("#float-c");
const flImgs = {};
P.forEach((p) => { const im = new Image(); im.alt = ""; im.decoding = "async"; im.src = SM(p.src); flc.append(im); flImgs[p.n] = im; });
if (fine && !reduce) {
  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, vx = 0, rot = 0, z = 1, on = false, lastRow = null;
  addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  const show = () => { if (on) return; on = true; cx = tx; cy = ty; gsap.set(fl, { visibility: "visible" }); gsap.to(flc, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "o", overwrite: true }); };
  const hide = () => { on = false; rowsEl.classList.remove("hov"); $$(".row.on", rowsEl).forEach((r) => r.classList.remove("on")); lastRow = null; gsap.to(flc, { clipPath: "inset(50% 50% 50% 50%)", duration: 0.55, ease: "power3.in", overwrite: true, onComplete: () => { if (!on) gsap.set(fl, { visibility: "hidden" }); } }); };
  $$(".row", rowsEl).forEach((row, idx) => {
    row.addEventListener("pointerenter", () => {
      const dir = lastRow == null ? 1 : idx > lastRow ? 1 : -1; lastRow = idx;
      rowsEl.classList.add("hov"); $$(".row.on", rowsEl).forEach((r) => r.classList.remove("on")); row.classList.add("on");
      const im = flImgs[row.dataset.n]; im.style.zIndex = ++z;
      gsap.fromTo(im, { clipPath: dir > 0 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)", scale: 1.18 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.85, ease: "o", overwrite: true });
      show();
    });
  });
  rowsEl.addEventListener("pointerleave", hide);
  gsap.ticker.add(() => {
    if (!on && fl.style.visibility !== "visible") return;
    const nx = cx + (tx - cx) * 0.13; vx = nx - cx; cx = nx; cy += (ty - cy) * 0.13;
    rot += (clamp(vx * 0.22, -7, 7) - rot) * 0.12;
    const w = fl.offsetWidth, h = fl.offsetHeight;
    const x = Math.min(cx + 36, innerWidth - w - 24);
    fl.style.transform = `translate3d(${x}px,${cy - h * 0.55}px,0) rotate(${rot}deg)`;
  });
} else {
  fl.remove();
}

/* ---------------- the book ---------------- */
const bookEl = $("#book");
const capHTML = (p) => `<span class="cap"><span class="pl">${pad(p.n)}</span><span class="ct">${esc(p.caption)}</span></span>`;
const footHTML = (no, side, mid) => `<div class="foot">${side === "l" ? `<span class="fo">${no}</span><span class="rh">${mid}</span>` : `<span class="rh">${mid}</span><span class="fo">${no}</span>`}</div>`;
let deferImgs = true;
const imgTag = (p, big, lazy) => {
  const src = big ? U(p.src) : SM(p.src);
  const a = `alt="${esc(full + " — " + p.caption)}" decoding="async"`;
  if (lazy) return `<img src="${src}" ${a} loading="lazy">`;
  return deferImgs ? `<img data-src="${src}" ${a}>` : `<img src="${src}" ${a}>`;
};
function pageHTML(pg, side, mode) {
  const lazy = mode === "deck";
  const run = side === "l" ? full : `${pg.ch.roman}. ${pg.ch.title}`;
  const p = pg.p;
  if (pg.type === "opener") {
    const r = chRange(pg.ch);
    return `<div class="op"><span class="op-n" aria-hidden="true">${pg.ch.roman}</span><div class="op-b"><h3 class="op-t">${esc(pg.ch.title)}</h3><span class="a op-s">${r.count === 1 ? "Plate" : "Plates"} ${r.plates}</span></div></div>` + footHTML(pg.no, side, run);
  }
  if (pg.type === "blank") return footHTML(pg.no, side, run);
  if (pg.type === "spread") {
    if (mode === "deck") return `<figure class="plate landscape" data-n="${p.n}" data-cursor="View"><div class="pi">${imgTag(p, true, lazy)}</div><figcaption>${capHTML(p)}</figcaption></figure>` + footHTML(`${pg.no}–${pg.no + 1}`, side, run);
    return `<figure class="bleed sp h${pg.half}" data-n="${p.n}" data-cursor="View">${imgTag(p, true, false)}</figure>` + footHTML(pg.no, side, pg.half ? capHTML(p) : run);
  }
  if (pg.style === "bleed") return `<figure class="bleed" data-n="${p.n}" data-cursor="View">${imgTag(p, true, lazy)}</figure>` + footHTML(pg.no, side, capHTML(p));
  return `<figure class="plate ${p.fit}" data-n="${p.n}" data-cursor="View"><div class="pi">${imgTag(p, false, lazy)}</div><figcaption>${capHTML(p)}</figcaption></figure>` + footHTML(pg.no, side, run);
}
const cls = (pg, side) => `pg ${side}${pg.ch && pg.ch.key === "dark" ? " dk" : ""}`;
const spreads = []; for (let i = 0; i < pages.length; i += 2) spreads.push([pages[i], pages[i + 1]]);

let book = { mode: "", st: null, goto: () => {}, kill: () => {} };
const FLIPQ = "(min-width: 900px) and (min-aspect-ratio: 23/20)";

function buildFlip() {
  const n = spreads.length;
  bookEl.innerHTML = `<div class="stage" id="stage">
    <div class="${cls(spreads[0][0], "l")}">${pageHTML(spreads[0][0], "l", "flip")}<i class="cs"></i></div>
    <div class="${cls(spreads[n - 1][1], "r")}">${pageHTML(spreads[n - 1][1], "r", "flip")}<i class="cs"></i></div>
    ${spreads.slice(0, -1).map((s, j) => `<div class="leaf" style="z-index:${300 - j}"><div class="face fr ${cls(s[1], "r")}">${pageHTML(s[1], "r", "flip")}<i class="cs"></i><i class="sh"></i></div><div class="face bk ${cls(spreads[j + 1][0], "l")}">${pageHTML(spreads[j + 1][0], "l", "flip")}<i class="cs"></i><i class="sh"></i></div></div>`).join("")}
    <i class="gut"></i><span class="book-hint a" id="hint">Scroll to turn the page</span></div>`;
  const stage = $("#stage", bookEl);
  const baseL = stage.children[0], baseR = stage.children[1];
  const leaves = $$(".leaf", stage).map((el) => ({ el, fr: $(".fr", el), bk: $(".bk", el), shF: $(".fr .sh", el), shB: $(".bk .sh", el), csF: $(".fr .cs", el), csB: $(".bk .cs", el) }));
  const csL = (k) => (k === 0 ? $(".cs", baseL) : leaves[k - 1].csB);     // left page under turning leaf k
  const csR = (k) => (k + 1 < leaves.length ? leaves[k + 1].csF : $(".cs", baseR));
  const hint = $("#hint");
  const ease = (a) => { const f = clamp((a - 0.04) / 0.92); return 0.5 - 0.5 * Math.cos(Math.PI * f); };
  let lastCs = [];
  const render = (t) => {
    const persp = Math.max(1800, innerWidth * 1.9);
    leaves.forEach((L, j) => {
      const e = ease(clamp(t - j));
      L.el.style.transform = `perspective(${persp}px) rotateY(${(-180 * e).toFixed(3)}deg)`;
      L.el.style.zIndex = e > 0 && e < 1 ? 1000 : e >= 1 ? 300 + j : 300 - j;
      L.el.style.visibility = Math.abs(t - j) < 2.05 ? "visible" : "hidden";
      L.shF.style.opacity = e < 0.5 ? (e * 0.55).toFixed(3) : 0;
      L.shB.style.opacity = e > 0.5 ? ((1 - e) * 0.55).toFixed(3) : 0;
    });
    lastCs.forEach((c) => (c.style.opacity = 0)); lastCs = [];
    const k = clamp(Math.floor(t), 0, leaves.length - 1);
    if (leaves.length) {
      const e = ease(clamp(t - k));
      if (e > 0 && e < 0.5) { const c = csR(k); c.style.opacity = ((1 - 2 * e) * Math.min(1, e * 14) * 0.5).toFixed(3); lastCs.push(c); }
      if (e > 0.5 && e < 1) { const c = csL(k); c.style.opacity = ((2 * e - 1) * Math.min(1, (1 - e) * 14) * 0.5).toFixed(3); lastCs.push(c); }
    }
    hint.style.opacity = t < 0.15 ? 1 : 0;
  };
  render(0);
  const st = ScrollTrigger.create({
    trigger: bookEl, start: "top top", end: () => "+=" + Math.max(1, n - 1) * innerHeight, pin: true, anticipatePin: 1,
    onUpdate: (self) => render(self.progress * (n - 1)),
    onRefresh: (self) => render(self.progress * (n - 1)),
  });
  const yFor = (s) => st.start + (n > 1 ? s / (n - 1) : 0) * (st.end - st.start);
  const onEnd = () => {
    if (lbOpen || !st.isActive || window.__noSnap) return;
    const t = st.progress * (n - 1), r = Math.round(t);
    if (Math.abs(t - r) < 0.003) return;
    scrollToY(yFor(r), 0.6 + 0.6 * Math.abs(t - r));
  };
  ScrollTrigger.addEventListener("scrollEnd", onEnd);
  const key = (e) => {
    if (lbOpen || !st.isActive || !/Arrow(Left|Right)/.test(e.key)) return;
    e.preventDefault();
    const t = Math.round(st.progress * (n - 1)) + (e.key === "ArrowRight" ? 1 : -1);
    scrollToY(yFor(clamp(t, 0, n - 1)), 0.9);
  };
  addEventListener("keydown", key);
  book = {
    mode: "flip", st,
    goto: (pi) => scrollToY(yFor(Math.floor(pi / 2)), 1.8),
    kill: () => { ScrollTrigger.removeEventListener("scrollEnd", onEnd); removeEventListener("keydown", key); st.kill(true); },
  };
}

function buildDeck() {
  const list = pages.filter((pg) => !(pg.type === "spread" && pg.half === 1));
  bookEl.innerHTML = `<div class="deck">${list.map((pg) => { const side = pg.no % 2 ? "r" : "l"; return `<div class="dp" data-pi="${pages.indexOf(pg)}"><div class="${cls(pg, side)}">${pageHTML(pg, side, "deck")}</div><i class="dim"></i></div>`; }).join("")}</div>`;
  const deck = $(".deck", bookEl), dps = $$(".dp", deck);
  const top = () => deck.getBoundingClientRect().top + scrollY;
  const H = () => dps[0].offsetHeight;
  const tws = [];
  if (!reduce) dps.forEach((dp, i) => {
    if (i === dps.length - 1) return;
    tws.push(gsap.timeline({ scrollTrigger: { trigger: deck, start: () => top() + i * H(), end: () => top() + (i + 1) * H(), scrub: true, invalidateOnRefresh: true } })
      .to($(".pg", dp), { scale: 0.9, yPercent: -2, ease: "none" }, 0)
      .to($(".dim", dp), { opacity: 0.5, ease: "none" }, 0));
  });
  book = {
    mode: "deck", st: null,
    goto: (pi) => { const i = dps.findIndex((d) => +d.dataset.pi === pi || +d.dataset.pi === pi - 1 && pages[pi].type === "spread"); scrollToY(top() + Math.max(0, i) * H(), 1.6); },
    kill: () => tws.forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); }),
  };
}

function buildStatic() {
  bookEl.innerHTML = `<div class="spreads">${spreads.map((s) => `<div class="spr"><div class="${cls(s[0], "l")}">${pageHTML(s[0], "l", "flip")}</div><div class="${cls(s[1], "r")}">${pageHTML(s[1], "r", "flip")}</div></div>`).join("")}</div>`;
  const sp = $$(".spr", bookEl);
  book = { mode: "static", st: null, goto: (pi) => scrollToY(sp[Math.floor(pi / 2)].getBoundingClientRect().top + scrollY), kill: () => {} };
}
const loadDeferred = () => $$("img[data-src]", bookEl).forEach((im) => { im.src = im.dataset.src; im.removeAttribute("data-src"); });

function mountBook() {
  book.kill();
  const wide = matchMedia(FLIPQ).matches;
  if (wide && !reduce) buildFlip(); else if (wide) buildStatic(); else buildDeck();
  if (!deferImgs) loadDeferred();
  ScrollTrigger.refresh();
}
mountBook();
matchMedia(FLIPQ).addEventListener("change", () => { const y = scrollY; mountBook(); scrollTo(0, Math.min(y, document.body.scrollHeight)); });

bookEl.addEventListener("click", (e) => {
  const f = e.target.closest("[data-n]"); if (!f) return;
  openLB(+f.dataset.n, $("img", f));
});
$("#cv-img").addEventListener("click", () => openLB(cover.n, cvIm));
$("#cv-img").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLB(cover.n, cvIm); } });
$$(".row", rowsEl).forEach((r) => r.addEventListener("click", (e) => {
  e.preventDefault();
  const p = P.find((x) => x.n === +r.dataset.n);
  if (p === cover) return scrollToY(0, 1.6);
  book.goto(pageOf(p));
}));

/* ---------------- navigation ---------------- */
const go = (hash) => {
  if (hash === "#top") return scrollToY(0, 1.8);
  if (hash === "#book" && book.st) return scrollToY(book.st.start, 1.6);
  const el = $(hash); if (el) scrollToY(el.getBoundingClientRect().top + scrollY, 1.6);
};
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]'); if (!a || a.classList.contains("row")) return;
  e.preventDefault(); if (menuOpen) toggleMenu(false); go(a.getAttribute("href"));
});
const nav = $("#nav");
let lastY = 0;
ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => { const y = s.scroll(); const inBook = book.st && book.st.isActive; nav.classList.toggle("up", inBook || (y > lastY && y > innerHeight * 0.4)); lastY = y; } });

let menuOpen = false;
const menu = $("#menu"), mb = $("#nav-b");
function toggleMenu(open) {
  menuOpen = open; mb.setAttribute("aria-expanded", open); menu.setAttribute("aria-hidden", !open); mb.textContent = open ? "Close" : "Menu";
  lock(open);
  if (open) {
    gsap.set(menu, { visibility: "visible" });
    gsap.to(menu, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "io" });
    gsap.fromTo($$("#menu-l li", menu), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.05, delay: 0.3 });
  } else gsap.to(menu, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "io", onComplete: () => gsap.set(menu, { visibility: "hidden" }) });
}
mb.addEventListener("click", () => toggleMenu(!menuOpen));

/* ---------------- film ---------------- */
const fv = $("#film-v video");
fv.src = U(M.video.src); fv.poster = U(M.video.poster);
new IntersectionObserver(([e]) => (e.isIntersecting ? fv.play().catch(() => {}) : fv.pause()), { threshold: 0.2 }).observe(fv);
fv.addEventListener("loadedmetadata", () => { const d = Math.round(fv.duration || 0); if (d) $("#film-d").textContent = ` ${Math.floor(d / 60)}:${pad(d % 60)}`; });
const fm = $("#fm"), mv = $("video", fm);
const openFilm = () => {
  mv.src = U(M.video.src); lock(true);
  gsap.set(fm, { visibility: "visible" }); gsap.to(fm, { opacity: 1, duration: 0.6, ease: "power2.out" });
  mv.currentTime = 0; mv.muted = false; mv.play().catch(() => {}); $("#fm-x").focus();
};
const closeFilm = () => { mv.pause(); gsap.to(fm, { opacity: 0, duration: 0.5, ease: "power2.inOut", onComplete: () => { gsap.set(fm, { visibility: "hidden" }); lock(false); } }); };
$("#film-v").addEventListener("click", openFilm);
$("#film-v").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openFilm(); } });
$("#film-b").addEventListener("click", openFilm);
$("#fm-x").addEventListener("click", closeFilm);

/* ---------------- lightbox ---------------- */
const lb = $("#lb"), lbW = $("#lb-w"), lbImg = $("img", lbW), lbBg = $(".lb-bg", lb), lbUI = $(".lb-ui", lb);
let lbOpen = false, lbI = 0, lbFrom = null;
const ratio = (p, el) => (el && el.naturalWidth ? el.naturalWidth / el.naturalHeight : p.fit === "landscape" ? 1.5 : 2 / 3);
const target = (ar) => {
  const nav = parseFloat(getComputedStyle(html).getPropertyValue("--nav")) || 64, ft = parseFloat(getComputedStyle(html).getPropertyValue("--foot")) || 56;
  const mw = innerWidth - (innerWidth < 760 ? 0 : 2 * nav), mh = innerHeight - nav - ft;
  let w = mw, h = w / ar; if (h > mh) { h = mh; w = h * ar; }
  return { left: (innerWidth - w) / 2, top: nav + (mh - h) / 2, width: w, height: h };
};
const lbSet = (i) => {
  const p = P[i];
  lbImg.src = U(p.src); lbImg.alt = `${full} — ${p.caption}`;
  $("#lb-cap").innerHTML = capHTML(p); $("#lb-i").textContent = `${pad(i + 1)} / ${pad(P.length)}`;
  lb.classList.toggle("dk", p.key === "dark");
  gsap.to(lbBg, { backgroundColor: p.key === "dark" ? "#131211" : "#ebe6de", duration: 0.6, ease: "power2.inOut" });
};
function openLB(n, fromEl) {
  if (lbOpen) return;
  lbOpen = true; lbI = P.findIndex((p) => p.n === n); lbFrom = fromEl;
  const p = P[lbI]; lbSet(lbI); lock(true);
  const r = fromEl ? fromEl.getBoundingClientRect() : target(ratio(p));
  const t = target(ratio(p, fromEl));
  gsap.set(lb, { visibility: "visible" });
  gsap.set(lbBg, { backgroundColor: p.key === "dark" ? "#131211" : "#ebe6de" });
  gsap.set(lbW, { left: r.left, top: r.top, width: r.width, height: r.height, opacity: 1, x: 0 });
  const tl = gsap.timeline();
  tl.to(lbBg, { opacity: 1, duration: reduce ? 0 : 0.6, ease: "power2.out" }, 0)
    .to(lbW, { ...t, duration: reduce ? 0 : 1.05, ease: "io" }, 0)
    .to(lbUI, { opacity: 1, duration: reduce ? 0 : 0.5 }, reduce ? 0 : 0.6);
  $("#lb-x").focus({ preventScroll: true });
}
function stepLB(d) {
  lbI = (lbI + d + P.length) % P.length; lbFrom = null;
  const p = P[lbI];
  gsap.timeline()
    .to(lbW, { opacity: 0, x: -40 * d, duration: reduce ? 0 : 0.35, ease: "power2.in" })
    .add(() => { lbSet(lbI); const t = target(ratio(p)); gsap.set(lbW, { ...t, x: 40 * d }); const im = new Image(); im.src = lbImg.src; return im.decode ? im.decode().catch(() => {}) : null; })
    .to(lbW, { opacity: 1, x: 0, duration: reduce ? 0 : 0.7, ease: "o" }, "+=0.05");
}
function closeLB() {
  if (!lbOpen) return;
  const r = lbFrom && lbFrom.isConnected ? lbFrom.getBoundingClientRect() : null;
  const vis = r && r.width > 0 && r.bottom > 0 && r.top < innerHeight;
  const tl = gsap.timeline({ onComplete: () => { gsap.set(lb, { visibility: "hidden" }); lbOpen = false; lock(false); } });
  tl.to(lbUI, { opacity: 0, duration: 0.25 }, 0);
  if (vis && !reduce) tl.to(lbW, { left: r.left, top: r.top, width: r.width, height: r.height, duration: 0.9, ease: "io" }, 0).to(lbBg, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 0.25).set(lbW, { opacity: 0 });
  else tl.to([lbW, lbBg], { opacity: 0, duration: reduce ? 0 : 0.5, ease: "power2.inOut" }, 0);
}
$(".lb-p", lb).addEventListener("click", () => stepLB(-1));
$(".lb-n", lb).addEventListener("click", () => stepLB(1));
$("#lb-x").addEventListener("click", closeLB);
let tx0 = 0;
lb.addEventListener("touchstart", (e) => (tx0 = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", (e) => { const d = e.changedTouches[0].clientX - tx0; if (Math.abs(d) > 48) stepLB(d < 0 ? 1 : -1); });
addEventListener("keydown", (e) => {
  if (e.key === "Escape") { if (lbOpen) closeLB(); else if (fm.style.visibility === "visible") closeFilm(); else if (menuOpen) toggleMenu(false); }
  if (lbOpen && e.key === "ArrowRight") stepLB(1);
  if (lbOpen && e.key === "ArrowLeft") stepLB(-1);
});
addEventListener("resize", () => { if (lbOpen) gsap.set(lbW, target(ratio(P[lbI], lbImg))); });

/* ---------------- cursor ---------------- */
if (fine && !reduce) {
  html.classList.add("cur-on");
  const c = document.createElement("div"); c.className = "cur"; c.innerHTML = "<i></i><b></b>"; document.body.append(c);
  const lab = $("b", c);
  const xTo = gsap.quickTo(c, "x", { duration: 0.35, ease: "power3" }), yTo = gsap.quickTo(c, "y", { duration: 0.35, ease: "power3" });
  addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); c.classList.add("on"); }, { passive: true });
  document.addEventListener("pointerleave", () => c.classList.remove("on"));
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest("[data-cursor]");
    c.classList.toggle("big", !!t); if (t) lab.textContent = t.dataset.cursor;
    c.classList.toggle("lk", !t && !!e.target.closest("a,button"));
  });
}

/* ---------------- scroll choreography ---------------- */
function choreography() {
  if (reduce) return;
  $$("[data-lines]").forEach((el) => SplitText.create(el, {
    type: "lines", mask: "lines", linesClass: "ln", autoSplit: true,
    onSplit: (s) => gsap.from(s.lines, { yPercent: 105, duration: 1.4, stagger: 0.09, ease: "o", scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
  }));
  $$("[data-fade]").forEach((el) => gsap.from(el, { opacity: 0, y: 26, duration: 1.4, ease: "o", scrollTrigger: { trigger: el, start: "top 90%", once: true } }));
  ScrollTrigger.batch(".toc-ch, .row", { start: "top 94%", once: true, onEnter: (els) => gsap.from(els, { opacity: 0, y: 22, duration: 1, stagger: 0.03, ease: "o", overwrite: true }) });
  ScrollTrigger.batch(".tbl-r, .bk-info > div", { start: "top 94%", once: true, onEnter: (els) => gsap.from(els, { opacity: 0, y: 18, duration: 1, stagger: 0.06, ease: "o" }) });
  /* cover image drifts and grows as the cover leaves */
  gsap.fromTo(cvIm, { scale: 1, yPercent: 0 }, { scale: 1.12, yPercent: 5, ease: "none", transformOrigin: "50% 100%", scrollTrigger: { trigger: ".cover", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(cvName, { yPercent: -22, ease: "none", scrollTrigger: { trigger: ".cover", start: "top top", end: "bottom top", scrub: true } });
  /* film opens from a print-sized frame to full bleed */
  const small = innerWidth < 760;
  gsap.fromTo("#film-v", { clipPath: small ? "inset(8% 7% 8% 7%)" : "inset(12% 18% 12% 18%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: "#film-v", start: "top 92%", end: "center 52%", scrub: true } });
  gsap.fromTo(fv, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "#film-v", start: "top bottom", end: "bottom top", scrub: true } });
  /* back cover name rises into place */
  gsap.from("#bk-name .nm-in", { yPercent: 40, opacity: 0, duration: 1.6, ease: "o", scrollTrigger: { trigger: "#bk-name", start: "top 96%", once: true } });
  gsap.from(bm, { yPercent: 30, opacity: 0, duration: 1.4, ease: "o", scrollTrigger: { trigger: bm, start: "top 92%", once: true } });
}

/* ---------------- intro: contact-sheet flicker, then the frame flies into the cover ---------------- */
function coverIn(delay = 0) {
  const chars = $$(".wi", cvName);
  const tl = gsap.timeline({ delay });
  tl.from(chars, { yPercent: 104, duration: 1.6, stagger: 0.11, ease: "o" }, 0)
    .from(nav, { opacity: 0, duration: 1, ease: "power2.out" }, 0.25)
    .from(".cv-meta > span", { opacity: 0, y: 14, duration: 1.1, stagger: 0.08 }, 0.35);
  const st = SplitText.create("#cv-st", { type: "lines", mask: "lines", linesClass: "ln" });
  tl.from(st.lines, { yPercent: 105, duration: 1.3, stagger: 0.07, ease: "o" }, 0.3);
  return tl;
}
async function intro() {
  const fontsP = document.fonts ? document.fonts.ready : Promise.resolve();
  if (reduce) {
    await Promise.race([fontsP, wait(1200)]);
    fitAll(); deferImgs = false; loadDeferred(); choreography(); ScrollTrigger.refresh(); return;
  }
  lock(true);
  const flick = $("#flick");
  $("#i-name").textContent = full;
  const seq = P.filter((p) => p !== cover).map((p) => SM(p.src)).concat([U(cover.src)]);
  const ims = seq.map((s) => { const im = new Image(); im.alt = ""; im.src = s; flick.append(im); return im; });
  const small = innerWidth < 760;
  const fw = small ? innerWidth * 0.58 : Math.min(innerWidth * 0.25, innerHeight * 0.48, 400), fh = fw * 1.25;
  gsap.set(flick, { width: fw, height: fh, left: (innerWidth - fw) / 2, top: (innerHeight - fh) / 2 - (small ? 20 : 0) });
  const dec = ims.map((im) => (im.decode ? im.decode().catch(() => {}) : Promise.resolve()));
  await Promise.race([Promise.all([...dec, fontsP]), wait(4500)]);
  fitAll();
  gsap.set($$(".wi", cvName), { yPercent: 104 });
  /* flicker: accelerate through the book, settle on the cover */
  const gaps = ims.map((_, i) => { const x = i / Math.max(1, ims.length - 1); return 60 + 120 * Math.pow(Math.abs(x - 0.5) * 2, 2.2); });
  const ctr = $("#i-n");
  for (let i = 0; i < ims.length; i++) {
    ims.forEach((im, j) => im.classList.toggle("on", j === i));
    ctr.textContent = `${pad(i + 1)} / ${pad(ims.length)}`;
    await wait(i === ims.length - 1 ? 380 : gaps[i]);
  }
  gsap.set($$(".wi", cvName), { clearProps: "transform" });
  const r = $("#cv-img").getBoundingClientRect();
  const tl = gsap.timeline();
  tl.to(".intro-c", { opacity: 0, duration: 0.35, ease: "power2.out" }, 0)
    .to(flick, { left: r.left, top: r.top, width: r.width, height: r.height, duration: 1.3, ease: "io" }, 0)
    .to(".intro-bg", { opacity: 0, duration: 0.8, ease: "power2.inOut" }, 0.5)
    .add(coverIn(), 0.78)
    .add(() => {
      html.classList.remove("intro-on"); $(".intro").remove(); lock(false);
      deferImgs = false; loadDeferred(); choreography(); ScrollTrigger.refresh();
    }, 1.32);
}
addEventListener("resize", () => { fitAll(); });
if (document.fonts) document.fonts.ready.then(() => { fitAll(); ScrollTrigger.refresh(); });
fitAll();
intro();
})();
