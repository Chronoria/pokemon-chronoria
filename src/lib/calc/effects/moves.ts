// Move effects keyed by PBS FunctionCode.
//
// Only codes that change the DAMAGE NUMBER belong here. Everything else (status infliction, stat
// drops, protection, ...) is irrelevant to a damage calculator and is deliberately absent.
//
// Codes fall into three groups:
//   1. Power/stat modifiers the calculator can compute exactly  -> handled in POWER_MODIFIERS
//   2. Multi-hit moves                                          -> HIT_COUNTS
//   3. Moves whose damage doesn't come from the formula at all  -> SPECIAL_DAMAGE
// Anything not listed simply uses the plain formula, which is correct for the 92 damaging moves
// with no function code at all plus every code that only has a secondary effect.
import type { CalcMove, SideState, StatKey, Terrain } from "../types.ts";

/** Multiplies base power. Returns the factor, or 1 when the code doesn't apply. */
export type PowerModifier = (user: SideState, target: SideState, move: CalcMove) => number;

export const POWER_MODIFIERS: Record<string, PowerModifier> = {
  // Eruption / Water Spout: power scales with the user's remaining HP.
  PowerHigherWithUserHP: (user) => Math.max(1 / 150, user.hpFraction),
  // Flail / Reversal: the inverse - stronger the lower the user's HP.
  PowerLowerWithUserHP: (user) => {
    // Essentials picks a band from HP/maxHP * 48; reproduced as the same step function.
    const n = Math.floor(user.hpFraction * 48);
    if (n < 2) return 200 / 20;
    if (n < 5) return 150 / 20;
    if (n < 10) return 100 / 20;
    if (n < 17) return 80 / 20;
    if (n < 33) return 40 / 20;
    return 1;
  },
  // Crush Grip / Wring Out: scales with the TARGET's remaining HP.
  PowerHigherWithTargetHP: (_user, target) => Math.max(1 / 120, target.hpFraction),
  // Punishment-style: stronger the more the target has boosted.
  PowerHigherWithUserPositiveStatStages: (user) => {
    const total = Object.values(user.stages).reduce((sum, s) => sum + Math.max(0, s), 0);
    return (60 + 20 * total) / 60;
  },
  // Facade doubles when the user is burned/poisoned/paralysed.
  DoublePowerIfUserPoisonedBurnedParalyzed: (user) =>
    ["burn", "poison", "badPoison", "paralysis"].includes(user.status) ? 2 : 1,
  // Hex-style: doubles against a statused target.
  DoublePowerIfTargetStatusProblem: (_user, target) => (target.status === "none" ? 1 : 2),
  // Brine: doubles once the target is at or below half HP.
  DoublePowerIfTargetHPLessThanHalf: (_user, target) => (target.hpFraction <= 0.5 ? 2 : 1),
  // Weather Ball and friends already carry their own type change; the power doubling is here.
  DoublePowerInWeather: () => 1,
};

/**
 * Moves that hit several times. The calculator reports per-hit damage and the hit count rather
 * than silently returning a single hit, which would understate them by up to 5x.
 */
export const HIT_COUNTS: Record<string, { min: number; max: number; note: string }> = {
  HitTwoTimes: { min: 2, max: 2, note: "Trifft 2x" },
  HitTwoTimesPoisonTarget: { min: 2, max: 2, note: "Trifft 2x" },
  HitTwoTimesFlinchTarget: { min: 2, max: 2, note: "Trifft 2x" },
  HitThreeTimesAlwaysCriticalHit: { min: 3, max: 3, note: "Trifft 3x" },
  HitThreeTimesPowersUpWithEachHit: { min: 3, max: 3, note: "Trifft 3x, Stärke steigt je Treffer" },
  HitTwoToFiveTimes: { min: 2, max: 5, note: "Trifft 2-5x" },
  HitOncePerUserTeamMember: { min: 1, max: 6, note: "Ein Treffer je Teammitglied" },
};

/**
 * Moves whose damage bypasses the formula entirely. The engine must NOT run the normal
 * calculation for these - a "90 base power" reading of Seismic Toss would be pure fiction.
 */
