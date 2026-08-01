// The damage formula.
//
// This is a transcription of Battle::Move#pbCalcDamage / #pbCalcDamageMultipliers as they exist
// in THIS game - i.e. the Deluxe Battle Kit version at
//   E:\Test\Plugins\[DBK_000] Deluxe Battle Kit\[000] Essentials Patches\[002] Damage Calc Refactor.rb
// DBK replaces both methods outright (plain `def`, no alias), so core Essentials' formula never
// runs here, and neither does Pokémon Showdown's - do NOT "correct" this towards either.
//
// Two properties of the DBK version that differ from Showdown and must be preserved:
//   * There are only FOUR float accumulators, multiplied together with no intermediate rounding.
//     Showdown's pokeRound/65536 chain would give different results and must not be introduced.
//   * Only five roundings happen in total: four `.round` (half-up) and one integer floor-division
//     chain in the middle.
import { abilityName } from "./data.ts";
import { HIT_COUNTS, POWER_MODIFIERS, SPECIAL_DAMAGE, weightBasedPower } from "./effects/moves.ts";
import { AbilityEffects, ItemEffects } from "./registry.ts";
import { applyStage, calcAllStats, NEUTRAL_STAGE_INDEX } from "./stats.ts";
import { typeMod as calcTypeMod } from "./typechart.ts";
import type {
  CalcMove,
  CalcType,
  DamageResult,
  EffectContext,
  FieldState,
  Multipliers,
  SideState,
  StatKey,
} from "./types.ts";

/** Ruby's Float#round is half-away-from-zero; every value it is applied to here is positive, so
 *  Math.round (half-up) agrees. */
const rround = (x: number) => Math.round(x);

function hasAbility(side: SideState, id: string): boolean {
  return side.ability === id;
}

/** Mold Breaker and friends make the target's ability ignorable. */
function moldBreaker(user: SideState): boolean {
  return hasAbility(user, "MOLDBREAKER") || hasAbility(user, "TERAVOLT") || hasAbility(user, "TURBOBLAZE");
}

/** How many targets the move hits - drives the 0.75 spread reduction. */
export function numTargetsFor(move: CalcMove, field: FieldState): number {
  if (!field.doubles) return 1;
  return ["AllNearFoes", "AllNearOthers", "AllFoes", "AllBattlers"].includes(move.tg) ? 2 : 1;
}

/** Physical moves use Atk/Def, special ones SpAtk/SpDef - with the handful of function codes that
 *  swap one side of that, which are common enough that leaving them out would visibly mislead. */
function attackStatKey(move: CalcMove): StatKey {
  if (move.fn === "UseUserDefenseInsteadOfUserAttack") return "defense"; // Body Press
  return move.c === "Physical" ? "attack" : "spAtk";
}

function defenseStatKey(move: CalcMove): StatKey {
  if (move.fn === "UseTargetDefenseInsteadOfTargetSpDef") return "defense"; // Psyshock/Psystrike
  return move.c === "Physical" ? "defense" : "spDef";
}

function applyWeather(ctx: EffectContext): void {
  const { field, type, move, target, multipliers: m } = ctx;
  switch (field.weather) {
    case "sun":
    case "harshSun":
      if (type === "FIRE") m.final *= 1.5;
      else if (type === "WATER") {
        // DBK ships this as `if @function_code = "IncreasePowerInSunWeather"` - a single `=`,
        // i.e. an assignment that is always truthy, so every Water move got the 1.5x boost meant
        // only for Hydro Steam. That has been fixed in the plugin; this implements the intent.
        if (move.fn === "IncreasePowerInSunWeather") m.final *= 1.5;
        else m.final /= 2;
      }
      break;
    case "rain":
    case "heavyRain":
      if (type === "FIRE") m.final /= 2;
      else if (type === "WATER") m.final *= 1.5;
      break;
    case "sandstorm":
      if (target.species.t.includes("ROCK") && move.c === "Special" && move.fn !== "UseTargetDefenseInsteadOfTargetSpDef") {
        m.defense *= 1.5;
      }
      break;
    case "hail":
      // Snow in Gen 9 terms (the Gen 9 Pack sets HAIL_WEATHER_TYPE = 1): Ice-types get a physical
      // defence boost rather than the old chip damage.
      if (target.species.t.includes("ICE") && (move.c === "Physical" || move.fn === "UseTargetDefenseInsteadOfTargetSpDef")) {
        m.defense *= 1.5;
      }
      break;
    case "shadowSky":
      if (type === "SHADOW") m.final *= 1.5;
      break;
  }
}

function applyTerrain(ctx: EffectContext): void {
  const { field, type, multipliers: m } = ctx;
  // MECHANICS_GENERATION is 9 here (set by the Gen 9 Pack), so the Gen 8+ 1.3x value applies.
  if (field.terrain === "electric" && type === "ELECTRIC") m.power *= 1.3;
  else if (field.terrain === "grassy" && type === "GRASS") m.power *= 1.3;
  else if (field.terrain === "psychic" && type === "PSYCHIC") m.power *= 1.3;
  else if (field.terrain === "misty" && type === "DRAGON") m.power /= 2;
}

