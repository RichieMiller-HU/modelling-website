# Handover — richiemiller portfolio site

For whoever (human or AI) continues this project. Read this first, then `CREATIVE-DIRECTION.md`.

## 1. What this is

A static portfolio site for **Richie Miller**, model and (soon) actor, Budapest. No framework, no build step: plain HTML, CSS and JS. Every page reads its content from **one file, `assets/content.js`**, so changing a measurement, the email, or the photo list updates every concept at once.

Live preview (GitHub Pages, deployed automatically on every push to the branch): https://richiemiller-hu.github.io/modelling-website/

The client's current favourites:
- **Noir II** (`noir-2/`) → will become the **modelling** portfolio.
- **Cinema II** (`cinema-2/`) → will become the **acting** portfolio.
- **Entry screen** (`entry/`) → a preview of a split landing page that sends visitors to one or the other.

## 2. Repository map

| Path | What it is | Status |
|---|---|---|
| `index.html` | Internal "nine directions" index of all concepts. Not for the public. | keep while deciding |
| `entry/` | Model / Actor split entry screen. Links to `noir-2/` and `cinema-2/`. | preview |
| `noir-2/` | Dark fashion-house editorial. Caslon + Host Grotesk. Hero film with split name, "Selected work" index with cursor-follow preview, pinned horizontal book, eye-slit close-up, film, measurements, contact. | **chosen for modelling** |
| `cinema-2/` | Film concept: viewfinder HUD (REC, timecode), letterbox opening over the film, iris act cards, scenes stacked in three acts, end-credit roll with measurements and contact. | **chosen for acting** |
| `atelier-2/` | Printed photo book with 3D page turns. Newsreader + Schibsted. | alternative |
| `lookbook/` | 3-column lookbook, WebGL "develop" reveal. From Codrops *LookbookHoverEffects* (MIT). | alternative |
| `elastic/` | Multi-speed columns. From Codrops *ElasticGridScroll* (MIT). | alternative |
| `expansion/` | "Richie [eyes] Miller" typographic expansion. From Codrops *ImageExpansionTypography* (MIT). | alternative |
| `noir/`, `atelier/`, `cinema/` | Round one. Google-Fonts based. | archive, don't develop further |
| `assets/content.js` | **All content.** Name, role, city, email, Instagram, agency, comp card, statement, stats, photo list, video, digitals, clients. | edit this |
| `assets/photos/` | `rm-NN.jpg` (≤2000 px) and `rm-NN-sm.jpg` (900 px thumbnails). Numbers match the client's original `portfolio-NN` files. | |
| `assets/video/` | `studio.mp4` + poster. **Placeholder**: a slow-zoom film cut from the stills. Replace with real footage. | replace |
| `assets/core.js`, `assets/base.css` | Shared toolkit used only by round one. The round-two concepts are self-contained in their own folders. | |
| `tools/harmony.html` | Drop photos in; it measures brightness, saturation and temperature, flags clashes and duplicates, and suggests a sequence. Runs in the browser, nothing uploaded. | |
| `CREATIVE-DIRECTION.md` | Photo audit (what was kept and cut and why), what to shoot next, art-director notes. | |
| `.github/workflows/pages.yml` | Deploys the repo to GitHub Pages. Excludes `*.md`. | |
| `robots.txt` | `Disallow: /` while in draft. **Remove or change before launch.** | |

Each concept folder self-hosts its fonts (`fonts/`, all SIL OFL, with the licence text beside them) and its JS libraries (`js/`: GSAP, Lenis, with their licences). Template-based concepts contain `LICENSE-template.txt` and a credit comment in the HTML. No CDN or Google Fonts dependency in round two.

## 3. How it was built, and on what basis

**Process.** Round one: three concepts built from scratch. An independent AI art-director review (Claude "Fable") critiqued them. The client liked Cinema and Atelier as directions but found the typography generic ("AI slop": Inter, Instrument Serif, Playfair-type defaults). Round two: three concepts refined from round one and three built from free, MIT-licensed Codrops demos, each by a separate agent working to a shared brief, then reviewed again by the art director, then fixed.

**Design rules that came out of the reviews (keep following them):**
- Typography is the first thing that gives a site away. Use foundry fonts with character (Libre Caslon Display, Newsreader, Nyght Serif, Coconat, Host Grotesk, Schibsted Grotesk, Fragment Mono), one display + one text face, self-hosted. Never: Inter, Geist, Instrument Serif, Playfair, Cormorant, Bodoni Moda, Space Grotesk, DM Sans, Poppins, Montserrat, Syne, Outfit, Manrope.
- Photos in **chapters, never shuffled**: high key → low key → one warm colour coda. Each photo appears **once** per page (no hero repeated in the book).
- Big photos. Portrait-first. Faces in frame on every crop, especially phone crops of the 16:9 video.
- **No fabricated data.** No fake clients, years, series names, EXIF or "Take 4". Sections with empty data (`digitals`, `clients`) hide themselves.
- Less is more: 13 photos, not 40. The audit in `CREATIVE-DIRECTION.md` says which of the original 40 were cut and why (holiday snaps, near-duplicates, one AI-looking composite).
- Mobile must be designed, not collapsed. No scroll-jacking on touch. `prefers-reduced-motion` respected.
- Don't lazy-load images inside clip-path or hidden containers (it broke loading in round one).

