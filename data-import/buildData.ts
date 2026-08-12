// Orchestrates all parsers, builds cross-reference indices between the categories, and
// writes the clean, ready-to-render JSON that the Astro pages consume.
//
// Usage: node data-import/buildData.ts

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadTranslationContext } from "./translationContext.ts";
import { parsePokemon } from "./parsePokemon.ts";
import { parseMoves } from "./parseMoves.ts";
import { parseAbilities } from "./parseAbilities.ts";
import { parseItems } from "./parseItems.ts";
import { parseTrainers } from "./parseTrainers.ts";
import { parseEncounters } from "./parseEncounters.ts";
import { parseTypes } from "./parseTypes.ts";
import { parseMedals } from "./parseMedals.ts";
import { parseMapLocations } from "./parseMapLocations.ts";
import { parseShadowPokemon } from "./parseShadowPokemon.ts";
import { CATEGORY_IDS, isItemEvolutionMethod } from "./itemCategoryRules.ts";
import { buildCalcData } from "./exportCalcData.ts";
import { exportItemListXlsx } from "./exportItemList.ts";
import { exportPokemonListXlsx } from "./exportPokemonList.ts";
import { exportEncounterListXlsx } from "./exportEncounterList.ts";
import { resolveEncounterTarget } from "./resolveEncounterTarget.ts";
import type { EncounterRef } from "./dataModel.ts";

const OUT_DIR = join(import.meta.dirname, "..", "src", "data");

function writeJson(name: string, data: unknown) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify(data));
}

