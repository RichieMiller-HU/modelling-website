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
  city: "Budapest",               // TODO: your base
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
  // `fit` = "portrait" | "landscape";  `key` = "light" | "dark" | "colour".
  photos: [
    { src: "assets/photos/rm-10.jpg",  fit: "portrait",  key: "light",  caption: "Close-up" },
    { src: "assets/photos/rm-06.jpg",  fit: "portrait",  key: "light",  caption: "Studio White" },
    { src: "assets/photos/rm-05.jpg",  fit: "portrait",  key: "light",  caption: "Full length" },
    { src: "assets/photos/rm-12.jpg",  fit: "landscape", key: "light",  caption: "The Table" },
    { src: "assets/photos/rm-13.jpg",  fit: "portrait",  key: "light",  caption: "Profile" },
    { src: "assets/photos/rm-09.jpg",  fit: "portrait",  key: "light",  caption: "Stool" },
    { src: "assets/photos/rm-16.jpg",  fit: "portrait",  key: "dark",   caption: "Low Key Close-up" },
    { src: "assets/photos/rm-18.jpg",  fit: "landscape", key: "dark",   caption: "Crossed" },
    { src: "assets/photos/rm-14.jpg",  fit: "portrait",  key: "dark",   caption: "Low Key" },
    { src: "assets/photos/rm-20.jpg",  fit: "portrait",  key: "dark",   caption: "Movement" },
    { src: "assets/photos/rm-19.jpg",  fit: "landscape", key: "dark",   caption: "Reclined" },
    { src: "assets/photos/rm-17.jpg",  fit: "portrait",  key: "dark",   caption: "Chair" },
    { src: "assets/photos/rm-04.jpg",  fit: "portrait",  key: "colour", caption: "The Reader" },
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
