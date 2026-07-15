// Adds the "Preise" sheet to the same workbook exportItemList.ts writes to Item-Uebersicht.xlsx
// (called from there, not run standalone) - lists every item from items.txt and
// items_Gen_9_Pack.txt only (per the current scope; items_MedalBox.txt/items_raid_bait.txt are
// intentionally excluded), grouped by pocket, with current price, a rule-based price suggestion
// (see priceRules.ts), its price category, and whether it already has a map location.
import type ExcelJS from "exceljs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePbsBlocks } from "./parsePbs.ts";
import { pocketName } from "../src/lib/itemPockets.ts";
import { writeGroupedSection, TITLE_FONT, NOTE_FONT, type ColumnDef } from "./xlsxGroupedSection.ts";
import { naturalCompare } from "./naturalSort.ts";
import { classifyItem, categoryLabel, countEvolutionStoneUsage, suggestPrice } from "./priceRules.ts";
import type { Item, Pokemon } from "./dataModel.ts";

const SOURCE_DIR = join(import.meta.dirname, "source", "PBS");
// Deliberately narrower than parseItems.ts's ITEM_FILES - items_MedalBox.txt and
// items_raid_bait.txt are out of scope for this price sheet.
const PRICE_SOURCE_FILES = ["items.txt", "items_Gen_9_Pack.txt"];
const POCKET_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Row {
  name: string;
  price: number;
  suggested: number;
  category: string;
  used: string;
}

const COLUMNS: ColumnDef<Row>[] = [
  { header: "Item", width: 22, get: (r) => r.name },
  { header: "Aktueller Preis", width: 14, get: (r) => r.price },
  { header: "Preisvorschlag", width: 14, get: (r) => r.suggested },
  { header: "Kategorie", width: 16, get: (r) => r.category },
  { header: "Bereits verwendet", width: 16, get: (r) => r.used },
];

/** items.txt/items_Gen_9_Pack.txt only carry item ids in their block headers, not the merged
 *  Item[] - re-reading just the headers here is cheap and keeps parseItems.ts's own merge (used
 *  by every other export/page) untouched. */
function loadPriceSourceIds(): Set<string> {
  const ids = new Set<string>();
  for (const file of PRICE_SOURCE_FILES) {
    const text = readFileSync(join(SOURCE_DIR, file), "utf-8");
    for (const block of parsePbsBlocks(text)) {
      ids.add(block.headerParts[0]);
    }
  }
  return ids;
}

export function addPricesSheet(wb: ExcelJS.Workbook, items: Item[], pokemon: Pokemon[]) {
  const sourceIds = loadPriceSourceIds();
  const usageByItem = countEvolutionStoneUsage(pokemon);
  const scoped = items.filter((i) => sourceIds.has(i.id) && i.pocket !== null);

  const rowsByPocket = new Map<string | number, Row[]>();
  for (const pocket of POCKET_IDS) {
    const rows: Row[] = scoped
      .filter((i) => i.pocket === pocket)
      .map((i) => {
        const category = classifyItem(i);
        const usage = usageByItem.get(i.id) ?? 0;
        return {
          name: i.name,
          price: i.price ?? 0,
          suggested: suggestPrice(i, category, usage),
          category: categoryLabel(category),
          used: i.locations.length > 0 ? "Ja" : "Nein",
        };
      })
      .sort((a, b) => naturalCompare(a.name, b.name));
    rowsByPocket.set(pocket, rows);
  }
  const total = [...rowsByPocket.values()].reduce((sum, list) => sum + list.length, 0);

  const sheet = wb.addWorksheet("Preise");
  const maxCols = POCKET_IDS.length * COLUMNS.length;
  sheet.columns = Array.from({ length: maxCols }, (_, i) => ({ width: COLUMNS[i % COLUMNS.length].width }));

  let row = 1;
  sheet.getCell(row, 1).value = "Chronoria - Item-Preisliste";
  sheet.getCell(row, 1).font = TITLE_FONT;
  row += 1;
  sheet.getCell(row, 1).value =
    "Nur Items aus items.txt und items_Gen_9_Pack.txt. Preisvorschläge sind regelbasiert (data-import/priceRules.ts): " +
    "Key Items bleiben unverkäuflich (0), einzigartige Formwandlungs-Items (z.B. für Dialga/Palkia) behalten ihren " +
    "Preis, Entwicklungssteine werden nach Anzahl der Pokémon-Arten bepreist, die laut PBS-Evolutions-Eintrag damit " +
    "entwickeln (mehr Nutzung = günstiger/häufiger). Alle anderen Kategorien behalten vorerst den aktuellen Preis als " +
    'Vorschlag, da keine belastbare Abweichung erkennbar ist. "Bereits verwendet" = Item hat mindestens einen Fundort ' +
    "im Map-Event-Dump (Boden/verstecktes Item/NPC-Geschenk/Beerenbaum/Sonderitem) - Shop-Bestände werden dabei NICHT erfasst.";
  sheet.getCell(row, 1).font = NOTE_FONT;
  sheet.mergeCells(row, 1, row, maxCols);
  sheet.getRow(row).height = 60;
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  row += 2;

  writeGroupedSection(
    sheet,
    row,
    "Item-Preise nach Tasche",
    "Anzahl Items:",
    POCKET_IDS,
    (key) => pocketName(key as number),
    rowsByPocket,
    COLUMNS
  );

  return { total };
}
