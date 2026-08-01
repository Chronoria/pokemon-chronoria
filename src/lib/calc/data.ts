// Loads the calculator's data payload and builds lookup maps.
//
// ⚠️ This is the ONLY module in src/lib/calc/** that imports a JSON file, and it deliberately
// imports src/data/calc.json - the slim ~850 KB projection built by data-import/exportCalcData.ts.
//
// ⚠️ NOTHING under src/lib/calc/** or the calculator's client script may import src/lib/data.ts.
// That module statically imports pokemon.json + moves.json + the rest (~5.4 MB); a single import
// would silently pull all of it into the browser bundle. The failure is invisible locally - the
// page still works, it just becomes enormous. Import from here instead.
// The `with { type: "json" }` attribute is required by Node (which runs data-import/verifyCalc.ts
// directly against this module) and understood by Vite, so the same import works in both.
import raw from "../../data/calc.json" with { type: "json" };
import type { CalcMove, CalcSpecies, CalcType } from "./types.ts";

interface CalcAbility {
  i: string;
  n: string;
  d: string;
}
interface CalcItem {
  i: string;
  n: string;
  ic: string | null;
  iv: string | null;
  d: string;
}

const data = raw as unknown as {
  v: number;
  t: CalcType[];
  p: CalcSpecies[];
  m: CalcMove[];
  a: CalcAbility[];
  it: CalcItem[];
};

export const speciesList = data.p;
export const moveList = data.m;
export const abilityList = data.a;
export const itemList = data.it;
export const typeList = data.t;

export const speciesByKey = new Map(speciesList.map((s) => [s.k, s]));
export const moveById = new Map(moveList.map((m) => [m.i, m]));
export const moveByIndex = moveList;
export const abilityById = new Map(abilityList.map((a) => [a.i, a]));
export const itemById = new Map(itemList.map((i) => [i.i, i]));
export const typeById = new Map(typeList.map((t) => [t.i, t]));

/** Display label for a picker row: "Glurak" or "Glurak (Mega X)". */
export function speciesLabel(s: CalcSpecies): string {
  return s.fl ? `${s.n} (${s.fl})` : s.n;
}

export function abilityName(id: string | null | undefined): string {
  if (!id) return "—";
  return abilityById.get(id)?.n ?? id;
}

export function itemName(id: string | null | undefined): string {
  if (!id) return "—";
  return itemById.get(id)?.n ?? id;
}

export function typeName(id: string): string {
  return typeById.get(id)?.n ?? id;
}
