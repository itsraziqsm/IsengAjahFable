# An Almanac of Mondstadt

A fan-made, interactive tribute to Mondstadt, the City of Freedom. Runs locally; no external requests.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## What is in it

- **Arrival** – a live scene of the city on Cider Lake. The sky, ranges and water are one WebGL fragment shader; the town is generated procedurally as SVG. Drag the sundial (or use arrow keys on it) to move the sun: palette, stars, moon and window lights all follow.
- **Prologue** – the founding story, set as a book page.
- **Atlas** – a generated ink map with eight places to pick from.
- **The Four Winds** – a pinned chapter that scrolls sideways, east to west.
- **People** – eight residents and their constellations.
- **Windsong** – a playable 21-string lyre (mouse, touch, or the `QWERTYU / ASDFGHJ / ZXCVBNM` rows). All audio is synthesised in the browser.
- **Calendar** – the three great festivals.

## Adding artwork

Everything on the page is drawn in code, so no assets are required. To add character portraits, put files in `public/art/` named after the character (`venti.png`, `jean.webp`, …). They are picked up automatically.

## Stack

Vite, vanilla JS, raw WebGL, GSAP ScrollTrigger, Lenis, Web Audio. Fonts (Cinzel, Cormorant Garamond, EB Garamond) are bundled via Fontsource.

## Credits

Mondstadt, its people and its stories belong to Genshin Impact © HoYoverse. This project is an unofficial fan work and is not affiliated with or endorsed by HoYoverse. All copy, illustration and code here were made for this page.
