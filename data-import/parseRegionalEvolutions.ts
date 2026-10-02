// Reads the held-item evolution table (HELD_ITEM_FORMS) from the Chronoria Regional
// Evolutions plugin: a pre-evolution holding a type item evolves into a regional form of its
// usual evolution, e.g. Arboretoss holding Schwarzgurt -> Silvarro (Hisui). These evolutions
// exist only in plugin code, so pokemon.txt alone never shows them.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_FILE = join(import.meta.dirname, "source", "Plugins", "regional_evolutions.rb");

export interface HeldItemEvolutionRule {
  preEvolution: string; // species id
  heldItem: string; // item id
  form: number; // form number of the evolved species
}

export function parseRegionalEvolutions(): HeldItemEvolutionRule[] {
  if (!existsSync(SOURCE_FILE)) return [];
  const text = readFileSync(SOURCE_FILE, "utf8");
  const table = text.match(/HELD_ITEM_FORMS\s*=\s*\{([\s\S]*?)\n\s*\}/);
  if (!table) {
    console.warn("[Regionale Entwicklungen] HELD_ITEM_FORMS nicht gefunden");
    return [];
  }
  const rules: HeldItemEvolutionRule[] = [];
  for (const m of table[1].matchAll(/^\s*:(\w+)\s*=>\s*\[\s*:(\w+)\s*,\s*(\d+)\s*\]/gm)) {
    rules.push({ preEvolution: m[1], heldItem: m[2], form: Number(m[3]) });
  }
  return rules;
}
