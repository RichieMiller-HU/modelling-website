/* ============================================================
   RICHIE MILLER — DJ SITE — ALL CONTENT LIVES HERE
   Edit this file only. index.html reads everything from `DJ`.
   Search for "TODO" to find the placeholders that must be
   replaced before launch. Nothing here is a fabricated fact:
   fields the client has not confirmed are empty or flagged.
   ============================================================ */

window.DJ = {
  // Artist name as shown everywhere. TODO: if a DJ alias is chosen, put it in `alias`
  // (it replaces the name in the hero and the marquee; `name` stays for the footer/legal).
  name: "Richie Miller",
  alias: "Richie Miller",          // TODO: DJ alias (defaults to the real name)
  role: "DJ",
  city: "Budapest",

  // Shown as a small line under the name. TODO: confirm wording with the client.
  status: "Booking open",

  // One-line bio. TODO: placeholder written for the draft — replace with the client's own words.
  bio: "Long sets, built on the floor rather than the laptop: house with a deep, melodic pull, and the patience to let a room arrive.",
  bioIsPlaceholder: true,

  // Genres. NOT confirmed by the client. They are rendered only when genresConfirmed is true.
  // TODO: confirm genres. (The three published sets are titled deep / afro / melodic house.)
  genres: ["Deep House", "Afro House", "Melodic House"],
  genresConfirmed: false,

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
  // Listening links: leave empty to hide. TODO: add real URLs when they exist.
  soundcloud: "",
  mixcloud: "",
  spotify: "",
  youtubeChannel: "https://www.youtube.com/@richiemiller_yt",   // from the oEmbed author_url

  // Press kit / technical rider. "On request" opens a prefilled email.
  pressKit: { label: "Press kit & rider", mode: "request" },   // mode: "request" | "url"; add `url` when a PDF exists

  // Upcoming dates. Empty = section hidden. Example row:
  // { date: "2026-12-31", venue: "Venue name", city: "Budapest", url: "https://..." }
  dates: [],

  // Footage (all real B-roll supplied by the client; re-encoded, muted).
  video: {
    heroMobile: "assets/video/club-cue",                                   // 720×1280 vertical loop (0.7 MB)
    heroTriptych: ["assets/video/club-side", "assets/video/club-cue", "assets/video/club-hands"],
    live: "assets/video/studio-decks",                                     // 1920×1080 (3.3 MB), desktop only
    liveMobile: "assets/video/club-hands",                                 // 720×1280 (0.7 MB)
    bio: "assets/video/club-groove",                                       // 720×1280 (1.9 MB), desktop only; poster on phones
  },
  // Still frames pulled from the footage (there are no DJ photos yet). TODO: replace with real photos when shot.
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
