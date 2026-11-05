/* ============================================================
   ONE FILE TO EDIT.  Every concept reads from here.
   Swap the placeholder photos in /assets/photos (keep the
   names, or change the paths below) and your studio video in
   /assets/video, then fill in the real numbers.
   ============================================================ */
window.MODEL = {
  first: "Richie",
  last: "Miller",
  role: "Model",
  city: "Gran Canaria",               // TODO: your base
  available: "Europe · Worldwide",
  email: "booking@richiemiller.com", // TODO
  instagram: "richiemiller",        // TODO: handle without @
  agency: { name: "Independent", url: "" }, // TODO: agency name + link once signed
  compCard: "",                     // TODO: path to a PDF comp card, e.g. "assets/richie-miller-compcard.pdf"

  statement:
    "Quiet confidence in front of the lens. Editorial, tailoring and campaign work — on set, on time, on brief.",

  // Industry-standard comp card stats (metric + imperial). TODO: real numbers.
  stats: [
    ["Height", "188 cm", "6'2\""],
    ["Chest", "98 cm", "38.5\""],
    ["Waist", "80 cm", "31.5\""],
    ["Inseam", "86 cm", "34\""],
    ["Suit", "50 EU", "40L"],
    ["Shoe", "44 EU", "10 US"],
    ["Hair", "Dark brown", ""],
    ["Eyes", "Brown", ""],
  ],

  // THE BOOK — curated & sequenced by an art-director pass (see CREATIVE-DIRECTION.md).
  // Rule: light-key studio chapter → dark-key studio chapter → a short warm colour coda.
  // Never put a saturated holiday photo next to a monochrome studio frame.
  // `fit` = "portrait" | "landscape";  `key` = "light" | "dark" | "colour";  `caption` = the look (wardrobe), `shot` = Close-up | Mid | Full length.
  photos: [
    { src: "assets/photos/rm-d01.jpg",  fit: "portrait",  key: "light",  caption: "Black shirt", shot: "Close-up" },
    { src: "assets/photos/rm-d02.jpg",  fit: "portrait",  key: "light",  caption: "Tailoring", shot: "Full length" },
    { src: "assets/photos/rm-d03.jpg",  fit: "portrait",  key: "light",  caption: "Portrait", shot: "Close-up" },
    { src: "assets/photos/rm-d04.jpg",  fit: "portrait",  key: "light",  caption: "Open collar", shot: "Mid" },
    { src: "assets/photos/rm-d05.jpg",  fit: "landscape", key: "light",  caption: "Shades", shot: "Mid" },
    { src: "assets/photos/rm-d06.jpg",  fit: "portrait",  key: "light",  caption: "Hands", shot: "Close-up" },
    { src: "assets/photos/rm-d07.jpg",  fit: "portrait",  key: "light",  caption: "Studio white", shot: "Mid" },
    { src: "assets/photos/rm-d08.jpg",  fit: "portrait",  key: "light",  caption: "Glasses", shot: "Mid" },
    { src: "assets/photos/rm-d09.jpg",  fit: "portrait",  key: "dark",   caption: "Tee", shot: "Close-up" },
    { src: "assets/photos/rm-d10.jpg",  fit: "portrait",  key: "dark",   caption: "Overshirt", shot: "Full length" },
    { src: "assets/photos/rm-d11.jpg",  fit: "portrait",  key: "dark",   caption: "White tee", shot: "Mid" },
    { src: "assets/photos/rm-d12.jpg",  fit: "portrait",  key: "dark",   caption: "Chair", shot: "Close-up" },
    { src: "assets/photos/rm-d13.jpg",  fit: "portrait",  key: "dark",   caption: "Low key", shot: "Mid" },
    { src: "assets/photos/rm-d14.jpg",  fit: "portrait",  key: "dark",   caption: "Movement", shot: "Full length" },
    { src: "assets/photos/rm-d15.jpg",  fit: "portrait",  key: "dark",   caption: "Jacket", shot: "Mid" },
    { src: "assets/photos/rm-d16.jpg",  fit: "portrait",  key: "dark",   caption: "Coat", shot: "Mid" },
    { src: "assets/photos/rm-d17.jpg",  fit: "portrait",  key: "colour", caption: "White shirt", shot: "Mid" },
  ],
  heroLight: "assets/photos/rm-10.jpg",   // used by light concepts (Atelier)
  closeUpDark: "assets/photos/rm-16.jpg", // used by dark concepts (Noir, Cinema)

  // Digitals / polaroids. TODO: shoot real ones — natural light, plain fitted tee, no retouching,
  // front / profile / three-quarter / full length. Agencies ask for these first. Placeholders below.
  // Empty = section hidden. Add 4 real ones (front, profile, three-quarter, full length) like:
  // { src: "assets/photos/digital-front.jpg", caption: "Front" },
  digitals: [],

  // The studio behind-the-scenes clip. Keep it short (10–30 s), muted, H.264 MP4, ≤ 8 MB.
  video: { src: "assets/video/studio.mp4", poster: "assets/video/studio-poster.jpg" },

  // Selected clients / publications. 
  clients: [], // TODO: add real names only, e.g. ["Brand", "Magazine"]. Empty = hidden.
};
