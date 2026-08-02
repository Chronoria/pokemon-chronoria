// Held item damage effects.
//
// Same provenance convention as abilities.ts. Item battle effects exist nowhere in the parsed
// data (items.json carries only German prose descriptions and Fling/NaturalGift flags), so every
// entry here is a hand-transcribed handler.
import { ItemEffects } from "../registry.ts";

// ---------------------------------------------------------------------------------------------
// Flat power / attack boosters
// ---------------------------------------------------------------------------------------------
// [core] Life Orb: 1.3x power (the 10% recoil is not a damage-calc concern).
ItemEffects.DamageCalcFromUser.add("LIFEORB", (ctx) => {
  ctx.multipliers.power *= 1.3;
});

// [core]/[DBK] Choice items boost the matching attacking stat by 1.5x. DBK re-registers these
// with a `!move.powerMove?` guard; power moves aren't modelled yet, so this is the plain form.
ItemEffects.DamageCalcFromUser.add("CHOICEBAND", (ctx) => {
  if (ctx.move.c === "Physical") ctx.multipliers.attack *= 1.5;
});
ItemEffects.DamageCalcFromUser.add("CHOICESPECS", (ctx) => {
  if (ctx.move.c === "Special") ctx.multipliers.attack *= 1.5;
});

// [core] Muscle Band / Wise Glasses: 1.1x power on the matching category.
ItemEffects.DamageCalcFromUser.add("MUSCLEBAND", (ctx) => {
  if (ctx.move.c === "Physical") ctx.multipliers.power *= 1.1;
});
ItemEffects.DamageCalcFromUser.add("WISEGLASSES", (ctx) => {
  if (ctx.move.c === "Special") ctx.multipliers.power *= 1.1;
});

// [core] Expert Belt: 1.2x on super-effective hits.
ItemEffects.DamageCalcFromUser.add("EXPERTBELT", (ctx) => {
  if (ctx.typeMod > 1) ctx.multipliers.final *= 1.2;
});

// ---------------------------------------------------------------------------------------------
// Type-boosting held items (1.2x on their type)
// ---------------------------------------------------------------------------------------------
// The classic held boosters. Plates, Silvally memories and Genesect drives share the same 1.2x
// shape and are registered from the same table.
const TYPE_ITEMS: [string, string][] = [
  ["CHARCOAL", "FIRE"],
  ["MYSTICWATER", "WATER"],
  ["MAGNET", "ELECTRIC"],
  ["MIRACLESEED", "GRASS"],
  ["NEVERMELTICE", "ICE"],
  ["BLACKBELT", "FIGHTING"],
  ["POISONBARB", "POISON"],
  ["SOFTSAND", "GROUND"],
  ["SHARPBEAK", "FLYING"],
  ["TWISTEDSPOON", "PSYCHIC"],
  ["SILVERPOWDER", "BUG"],
  ["HARDSTONE", "ROCK"],
  ["SPELLTAG", "GHOST"],
  ["DRAGONFANG", "DRAGON"],
  ["BLACKGLASSES", "DARK"],
  ["METALCOAT", "STEEL"],
  ["SILKSCARF", "NORMAL"],
  ["FAIRYFEATHER", "FAIRY"], // [Gen9]
  // Arceus plates
  ["FLAMEPLATE", "FIRE"],
  ["SPLASHPLATE", "WATER"],
  ["ZAPPLATE", "ELECTRIC"],
  ["MEADOWPLATE", "GRASS"],
  ["ICICLEPLATE", "ICE"],
  ["FISTPLATE", "FIGHTING"],
  ["TOXICPLATE", "POISON"],
  ["EARTHPLATE", "GROUND"],
  ["SKYPLATE", "FLYING"],
  ["MINDPLATE", "PSYCHIC"],
  ["INSECTPLATE", "BUG"],
  ["STONEPLATE", "ROCK"],
  ["SPOOKYPLATE", "GHOST"],
  ["DRACOPLATE", "DRAGON"],
  ["DREADPLATE", "DARK"],
  ["IRONPLATE", "STEEL"],
  ["PIXIEPLATE", "FAIRY"],
  // Silvally memories
  ["FIREMEMORY", "FIRE"],
  ["WATERMEMORY", "WATER"],
  ["ELECTRICMEMORY", "ELECTRIC"],
  ["GRASSMEMORY", "GRASS"],
  ["ICEMEMORY", "ICE"],
  ["FIGHTINGMEMORY", "FIGHTING"],
  ["POISONMEMORY", "POISON"],
  ["GROUNDMEMORY", "GROUND"],
  ["FLYINGMEMORY", "FLYING"],
  ["PSYCHICMEMORY", "PSYCHIC"],
  ["BUGMEMORY", "BUG"],
  ["ROCKMEMORY", "ROCK"],
  ["GHOSTMEMORY", "GHOST"],
  ["DRAGONMEMORY", "DRAGON"],
  ["DARKMEMORY", "DARK"],
  ["STEELMEMORY", "STEEL"],
  ["FAIRYMEMORY", "FAIRY"],
];
for (const [item, type] of TYPE_ITEMS) {
  ItemEffects.DamageCalcFromUser.add(item, (ctx) => {
    if (ctx.type === type) ctx.multipliers.power *= 1.2;
  });
}

