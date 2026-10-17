// Wild-encounter locations for the /fundorte/ pages and the pop-up on the Pokémon pages.
// encounters.json has one entry per MAP; several maps often share one place name (Route 13 is
// three maps, the Lucenhöhle ten). The wiki lists a place once, so maps are grouped by name here,
// and maps whose encounter tables are identical are merged into a single block.
import encountersData from "../data/encounters.json";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pokemonById, slugify } from "./data";
import { hasEncounterShare } from "./encounterMethods";

// Map screenshots converted by data-import/syncMapScreenshots.ts: "<mapId>.webp" for a single
// map, "name-<slug>.webp" for a place as a whole. Not every map has one yet. Read from disk at
// build time (the project root is the working directory for both `astro dev` and `astro build`).
const MAP_IMAGE_DIR = join(process.cwd(), "public", "maps");
const mapImageFiles = new Set(existsSync(MAP_IMAGE_DIR) ? readdirSync(MAP_IMAGE_DIR) : []);
function mapImagePath(fileName: string): string | null {
  return mapImageFiles.has(fileName) ? `/maps/${fileName}` : null;
}

interface Slot {
  chance: number;
  species: string;
  minLevel: number;
  maxLevel: number;
}
interface Table {
  method: string;
  slots: Slot[];
}
interface MapEncounters {
  mapId: string;
  locationName: string;
  tables: Table[];
}

export interface LocationSlot {
  /** PBS id as written in encounters.txt, e.g. "RATTATA" or "RATTATA_1" */
  speciesKey: string;
  name: string;
  sprite: string | null;
  /** path below the site root, e.g. "/pokemon/rattata/1/" */
  path: string;
  minLevel: number;
  maxLevel: number;
  /** share of the table in percent, one decimal - undefined for roaming Pokémon */
  chance: number | undefined;
}
export interface LocationTable {
  method: string;
  slots: LocationSlot[];
}
export interface LocationBlock {
  mapIds: string[];
  /** screenshot paths below the site root for those of this block's maps that have one */
  images: string[];
  tables: LocationTable[];
}
export type LocationCategory = "routen" | "staedte" | "besondere";
export interface WildLocation {
  name: string;
  slug: string;
  category: LocationCategory;
  /** number of different Pokémon (forms counted separately) found here */
  speciesCount: number;
  blocks: LocationBlock[];
}

export const LOCATION_CATEGORIES: { id: LocationCategory; label: string }[] = [
  { id: "routen", label: "Routen" },
  { id: "staedte", label: "Städte" },
  { id: "besondere", label: "Besondere Orte" },
];

// Towns and cities of the region. Routes are recognised by their name; everything that is
// neither a route nor listed here counts as a special place. Add new towns by hand.
const TOWNS = new Set([
  "Lappet Town", "Velmora", "Mistral", "Lunafeld", "Azumaris", "Solhaven", "Celestia", "Ephiron",
  "Ariduna", "Lone Beach", "Morastia", "Bruchhain", "Tonishi", "Noxburgh",
]);

function categoryOf(name: string): LocationCategory {
  if (/^Route \d+/.test(name)) return "routen";
  if (TOWNS.has(name)) return "staedte";
  return "besondere";
}

/** Maps without a name in map_metadata.txt still carry RPG Maker's placeholder ("MAP681"). */
export function isUnnamedLocation(name: string): boolean {
  return /^MAP\d+$/.test(name);
}

function resolveSlot(slot: Slot, total: number | null): LocationSlot {
  const direct = pokemonById.get(slot.species);
  const match = direct ? null : slot.species.match(/^(.+)_(\d+)$/);
  const species = direct ?? (match ? pokemonById.get(match[1]) : undefined);
  const form = match && species ? species.forms.find((f) => f.formNumber === Number(match[2])) : undefined;
  const base = {
    speciesKey: slot.species,
    minLevel: slot.minLevel,
    maxLevel: slot.maxLevel,
    chance: total === null ? undefined : total > 0 ? Math.round((slot.chance / total) * 1000) / 10 : 0,
  };
  if (!species) return { ...base, name: slot.species, sprite: null, path: "" };
  if (form) {
    const formName = form.formName?.text || `Form ${form.formNumber}`;
    return {
      ...base,
      name: `${species.name} (${formName})`,
      sprite: form.sprite ?? species.sprite,
      path: `/pokemon/${slugify(species.id)}/${form.formNumber}/`,
    };
  }
  return { ...base, name: species.name, sprite: species.sprite, path: `/pokemon/${slugify(species.id)}/` };
}

function buildLocations(): WildLocation[] {
  const byName = new Map<string, MapEncounters[]>();
  for (const map of encountersData as MapEncounters[]) {
    if (map.tables.length === 0) continue;
    const list = byName.get(map.locationName);
    if (list) list.push(map);
    else byName.set(map.locationName, [map]);
  }
  const usedSlugs = new Map<string, number>();
  const result: WildLocation[] = [];
  for (const [name, maps] of byName) {
    // maps with identical tables share one block
    const blocks = new Map<string, LocationBlock>();
    for (const map of maps) {
      const key = JSON.stringify(map.tables);
      const existing = blocks.get(key);
      if (existing) {
        existing.mapIds.push(map.mapId);
        continue;
      }
      blocks.set(key, {
        mapIds: [map.mapId],
        images: [],
        tables: map.tables.map((t) => {
          const total = hasEncounterShare(t.method) ? t.slots.reduce((sum, s) => sum + s.chance, 0) : null;
          return { method: t.method, slots: t.slots.map((s) => resolveSlot(s, total)) };
        }),
      });
    }
    // slugify() drops umlauts, so two different names could collide - number those
    let slug = slugify(name);
    const seen = usedSlugs.get(slug) ?? 0;
    usedSlugs.set(slug, seen + 1);
    if (seen > 0) slug = `${slug}-${seen + 1}`;
    const blockList = [...blocks.values()];
    for (const block of blockList) {
      block.images = block.mapIds.map((id) => mapImagePath(`${id}.webp`)).filter((p): p is string => p !== null);
    }
    // an older screenshot without a map id stands for the whole place, if nothing more exact exists
    const placeImage = mapImagePath(`name-${slugify(name)}.webp`);
    if (placeImage && blockList.every((b) => b.images.length === 0)) blockList[0].images = [placeImage];
    const speciesCount = new Set(blockList.flatMap((b) => b.tables.flatMap((t) => t.slots.map((s) => s.speciesKey)))).size;
    result.push({ name, slug, category: categoryOf(name), speciesCount, blocks: blockList });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name, "de", { numeric: true }));
}

export const wildLocations = buildLocations();
const slugByName = new Map(wildLocations.map((l) => [l.name, l.slug]));

/** Path of the location page for a place name from Pokemon.foundIn, or null if there is none. */
export function wildLocationPath(locationName: string): string | null {
  const slug = slugByName.get(locationName);
  return slug ? `/fundorte/${slug}/` : null;
}
