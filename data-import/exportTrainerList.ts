// Writes a standalone Excel reference file (project root, NOT under src/ or public/, so it never
// ships on the published wiki) listing every trainer actually placed in the game's maps with all
// of their dialogue.
//
// The texts come from two sources: the intro, the post-victory speech and the talk-to-again line
// are extracted from the map-event dump (parseTrainerTexts.ts), while the defeat speech is the
// PBS "LoseText" already parsed into Trainer.loseText. They are joined on the trainer id.
//
// Regenerated every time buildData.ts runs, alongside the other *-Uebersicht.xlsx files.
import ExcelJS from "exceljs";
import { join } from "node:path";
import { TITLE_FONT, NOTE_FONT, COL_HEADER_FONT, COL_HEADER_FILL, FONT } from "./xlsxGroupedSection.ts";
import { parseTrainerTexts, type TrainerTextOccurrence } from "./parseTrainerTexts.ts";
import { parseTrainerTypeUsage, type TrainerTypeUsage } from "./parseTrainerTypeUsage.ts";
import type { Trainer } from "./dataModel.ts";

const OUT_PATH = join(import.meta.dirname, "..", "Trainer-Uebersicht.xlsx");

const SHADE = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFF2F2F2" } };
const PLACEHOLDER_LOSE_TEXT = "...";

interface Column {
  header: string;
  width: number;
  wrap?: boolean;
}

const MAIN_COLUMNS: Column[] = [
  { header: "Trainer", width: 26 },
  { header: "Version", width: 9 },
  { header: "Ort", width: 22 },
  { header: "Event", width: 16 },
  { header: "Intro (vor dem Kampf)", width: 52, wrap: true },
  { header: "Lose-Text (Niederlage)", width: 34, wrap: true },
  { header: "Direkt nach dem Sieg", width: 52, wrap: true },
  { header: "Beim erneuten Ansprechen", width: 52, wrap: true },
];

interface Row {
  trainerId: string;
  label: string;
  version: string;
  locationName: string;
  mapId: string;
  eventName: string;
  introText: string;
  loseText: string;
  victoryText: string;
  afterText: string;
}

/** One stable label per trainer id. The dump's speaker tag ("Teenager Leandro") is already
 *  correct German including the class, and covers classes that trainer_types.txt still has in
 *  English - but it is only used if every occurrence agrees on it, so a trainer never appears
 *  under two different names and breaks the grouping. */
function buildLabels(occurrences: TrainerTextOccurrence[], trainerById: Map<string, Trainer>): Map<string, string> {
  const labels = new Map<string, string>();
  const byId = new Map<string, TrainerTextOccurrence[]>();
  for (const occ of occurrences) {
    const list = byId.get(occ.trainerId);
    if (list) list.push(occ);
    else byId.set(occ.trainerId, [occ]);
  }
  for (const [trainerId, list] of byId) {
    const speakers = new Set(list.map((o) => o.speaker).filter((s): s is string => !!s));
    const trainer = trainerById.get(trainerId);
    const fallback = trainer
      ? `${trainer.trainerTypeName.text} ${trainer.name}`.trim()
      : `${list[0].trainerType} ${list[0].name}`.trim();
    const speaker = speakers.size === 1 ? [...speakers][0] : null;
    // Only trust the speaker tag when it actually names this trainer.
    labels.set(trainerId, speaker && speaker.includes(list[0].name) ? speaker : fallback);
  }
  return labels;
}

function writeHeader(sheet: ExcelJS.Worksheet, title: string, note: string, columns: Column[], noteHeight: number) {
  sheet.columns = columns.map((c) => ({ width: c.width }));
  sheet.getCell(1, 1).value = title;
  sheet.getCell(1, 1).font = TITLE_FONT;
  sheet.getCell(2, 1).value = note;
  sheet.getCell(2, 1).font = NOTE_FONT;
  sheet.mergeCells(2, 1, 2, columns.length);
  sheet.getRow(2).height = noteHeight;
  sheet.getCell(2, 1).alignment = { wrapText: true, vertical: "top" };
  const headerRow = 4;
  columns.forEach((col, i) => {
    const cell = sheet.getCell(headerRow, i + 1);
    cell.value = col.header;
    cell.font = COL_HEADER_FONT;
    cell.fill = COL_HEADER_FILL;
  });
  sheet.views = [{ state: "frozen", ySplit: headerRow }];
  return headerRow + 1;
}