// [core] Incenses that boost a type, same 1.2x shape.
const INCENSE: [string, string][] = [
  ["SEAINCENSE", "WATER"],
  ["WAVEINCENSE", "WATER"],
  ["ROSEINCENSE", "GRASS"],
  ["ODDINCENSE", "PSYCHIC"],
  ["ROCKINCENSE", "ROCK"],
];
for (const [item, type] of INCENSE) {
  ItemEffects.DamageCalcFromUser.add(item, (ctx) => {
    if (ctx.type === type) ctx.multipliers.power *= 1.2;
  });
}

// [core] Type gems: 1.3x, single use.
const GEMS: [string, string][] = [
  ["FIREGEM", "FIRE"], ["WATERGEM", "WATER"], ["ELECTRICGEM", "ELECTRIC"], ["GRASSGEM", "GRASS"],
  ["ICEGEM", "ICE"], ["FIGHTINGGEM", "FIGHTING"], ["POISONGEM", "POISON"], ["GROUNDGEM", "GROUND"],
  ["FLYINGGEM", "FLYING"], ["PSYCHICGEM", "PSYCHIC"], ["BUGGEM", "BUG"], ["ROCKGEM", "ROCK"],
  ["GHOSTGEM", "GHOST"], ["DRAGONGEM", "DRAGON"], ["DARKGEM", "DARK"], ["STEELGEM", "STEEL"],
  ["NORMALGEM", "NORMAL"], ["FAIRYGEM", "FAIRY"],
];
for (const [item, type] of GEMS) {
  ItemEffects.DamageCalcFromUser.add(item, (ctx) => {
    if (ctx.type === type) ctx.multipliers.power *= 1.3;
  });
}

// ---------------------------------------------------------------------------------------------
// Species-specific items
// ---------------------------------------------------------------------------------------------
// [core] These check the holder's species, which is why CalcSpecies keeps the base id in `k`
// (form entries are "SPECIES#n", so a startsWith check covers both base and form).
const isSpecies = (key: string, species: string) => key === species || key.startsWith(`${species}#`);

ItemEffects.DamageCalcFromUser.add("THICKCLUB", (ctx) => {
  if (
    ctx.move.c === "Physical" &&
    (isSpecies(ctx.user.species.k, "CUBONE") || isSpecies(ctx.user.species.k, "MAROWAK"))
  ) {
    ctx.multipliers.attack *= 2;
  }
});

ItemEffects.DamageCalcFromUser.add("LIGHTBALL", (ctx) => {
  if (isSpecies(ctx.user.species.k, "PIKACHU")) ctx.multipliers.attack *= 2;
});

ItemEffects.DamageCalcFromUser.add("SOULDEW", (ctx) => {
  if (
    (isSpecies(ctx.user.species.k, "LATIOS") || isSpecies(ctx.user.species.k, "LATIAS")) &&
    (ctx.type === "PSYCHIC" || ctx.type === "DRAGON")
  ) {
    ctx.multipliers.power *= 1.2;
  }
});

