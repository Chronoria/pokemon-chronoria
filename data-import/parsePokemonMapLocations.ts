// Scans the map-event text dump (see parseMapLocations.ts for the file/format background) for
// Pokémon handed out as event/gift/trade/egg Pokémon - anything NOT covered by the regular wild
// encounters.txt tables, which already has its own foundIn via parseEncounters.ts. Used only to
// build the standalone Pokemon-Uebersicht.xlsx export (see exportPokemonList.ts) - deliberately
// NOT merged into Pokemon.foundIn, since that field is specifically the wiki's "wild encounters"
// table and gift/trade Pokémon aren't wild.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadMapLocationNames } from "./mapMetadata.ts";
import { resolveEncounterTarget } from "./resolveEncounterTarget.ts";
import { EXCLUDED_MAP_IDS } from "./parseMapLocations.ts";
import type { MapLocationRef, Pokemon } from "./dataModel.ts";

const DUMP_PATH = join(import.meta.dirname, "source", "MapEvents", "EventTextDump.txt");

const MAP_ID_RE = /^Map ID: (\d+)/;
// Start of a new event page: battle rules and scripted Pokémon never carry over.
const PAGE_START_RE = /^(?:Page #\d+|Event ID: \d+)/;
// pbAddPokemon/pbAddPokemonSilent(:SPECIES, level, ...) - direct party gifts (legendaries,
// NPC-given Pokémon). Species can carry a form suffix, e.g. "RAICHU_1".
const ADD_POKEMON_RE = /pbAddPokemon(?:Silent)?\(:(\w+)/;
// pbGenerateEgg(:SPECIES) - Day Care/NPC egg handouts.
const GENERATE_EGG_RE = /pbGenerateEgg\(:(\w+)/;
// Pokemon.new(:SPECIES, level) - constructs a Pokémon object, used for trade-received mons and
// scripted battle/boss setups alike. Counts as "event Pokémon" unless it ends up in a wild
// battle the player cannot catch it in (see below).
const POKEMON_NEW_RE = /Pokemon\.new\(:(\w+)/;
// pbStartTrade(pbGet(1), :SPECIES, ...) - direct (non-variable) trade-received species. Often
// wraps onto the next line as "pbStartTrade(pbGet(1)," + ":SPECIES, ..." - the variable-based
// form (pkmn = Pokemon.new(...); pbStartTrade(pbGet(1), pkmn, ...)) is already covered by
// POKEMON_NEW_RE above, so no extra handling is needed for it here.
const START_TRADE_RE = /pbStartTrade\([^)]*?:(\w+)/;
// WildBattle.start(:SPECIES, level[, :SPECIES2, level2]) or WildBattle.start(pkmn) - static
// encounters such as the legendaries standing on the map. Every ":SPECIES, level" pair counts;
// a variable argument refers to the Pokemon.new calls collected before it on the same page.
const WILD_BATTLE_RE = /WildBattle\.start\(([^)]*)/;
const WILD_BATTLE_SPECIES_RE = /:(\w+)\s*,\s*\d+/g;
const BATTLE_RULE_RE = /setBattleRule\("(\w+)"/g;

// Ultra Beasts are story bosses in Chronoria and never obtainable from a wild battle, even where
// an event forgets to block Poké Balls (project owner's rule). Gifts would still count.
const ULTRA_BEASTS = new Set([
  "NIHILEGO", "BUZZWOLE", "PHEROMOSA", "XURKITREE", "CELESTEELA", "KARTANA", "GUZZLORD",
  "POIPOLE", "NAGANADEL", "STAKATAKA", "BLACEPHALON",
]);
// Static battles the project owner declared uncatchable although their event sets no
// ball-blocking battle rule (yet). "SPECIES" or "SPECIES_form".
const UNCATCHABLE_STATIC = new Set(["COALOSSAL_1"]);

export type PokemonMapLocations = Map<string, Map<number, MapLocationRef[]>>;

function addLocation(result: PokemonMapLocations, speciesId: string, formNumber: number, ref: MapLocationRef) {
  let byForm = result.get(speciesId);
  if (!byForm) {
    byForm = new Map();
    result.set(speciesId, byForm);
  }
  const list = byForm.get(formNumber);
  if (!list) {
    byForm.set(formNumber, [ref]);
    return;
  }
  if (!list.some((r) => r.mapId === ref.mapId)) list.push(ref);
}

export function parsePokemonMapLocations(pokemonById: Map<string, Pokemon>): PokemonMapLocations {
  const result: PokemonMapLocations = new Map();
  if (!existsSync(DUMP_PATH)) return result;

  const locationNames = loadMapLocationNames();
  const lines = readFileSync(DUMP_PATH, "utf-8").split("\n");

  let mapId = "";
  let locationName = "";
  let mapExcluded = true;
  let expectTradeSpeciesNextLine = false;
  // Per event page: Pokemon.new species not yet attributed, and the battle rules set so far.
  let pendingNew: string[] = [];
  const rules = new Set<string>();

  const record = (rawId: string) => {
    const target = resolveEncounterTarget(rawId, pokemonById);
    if (!target) return;
    addLocation(result, target.speciesId, target.formNumber ?? 0, { mapId, locationName });
  };
  // A Pokémon met in a wild battle only counts if it can actually be caught there.
  const recordWild = (rawId: string) => {
    const target = resolveEncounterTarget(rawId, pokemonById);
    if (!target) return;
    const form = target.formNumber ?? 0;
    if (ULTRA_BEASTS.has(target.speciesId)) return;
    if (UNCATCHABLE_STATIC.has(form === 0 ? target.speciesId : `${target.speciesId}_${form}`)) return;
    addLocation(result, target.speciesId, form, { mapId, locationName });
  };
  // Pokemon.new objects that never went into a wild battle are gifts/trades: they count.
  const flushPending = () => {
    if (!mapExcluded) pendingNew.forEach(record);
    pendingNew = [];
    rules.clear();
  };

  for (const line of lines) {
    const mapMatch = MAP_ID_RE.exec(line);
    if (mapMatch) {
      flushPending();
      mapId = mapMatch[1];
      locationName = locationNames.get(mapId) ?? mapId;
      mapExcluded = EXCLUDED_MAP_IDS.has(Number(mapId));
      expectTradeSpeciesNextLine = false;
      continue;
    }
    if (mapExcluded) continue;
    if (PAGE_START_RE.test(line)) flushPending();

    if (expectTradeSpeciesNextLine) {
      const m = /:(\w+),/.exec(line);
      if (m) record(m[1]);
      expectTradeSpeciesNextLine = false;
    }

    for (const m of line.matchAll(BATTLE_RULE_RE)) rules.add(m[1]);

    const addMatch = ADD_POKEMON_RE.exec(line);
    if (addMatch) record(addMatch[1]);

    const eggMatch = GENERATE_EGG_RE.exec(line);
    if (eggMatch) record(eggMatch[1]);

    const newMatch = POKEMON_NEW_RE.exec(line);
    if (newMatch) pendingNew.push(newMatch[1]);

    const wildMatch = WILD_BATTLE_RE.exec(line);
    if (wildMatch) {
      // "neverCapture" together with "raidStyleCapture" is the catch-at-0-HP boss setup.
      const catchable =
        !rules.has("disablePokeBalls") && !(rules.has("neverCapture") && !rules.has("raidStyleCapture"));
      if (catchable) {
        for (const m of wildMatch[1].matchAll(WILD_BATTLE_SPECIES_RE)) recordWild(m[1]);
        pendingNew.forEach(recordWild);
      }
      pendingNew = [];
      rules.clear();
    }

    if (/pbStartTrade\(/.test(line)) {
      const tradeMatch = START_TRADE_RE.exec(line);
      if (tradeMatch) record(tradeMatch[1]);
      else expectTradeSpeciesNextLine = true;
    }
  }
  flushPending();

  return result;
}