function addMainSheet(wb: ExcelJS.Workbook, rows: Row[]) {
  const sheet = wb.addWorksheet("Trainer");
  let row = writeHeader(
    sheet,
    "Chronoria – Trainer und ihre Texte",
    "Alle Trainer, die tatsächlich auf einer Karte stehen, mit ihren Dialogen. Eine Zeile je Vorkommen – ein Trainer, " +
      "der mehrfach im Spiel auftaucht, belegt also mehrere Zeilen, die zusammenhängend untereinander stehen und " +
      "abwechselnd hinterlegt sind. Intro, Siegesrede und der Text beim erneuten Ansprechen stammen aus den " +
      "Map-Events (data-import/parseTrainerTexts.ts), der Lose-Text aus PBS/trainers.txt. Leere Zellen bedeuten, dass " +
      "es diesen Text im Spiel nicht gibt. Die Vorlagen- und Testkarten der Essentials-Demo sind ausgeschlossen.",
    MAIN_COLUMNS,
    58
  );

  let shade = false;
  let blockStart = row;
  let previousId: string | null = null;

  const closeBlock = (endRow: number) => {
    if (previousId !== null && endRow > blockStart) sheet.mergeCells(blockStart, 1, endRow, 1);
  };

  for (const r of rows) {
    if (r.trainerId !== previousId) {
      closeBlock(row - 1);
      if (previousId !== null) shade = !shade;
      blockStart = row;
      previousId = r.trainerId;
    }
    const values = [
      r.label,
      r.version,
      `${r.locationName} (${r.mapId})`,
      r.eventName,
      r.introText,
      r.loseText,
      r.victoryText,
      r.afterText,
    ];
    values.forEach((value, i) => {
      const cell = sheet.getCell(row, i + 1);
      cell.value = value;
      cell.font = FONT;
      cell.alignment = { wrapText: MAIN_COLUMNS[i].wrap === true, vertical: "top" };
      if (shade) cell.fill = SHADE;
    });
    row += 1;
  }
  closeBlock(row - 1);
}

function addUnplacedSheet(wb: ExcelJS.Workbook, trainers: Trainer[], usedIds: Set<string>) {
  const columns: Column[] = [
    { header: "Trainer", width: 30 },
    { header: "Interne ID", width: 30 },
    { header: "Lose-Text", width: 52, wrap: true },
    { header: "Pokémon im Team", width: 15 },
  ];
  const sheet = wb.addWorksheet("Nicht platziert");
  let row = writeHeader(
    sheet,
    "Chronoria – Trainer ohne Kampf auf einer Karte",
    "In PBS/trainers.txt angelegt, aber von keinem Map-Event aufgerufen. Das ist nicht zwangsläufig ein Fehler: die " +
      "höheren Versionen von RIVAL1_Elisa werden nur über pbRegisterPartner als Verbündete eingesetzt, nicht als " +
      "Gegner. Alles andere ist entweder noch nicht platziert oder übrig geblieben.",
    columns,
    44
  );
  const unplaced = trainers
    .filter((t) => !usedIds.has(t.id))
    .sort((a, b) => a.id.localeCompare(b.id, "de"));
  for (const t of unplaced) {
    const values = [`${t.trainerTypeName.text} ${t.name}`.trim(), t.id, t.loseText ?? "", t.party.length];
    values.forEach((value, i) => {
      const cell = sheet.getCell(row, i + 1);
      cell.value = value;
      cell.font = FONT;
      cell.alignment = { wrapText: columns[i].wrap === true, vertical: "top" };
    });
    row += 1;
  }
  return unplaced.length;
}

function addMissingPbsSheet(wb: ExcelJS.Workbook, rows: Row[], trainerById: Map<string, Trainer>) {
  const columns: Column[] = [
    { header: "Trainer", width: 26 },
    { header: "Interne ID", width: 28 },
    { header: "Ort", width: 22 },
    { header: "Event", width: 16 },
    { header: "Intro", width: 52, wrap: true },
  ];
  const sheet = wb.addWorksheet("Ohne PBS-Eintrag");
  let row = writeHeader(
    sheet,
    "Chronoria – Kämpfe ohne Trainerdaten",
    "Diese Kämpfe werden von einem Map-Event gestartet, aber der Trainer existiert nicht in PBS/trainers.txt. Ihm " +
      "fehlen damit Team und Lose-Text – im Spiel dürfte der Kampf fehlschlagen. Jede Zeile hier ist ein Fehler, der " +
      "behoben werden sollte, entweder durch einen PBS-Eintrag oder durch Korrektur des Aufrufs im Event.",
    columns,
    44
  );
  const missing = rows.filter((r) => !trainerById.has(r.trainerId));
  for (const r of missing) {
    const values = [r.label, r.trainerId, `${r.locationName} (${r.mapId})`, r.eventName, r.introText];
    values.forEach((value, i) => {
      const cell = sheet.getCell(row, i + 1);
      cell.value = value;
      cell.font = FONT;
      cell.alignment = { wrapText: columns[i].wrap === true, vertical: "top" };
    });
    row += 1;
  }
  return missing.length;
}

