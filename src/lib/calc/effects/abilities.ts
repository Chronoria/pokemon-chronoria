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
import { calcAllStats } from "../stats.ts";
import { typeById } from "../data.ts";
import { singleTypeMod } from "../typechart.ts";
import type { EffectContext, StatKey } from "../types.ts";

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

// ---------------------------------------------------------------------------------------------
// Move immunities
// ---------------------------------------------------------------------------------------------
// These matter more than any damage multiplier: without them the calculator reports a full hit
// where the real answer is a flat zero (a Levitate holder "taking" an Earthquake, say).
const TYPE_IMMUNITIES: [string, string][] = [
  ["LEVITATE", "GROUND"],
  ["EARTHEATER", "GROUND"],
  ["VOLTABSORB", "ELECTRIC"],
  ["LIGHTNINGROD", "ELECTRIC"],
  ["MOTORDRIVE", "ELECTRIC"],
  ["WATERABSORB", "WATER"],
  ["STORMDRAIN", "WATER"],
  ["DRYSKIN", "WATER"],
  ["FLASHFIRE", "FIRE"],
  ["WELLBAKEDBODY", "FIRE"],
  ["SAPSIPPER", "GRASS"],
];
for (const [ability, type] of TYPE_IMMUNITIES) {
  AbilityEffects.MoveImmunity.add(ability, (ctx) => ctx.type === type);
}

// Flag-based immunities.
AbilityEffects.MoveImmunity.add("BULLETPROOF", (ctx) => hasFlag(ctx, "Bomb"));
AbilityEffects.MoveImmunity.add("SOUNDPROOF", (ctx) => hasFlag(ctx, "Sound"));
AbilityEffects.MoveImmunity.add("WINDRIDER", (ctx) => hasFlag(ctx, "Wind"));
// Wonder Guard lets through only super-effective damage.
AbilityEffects.MoveImmunity.add("WONDERGUARD", (ctx) => ctx.typeMod <= 1);

// ---------------------------------------------------------------------------------------------
// Remaining core abilities
// ---------------------------------------------------------------------------------------------
// [core] Rivalry: 1.25x against the same gender, 0.75x against the opposite. Gender isn't part of
// the calculator's inputs, so it stays unregistered and gets reported as unmodelled instead of
// silently picking one of the two branches.

// [core] Stakeout: doubles damage against a target that just switched in.
AbilityEffects.DamageCalcFromUser.add("STAKEOUT", (ctx) => {
  ctx.multipliers.attack *= 2;
});

// [core] Toxic Boost / Flare Boost: 1.5x when statused with poison / burn respectively.
AbilityEffects.DamageCalcFromUser.add("TOXICBOOST", (ctx) => {
  if (isPhysical(ctx) && (ctx.user.status === "poison" || ctx.user.status === "badPoison")) {
    ctx.multipliers.attack *= 1.5;
  }
});
AbilityEffects.DamageCalcFromUser.add("FLAREBOOST", (ctx) => {
  if (ctx.move.c === "Special" && ctx.user.status === "burn") ctx.multipliers.attack *= 1.5;
});

// [core] Slow Start: halves physical attack (for its first five turns - assumed active while
// selected is wrong more often than right, so this is left literal: it applies).
AbilityEffects.DamageCalcFromUser.add("SLOWSTART", (ctx) => {
  if (isPhysical(ctx)) ctx.multipliers.attack /= 2;
});

// [core] Gorilla Tactics: 1.5x physical attack (DBK re-registers it with a powerMove? guard,
// which doesn't apply to any move the calculator models).
AbilityEffects.DamageCalcFromUser.add("GORILLATACTICS", (ctx) => {
  if (isPhysical(ctx)) ctx.multipliers.attack *= 1.5;
});

// [core] Dry Skin: takes 1.25x from Fire.
AbilityEffects.DamageCalcFromTarget.add("DRYSKIN", (ctx) => {
  if (ctx.type === "FIRE") ctx.multipliers.final *= 1.25;
});

// [core] Water Bubble also halves Fire damage taken.
AbilityEffects.DamageCalcFromTarget.add("WATERBUBBLE", (ctx) => {
  if (ctx.type === "FIRE") ctx.multipliers.attack /= 2;
});

// [core] Friend Guard reduces damage to allies - only meaningful in doubles.
AbilityEffects.DamageCalcFromTargetAlly.add("FRIENDGUARD", (ctx) => {
  ctx.multipliers.final *= 0.75;
});

