// Writes a standalone Excel reference file (project root, NOT under src/ or public/, so it never
// ships on the published wiki) answering "what can I catch with which fishing rod?".
//
// Sheet "Angeln": one column block per rod, in in-game progression order, listing every species
// that rod can hook anywhere in the game - each species once, no matter how many maps it appears
// on. Sheet "Nach Generation": the union of all of those species, grouped by generation.
//
// Regenerated every time buildData.ts runs, alongside the other three *-Uebersicht.xlsx files.
import ExcelJS from "exceljs";
import { join } from "node:path";
import { TITLE_FONT, NOTE_FONT, FONT, writeGroupedSection, type ColumnDef } from "./xlsxGroupedSection.ts";
import { speciesDisplayName } from "./resolveEncounterTarget.ts";
import { encounterMethodLabel } from "../src/lib/encounterMethods.ts";
import type { EncounterLocation, Pokemon } from "./dataModel.ts";

const OUT_PATH = join(import.meta.dirname, "..", "Angel-Uebersicht.xlsx");

// In-game progression order: the three core rods first, then the special rods added by the
// "Special Fishing Rods" script. Every one of these is its own encounter type in encounters.txt -
// no rod reuses another's table. MegaRod is last because it is the odd one out (see EMPTY_NOTE).
const ROD_METHODS = [
  "OldRod",
  "GoodRod",
  "SuperRod",
  "GoldRod",
  "PowerRod",
  "SleepRod",
  "DoubleRod",
  "TreasureRod",
  "MegaRod",
] as const;

// The MEGAROD item exists and its handler calls pbEncounter(:MegaRod), but no map in
// encounters.txt defines a MegaRod section - so the rod can currently never catch anything.
// Shown explicitly rather than as a blank column so the gap doesn't read as an export bug.
const EMPTY_NOTE = "— keine Fangdaten hinterlegt —";

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface FishingRow {
  name: string;
}

const COLUMNS: ColumnDef<FishingRow>[] = [{ header: "Pokémon", width: 24, get: (r) => r.name }];

function byGermanName(a: FishingRow, b: FishingRow) {
  return a.name.localeCompare(b.name, "de");
}

/** Collects, per rod, the set of species display names it can catch anywhere, plus a
 *  display-name -> generation lookup. Forms have no Generation field of their own in PBS, so
 *  they inherit their base species' (e.g. "Onix (Chrono)" counts as generation 1). */
function buildRodIndex(encounters: EncounterLocation[], pokemonById: Map<string, Pokemon>) {
  const rodSpecies = new Map<string, Set<string>>(ROD_METHODS.map((m) => [m, new Set<string>()]));
  const generationByName = new Map<string, number>();

  for (const location of encounters) {
    for (const table of location.tables) {
      const bucket = rodSpecies.get(table.method);
      if (!bucket) continue; // not a fishing table
      for (const slot of table.slots) {
        const name = speciesDisplayName(slot.species, pokemonById);
        bucket.add(name);
        if (generationByName.has(name)) continue;
        const base = slot.species.match(/^(.+)_\d+$/)?.[1] ?? slot.species;
        const generation = pokemonById.get(base)?.generation ?? pokemonById.get(slot.species)?.generation ?? null;
        if (generation !== null) generationByName.set(name, generation);
      }
    }
  }
  return { rodSpecies, generationByName };
}

function writeIntro(sheet: ExcelJS.Worksheet, title: string, note: string, width: number, height: number) {
  sheet.getCell(1, 1).value = title;
  sheet.getCell(1, 1).font = TITLE_FONT;
  sheet.getCell(2, 1).value = note;
  sheet.getCell(2, 1).font = NOTE_FONT;
  sheet.mergeCells(2, 1, 2, width);
  sheet.getRow(2).height = height;
  sheet.getCell(2, 1).alignment = { wrapText: true, vertical: "top" };
}

