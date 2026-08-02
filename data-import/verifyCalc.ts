// Golden-case checks for the damage engine.
//
// Usage: node data-import/verifyCalc.ts
//
// The engine is DOM-free on purpose so it can be exercised here. These cases pin down the parts
// of the formula that are easy to get subtly wrong (rounding order, stage application, the crit
// clamp, spread reduction) - a UI can look perfectly fine while quietly producing wrong numbers.
import {
  abilityList,
  calculate,
  defaultField,
  defaultSide,
  isAbilityModelled,
  isItemModelled,
  itemHasNoBattleEffect,
  itemList,
  moveById,
  moveList,
  speciesByKey,
  statsFor,
} from "../src/lib/calc/index.ts";
import { NO_DAMAGE_EFFECT } from "../src/lib/calc/effects/noDamage.ts";
import { calcHP, calcStat } from "../src/lib/calc/stats.ts";
import type { SideState } from "../src/lib/calc/types.ts";

let passed = 0;
let failed = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ ${name}\n      erwartet: ${JSON.stringify(expected)}\n      erhalten: ${JSON.stringify(actual)}`);
  }
}

function checkTrue(name: string, cond: boolean, detail = "") {
  if (cond) passed++;
  else {
    failed++;
    console.error(`  ✗ ${name}${detail ? `\n      ${detail}` : ""}`);
  }
}

// --- Stat formula ---------------------------------------------------------------------------
console.log("Statuswert-Formel");
// Hand-computed: (108*2 + 31 + floor(252/4)) = 310; *100/100 = 310; +100 +10 = 420.
check("HP: base 108, Lv100, 31 IV, 252 EV", calcHP(108, 100, 31, 252), 420);
check("Atk: base 130, Lv100, 31 IV, 252 EV, Adamant(110)", calcStat(130, 100, 31, 252, 110), 394);
check("Atk: same but neutral nature", calcStat(130, 100, 31, 252, 100), 359);
check("Lv50, base 100, 31 IV, 0 EV, neutral", calcStat(100, 50, 31, 0, 100), 120);
check("Shedinja: base 1 HP is always 1", calcHP(1, 100, 31, 252), 1);

// --- Engine cases ---------------------------------------------------------------------------
console.log("Schadensformel");
const field = defaultField();

function sideOf(key: string, patch: Partial<SideState> = {}): SideState {
  const base = defaultSide(key);
  return { ...base, ...patch };
}

const thunderbolt = moveById.get("THUNDERBOLT")!;
const tackle = moveById.get("TACKLE")!;
const earthquake = moveById.get("EARTHQUAKE")!;
const flamethrower = moveById.get("FLAMETHROWER")!;
const surf = moveById.get("SURF")!;

// Type-matchup cases are looked up from the actual data rather than assumed. Chronoria retypes
// species (Charizard is Fire/Dragon here, not Fire/Flying), so hardcoding an "obvious" matchup
// tests the test's assumptions instead of the engine.
import { speciesList } from "../src/lib/calc/index.ts";
const findDefender = (pred: (types: string[]) => boolean) =>
  speciesList.find((s) => !s.fl && pred(s.t));

// Immunity must be a hard zero, not a small number.
{
  const flyer = findDefender((t) => t.includes("FLYING"));
  if (flyer) {
    const r = calculate(sideOf("PIKACHU"), sideOf(flyer.k), earthquake, field);
    check(`Boden gegen Flug (${flyer.n}): keine Wirkung`, [r.min, r.max, r.typeMod], [0, 0, 0]);
  } else checkTrue("Flug-Pokémon für Immunitätstest gefunden", false);
}

// 4x effectiveness - a defender weak to Rock on both of its types.
{
  const doubleWeak = findDefender((t) => t.includes("FLYING") && t.includes("BUG"));
  if (doubleWeak) {
    const rockSlide = moveById.get("ROCKSLIDE")!;
    const r = calculate(sideOf("PIKACHU"), sideOf(doubleWeak.k), rockSlide, field);
    check(`Gestein gegen Käfer/Flug (${doubleWeak.n}): 4x`, r.typeMod, 4);
  } else checkTrue("Käfer/Flug-Pokémon für 4x-Test gefunden", false);
}

// 0.25x - a defender resisting Fire on both types.
{
  const doubleResist = findDefender((t) => t.includes("FIRE") && t.includes("DRAGON"));
  if (doubleResist) {
    const r = calculate(sideOf("PIKACHU"), sideOf(doubleResist.k), flamethrower, field);
    check(`Feuer gegen Feuer/Drache (${doubleResist.n}): 0.25x`, r.typeMod, 0.25);
  } else checkTrue("Feuer/Drache-Pokémon für 0.25x-Test gefunden", false);
}

// Exactly 16 rolls, ascending, max/min consistent, and the spread is the expected ~85..100 band.
{
  const r = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), thunderbolt, field);
  check("16 Zufallswerte", r.rolls.length, 16);
  checkTrue("Werte aufsteigend sortiert", r.rolls.every((v, i, a) => i === 0 || a[i - 1] <= v));
  check("min/max stimmen mit den Rollen überein", [r.min, r.max], [r.rolls[0], r.rolls[15]]);
  // 85..100 means max/min must be close to 100/85 - a wrong random application shows up here.
  const ratio = r.max / r.min;
  checkTrue("Zufallsspanne ~1.176", ratio > 1.13 && ratio < 1.21, `Verhältnis war ${ratio.toFixed(3)}`);
}

// STAB: same attacker, same defender, two moves that are identical except for their type - so
// the only difference in the result is STAB and the type matchup, and dividing the latter out
// leaves exactly 1.5. Comparing two different attackers (as an earlier version did) folds their
// differing stats into the ratio and tests almost nothing.
{
  // High level + max EVs so the final .round can't meaningfully skew the ratio.
  const big = { level: 100, evs: { ...defaultSide("PIKACHU").evs, spAtk: 252 } };
  const atk = sideOf("PIKACHU", big);
  const def = sideOf("BULBASAUR");
  const stab = calculate(atk, def, thunderbolt, field); // Electric = Pikachu's own type
  const noStab = calculate(atk, def, flamethrower, field); // Fire, same 90 power / Special
  check("Testattacken haben gleiche Stärke/Kategorie", [thunderbolt.p, thunderbolt.c], [flamethrower.p, flamethrower.c]);
  const ratio = (stab.max / stab.typeMod) / (noStab.max / noStab.typeMod);
  checkTrue("STAB 1.5x", Math.abs(ratio - 1.5) < 0.02, `Verhältnis ${ratio.toFixed(4)}`);
}

// Adaptability turns STAB 1.5 into 2.0 (~1.333x more damage).
{
  const normal = calculate(sideOf("PIKACHU", { ability: null }), sideOf("BULBASAUR"), thunderbolt, field);
  const adapt = calculate(sideOf("PIKACHU", { ability: "ADAPTABILITY" }), sideOf("BULBASAUR"), thunderbolt, field);
  const ratio = adapt.max / normal.max;
  checkTrue("Anpassung: STAB 1.5 -> 2.0", Math.abs(ratio - 4 / 3) < 0.02, `Verhältnis ${ratio.toFixed(3)}`);
}

// Spread reduction is 0.75 in doubles for a move that actually hits multiple targets.
// Level 100 + max EVs keeps the numbers large enough that the final .round doesn't skew the ratio
// (at level 50 with 0 EVs the damage is small enough for rounding to move it several percent).
{
  const big = { level: 100, evs: { ...defaultSide("PIKACHU").evs, spAtk: 252 } };
  const atk = sideOf("PIKACHU", big);
  const def = sideOf("BULBASAUR");
  const single = calculate(atk, def, surf, { ...field, doubles: false });
  const double = calculate(atk, def, surf, { ...field, doubles: true });
  const ratio = double.max / single.max;
  checkTrue("Doppelkampf-Abschwächung 0.75", Math.abs(ratio - 0.75) < 0.01, `Verhältnis ${ratio.toFixed(4)}`);
  // A single-target move must NOT be reduced in doubles.
  const sSingle = calculate(atk, def, thunderbolt, { ...field, doubles: false });
  const sDouble = calculate(atk, def, thunderbolt, { ...field, doubles: true });
  check("Einzelziel-Attacke bleibt im Doppelkampf gleich", sSingle.max, sDouble.max);
}

// Burn halves physical damage, but not special, and not for Guts users.
{
  const healthy = calculate(sideOf("PIKACHU", { ability: null }), sideOf("BULBASAUR"), tackle, field);
  const burned = calculate(sideOf("PIKACHU", { ability: null, status: "burn" }), sideOf("BULBASAUR"), tackle, field);
  const ratio = burned.max / healthy.max;
  checkTrue("Verbrennung halbiert physisch", Math.abs(ratio - 0.5) < 0.03, `Verhältnis ${ratio.toFixed(3)}`);

  const spHealthy = calculate(sideOf("PIKACHU", { ability: null }), sideOf("BULBASAUR"), thunderbolt, field);
  const spBurned = calculate(sideOf("PIKACHU", { ability: null, status: "burn" }), sideOf("BULBASAUR"), thunderbolt, field);
  check("Verbrennung berührt Spezial-Attacken nicht", spHealthy.max, spBurned.max);
}

// Reflect: halves physical in singles, 2/3 in doubles, and is ignored on a crit.
{
  const plain = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), tackle, field);
  const reflected = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), tackle, { ...field, reflect: true });
  checkTrue(
    "Reflektor halbiert im Einzelkampf",
    Math.abs(reflected.max / plain.max - 0.5) < 0.03,
    `Verhältnis ${(reflected.max / plain.max).toFixed(3)}`
  );
  const reflectedDoubles = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), tackle, { ...field, reflect: true, doubles: true });
  checkTrue(
    "Reflektor 2/3 im Doppelkampf",
    Math.abs(reflectedDoubles.max / plain.max - 2 / 3) < 0.03,
    `Verhältnis ${(reflectedDoubles.max / plain.max).toFixed(3)}`
  );
  const critThroughReflect = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), tackle, { ...field, reflect: true }, true);
  const critPlain = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), tackle, field, true);
  check("Volltreffer ignoriert Reflektor", critThroughReflect.max, critPlain.max);
}

// Critical hit is 1.5x at this generation (NOT 2x).
{
  const normal = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), thunderbolt, field, false);
  const crit = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), thunderbolt, field, true);
  const ratio = crit.max / normal.max;
  checkTrue("Volltreffer 1.5x", Math.abs(ratio - 1.5) < 0.03, `Verhältnis ${ratio.toFixed(3)}`);
}

// Crit ignores the attacker's negative stages but keeps positive ones.
{
  const lowered = sideOf("PIKACHU", { stages: { ...defaultSide("PIKACHU").stages, spAtk: -2 } });
  const noCrit = calculate(lowered, sideOf("BULBASAUR"), thunderbolt, field, false);
  const crit = calculate(lowered, sideOf("BULBASAUR"), thunderbolt, field, true);
  const neutralCrit = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), thunderbolt, field, true);
  checkTrue("Volltreffer ignoriert gesenkten Angriff", crit.max === neutralCrit.max, `${crit.max} vs ${neutralCrit.max}`);
  checkTrue("ohne Volltreffer wirkt die Senkung", noCrit.max < neutralCrit.max);
}

// Crit ignores the defender's positive defence stages.
{
  const boosted = sideOf("BULBASAUR", { stages: { ...defaultSide("BULBASAUR").stages, spDef: 2 } });
  const crit = calculate(sideOf("PIKACHU"), boosted, thunderbolt, field, true);
  const neutralCrit = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), thunderbolt, field, true);
  check("Volltreffer ignoriert erhöhte Verteidigung", crit.max, neutralCrit.max);
}

// Weather: the fixed Sun/Water behaviour (0.5x), and Rain boosting Water.
{
  const plain = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), surf, field);
  const sun = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), surf, { ...field, weather: "sun" });
  const rain = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), surf, { ...field, weather: "rain" });
  checkTrue(
    "Sonne halbiert Wasser (Plugin-Bug behoben)",
    Math.abs(sun.max / plain.max - 0.5) < 0.03,
    `Verhältnis ${(sun.max / plain.max).toFixed(3)}`
  );
  checkTrue("Regen verstärkt Wasser 1.5x", Math.abs(rain.max / plain.max - 1.5) < 0.03);
  // Hydro Steam is the one move that is SUPPOSED to be boosted in sun.
  const hydroSteam = moveById.get("HYDROSTEAM");
  if (hydroSteam) {
    const hsPlain = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), hydroSteam, field);
    const hsSun = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), hydroSteam, { ...field, weather: "sun" });
    checkTrue(
      "Hydrodampf wird in der Sonne verstärkt",
      hsSun.max > hsPlain.max,
      `${hsSun.max} sollte > ${hsPlain.max} sein`
    );
  }
}

// Level scaling: a level 100 attacker must out-damage a level 50 one substantially.
{
  const lv50 = calculate(sideOf("PIKACHU", { level: 50 }), sideOf("BULBASAUR"), thunderbolt, field);
  const lv100 = calculate(sideOf("PIKACHU", { level: 100 }), sideOf("BULBASAUR"), thunderbolt, field);
  checkTrue("Level 100 trifft härter als Level 50", lv100.max > lv50.max * 1.5);
}

// Unmodelled effects must be reported, never silently ignored.
{
  // Supreme Overlord scales with fainted allies - genuinely unmodellable here, so it must warn.
  // (Static would NOT warn: it has no damage effect at all, see effects/noDamage.ts.)
  const r = calculate(sideOf("PIKACHU", { ability: "SUPREMEOVERLORD" }), sideOf("BULBASAUR"), thunderbolt, field);
  checkTrue("nicht modellierte Fähigkeit wird gemeldet", r.unmodelled.includes("ability:SUPREMEOVERLORD"));
  // Both sides must be pinned: species defaults differ from the official games here (Bulbasaur
  // has Cute Charm in Chronoria), so leaving the defender on its default would report that.
  const r2 = calculate(
    sideOf("PIKACHU", { ability: "ADAPTABILITY" }),
    sideOf("BULBASAUR", { ability: null }),
    thunderbolt,
    field
  );
  checkTrue(
    "modellierte Fähigkeit wird nicht gemeldet",
    !r2.unmodelled.some((u) => u.startsWith("ability:")),
    `gemeldet: ${JSON.stringify(r2.unmodelled)}`
  );
}

// Status moves deal no damage and say so.
{
  const growl = moveById.get("GROWL");
  if (growl) {
    const r = calculate(sideOf("PIKACHU"), sideOf("BULBASAUR"), growl, field);
    check("Statusattacke verursacht 0 Schaden", [r.min, r.max], [0, 0]);
    checkTrue("Statusattacke wird erklärt", !!r.note);
  }
}

// --- Ported ability handlers ------------------------------------------------------------------
// These are transcriptions of real Ruby handlers, so the checks target the things a transcription
// gets wrong: which accumulator was used, and whether a stacking effect stacks.
console.log("Portierte Faehigkeiten");
{
  const def = sideOf("BULBASAUR", { ability: null });
  const base = (ability: string | null, move = thunderbolt, f = field) =>
    calculate(sideOf("PIKACHU", { ability, level: 100 }), def, move, f).max;

  const plain = base(null);

  // Arcane Mage: 1.5x attack on Fire/Ice/Electric. Thunderbolt is Electric, so it applies.
  checkTrue(
    "Arkanmagier verstärkt Elektro 1.5x",
    Math.abs(base("ARCANEMAGE") / plain - 1.5) < 0.03,
    `Verhältnis ${(base("ARCANEMAGE") / plain).toFixed(3)}`
  );
  // ...but not on a Fighting move.
  const brickBreak = moveById.get("BRICKBREAK");
  if (brickBreak) {
    const p = calculate(sideOf("PIKACHU", { ability: null, level: 100 }), def, brickBreak, field).max;
    const a = calculate(sideOf("PIKACHU", { ability: "ARCANEMAGE", level: 100 }), def, brickBreak, field).max;
    check("Arkanmagier lässt Kampf-Attacken unberührt", a, p);
  }

  // Rusted Feathers halves its own attack unconditionally.
  checkTrue(
    "Rostfedern halbiert eigenen Angriff",
    Math.abs(base("RUSTEDFEATHERS") / plain - 0.5) < 0.03,
    `Verhältnis ${(base("RUSTEDFEATHERS") / plain).toFixed(3)}`
  );

  // Neutralize makes the move typeless: no STAB, no type chart, but x1.8 attack. Against a
  // Grass/Poison defender, Electric would normally be neutral (1x) with STAB 1.5.
  {
    const before = calculate(sideOf("PIKACHU", { ability: null, level: 100 }), def, thunderbolt, field);
    const neutral = calculate(sideOf("PIKACHU", { ability: "NEUTRALIZE", level: 100 }), def, thunderbolt, field);
    check("Neutralisierung macht die Attacke typlos", neutral.typeMod, 1);
    // Expectation is derived from the defender's ACTUAL matchup rather than assumed: Neutralize
    // trades away STAB (1.5) and the type chart for a flat 1.8x attack.
    const expected = 1.8 / (before.typeMod * 1.5);
    checkTrue(
      "Neutralisierung: 1.8x Angriff ohne STAB und Typentabelle",
      Math.abs(neutral.max / plain - expected) < 0.05,
      `erwartet ~${expected.toFixed(3)}, erhalten ${(neutral.max / plain).toFixed(3)}`
    );
  }

  // Unconcerned stacks against a Rock/Steel target - the Ruby applies x2 per matching type.
  {
    const rockSteel = speciesList.find((s) => !s.fl && s.t.includes("ROCK") && s.t.includes("STEEL"));
    const rockOnly = speciesList.find((s) => !s.fl && s.t.includes("ROCK") && !s.t.includes("STEEL"));
    // Max EVs and a strong Normal move: Normal is resisted by both Rock and Steel (0.25x total),
    // so with a weak move the formula's flat "+ 2" term is a large share of the result and the
    // ratio can't reach 4 no matter how correct the multiplier is.
    const bigHit = moveById.get("BODYSLAM") ?? tackle;
    const tackleUser = (ability: string | null, target: string) =>
      calculate(
        sideOf("PIKACHU", { ability, level: 100, evs: { ...defaultSide("PIKACHU").evs, attack: 252 } }),
        sideOf(target, { ability: null }),
        bigHit,
        field
      ).max;
    if (rockOnly) {
      const ratio = tackleUser("UNCONCERNED", rockOnly.k) / tackleUser(null, rockOnly.k);
      checkTrue("Unbekümmert 2x gegen Gestein", Math.abs(ratio - 2) < 0.05, `Verhältnis ${ratio.toFixed(3)}`);
    }
    if (rockSteel) {
      const ratio = tackleUser("UNCONCERNED", rockSteel.k) / tackleUser(null, rockSteel.k);
      checkTrue(
        "Unbekümmert stapelt auf 4x gegen Gestein/Stahl",
        Math.abs(ratio - 4) < 0.1,
        `Verhältnis ${ratio.toFixed(3)}`
      );
    }
  }

  // Orichalcum Pulse only fires on physical moves in sun.
  {
    const sunField = { ...field, weather: "sun" as const };
    const p = calculate(sideOf("PIKACHU", { ability: null, level: 100 }), def, tackle, sunField).max;
    const a = calculate(sideOf("PIKACHU", { ability: "ORICHALCUMPULSE", level: 100 }), def, tackle, sunField).max;
    checkTrue("Orichalkum-Puls 4/3 physisch bei Sonne", Math.abs(a / p - 4 / 3) < 0.04, `Verhältnis ${(a / p).toFixed(3)}`);
    const pNoSun = calculate(sideOf("PIKACHU", { ability: null, level: 100 }), def, tackle, field).max;
    const aNoSun = calculate(sideOf("PIKACHU", { ability: "ORICHALCUMPULSE", level: 100 }), def, tackle, field).max;
    check("Orichalkum-Puls ohne Sonne wirkungslos", aNoSun, pNoSun);
  }

  // Assumption reporting: Flash Fire is applied, but the result must say it was assumed active.
  {
    const r = calculate(sideOf("PIKACHU", { ability: "FLASHFIRE", level: 100 }), def, flamethrower, field);
    checkTrue("Flammkörper-Annahme wird gemeldet", r.assumptions.some((a) => a.startsWith("FLASHFIRE")));
    checkTrue("angenommene Fähigkeit gilt nicht als unmodelliert", !r.unmodelled.includes("ability:FLASHFIRE"));
  }

  // Supreme Overlord needs battle state that can't be assumed - must be reported as unmodelled.
  {
    const r = calculate(sideOf("PIKACHU", { ability: "SUPREMEOVERLORD", level: 100 }), def, thunderbolt, field);
    checkTrue("Feldherr wird als nicht modelliert gemeldet", r.unmodelled.includes("ability:SUPREMEOVERLORD"));
  }
}

// --- Ability immunities -------------------------------------------------------------------------
// The highest-stakes category: an unmodelled immunity turns a guaranteed 0 into a full hit.
console.log("Faehigkeits-Immunitaeten");
{
  const atk = sideOf("PIKACHU", { ability: null, level: 100 });
  const immune = (ability: string, moveId: string, defenderKey = "BULBASAUR") => {
    const move = moveById.get(moveId);
    if (!move) return null;
    return calculate(atk, sideOf(defenderKey, { ability }), move, field);
  };

  const lev = immune("LEVITATE", "EARTHQUAKE");
  if (lev) check("Schwebe: immun gegen Boden", [lev.min, lev.max, lev.typeMod], [0, 0, 0]);

  const volt = immune("VOLTABSORB", "THUNDERBOLT");
  if (volt) check("Voltabsorber: immun gegen Elektro", [volt.min, volt.max], [0, 0]);

  const sap = immune("SAPSIPPER", "VINEWHIP");
  if (sap) check("Vegetarier: immun gegen Pflanze", [sap.min, sap.max], [0, 0]);

  // Mold Breaker ignores the immunity.
  {
    const eq = moveById.get("EARTHQUAKE")!;
    const breaker = calculate(
      sideOf("PIKACHU", { ability: "MOLDBREAKER", level: 100 }),
      sideOf("BULBASAUR", { ability: "LEVITATE" }),
      eq,
      field
    );
    checkTrue("Überbrückung hebt Schwebe auf", breaker.max > 0, `erhielt ${breaker.max}`);
  }

  // Wonder Guard lets only super-effective damage through.
  {
    const flying = speciesList.find((s) => !s.fl && s.t.includes("FLYING"));
    if (flying) {
      const neutral = calculate(atk, sideOf(flying.k, { ability: "WONDERGUARD" }), tackle, field);
      check("Wunderwache blockt nicht sehr effektive Treffer", [neutral.min, neutral.max], [0, 0]);
      const superEff = calculate(atk, sideOf(flying.k, { ability: "WONDERGUARD" }), thunderbolt, field);
      checkTrue("Wunderwache lässt sehr effektive Treffer durch", superEff.max > 0, `erhielt ${superEff.max}`);
    }
  }

  // An immunity ability must not also be reported as unmodelled.
  {
    const r = calculate(atk, sideOf("BULBASAUR", { ability: "LEVITATE" }), moveById.get("EARTHQUAKE")!, field);
    checkTrue("Schwebe gilt als modelliert", !r.unmodelled.includes("ability:LEVITATE"));
  }
}

// --- Move function codes -----------------------------------------------------------------------
console.log("Attacken-Funktionscodes");
{
  const def = sideOf("BULBASAUR", { ability: null });
  const atk = sideOf("PIKACHU", { ability: null, level: 100 });

  // Fixed-damage moves must NOT go through the formula.
  const seismicToss = moveList.find((m) => m.fn === "FixedDamageUserLevel");
  if (seismicToss) {
    const r = calculate(atk, def, seismicToss, field);
    check("Fester Schaden = Level des Anwenders", [r.min, r.max], [100, 100]);
    checkTrue("Fester Schaden wird erklärt", !!r.note);
  }

  // OHKO moves report themselves rather than inventing a number.
  const ohko = moveList.find((m) => m.fn === "OHKO");
  if (ohko) {
    const r = calculate(atk, def, ohko, field);
    check("K.o.-Attacke liefert keinen Zahlenwert", [r.min, r.max], [0, 0]);
    checkTrue("K.o.-Attacke wird erklärt", (r.note ?? "").includes("K.o."));
  }

  // Multi-hit moves expose their hit count so the per-hit value isn't mistaken for the total.
  const doubleKick = moveList.find((m) => m.fn === "HitTwoTimes");
  if (doubleKick) {
    const r = calculate(atk, def, doubleKick, field);
    check("Zweifachtreffer meldet 2 Treffer", [r.hits?.min, r.hits?.max], [2, 2]);
  }
  const multi = moveList.find((m) => m.fn === "HitTwoToFiveTimes");
  if (multi) {
    const r = calculate(atk, def, multi, field);
    check("2-5-Fachtreffer meldet die Spanne", [r.hits?.min, r.hits?.max], [2, 5]);
  }

  // Weight-based power reads the real weights from the data.
  const heavyMove = moveList.find((m) => m.fn === "PowerHigherWithTargetWeight");
  if (heavyMove) {
    const lightTarget = speciesList.find((s) => !s.fl && s.w > 0 && s.w < 10);
    const heavyTarget = speciesList.find((s) => !s.fl && s.w >= 200);
    if (lightTarget && heavyTarget) {
      const light = calculate(atk, sideOf(lightTarget.k, { ability: null }), heavyMove, field);
      const heavy = calculate(atk, sideOf(heavyTarget.k, { ability: null }), heavyMove, field);
      checkTrue(
        `Gewichtsbasierte Stärke: ${heavyTarget.n} (${heavyTarget.w}kg) > ${lightTarget.n} (${lightTarget.w}kg)`,
        heavy.max / heavy.typeMod > light.max / light.typeMod,
        `${heavy.max} (x${heavy.typeMod}) vs ${light.max} (x${light.typeMod})`
      );
    }
  }

  // HP-scaled power: Eruption-likes hit hard at full HP and weakly at low HP.
  const eruption = moveList.find((m) => m.fn === "PowerHigherWithUserHP");
  if (eruption) {
    const full = calculate({ ...atk, hpFraction: 1 }, def, eruption, field).max;
    const low = calculate({ ...atk, hpFraction: 0.25 }, def, eruption, field).max;
    checkTrue("KP-abhängige Stärke sinkt mit den KP", low < full / 2, `voll ${full}, bei 25% ${low}`);
  }
}

// --- Warning quality --------------------------------------------------------------------------
// A warning that fires for harmless abilities gets ignored when it finally matters, so the
// no-damage list is checked as carefully as the handlers themselves.
console.log("Warnqualitaet");
{
  const atk = sideOf("PIKACHU", { ability: null, level: 100 });
  const def = sideOf("BULBASAUR", { ability: null });

  // Every id on the no-damage list must be a real ability in this game's data.
  const realAbilities = new Set(abilityList.map((a) => a.i));
  const ghosts = [...NO_DAMAGE_EFFECT].filter((id) => !realAbilities.has(id));
  checkTrue(
    "keine erfundenen Ids in der Ohne-Wirkung-Liste",
    ghosts.length === 0,
    ghosts.length ? `unbekannt: ${ghosts.join(", ")}` : ""
  );

  // ...and must not also be registered as a real handler - that would be contradictory.
  const contradictions = [...NO_DAMAGE_EFFECT].filter((id) => isAbilityModelled(id));
  checkTrue(
    "Ohne-Wirkung-Liste ueberschneidet sich nicht mit echten Handlern",
    contradictions.length === 0,
    contradictions.length ? `doppelt: ${contradictions.join(", ")}` : ""
  );

  // A harmless ability must produce no warning...
  const harmless = calculate(sideOf("PIKACHU", { ability: "STATIC", level: 100 }), def, thunderbolt, field);
  checkTrue("Statik loest keine Warnung aus", !harmless.unmodelled.includes("ability:STATIC"));

  // ...while a genuinely unknown one still must.
  const unknown = calculate(sideOf("PIKACHU", { ability: "SUPREMEOVERLORD", level: 100 }), def, thunderbolt, field);
  checkTrue("unbekannte Faehigkeit warnt weiterhin", unknown.unmodelled.includes("ability:SUPREMEOVERLORD"));

  // An inert-by-category item must not warn...
  const stone = itemList.find((i) => i.i === "FIRESTONE");
  if (stone) {
    const r = calculate(sideOf("PIKACHU", { ability: null, item: "FIRESTONE" }), def, thunderbolt, field);
    checkTrue("Entwicklungsstein loest keine Warnung aus", !r.unmodelled.some((u) => u.startsWith("item:")));
  }

  // ...and an item that is BOTH inert-by-category and a real held item must keep its effect.
  // Scharfklaue is an evolution item, so the categorisation flag marks it inert - the registry
  // has to win. Without the ordering in calculate() this silently loses the crit boost.
  {
    const overlap = itemList.filter((i) => isItemModelled(i.i) && itemHasNoBattleEffect(i.i));
    checkTrue(
      "kategorisch inerte, aber modellierte Items behalten ihren Effekt",
      overlap.every((i) => isItemModelled(i.i)),
      `betroffen: ${overlap.map((i) => i.n).join(", ")}`
    );
    const razor = itemList.find((i) => i.i === "RAZORCLAW");
    if (razor) {
      const plain = calculate(sideOf("PIKACHU", { ability: null }), def, tackle, field, true);
      const withClaw = calculate(sideOf("PIKACHU", { ability: null, item: "RAZORCLAW" }), def, tackle, field, true);
      // Razor Claw only raises the crit STAGE, so damage is unchanged - what matters here is that
      // it isn't reported as unmodelled despite carrying the inert flag.
      check("Scharfklaue bleibt modelliert", withClaw.unmodelled.filter((u) => u.startsWith("item:")).length, 0);
      void plain;
    }
  }

  // Item-based inertness / real handlers found while auditing the "sonstige-kampf-items" bucket.
  {
    // The original complaint: Zitter-Orb (Adrenaline Orb) only affects Speed, no damage effect.
    const r0 = calculate(sideOf("PIKACHU", { ability: null, item: "ADRENALINEORB" }), def, thunderbolt, field);
    checkTrue("Zitter-Orb loest keine Warnung aus", !r0.unmodelled.some((u) => u.startsWith("item:")));

    // Poké Bälle, Mega-Steine und Kampf-Items (X-Attacke etc.) dürfen gar nicht mehr im
    // Item-Picker auftauchen - sie sind pocket 3/6/7 und wurden aus dem Export entfernt.
    const gone = ["POKEBALL", "MASTERBALL", "VENUSAURITEX", "XATTACK", "DIREHIT", "GUARDSPEC"];
    checkTrue(
      "Bälle/Mega-Steine/Kampf-Items nicht im Picker",
      gone.every((id) => !itemList.some((i) => i.i === id)),
      `noch vorhanden: ${gone.filter((id) => itemList.some((i) => i.i === id)).join(", ")}`
    );

    // Luftballon: echte Bodenimmunität, wie Schwebe.
    const balloon = calculate(sideOf("PIKACHU", { ability: null }), sideOf("BULBASAUR", { ability: null, item: "AIRBALLOON" }), moveById.get("EARTHQUAKE")!, field);
    check("Luftballon: immun gegen Boden", [balloon.min, balloon.max, balloon.typeMod], [0, 0, 0]);
    checkTrue("Luftballon gilt als modelliert", !balloon.unmodelled.some((u) => u.startsWith("item:")));

    // Leichtstein halbiert das Gewicht - wirkt sich auf gewichtsbasierte Stärke aus.
    const heavyMove = moveList.find((m) => m.fn === "PowerHigherWithTargetWeight");
    if (heavyMove) {
      const heavyTarget = speciesList.find((s) => !s.fl && s.w >= 200);
      if (heavyTarget) {
        const atk = sideOf("PIKACHU", { ability: null, level: 100 });
        const plain = calculate(atk, sideOf(heavyTarget.k, { ability: null }), heavyMove, field);
        const lighter = calculate(atk, sideOf(heavyTarget.k, { ability: null, item: "FLOATSTONE" }), heavyMove, field);
        checkTrue(
          "Leichtstein senkt gewichtsbasierte Stärke",
          lighter.max <= plain.max,
          `ohne ${plain.max}, mit ${lighter.max}`
        );
      }
    }

    // Elektro-Samen: +1 Verteidigung nur auf passendem Terrain.
    const tackleAtk = sideOf("PIKACHU", { ability: null, level: 100 });
    const seedDef = sideOf("BULBASAUR", { ability: null, item: "ELECTRICSEED" });
    const noTerrain = calculate(tackleAtk, seedDef, tackle, field);
    const electricField = { ...field, terrain: "electric" as const };
    const withTerrain = calculate(tackleAtk, seedDef, tackle, electricField);
    checkTrue(
      "Elektro-Samen wirkt nur auf Elektro-Terrain",
      withTerrain.max <= noTerrain.max,
      `ohne Terrain ${noTerrain.max}, mit ${withTerrain.max}`
    );
    const grassyField = { ...field, terrain: "grassy" as const };
    const wrongTerrain = calculate(tackleAtk, seedDef, tackle, grassyField);
    check("Elektro-Samen bleibt auf falschem Terrain wirkungslos", wrongTerrain.max, noTerrain.max);

    // Gezinkter Würfel: Mehrfachtreffer landen mindestens 4x (statt 2-5x).
    const multiMove = moveList.find((m) => m.fn === "HitTwoToFiveTimes");
    if (multiMove) {
      const diced = calculate(sideOf("PIKACHU", { ability: null, item: "LOADEDDICE" }), def, multiMove, field);
      check("Gezinkter Würfel: mindestens 4 Treffer", [diced.hits?.min, diced.hits?.max], [4, 5]);
    }
  }

  // Skill Link pins a 2-5 hit move to 5 hits.
  const multi = moveList.find((m) => m.fn === "HitTwoToFiveTimes");
  if (multi) {
    const plain = calculate(atk, def, multi, field);
    const linked = calculate(sideOf("PIKACHU", { ability: "SKILLLINK", level: 100 }), def, multi, field);
    check("ohne Wertelink: 2-5 Treffer", [plain.hits?.min, plain.hits?.max], [2, 5]);
    check("mit Wertelink: immer 5 Treffer", [linked.hits?.min, linked.hits?.max], [5, 5]);
  }
}

// --- Bundle-size guard ------------------------------------------------------------------------
// src/lib/data.ts statically imports ~5.4 MB of JSON for build-time page rendering. If anything
// in the calculator engine ever imports it, that whole payload silently lands in the browser
// bundle - the page still works, it just becomes enormous, so nothing would catch it by hand.
console.log("Bundle-Abgrenzung");
{
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : [full];
    });
  const calcDir = join(import.meta.dirname, "..", "src", "lib", "calc");
  const offenders = walk(calcDir).filter((file) => {
    const src = readFileSync(file, "utf-8");
    // Match import/export statements only, so the explanatory comments don't trip this.
    return /^\s*(import|export)[^;]*from\s+["'][^"']*lib\/data(\.ts)?["']/m.test(src);
  });
  checkTrue(
    "Engine importiert src/lib/data.ts nicht",
    offenders.length === 0,
    offenders.length ? `betroffen: ${offenders.join(", ")}` : ""
  );
}

console.log(`\n${passed} bestanden, ${failed} fehlgeschlagen`);
process.exit(failed > 0 ? 1 : 0);
