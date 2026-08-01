// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves a project repo under /<repo-name>/. The deploy workflow sets
// BASE_PATH to that automatically (see .github/workflows/deploy.yml); locally it defaults
// to "/" so `npm run dev` / `npm run preview` work at the domain root as usual.
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  base,
});

// Note on the damage calculator's ~850 KB data payload (src/data/calc.json, inlined into the
// /rechner/ page chunk): forcing a JSON.parse fast path via vite.json.stringify was tried and had
// no effect - rolldown emitted a byte-identical chunk. Measured in the browser the difference is
// ~13 ms (object literal) vs ~5 ms (JSON.parse) for this file, so it isn't worth working around.
// The chunk is ~171 KB gzipped and only that one page loads it.
