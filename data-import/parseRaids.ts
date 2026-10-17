// Raid dens as extra encounter tables. Raids live in event scripts, not in encounters.txt, so
// they are read from the map-event dump (events whose name contains "RaidDen") and added to the
// wild-encounter list as one table per den with the method "Raid<rank>" ("Raid" when the rank
// depends on the player's badges). That way the Pokémon pages, the /fundorte/ pages and the
// Excel overviews pick them up exactly like grass or fishing encounters.
//
// Supported calls (see the game's Plugins/Chronoria Battle Fixes and [DBK_003] Raid Battles):
//   chronoria_raid_den(N)                 den N of [006] Raid Pool.rb: fixed rank, 20 species
//   chronoria_raid_den                    all pool species, rank by badges
//   pbRaidDen / RaidBattle.start(nil, …)  every raid species of the given rank (or by badges)
//   pbRaidDen(:SPECIES, …) / RaidBattle.start(:SPECIES, …)   that one species
// Every species of a den is equally likely; levels follow the plugin's rank formula.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePbsBlocks, blockToRecord } from "./parsePbs.ts";
import { loadMapLocationNames } from "./mapMetadata.ts";
import { EXCLUDED_MAP_IDS } from "./parseMapLocations.ts";
import type { EncounterLocation, EncounterTable } from "./dataModel.ts";

const SOURCE = join(import.meta.dirname, "source");
const DUMP_PATH = join(SOURCE, "MapEvents", "EventTextDump.txt");
const POOL_PATH = join(SOURCE, "Plugins", "raid_pool.rb");
const PBS_SPECIES_FILES = ["pokemon.txt", "pokemon_base_Gen_9_Pack.txt"];
const PBS_FORM_FILES = ["pokemon_forms.txt", "pokemon_forms_Gen_9_Pack.txt"];
// Ranks a den without fixed rank can roll (Chronoria Battle Fixes [005]: 1-5 depending on badges).
const BADGE_RANKS = [1, 2, 3, 4, 5];

/** Level range of a raid rank - same formula as pbDefaultRaidPokemonLevel. */
export function raidLevels(rank: number): [number, number] {
  if (rank >= 7) return [100, 100];
  const min = rank * 10 + (rank > 4 ? 15 : 0);
  return [min, min + 5];
}

