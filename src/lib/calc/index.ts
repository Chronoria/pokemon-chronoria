// Public entry point for the damage calculator engine.
//
// Importing this module also registers every effect handler (the ./effects/* imports below are
// for their side effects), so consumers never have to remember to pull them in separately.
import "./effects/abilities.ts";
import "./effects/items.ts";

import { calculateDamage, type CalcInput } from "./damage.ts";
import { speciesByKey, typeById } from "./data.ts";
import { ASSUMED_ACTIVE, isAbilityModelled, isItemModelled } from "./registry.ts";
import { calcAllStats, emptyStats, EV_MAX_PER_STAT, EV_MAX_TOTAL, IV_MAX, LEVEL_MAX } from "./stats.ts";
import { effectivenessLabel } from "./typechart.ts";
import type { CalcMove, DamageResult, FieldState, SideState, StatKey } from "./types.ts";

export * from "./types.ts";
export { NATURES, natureById } from "./natures.ts";
export { speciesList, moveList, abilityList, itemList, typeList, speciesByKey, moveById, itemById, abilityById, typeById, speciesLabel, abilityName, itemName, typeName } from "./data.ts";
export { calcAllStats, emptyStats, applyStage, IV_MAX, EV_MAX_PER_STAT, EV_MAX_TOTAL, LEVEL_MAX } from "./stats.ts";
export { effectivenessLabel } from "./typechart.ts";
export { isAbilityModelled, isItemModelled, ASSUMED_ACTIVE } from "./registry.ts";

/** A default, neutral side - the state the UI starts from. */
export function defaultSide(speciesKey: string): SideState {
  const species = speciesByKey.get(speciesKey) ?? speciesByKey.values().next().value!;
  return {
    species,
    level: 50,
    ability: species.a[0] ?? null,
    item: null,
    nature: "HARDY",
    ivs: emptyStats(IV_MAX),
    evs: emptyStats(0),
    stages: emptyStats(0),
    status: "none",
    hpFraction: 1,
  };
}

export function defaultField(): FieldState {
  return {
    weather: "none",
    terrain: "none",
    doubles: false,
    reflect: false,
    lightScreen: false,
    auroraVeil: false,
  };
}

export interface CalcOutcome extends DamageResult {
  /** Effects the user selected that the engine does not model yet - surfaced in the UI so a
   *  result is never silently wrong. */
  unmodelled: string[];
  /** Effects that WERE applied but only under an assumption the calculator can't verify
   *  (e.g. Flash Fire counted as already activated). Also surfaced, for the same reason. */
  assumptions: string[];
  effectivenessLabel: string;
}

export function calculate(
  attacker: SideState,
  defender: SideState,
  move: CalcMove,
  field: FieldState,
  isCritical = false
): CalcOutcome {
  const result = calculateDamage({ attacker, defender, move, field, typeById, isCritical } satisfies CalcInput);

  const unmodelled: string[] = [];
  if (attacker.ability && !isAbilityModelled(attacker.ability)) unmodelled.push(`ability:${attacker.ability}`);
  if (defender.ability && !isAbilityModelled(defender.ability)) unmodelled.push(`ability:${defender.ability}`);
  if (attacker.item && !isItemModelled(attacker.item)) unmodelled.push(`item:${attacker.item}`);
  if (defender.item && !isItemModelled(defender.item)) unmodelled.push(`item:${defender.item}`);

  const assumptions: string[] = [];
  for (const ability of [attacker.ability, defender.ability]) {
    const note = ability ? ASSUMED_ACTIVE.get(ability) : undefined;
    if (ability && note) assumptions.push(`${ability}:${note}`);
  }

  return { ...result, unmodelled, assumptions, effectivenessLabel: effectivenessLabel(result.typeMod) };
}

/** Convenience for the UI's stat table. */
export function statsFor(side: SideState): Record<StatKey, number> {
  return calcAllStats(side.species.b, side.level, side.ivs, side.evs, side.nature);
}

export { LEVEL_MAX as MAX_LEVEL };