function applyStatus(ctx: EffectContext): void {
  const { user, target, move, multipliers: m } = ctx;
  if (move.c === "Physical" && user.status === "burn" && !hasAbility(user, "GUTS")) m.final /= 2;
  if (move.c === "Special" && user.status === "frostbite") m.final /= 2;
  if (target.status === "drowsy") m.final *= 4 / 3.0;
}

function applyScreens(ctx: EffectContext): void {
  const { field, move, user, isCritical, multipliers: m } = ctx;
  // Screens are skipped entirely on a crit, and by Infiltrator.
  if (isCritical || hasAbility(user, "INFILTRATOR")) return;
  const factor = field.doubles ? 2 / 3.0 : 0.5;
  if (field.auroraVeil) m.final *= factor;
  else if (field.reflect && move.c === "Physical") m.final *= factor;
  else if (field.lightScreen && move.c === "Special") m.final *= factor;
}

/**
 * Runs the whole multiplier chain in the same order as DBK's pbCalcDamageMultipliers.
 *
 * `randomRoll` is threaded through rather than factored out and applied at the end: Essentials
 * applies it mid-chain (before Type/Status/Screens), and although the accumulators are plain
 * floats and therefore associative in exact arithmetic, IEEE-754 reassociation can differ by one
 * ulp and flip a `.round` that lands exactly on .5. Running the chain per roll costs nothing.
 */
function buildMultipliers(ctx: EffectContext, randomRoll: number): void {
  const { user, target, move, multipliers: m, field } = ctx;

  // --- Abilities ---
  AbilityEffects.DamageCalcFromUser.get(user.ability)?.(ctx);
  // A target's ability can be ignored by Mold Breaker; the NonIgnorable table never is.
  if (!moldBreaker(user)) AbilityEffects.DamageCalcFromTarget.get(target.ability)?.(ctx);
  AbilityEffects.DamageCalcFromTargetNonIgnorable.get(target.ability)?.(ctx);

  // --- Items ---
  ItemEffects.DamageCalcFromUser.get(user.item)?.(ctx);
  ItemEffects.DamageCalcFromTarget.get(target.item)?.(ctx);

  applyTerrain(ctx);

  // --- Spread reduction (0.75, not 0.5) ---
  if (numTargetsFor(move, field) > 1) m.final *= 0.75;

  applyWeather(ctx);

  // --- Random / critical ---
  // NEW_CRITICAL_HIT_RATE_MECHANICS is true at this generation, so a crit is 1.5x, not 2x.
  if (ctx.isCritical) m.final *= 1.5;
  m.final *= randomRoll / 100.0;

  // --- Type ---
  if (user.species.t.includes(ctx.type)) m.final *= hasAbility(user, "ADAPTABILITY") ? 2 : 1.5;
  m.final *= ctx.typeMod;

  applyStatus(ctx);
  applyScreens(ctx);
}

export interface CalcInput {
  attacker: SideState;
  defender: SideState;
  move: CalcMove;
  field: FieldState;
  typeById: Map<string, CalcType>;
  isCritical?: boolean;
}

/** The 16 possible random rolls Essentials picks from: 85 + rand(16). */
export const RANDOM_ROLLS = Array.from({ length: 16 }, (_, i) => 85 + i);

