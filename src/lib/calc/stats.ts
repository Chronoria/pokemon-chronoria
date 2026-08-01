// Stat calculation and stat-stage handling.
//
// Transcribed from Essentials' Pokemon#calcHP / #calcStat. Every operation there is Ruby Integer
// arithmetic, so every division here must be an explicit floor - using plain JS `/` would drift
// by a point on many spreads.
import { natureModifier } from "./natures.ts";
import { STAT_KEYS, type StatKey } from "./types.ts";

export const IV_MAX = 31;
export const EV_MAX_PER_STAT = 252;
export const EV_MAX_TOTAL = 510;
export const LEVEL_MAX = 100;

/** Stat-stage tables from Battle::Battler. Index is stage + 6, so index 6 is stage 0. */
export const STAGE_MULTIPLIERS = [2, 2, 2, 2, 2, 2, 2, 3, 4, 5, 6, 7, 8];
export const STAGE_DIVISORS = [8, 7, 6, 5, 4, 3, 2, 2, 2, 2, 2, 2, 2];
/** Index of stage 0 in the tables above. Essentials calls this STAT_STAGE_MAXIMUM, which is
 *  misleading - pbGetAttackStats returns `stage + 6`, so 6 is the NEUTRAL index, not the highest
 *  one (that's 12, for stage +6). The crit clamp in damage.ts depends on this being neutral. */
export const NEUTRAL_STAGE_INDEX = 6;

export function calcHP(base: number, level: number, iv: number, ev: number): number {
  // Shedinja and anything else with 1 base HP is always a 1 HP Pokémon.
  if (base === 1) return 1;
  return Math.floor(((base * 2 + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

export function calcStat(base: number, level: number, iv: number, ev: number, natureMod: number): number {
  const inner = Math.floor(((base * 2 + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  return Math.floor((inner * natureMod) / 100);
}

/** Computes all six real stats from packed base stats (order = STAT_KEYS). */
export function calcAllStats(
  baseStats: number[],
  level: number,
  ivs: Record<StatKey, number>,
  evs: Record<StatKey, number>,
  natureId: string
): Record<StatKey, number> {
  const out = {} as Record<StatKey, number>;
  STAT_KEYS.forEach((key, i) => {
    const base = baseStats[i] ?? 1;
    out[key] =
      key === "hp"
        ? calcHP(base, level, ivs.hp, evs.hp)
        : calcStat(base, level, ivs[key], evs[key], natureModifier(natureId, key));
  });
  return out;
}

/**
 * Applies a stat stage. Essentials does this with `(stat.to_f * mul / div).floor` BEFORE any
 * damage multiplier touches the value, which is why it lives here rather than in the multiplier
 * chain - applying it later would round differently.
 */
export function applyStage(stat: number, stage: number): number {
  const idx = Math.max(0, Math.min(12, stage + 6));
  return Math.floor((stat * STAGE_MULTIPLIERS[idx]) / STAGE_DIVISORS[idx]);
}

export function emptyStats(value: number): Record<StatKey, number> {
  const out = {} as Record<StatKey, number>;
  for (const key of STAT_KEYS) out[key] = value;
  return out;
}
