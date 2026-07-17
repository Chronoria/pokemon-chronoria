// Writes a standalone Excel reference file (project root, NOT under src/ or public/, so it
// never ships on the published wiki) listing every wild encounter, organized by route/location -
// one row per (Route, Methode, Pokémon). Within a route, methods keep the order they're authored
// in encounters.txt (so e.g. LandMorning/LandDay/LandNight or the rod tiers stay grouped
// together instead of being alphabetized apart); within a method, Pokémon are sorted descending
// by chance. Regenerated every time buildData.ts runs, alongside Item-Uebersicht.xlsx and
// Pokemon-Uebersicht.xlsx.
import ExcelJS from "exceljs";
import { join } from "node:path";
import { TITLE_FONT, NOTE_FONT, COL_HEADER_FONT, COL_HEADER_FILL, FONT, writeGroupedSection, type ColumnDef, type RowStyle } from "./xlsxGroupedSection.ts";
import { resolveEncounterTarget } from "./resolveEncounterTarget.ts";
import { encounterMethodLabel } from "../src/lib/encounterMethods.ts";
import { formLabel } from "./exportPokemonList.ts";
import { parsePokemonMapLocations } from "./parsePokemonMapLocations.ts";
import type { EncounterLocation, Pokemon } from "./dataModel.ts";

const OUT_PATH = join(import.meta.dirname, "..", "Routen-Uebersicht.xlsx");
const COLUMN_WIDTHS = [28, 22, 22, 12, 10];
const COLUMN_HEADERS = ["Route", "Methode", "Pokémon", "Level", "Chance"];

interface Row {
  speciesName: string;
  levelLabel: string;
  chancePercent: number;
}

interface MethodGroup {
  method: string;
  rows: Row[];
}

interface LocationGroup {
  locationName: string;
  methods: MethodGroup[];
  rowCount: number;
}

interface BstRow {
  rank: number; // position within its generation's list, not a global rank
  name: string;
  bst: number;
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  hasWild: boolean;
  hasEvent: boolean;
}

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// Labels match the StatBar labels used on the Pokémon detail pages (pokemon/[pokemonId]/index.astro) exactly.
const BST_COLUMNS: ColumnDef<BstRow>[] = [
  { header: "Rang", width: 6, get: (r) => r.rank },
  { header: "Pokémon", width: 20, get: (r) => r.name },
  { header: "BST", width: 7, get: (r) => r.bst },
  { header: "LP", width: 6, get: (r) => r.hp },
  { header: "Angriff", width: 7, get: (r) => r.attack },
  { header: "Verteidigung", width: 9, get: (r) => r.defense },
  { header: "Sp. Angriff", width: 9, get: (r) => r.spAtk },
  { header: "Sp. Vert.", width: 8, get: (r) => r.spDef },
  { header: "Init.", width: 6, get: (r) => r.speed },
];

// Highlight colors, one per availability combination - modeled on Excel's built-in "Good/Bad/
// Neutral" cell-style palette so the look is familiar. No fill = obtainable via neither source
// covered here (may still be obtainable some other way, e.g. evolution only).
const WILD_STYLE: RowStyle = {
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6EFCE" } },
  fontColor: "FF006100",
};
const EVENT_STYLE: RowStyle = {
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } },
  fontColor: "FF1F4E78",
};
const BOTH_STYLE: RowStyle = {
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9C2E9" } },
  fontColor: "FF5B2C6F",
};

function styleFor(row: BstRow): RowStyle | null {
  if (row.hasWild && row.hasEvent) return BOTH_STYLE;
  if (row.hasWild) return WILD_STYLE;
  if (row.hasEvent) return EVENT_STYLE;
  return null;
}

function buildBstRowsByGeneration(pokemon: Pokemon[], pokemonById: Map<string, Pokemon>): Map<number, BstRow[]> {
  const eventLocations = parsePokemonMapLocations(pokemonById);
  const byGen = new Map<number, BstRow[]>(GENERATIONS.map((g) => [g, []]));

  for (const p of pokemon) {
    // Same form set as exportPokemonList.ts: base species plus every non-female-cosmetic form
    // (female-only forms are a gender-appearance toggle, not a separately obtainable form).
    const forms = [
      { formNumber: 0, formName: null, baseStats: p.baseStats, foundIn: p.foundIn },
      ...p.forms.filter((f) => !f.isFemaleForm),
    ];
    for (const f of forms) {
      const { hp, attack, defense, spAtk, spDef, speed } = f.baseStats;
      byGen.get(p.generation ?? 1)!.push({
        rank: 0, // filled in below once each generation's list is sorted
        name: formLabel(p.name, f),
        bst: hp + attack + defense + spAtk + spDef + speed,
        hp,
        attack,
        defense,
        spAtk,
        spDef,
        speed,
        hasWild: f.foundIn.length > 0,
        hasEvent: (eventLocations.get(p.id)?.get(f.formNumber) ?? []).length > 0,
      });
    }
  }

  for (const gen of GENERATIONS) {
    const list = byGen.get(gen)!;
    list.sort((a, b) => b.bst - a.bst);
    list.forEach((r, i) => (r.rank = i + 1));
  }
  return byGen;
}

