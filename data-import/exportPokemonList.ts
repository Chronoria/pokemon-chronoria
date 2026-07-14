// Writes a standalone Excel reference file (project root, NOT under src/ or public/, so it
// never ships on the published wiki) listing every Pokémon species+form, split into "already
// used somewhere" (wild encounter, OR event/gift/trade/egg from the map-event dump) and
// "not used anywhere yet". Regenerated every time buildData.ts runs, alongside
// Item-Uebersicht.xlsx.
import ExcelJS from "exceljs";
import { join } from "node:path";
import { parsePokemonMapLocations } from "./parsePokemonMapLocations.ts";
import type { Pokemon } from "./dataModel.ts";

const OUT_PATH = join(import.meta.dirname, "..", "Pokemon-Uebersicht.xlsx");

const FONT = { name: "Arial", size: 11 };
const TITLE_FONT = { name: "Arial", size: 16, bold: true };
const SECTION_FONT = { name: "Arial", size: 13, bold: true };
const COL_HEADER_FONT = { name: "Arial", size: 10, bold: true };
const COL_HEADER_FILL = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFD9E2F3" } };
const NOTE_FONT = { name: "Arial", size: 10, italic: true, color: { argb: "FF666666" } };

interface Unit {
  dexNumber: number;
  label: string;
  locationNames: string[];
}

function formLabel(speciesName: string, form: { formNumber: number; formName: { text: string } | null }): string {
  if (form.formNumber === 0) return speciesName;
  const name = form.formName?.text || `Form ${form.formNumber}`;
  return `${speciesName} (${name})`;
}

export async function exportPokemonListXlsx(pokemon: Pokemon[]) {
  const pokemonById = new Map(pokemon.map((p) => [p.id, p]));
  const eventLocations = parsePokemonMapLocations(pokemonById);

  // Same convention as src/lib/data.ts's pokemonDexNumber: position in the parsed pokemon.txt
  // order (1-based), which is exactly Pokédex order.
  const units: Unit[] = [];
  pokemon.forEach((p, i) => {
    const dexNumber = i + 1;
    // Female-only "forms" are a gender-appearance toggle, not a separate obtainable form the
    // wiki lists on its own - same exclusion the species page itself already applies.
    const forms = [{ formNumber: 0, formName: null, foundIn: p.foundIn }, ...p.forms.filter((f) => !f.isFemaleForm)];
    for (const f of forms) {
      const wildNames = f.foundIn.map((r) => r.locationName);
      const eventNames = (eventLocations.get(p.id)?.get(f.formNumber) ?? []).map((r) => r.locationName);
      units.push({
        dexNumber,
        label: formLabel(p.name, f),
        locationNames: [...new Set([...wildNames, ...eventNames])].sort((a, b) => a.localeCompare(b, "de")),
      });
    }
  });

  const used = units.filter((u) => u.locationNames.length > 0).sort((a, b) => a.dexNumber - b.dexNumber);
  const unused = units.filter((u) => u.locationNames.length === 0).sort((a, b) => a.dexNumber - b.dexNumber);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Chronoria Wiki (data-import/exportPokemonList.ts)";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Pokemon");
  sheet.columns = [{ width: 9 }, { width: 32 }, { width: 9 }, { width: 55 }];

  let row = 1;
  sheet.getCell(row, 1).value = "Chronoria - Pokémon-Übersicht";
  sheet.getCell(row, 1).font = TITLE_FONT;
  row += 1;
  sheet.getCell(row, 1).value =
    "Generiert aus Wildfang-Encounterdaten (parseEncounters.ts) und dem Map-Event-Dump (parsePokemonMapLocations.ts: " +
    "pbAddPokemon/pbAddPokemonSilent, pbGenerateEgg, Pokemon.new, pbStartTrade), automatisch bei jedem build-data-Lauf. " +
    "Fundorte fassen Wildfang- und Event-/Geschenk-/Tausch-/Ei-Vorkommen zusammen, ohne die Quelle zu unterscheiden. " +
    "Bekannte Essentials-Demo-/Test-Maps werden ausgeschlossen (siehe parseMapLocations.ts EXCLUDED_MAP_IDS).";
  sheet.getCell(row, 1).font = NOTE_FONT;
  sheet.mergeCells(row, 1, row, 3);
  sheet.getRow(row).height = 45;
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  row += 2;

  sheet.getCell(row, 1).value = "Bereits verwendete Pokémon (Wildfang, Event, Geschenk, Tausch, Ei)";
  sheet.getCell(row, 1).font = SECTION_FONT;
  row += 1;
  sheet.getCell(row, 1).value = "Anzahl:";
  sheet.getCell(row, 1).font = FONT;
  sheet.getCell(row, 2).value = used.length;
  sheet.getCell(row, 2).font = FONT;
  row += 1;

  ["Pokémon", "Anzahl Fundorte", "Fundorte"].forEach((h, i) => {
    const cell = sheet.getCell(row, i + 1);
    cell.value = h;
    cell.font = COL_HEADER_FONT;
    cell.fill = COL_HEADER_FILL;
    cell.border = { bottom: { style: "thin", color: { argb: "FF000000" } } };
  });
  row += 1;
  for (const u of used) {
    sheet.getCell(row, 1).value = u.label;
    sheet.getCell(row, 2).value = u.locationNames.length;
    sheet.getCell(row, 3).value = u.locationNames.join(", ");
    for (let c = 1; c <= 3; c++) sheet.getCell(row, c).font = FONT;
    row += 1;
  }
  row += 1;

  sheet.getCell(row, 1).value = "Noch nicht verwendete Pokémon/Formen";
  sheet.getCell(row, 1).font = SECTION_FONT;
  row += 1;
  sheet.getCell(row, 1).value = "Anzahl:";
  sheet.getCell(row, 1).font = FONT;
  sheet.getCell(row, 2).value = unused.length;
  sheet.getCell(row, 2).font = FONT;
  row += 1;

  const unusedHeaderCell = sheet.getCell(row, 1);
  unusedHeaderCell.value = "Pokémon";
  unusedHeaderCell.font = COL_HEADER_FONT;
  unusedHeaderCell.fill = COL_HEADER_FILL;
  unusedHeaderCell.border = { bottom: { style: "thin", color: { argb: "FF000000" } } };
  row += 1;
  for (const u of unused) {
    sheet.getCell(row, 1).value = u.label;
    sheet.getCell(row, 1).font = FONT;
    row += 1;
  }

  await wb.xlsx.writeFile(OUT_PATH);
  return { used: used.length, unused: unused.length, path: OUT_PATH };
}
