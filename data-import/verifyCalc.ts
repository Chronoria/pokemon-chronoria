// Golden-case checks for the damage engine.
//
// Usage: node data-import/verifyCalc.ts
//
// The engine is DOM-free on purpose so it can be exercised here. These cases pin down the parts
// of the formula that are easy to get subtly wrong (rounding order, stage application, the crit
// clamp, spread reduction) - a UI can look perfectly fine while quietly producing wrong numbers.
import { calculate, defaultField, defaultSide, speciesByKey, moveById, statsFor } from "../src/lib/calc/index.ts";
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
  const r = calculate(sideOf("PIKACHU", { ability: "STATIC" }), sideOf("BULBASAUR"), thunderbolt, field);
  checkTrue("nicht modellierte Fähigkeit wird gemeldet", r.unmodelled.includes("ability:STATIC"));
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