// ---------------------------------------------------------------------------------------------
// [Gen9] Plugins/Generation 9 Pack Scripts/[004] Abilities/[001] New Ability Handlers.rb
// ---------------------------------------------------------------------------------------------
AbilityEffects.DamageCalcFromUser.add("ORICHALCUMPULSE", (ctx) => {
  if (isPhysical(ctx) && (ctx.field.weather === "sun" || ctx.field.weather === "harshSun")) {
    ctx.multipliers.attack *= 4 / 3.0;
  }
});

AbilityEffects.DamageCalcFromUser.add("HADRONENGINE", (ctx) => {
  if (ctx.move.c === "Special" && ctx.field.terrain === "electric") ctx.multipliers.attack *= 4 / 3.0;
});

AbilityEffects.DamageCalcFromTarget.add("PURIFYINGSALT", (ctx) => {
  if (ctx.type === "GHOST") ctx.multipliers.attack /= 2;
});

// Protosynthesis / Quark Drive boost whichever stat is highest, once their field condition is up.
// Unlike most state-dependent abilities this one IS derivable here: the trigger is the weather or
// terrain (both are calculator inputs) and the boosted stat is simply the holder's highest.
function paradoxBoost(ctx: EffectContext, side: "user" | "target", trigger: boolean): void {
  if (!trigger) return;
  const battler = side === "user" ? ctx.user : ctx.target;
  const stats = calcAllStats(battler.species.b, battler.level, battler.ivs, battler.evs, battler.nature);
  // Highest among the four combat stats plus Speed, matching the game's ParadoxStat pick.
  const candidates: StatKey[] = ["attack", "defense", "spAtk", "spDef", "speed"];
  let best: StatKey = "attack";
  for (const key of candidates) if (stats[key] > stats[best]) best = key;
  if (side === "user") {
    if (ctx.move.c === "Physical" && best === "attack") ctx.multipliers.attack *= 1.3;
    if (ctx.move.c === "Special" && best === "spAtk") ctx.multipliers.attack *= 1.3;
  } else {
    if (ctx.move.c === "Physical" && best === "defense") ctx.multipliers.defense *= 1.3;
    if (ctx.move.c === "Special" && best === "spDef") ctx.multipliers.defense *= 1.3;
  }
}
AbilityEffects.DamageCalcFromUser.add("PROTOSYNTHESIS", (ctx) =>
  paradoxBoost(ctx, "user", ctx.field.weather === "sun" || ctx.field.weather === "harshSun")
);
AbilityEffects.DamageCalcFromTarget.add("PROTOSYNTHESIS", (ctx) =>
  paradoxBoost(ctx, "target", ctx.field.weather === "sun" || ctx.field.weather === "harshSun")
);
AbilityEffects.DamageCalcFromUser.add("QUARKDRIVE", (ctx) =>
  paradoxBoost(ctx, "user", ctx.field.terrain === "electric")
);
AbilityEffects.DamageCalcFromTarget.add("QUARKDRIVE", (ctx) =>
  paradoxBoost(ctx, "target", ctx.field.terrain === "electric")
);

// Supreme Overlord scales with how many allies have fainted - there is no sensible default for
// that in a calculator, so it stays unregistered and is reported as not modelled.

// ---------------------------------------------------------------------------------------------
// [community] Plugins/Community Abilities/[004] Abilities/[000] Ability Handlers.rb
// ---------------------------------------------------------------------------------------------
AbilityEffects.DamageCalcFromUser.add("CORRUPTEDCODE", (ctx) => {
  if (ctx.type === "POISON") ctx.multipliers.attack *= 1.5;
});

AbilityEffects.DamageCalcFromUser.add("AQUATICBLOOD", (ctx) => {
  if (ctx.type === "WATER") ctx.multipliers.attack *= 1.5;
});
AbilityEffects.DamageCalcFromTarget.add("AQUATICBLOOD", (ctx) => {
  if (["FIRE", "ICE", "STEEL", "WATER"].includes(ctx.type)) ctx.multipliers.power /= 2;
  if (["ELECTRIC", "GRASS"].includes(ctx.type)) ctx.multipliers.power *= 2;
});

// Rusted Feathers halves its own attack unconditionally and takes double from Water.
AbilityEffects.DamageCalcFromUser.add("RUSTEDFEATHERS", (ctx) => {
  ctx.multipliers.attack /= 2;
});
AbilityEffects.DamageCalcFromTarget.add("RUSTEDFEATHERS", (ctx) => {
  if (ctx.type === "WATER") ctx.multipliers.power *= 2;
});

