// Turns the map screenshots into web images for the /fundorte/ pages.
//
// Source: a local folder of PNGs. Two naming styles exist:
//   "<Kartenname>_<Karten-ID>.png"  (e.g. "Lucenhöhle_306.png")  -> belongs to exactly that map
//   "<Name>.png"                    (e.g. "Route 1.png", "Moostiefen U2.png", older screenshots)
// A screenshot without an id is matched to a map first by the map's own name in RPG Maker
// ("Moostiefen Tanhel.png"), then by its SIZE: a screenshot is exactly 32 px per tile, so
// "Route 1.png" at 1760x1792 px can only be the 55x56-tile Route 1 map.
// If no map of that place has that size (the map was resized since), the picture is kept as a
// general picture of the place and used as long as the place has no exact one.
// Only maps that actually have wild encounters are converted - the pages show nothing else.
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
const TILE_SIZE = 32;

/** Same rule as slugify() in src/lib/data.ts, so the pages can find "name-<slug>.webp". */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
}

/** Map id -> [width, height] in tiles and map id -> RPG Maker map name, read from the event
 *  dump's map headers. The map name can be more specific than the place name in
 *  map_metadata.txt ("Moostiefen Tanhel" is one of five maps of the place "Moostiefen"). */
function loadMapInfo(eventDumpFile: string): { sizes: Map<string, [number, number]>; names: Map<string, string> } {
  const sizes = new Map<string, [number, number]>();
  const names = new Map<string, string>();
  if (!existsSync(eventDumpFile)) return { sizes, names };
  let id: string | null = null;
  for (const line of readFileSync(eventDumpFile, "utf-8").split("\n")) {
    const idMatch = /^Map ID: (\d+)/.exec(line);
    if (idMatch) {
      id = idMatch[1];
      continue;
    }
    const sizeMatch = /^Width: (\d+), Height: (\d+)/.exec(line);
    if (sizeMatch && id) sizes.set(id, [Number(sizeMatch[1]), Number(sizeMatch[2])]);
    const nameMatch = /^Map Name: (.*)/.exec(line);
    if (nameMatch && id) names.set(id, nameMatch[1].trim());
  }
  return { sizes, names };
}

export async function syncMapScreenshots(sourceDir: string, publicDir: string): Promise<string> {
  if (!existsSync(MAP_SCREENSHOT_DIR)) return `Ordner ${MAP_SCREENSHOT_DIR} nicht gefunden - übersprungen`;
  const destDir = join(publicDir, "maps");
  mkdirSync(destDir, { recursive: true });
  const pbsDir = join(sourceDir, "PBS");

  // maps with an encounter table, and the place name each of them carries
  const encounterIds = new Set<string>();
  for (const block of parsePbsBlocks(readFileSync(join(pbsDir, "encounters.txt"), "utf-8"))) {
    encounterIds.add(block.headerParts[0]);
  }
  const placeOfMap = new Map<string, string>();
  for (const block of parsePbsBlocks(readFileSync(join(pbsDir, "map_metadata.txt"), "utf-8"))) {
    const name = blockToRecord(block).Name;
    if (name && encounterIds.has(block.headerParts[0])) placeOfMap.set(block.headerParts[0], name);
  }
  const { sizes: mapSizes, names: mapNames } = loadMapInfo(join(sourceDir, "MapEvents", "EventTextDump.txt"));

  const wanted = new Map<string, string>(); // output file name -> source file name
  const unnumbered: string[] = [];
  for (const file of readdirSync(MAP_SCREENSHOT_DIR)) {
    if (!/\.png$/i.test(file)) continue;
    const withId = file.match(/_(\d{3})\.png$/i);
    if (!withId) unnumbered.push(file);
    else if (encounterIds.has(withId[1])) wanted.set(`${withId[1]}.webp`, file);
  }

  // screenshots without an id, first pass: the file is named exactly like one map
  const byName: string[] = [];
  const stillOpen: string[] = [];
  for (const file of unnumbered) {
    const base = file.replace(/\.png$/i, "");
    const exact = [...placeOfMap.keys()].filter(
      (id) => !wanted.has(`${id}.webp`) && slugify(mapNames.get(id) ?? "") === slugify(base)
    );
    if (exact.length === 1) {
      wanted.set(`${exact[0]}.webp`, file);
      byName.push(`${file} -> Karte ${exact[0]}`);
    } else {
      stillOpen.push(file);
    }
  }

  // second pass: find the map by size among those still without a picture
  const bySize: string[] = [];
  const asPlace: string[] = [];
  const unused: string[] = [];
  for (const file of stillOpen) {
    const base = file.replace(/\.png$/i, "");
    const meta = await sharp(join(MAP_SCREENSHOT_DIR, file)).metadata();
    // maps of the place this file is named after ("Route 1.png" -> Route 1; "Moostiefen U2.png"
    // also counts for the place "Moostiefen") that have no numbered screenshot of their own
    const candidates = [...placeOfMap].filter(([id, place]) => {
      if (wanted.has(`${id}.webp`)) return false;
      if (slugify(place) !== slugify(base) && !base.toLowerCase().startsWith(place.toLowerCase() + " ")) return false;
      const size = mapSizes.get(id);
      return size !== undefined && size[0] * TILE_SIZE === meta.width && size[1] * TILE_SIZE === meta.height;
    });
    if (candidates.length === 1) {
      wanted.set(`${candidates[0][0]}.webp`, file);
      bySize.push(`${file} -> Karte ${candidates[0][0]}`);
    } else if ([...placeOfMap.values()].some((place) => slugify(place) === slugify(base))) {
      wanted.set(`name-${slugify(base)}.webp`, file);
      asPlace.push(candidates.length > 1 ? `${file} (${candidates.length} gleich große Karten)` : file);
    } else {
      unused.push(file);
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
  const lines = [`${wanted.size} Bilder (${converted} neu umgewandelt${removed ? `, ${removed} entfernt` : ""})`];
  if (byName.length > 0) lines.push(`    über den Kartennamen zugeordnet: ${byName.join("; ")}`);
  if (bySize.length > 0) lines.push(`    über die Größe zugeordnet: ${bySize.join("; ")}`);
  if (asPlace.length > 0) lines.push(`    als Bild des ganzen Orts: ${asPlace.join("; ")}`);
  if (unused.length > 0) lines.push(`    ohne passenden Fundort: ${unused.join(", ")}`);
  return lines.join("\n");
}
