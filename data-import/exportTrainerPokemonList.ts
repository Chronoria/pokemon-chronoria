// Writes a standalone Excel reference file (project root, never shipped on the wiki) listing
// every Pokémon species+form that already appears in the team of a trainer placed on a map
// (PBS/trainers.txt + map-event dump), with how many trainers use it, the level range and which
// trainers they are - plus the species/forms no placed trainer uses yet. Legendary and Mythical
// Pokémon are left out. Trainers that exist in trainers.txt but on no map are listed one by one
// at the bottom. Same side-by-side generation layout as Pokemon-Uebersicht.xlsx.
// Regenerated every time buildData.ts runs, alongside the other *-Uebersicht.xlsx files.
import ExcelJS from "exceljs";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  writeGroupedSection, TITLE_FONT, NOTE_FONT, SECTION_FONT, COL_HEADER_FONT, COL_HEADER_FILL, FONT, type ColumnDef,
} from "./xlsxGroupedSection.ts";
import { formLabel } from "./exportPokemonList.ts";
import { parsePbsBlocks, blockToRecord } from "./parsePbs.ts";
import type { Pokemon, Trainer } from "./dataModel.ts";

const OUT_PATH = join(import.meta.dirname, "..", "Trainer-Pokemon-Uebersicht.xlsx");
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const SPECIES_FILES = ["pokemon.txt", "pokemon_base_Gen_9_Pack.txt"];

/** Species ids whose PBS Flags mark them as Legendary or Mythical. */
function legendarySpecies(): Set<string> {
  const ids = new Set<string>();
  for (const file of SPECIES_FILES) {
    const path = join(import.meta.dirname, "source", "PBS", file);
    if (!existsSync(path)) continue;
    for (const block of parsePbsBlocks(readFileSync(path, "utf8"))) {
      if (/\b(Legendary|Mythical)\b/.test(blockToRecord(block).Flags ?? "")) ids.add(block.headerParts[0]);
    }
  }
  return ids;
}

interface UsedRow {
  dexNumber: number;
  name: string;
  id: string;
  trainerCount: number;
  cryptoCount: number;
  levels: string;
  trainers: string;
}
interface UnusedRow {
  dexNumber: number;
  name: string;
  id: string;
}

const USED_COLUMNS: ColumnDef<UsedRow>[] = [
  { header: "Dex-Nr.", width: 8, get: (r) => r.dexNumber },
  { header: "Pokémon", width: 22, get: (r) => r.name },
  { header: "ID", width: 16, get: (r) => r.id },
  { header: "Trainer", width: 8, get: (r) => r.trainerCount },
  { header: "Crypto", width: 8, get: (r) => r.cryptoCount || "" },
  { header: "Level", width: 9, get: (r) => r.levels },
  { header: "Verwendet von", width: 50, get: (r) => r.trainers, wrap: true },
];
const UNUSED_COLUMNS: ColumnDef<UnusedRow>[] = [
  { header: "Dex-Nr.", width: 8, get: (r) => r.dexNumber },
  { header: "Pokémon", width: 22, get: (r) => r.name },
  { header: "ID", width: 16, get: (r) => r.id },
];
// Every other unplaced trainer gets a light shade so the teams are easy to tell apart.
const SHADE = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF2F2F2" } };

interface Usage {
  trainers: Map<string, string>; // trainer id -> label
  crypto: number;
  minLevel: number;
  maxLevel: number;
}

const trainerLabel = (t: Trainer) => `${t.trainerTypeName.text} ${t.name}`.trim();