function addBstSheet(wb: ExcelJS.Workbook, pokemon: Pokemon[], pokemonById: Map<string, Pokemon>): number {
  const byGen = buildBstRowsByGeneration(pokemon, pokemonById);
  const total = [...byGen.values()].reduce((sum, list) => sum + list.length, 0);

  const sheet = wb.addWorksheet("BST-Rangliste");
  const maxCols = GENERATIONS.length * BST_COLUMNS.length;
  sheet.columns = Array.from({ length: maxCols }, (_, i) => ({ width: BST_COLUMNS[i % BST_COLUMNS.length].width }));

  let row = 1;
  sheet.getCell(row, 1).value = "Chronoria - Pokémon nach Base Stat Total (BST)";
  sheet.getCell(row, 1).font = TITLE_FONT;
  row += 1;
  sheet.getCell(row, 1).value =
    "Generiert aus pokemon.txt + Gen-9-Pack-Dateien (data-import/parsePokemon.ts), automatisch bei jedem build-data-Lauf. " +
    "BST = Summe aller 6 Basiswerte. Generationen stehen nebeneinander, pro Generation absteigend nach BST sortiert - " +
    "\"Rang\" bezieht sich also auf die jeweilige Generation, nicht auf alle Pokémon zusammen. Eine Zeile pro Basis-Spezies " +
    "und pro alternativer Form mit eigenen Basiswerten (z.B. Mega-Entwicklungen) - rein weiblich-exklusive Formen " +
    "(Geschlechts-Optik ohne eigene Werte) sind ausgeschlossen, wie auch sonst auf der Wiki. Zeilen sind eingefärbt je " +
    "nachdem, wie das Pokémon erhältlich ist (siehe Legende darunter) - keine Färbung heißt nicht zwingend \"nirgends " +
    "erhältlich\", sondern nur \"nicht per Wildfang oder Event/Geschenk laut den hier ausgewerteten Quellen\" (z.B. reine " +
    "Entwicklungen).";
  sheet.getCell(row, 1).font = NOTE_FONT;
  sheet.mergeCells(row, 1, row, maxCols);
  sheet.getRow(row).height = 58;
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  row += 1;

  const legendRow = row;
  const legendEntries: [string, RowStyle][] = [
    ["Wildfang (Encounter-Sheet)", WILD_STYLE],
    ["Event/Geschenk (NPC, Ei, Tausch, ...)", EVENT_STYLE],
    ["Beides", BOTH_STYLE],
  ];
  legendEntries.forEach(([label, style], i) => {
    const cell = sheet.getCell(legendRow, i + 1);
    cell.value = label;
    cell.font = { ...FONT, color: { argb: style.fontColor } };
    cell.fill = style.fill;
  });
  row += 2;

  writeGroupedSection(
    sheet,
    row,
    "Pokémon nach BST",
    "Anzahl:",
    GENERATIONS,
    (gen) => `Generation ${gen}`,
    byGen,
    BST_COLUMNS,
    styleFor
  );

  return total;
}

function speciesDisplayName(rawId: string, pokemonById: Map<string, Pokemon>): string {
  const resolved = resolveEncounterTarget(rawId, pokemonById);
  if (!resolved) return rawId; // unresolved species (see buildData.ts's own "[Fundorte]" warning for the same data)
  const species = pokemonById.get(resolved.speciesId)!;
  const form =
    resolved.formNumber === null
      ? { formNumber: 0, formName: null }
      : species.forms.find((f) => f.formNumber === resolved.formNumber)!;
  return formLabel(species.name, form);
}

