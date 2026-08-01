// Emits the slim JSON payload the client-side damage calculator fetches at runtime
// (public/calc-data.json).
//
// Why a separate, hand-built projection instead of reusing src/data/*.json: those are built for
// build-time page rendering and are far too big to ship to a browser (pokemon.json alone is
// ~3.4 MB, moves.json ~1 MB - mostly reverse indices like foundIn/learnedByLevelUp and Pokédex
// prose that a calculator never touches). This keeps only the fields the damage formula and the
// pickers actually read, uses short keys, and refers to moves by array index inside learnsets,
// which together bring it down to a couple hundred KB.
//
// It's written to public/ rather than src/data/ on purpose: importing it from the page's
// <script> would make Vite inline the whole thing into the JS bundle. As a public/ asset it stays
// a separately cacheable file that GitHub Pages serves gzipped.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Pokemon, Move, Ability, Item } from "./dataModel.ts";
import type { TypeInfo } from "./parseTypes.ts";

const OUT_PATH = join(import.meta.dirname, "..", "public", "calc-data.json");

/** Base stat order in the packed `b` array - matches the BaseStats interface field order, which
 *  in turn matches the PBS "BaseStats" line order (HP,Attack,Defense,Speed,SpAtk,SpDef). */
function packStats(s: Pokemon["baseStats"]): number[] {
  return [s.hp, s.attack, s.defense, s.speed, s.spAtk, s.spDef];
}

export interface CalcExportResult {
  entries: number;
  moves: number;
  bytes: number;
}

export function exportCalcData(
  pokemon: Pokemon[],
  moves: Move[],
  abilities: Ability[],
  items: Item[],
  types: TypeInfo[]
): CalcExportResult {
  // Learnsets reference moves by index into this array rather than by id string - with ~1560
  // entries each listing dozens of moves, the ids would dominate the payload size.
  const moveIndex = new Map(moves.map((m, i) => [m.id, i]));
  const learnable = (ids: string[]): number[] => {
    const seen = new Set<number>();
    for (const id of ids) {
      const idx = moveIndex.get(id);
      if (idx !== undefined) seen.add(idx);
    }
    return [...seen].sort((a, b) => a - b);
  };

  const entries: unknown[] = [];
  for (const p of pokemon) {
    entries.push({
      k: p.id,
      n: p.name,
      t: p.types,
      b: packStats(p.baseStats),
      a: p.abilities,
      h: p.hiddenAbilities,
      s: p.sprite,
      w: p.weight,
      l: learnable([...p.levelMoves.map((lm) => lm.move), ...p.tutorMoves, ...p.eggMoves]),
    });
    for (const f of p.forms) {
      // Female-only forms are cosmetic stat-identical variants (see dataModel.ts) and would just
      // duplicate their base species in the picker, so they're skipped here the same way the
      // Formen page skips them.
      if (f.isFemaleForm) continue;
      entries.push({
        k: `${p.id}#${f.formNumber}`,
        n: p.name,
        // Form label ("Mega X", "Alola-Form", ...) - falls back to the bare form number the same
        // way src/pages/formen/index.astro does, so unnamed forms are still selectable.
        fl: f.formName?.text || `Form ${f.formNumber}`,
        t: f.types,
        b: packStats(f.baseStats),
        a: f.abilities,
        h: f.hiddenAbilities,
        s: f.sprite,
        w: f.weight,
        l: learnable([...f.levelMoves.map((lm) => lm.move), ...f.tutorMoves, ...f.eggMoves]),
      });
    }
  }

  const payload = {
    v: 1,
    t: types
      .filter((t) => t.id !== "QMARKS")
      .map((t) => ({ i: t.id, n: t.name, w: t.weaknesses, r: t.resistances, im: t.immunities })),
    p: entries,
    m: moves.map((m) => ({
      i: m.id,
      n: m.name,
      t: m.type,
      c: m.category,
      p: m.power,
      a: m.accuracy,
      pr: m.priority,
      tg: m.target,
      f: m.flags,
      fn: m.functionCode,
    })),
    a: abilities.map((a) => ({ i: a.id, n: a.name, d: a.description })),
    // Only items that can plausibly be held in battle - the full 997 would bloat the payload and
    // clutter the picker with TMs/Poké Balls/Key Items that can never affect damage.
    it: items
      .filter((i) => i.pocket === 1 || i.pocket === 5 || i.pocket === 6)
      .map((i) => ({ i: i.id, n: i.name, ic: i.icon, iv: i.iconVersion, d: i.description })),
  };

  const json = JSON.stringify(payload);
  mkdirSync(join(OUT_PATH, ".."), { recursive: true });
  writeFileSync(OUT_PATH, json);

  return { entries: entries.length, moves: moves.length, bytes: Buffer.byteLength(json) };
}