**Verification method.** Every page was screenshotted with Playwright at 1440×900 and 390×844 through a full scroll, checked for console errors and horizontal overflow. Repeat this after any change; it catches most regressions.

## 4. Still placeholders (must be replaced before launch)

In `assets/content.js`:
- `stats` — height, chest, waist, inseam, suit, shoe, hair, eyes are **invented**. Put in the real numbers.
- `email`, `instagram`, `agency`, `compCard` — placeholders.
- `clients` — empty on purpose. Only real names.
- `digitals` — empty on purpose. Add real digitals (front, profile, three-quarter, full length; natural light, plain tee, no retouching).
- `video` — the studio film is cut from stills. Replace with real footage: H.264 MP4, 1080p, 10–30 s, ≤ 8 MB, **with headroom above the head** (several concepts crop it 16:9 and square). A separate 9:16 vertical cut for phones would be ideal.

## 5. The acting portfolio: what to add

Plan: `cinema-2/` becomes the acting site. Its structure already speaks film (acts, scenes, credits). It should read a new `acting` block in `content.js` instead of the modelling book. Suggested shape:

```js
acting: {
  showreel: "https://www.youtube.com/embed/VIDEO_ID",   // the hero; replaces the studio film
  selfTapes: [ { title: "Drama — monologue", url: "https://www.youtube.com/embed/…" } ],
  headshots: [ { src: "assets/acting/headshot-01.jpg", caption: "Neutral" } ],   // Act I
  playingAge: "28–36",
  languages: ["Hungarian (native)", "English (fluent)"],
  accents: ["Hungarian", "General American"],
  skills: ["Driving licence", "Swimming", "…"],
  credits: [ { year: 2025, title: "Project", role: "Role", type: "Short film", director: "Name" } ],
  training: [ { year: 2024, what: "Course / coach / school" } ],
  agent: { name: "", url: "", email: "" },
}
```

What casting directors expect, in priority order:
1. **Showreel**, 60–90 s, best scene first, no title cards longer than 2 s. Hosted on YouTube (unlisted is fine) and embedded. Use `youtube-nocookie.com/embed/ID` and load the iframe only on click (poster first) to keep the page fast.
2. **Headshots**: 2–4, close, neutral background, natural light, eyes to lens, no sunglasses or jewellery. One neutral, one smiling, one "character" look is a good set. These are different from fashion photos.
3. **Credits list** (film, TV, theatre, commercial), newest first, with role and director.
4. **Training**, **languages and accents**, **special skills**, **playing age**, height and eye/hair colour (reuse `stats`).
5. **Self-tapes** (2–3 contrasting scenes) if there's no reel yet.
6. **Contact / agent**, one tap. Downloadable acting CV PDF, like the comp card on the modelling side.

Keep the modelling photos off the acting page except perhaps one or two that work as character portraits. Casting wants to see the person, not the styling.

## 6. Domains: how to connect them

GitHub Pages serves **one custom domain per repository**. Two options:

**A. One repo, one root domain** (simplest): `richiemiller.com` → this repo. The entry screen is the root `index.html`, modelling at `/model/`, acting at `/acting/` (rename the folders when you commit to the choice). Then `model.richiemiller.com` and `acting.richiemiller.com` are just redirects set at the DNS/registrar level (Cloudflare "Redirect Rules" do this for free) to those paths.

**B. Two subdomains as real sites**: split into two repositories (e.g. `model-site`, `acting-site`), each with its own custom domain, or host on Netlify/Cloudflare Pages, which allow several domains per site.

Steps for A (GitHub Pages):
1. In the DNS for `richiemiller.com` add: `A` records for the apex → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `CNAME www → richiemiller-hu.github.io`.
2. Add a file named `CNAME` at the repo root containing `richiemiller.com` (the deploy workflow copies it into the site).
3. Repo → Settings → Pages → Custom domain: `richiemiller.com`, wait for the DNS check, tick **Enforce HTTPS**.
4. Delete `robots.txt` (or set it to `Allow: /`) and remove the `<meta name="robots" content="noindex">` tags from the pages you launch.
5. Replace the placeholders in section 4.

For a subdomain instead (`model.richiemiller.com` → this repo): `CNAME model → richiemiller-hu.github.io`, and put `model.richiemiller.com` in the `CNAME` file.

## 7. Working on it

```bash
python3 -m http.server 8080      # then open http://localhost:8080/
```
No install needed. Fonts and libraries are in the repo. Screenshot-test with Playwright before pushing. Commit messages describe the change; the Pages workflow deploys on push.