async function main() {
  console.log("Lade Übersetzungen...");
  const ctx = loadTranslationContext();

  console.log("Parse Pokémon, Attacken, Fähigkeiten, Items, Trainer, Fundorte, Medaillen...");
  const pokemon = parsePokemon(ctx);
  const moves = parseMoves(ctx);
  const abilities = parseAbilities(ctx);
  const items = parseItems(ctx);
  const trainers = parseTrainers(ctx);
  const encounters = parseEncounters();
  const types = parseTypes(ctx);
  const medals = parseMedals();
  const mapLocations = parseMapLocations();
  const shadowGaugeById = parseShadowPokemon();

  console.log("Baue Querverweise...");
  const pokemonById = new Map(pokemon.map((p) => [p.id, p]));
  const moveById = new Map(moves.map((m) => [m.id, m]));
  const abilityById = new Map(abilities.map((a) => [a.id, a]));
  const trainerById = new Map(trainers.map((t) => [t.id, t]));
  const itemById = new Map(items.map((i) => [i.id, i]));

  // evolvesFrom
  for (const p of pokemon) {
    for (const evo of p.evolutions) {
      const target = pokemonById.get(evo.target);
      if (target) target.evolvesFrom = p.id;
    }
  }

  // Crypto-Meter (shadow_pokemon.txt) -> pokemon.cryptoMeter
  for (const [speciesId, gaugeSize] of shadowGaugeById) {
    const species = pokemonById.get(speciesId);
    if (species) species.cryptoMeter = gaugeSize;
    else console.warn(`[Crypto-Meter] Unbekannte Spezies-ID in shadow_pokemon.txt: ${speciesId}`);
  }

  // move <-> pokemon (level-up, tutor/egg)
  for (const p of pokemon) {
    for (const lm of p.levelMoves) {
      moveById.get(lm.move)?.learnedByLevelUp.push(p.id);
    }
    for (const moveId of [...p.tutorMoves, ...p.eggMoves]) {
      moveById.get(moveId)?.learnedByTutorOrEgg.push(p.id);
    }
  }

  // ability <-> pokemon
  for (const p of pokemon) {
    for (const abilityId of [...p.abilities, ...p.hiddenAbilities]) {
      abilityById.get(abilityId)?.pokemonWithAbility.push(p.id);
    }
  }

  // item categories: "Entwicklungs-Items" needs every item id consumed by an item-based
  // evolution method across all species (not available yet when parseItems.ts ran) - added here
  // as its own pass, then "Sonstige Kampf-Items" catches whatever Pocket-1 item still has no
  // category at all once that's done, so it only ever catches genuinely uncategorized items
  // instead of also grabbing evolution items that happen to lack any of the other tags.
  //
  // Forms carry their own `evolutions` array, distinct from the base species' (e.g. Galar-
  // Flegmon evolves via Reife Galarnuss/Galarnusskranz, items its base species never mentions) -
  // missing this pass silently dropped exactly those two items until it was caught by manually
  // cross-checking every item-conditioned evolution against items.json.
  const evolutionItemIds = new Set<string>();
  for (const p of pokemon) {
    for (const evo of p.evolutions) {
      if (isItemEvolutionMethod(evo.method) && evo.param) evolutionItemIds.add(evo.param);
    }
    for (const f of p.forms) {
      for (const evo of f.evolutions) {
        if (isItemEvolutionMethod(evo.method) && evo.param) evolutionItemIds.add(evo.param);
      }
    }
  }
  for (const itemId of evolutionItemIds) {
    itemById.get(itemId)?.categories.push(CATEGORY_IDS.ENTWICKLUNG);
  }
  for (const item of items) {
    if (item.pocket === 1 && item.categories.length === 0) item.categories.push(CATEGORY_IDS.SONSTIGE_KAMPF_ITEMS);
  }

  // encounters -> pokemon.foundIn / form.foundIn
  let unresolvedEncounterSpecies = 0;
  for (const location of encounters) {
    for (const table of location.tables) {
      for (const slot of table.slots) {
        const target = resolveEncounterTarget(slot.species, pokemonById);
        if (!target) {
          unresolvedEncounterSpecies++;
          continue;
        }
        const ref: EncounterRef = {
          mapId: location.mapId,
          locationName: location.locationName,
          method: table.method,
          minLevel: slot.minLevel,
          maxLevel: slot.maxLevel,
        };
        const species = pokemonById.get(target.speciesId)!;
        if (target.formNumber === null) {
          species.foundIn.push(ref);
        } else {
          species.forms.find((f) => f.formNumber === target.formNumber)!.foundIn.push(ref);
        }
      }
    }
  }
  if (unresolvedEncounterSpecies > 0) {
    console.warn(`[Fundorte] ${unresolvedEncounterSpecies} Encounter-Einträge ohne passendes Pokémon übersprungen.`);
  }

  // map-event dump -> trainer.locations / item.locations
  for (const [trainerId, refs] of mapLocations.trainerLocations) {
    const trainer = trainerById.get(trainerId);
    if (trainer) trainer.locations.push(...refs);
  }
  for (const [itemId, refs] of mapLocations.itemLocations) {
    const item = itemById.get(itemId);
    if (item) item.locations.push(...refs);
  }

  // Headbutt-tree (Rüttelbaum) item drops: this pool lives in Ruby plugin code (game project's
  // Plugins/Custom Headbutt Chance/*.rb, ITEM_POOL constant), not any PBS/event-dump text, so
  // parseMapLocations.ts has no way to see it. Added by hand instead - keep this list in sync
  // with the plugin's ITEM_POOL if it's ever changed there. Not tied to a single map (any of the
  // game's Headbutt trees can drop these), hence the synthetic "HEADBUTT" location.
  // NOTE: the HYPERxxxBERRY "recipe berries" that used to be mixed into this pool have been
  // removed from the game entirely (and the recipes.txt entries that needed them reworked), so
  // the pool is back to just the 10 ordinary status-cure/Sitrus/Lum berries.
  const HEADBUTT_ITEM_POOL = [
    "CHERIBERRY", "CHESTOBERRY", "PECHABERRY", "RAWSTBERRY", "ASPEARBERRY",
    "ORANBERRY", "LEPPABERRY", "PERSIMBERRY", "SITRUSBERRY", "LUMBERRY",
  ];
  for (const itemId of HEADBUTT_ITEM_POOL) {
    const item = itemById.get(itemId);
    if (item) item.locations.push({ mapId: "HEADBUTT", locationName: "Rüttelbaum", source: "headbutt" });
    else console.warn(`[Rüttelbaum-Item-Pool] Unbekannte Item-ID: ${itemId}`);
  }

  console.log("Schreibe JSON-Dateien...");
  writeJson("pokemon", pokemon);
  writeJson("moves", moves);
  writeJson("abilities", abilities);
  writeJson("items", items);
  writeJson("trainers", trainers);
  writeJson("encounters", encounters);
  writeJson("types", types);
  writeJson("medals", medals);
  // Slim client-side payload for the damage calculator - see exportCalcData.ts for why it's a
  // separate projection rather than a reuse of the files above.
  const calcData = buildCalcData(pokemon, moves, abilities, items, types);
  writeJson("calc", calcData);
  console.log(
    `calc.json: ${calcData.p.length} Pokémon-Einträge (inkl. Formen), ${calcData.m.length} Attacken, ` +
      `${calcData.it.length} tragbare Items, ${(Buffer.byteLength(JSON.stringify(calcData)) / 1024).toFixed(0)} KB.`
  );
  writeJson("meta", {
    generatedAt: new Date().toISOString(),
    counts: {
      pokemon: pokemon.length,
      moves: moves.length,
      abilities: abilities.length,
      items: items.length,
      trainers: trainers.length,
      locations: encounters.length,
      medals: medals.length,
    },
    translationFallbacks: {
      pokemonName: pokemon.filter((p) => p.nameFallback).length,
      pokedex: pokemon.filter((p) => p.pokedex.fallback).length,
      category: pokemon.filter((p) => p.category.fallback).length,
      moveName: moves.filter((m) => m.nameFallback).length,
      moveDescription: moves.filter((m) => m.description.fallback).length,
      abilityName: abilities.filter((a) => a.nameFallback).length,
      itemName: items.filter((i) => i.nameFallback).length,
      trainerTypeName: trainers.filter((t) => t.trainerTypeName.fallback).length,
    },
  });

  const xlsxResult = await exportItemListXlsx(items, pokemon);
  console.log(
    `Item-Uebersicht.xlsx aktualisiert: ${xlsxResult.available} erhältlich, ${xlsxResult.unavailable} noch nicht platziert, ` +
      `${xlsxResult.prices} mit Preisvorschlag, ${xlsxResult.byPocket} in der Tasche-Übersicht.`
  );

  const pokemonXlsxResult = await exportPokemonListXlsx(pokemon, items);
  console.log(`Pokemon-Uebersicht.xlsx aktualisiert: ${pokemonXlsxResult.used} verwendet, ${pokemonXlsxResult.unused} noch nicht verwendet.`);

  const encounterXlsxResult = await exportEncounterListXlsx(encounters, pokemon);
  console.log(
    `Routen-Uebersicht.xlsx aktualisiert: ${encounterXlsxResult.locations} Routen, ${encounterXlsxResult.rows} Encounter-Einträge, ` +
      `${encounterXlsxResult.bstEntries} Pokémon in der BST-Rangliste.`
  );

  console.log(`Fertig: ${pokemon.length} Pokémon, ${moves.length} Attacken, ${abilities.length} Fähigkeiten, ` +
    `${items.length} Items, ${trainers.length} Trainer, ${encounters.length} Orte, ${medals.length} Medaillen.`);
}

await main();
