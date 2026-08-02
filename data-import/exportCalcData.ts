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

/**
 * True when an item's categories place it entirely outside battle, so the calculator can stay
 * silent about it rather than warning that it isn't modelled.
 *
 * This is a CATEGORISATION signal, not a proof: a few items are both, e.g. Scharfklaue is an
 * evolution item (inert by category) and a real crit-boosting held item, and Wellspring-/
 * Hearthflame-/Cornerstone-Maske are "formwechsel" AND real 1.2x-final-multiplier items.
 * Consumers must therefore consult their own effect registry FIRST and only fall back to this
 * flag - which is exactly what calculate() in src/lib/calc/index.ts does, and what
 * verifyCalc.ts pins down.
 *
 * Deliberately conservative regardless: a wrongly-silenced item would produce a wrong number with
 * no hint, which is worse than noise. Held-item categories like "typverstaerker" or
 * "sonstige-kampf-items" are never treated as inert by category - the latter is a pocket-1 catch-
 * all that also contains real damage items (Choice-/Leben-Orb-style), so its genuinely inert
 * members are listed by id instead, in SONSTIGE_KAMPF_INERT below.
 */
const INERT_CATEGORIES = new Set(["verkaufsware", "entwicklung", "fossilien", "zutaten", "formwechsel"]);

// Hand-verified against every "sonstige-kampf-items" entry in E:\Test\PBS\items.txt (the category
// is a pocket-1 catch-all, so it also contains real damage items like Wahlband/Leben-Orb which
// stay OUT of this list on purpose). Every id here was checked to have no damage-magnitude effect
// under any circumstance: pure exploration items (Schutz/Flöten/Honig), crafting/sell fodder
// (Aprikokos, Splitter, Bambussprosse), breeding/friendship/cosmetic items, switch-out/flee-only
// items, end-of-turn healing with no damage term, and items whose only effect is a stat STAGE
// change (already a direct calculator input, same reasoning as Bedroher/Intimidate).
//
// NOT listed here despite living in the same category, because they get real handlers instead:
// FLOATSTONE (halves weight -> changes weight-based move power), LOADEDDICE (raises the multi-hit
// floor). NOT listed either because the calculator genuinely can't approximate them and a silent
// zero would be worse than the warning: IRONBALL/RINGTARGET (remove type immunities - would need
// typeMod to expose per-type components, not just a combined multiplier), METRONOME (scales with
// same-move streaks the calculator has no concept of), LEGENDPLATE (retypes Judgment specifically,
// unverified whether distinct from the modelled Arceus plates), and the doubles ally-trigger items
// (RESETURGE/ABILITYURGE/ITEMURGE/ITEMDROP - depend on teammates the calculator doesn't model).
const SONSTIGE_KAMPF_INERT = new Set([
  "REPEL", "SUPERREPEL", "MAXREPEL", "BLACKFLUTE", "WHITEFLUTE", "HONEY",
  "GALARICACUFF", "GALARICAWREATH", "CHIPPEDPOT", "MASTERPIECETEACUP",
  "REDAPRICORN", "YELLOWAPRICORN", "BLUEAPRICORN", "GREENAPRICORN", "PINKAPRICORN", "WHITEAPRICORN", "BLACKAPRICORN",
  "MEGASHARD", "TINYBAMBOOSHOOT", "BIGBAMBOOSHOOT",
  "DESTINYKNOT", "LUCKYEGG", "AMULETCOIN", "SOOTHEBELL", "CLEANSETAG",
  "SHEDSHELL", "SMOKEBALL",
  "HEATROCK", "DAMPROCK", "SMOOTHROCK", "ICYROCK", "TERRAINEXTENDER", "LIGHTCLAY", "GRIPCLAW", "BINDINGBAND",
  "BIGROOT", "BLACKSLUDGE", "LEFTOVERS", "SHELLBELL",
  "MENTALHERB", "WHITEHERB", "POWERHERB",
  "ABSORBBULB", "CELLBATTERY", "LUMINOUSMOSS", "SNOWBALL", "WEAKNESSPOLICY", "BLUNDERPOLICY", "THROATSPRAY",
  "ADRENALINEORB", "ROOMSERVICE",
  "WIDELENS", "ZOOMLENS", "LAGGINGTAIL", "QUICKCLAW",
  "FOCUSBAND", "FOCUSSASH",
  "FLAMEORB", "TOXICORB", "STICKYBARB",
  "QUICKPOWDER", "CLEARAMULET", "MIRRORHERB", "COVERTCLOAK",
  "MACHOBRACE", "POWERWEIGHT", "POWERBRACER", "POWERBELT", "POWERLENS", "POWERBAND", "POWERANKLET",
  "EVERSTONE", "SHINYSPRAY", "HEARTSCALE", "ABILITYSHIELD", "GACHATICKET",
  "REDNECTAR", "YELLOWNECTAR", "PINKNECTAR", "PURPLENECTAR",
  "JOYSCENT", "EXCITESCENT", "VIVIDSCENT", "TIMEFLUTE", "RAIDBAIT",
  // Accuracy/evasion-only, or protects from something the calculator doesn't model (hazards,
  // contact effects, weather chip, powder moves) - none of it changes a hit's damage magnitude.
  "BRIGHTPOWDER", "ROCKYHELMET", "SAFETYGOGGLES", "PROTECTIVEPADS", "HEAVYDUTYBOOTS",
  // Switch-out triggers only.
  "EJECTBUTTON", "EJECTPACK", "REDCARD",
  // Choice Scarf is Speed-only, unlike Choice Band/Specs (which ARE modelled, see the choice
  // items above) - no damage multiplier at all.
  "CHOICESCARF",
  // Non-boosting incenses: accuracy, speed, prize money, wild-encounter rate - none affect
  // damage. (The five that DO boost a type's power - Sea/Wave/Rose/Odd/Rock - are real handlers.)
  "LAXINCENSE", "FULLINCENSE", "LUCKINCENSE", "PUREINCENSE",
  // Primal Reversion trigger - the resulting Primal form is chosen via the species/form picker,
  // same reasoning as the Mega Stones and Rusted Sword/Shield above.
  "REDORB", "BLUEORB",
]);