function addUnusedTypesSheet(wb: ExcelJS.Workbook, usage: TrainerTypeUsage[]) {
  const columns: Column[] = [
    { header: "Trainerklasse", width: 28 },
    { header: "Anzeigename", width: 24 },
    { header: "Geschlecht", width: 12 },
    { header: "Status", width: 26 },
    { header: "Kampf-Sprite", width: 14 },
    { header: "Charakter-Sprite", width: 17 },
    { header: "Einsatzbereit?", width: 34, wrap: true },
  ];
  const sheet = wb.addWorksheet("Ungenutzte Klassen");
  let row = writeHeader(
    sheet,
    "Chronoria – Nicht verwendete Trainerklassen",
    "Alle Klassen aus PBS/trainer_types.txt, die auf keiner echten Karte stehen. \"Nur Daten\" heißt: es gibt " +
      "bereits Trainer dieser Klasse in trainers.txt, sie sind nur nirgends platziert – das sind die schnellsten " +
      "Ergänzungen. Der Kampf-Sprite kommt aus Graphics/Trainers, der Charakter-Sprite (Overworld) aus " +
      "Graphics/Characters; dort gibt es zwei Namenskonventionen, \"<KLASSE>.png\" und \"trainer_<KLASSE>.png\", " +
      "beide werden berücksichtigt. Ohne Charakter-Sprite kann die Klasse nicht auf einer Karte stehen.",
    columns,
    58
  );

  const unused = usage
    .filter((u) => u.usage !== "placed")
    .sort(
      (a, b) =>
        // Fertige Trainerdaten zuerst, dann die vollständig ausgestatteten.
        Number(b.usage === "data-only") - Number(a.usage === "data-only") ||
        Number(b.hasBattleSprite && b.hasCharacterSprite) - Number(a.hasBattleSprite && a.hasCharacterSprite) ||
        a.name.localeCompare(b.name, "de") ||
        a.id.localeCompare(b.id, "de")
    );

  for (const u of unused) {
    const ready = u.hasBattleSprite && u.hasCharacterSprite;
    const verdict = ready
      ? u.usage === "data-only"
        ? "Sofort einsetzbar (Team vorhanden)"
        : "Sprites vorhanden, Team fehlt noch"
      : !u.hasBattleSprite && !u.hasCharacterSprite
        ? "Keine Grafik vorhanden"
        : u.hasBattleSprite
          ? "Charakter-Sprite fehlt"
          : "Kampf-Sprite fehlt";
    const values = [
      u.id,
      u.name,
      u.gender ?? "",
      u.usage === "data-only" ? "Nur Daten, nicht platziert" : "Gar nicht verwendet",
      u.hasBattleSprite ? "ja" : "nein",
      u.hasCharacterSprite ? "ja" : "nein",
      verdict,
    ];
    values.forEach((value, i) => {
      const cell = sheet.getCell(row, i + 1);
      cell.value = value;
      cell.font = FONT;
      cell.alignment = { wrapText: columns[i].wrap === true, vertical: "top" };
      if (!u.hasBattleSprite || !u.hasCharacterSprite) cell.fill = SHADE;
    });
    row += 1;
  }
  return {
    total: unused.length,
    ready: unused.filter((u) => u.hasBattleSprite && u.hasCharacterSprite).length,
    dataOnly: unused.filter((u) => u.usage === "data-only").length,
    noSprites: unused.filter((u) => !u.hasBattleSprite && !u.hasCharacterSprite).length,
  };
}

export async function exportTrainerListXlsx(trainers: Trainer[]) {
  const occurrences = parseTrainerTexts();
  const trainerById = new Map(trainers.map((t) => [t.id, t]));
  const labels = buildLabels(occurrences, trainerById);

  const rows: Row[] = occurrences.map((occ) => ({
    trainerId: occ.trainerId,
    label: labels.get(occ.trainerId) ?? occ.trainerId,
    version: occ.version ?? "",
    locationName: occ.locationName,
    mapId: occ.mapId,
    eventName: occ.eventName,
    introText: occ.introText,
    loseText: trainerById.get(occ.trainerId)?.loseText ?? "",
    victoryText: occ.victoryText,
    afterText: occ.afterText,
  }));

  // Group by trainer id, but sort by label first so the different versions of one person
  // (Elisa 0/1/2, the Dojo rematches) still end up in one contiguous stretch.
  rows.sort(
    (a, b) =>
      a.label.localeCompare(b.label, "de") ||
      a.version.localeCompare(b.version, "de", { numeric: true }) ||
      a.mapId.localeCompare(b.mapId) ||
      a.eventName.localeCompare(b.eventName, "de")
  );

  const wb = new ExcelJS.Workbook();
  wb.creator = "Chronoria Wiki (data-import/exportTrainerList.ts)";
  wb.created = new Date();

  addMainSheet(wb, rows);
  const usedIds = new Set(rows.map((r) => r.trainerId));
  const unplaced = addUnplacedSheet(wb, trainers, usedIds);
  const missingPbs = addMissingPbsSheet(wb, rows, trainerById);
  const usage = parseTrainerTypeUsage(
    new Set(trainers.map((t) => t.trainerType)),
    new Set(occurrences.map((o) => o.trainerType))
  );
  const unusedTypes = addUnusedTypesSheet(wb, usage);

  await wb.xlsx.writeFile(OUT_PATH);
  return {
    rows: rows.length,
    distinct: usedIds.size,
    maps: new Set(rows.map((r) => r.mapId)).size,
    withoutIntro: rows.filter((r) => r.introText === "").length,
    placeholderLoseText: rows.filter((r) => r.loseText === PLACEHOLDER_LOSE_TEXT).length,
    unplaced,
    missingPbs,
    typesTotal: usage.length,
    typesPlaced: usage.filter((u) => u.usage === "placed").length,
    unusedTypes,
    path: OUT_PATH,
  };
}
