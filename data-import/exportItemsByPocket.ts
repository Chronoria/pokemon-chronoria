// Adds a third sheet ("Items nach Tasche") to the Item-Uebersicht.xlsx workbook (see
// exportItemList.ts, which calls addItemsByPocketSheet before writing the file). Unlike the
// "Items" sheet's split into available/unavailable, this sheet lists every item by pocket and
// color-codes each row by how it's obtainable, so the two sheets serve different questions
// ("is this placed yet" vs. "how exactly do I get this, and what similar items exist nearby").
import type ExcelJS from "exceljs";
import { pocketName } from "../src/lib/itemPockets.ts";
import { naturalCompare } from "./naturalSort.ts";
import { writeGroupedSection, TITLE_FONT, NOTE_FONT, FONT, type ColumnDef, type RowStyle } from "./xlsxGroupedSection.ts";
import { parseRecipes } from "./parseRecipes.ts";
import type { Item } from "./dataModel.ts";

const POCKET_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

// Groups items whose *internal* PBS id shares a thematic suffix (evolution stones, Arceus
// plates, ...) even though their German display names don't share any common prefix/word (e.g.
// Donnerstein/Feuerstein/Wassersteine have nothing textually in common) - see plan notes for how
// these suffix/exclude lists were derived from a full scan of items.txt. Order doesn't matter:
// the suffixes themselves don't overlap (nothing simultaneously ends in two of them).
interface FamilyRule {
  suffix: string;
  exclude: string[];
}
const FAMILY_RULES: FamilyRule[] = [
  { suffix: "MEMORY", exclude: [] }, // Silvally memories - no exceptions
  { suffix: "GEM", exclude: [] }, // type gems - no exceptions
  { suffix: "ITE", exclude: ["EVIOLITE", "METEORITE"] }, // Mega Stones
  { suffix: "PLATE", exclude: ["LEGENDPLATE", "BLANKPLATE"] }, // Arceus plates
  { suffix: "STONE", exclude: [] }, // evolution stones (STONEPLATE/CORNERSTONEMASK don't end in "STONE", so no exclusion needed)
];

function familyKeyFor(id: string): string | null {
  for (const rule of FAMILY_RULES) {
    if (id.endsWith(rule.suffix) && !rule.exclude.includes(id)) return rule.suffix;
  }
  return null;
}

interface PocketRow {
  name: string;
  count: number;
  status: string;
  hasUsed: boolean;
  hasShop: boolean;
  isIngredient: boolean;
  isResult: boolean;
  sortKey: string;
}

const COLUMNS: ColumnDef<PocketRow>[] = [
  { header: "Item", width: 22, get: (r) => r.name },
  { header: "Anzahl", width: 8, get: (r) => r.count },
  { header: "Status", width: 22, get: (r) => r.status },
];

