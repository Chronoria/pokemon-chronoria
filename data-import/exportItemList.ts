// Writes a standalone Excel reference file (project root, NOT under src/ or public/, so it
// never ships on the published wiki) listing every item, split into "already obtainable
// in-game" (has at least one map location from parseMapLocations.ts) and "not yet placed".
// Both sections lay pockets out side by side (one column-block per pocket) instead of one long
// vertical list, so the whole overview fits in far fewer rows. Regenerated every time
// buildData.ts runs, so it stays in sync whenever the map-event dump is re-synced.
import ExcelJS from "exceljs";
import { join } from "node:path";
import { pocketName } from "../src/lib/itemPockets.ts";
import type { Item } from "./dataModel.ts";

const OUT_PATH = join(import.meta.dirname, "..", "Item-Uebersicht.xlsx");
const POCKET_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

const FONT = { name: "Arial", size: 11 };
const TITLE_FONT = { name: "Arial", size: 16, bold: true };
const SECTION_FONT = { name: "Arial", size: 13, bold: true };
const POCKET_HEADER_FONT = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
const POCKET_HEADER_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF2F5496" } };
const COL_HEADER_FONT = { name: "Arial", size: 10, bold: true };
const COL_HEADER_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFD9E2F3" } };
const NOTE_FONT = { name: "Arial", size: 10, italic: true, color: { argb: "FF666666" } };

interface Row {
  name: string;
  count: number;
  locationNames: string;
}

interface ColumnDef {
  header: string;
  width: number;
  get: (row: Row) => string | number;
}

const AVAILABLE_COLUMNS: ColumnDef[] = [
  { header: "Item", width: 22, get: (r) => r.name },
  { header: "Anzahl", width: 9, get: (r) => r.count },
  { header: "Fundorte", width: 45, get: (r) => r.locationNames },
];
const UNAVAILABLE_COLUMNS: ColumnDef[] = [{ header: "Item", width: 22, get: (r) => r.name }];

// Natural sort: splits into digit/non-digit runs and compares digit runs numerically, so
// "TM2" < "TM10" < "TM102" (plain localeCompare would put "TM10" before "TM102" before "TM2",
// since TM names aren't consistently zero-padded once there are 100+ of them).
function naturalCompare(a: string, b: string): number {
  const ax = a.match(/\d+|\D+/g) ?? [];
  const bx = b.match(/\d+|\D+/g) ?? [];
  const len = Math.max(ax.length, bx.length);
  for (let i = 0; i < len; i++) {
    const av = ax[i] ?? "";
    const bv = bx[i] ?? "";
    if (av === bv) continue;
    if (/^\d+$/.test(av) && /^\d+$/.test(bv)) return Number(av) - Number(bv);
    return av.localeCompare(bv, "de");
  }
  return 0;
}

function byName(a: Row, b: Row) {
  return naturalCompare(a.name, b.name);
}

/** Writes one section as pocket column-blocks side by side, each block using the given
 *  column definitions (Item/Anzahl/Fundorte for the "available" section, just Item for the
 *  other) - so pockets read left to right instead of one long list sorted by pocket. */
