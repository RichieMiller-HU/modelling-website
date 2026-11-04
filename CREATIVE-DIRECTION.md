# Richie Miller: creative direction

An art director's notes on turning the site into a **pro model book** rather than a nice gallery.

## 1. What a working model's site must have

Bookers and casting directors spend about 20 seconds on a site. In order of importance:

1. **Big, current, portrait-first images.** Your face within the first second.
2. **Measurements (comp-card stats)** in metric and imperial: height, chest, waist, inseam, suit, shoe, hair, eyes. ✅ in every concept, toggle in Noir.
3. **Digitals / polaroids.** Natural light, plain fitted tee, no retouching, no styling, shot front, profile, three-quarter and full length. Agencies trust these more than editorials. ⚠️ *You don't have real ones yet, so the section is hidden until `digitals` in `content.js` has photos.*
4. **Motion.** A 10–30 s studio clip shows how you move, which no still can. ✅ (the placeholder film is cut from your stills; swap in your real BTS video).
5. **One-tap booking.** `mailto:` with a prefilled subject, copy-to-clipboard email, Instagram, agency link, downloadable **comp card PDF**.
6. **Selected clients / publications** as proof. Hidden while `clients: []`. Never put fake names or made-up years or series labels on the site; a casting director reads that as lying.
7. Fast and mobile-perfect. Most bookers open your link from Instagram on a phone.

## 2. The honest photo audit (your 40 images)

**Your real assets are the two studio sessions.** The high-key white set (05–13) and the low-key black set (14–21) are consistent and well lit. They clearly come from a professional shoot. That's the book.

**The book (13 frames, live in `content.js`):**
- High key: 10, 06, 05, 12, 13, 09
- Low key: 16, 18, 14, 20, 19, 17
- Colour coda: 04

**Cut, and why:**
- Near-duplicates: 07 (vs 06), 11 (vs 12), 15 (vs 14), 21 (vs 20). Each look should appear once.
- 02 (candlelight couple): reads as AI-composited at 1024 px. Anyone in the industry will spot it. Don't use it anywhere.
- 31 (olive shirt): flat e-commerce light. Reshoot it as a proper digital.
- 01, 03, 22–30, 33–38: holiday and phone shots (sunsets, cocktails, pool, motorbike), and several still show Instagram "1/7" carousel badges. Fine for Instagram, not for a book.
- 26 (odd crop), 40 (graphic tee in an office). 39 (street outerwear) is the only one worth keeping in reserve.
- Styling note: the dog tag and watch appear in nearly every frame. Take them off for the next shoot.

**Why the old site felt "not polished":** it put saturated sunsets, turquoise pools and phone shots right next to monochrome studio frames. The eye reads each jump in exposure, saturation or temperature as a lack of editing. High-end books are about **restraint and sequence**:

- **Chapters, not shuffles.** Light key → dark key → a short warm-colour coda (or the reverse). Never alternate.
- **Rhythm.** Close-up → full length → mid → detail. Don't put three crossed-arm poses in a row.
- **Each look once.** 16/18 and 20/21 are near-twins; pick the stronger frame when the book gets tight.
- **Portrait-first.** Landscapes are breathers, about one in five.
- **Less is more expensive.** 12–20 images beats 40.

`tools/harmony.html` automates this check. Drop in any new shoot and it flags clashes and duplicates, then suggests a sequence.

## 3. What to shoot next (to look like a pro, not a hobbyist)

1. **Real digitals** (30 minutes, a window and a white wall, phone is fine): front / profile / ¾ / full length, plain black or white tee, dark jeans, barefoot or plain shoes, no sunglasses, neutral face plus one natural smile.
2. **A tailoring editorial.** Suit, no tie, grey seamless or a raw location. This lifts you into the premium menswear market.
3. **A close-up beauty series.** Tight crops on jaw, eyes and hands with a watch. Grooming and fragrance clients book from these.
4. **Movement.** Walk-to-camera, jacket over shoulder, turn. Film it at the same time for the hero video.
5. **One colour campaign look**, colour-graded to the same warm, muted palette as 04 so the colour coda matches.
6. **Delivery size:** ask photographers for 3000 px+ on the long edge. Your current 2000 px files are slightly soft as full-screen retina heroes.

Grade everything to one look: muted, slightly warm blacks, no orange skin, and no HDR or heavy clarity.

## 4. The three concepts

| | Noir | Atelier | Cinema |
|---|---|---|---|
| Mood | Dark, expensive, fashion-house | Light, editorial, gallery | Cinematic, playful-confident |
| Signature effect | Hero video shrinks while the name splits; horizontal pinned book; close-up and film open to full screen as you scroll | Contact-sheet flicker intro that flies into the hero; cursor-follow image index | Viewfinder HUD, REC and timecode; letterbox opens; scenes stack; credits roll |
| Best when | The book is mostly low-key / B&W (yours is) | You add more light, natural editorials | The studio video is strong |

**Recommendation.** An independent art-director review (Fable) picked **Atelier**: the bone ground makes the white-studio set sing, the cursor-follow index is the most agency-grade effect, and it holds up best on a phone. **Noir** has the single most expensive moment and suits the low-key set. **Cinema** is the most playful; keep it for a "film" sub-page, or once you have strong video. Two good options: launch Atelier, or launch Noir and borrow Atelier's index list.

## 5. To go live

1. Edit `assets/content.js`: real stats, email, Instagram, agency, clients.
2. Replace `assets/video/studio.mp4` with your real studio clip: H.264, 1080p, muted, 10–30 s, ≤ 8 MB. Then make a poster:

   ```bash
   ffmpeg -i in.mov -t 20 -vf scale=1920:-2 -c:v libx264 -crf 24 -preset slow -an -movflags +faststart assets/video/studio.mp4
   ```

   ```bash
   ffmpeg -ss 1 -i assets/video/studio.mp4 -frames:v 1 assets/video/studio-poster.jpg
   ```

3. Add a comp card PDF and set `compCard` in `content.js`.
4. Deploy: it's a static site with no build step. Use Netlify, Vercel, Cloudflare Pages or GitHub Pages, then point `model.richiemiller.com` at it. Make the chosen concept the root `index.html` (or redirect `/` → `/noir/`).
