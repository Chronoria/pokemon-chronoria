// Builds the slim data payload the client-side damage calculator uses (src/data/calc.json).
//
// Why a separate, hand-built projection instead of reusing the existing src/data/*.json: those
// are built for build-time page rendering and are far too big to ship to a browser (pokemon.json
// alone is ~3.4 MB, moves.json ~1 MB - mostly reverse indices like foundIn/learnedByLevelUp and
// Pokédex prose that a calculator never touches). This keeps only what the damage formula and the
// pickers read, uses short keys, and refers to moves by array index inside learnsets.
//
// It lands in src/data/ (not public/) so the calculator's bundled <script> can import it
// statically: Vite then content-hashes it into that page's chunk, which means cache-busting is
// automatic on every rebuild and there is no BASE_URL/subpath handling to get wrong. A public/
// asset fetched at runtime would have neither property.
import type { Pokemon, Move, Ability, Item } from "./dataModel.ts";
import type { TypeInfo } from "./parseTypes.ts";

/** Base stat order in the packed `b` array. Deliberately the same order as the BaseStats
 *  interface (and therefore the PBS "BaseStats" line): HP, Attack, Defense, SPEED, SpAtk, SpDef.
 *  Note speed sits fourth, NOT last - src/lib/calc/types.ts pins this down as STAT_KEYS and
 *  everything on the consuming side derives from that constant rather than re-hardcoding it. */
function packStats(s: Pokemon["baseStats"]): number[] {
  return [s.hp, s.attack, s.defense, s.speed, s.spAtk, s.spDef];
}

export function buildCalcData(
  pokemon: Pokemon[],
  moves: Move[],
  abilities: Ability[],
  items: Item[],
  types: TypeInfo[]
) {
  // Learnsets reference moves by index into the moves array rather than by id string - with ~1560
  // entries each listing dozens of moves, repeated ids would dominate the payload.
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
      // Female forms ARE included here, unlike on the Formen page which hides them as cosmetic
      // duplicates. For a damage calculator they aren't cosmetic: Indeedee, Basculegion and
      // Oinkologne all have genuinely different base stats in their female form (verified against
      // the parsed data), so omitting them would silently produce wrong numbers for those three.
      entries.push({
        k: `${p.id}#${f.formNumber}`,
        n: p.name,
        // Form label ("Mega X", "Alola-Form", ...) - same fallback to the bare form number that
        // src/pages/formen/index.astro uses, so unnamed forms stay selectable and readable.
        fl: f.isFemaleForm ? "♀" : f.formName?.text || `Form ${f.formNumber}`,
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

  return {
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
    // Only items that can plausibly be held in battle. TMs (which carry a `move`) and Key Items
    // (pocket 8) can never affect damage and would just bloat the payload and clutter the picker.
    it: items
      .filter((i) => i.move === null && i.pocket !== 8 && i.pocket !== 4)
      .map((i) => ({ i: i.id, n: i.name, ic: i.icon, iv: i.iconVersion, d: i.description })),
  };
}