/** den number -> { rank, species } from the plugin's DENS table. */
function parseRaidPool(): Map<number, { rank: number; species: string[] }> {
  const dens = new Map<number, { rank: number; species: string[] }>();
  if (!existsSync(POOL_PATH)) return dens;
  const text = readFileSync(POOL_PATH, "utf8");
  for (const m of text.matchAll(/^\s*(\d+)\s*=>\s*\{[^\n]*?:rank\s*=>\s*(\d+)\s*,\s*:species\s*=>\s*\[([\s\S]*?)\]\s*\}/gm)) {
    const species = [...m[3].replace(/#[^\n]*/g, "").matchAll(/:(\w+)/g)].map((s) => s[1]);
    dens.set(Number(m[1]), { rank: Number(m[2]), species });
  }
  return dens;
}

/** rank -> species ids (incl. "_N" forms) a random raid of that rank can pick. Mirrors the
 *  plugin's raid_species?: a form only counts with its own RaidRanks line (the compiler does not
 *  inherit them) and no PokedexForm pointing elsewhere. */
function parseRaidRankLists(): Map<number, string[]> {
  const byRank = new Map<number, string[]>();
  const add = (id: string, ranks: string | undefined) => {
    if (!ranks) return;
    for (const r of ranks.split(",").map((s) => Number(s.trim()))) {
      if (!(r >= 1 && r <= 6)) continue;
      if (!byRank.has(r)) byRank.set(r, []);
      byRank.get(r)!.push(id);
    }
  };
  const load = (file: string) => {
    const path = join(SOURCE, "PBS", file);
    return existsSync(path) ? parsePbsBlocks(readFileSync(path, "utf8")) : [];
  };
  for (const file of PBS_SPECIES_FILES) for (const b of load(file)) add(b.headerParts[0], blockToRecord(b).RaidRanks);
  for (const file of PBS_FORM_FILES) {
    for (const b of load(file)) {
      const r = blockToRecord(b);
      const [species, form] = b.headerParts;
      if (r.PokedexForm !== undefined && Number(r.PokedexForm) !== Number(form)) continue;
      add(`${species}_${form}`, r.RaidRanks);
    }
  }
  return byRank;
}

interface DenCall {
  species: string[];
  rank: number | null; // null = by badges
}

export function parseRaids(): EncounterLocation[] {
  if (!existsSync(DUMP_PATH)) return [];
  const names = loadMapLocationNames();
  const pool = parseRaidPool();
  const rankLists = parseRaidRankLists();
  const allPool = [...new Set([...pool.values()].flatMap((d) => d.species))];
  const allRaid = [...new Set(BADGE_RANKS.flatMap((r) => rankLists.get(r) ?? []))];

  const lines = readFileSync(DUMP_PATH, "utf8").split(/\r?\n/);
  const byMap = new Map<string, EncounterLocation>();
  let mapId = "";
  let mapName = "";
  let eventName = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^Map ID: (\d+)/))) { mapId = m[1]; eventName = ""; continue; }
    if ((m = line.match(/^Map Name: (.*)/))) { mapName = m[1].trim(); continue; }
    if ((m = line.match(/^Event Name: (.*)/))) { eventName = m[1]; continue; }
    if (!/RaidDen/i.test(eventName)) continue;
    if (!/pbRaidDen|chronoria_raid_den|RaidBattle\.start/.test(line)) continue;
    // Developer test maps (name "Testmap") are not part of the game world.
    if (EXCLUDED_MAP_IDS.has(Number(mapId)) || /test/i.test(mapName)) continue;
    // Script commands continue on ":   :" lines.
    let script = line.replace(/^.*?Script:\s*/, "");
    for (let j = i + 1; lines[j] && /^\s*:\s+:/.test(lines[j]) && !/@>/.test(lines[j]); j++) {
      script += " " + lines[j].replace(/^\s*:\s+:\s*/, "");
    }
    const call = readCall(script, pool, rankLists, allPool, allRaid);
    if (!call || call.species.length === 0) continue;

    const [minLevel, maxLevel] = call.rank !== null ? raidLevels(call.rank) : [raidLevels(1)[0], raidLevels(5)[1]];
    const table: EncounterTable = {
      method: call.rank !== null ? `Raid${call.rank}` : "Raid",
      slots: call.species.map((species) => ({ chance: 1, species, minLevel, maxLevel })),
    };
    let location = byMap.get(mapId);
    if (!location) {
      location = { mapId, locationName: names.get(mapId) ?? mapName, tables: [] };
      byMap.set(mapId, location);
    }
    location.tables.push(table);
  }
  return [...byMap.values()];
}

function readCall(
  script: string,
  pool: Map<number, { rank: number; species: string[] }>,
  rankLists: Map<number, string[]>,
  allPool: string[],
  allRaid: string[]
): DenCall | null {
  const rankMatch = script.match(/:rank\s*=>\s*(\d+)/);
  const rank = rankMatch ? Number(rankMatch[1]) : null;
  let m = script.match(/chronoria_raid_den(?:\(\s*(\d+))?/);
  if (m) {
    if (m[1] === undefined) return { species: allPool, rank };
    const den = pool.get(Number(m[1]));
    if (!den) return null;
    return { species: den.species, rank: rank ?? den.rank };
  }
  m = script.match(/(?:pbRaidDen|RaidBattle\.start)\s*\(?\s*(:\w+|nil|\{)?/);
  if (!m) return null;
  if (m[1] && m[1].startsWith(":")) return { species: [m[1].slice(1)], rank };
  return { species: rank !== null ? rankLists.get(rank) ?? [] : allRaid, rank };
}

/** Adds extra tables (raids, roaming Pokémon) to the wild-encounter list: same map -> extra
 *  tables on that entry, otherwise a new entry. Returns the number of tables added. */
export function mergeExtraEncounters(encounters: EncounterLocation[], extra: EncounterLocation[]): number {
  let tables = 0;
  for (const location of extra) {
    const existing = encounters.find((e) => e.mapId === location.mapId);
    if (existing) existing.tables.push(...location.tables);
    else encounters.push(location);
    tables += location.tables.length;
  }
  return tables;
}