export const SPECIAL_DAMAGE: Record<string, (user: SideState, target: SideState) => { damage: number | null; note: string }> = {
  FixedDamageUserLevel: (user) => ({ damage: user.level, note: "Fester Schaden: Level des Anwenders" }),
  FixedDamage20: () => ({ damage: 20, note: "Fester Schaden: 20 LP" }),
  FixedDamage40: () => ({ damage: 40, note: "Fester Schaden: 40 LP" }),
  FixedDamageHalfTargetHP: () => ({ damage: null, note: "Halbiert die aktuellen LP des Ziels" }),
  OHKO: () => ({ damage: null, note: "K.o.-Attacke - besiegt das Ziel sofort" }),
  OHKOIce: () => ({ damage: null, note: "K.o.-Attacke - besiegt das Ziel sofort" }),
  OHKOHitsUndergroundTarget: () => ({ damage: null, note: "K.o.-Attacke - besiegt das Ziel sofort" }),
  CounterPhysicalDamage: () => ({ damage: null, note: "Kontert physischen Schaden (2x)" }),
  CounterSpecialDamage: () => ({ damage: null, note: "Kontert Spezial-Schaden (2x)" }),
  CounterDamagePlusHalf: () => ({ damage: null, note: "Kontert erlittenen Schaden (1.5x)" }),
  FixedDamageUserLevelRandom: () => ({ damage: null, note: "Zufälliger Schaden abhängig vom Level" }),
};

/** A holder's real weight for weight-based moves - halved by Float Stone (Leichtstein). */
function effectiveWeight(side: SideState): number {
  return side.item === "FLOATSTONE" ? side.species.w / 2 : side.species.w;
}

/** Weight-based power (Heavy Slam / Grass Knot), computed from the actual weights in the data. */
export function weightBasedPower(code: string, user: SideState, target: SideState): number | null {
  if (code === "PowerHigherWithTargetWeight") {
    const w = effectiveWeight(target);
    if (w >= 200) return 120;
    if (w >= 100) return 100;
    if (w >= 50) return 80;
    if (w >= 25) return 60;
    if (w >= 10) return 40;
    return 20;
  }
  if (code === "PowerHigherWithUserHeavierThanTarget") {
    const targetWeight = effectiveWeight(target);
    const ratio = targetWeight > 0 ? effectiveWeight(user) / targetWeight : 5;
    if (ratio >= 5) return 120;
    if (ratio >= 4) return 100;
    if (ratio >= 3) return 80;
    if (ratio >= 2) return 60;
    return 40;
  }
  return null;
}

/** Codes that always crit, so the UI can apply it without the user ticking the box. */
export const ALWAYS_CRIT = new Set(["AlwaysCriticalHit", "HitThreeTimesAlwaysCriticalHit"]);

/**
 * Skill Link pins a variable multi-hit move to its maximum hit count; Loaded Dice instead only
 * raises the FLOOR to 4 (still variable between 4 and the move's max). Both only became damage-
 * relevant once hit counts were modelled at all - before that there was nothing for them to
 * change.
 */
export function applyMultiHitModifiers(
  hits: { min: number; max: number } | undefined,
  ability: string | null,
  item: string | null
): { min: number; max: number } | undefined {
  if (!hits) return hits;
  if (ability === "SKILLLINK") return { min: hits.max, max: hits.max };
  if (item === "LOADEDDICE") return { min: Math.max(hits.min, Math.min(4, hits.max)), max: hits.max };
  return hits;
}

/**
 * The four terrain seeds raise a defense STAGE by +1 while their terrain is active - not a
 * multiplier, since stat stages are applied before any multiplier in damage.ts (see the
 * "Ability-granted immunity" / Unaware handling there for the same reason other stage-level
 * effects live inline rather than in the ItemEffects hook table).
 */
export const TERRAIN_SEED_BOOST: Record<string, { terrain: Terrain; stat: StatKey }> = {
  ELECTRICSEED: { terrain: "electric", stat: "defense" },
  GRASSYSEED: { terrain: "grassy", stat: "defense" },
  MISTYSEED: { terrain: "misty", stat: "spDef" },
  PSYCHICSEED: { terrain: "psychic", stat: "spDef" },
};
