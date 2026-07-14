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
// pbAddPokemon/pbAddPokemonSilent(:SPECIES, level, ...) - direct party gifts (legendaries,
// NPC-given Pokémon). Species can carry a form suffix, e.g. "RAICHU_1".
const ADD_POKEMON_RE = /pbAddPokemon(?:Silent)?\(:(\w+)/;
// pbGenerateEgg(:SPECIES) - Day Care/NPC egg handouts.
const GENERATE_EGG_RE = /pbGenerateEgg\(:(\w+)/;
// Pokemon.new(:SPECIES, level) - constructs a Pokémon object, used for trade-received mons and
// scripted battle/boss setups alike. Treated as "event Pokémon" regardless of end use.
const POKEMON_NEW_RE = /Pokemon\.new\(:(\w+)/;
// pbStartTrade(pbGet(1), :SPECIES, ...) - direct (non-variable) trade-received species. Often
// wraps onto the next line as "pbStartTrade(pbGet(1)," + ":SPECIES, ..." - the variable-based
// form (pkmn = Pokemon.new(...); pbStartTrade(pbGet(1), pkmn, ...)) is already covered by
// POKEMON_NEW_RE above, so no extra handling is needed for it here.
const START_TRADE_RE = /pbStartTrade\([^)]*?:(\w+)/;

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

  const record = (rawId: string) => {
    const target = resolveEncounterTarget(rawId, pokemonById);
    if (!target) return;
    addLocation(result, target.speciesId, target.formNumber ?? 0, { mapId, locationName });
  };

  for (const line of lines) {
    const mapMatch = MAP_ID_RE.exec(line);
    if (mapMatch) {
      mapId = mapMatch[1];
      locationName = locationNames.get(mapId) ?? mapId;
      mapExcluded = EXCLUDED_MAP_IDS.has(Number(mapId));
      expectTradeSpeciesNextLine = false;
      continue;
    }
    if (mapExcluded) continue;

    if (expectTradeSpeciesNextLine) {
      const m = /:(\w+),/.exec(line);
      if (m) record(m[1]);
      expectTradeSpeciesNextLine = false;
    }

    const addMatch = ADD_POKEMON_RE.exec(line);
    if (addMatch) record(addMatch[1]);

    const eggMatch = GENERATE_EGG_RE.exec(line);
    if (eggMatch) record(eggMatch[1]);

    const newMatch = POKEMON_NEW_RE.exec(line);
    if (newMatch) record(newMatch[1]);

    if (/pbStartTrade\(/.test(line)) {
      const tradeMatch = START_TRADE_RE.exec(line);
      if (tradeMatch) record(tradeMatch[1]);
      else expectTradeSpeciesNextLine = true;
    }
  }

  return result;
}
