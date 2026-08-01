// Ability and item effect registries.
//
// These mirror Essentials' Battle::AbilityEffects / Battle::ItemEffects hash-of-handler-hashes
// one-to-one, including the hook names. That is deliberate: porting a handler from the game's
// Ruby source should be a transcription, not a redesign, so that a reader can diff a handler here
// against its original. Ruby:
//
//   AbilityEffects::DamageCalcFromUser.add(:HUGEPOWER,
//     proc { |ability, user, target, move, mults, baseDmg, type| mults[:attack_multiplier] *= 2 }
//   )
//
// becomes:
//
//   AbilityEffects.DamageCalcFromUser.add("HUGEPOWER", ({ mults }) => { mults.attack *= 2; });
//
// Handlers MUTATE `mults` and return nothing, exactly like the Ruby procs.
import type { EffectContext } from "./types.ts";

export type DamageCalcHandler = (ctx: EffectContext) => void;
/** Ruby returns an Integer to bump the crit stage, or true/false to force/deny a crit outright. */
export type CritCalcHandler = (ctx: EffectContext & { critStage: number }) => number | boolean;
/** Returns the replacement move type (e.g. Pixilate turning Normal moves into Fairy). */
export type MoveBaseTypeHandler = (ctx: EffectContext) => string;

class HookTable<F> {
  private handlers = new Map<string, F>();

  add(id: string, fn: F): this {
    this.handlers.set(id, fn);
    return this;
  }

  /** Registers the same handler for many ids - used by the type-boosting item families, where
   *  Essentials itself registers in a loop over the type list. */
  addMany(ids: string[], fn: F): this {
    for (const id of ids) this.handlers.set(id, fn);
    return this;
  }

  /** Mirrors Ruby's `.copy(:FROM, :TO)`, which the Gen 9 Pack uses to alias abilities with
   *  identical damage behaviour (e.g. Quark Drive off Protosynthesis). */
  copy(from: string, ...to: string[]): this {
    const fn = this.handlers.get(from);
    if (fn) for (const id of to) this.handlers.set(id, fn);
    return this;
  }

  has(id: string | null | undefined): boolean {
    return id != null && this.handlers.has(id);
  }

  get(id: string | null | undefined): F | undefined {
    return id == null ? undefined : this.handlers.get(id);
  }

  /** Registered ids - used by coverage reporting so the UI can say what it does NOT model. */
  ids(): string[] {
    return [...this.handlers.keys()];
  }
}

export const AbilityEffects = {
  DamageCalcFromUser: new HookTable<DamageCalcHandler>(),
  DamageCalcFromAlly: new HookTable<DamageCalcHandler>(),
  DamageCalcFromTarget: new HookTable<DamageCalcHandler>(),
  DamageCalcFromTargetNonIgnorable: new HookTable<DamageCalcHandler>(),
  DamageCalcFromTargetAlly: new HookTable<DamageCalcHandler>(),
  CriticalCalcFromUser: new HookTable<CritCalcHandler>(),
  CriticalCalcFromTarget: new HookTable<CritCalcHandler>(),
  ModifyMoveBaseType: new HookTable<MoveBaseTypeHandler>(),
};

export const ItemEffects = {
  DamageCalcFromUser: new HookTable<DamageCalcHandler>(),
  DamageCalcFromTarget: new HookTable<DamageCalcHandler>(),
  CriticalCalcFromUser: new HookTable<CritCalcHandler>(),
  CriticalCalcFromTarget: new HookTable<CritCalcHandler>(),
};

/**
 * Abilities the formula handles directly rather than through a hook, because Essentials does the
 * same - they sit inline in pbCalcDamage/pbCalcDamageMultipliers instead of in an effect table.
 * They're listed here so the coverage check doesn't wrongly report them as unmodelled.
 */
export const INLINE_ABILITIES = new Set([
  "ADAPTABILITY", // STAB 1.5 -> 2.0, in the Type stage
  "INFILTRATOR", // bypasses screens, in the Screens stage
  "UNAWARE", // skips stat-stage application
  "MOLDBREAKER",
  "TERAVOLT",
  "TURBOBLAZE",
]);

/**
 * True if the given ability/item is modelled by ANY damage-relevant hook.
 *
 * The UI uses this to tell the user outright when a selected ability or item is not accounted
 * for. Silently returning a number that ignores a chosen effect would be worse than useless -
 * the user would have no way to know the result is wrong.
 */
export function isAbilityModelled(id: string | null | undefined): boolean {
  if (id != null && INLINE_ABILITIES.has(id)) return true;
  return Object.values(AbilityEffects).some((table) => table.has(id));
}

export function isItemModelled(id: string | null | undefined): boolean {
  return Object.values(ItemEffects).some((table) => table.has(id));
}