export async function exportTrainerPokemonListXlsx(pokemon: Pokemon[], trainers: Trainer[]) {
  const pokemonById = new Map(pokemon.map((p) => [p.id, p]));
  const legendary = legendarySpecies();
  // Display name of a team member, incl. its form ("Raichu (Alola)"). Female-appearance forms
  // count for the species itself, like in Pokemon-Uebersicht.xlsx; a form number the species
  // doesn't have counts as form 0.
  const resolve = (speciesId: string, formNumber: number) => {
    const species = pokemonById.get(speciesId);
    if (!species) return { key: speciesId, name: speciesId };
    const form = species.forms.find((f) => f.formNumber === formNumber && !f.isFemaleForm);
    return form
      ? { key: `${species.id}_${form.formNumber}`, name: formLabel(species.name, form) }
      : { key: species.id, name: species.name };
  };

  const placed = trainers.filter((t) => t.locations.length > 0);
  const unplaced = trainers
    .filter((t) => t.locations.length === 0)
    .sort((a, b) => trainerLabel(a).localeCompare(trainerLabel(b), "de"));

  // "SPECIES" / "SPECIES_N" -> usage by trainers placed on a map
  const usage = new Map<string, Usage>();
  for (const t of placed) {
    const places = [...new Set(t.locations.map((l) => l.locationName))];
    const label = `${trainerLabel(t)} (${places.join(", ")})`;
    for (const mon of t.party) {
      const { key } = resolve(mon.species, mon.form);
      let u = usage.get(key);
      if (!u) {
        u = { trainers: new Map(), crypto: 0, minLevel: mon.level, maxLevel: mon.level };
        usage.set(key, u);
      }
      u.trainers.set(t.id, label);
      if (mon.shadow) u.crypto++;
      u.minLevel = Math.min(u.minLevel, mon.level);
      u.maxLevel = Math.max(u.maxLevel, mon.level);
    }
  }

  const usedByGen = new Map<string | number, UsedRow[]>();
  const unusedByGen = new Map<string | number, UnusedRow[]>();
  for (const gen of GENERATIONS) {
    usedByGen.set(gen, []);
    unusedByGen.set(gen, []);
  }
  pokemon.forEach((p, i) => {
    if (legendary.has(p.id)) return;
    const dexNumber = i + 1;
    const gen = p.generation ?? 1;
    // Mega Evolutions and the like are only reached in battle, so they never sit in a team.
    const forms = [{ formNumber: 0, formName: null }, ...p.forms.filter((f) => !f.isFemaleForm && !f.megaStone && !f.megaMove)];
    for (const f of forms) {
      const id = f.formNumber === 0 ? p.id : `${p.id}_${f.formNumber}`;
      const name = formLabel(p.name, f);
      const u = usage.get(id);
      if (!u) {
        unusedByGen.get(gen)!.push({ dexNumber, name, id });
        continue;
      }
      usedByGen.get(gen)!.push({
        dexNumber,
        name,
        id,
        trainerCount: u.trainers.size,
        cryptoCount: u.crypto,
        levels: u.minLevel === u.maxLevel ? String(u.minLevel) : `${u.minLevel}–${u.maxLevel}`,
        trainers: [...u.trainers.values()].sort((a, b) => a.localeCompare(b, "de")).join(", "),
      });
    }
  });
  const used = [...usedByGen.values()].flat();
  const unused = [...unusedByGen.values()].flat();

  const wb = new ExcelJS.Workbook();
  wb.creator = "Chronoria Wiki (data-import/exportTrainerPokemonList.ts)";
  wb.created = new Date();
  const sheet = wb.addWorksheet("Trainer-Pokemon");
  const maxCols = GENERATIONS.length * USED_COLUMNS.length;
  sheet.columns = Array.from({ length: maxCols }, (_, i) => ({ width: USED_COLUMNS[i % USED_COLUMNS.length].width }));

  let row = 1;
  sheet.getCell(row, 1).value = "Chronoria - Pokémon in Trainer-Teams";
  sheet.getCell(row, 1).font = TITLE_FONT;
  row += 1;
  sheet.getCell(row, 1).value =
    "Generiert aus PBS/trainers.txt und dem Map-Event-Dump, automatisch bei jedem build-data-Lauf. Gezählt werden nur " +
    "Trainer, die auf einer Karte stehen; Trainer, die nur in trainers.txt stehen, folgen ganz unten mit ihrem Team. " +
    "Jede Form zählt einzeln (Alola, Galar, Chrono, Kanto ...). Legendäre und mysteriöse Pokémon sowie " +
    "Mega-Entwicklungen sind ausgelassen. \"Trainer\" = Anzahl verschiedener Trainer mit diesem Pokémon im Team, " +
    "\"Crypto\" = wie oft es davon als Crypto-Pokémon eingesetzt wird, \"Level\" = niedrigstes bis höchstes Level.";
  sheet.getCell(row, 1).font = NOTE_FONT;
  sheet.mergeCells(row, 1, row, maxCols);
  sheet.getRow(row).height = 45;
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  row += 2;

  row = writeGroupedSection(
    sheet,
    row,
    "Von Trainern verwendete Pokémon",
    "Anzahl:",
    GENERATIONS,
    (gen) => `Generation ${gen}`,
    usedByGen,
    USED_COLUMNS
  );
  row += 2;
  row = writeGroupedSection(
    sheet,
    row,
    "Noch von keinem Trainer verwendete Pokémon/Formen",
    "Anzahl:",
    GENERATIONS,
    (gen) => `Generation ${gen}`,
    unusedByGen,
    UNUSED_COLUMNS
  );
  row += 2;

  // Unplaced trainers, one after another: trainer | Pokémon | level | Crypto
  sheet.getCell(row, 1).value = `Nicht platzierte Trainer (${unplaced.length}) - stehen in trainers.txt, aber auf keiner Karte`;
  sheet.getCell(row, 1).font = SECTION_FONT;
  row += 1;
  const headers = ["Trainer", "", "Pokémon", "", "Level", "Crypto"];
  headers.forEach((h, i) => {
    const cell = sheet.getCell(row, i + 1);
    cell.value = h;
    cell.font = COL_HEADER_FONT;
    cell.fill = COL_HEADER_FILL;
  });
  sheet.mergeCells(row, 1, row, 2);
  sheet.mergeCells(row, 3, row, 4);
  row += 1;
  unplaced.forEach((t, ti) => {
    const team = t.party.length > 0 ? t.party : [null];
    const firstRow = row;
    for (const mon of team) {
      const values = mon
        ? [trainerLabel(t), "", resolve(mon.species, mon.form).name, "", mon.level, mon.shadow ? "ja" : ""]
        : [trainerLabel(t), "", "(kein Team)", "", "", ""];
      values.forEach((v, i) => {
        const cell = sheet.getCell(row, i + 1);
        if (i === 0 && row !== firstRow) cell.value = "";
        else cell.value = v;
        cell.font = i === 0 ? { ...FONT, bold: true } : FONT;
        if (ti % 2 === 1) cell.fill = SHADE;
      });
      sheet.mergeCells(row, 1, row, 2);
      sheet.mergeCells(row, 3, row, 4);
      row += 1;
    }
  });

  await wb.xlsx.writeFile(OUT_PATH);
  return { used: used.length, unused: unused.length, unplaced: unplaced.length, path: OUT_PATH };
}
