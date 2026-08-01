// Ability damage effects.
//
// Each entry is a transcription of the corresponding Ruby handler. Provenance tags:
//   [core]      core Essentials v21.1 (Battle::AbilityEffects)
//   [Gen9]      Plugins/Generation 9 Pack Scripts/[004] Abilities/
//   [community] Plugins/Community Abilities/[004] Abilities/[000] Ability Handlers.rb
//
// Not every ability needs an entry - only those that change damage. Anything without one is
// reported as "not modelled" by the coverage check rather than silently ignored (see registry.ts).
import { AbilityEffects } from "../registry.ts";
import type { EffectContext } from "../types.ts";

const isPhysical = (ctx: EffectContext) => ctx.move.c === "Physical";
const hasFlag = (ctx: EffectContext, flag: string) => ctx.move.f.includes(flag);

// ---------------------------------------------------------------------------------------------
// Attack-boosting abilities (attack_multiplier)
// ---------------------------------------------------------------------------------------------
// [core] Huge Power / Pure Power double the physical attack stat itself.
AbilityEffects.DamageCalcFromUser.addMany(["HUGEPOWER", "PUREPOWER"], (ctx) => {
  if (isPhysical(ctx)) ctx.multipliers.attack *= 2;
});

// [core] Guts: 1.5x physical attack when statused. The burn's own halving is separately skipped
// for Guts users in damage.ts, matching Essentials.
AbilityEffects.DamageCalcFromUser.add("GUTS", (ctx) => {
  if (isPhysical(ctx) && ctx.user.status !== "none") ctx.multipliers.attack *= 1.5;
});

// [core] Hustle: 1.5x physical attack (the accuracy drop is not a damage concern).
AbilityEffects.DamageCalcFromUser.add("HUSTLE", (ctx) => {
  if (isPhysical(ctx)) ctx.multipliers.attack *= 1.5;
});

// [core] Solar Power: 1.5x special attack in sun.
AbilityEffects.DamageCalcFromUser.add("SOLARPOWER", (ctx) => {
  if (ctx.move.c === "Special" && (ctx.field.weather === "sun" || ctx.field.weather === "harshSun")) {
    ctx.multipliers.attack *= 1.5;
  }
});

// [core] Flash Fire: 1.5x Fire moves once activated. The calculator exposes this as "activated",
// since there is no battle history to infer it from.
AbilityEffects.DamageCalcFromUser.add("FLASHFIRE", (ctx) => {
  if (ctx.type === "FIRE") ctx.multipliers.attack *= 1.5;
});

// [core] Defeatist: halves both attacking stats at or below half HP.
AbilityEffects.DamageCalcFromUser.add("DEFEATIST", (ctx) => {
  if (ctx.user.hpFraction <= 0.5) ctx.multipliers.attack /= 2;
});

// [core] Pinch abilities: 1.5x on their own type at or below 1/3 HP.
const PINCH: Record<string, string> = {
  OVERGROW: "GRASS",
  BLAZE: "FIRE",
  TORRENT: "WATER",
  SWARM: "BUG",
};
for (const [ability, type] of Object.entries(PINCH)) {
  AbilityEffects.DamageCalcFromUser.add(ability, (ctx) => {
    if (ctx.type === type && ctx.user.hpFraction <= 1 / 3) ctx.multipliers.attack *= 1.5;
  });
}

// ---------------------------------------------------------------------------------------------
// Power-boosting abilities (power_multiplier)
// ---------------------------------------------------------------------------------------------
// [core] Technician: 1.5x on moves with base power <= 60 (checked after other power changes).
AbilityEffects.DamageCalcFromUser.add("TECHNICIAN", (ctx) => {
  if (ctx.baseDamage * ctx.multipliers.power <= 60) ctx.multipliers.power *= 1.5;
});

