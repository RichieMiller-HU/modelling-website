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
  instagram: "",                    // TODO: handle without @ once the account exists. Empty = hidden.
  agency: { name: "Independent", url: "" }, // TODO: agency name + link once signed
  compCard: "",                     // TODO: path to a PDF comp card, e.g. "assets/richie-miller-compcard.pdf"

  heroNote: "Unretouched",          // shown beside the role in the hero
  statement:
    "One studio, two backdrops, nothing retouched. What you see in the book is what walks onto your set.",
  bookNote: "Studio light, straight out of camera.",

  // Measured by Richie, 17 Nov 2026. Weight (88 kg) kept off the site on purpose: agencies ask for it privately.
  // TODO: confirm hair + eye colour; add suit size once known (chest 107 cm usually = EU 52 / 42R).
  stats: [
    ["Height", "181 cm", "5'11\""],
    ["Chest", "107 cm", "42\""],
    ["Waist", "86 cm", "34\""],
    ["Hips", "108 cm", "42.5\""],
    ["Inseam", "83 cm", "32.5\""],
    ["Shoe", "44 EU", "10 US"],
    ["Hair", "Dark brown", ""],
    ["Eyes", "Brown", ""],
  ],

  // THE BOOK — curated & sequenced by an art-director pass (see CREATIVE-DIRECTION.md).
  // Rule: light-key studio chapter → dark-key studio chapter → a short warm colour coda.
  // Never put a saturated holiday photo next to a monochrome studio frame.
  // `fit` = "portrait" | "landscape";  `key` = "light" | "dark" | "colour";  `caption` = the look (wardrobe), `shot` = Close-up | Mid | Full length.
  // All studio frames are unretouched, straight out of camera (deliberate: see heroNote / statement).
  photos: [
    { src: "assets/photos/rm-s07.jpg", fit: "portrait", key: "light", caption: "Arms crossed", shot: "Mid" },
    { src: "assets/photos/rm-s14.jpg", fit: "portrait", key: "light", caption: "Open collar", shot: "Close-up" },
    { src: "assets/photos/rm-s11.jpg", fit: "portrait", key: "light", caption: "Stool, seated", shot: "Full length" },
    { src: "assets/photos/rm-s08.jpg", fit: "portrait", key: "light", caption: "Wall lean", shot: "Full length" },
    { src: "assets/photos/rm-s06.jpg", fit: "portrait", key: "light", caption: "Hand to chin", shot: "Mid" },
    { src: "assets/photos/rm-s17.jpg", fit: "portrait", key: "light", caption: "Sunglasses", shot: "Mid" },
    { src: "assets/photos/rm-s12.jpg", fit: "portrait", key: "light", caption: "Black shirt", shot: "Mid" },
    { src: "assets/photos/rm-s10.jpg", fit: "portrait", key: "light", caption: "Stool, turning", shot: "Full length" },
    { src: "assets/photos/rm-s18.jpg", fit: "landscape", key: "light", caption: "Glasses", shot: "Mid" },
    { src: "assets/photos/rm-s19.jpg", fit: "portrait", key: "light", caption: "Table", shot: "Mid" },
    { src: "assets/photos/rm-s13.jpg", fit: "portrait", key: "light", caption: "Stool, buttoning", shot: "Full length" },
    { src: "assets/photos/rm-s16.jpg", fit: "landscape", key: "light", caption: "Sunglasses, table", shot: "Mid" },
    { src: "assets/photos/rm-s20.jpg", fit: "portrait", key: "light", caption: "Standing", shot: "Full length" },
    { src: "assets/photos/rm-s09.jpg", fit: "portrait", key: "light", caption: "Stool", shot: "Mid" },
    { src: "assets/photos/rm-s01.jpg", fit: "portrait", key: "dark", caption: "Linen overshirt", shot: "Full length" },
    { src: "assets/photos/rm-s03.jpg", fit: "portrait", key: "dark", caption: "Black overshirt", shot: "Mid" },
    { src: "assets/photos/rm-s21.jpg", fit: "portrait", key: "dark", caption: "Black tee", shot: "Close-up" },
    { src: "assets/photos/rm-s05.jpg", fit: "landscape", key: "dark", caption: "Black tee, low key", shot: "Mid" },
    { src: "assets/photos/rm-s02.jpg", fit: "portrait", key: "dark", caption: "Linen overshirt, smile", shot: "Full length" },
    { src: "assets/photos/rm-s04.jpg", fit: "portrait", key: "dark", caption: "Black overshirt, white tee", shot: "Mid" },
    { src: "assets/photos/rm-s22.jpg", fit: "landscape", key: "dark", caption: "Chair", shot: "Close-up" },
  ],
  heroLight: "assets/photos/rm-s09-face.jpg",   // hero on portrait screens (face crop of rm-s09)
  heroFull: "assets/photos/rm-s09.jpg",          // hero on landscape screens (whole frame)
  closeUpDark: "assets/photos/rm-s21.jpg", // used by dark concepts (Noir, Cinema)

  // Digitals / polaroids. TODO: shoot real ones — natural light, plain fitted tee, no retouching,
  // front / profile / three-quarter / full length. Agencies ask for these first. Placeholders below.
  // Empty = section hidden. Add 4 real ones (front, profile, three-quarter, full length) like:
  // { src: "assets/photos/digital-front.jpg", caption: "Front" },
  // Digitals: raw phone photos, 17 Nov 2026, grouped by `part` (face / body / hands).
  digitals: [
    { src: "assets/photos/digital-face-front.jpg",         caption: "Front",               part: "face" },
    { src: "assets/photos/digital-face-three-quarter.jpg", caption: "Three-quarter",       part: "face" },
    { src: "assets/photos/digital-face-tilt.jpg",          caption: "Tilted",              part: "face" },
    { src: "assets/photos/digital-waist-up.jpg",           caption: "Chest up",            part: "face" },
    { src: "assets/photos/digital-full-length-front.jpg",  caption: "Front",               part: "body" },
    { src: "assets/photos/digital-full-length-back.jpg",   caption: "Back",                part: "body" },
    { src: "assets/photos/digital-profile-left.jpg",       caption: "Left profile",        part: "body" },
    { src: "assets/photos/digital-profile-right.jpg",      caption: "Right profile",       part: "body" },
    { src: "assets/photos/digital-three-quarter.jpg",      caption: "Three-quarter",       part: "body" },
    { src: "assets/photos/digital-back-waist-up.jpg",      caption: "Back, waist up",      part: "body" },
    { src: "assets/photos/digital-hands.jpg",              caption: "Backs of hands",      part: "hands" },
  ],
  digitalsNote: "Taken 17 Nov 2026 · Google Pixel · Unedited",
  digitalsAllText: "Straight off the phone, nothing edited. Filter by category, or pick a point on the figure.",
  digitalsMap: "assets/photos/digital-map.jpg", // greyscale crop of the full-length front, base of the body map

  // Categories, in this order, for the tabs, the body map and the grouped grid. `stats` names rows of `stats`.
  bodyMap: {
    face:  { label: "Face",      text: "Front, three-quarter, tilted and chest up. No make-up, nothing retouched." },
    body:  { label: "Full body", text: "Front, back, both profiles and a three-quarter turn. Shorts, socks, watch and bracelets.", stats: ["Height", "Chest", "Waist", "Hips", "Inseam", "Shoe"] },
    hands: { label: "Hands",     text: "Backs of both hands, watch and bracelets on." },
  },

  // OFF DUTY: a small drifting strip of lifestyle phone photos above Contact. Personality, not the book.
  // Order alternates black & white with colour. `ar` = width / height. Empty = hidden.
  offDutyNote: "Away from the set. Phone photos, the way friends see me.",
  offDuty: [
    { src: "assets/photos/off-01.jpg", ar: 0.75 },
    { src: "assets/photos/off-02.jpg", ar: 0.8 },
    { src: "assets/photos/off-03.jpg", ar: 0.75 },
    { src: "assets/photos/off-04.jpg", ar: 0.75 },
    { src: "assets/photos/off-05.jpg", ar: 0.75 },
    { src: "assets/photos/off-06.jpg", ar: 0.8 },
    { src: "assets/photos/off-07.jpg", ar: 0.564 },
    { src: "assets/photos/off-08.jpg", ar: 0.75 },
    { src: "assets/photos/off-09.jpg", ar: 1.333 },
    { src: "assets/photos/off-10.jpg", ar: 1.114 },
    { src: "assets/photos/off-11.jpg", ar: 0.89 },
    { src: "assets/photos/off-12.jpg", ar: 0.769 },
    { src: "assets/photos/off-13.jpg", ar: 0.801 },
  ],

  // The studio behind-the-scenes clip. Keep it short (10–30 s), muted, H.264 MP4, ≤ 8 MB.
  video: { src: "assets/video/studio.mp4", poster: "assets/video/studio-poster.jpg" },

  // Selected clients / publications. 
  clients: [], // TODO: add real names only, e.g. ["Brand", "Magazine"]. Empty = hidden.
};
