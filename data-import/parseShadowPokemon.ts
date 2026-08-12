// Crypto-Pokémon (Shadow Pokémon) data - PBS/shadow_pokemon.txt.
// Only lists species that can appear as a Shadow Pokémon somewhere in trainers.txt; buildData.ts
// uses this to attach the Crypto-Meter (GaugeSize, the purification-progress gauge size) to the
// matching species in pokemon.json. Species not in this file simply have no shadow form in-game.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePbsBlocks, blockToRecord } from "./parsePbs.ts";

const SOURCE_DIR = join(import.meta.dirname, "source", "PBS");

/** Keyed by species id (block header, e.g. "MIGHTYENA") -> Crypto-Meter gauge size. */
export function parseShadowPokemon(): Map<string, number> {
  const text = readFileSync(join(SOURCE_DIR, "shadow_pokemon.txt"), "utf-8");
  const gaugeById = new Map<string, number>();
  for (const block of parsePbsBlocks(text)) {
    const id = block.headerParts[0];
    const r = blockToRecord(block);
    gaugeById.set(id, Number(r.GaugeSize ?? 0));
  }
  return gaugeById;
}
