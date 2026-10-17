// Roaming Pokémon (Raikou, Entei, Suicune ...) as extra encounter tables. They are defined in
// the game's core Settings script (Settings::ROAMING_SPECIES), which syncData.ts extracts from
// Data/Scripts.rxdata into source/Plugins/settings.rb. Each roamer gets a "Roaming<type>" table
// on every map of its roaming area; Essentials demo entries disappear on their own because all
// of their maps are in EXCLUDED_MAP_IDS.
//
// Entry format: [:SPECIES, level, switch, encounter type, BGM, { map => [neighbour maps] }]
// Encounter type: 0 = any, 1 = grass/cave, 2 = surfing, 3 = fishing, 4 = surfing/fishing.
// Without its own area hash a roamer uses Settings::ROAMING_AREAS.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadMapLocationNames } from "./mapMetadata.ts";
import { EXCLUDED_MAP_IDS } from "./parseMapLocations.ts";
import type { EncounterLocation } from "./dataModel.ts";

const SETTINGS_PATH = join(import.meta.dirname, "source", "Plugins", "settings.rb");

const areaMaps = (hash: string) => [...hash.matchAll(/(\d+)\s*=>/g)].map((m) => Number(m[1]));

export function parseRoaming(): EncounterLocation[] {
  if (!existsSync(SETTINGS_PATH)) return [];
  const text = readFileSync(SETTINGS_PATH, "utf8").replace(/^\s*#.*$/gm, "");
  const defaultAreas = areaMaps(text.match(/ROAMING_AREAS\s*=\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "");
  const speciesBlock = text.match(/ROAMING_SPECIES\s*=\s*\[([\s\S]*?)\n\s*\]\s*\n/)?.[1] ?? "";
  const names = loadMapLocationNames();
  const byMap = new Map<string, EncounterLocation>();
  const entryRe = /\[\s*:(\w+)\s*,\s*(\d+)\s*,\s*\d+\s*,\s*(\d+)\s*(?:,\s*(?:"[^"]*"|nil))?\s*(?:,\s*\{([^}]*)\})?\s*\]/g;
  for (const m of speciesBlock.matchAll(entryRe)) {
    const [, species, level, type, ownAreas] = m;
    const maps = ownAreas !== undefined ? areaMaps(ownAreas) : defaultAreas;
    for (const id of maps) {
      if (EXCLUDED_MAP_IDS.has(id)) continue;
      const mapId = String(id).padStart(3, "0");
      let location = byMap.get(mapId);
      if (!location) {
        location = { mapId, locationName: names.get(mapId) ?? mapId, tables: [] };
        byMap.set(mapId, location);
      }
      const method = `Roaming${type}`;
      let table = location.tables.find((t) => t.method === method);
      if (!table) {
        table = { method, slots: [] };
        location.tables.push(table);
      }
      table.slots.push({ chance: 1, species, minLevel: Number(level), maxLevel: Number(level) });
    }
  }
  return [...byMap.values()];
}
