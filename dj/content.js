/* ============================================================
   RICHIE MILLER — DJ SITE — ALL CONTENT LIVES HERE
   Edit this file only. index.html reads everything from `DJ`.
   Search for "TODO" to find the placeholders that must be
   replaced before launch. Nothing here is a fabricated fact:
   fields the client has not confirmed are empty or flagged.
   ============================================================ */

window.DJ = {
  // Artist name as shown everywhere. Client confirmed: no alias, he performs as Richie Miller.
  // If that ever changes, put the alias in `alias` (hero, marquee, booking); `name` stays for the footer.
  name: "Richie Miller",
  alias: "Richie Miller",
  role: "DJ",
  city: "Gran Canaria",

  // Shown as a small line under the name. TODO: confirm wording with the client.
  status: "Booking open",

  // One-line bio. Honest, no invented history. TODO: client to edit in his own words.
  bio: "Gran Canaria-based DJ. House in its progressive, tribal and big-room shades, played to be felt in a room. Booking open.",
  bioIsPlaceholder: true,   // shows a small "placeholder" tag next to the bio until set to false

  // Genres: the client's own list (confirmed 2026-11-05). Rendered only while genresConfirmed is true. He may add more.
  genres: ["Progressive House", "Tribal House", "Big Room", "Dance House"],
  genresConfirmed: true,

  // Recorded sets (YouTube). Titles were fetched from YouTube's oEmbed on 2026-11-05 and are the real titles.
  // Order: newest first (as supplied). `title` may contain emoji; the page strips them for display.
  sets: [
    { id: "zD7zW3obSOM", title: "Sunset Deep House Mix Above the Clouds 🌄 | Tenerife Spain Outdoor DJ Set on Honda Hornet 600" },
    { id: "4OtW7HZS4nE", title: "Deep House DJ Set in Tenerife Mountains  | Outdoor Mix 🎵 + Motorbike Ride 🏍 | Richie Miller" },
    { id: "y-u2KWa7cTM", title: "🔥 Afro & Melodic House DJ Set 2025 | Global Fusion Mix with Afro Tech, Tribal & Electronic Vibes" },
  ],

  // Contact. TODO: both are placeholders.
  email: "booking@richiemiller.com",
  instagram: "richiemiller",       // handle without @
  // Listening links: none exist yet (client confirmed). Leave empty to hide; add real URLs when they exist.
  soundcloud: "",
  mixcloud: "",
  spotify: "",
  youtubeChannel: "https://www.youtube.com/@richiemiller_yt",   // from the oEmbed author_url

  // Press kit / technical rider. "On request" opens a prefilled email.
  pressKit: { label: "Press kit & rider", mode: "request" },   // mode: "request" | "url"; add `url` when a PDF exists

  // Upcoming dates. None yet (client confirmed: new DJ, no gigs booked). Empty = section hidden. Example row:
  // { date: "2026-12-31", venue: "Venue name", city: "Las Palmas", url: "https://..." }
  dates: [],

  // Footage (all real B-roll supplied by the client; re-encoded, muted).
  video: {
    heroMobile: "assets/video/club-cue",                                   // 720×1280 vertical loop (0.7 MB)
    heroTriptych: ["assets/video/club-side", "assets/video/club-cue", "assets/video/club-hands"],
    live: "assets/video/studio-decks",                                     // 1920×1080 (3.3 MB), desktop only
    liveMobile: "assets/video/club-hands",                                 // 720×1280 (0.7 MB)
    bio: "assets/video/club-cue"   ,                                       // 720×1280 (1.9 MB), desktop only; poster on phones
  },
  // PHOTOS. Real photos from the client: a studio session shot on a phone in 2022 (frames with other people left out).
  // Cropped and graded as one series (ink-blue shadows, scarlet mids; two frames in scarlet mono). Each needs
  // assets/photos/<name>.jpg (1800px long edge) and <name>-sm.jpg (800px). fit: "portrait" (4:5) | "landscape" (3:2).
  // While this list is empty, the page falls back to the `stills` below (frames pulled from the footage).
  photos: [
    { src: "assets/photos/rm-01-groove", fit: "portrait",  w: 1440, h: 1800, caption: "Studio session", alt: "Richie Miller in headphones at the decks, one hand on the jog wheel, the other raised" },
    { src: "assets/photos/rm-02-decks",  fit: "landscape", w: 1800, h: 1200, caption: "Studio session", alt: "Leaning over two Pioneer decks and the mixer" },
    { src: "assets/photos/rm-03-above",  fit: "portrait",  w: 1440, h: 1800, caption: "Studio session", alt: "Seen from above, hands on the decks, headphones on" },
    { src: "assets/photos/rm-04-cue",    fit: "landscape", w: 1800, h: 1200, caption: "Studio session", alt: "Holding a headphone to one ear while cueing on the mixer" },
    { src: "assets/photos/rm-05-jog",    fit: "portrait",  w: 1440, h: 1800, caption: "Studio session", alt: "Close on the decks, both hands working the jog wheel" },
    { src: "assets/photos/rm-06-mixer",  fit: "landscape", w: 1800, h: 1199, caption: "Studio session", alt: "Looking down at the mixer, adjusting a fader" },
    { src: "assets/photos/rm-07-front",  fit: "portrait",  w: 1440, h: 1800, caption: "Studio session", alt: "Front-on behind the decks, mid-mix" },
    { src: "assets/photos/rm-08-look",   fit: "portrait",  w: 1441, h: 1800, caption: "Studio session", alt: "Looking up at the camera from the decks, hands on the controls" },
  ],

  // Still frames pulled from the footage, used only while `photos` is empty.
  stills: [
    { src: "assets/stills/still-02-fader", alt: "Richie Miller at the decks under red light, hand on the fader", w: 1080, h: 1920 },
    { src: "assets/stills/still-01-cue",   alt: "Cueing a track on headphones under the vault lights", w: 1080, h: 1920 },
    { src: "assets/stills/still-05-studio",alt: "Studio session on two CDJs", w: 1920, h: 1080 },
    { src: "assets/stills/still-03-hands", alt: "Two-hand mix, close on the mixer", w: 1080, h: 1920 },
    { src: "assets/stills/still-06-smile", alt: "Studio, headphones on, smiling", w: 1920, h: 1080 },
    { src: "assets/stills/still-07-look",  alt: "Looking up from the decks, green and blue light", w: 1080, h: 1920 },
  ],

  // Internal link back to the model / actor entry screen.
  otherSitesLink: "../entry/",
  year: 2026,
};
