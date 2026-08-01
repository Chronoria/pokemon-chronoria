// Type effectiveness.
//
// Same logic as src/components/TypeChart.astro's multiplier(), but driven by the calculator's own
// data payload so this module stays free of src/lib/data.ts (see data.ts for why that matters).
//
// Essentials stores effectiveness as integers 0/1/2/4 and divides by 2 to get the multiplier, and
// combines dual types by plain multiplication with no clamping - so 4x and 0.25x arise naturally.
import type { CalcType } from "./types.ts";

/** Effectiveness of one attacking type against one defending type. */
export function singleTypeMod(attackingType: string, defender: CalcType): number {
  if (defender.im.includes(attackingType)) return 0;
  if (defender.w.includes(attackingType)) return 2;
  if (defender.r.includes(attackingType)) return 0.5;
  return 1;
}

/** Combined effectiveness against a (possibly dual-typed) defender. */
export function typeMod(attackingType: string, defenderTypes: string[], typeById: Map<string, CalcType>): number {
  let mod = 1;
  for (const t of defenderTypes) {
    const def = typeById.get(t);
    // An unknown defending type (e.g. the pseudo-type QMARKS, which is filtered out of the
    // payload) contributes neutrally rather than silently zeroing the whole calculation.
    if (def) mod *= singleTypeMod(attackingType, def);
  }
  return mod;
}

/** Human-readable label for an effectiveness multiplier, for the results panel. */
export function effectivenessLabel(mod: number): string {
  if (mod === 0) return "Keine Wirkung";
  if (mod >= 4) return "Extrem effektiv (4x)";
  if (mod > 1) return "Sehr effektiv (2x)";
  if (mod === 1) return "Normal wirksam";
  if (mod >= 0.5) return "Nicht sehr effektiv (½x)";
  return "Kaum wirksam (¼x)";
}