export async function exportFishingListXlsx(encounters: EncounterLocation[], pokemon: Pokemon[]) {
  const pokemonById = new Map(pokemon.map((p) => [p.id, p]));
  const { rodSpecies, generationByName } = buildRodIndex(encounters, pokemonById);

  const allSpecies = new Set<string>();
  for (const method of ROD_METHODS) {
    for (const name of rodSpecies.get(method)!) allSpecies.add(name);
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = "Chronoria Wiki (data-import/exportFishingList.ts)";
  wb.created = new Date();

  // --- Sheet 1: one block per rod -------------------------------------------------------------
  const rodSheet = wb.addWorksheet("Angeln");
  rodSheet.columns = ROD_METHODS.map(() => ({ width: COLUMNS[0].width }));
  writeIntro(
    rodSheet,
    "Chronoria – Was fängt man mit welcher Angel?",
    "Generiert aus den Wildfang-Encounterdaten (data-import/parseEncounters.ts, PBS/encounters.txt), automatisch bei " +
      "jedem build-data-Lauf. Pro Angel stehen alle Pokémon, die sich damit irgendwo im Spiel angeln lassen – jedes " +
      "Pokémon einmal, unabhängig davon, auf wie vielen Karten es vorkommt, alphabetisch sortiert. Die Angeln stehen " +
      "in der Reihenfolge des Spielfortschritts. Shiny-, Schlummer- und Doppel-Angel greifen auf identische Fangtabellen " +
      "zu, die Schatz-Angel weicht nur an einer Stelle ab und die Fähigkeiten-Angel unterscheidet sich meist nur in den " +
      "Leveln – dass diese Spalten sehr ähnlich aussehen, ist also korrekt. Die Mega-Angel existiert als Item, hat " +
      "aber auf keiner einzigen Karte eine Fangtabelle und kann daher derzeit nichts fangen.",
    ROD_METHODS.length,
    72
  );

  const rodRows = new Map<string | number, FishingRow[]>();
  for (const method of ROD_METHODS) {
    const names = [...rodSpecies.get(method)!].map((name) => ({ name })).sort(byGermanName);
    rodRows.set(method, names.length > 0 ? names : [{ name: EMPTY_NOTE }]);
  }

  const countRow = 5; // section title on row 4, count label on row 5 (see writeGroupedSection)
  writeGroupedSection(
    rodSheet,
    4,
    "Pokémon je Angel",
    "Angelbare Pokémon insgesamt:",
    ROD_METHODS,
    (key) => encounterMethodLabel(String(key)),
    rodRows,
    COLUMNS
  );
  // writeGroupedSection's own count sums every block, which counts species shared between rods
  // many times over - replace it with the distinct total, which is what the label promises.
  rodSheet.getCell(countRow, 2).value = allSpecies.size;
  rodSheet.getCell(countRow, 2).font = FONT;
  rodSheet.views = [{ state: "frozen", ySplit: 6 }];

  // --- Sheet 2: the same species, grouped by generation ----------------------------------------
  const genSheet = wb.addWorksheet("Nach Generation");
  genSheet.columns = GENERATIONS.map(() => ({ width: COLUMNS[0].width }));
  writeIntro(
    genSheet,
    "Chronoria – Angelbare Pokémon nach Generation",
    "Dieselben Pokémon wie auf dem Blatt \"Angeln\", aber als Gesamtmenge über alle Angeln hinweg und nach " +
      "Generation gruppiert (Generation aus dem Feld \"Generation\" in PBS/pokemon.txt). Alternative Formen haben in den " +
      "PBS-Daten kein eigenes Generationsfeld und zählen deshalb zur Generation ihrer Basis-Spezies – die " +
      "Chrono-Formen von Onix und Stahlos stehen also bei Generation 1 bzw. 2, die Hisui-Form von Baldorfish bei " +
      "Generation 2.",
    GENERATIONS.length,
    58
  );

  const genRows = new Map<string | number, FishingRow[]>(GENERATIONS.map((g) => [g, [] as FishingRow[]]));
  const missingGeneration: string[] = [];
  for (const name of allSpecies) {
    const generation = generationByName.get(name);
    if (generation === undefined || !genRows.has(generation)) {
      missingGeneration.push(name);
      continue;
    }
    genRows.get(generation)!.push({ name });
  }
  for (const generation of GENERATIONS) genRows.get(generation)!.sort(byGermanName);

  writeGroupedSection(
    genSheet,
    4,
    "Angelbare Pokémon nach Generation",
    "Angelbare Pokémon insgesamt:",
    GENERATIONS,
    (key) => `Generation ${key}`,
    genRows,
    COLUMNS
  );
  genSheet.views = [{ state: "frozen", ySplit: 6 }];

  await wb.xlsx.writeFile(OUT_PATH);
  return {
    rods: ROD_METHODS.length,
    rodsWithData: ROD_METHODS.filter((m) => rodSpecies.get(m)!.size > 0).length,
    species: allSpecies.size,
    missingGeneration,
    path: OUT_PATH,
  };
}
