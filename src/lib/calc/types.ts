// Shared types for the damage calculator engine.
//
// The engine is deliberately DOM-free and data-source-free: it takes plain objects and returns
// plain numbers, so it can be exercised from a script, a test, or the page alike. Everything it
// needs about a Pokémon/move arrives through these structures rather than being looked up.

/** Stat keys in the order used by the packed base-stat array in calc-data.json. */
export const STAT_KEYS = ["hp", "attack", "defense", "speed", "spAtk", "spDef"] as const;
export type StatKey = (typeof STAT_KEYS)[number];

/** A Pokémon entry from calc-data.json (`p`), species or form. */
export interface CalcSpecies {
  /** "BULBASAUR" for a base species, "CHARIZARD#1" for a form. */
  k: string;
  n: string;
  /** Form label ("Mega X", ...) - absent on base species. */
  fl?: string;
  t: string[];
  /** Packed base stats, see STAT_KEYS. */
  b: number[];
  a: string[];
  h: string[];
  s: string | null;
  w: number;
  /** Indices into the moves array of learnable moves. */
  l: number[];
}

export interface CalcMove {
  i: string;
  n: string;
  t: string;
  /** "Physical" | "Special" | "Status" */
  c: string;
  p: number | null;
  a: number | null;
  pr: number;
  tg: string;
  f: string[];
  /** PBS FunctionCode, e.g. "IncreasePowerInSunWeather". "None" when the move has no effect. */
  fn: string;
}

export interface CalcType {
  i: string;
  n: string;
  w: string[];
  r: string[];
  im: string[];
}

export type Weather = "none" | "sun" | "harshSun" | "rain" | "heavyRain" | "sandstorm" | "hail" | "shadowSky";
export type Terrain = "none" | "electric" | "grassy" | "misty" | "psychic";
export type Status = "none" | "burn" | "poison" | "badPoison" | "paralysis" | "sleep" | "freeze" | "frostbite" | "drowsy";

/** One side's full configuration. */
export interface SideState {
  species: CalcSpecies;
  level: number;
  ability: string | null;
  item: string | null;
  nature: string;
  /** Per-stat IVs, keyed by StatKey. */
  ivs: Record<StatKey, number>;
  evs: Record<StatKey, number>;
  /** Stat stages -6..+6. HP is unused but kept for a uniform shape. */
  stages: Record<StatKey, number>;
  status: Status;
  /** Current HP as a fraction 0..1, used for pinch abilities (Overgrow etc.). */
  hpFraction: number;
}

export interface FieldState {
  weather: Weather;
  terrain: Terrain;
  doubles: boolean;
  reflect: boolean;
  lightScreen: boolean;
  auroraVeil: boolean;
}

/**
 * The four multiplier accumulators from Essentials' pbCalcDamage. They stay plain floats and are
 * multiplied together with no intermediate rounding - matching the game exactly (see damage.ts).
 */
export interface Multipliers {
  power: number;
  attack: number;
  defense: number;
  final: number;
}

/** Context handed to every ability/item effect handler - mirrors the Ruby handler arguments. */
export interface EffectContext {
  user: SideState;
  target: SideState;
  move: CalcMove;
  /** The move's type after any ModifyMoveBaseType handler ran - may differ from move.t. */
  type: string;
  baseDamage: number;
  field: FieldState;
  multipliers: Multipliers;
  /** Type effectiveness of `type` against the target, already combined across both its types. */
  typeMod: number;
  isCritical: boolean;
}

export interface DamageResult {
  /** The 16 possible damage values (random rolls 85..100), ascending. */
  rolls: number[];
  min: number;
  max: number;
  /** Percentage of the target's max HP, as [min, max]. */
  percent: [number, number];
  targetMaxHP: number;
  typeMod: number;
  /** Set when the move can't deal damage at all (status move, or immune) - rolls will be all 0. */
  note?: string;
}