// Highlight colors, all modeled on Excel's built-in cell-style palette (same approach as the
// BST-Rangliste sheet in Routen-Uebersicht.xlsx) so the look stays consistent across files.
const USED_STYLE: RowStyle = { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6EFCE" } }, fontColor: "FF006100" };
const SHOP_STYLE: RowStyle = { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFBDD7EE" } }, fontColor: "FF1F4E78" };
const BOTH_STYLE: RowStyle = { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9C2E9" } }, fontColor: "FF5B2C6F" };
const INGREDIENT_STYLE: RowStyle = { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEB9C" } }, fontColor: "FF9C6500" };
const RESULT_STYLE: RowStyle = { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFCD5B4" } }, fontColor: "FF974706" };
// Recipe role AND availability both apply (e.g. an ingredient that's also sold in a shop) - its
// own color so neither fact gets silently dropped; the Status column still spells out exactly
// which combination applies.
const COMBO_STYLE: RowStyle = { fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } }, fontColor: "FF9C0006" };

function styleFor(row: PocketRow): RowStyle | null {
  const hasAvailability = row.hasUsed || row.hasShop;
  const hasRecipeRole = row.isIngredient || row.isResult;
  if (hasAvailability && hasRecipeRole) return COMBO_STYLE;
  if (hasRecipeRole) return row.isIngredient ? INGREDIENT_STYLE : RESULT_STYLE;
  if (hasAvailability) return row.hasUsed && row.hasShop ? BOTH_STYLE : row.hasUsed ? USED_STYLE : SHOP_STYLE;
  return null;
}

function statusText(row: PocketRow): string {
  const parts: string[] = [];
  if (row.hasUsed) parts.push("Fund");
  if (row.hasShop) parts.push("Shop");
  if (row.isIngredient) parts.push("Zutat");
  if (row.isResult) parts.push("Rezept");
  return parts.length ? parts.join(", ") : "–";
}

function byFamilyThenName(a: PocketRow, b: PocketRow): number {
  const keyCompare = a.sortKey.localeCompare(b.sortKey, "de");
  if (keyCompare !== 0) return keyCompare;
  return naturalCompare(a.name, b.name);
}

export function addItemsByPocketSheet(wb: ExcelJS.Workbook, items: Item[]): number {
  const { resultItemIds, ingredientItemIds } = parseRecipes();

  const rowsByPocket = new Map<string | number, PocketRow[]>();
  for (const pocket of POCKET_IDS) {
    const rows: PocketRow[] = items
      .filter((i) => i.pocket === pocket)
      .map((i) => {
        const hasUsed = i.locations.length > 0;
        const hasShop = i.locations.some((l) => l.source === "shop");
        const isIngredient = ingredientItemIds.has(i.id);
        const isResult = resultItemIds.has(i.id);
        const row: PocketRow = {
          name: i.name,
          count: i.locations.filter((l) => l.source !== "shop").length,
          status: "",
          hasUsed,
          hasShop,
          isIngredient,
          isResult,
          sortKey: familyKeyFor(i.id) ?? i.name,
        };
        row.status = statusText(row);
        return row;
      })
      .sort(byFamilyThenName);
    rowsByPocket.set(pocket, rows);
  }
  const total = [...rowsByPocket.values()].reduce((sum, list) => sum + list.length, 0);

  const sheet = wb.addWorksheet("Items nach Tasche");
  const maxCols = POCKET_IDS.length * COLUMNS.length;
  sheet.columns = Array.from({ length: maxCols }, (_, i) => ({ width: COLUMNS[i % COLUMNS.length].width }));

  let row = 1;
  sheet.getCell(row, 1).value = "Chronoria - Items nach Tasche";
  sheet.getCell(row, 1).font = TITLE_FONT;
  row += 1;
  sheet.getCell(row, 1).value =
    "Generiert aus PBS/items.txt und PBS/recipes.txt, automatisch bei jedem build-data-Lauf. Taschen stehen nebeneinander. " +
    "Innerhalb einer Tasche stehen thematisch zusammengehörende Items beieinander (z.B. alle Entwicklungssteine, alle " +
    "Arceus-Platten), erkannt an ihrer internen PBS-ID, nicht am deutschen Anzeigenamen - ansonsten alphabetisch. " +
    '"Anzahl" zählt Fundorte ohne Shop-Bestand (wie im "Items"-Sheet). Zeilen sind eingefärbt je nach Erhältlichkeit/' +
    "Rezept-Rolle, siehe Legende darunter - die Status-Spalte schreibt die genauen Kategorien immer aus, auch wenn " +
    "mehrere gleichzeitig zutreffen.";
  sheet.getCell(row, 1).font = NOTE_FONT;
  sheet.mergeCells(row, 1, row, maxCols);
  sheet.getRow(row).height = 58;
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  row += 1;

  const legendRow = row;
  const legendEntries: [string, RowStyle][] = [
    ["Fund", USED_STYLE],
    ["Shop", SHOP_STYLE],
    ["Fund + Shop", BOTH_STYLE],
    ["Rezeptzutat", INGREDIENT_STYLE],
    ["Rezept", RESULT_STYLE],
    ["Rezept-Rolle + Erhältlichkeit", COMBO_STYLE],
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
    "Items nach Tasche",
    "Anzahl Items:",
    POCKET_IDS,
    (key) => pocketName(key as number),
    rowsByPocket,
    COLUMNS,
    styleFor
  );

  return total;
}
