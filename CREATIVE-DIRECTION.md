# Richie Miller: creative direction

An art director's notes on turning the site into a **pro model book** rather than a nice gallery.

## 1. What a working model's site must have

Bookers and casting directors spend about 20 seconds on a site. In order of importance:

1. **Big, current, portrait-first images.** Your face within the first second.
2. **Measurements (comp-card stats)** in metric and imperial: height, chest, waist, inseam, suit, shoe, hair, eyes. ✅ in every concept, toggle in Noir.
3. **Digitals / polaroids.** Natural light, plain fitted tee, no retouching, no styling, shot front, profile, three-quarter and full length. Agencies trust these more than editorials. ⚠️ *You don't have real ones yet; the current ones are stand-ins.*
4. **Motion.** A 10–30 s studio clip shows how you move, which no still can. ✅ (the placeholder film is cut from your stills; swap in your real BTS video).
5. **One-tap booking.** `mailto:` with a prefilled subject, copy-to-clipboard email, Instagram, agency link, downloadable **comp card PDF**.
6. **Selected clients / publications** as proof. Leave the list empty until you have real names; fake ones hurt.
7. Fast and mobile-perfect. Most bookers open your link from Instagram on a phone.

## 2. The honest photo audit (your 40 images)

**Your real assets are the two studio sessions.** The high-key white set (05–13) and the low-key black set (14–21) are consistent and well lit. They clearly come from a professional shoot. That's the book.

| Keep (book) | Keep (accent / colour coda) | Cut from the book |
|---|---|---|
| 05, 06, 07, 08, 09, 10, 11, 12, 13 (white studio) | 04 (glasses, library: warm, editorial) | 23, 24, 25, 26 (laptop café: lifestyle and four near-duplicates) |
| 14, 15, 16, 17, 18, 19, 20, 21 (black studio) | 31 (olive shirt, grey seamless: closest to digitals) | 29, 30, 33, 35, 36, 37, 38 (phone/holiday shots; several still show Instagram "1/7" carousel badges) |
| | 02 (candlelight couple: cinematic, use once at most) | 01, 03, 22, 27, 28, 34 (travel: fine for Instagram, not for a book) |
| | | 39, 40 (casual B&W: off-brief) |

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

Grade everything to one look: muted, slightly warm blacks, no orange skin, and no HDR or heavy clarity.

## 4. The three concepts

| | Noir | Atelier | Cinema |
|---|---|---|---|
| Mood | Dark, expensive, fashion-house | Light, editorial, gallery | Cinematic, playful-confident |
| Signature effect | Hero video shrinks while the name splits; horizontal pinned book; close-up and film open to full screen as you scroll | Contact-sheet flicker intro that flies into the hero; cursor-follow image index | Viewfinder HUD, REC and timecode; letterbox opens; scenes stack; credits roll |
| Best when | The book is mostly low-key / B&W (yours is) | You add more light, natural editorials | The studio video is strong |

**Recommendation: Noir as the main site.** It suits your strongest photos, gives you the "he knows what he's doing" feeling, and the dark ground hides the tone differences between shoots.

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