function writeSection(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  title: string,
  itemsByPocket: Map<number, Row[]>,
  columns: ColumnDef[]
): number {
  let row = startRow;
  const colsPerPocket = columns.length;
  const totalItems = [...itemsByPocket.values()].reduce((sum, list) => sum + list.length, 0);
  const totalCols = POCKET_IDS.length * colsPerPocket;

  sheet.getCell(row, 1).value = title;
  sheet.getCell(row, 1).font = SECTION_FONT;
  row += 1;
  sheet.getCell(row, 1).value = "Anzahl Items:";
  sheet.getCell(row, 1).font = FONT;
  sheet.getCell(row, 2).value = totalItems;
  sheet.getCell(row, 2).font = FONT;
  row += 1;

  const pocketHeaderRow = row;
  POCKET_IDS.forEach((pocket, i) => {
    const startCol = i * colsPerPocket + 1;
    const cell = sheet.getCell(pocketHeaderRow, startCol);
    cell.value = pocketName(pocket);
    cell.font = POCKET_HEADER_FONT;
    cell.fill = POCKET_HEADER_FILL;
    if (colsPerPocket > 1) {
      sheet.mergeCells(pocketHeaderRow, startCol, pocketHeaderRow, startCol + colsPerPocket - 1);
    }
  });
  row += 1;

  if (colsPerPocket > 1) {
    const colHeaderRow = row;
    POCKET_IDS.forEach((_, i) => {
      const startCol = i * colsPerPocket + 1;
      columns.forEach((col, ci) => {
        const cell = sheet.getCell(colHeaderRow, startCol + ci);
        cell.value = col.header;
        cell.font = COL_HEADER_FONT;
        cell.fill = COL_HEADER_FILL;
      });
    });
    row += 1;
  }

  const dataStartRow = row;
  const maxLen = Math.max(0, ...POCKET_IDS.map((p) => itemsByPocket.get(p)?.length ?? 0));
  for (let r = 0; r < maxLen; r++) {
    POCKET_IDS.forEach((pocket, i) => {
      const list = itemsByPocket.get(pocket) ?? [];
      const item = list[r];
      if (!item) return;
      const startCol = i * colsPerPocket + 1;
      columns.forEach((col, ci) => {
        const cell = sheet.getCell(dataStartRow + r, startCol + ci);
        cell.value = col.get(item);
        cell.font = FONT;
        cell.alignment = { wrapText: col.header === "Fundorte" };
      });
    });
  }

  // Header underline plus a vertical separator between pocket blocks (right border on each
  // block's last column) so the side-by-side pockets stay easy to tell apart at a glance.
  const lastDataRow = dataStartRow + maxLen - 1;
  for (let r = pocketHeaderRow; r <= Math.max(lastDataRow, pocketHeaderRow); r++) {
    for (let c = 1; c <= totalCols; c++) {
      const isPocketBoundary = c % colsPerPocket === 0 && c !== totalCols;
      if (r !== pocketHeaderRow && !isPocketBoundary) continue;
      sheet.getCell(r, c).border = {
        ...(r === pocketHeaderRow ? { bottom: { style: "thin" as const, color: { argb: "FF000000" } } } : {}),
        ...(isPocketBoundary ? { right: { style: "medium" as const, color: { argb: "FF000000" } } } : {}),
      };
    }
  }

  return dataStartRow + maxLen;
}

export async function exportItemListXlsx(items: Item[]) {
  const availableByPocket = new Map<number, Row[]>();
  const unavailableByPocket = new Map<number, Row[]>();
  for (const pocket of POCKET_IDS) {
    const forPocket = items.filter((i) => i.pocket === pocket);
    availableByPocket.set(
      pocket,
      forPocket
        .filter((i) => i.locations.length > 0)
        .map((i) => ({
          name: i.name,
          count: i.locations.length,
          locationNames: [...new Set(i.locations.map((l) => l.locationName))].sort((a, b) => a.localeCompare(b, "de")).join(", "),
        }))
        .sort(byName)
    );
    unavailableByPocket.set(
      pocket,
      forPocket
        .filter((i) => i.locations.length === 0)
        .map((i) => ({ name: i.name, count: 0, locationNames: "" }))
        .sort(byName)
    );
  }
  const availableTotal = [...availableByPocket.values()].reduce((s, l) => s + l.length, 0);
  const unavailableTotal = [...unavailableByPocket.values()].reduce((s, l) => s + l.length, 0);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Chronoria Wiki (data-import/exportItemList.ts)";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Items");
  const maxCols = POCKET_IDS.length * AVAILABLE_COLUMNS.length; // widest section
  sheet.columns = Array.from({ length: maxCols }, (_, i) => ({
    width: AVAILABLE_COLUMNS[i % AVAILABLE_COLUMNS.length].width,
  }));

  let row = 1;
  sheet.getCell(row, 1).value = "Chronoria - Item-Übersicht";
  sheet.getCell(row, 1).font = TITLE_FONT;
  row += 1;
  sheet.getCell(row, 1).value =
    "Generiert aus den Map-Event-Fundorten der Wiki-Daten (data-import/parseMapLocations.ts), automatisch bei jedem build-data-Lauf. " +
    'Taschen stehen nebeneinander. "Anzahl" zählt eindeutige Orte/Quellen (Boden, verstecktes Item, NPC-Geschenk, Beerenbaum, Sonderitem), ' +
    '"Fundorte" listet diese Orte namentlich - keine Stückzahl pro Fundort und KEINE Shop-Bestände (Pokémon Märkte werden von diesem ' +
    "Datenexport nicht erfasst). Ein Item in der unteren Tabelle kann also trotzdem regulär im Laden kaufbar sein.";
  sheet.getCell(row, 1).font = NOTE_FONT;
  sheet.mergeCells(row, 1, row, maxCols);
  sheet.getRow(row).height = 45;
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  row += 2;

  row = writeSection(sheet, row, "Bereits im Spiel erhältliche Items", availableByPocket, AVAILABLE_COLUMNS);
  row += 2;
  writeSection(sheet, row, "Noch nicht im Spiel platzierte Items", unavailableByPocket, UNAVAILABLE_COLUMNS);

  await wb.xlsx.writeFile(OUT_PATH);
  return { available: availableTotal, unavailable: unavailableTotal, path: OUT_PATH };
}