function buildLocationGroups(encounters: EncounterLocation[], pokemonById: Map<string, Pokemon>): LocationGroup[] {
  const groups: LocationGroup[] = [];
  for (const location of encounters) {
    const methods: MethodGroup[] = [];
    let locationRowCount = 0;
    for (const table of location.tables) {
      if (table.slots.length === 0) continue;
      const total = table.slots.reduce((sum, slot) => sum + slot.chance, 0);
      const rows: Row[] = [...table.slots]
        .sort((a, b) => b.chance - a.chance)
        .map((slot) => ({
          speciesName: speciesDisplayName(slot.species, pokemonById),
          levelLabel: slot.minLevel === slot.maxLevel ? String(slot.minLevel) : `${slot.minLevel}–${slot.maxLevel}`,
          chancePercent: total > 0 ? Math.round((slot.chance / total) * 100) : 0,
        }));
      methods.push({ method: encounterMethodLabel(table.method), rows });
      locationRowCount += rows.length;
    }
    if (locationRowCount === 0) continue;
    groups.push({ locationName: location.locationName, methods, rowCount: locationRowCount });
  }
  groups.sort((a, b) => a.locationName.localeCompare(b.locationName, "de"));
  return groups;
}

export async function exportEncounterListXlsx(encounters: EncounterLocation[], pokemon: Pokemon[]) {
  const pokemonById = new Map(pokemon.map((p) => [p.id, p]));
  const locationGroups = buildLocationGroups(encounters, pokemonById);
  const totalRows = locationGroups.reduce((sum, g) => sum + g.rowCount, 0);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Chronoria Wiki (data-import/exportEncounterList.ts)";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Encounter");
  sheet.columns = COLUMN_WIDTHS.map((width) => ({ width }));

  let row = 1;
  sheet.getCell(row, 1).value = "Chronoria - Encounter-Übersicht nach Routen";
  sheet.getCell(row, 1).font = TITLE_FONT;
  row += 1;
  sheet.getCell(row, 1).value =
    "Generiert aus den Wildfang-Encounterdaten (data-import/parseEncounters.ts, PBS/encounters.txt), automatisch bei " +
    "jedem build-data-Lauf. Pro Route stehen die Fangmethoden in der Reihenfolge aus encounters.txt (z.B. Tageszeiten " +
    "oder Angel-Typen bleiben zusammen), pro Methode die Pokémon absteigend nach Chance sortiert. \"Chance\" ist der " +
    "relative Anteil des Encounter-Slots an allen Slots derselben Methode auf dieser Route, nicht die absolute " +
    "Begegnungswahrscheinlichkeit pro Schritt.";
  sheet.getCell(row, 1).font = NOTE_FONT;
  sheet.mergeCells(row, 1, row, COLUMN_WIDTHS.length);
  sheet.getRow(row).height = 45;
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  row += 2;

  const headerRow = row;
  COLUMN_HEADERS.forEach((label, i) => {
    const cell = sheet.getCell(headerRow, i + 1);
    cell.value = label;
    cell.font = COL_HEADER_FONT;
    cell.fill = COL_HEADER_FILL;
  });
  row += 1;

  // Header row stays visible while scrolling - this sheet is one long list (one block per
  // route), unlike the side-by-side grouped layout of Item-/Pokemon-Uebersicht.xlsx.
  sheet.views = [{ state: "frozen", ySplit: headerRow }];

  let shade = false;
  for (const location of locationGroups) {
    const locationStartRow = row;
    const fill = shade
      ? { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF2F2F2" } }
      : undefined;
    for (const methodGroup of location.methods) {
      const methodStartRow = row;
      for (const r of methodGroup.rows) {
        sheet.getCell(row, 1).value = location.locationName;
        sheet.getCell(row, 2).value = methodGroup.method;
        sheet.getCell(row, 3).value = r.speciesName;
        sheet.getCell(row, 4).value = r.levelLabel;
        sheet.getCell(row, 5).value = `${r.chancePercent}%`;
        for (let c = 1; c <= COLUMN_WIDTHS.length; c++) {
          const cell = sheet.getCell(row, c);
          cell.font = FONT;
          if (fill) cell.fill = fill;
        }
        row += 1;
      }
      if (row - 1 > methodStartRow) sheet.mergeCells(methodStartRow, 2, row - 1, 2);
    }
    if (row - 1 > locationStartRow) sheet.mergeCells(locationStartRow, 1, row - 1, 1);
    shade = !shade;
  }

  const bstCount = addBstSheet(wb, pokemon, pokemonById);

  await wb.xlsx.writeFile(OUT_PATH);
  return { locations: locationGroups.length, rows: totalRows, bstEntries: bstCount, path: OUT_PATH };
}