AbilityEffects.DamageCalcFromUser.add("MADSCIENTIST", (ctx) => {
  if (["FIRE", "POISON", "FAIRY"].includes(ctx.type)) ctx.multipliers.attack *= 1.5;
});

AbilityEffects.DamageCalcFromUser.add("ARCANEMAGE", (ctx) => {
  if (["FIRE", "ICE", "ELECTRIC"].includes(ctx.type)) ctx.multipliers.attack *= 1.5;
});

// Unconcerned stacks: a Rock/Steel target is hit at x4, exactly as the Ruby reads.
AbilityEffects.DamageCalcFromUser.add("UNCONCERNED", (ctx) => {
  if (ctx.type !== "NORMAL") return;
  if (ctx.target.species.t.includes("ROCK")) ctx.multipliers.attack *= 2;
  if (ctx.target.species.t.includes("STEEL")) ctx.multipliers.attack *= 2;
});

// Neutralize makes the move typeless (QMARKS) and then boosts it. QMARKS has no relations, so
// the type chart yields a flat 1x - which is the intended "ignores resistances" behaviour.
AbilityEffects.ModifyMoveBaseType.add("NEUTRALIZE", () => "QMARKS");
AbilityEffects.DamageCalcFromUser.add("NEUTRALIZE", (ctx) => {
  if (ctx.type === "QMARKS") ctx.multipliers.attack *= 1.8;
});

AbilityEffects.DamageCalcFromUser.add("KINGSWRATH", (ctx) => {
  // Custom flags added by the same plugin (Community Abilities/[001] Battle/[001] Battle.rb).
  if (hasFlag(ctx, "Drill") || hasFlag(ctx, "Horn")) ctx.multipliers.attack *= 1.3;
});

AbilityEffects.DamageCalcFromUser.add("BOULDERBARRIER", (ctx) => {
  if (ctx.type === "ROCK") ctx.multipliers.attack *= 1.5;
});

AbilityEffects.DamageCalcFromTarget.add("SOLARFIELD", (ctx) => {
  if (ctx.move.c === "Special" && (ctx.field.weather === "sun" || ctx.field.weather === "harshSun")) {
    ctx.multipliers.defense *= 1.5;
  }
});

// Echolocation takes MORE from sound moves, not less.
AbilityEffects.DamageCalcFromTarget.add("ECHOLOCATION", (ctx) => {
  if (hasFlag(ctx, "Sound")) ctx.multipliers.final *= 1.5;
});

AbilityEffects.DamageCalcFromTarget.add("IGNITION", (ctx) => {
  if (ctx.type === "FIRE") ctx.multipliers.power /= 2;
});
AbilityEffects.DamageCalcFromTarget.add("EXTINGUISH", (ctx) => {
  if (ctx.type === "WATER") ctx.multipliers.power /= 2;
});

AbilityEffects.CriticalCalcFromUser.add("GOODLUCK", (ctx) => ctx.critStage + 1);

// Compacted Ice and Power Shield INVERT type effectiveness by applying the opposite multiplier
// per defending type, on top of the normal type chart. Both loop over the target's types, so a
// dual-type is affected twice - modelled literally, because that's what the game does.
function invertEffectiveness(ctx: EffectContext, attackingType: string): void {
  for (const defType of ctx.target.species.t) {
    const def = typeById.get(defType);
    if (!def) continue;
    const mod = singleTypeMod(attackingType, def);
    if (mod > 1) ctx.multipliers.power /= 2;
    else if (mod < 1) ctx.multipliers.power *= 2;
  }
}
AbilityEffects.DamageCalcFromTarget.add("COMPACTEDICE", (ctx) => {
  if (ctx.type !== "ROCK" && ctx.type !== "STEEL") return;
  invertEffectiveness(ctx, ctx.type);
});
AbilityEffects.DamageCalcFromTarget.add("POWERSHIELD", (ctx) => {
  invertEffectiveness(ctx, ctx.type);
  ctx.multipliers.power /= 2;
});
// Power Shield also registers ModifyMoveBaseType in the plugin, but Essentials only consults the
// USER's ability for that hook - so it only applies when the Power Shield holder is attacking.
AbilityEffects.ModifyMoveBaseType.add("POWERSHIELD", () => "QMARKS");
