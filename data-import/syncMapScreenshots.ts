// Turns the map screenshots into web images for the /fundorte/ pages.
//
// Source: a local folder of PNGs named "<Kartenname>_<Karten-ID>.png" (e.g. "Lucenhöhle_306.png").
// Older screenshots without an id ("Velmora.png") are kept as a fallback for the place of that
// name. Only maps that actually have wild encounters are converted - the pages show nothing else.
//
// Output: public/maps/<id>.webp and public/maps/name-<slug>.webp as LOSSLESS WebP at the
// original size. For this pixel art that is about a fifth of the PNG and pixel-exact; a lossy,
// downscaled WebP came out both blurrier and larger than the PNG it was made from.
// Files are only rewritten when the screenshot is newer than the converted copy.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { parsePbsBlocks, blockToRecord } from "./parsePbs.ts";

export const MAP_SCREENSHOT_DIR = "C:/Users/Pat/Pictures/Karten";

/** Same rule as slugify() in src/lib/data.ts, so the pages can find "name-<slug>.webp". */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
}

export async function syncMapScreenshots(sourcePbsDir: string, publicDir: string): Promise<string> {
  if (!existsSync(MAP_SCREENSHOT_DIR)) return `Ordner ${MAP_SCREENSHOT_DIR} nicht gefunden - übersprungen`;
  const destDir = join(publicDir, "maps");
  mkdirSync(destDir, { recursive: true });

  // ids of all maps with an encounter table
  const encounterIds = new Set<string>();
  for (const block of parsePbsBlocks(readFileSync(join(sourcePbsDir, "encounters.txt"), "utf-8"))) {
    encounterIds.add(block.headerParts[0]);
  }
  // slugs of the place names those maps carry, for the screenshots without an id
  const placeSlugs = new Set<string>();
  for (const block of parsePbsBlocks(readFileSync(join(sourcePbsDir, "map_metadata.txt"), "utf-8"))) {
    const name = blockToRecord(block).Name;
    if (name && encounterIds.has(block.headerParts[0])) placeSlugs.add(slugify(name));
  }

  const wanted = new Map<string, string>(); // output file name -> source file name
  for (const file of readdirSync(MAP_SCREENSHOT_DIR)) {
    if (!/\.png$/i.test(file)) continue;
    const withId = file.match(/_(\d{3})\.png$/i);
    if (withId) {
      if (encounterIds.has(withId[1])) wanted.set(`${withId[1]}.webp`, file);
    } else {
      const slug = slugify(file.replace(/\.png$/i, ""));
      if (placeSlugs.has(slug)) wanted.set(`name-${slug}.webp`, file);
    }
  }

  let converted = 0;
  for (const [outName, srcName] of wanted) {
    const src = join(MAP_SCREENSHOT_DIR, srcName);
    const dest = join(destDir, outName);
    if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) continue;
    await sharp(src).webp({ lossless: true, effort: 6 }).toFile(dest);
    converted++;
  }
  // screenshots that were removed or renamed must not linger
  let removed = 0;
  for (const name of readdirSync(destDir)) {
    if (/\.webp$/i.test(name) && !wanted.has(name)) {
      unlinkSync(join(destDir, name));
      removed++;
    }
  }
  return `${wanted.size} Bilder (${converted} neu umgewandelt${removed ? `, ${removed} entfernt` : ""})`;
}
