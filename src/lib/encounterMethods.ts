// Best-effort German labels for Essentials wild-encounter method codes (encounters.txt).
// Unknown/custom codes just fall back to the raw code - same pattern as evolutionMethods.ts.
const METHOD_LABELS: Record<string, string> = {
  Land: "Hohes Gras",
  LandMorning: "Hohes Gras (morgens)",
  LandDay: "Hohes Gras (tagsüber)",
  LandNight: "Hohes Gras (nachts)",
  Cave: "Höhle",
  CaveMorning: "Höhle (morgens)",
  CaveDay: "Höhle (tagsüber)",
  CaveNight: "Höhle (nachts)",
  Water: "Surfer",
  RockSmash: "Zertrümmerer",
  // Names match the actual in-game fishing rod items (items.txt: OLDROD/GOODROD/SUPERROD/
  // GOLDROD/MEGAROD/POWERROD/TREASUREROD/SLEEPROD/DOUBLEROD), not a generic translation.
  OldRod: "Angel",
  GoodRod: "Profi-Angel",
  SuperRod: "Meister-Angel",
  GoldRod: "Shiny-Angel",
  MegaRod: "Mega-Angel",
  PowerRod: "Fähigkeiten-Angel",
  SleepRod: "Schlummer-Angel",
  DoubleRod: "Doppel-Angel",
  TreasureRod: "Schatz-Angel",
  BugContest: "Käferwettbewerb",
  HeadbuttLow: "Kopfnuss (Baum, niedrig)",
  HeadbuttHigh: "Kopfnuss (Baum, hoch)",
  DarkGrass: "Dunkles Gras",
  // Raid dens (data-import/parseRaids.ts): "Raid" = rank depends on the player's badges.
  Raid: "Raid-Höhle",
  Raid1: "Raid-Höhle (Rang 1)",
  Raid2: "Raid-Höhle (Rang 2)",
  Raid3: "Raid-Höhle (Rang 3)",
  Raid4: "Raid-Höhle (Rang 4)",
  Raid5: "Raid-Höhle (Rang 5)",
  Raid6: "Raid-Höhle (Rang 6)",
  Raid7: "Raid-Höhle (Rang 7)",
  // Roaming Pokémon (data-import/parseRoaming.ts), suffix = roamer encounter type.
  Roaming0: "Umherstreifend",
  Roaming1: "Umherstreifend (Gras/Höhle)",
  Roaming2: "Umherstreifend (Surfer)",
  Roaming3: "Umherstreifend (Angel)",
  Roaming4: "Umherstreifend (Surfer/Angel)",
};

/** Roaming Pokémon are not drawn from a table: while one is on the current map, a quarter of
 *  the wild encounters become it. Their tables therefore get no percentage ("–"). */
export function hasEncounterShare(method: string): boolean {
  return !method.startsWith("Roaming");
}

export function encounterMethodLabel(method: string): string {
  return METHOD_LABELS[method] ?? method;
}

/** "12,5 %" - share of an encounter slot within its table, with a German decimal comma. */
export function formatEncounterChance(chance: number | undefined): string {
  if (chance === undefined) return "–";
  if (chance > 0 && chance < 0.1) return "< 0,1 %";
  return `${String(chance).replace(".", ",")} %`;
}