export function calculateDamage(input: CalcInput): DamageResult {
  const { attacker, defender, move, field, typeById } = input;
  const isCritical = input.isCritical ?? false;

  const defenderStats = calcAllStats(defender.species.b, defender.level, defender.ivs, defender.evs, defender.nature);
  const targetMaxHP = defenderStats.hp;

  const zero = (note: string): DamageResult => ({
    rolls: new Array(16).fill(0),
    min: 0,
    max: 0,
    percent: [0, 0],
    targetMaxHP,
    typeMod: 0,
    note,
  });

  if (move.c === "Status") return zero("Statusattacke - verursacht keinen Schaden.");

  // Moves whose damage doesn't come from the formula (Seismic Toss, OHKO moves, counters) are
  // reported as what they are. Running the normal formula on them would invent a number.
  const special = SPECIAL_DAMAGE[move.fn];
  if (special) {
    const { damage, note } = special(attacker, defender);
    if (damage === null) return { ...zero(note), typeMod: 1 };
    return {
      rolls: new Array(16).fill(damage),
      min: damage,
      max: damage,
      percent: [(damage / targetMaxHP) * 100, (damage / targetMaxHP) * 100],
      targetMaxHP,
      typeMod: 1,
      note,
    };
  }

  if (move.p === null || move.p <= 0) return zero("Diese Attacke hat keine feste Stärke.");

  const attackerStats = calcAllStats(attacker.species.b, attacker.level, attacker.ivs, attacker.evs, attacker.nature);

  // ModifyMoveBaseType (Pixilate, Aerilate, Normalize, ...) runs before anything reads the type.
  const baseCtxType = move.t;
  const typeHandler = AbilityEffects.ModifyMoveBaseType.get(attacker.ability);

  const rolls: number[] = [];
  let resolvedType = baseCtxType;
  let resolvedTypeMod = 1;

  for (const roll of RANDOM_ROLLS) {
    const multipliers: Multipliers = { power: 1, attack: 1, defense: 1, final: 1 };

    // Foul Play uses the TARGET's attack stat, but the user's stat stages still apply to it in
    // Essentials, so the stage handling below is intentionally left keyed on the attacker.
    const useTargetAttack = move.fn === "UseTargetAttackInsteadOfUserAttack";
    const atkKey = attackStatKey(move);
    const defKey = defenseStatKey(move);
    const rawAtk = useTargetAttack ? defenderStats[atkKey] : attackerStats[atkKey];
    const rawDef = defenderStats[defKey];

    // Base power: a weight- or HP-scaled function code replaces it outright, otherwise the PBS
    // value stands. Both are computed before any multiplier, matching pbBaseDamage.
    const weightPower = weightBasedPower(move.fn, attacker, defender);
    const basePower = weightPower ?? move.p;

    const ctx: EffectContext = {
      user: attacker,
      target: defender,
      move,
      type: baseCtxType,
      baseDamage: basePower,
      field,
      multipliers,
      typeMod: 1,
      isCritical,
    };
    const powerMod = POWER_MODIFIERS[move.fn];
    if (powerMod) multipliers.power *= powerMod(attacker, defender, move);
    if (typeHandler) ctx.type = typeHandler(ctx);
    ctx.typeMod = calcTypeMod(ctx.type, defender.species.t, typeById);
    resolvedType = ctx.type;
    resolvedTypeMod = ctx.typeMod;

    if (ctx.typeMod === 0) {
      return { ...zero("Keine Wirkung - der Verteidiger ist immun."), typeMod: 0 };
    }

    // Ability-granted immunity (Levitate, Volt Absorb, Wonder Guard, ...). Mold Breaker ignores
    // these, matching Essentials. Checked after typeMod so Wonder Guard can read it.
    if (!moldBreaker(attacker)) {
      const immune = AbilityEffects.MoveImmunity.get(defender.ability);
      if (immune?.(ctx)) {
        return {
          ...zero(`Keine Wirkung - ${abilityName(defender.ability)} macht den Verteidiger immun.`),
          typeMod: 0,
        };
      }
    }

    // Stat stages are applied here, floored, BEFORE any multiplier - matching Essentials.
    // On a crit the attacker's negative stages and the defender's positive stages are ignored.
    let atkStageIdx = Math.max(0, Math.min(12, (useTargetAttack ? defender.stages[atkKey] : attacker.stages[atkKey]) + 6));
    let defStageIdx = Math.max(0, Math.min(12, defender.stages[defKey] + 6));
    // Unaware on the target skips the attacker's stage application entirely (and Mold Breaker
    // overrides that); Unaware on the user skips the defender's. The asymmetry - only the
    // attacker branch has the Mold Breaker escape - is in the game's source, so it is kept.
    const applyAtkStage = !hasAbility(defender, "UNAWARE") || moldBreaker(attacker);
    const applyDefStage = !hasAbility(attacker, "UNAWARE");
    if (isCritical && atkStageIdx < NEUTRAL_STAGE_INDEX) atkStageIdx = NEUTRAL_STAGE_INDEX;
    if (isCritical && defStageIdx > NEUTRAL_STAGE_INDEX) defStageIdx = NEUTRAL_STAGE_INDEX;
    const atkStaged = applyAtkStage ? applyStage(rawAtk, atkStageIdx - 6) : rawAtk;
    const defStaged = applyDefStage ? applyStage(rawDef, defStageIdx - 6) : rawDef;

    buildMultipliers(ctx, roll);

    const baseDmg = Math.max(rround(ctx.baseDamage * multipliers.power), 1);
    const atk = Math.max(rround(atkStaged * multipliers.attack), 1);
    const def = Math.max(rround(defStaged * multipliers.defense), 1);
    const levelFactor = Math.floor((2.0 * attacker.level) / 5 + 2);
    let damage = Math.floor(Math.floor((levelFactor * baseDmg * atk) / def) / 50) + 2;
    damage = Math.max(rround(damage * multipliers.final), 1);
    rolls.push(damage);
  }

  rolls.sort((a, b) => a - b);
  const min = rolls[0];
  const max = rolls[rolls.length - 1];

  const notes: string[] = [];
  if (resolvedType !== baseCtxType) notes.push(`Attackentyp geändert zu ${resolvedType}.`);
  // Multi-hit moves: the rolls above are ONE hit, so report the count too rather than letting a
  // 2-5x move read as a single weak hit.
  const hits = HIT_COUNTS[move.fn];
  if (hits) notes.push(`${hits.note} - Werte gelten je Treffer.`);

  return {
    rolls,
    min,
    max,
    percent: [(min / targetMaxHP) * 100, (max / targetMaxHP) * 100],
    targetMaxHP,
    typeMod: resolvedTypeMod,
    hits: hits ? { min: hits.min, max: hits.max } : undefined,
    note: notes.length ? notes.join(" ") : undefined,
  };
}