// [core] Flag-keyed power boosts. Note the flag spellings are Essentials', not Showdown's:
// "Punching" (not "punch"), "Biting" (not "bite"), "Bomb" (not "Bullet").
const FLAG_BOOSTS: [string, string, number][] = [
  ["IRONFIST", "Punching", 1.2],
  ["STRONGJAW", "Biting", 1.5],
  ["MEGALAUNCHER", "Pulse", 1.5],
  ["TOUGHCLAWS", "Contact", 1.3],
  ["PUNKROCK", "Sound", 1.3],
  ["SHARPNESS", "Slicing", 1.5], // [Gen9]
];
for (const [ability, flag, mult] of FLAG_BOOSTS) {
  AbilityEffects.DamageCalcFromUser.add(ability, (ctx) => {
    if (hasFlag(ctx, flag)) ctx.multipliers.power *= mult;
  });
}

// [core] Type-boosting abilities.
const TYPE_BOOSTS: [string, string, number][] = [
  ["TRANSISTOR", "ELECTRIC", 1.3], // [Gen9] re-registered at 1.3 (was 1.5 pre-Gen9)
  ["DRAGONSMAW", "DRAGON", 1.5],
  ["STEELWORKER", "STEEL", 1.5],
  ["STEELYSPIRIT", "STEEL", 1.5],
  ["ROCKYPAYLOAD", "ROCK", 1.5], // [Gen9]
  ["WATERBUBBLE", "WATER", 2],
];
for (const [ability, type, mult] of TYPE_BOOSTS) {
  AbilityEffects.DamageCalcFromUser.add(ability, (ctx) => {
    if (ctx.type === type) ctx.multipliers.power *= mult;
  });
}

// [core] Sheer Force: 1.3x on moves with a secondary effect (which it suppresses).
AbilityEffects.DamageCalcFromUser.add("SHEERFORCE", (ctx) => {
  if (ctx.move.fn !== "None") ctx.multipliers.power *= 1.3;
});

// [core] Reckless: 1.2x on recoil moves. Detected via FunctionCode, which is exactly why the
// importer now keeps that field.
AbilityEffects.DamageCalcFromUser.add("RECKLESS", (ctx) => {
  if (ctx.move.fn.startsWith("Recoil")) ctx.multipliers.power *= 1.2;
});

// [core] Analytic: 1.3x when moving last. The calculator has no turn order, so it is offered as
// an explicit toggle rather than guessed - modelled here as always-on when selected.
AbilityEffects.DamageCalcFromUser.add("ANALYTIC", (ctx) => {
  ctx.multipliers.power *= 1.3;
});

// [core] Tinted Lens: doubles damage against resisted targets.
AbilityEffects.DamageCalcFromUser.add("TINTEDLENS", (ctx) => {
  if (ctx.typeMod < 1) ctx.multipliers.final *= 2;
});

// [core] Neuroforce: 1.25x against super-effective hits.
AbilityEffects.DamageCalcFromUser.add("NEUROFORCE", (ctx) => {
  if (ctx.typeMod > 1) ctx.multipliers.final *= 1.25;
});

// [core] Sand Force: 1.3x on Rock/Ground/Steel in a sandstorm.
AbilityEffects.DamageCalcFromUser.add("SANDFORCE", (ctx) => {
  if (ctx.field.weather === "sandstorm" && ["ROCK", "GROUND", "STEEL"].includes(ctx.type)) {
    ctx.multipliers.power *= 1.3;
  }
});

// ---------------------------------------------------------------------------------------------
// ModifyMoveBaseType - the -ate abilities
// ---------------------------------------------------------------------------------------------
const ATE: [string, string][] = [
  ["AERILATE", "FLYING"],
  ["PIXILATE", "FAIRY"],
  ["REFRIGERATE", "ICE"],
  ["GALVANIZE", "ELECTRIC"],
];
for (const [ability, type] of ATE) {
  AbilityEffects.ModifyMoveBaseType.add(ability, (ctx) => (ctx.move.t === "NORMAL" ? type : ctx.move.t));
  AbilityEffects.DamageCalcFromUser.add(ability, (ctx) => {
    if (ctx.move.t === "NORMAL") ctx.multipliers.power *= 1.2;
  });
}
AbilityEffects.ModifyMoveBaseType.add("NORMALIZE", () => "NORMAL");
AbilityEffects.DamageCalcFromUser.add("NORMALIZE", (ctx) => {
  ctx.multipliers.power *= 1.2;
});
// [core] Liquid Voice turns sound moves into Water moves (no power change).
AbilityEffects.ModifyMoveBaseType.add("LIQUIDVOICE", (ctx) =>
  hasFlag(ctx, "Sound") ? "WATER" : ctx.move.t
);

