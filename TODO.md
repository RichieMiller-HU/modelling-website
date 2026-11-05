# TODO — richiemiller sites

Open items as of 5 Nov 2026. Hand this to whoever continues (human or AI) together with `HANDOVER.md` (how it's built) and `CREATIVE-DIRECTION.md` (photo rules).

Only three sites are active: **Model** = `noir-2/`, **Actor** = `cinema-2/`, **DJ** = `dj/`. Everything else in the repo is outdated and can be deleted at launch.

Live preview: https://richiemiller-hu.github.io/modelling-website/ (auto-deploys on push to `claude/stoic-mendel-chbu7w`).

---

## A. Content Richie must supply (blocks launch)

### Shared (Model + Actor), in `assets/content.js`
- [ ] `stats` — real height, chest, waist, inseam, suit, shoe, hair, eyes. **Current numbers are invented placeholders.**
- [ ] `email` — real booking address (currently `booking@richiemiller.com`, placeholder).
- [ ] `instagram` — real handle (currently `richiemiller`).
- [ ] `agency` — name + URL once signed, or leave "Independent".
- [ ] `compCard` — a PDF comp card in `assets/`, then set the path. Until then it says "on request".
- [ ] `digitals` — 4 real digitals (front, profile, three-quarter, full length; daylight, plain tee, no retouching, no jewellery). Section is hidden while empty.
- [ ] `clients` — only real names. Hidden while empty.
- [ ] `statement` — confirm or rewrite the one-line bio.

### Actor (`cinema-2/`)
- [ ] Showreel on YouTube (unlisted is fine), 60–90 s, best scene first. Or 2–3 contrasting self-tapes.
- [ ] 2–4 headshots: close, neutral background, daylight, eyes to lens, no sunglasses/jewellery (one neutral, one smile, one character look).
- [ ] Credits list (film / TV / theatre / commercial): year, title, role, type, director.
- [ ] Training, languages + accents, special skills, playing age.
- [ ] Acting CV as PDF.
→ Then: add an `acting` block to `content.js` (shape proposed in `HANDOVER.md` §5) and make `cinema-2/` read it (showreel replaces the studio film; headshots = Act I; credits roll = the real credits). Until then Cinema II shows the modelling book.

### DJ (`dj/content.js`)
- [ ] `bio` — rewrite in his own words, then set `bioIsPlaceholder: false`.
- [ ] `email`, `instagram` — real ones.
- [ ] Genres — currently Progressive House, Tribal House, Big Room, Dance House (his list); extend if needed.
- [ ] Links when they exist: SoundCloud, Mixcloud, Spotify, Resident Advisor (sections appear automatically).
- [ ] Upcoming dates when there are any (`dates: [{date, venue, city, url}]`, section hidden while empty).
- [ ] Press kit / rider PDF (currently "on request" → prefilled email).
- [ ] Newer DJ photos: the current 9 are from a 2022 studio session. A proper shoot at a club/booth would lift the site a lot.

### Model (`noir-2/`)
- [ ] Real studio video with headroom (the current "Studio film" is the real B&W behind-the-scenes footage, 19 s; fine as is, but a cut with his face closer would be stronger). A 9:16 phone cut is ideal.

---

## B. Build work still open

- [ ] **Entry screen** (`entry/`): decide whether it becomes the front door. If yes, make it the root `index.html`, rename folders to `/model/` and `/acting/`, and keep `/dj/` separate (or its own repo). It currently links to `noir-2/` and `cinema-2/`.
- [ ] **Cinema II → acting**: implement the `acting` content block (see above) once material exists.
- [ ] **DJ site as its own repo** (if it gets its own domain): `dj/` is self-contained (own fonts, JS, assets); copy the folder into a new repo and add the same Pages workflow.
- [ ] **Remove drafts before launch**: delete `robots.txt` (or set `Allow: /`) and the `<meta name="robots" content="noindex">` tags in `noir-2/`, `cinema-2/`, `dj/`, `entry/`. Delete the outdated concept folders and `index.html` (the internal "three sites" page).
- [ ] **Real OG images**: set `og:image` per site to a strong frame (model: `assets/photos/rm-d04.jpg`; DJ: a photo from `dj/assets/photos/`).
- [ ] **Favicon** for each site (none yet).
- [ ] **Analytics** if wanted (none installed; Plausible or GA — his choice).
- [ ] **Photo pipeline**: the Drive originals are 30 MP; `scratchpad` is gone after the session, so keep the originals in Drive. Crop specs for the current book were in `curate/book.py` (not in repo). If re-exporting, use long edge 2400 px, q84, progressive, EXIF stripped, plus 900 px `-sm`.
- [ ] Cross-browser: everything was tested in headless Chromium only. Check iOS Safari (video autoplay, `100svh`, scroll-snap) and Firefox before launch.

---

## C. Domains (needs Richie's input)

GitHub Pages allows **one custom domain per repository**.

Decision needed:
- **Option A (simplest):** `richiemiller.com` → this repo. Entry screen at root, `/model/`, `/acting/`. `model.richiemiller.com` / `acting.richiemiller.com` become redirects at the DNS provider. DJ: separate repo + `dj.richiemiller.com` (or a path `/dj/`).
- **Option B:** real subdomains = separate repos (one per site), or host all on Netlify/Cloudflare Pages which allow multiple domains per site.

Steps once decided (Option A on GitHub Pages):
1. DNS: `A` records for apex → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153; `CNAME www → richiemiller-hu.github.io`. For a subdomain: `CNAME <sub> → richiemiller-hu.github.io`.
2. Add a `CNAME` file at repo root containing the domain (the workflow copies everything into the site).
3. GitHub → Settings → Pages → Custom domain → enter it → wait for DNS check → tick **Enforce HTTPS**.
4. Set the default branch to the one being deployed (or merge `claude/stoic-mendel-chbu7w` into `main`; the workflow already deploys from both).

Need from Richie: **where the DNS is managed** (Cloudflare / registrar), and which option.

---

## D. Nice-to-haves (not required)

- Noir II: optional WebGL touch is limited to the close-up by design; don't add more.
- DJ: an audio-reactive visual is possible once there's a hosted audio file; YouTube embeds can't drive it.
- A short "About" paragraph on the model site (currently only the one-line statement).
- Hungarian language toggle if local bookers matter (all copy is English now).
