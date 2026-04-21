

## Goal
Transform EducazenKids from a polished-but-generic shadcn site into an **Instagram-grade, motion-rich, kid-vibrant brand experience** that exactly matches the logo's font personality (chunky, rounded, playful) while keeping the brand-book color system intact. Emotional, tactile, scroll-driven — the kind of site that makes a parent *feel* the place before they read a word.

## Design direction — "Playful Editorial"

**Font system overhaul (matching the logo):**
- **Display / headlines** → `Fredoka` (700–900) — exact match for the logo's chunky rounded letterforms. Used for ALL headlines, hero text, large numbers, callouts.
- **Body** → `Quicksand` (kept) — pairs naturally with Fredoka (same DNA, lighter weight).
- **Editorial accent** → `Caveat` or `Kalam` (handwritten) — replaces Playfair italic. Feels like a teacher's chalk note. Used for soft taglines, pull quotes, "made with love" moments.
- **Label** → keep Cormorant Garamond uppercase for the editorial tags (works as a sophisticated counterpoint to the playful display).

**Visual language upgrades:**
- **Sticker/cutout aesthetic** — rotated cards, hand-drawn SVG underlines, taped polaroids, scribble arrows, dotted paths. Instagram-collage energy.
- **Big bold color blocks** — borrow the brand book's "color hover-expand strip" idea on the homepage.
- **Scroll-driven motion** — `useScroll` parallax, sticky text reveals, marquee strips, number count-ups, magnetic buttons, cursor-following blobs.
- **Micro-interactions everywhere** — wobble on hover, sparkle bursts on CTA, confetti on form submit, image tilt-on-mouse-move.
- **Texture** — subtle paper grain, hand-drawn dividers, dotted/dashed borders, doodle SVGs (stars, hearts, squiggles, suns) sprinkled as decorative accents.

## Concrete changes

### 1. Typography system (`src/styles.css`)
- Swap Google Fonts import → add **Fredoka (300–700)** and **Caveat (400–700)**, drop Nunito + Playfair.
- Update `--font-display: "Fredoka"`, `--font-editorial: "Caveat"`.
- Add a `.font-handwritten` utility, a `.logo-style` utility (Fredoka 800 with letter-spacing tweak to mimic the logo).
- Add new keyframes: `wobble`, `bounce-soft`, `draw-line`, `sparkle`, `tape-wiggle`.

### 2. New reusable motion components (`src/components/site/motion/`)
- `MagneticButton.tsx` — button that tilts toward cursor.
- `TiltCard.tsx` — 3D-tilt on mouse move (used for activity cards, products, blog cards).
- `CountUp.tsx` — animated number for stats.
- `Marquee.tsx` — extracted, with vertical + reversible variants.
- `Doodle.tsx` — inline SVG doodles (star, heart, squiggle, sun, arrow) with `motion` draw-on-scroll.
- `StickyReveal.tsx` — pinned section that swaps text/colors on scroll progress.

### 3. Header (`src/components/site/Header.tsx`)
- Replace logo wordmark with custom Fredoka rendering (no PNG dependency on hover) — keeps crispness and pairs with brand.
- Add a tiny floating "✦" doodle that rotates on scroll.
- Mobile menu becomes a full-screen colored panel with staggered link reveals + decorative doodles.
- Active link gets a hand-drawn underline SVG (not a flat bar).

### 4. Homepage (`src/routes/index.tsx`) — fully rebuilt, **8 sections**
1. **Hero** — split layout, but text now uses Fredoka. Add: cursor-following blob, tilted polaroid hero image with washi-tape corners, animated scribble underline under "avenir", floating sticker badges (HPI, DYS, TDAH) that drift.
2. **Marquee strip** — bigger, two opposite-direction rows, each word in a different brand color with rotating ✦ doodle.
3. **Stats counter band** — 4 big animated numbers (8 ans, 500+ familles, 12 pédagogues, 4 méthodes) with CountUp + doodle accents.
4. **4 Pillars** — kept but reimagined as **rotated colored sticker cards** with hand-drawn icons + hover wobble (replaces the flat grid).
5. **About split** — sticky scroll-driven: image stays pinned while text panels swap (Mission → Vision → Approche), with progress bar.
6. **Activities — color hover-expand** — horizontal strips that expand on hover (lifted from brand book), each strip = an activity with image revealing.
7. **Methods showcase** — Montessori / Freinet / Steiner / D.I.E.C as a 3D tilt card carousel with snap-scroll.
8. **Testimonials marquee** — vertical scrolling testimonial cards on left, big editorial pull quote on right (Caveat handwritten font).
9. **Inscriptions CTA** — bold gradient banner with confetti burst on hover, taped poster image.
10. **Blog teaser** — 3 tilt cards with doodle dividers.

(That's 10 — I'll consolidate to a tight, intentional 8 if any feel padded.)

### 5. Other pages — apply the new system
- **À propos**, **Activités**, **Blog**, **Contact**, **Boutique** → swap fonts globally (automatic via CSS), add scroll-driven hero parallax, replace flat icons with doodle SVGs, tilt cards on grids, magnetic CTAs.
- **Boutique** → product cards become Instagram-shop style: square images, rotated price stickers, "favori" heart toggle with bounce, category pills with active wobble.
- **Contact** → form fields with floating labels and color-shift focus rings, animated map blob, success state with confetti.

### 6. Footer
- Big wordmark in Fredoka, doodle stars sprinkled, social icons with bounce hover, gradient bar kept.

## Technical notes (for later)
- Need to add `framer-motion` `useScroll`, `useTransform`, `useMotionValue`, `useSpring` (already installed).
- No new npm deps required — confetti can be a pure-CSS/SVG burst to stay light.
- Fonts loaded via Google Fonts CSS import (no font files in repo).
- Keep all routes type-safe and `Link` to existing routes — no route additions.
- Maintain the safelist for dynamic color classes.
- All images already exist in `src/assets/` — reused.

## What stays
- Brand color tokens (magenta/purple/teal/gold) — these ARE the brand.
- Route structure, copy, navigation — this is a redesign, not an info change.
- Cormorant Garamond uppercase labels — the editorial counterpoint still works.

