// The 25 natures and their stat modifiers.
//
// Hardcoded on purpose: Essentials keeps natures in GameData::Nature inside the compiled
// Scripts.rxdata, and there is no natures.txt in PBS - so unlike every other dataset on this
// site, this one cannot be parsed from the game files by the import pipeline.
//
// Verified against the game's own script data: the modifier is an integer percent (110 / 100 /
// 90), applied as `floor(stat * mod / 100)` - NOT a 1.1/0.9 float multiply, which would round
// differently on some stats.
import type { StatKey } from "./types.ts";

export interface Nature {
  id: string;
  /** German name, as used in the game's own text files. */
  name: string;
  up: StatKey | null;
  down: StatKey | null;
}

/** German names come from Text_deutsch_core/SCRIPT_TEXTS.txt, which lists them in this exact
 *  canonical Essentials order. The five neutral natures have no stat change at all. */
export const NATURES: Nature[] = [
  { id: "HARDY", name: "Robust", up: null, down: null },
  { id: "LONELY", name: "Solo", up: "attack", down: "defense" },
  { id: "BRAVE", name: "Mutig", up: "attack", down: "speed" },
  { id: "ADAMANT", name: "Hart", up: "attack", down: "spAtk" },
  { id: "NAUGHTY", name: "Frech", up: "attack", down: "spDef" },
  { id: "BOLD", name: "Kühn", up: "defense", down: "attack" },
  { id: "DOCILE", name: "Sanft", up: null, down: null },
  { id: "RELAXED", name: "Locker", up: "defense", down: "speed" },
  { id: "IMPISH", name: "Pfiffig", up: "defense", down: "spAtk" },
  { id: "LAX", name: "Lasch", up: "defense", down: "spDef" },
  { id: "TIMID", name: "Scheu", up: "speed", down: "attack" },
  { id: "HASTY", name: "Hastig", up: "speed", down: "defense" },
  { id: "SERIOUS", name: "Ernst", up: null, down: null },
  { id: "JOLLY", name: "Froh", up: "speed", down: "spAtk" },
  { id: "NAIVE", name: "Naiv", up: "speed", down: "spDef" },
  { id: "MODEST", name: "Mäßig", up: "spAtk", down: "attack" },
  { id: "MILD", name: "Mild", up: "spAtk", down: "defense" },
  { id: "QUIET", name: "Ruhig", up: "spAtk", down: "speed" },
  { id: "BASHFUL", name: "Zaghaft", up: null, down: null },
  { id: "RASH", name: "Hitzig", up: "spAtk", down: "spDef" },
  { id: "CALM", name: "Still", up: "spDef", down: "attack" },
  { id: "GENTLE", name: "Zart", up: "spDef", down: "defense" },
  { id: "SASSY", name: "Forsch", up: "spDef", down: "speed" },
  { id: "CAREFUL", name: "Sacht", up: "spDef", down: "spAtk" },
  { id: "QUIRKY", name: "Kauzig", up: null, down: null },
];

const BY_ID = new Map(NATURES.map((n) => [n.id, n]));

export function natureById(id: string): Nature | undefined {
  return BY_ID.get(id);
}

/** Integer percent modifier (110 / 100 / 90) this nature applies to `stat`. */
export function natureModifier(natureId: string, stat: StatKey): number {
  const nature = BY_ID.get(natureId);
  if (!nature) return 100;
  if (nature.up === stat && nature.down !== stat) return 110;
  if (nature.down === stat && nature.up !== stat) return 90;
  return 100;
}