function hasNoBattleEffect(item: Item): boolean {
  if (item.pocket === 2) return true; // Medizin: does nothing until used from the bag.
  if (item.flags.includes("Berry")) return true; // see the file header for why this is safe.
  if (item.categories.length > 0 && item.categories.every((c) => INERT_CATEGORIES.has(c))) return true;
  return SONSTIGE_KAMPF_INERT.has(item.id);
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
    // Only items that can plausibly be held in battle. TMs (`move` set) and pockets 4 (Poffins/
    // whatever occupies it), 8 (Key Items), 3 (Poké Bälle - 35 of them, cannot be "held"), 6
    // (Mega-Steine - Mega Evolution is chosen via the species/form picker instead, and the stone
    // itself has no independent multiplier once that form is selected) and 7 (Kampf-Items: X-Item/
    // Dire-Hit-style stat boosters that are consumed from the bag, not held, plus doubles-ally
    // triggers and flee items) can never be a HELD item and would just clutter the picker.
    it: items
      .filter((i) => i.move === null && ![3, 4, 6, 7, 8].includes(i.pocket))
      .map((i) => ({
        i: i.id,
        n: i.name,
        ic: i.icon,
        iv: i.iconVersion,
        d: i.description,
        // "no battle effect": lets the calculator stay quiet about items that cannot influence
        // damage no matter what (sell fodder, evolution stones, fossils, cooking ingredients,
        // medicine), instead of warning that they aren't modelled. Consumers must check this
        // AFTER their own effect registry, so an item that is both - Metallmantel is an evolution
        // item and a type booster - still gets its real handler.
        ...(hasNoBattleEffect(i) ? { nb: 1 } : {}),
      })),
  };
}