// ---------------------------------------------------------------------------------------------
// Defensive abilities (DamageCalcFromTarget)
// ---------------------------------------------------------------------------------------------
// [core] Thick Fat: halves the attack stat for Fire and Ice moves.
AbilityEffects.DamageCalcFromTarget.add("THICKFAT", (ctx) => {
  if (ctx.type === "FIRE" || ctx.type === "ICE") ctx.multipliers.attack /= 2;
});

// [core] Heatproof halves Fire; Water Bubble also halves Fire taken.
AbilityEffects.DamageCalcFromTarget.add("HEATPROOF", (ctx) => {
  if (ctx.type === "FIRE") ctx.multipliers.attack /= 2;
});

// [core] Damage reducers against super-effective hits.
AbilityEffects.DamageCalcFromTarget.addMany(["FILTER", "SOLIDROCK"], (ctx) => {
  if (ctx.typeMod > 1) ctx.multipliers.final *= 0.75;
});
// Prism Armor and Shadow Shield do the same but cannot be ignored by Mold Breaker.
AbilityEffects.DamageCalcFromTargetNonIgnorable.add("PRISMARMOR", (ctx) => {
  if (ctx.typeMod > 1) ctx.multipliers.final *= 0.75;
});
AbilityEffects.DamageCalcFromTargetNonIgnorable.add("SHADOWSHIELD", (ctx) => {
  if (ctx.target.hpFraction >= 1) ctx.multipliers.final /= 2;
});

// [core] Multiscale: halves damage at full HP.
AbilityEffects.DamageCalcFromTarget.add("MULTISCALE", (ctx) => {
  if (ctx.target.hpFraction >= 1) ctx.multipliers.final /= 2;
});

// [core] Fluffy: halves contact damage, doubles Fire damage (both can apply at once).
AbilityEffects.DamageCalcFromTarget.add("FLUFFY", (ctx) => {
  if (hasFlag(ctx, "Contact")) ctx.multipliers.final /= 2;
  if (ctx.type === "FIRE") ctx.multipliers.final *= 2;
});

// [core] Ice Scales halves special damage; Fur Coat halves physical.
AbilityEffects.DamageCalcFromTarget.add("ICESCALES", (ctx) => {
  if (ctx.move.c === "Special") ctx.multipliers.final /= 2;
});
AbilityEffects.DamageCalcFromTarget.add("FURCOAT", (ctx) => {
  if (isPhysical(ctx)) ctx.multipliers.defense *= 2;
});

// [core] Marvel Scale: 1.5x defence when statused.
AbilityEffects.DamageCalcFromTarget.add("MARVELSCALE", (ctx) => {
  if (isPhysical(ctx) && ctx.target.status !== "none") ctx.multipliers.defense *= 1.5;
});

// [core] Grass Pelt: 1.5x defence on Grassy Terrain.
AbilityEffects.DamageCalcFromTarget.add("GRASSPELT", (ctx) => {
  if (isPhysical(ctx) && ctx.field.terrain === "grassy") ctx.multipliers.defense *= 1.5;
});

// [core] Punk Rock also halves sound damage taken.
AbilityEffects.DamageCalcFromTarget.add("PUNKROCK", (ctx) => {
  if (hasFlag(ctx, "Sound")) ctx.multipliers.final /= 2;
});

// ---------------------------------------------------------------------------------------------
// Critical hit abilities
// ---------------------------------------------------------------------------------------------
AbilityEffects.CriticalCalcFromUser.add("SUPERLUCK", (ctx) => ctx.critStage + 1);
AbilityEffects.CriticalCalcFromUser.add("SNIPER", (ctx) => ctx.critStage); // damage side handled below
AbilityEffects.CriticalCalcFromTarget.addMany(["BATTLEARMOR", "SHELLARMOR"], () => false);

// [core] Sniper: 1.5x on top of the crit multiplier.
AbilityEffects.DamageCalcFromUser.add("SNIPER", (ctx) => {
  if (ctx.isCritical) ctx.multipliers.final *= 1.5;
});