// ---------------------------------------------------------------------------------------------
// Defensive items
// ---------------------------------------------------------------------------------------------
// [core] Assault Vest: 1.5x special defence.
ItemEffects.DamageCalcFromTarget.add("ASSAULTVEST", (ctx) => {
  if (ctx.move.c === "Special") ctx.multipliers.defense *= 1.5;
});

// [core] Eviolite: 1.5x both defences for not-fully-evolved holders. The calculator has no
// evolution data in its payload, so it applies unconditionally when selected - noted in the UI.
ItemEffects.DamageCalcFromTarget.add("EVIOLITE", (ctx) => {
  ctx.multipliers.defense *= 1.5;
});

ItemEffects.DamageCalcFromTarget.add("DEEPSEASCALE", (ctx) => {
  if (ctx.move.c === "Special" && isSpecies(ctx.target.species.k, "CLAMPERL")) ctx.multipliers.defense *= 2;
});

ItemEffects.DamageCalcFromTarget.add("METALPOWDER", (ctx) => {
  if (ctx.move.c === "Physical" && isSpecies(ctx.target.species.k, "DITTO")) ctx.multipliers.defense *= 2;
});

// [core] Deep Sea Tooth is the offensive counterpart to Deep Sea Scale above.
ItemEffects.DamageCalcFromUser.add("DEEPSEATOOTH", (ctx) => {
  if (ctx.move.c === "Special" && isSpecies(ctx.user.species.k, "CLAMPERL")) ctx.multipliers.attack *= 2;
});

// [core] Genesect drives - same 1.2x shape as the memories/plates.
const DRIVES: [string, string][] = [
  ["DOUSEDRIVE", "WATER"],
  ["SHOCKDRIVE", "ELECTRIC"],
  ["BURNDRIVE", "FIRE"],
  ["CHILLDRIVE", "ICE"],
];
for (const [item, type] of DRIVES) {
  ItemEffects.DamageCalcFromUser.add(item, (ctx) => {
    if (ctx.type === type) ctx.multipliers.power *= 1.2;
  });
}

// The five Gen-4 breeding incenses (Sea/Wave/Rose/Odd/Rock) are the same 1.2x-power mechanic as
// Charcoal/Mystic Water above, just tied to an egg item instead of a plain type-booster item.
const INCENSE_BOOSTERS: [string, string][] = [
  ["SEAINCENSE", "WATER"],
  ["WAVEINCENSE", "WATER"],
  ["ROSEINCENSE", "GRASS"],
  ["ODDINCENSE", "PSYCHIC"],
  ["ROCKINCENSE", "ROCK"],
];
for (const [item, type] of INCENSE_BOOSTERS) {
  ItemEffects.DamageCalcFromUser.add(item, (ctx) => {
    if (ctx.type === type) ctx.multipliers.power *= 1.2;
  });
}

// Luftballon (Air Balloon) grants full Ground immunity while held - same shape as Levitate, just
// item-granted instead of ability-granted, hence the separate ItemEffects.MoveImmunity table.
ItemEffects.MoveImmunity.add("AIRBALLOON", (ctx) => ctx.type === "GROUND");

// Allzweckschirm (Utility Umbrella) is deliberately NOT modelled: the DBK formula reads weather
// via `user.effectiveWeather` (E:\Test\Plugins\[DBK_000] Deluxe Battle Kit\...\[002] Damage Calc
// Refactor.rb:166/674), and whether that core Essentials method already accounts for this item -
// and for which side - could not be verified (no local core source, GitHub code search needs
// auth). A hand-rolled duplicate risks double-cancelling or silently disagreeing with the real
// mechanic; the honest choice is to leave this as a reported "not modelled" item rather than guess.

// Float Stone (weight halving -> weight-based move power), Loaded Dice (multi-hit floor) and the
// four terrain seeds (a defense STAGE change, applied before any multiplier - can't be expressed
// as a DamageCalcFromTarget hook at all) are handled directly in damage.ts/effects/moves.ts rather
// than through this table. They're listed in INLINE_ITEMS (registry.ts) for the same reason
// INLINE_ABILITIES exists: so isItemModelled() reports them correctly without a fake no-op hook.

// [core] Sinnoh trio orbs: 1.2x on the holder's two signature types.
// [Gen9] The crystal/globe/core variants copy these (New Item Handlers.rb:172-174).
const ORBS: [string[], string, string[]][] = [
  [["ADAMANTORB", "ADAMANTCRYSTAL"], "DIALGA", ["STEEL", "DRAGON"]],
  [["LUSTROUSORB", "LUSTROUSGLOBE"], "PALKIA", ["WATER", "DRAGON"]],
  [["GRISEOUSORB", "GRISEOUSCORE"], "GIRATINA", ["GHOST", "DRAGON"]],
];
for (const [ids, species, types] of ORBS) {
  ItemEffects.DamageCalcFromUser.addMany(ids, (ctx) => {
    if (isSpecies(ctx.user.species.k, species) && types.includes(ctx.type)) ctx.multipliers.power *= 1.2;
  });
}
// [Gen9] Blank Plate behaves as a Normal-type booster (copied from Silk Scarf).
ItemEffects.DamageCalcFromUser.add("BLANKPLATE", (ctx) => {
  if (ctx.type === "NORMAL") ctx.multipliers.power *= 1.2;
});

// [Gen9] Punching Glove: 1.1x on punching moves.
ItemEffects.DamageCalcFromUser.add("PUNCHINGGLOVE", (ctx) => {
  if (ctx.move.f.includes("Punching")) ctx.multipliers.power *= 1.1;
});

// [Gen9] Ogerpon masks: a flat 1.2x final multiplier, but only for Ogerpon itself.
ItemEffects.DamageCalcFromUser.addMany(
  ["WELLSPRINGMASK", "HEARTHFLAMEMASK", "CORNERSTONEMASK"],
  (ctx) => {
    if (isSpecies(ctx.user.species.k, "OGERPON")) ctx.multipliers.final *= 1.2;
  }
);

// [core] Resist berries halve a super-effective hit of their type (Chilan Berry covers Normal
// regardless of effectiveness). Single-use, so this assumes the berry is still held.
const RESIST_BERRIES: [string, string][] = [
  ["OCCABERRY", "FIRE"],
  ["PASSHOBERRY", "WATER"],
  ["WACANBERRY", "ELECTRIC"],
  ["RINDOBERRY", "GRASS"],
  ["YACHEBERRY", "ICE"],
  ["CHOPLEBERRY", "FIGHTING"],
  ["KEBIABERRY", "POISON"],
  ["SHUCABERRY", "GROUND"],
  ["COBABERRY", "FLYING"],
  ["PAYAPABERRY", "PSYCHIC"],
  ["TANGABERRY", "BUG"],
  ["CHARTIBERRY", "ROCK"],
  ["KASIBBERRY", "GHOST"],
  ["HABANBERRY", "DRAGON"],
  ["COLBURBERRY", "DARK"],
  ["BABIRIBERRY", "STEEL"],
  ["ROSELIBERRY", "FAIRY"],
];
for (const [berry, type] of RESIST_BERRIES) {
  ItemEffects.DamageCalcFromTarget.add(berry, (ctx) => {
    if (ctx.type === type && ctx.typeMod > 1) ctx.multipliers.final /= 2;
  });
}
// Chilan Berry is the odd one out: halves Normal damage without needing super-effectiveness.
ItemEffects.DamageCalcFromTarget.add("CHILANBERRY", (ctx) => {
  if (ctx.type === "NORMAL") ctx.multipliers.final /= 2;
});

// ---------------------------------------------------------------------------------------------
// Critical hit items
// ---------------------------------------------------------------------------------------------
ItemEffects.CriticalCalcFromUser.addMany(["SCOPELENS", "RAZORCLAW"], (ctx) => ctx.critStage + 1);
ItemEffects.CriticalCalcFromUser.add("LUCKYPUNCH", (ctx) =>
  isSpecies(ctx.user.species.k, "CHANSEY") ? ctx.critStage + 2 : ctx.critStage
);
ItemEffects.CriticalCalcFromUser.add("LEEK", (ctx) =>
  isSpecies(ctx.user.species.k, "FARFETCHD") || isSpecies(ctx.user.species.k, "SIRFETCHD")
    ? ctx.critStage + 2
    : ctx.critStage
);
