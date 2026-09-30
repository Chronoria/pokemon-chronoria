// Writes a standalone Excel reference file (project root, NOT under src/ or public/, so it
// never ships on the published wiki) listing every Pokémon species+form, split into "already
// used somewhere" (wild encounter, OR event/gift/trade/egg from the map-event dump) and
// "not used anywhere yet". Generations are laid out side by side (one column-block per
// generation) instead of one long vertical list. Regenerated every time buildData.ts runs,
// alongside Item-Uebersicht.xlsx.
import ExcelJS from "exceljs";
import { join } from "node:path";
import { parsePokemonMapLocations } from "./parsePokemonMapLocations.ts";
import { writeGroupedSection, TITLE_FONT, NOTE_FONT, type ColumnDef, type RowStyle } from "./xlsxGroupedSection.ts";
import type { Pokemon, Item, Move, Ability } from "./dataModel.ts";

const OUT_PATH = join(import.meta.dirname, "..", "Pokemon-Uebersicht.xlsx");
const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

interface Row {
  dexNumber: number;
  name: string;
  id: string;
  count: number;
  locationNames: string;
}

const AVAILABLE_COLUMNS: ColumnDef<Row>[] = [
  { header: "Dex-Nr.", width: 8, get: (r) => r.dexNumber },
  { header: "Pokémon", width: 22, get: (r) => r.name },
  { header: "ID", width: 16, get: (r) => r.id },
  { header: "Anzahl", width: 9, get: (r) => r.count },
  { header: "Fundorte", width: 45, get: (r) => r.locationNames, wrap: true },
];
const UNAVAILABLE_COLUMNS: ColumnDef<Row>[] = [
  { header: "Dex-Nr.", width: 8, get: (r) => r.dexNumber },
  { header: "Pokémon", width: 22, get: (r) => r.name },
  { header: "ID", width: 16, get: (r) => r.id },
];

interface MegaRow {
  dexNumber: number;
  name: string;
  trigger: string;
  done: boolean;
  locationNames: string;
}

// Same widths as AVAILABLE_COLUMNS, since the Mega section shares the sheet's column layout.
const MEGA_COLUMNS: ColumnDef<MegaRow>[] = [
  { header: "Dex-Nr.", width: 8, get: (r) => r.dexNumber },
  { header: "Mega-Pokémon", width: 22, get: (r) => r.name },
  { header: "Mega-Stein", width: 16, get: (r) => r.trigger },
  { header: "Status", width: 9, get: (r) => (r.done ? "Erledigt" : "Offen") },
  { header: "Fundorte des Steins", width: 45, get: (r) => r.locationNames, wrap: true },
];
interface BattleFormRow {
  dexNumber: number;
  name: string;
  trigger: string;
  done: boolean;
  locationNames: string;
}

const BATTLE_FORM_COLUMNS: ColumnDef<BattleFormRow>[] = [
  { header: "Dex-Nr.", width: 8, get: (r) => r.dexNumber },
  { header: "Kampfform", width: 22, get: (r) => r.name },
  { header: "Auslöser", width: 16, get: (r) => r.trigger, wrap: true },
  { header: "Status", width: 9, get: (r) => (r.done ? "Erledigt" : "Offen") },
  { header: "Fundorte (Pokémon / Item)", width: 45, get: (r) => r.locationNames, wrap: true },
];

// Forms that only exist during a battle and revert afterwards - taken from the game's
// MultipleForms handlers (getFormOnEnteringBattle/getFormOnStartingBattle/getFormOnLeavingBattle
// in the core FormHandlers and Plugins/Generation 9 Pack Scripts) plus the Primal Reversion
// forms. Mega Evolutions are battle-only too, but they have their own list above. Keep this in
// sync by hand if the game gets new battle-only forms. `base` is the out-of-battle form the
// battle form comes from (default 0), `item` an item the Pokémon must hold/own for it.
interface BattleFormRule {
  forms: number[];
  ability?: string;
  move?: string;
  item?: string | ((form: number) => string | undefined);
  text?: string | ((form: number) => string);
  base?: (form: number) => number;
}
const BATTLE_ONLY_FORMS: Record<string, BattleFormRule> = {
  CASTFORM: { forms: [1, 2, 3], ability: "FORECAST" },
  KYOGRE: { forms: [1], item: "BLUEORB", text: "Proto-Wandel" },
  GROUDON: { forms: [1], item: "REDORB", text: "Proto-Wandel" },
  CHERRIM: { forms: [1], ability: "FLOWERGIFT" },
  DARMANITAN: { forms: [1, 3], ability: "ZENMODE", base: (f) => f - 1 },
  KYUREM: { forms: [3, 4], item: "DNASPLICERS", text: "Kampfbeginn (fusioniert)" },
  MELOETTA: { forms: [1], move: "RELICSONG" },
  GRENINJA: { forms: [2], ability: "BATTLEBOND" },
  AEGISLASH: { forms: [1], ability: "STANCECHANGE" },
  XERNEAS: { forms: [1], text: "Kampfbeginn" },
  ZYGARDE: { forms: [2], ability: "POWERCONSTRUCT" },
  WISHIWASHI: { forms: [1], ability: "SCHOOLING" },
  MIMIKYU: { forms: [1, 3, 5, 7, 9, 11], ability: "DISGUISE", base: (f) => f - 1 },
  NECROZMA: { forms: [3], text: "Ultra-Stoß (Abendmähne/Morgenschwingen)" },
  CRAMORANT: { forms: [1, 2], ability: "GULPMISSILE" },
  EISCUE: { forms: [1], ability: "ICEFACE" },
  MORPEKO: { forms: [1], ability: "HUNGERSWITCH" },
  ZACIAN: { forms: [1], item: "RUSTEDSWORD" },
  ZAMAZENTA: { forms: [1], item: "RUSTEDSHIELD" },
  PALAFIN: { forms: [1], ability: "ZEROTOHERO" },
  OGERPON: {
    forms: [4, 5, 6, 7],
    text: "Terakristallisierung",
    item: (f) => ({ 5: "WELLSPRINGMASK", 6: "HEARTHFLAMEMASK", 7: "CORNERSTONEMASK" })[f],
  },
  TERAPAGOS: { forms: [1, 2], text: (f) => (f === 1 ? "Fähigkeit: Tera-Wandel" : "Terakristallisierung") },
};

const MEGA_DONE_STYLE: RowStyle = {
  fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFC6EFCE" } },
  fontColor: "FF006100",
};

export function formLabel(speciesName: string, form: { formNumber: number; formName: { text: string } | null }): string {
  if (form.formNumber === 0) return speciesName;
  const name = form.formName?.text || `Form ${form.formNumber}`;
  return `${speciesName} (${name})`;
}

function byDexNumber(a: Row, b: Row) {
  return a.dexNumber - b.dexNumber;
}

export async function exportPokemonListXlsx(pokemon: Pokemon[], items: Item[], moves: Move[], abilities: Ability[]) {
  const pokemonById = new Map(pokemon.map((p) => [p.id, p]));
  const itemById = new Map(items.map((i) => [i.id, i]));
  const moveById = new Map(moves.map((m) => [m.id, m]));
  const abilityById = new Map(abilities.map((a) => [a.id, a]));
  const eventLocations = parsePokemonMapLocations(pokemonById);

  const availableByGen = new Map<string | number, Row[]>();
  const unavailableByGen = new Map<string | number, Row[]>();
  const megaByGen = new Map<string | number, MegaRow[]>();
  const battleByGen = new Map<string | number, BattleFormRow[]>();
  for (const gen of GENERATIONS) {
    availableByGen.set(gen, []);
    unavailableByGen.set(gen, []);
    megaByGen.set(gen, []);
    battleByGen.set(gen, []);
  }

  // Same convention as src/lib/data.ts's pokemonDexNumber: position in the parsed pokemon.txt
  // order (1-based), which is exactly Pokédex order.
  pokemon.forEach((p, i) => {
    const dexNumber = i + 1;
    // Female-only "forms" are a gender-appearance toggle, not a separate obtainable form the
    // wiki lists on its own - same exclusion the species page itself already applies.
    const forms = [{ formNumber: 0, formName: null, foundIn: p.foundIn }, ...p.forms.filter((f) => !f.isFemaleForm)];
    const locationsOf = (formNumber: number, foundIn: { locationName: string }[]) =>
      [...foundIn, ...(eventLocations.get(p.id)?.get(formNumber) ?? [])].map((r) => r.locationName);
    for (const f of forms) {
      // Mega Evolutions never have their own wild/event locations (they're only reached via the
      // base species + Mega Stone + Mega Ring), so they get their own list: "Erledigt" as soon as
      // the triggering stone is findable/buyable somewhere. Mega Rayquaza has no stone (it's
      // triggered by knowing Dragon Ascent), so it counts as done once Rayquaza itself is obtainable.
      if ("megaStone" in f && (f.megaStone || f.megaMove)) {
        const stone = f.megaStone ? itemById.get(f.megaStone) : undefined;
        const baseForm = f.unmegaForm === 0 ? null : p.forms.find((bf) => bf.formNumber === f.unmegaForm);
        const locationNames = stone
          ? stone.locations.map((l) => (l.source === "shop" ? `${l.locationName} (Shop)` : l.locationName))
          : locationsOf(f.unmegaForm, baseForm ? baseForm.foundIn : p.foundIn);
        const unique = [...new Set(locationNames)].sort((a, b) => a.localeCompare(b, "de"));
        const moveName = f.megaMove ? (moveById.get(f.megaMove)?.name ?? f.megaMove) : "";
        megaByGen.get(p.generation ?? 1)!.push({
          dexNumber,
          name: f.formName?.text || formLabel(p.name, f),
          trigger: stone ? stone.name : f.megaStone ?? `Attacke: ${moveName}`,
          done: unique.length > 0,
          locationNames: stone ? unique.join(", ") : unique.length > 0 ? `(${p.name}) ${unique.join(", ")}` : "",
        });
        continue;
      }
      // Battle-only forms: "Erledigt" once the out-of-battle form they come from is obtainable
      // (and, where one is needed, the triggering item too).
      const battleRule = BATTLE_ONLY_FORMS[p.id];
      if (battleRule && battleRule.forms.includes(f.formNumber)) {
        const baseNumber = battleRule.base ? battleRule.base(f.formNumber) : 0;
        const baseForm = forms.find((bf) => bf.formNumber === baseNumber) ?? forms[0];
        const baseNames = [...new Set(locationsOf(baseForm.formNumber, baseForm.foundIn))].sort((a, b) =>
          a.localeCompare(b, "de")
        );
        const itemId = typeof battleRule.item === "function" ? battleRule.item(f.formNumber) : battleRule.item;
        const item = itemId ? itemById.get(itemId) : undefined;
        const itemNames = item
          ? [...new Set(item.locations.map((l) => (l.source === "shop" ? `${l.locationName} (Shop)` : l.locationName)))]
          : [];
        const text = typeof battleRule.text === "function" ? battleRule.text(f.formNumber) : battleRule.text;
        const trigger = [
          battleRule.ability ? `Fähigkeit: ${abilityById.get(battleRule.ability)?.name ?? battleRule.ability}` : null,
          battleRule.move ? `Attacke: ${moveById.get(battleRule.move)?.name ?? battleRule.move}` : null,
          text ?? null,
          itemId ? `Item: ${item?.name ?? itemId}` : null,
        ].filter(Boolean);
        const baseLabel = formLabel(p.name, baseForm);
        const locationParts = [
          baseNames.length > 0 ? `${baseLabel}: ${baseNames.join(", ")}` : `${baseLabel}: noch nicht erhältlich`,
          ...(itemId ? [itemNames.length > 0 ? `${item?.name ?? itemId}: ${itemNames.join(", ")}` : `${item?.name ?? itemId}: noch nicht erhältlich`] : []),
        ];
        battleByGen.get(p.generation ?? 1)!.push({
          dexNumber,
          name: formLabel(p.name, f),
          trigger: trigger.join(", "),
          done: baseNames.length > 0 && (!itemId || itemNames.length > 0),
          locationNames: locationParts.join(" | "),
        });
        continue;
      }
      const locationNames = [...new Set(locationsOf(f.formNumber, f.foundIn))].sort((a, b) =>
        a.localeCompare(b, "de")
      );
      const row: Row = {
        dexNumber,
        name: formLabel(p.name, f),
        id: f.formNumber === 0 ? p.id : `${p.id}_${f.formNumber}`,
        count: locationNames.length,
        locationNames: locationNames.join(", "),
      };
      const target = row.count > 0 ? availableByGen : unavailableByGen;
      target.get(p.generation ?? 1)!.push(row);
    }
  });
  for (const gen of GENERATIONS) {
    availableByGen.get(gen)!.sort(byDexNumber);
    unavailableByGen.get(gen)!.sort(byDexNumber);
    megaByGen.get(gen)!.sort((a, b) => a.dexNumber - b.dexNumber);
    battleByGen.get(gen)!.sort((a, b) => a.dexNumber - b.dexNumber);
  }
  const availableTotal = [...availableByGen.values()].reduce((s, l) => s + l.length, 0);
  const unavailableTotal = [...unavailableByGen.values()].reduce((s, l) => s + l.length, 0);
  const megaRows = [...megaByGen.values()].flat();
  const megaDone = megaRows.filter((r) => r.done).length;
  const battleRows = [...battleByGen.values()].flat();
  const battleDone = battleRows.filter((r) => r.done).length;

  const wb = new ExcelJS.Workbook();
  wb.creator = "Chronoria Wiki (data-import/exportPokemonList.ts)";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Pokemon");
  const maxCols = GENERATIONS.length * AVAILABLE_COLUMNS.length;
  sheet.columns = Array.from({ length: maxCols }, (_, i) => ({
    width: AVAILABLE_COLUMNS[i % AVAILABLE_COLUMNS.length].width,
  }));

  let row = 1;
  sheet.getCell(row, 1).value = "Chronoria - Pokémon-Übersicht";
  sheet.getCell(row, 1).font = TITLE_FONT;
  row += 1;
  sheet.getCell(row, 1).value =
    "Generiert aus Wildfang-Encounterdaten (parseEncounters.ts) und dem Map-Event-Dump (parsePokemonMapLocations.ts: " +
    "pbAddPokemon/pbAddPokemonSilent, pbGenerateEgg, Pokemon.new, pbStartTrade), automatisch bei jedem build-data-Lauf. " +
    "Mega-Entwicklungen stehen in einer eigenen Liste ganz unten und gelten als erledigt (grün), sobald ihr " +
    "auslösender Mega-Stein irgendwo auffindbar oder kaufbar ist (Mega-Rayquaza: sobald Rayquaza erhältlich ist). " +
    "Darunter folgen die Formen, die nur im Kampf entstehen (z.B. Proto-Formen, Formeo, Durengard): erledigt, sobald " +
    "die Form, aus der sie entstehen, erhältlich ist (und ggf. das nötige Item). " +
    "Generationen stehen nebeneinander, sortiert nach Dex-Nummer. \"ID\" ist die interne PBS-ID (inkl. \"_N\"-Formen-Suffix). " +
    "Fundorte fassen Wildfang- und Event-/Geschenk-/Tausch-/Ei-Vorkommen zusammen, ohne die Quelle zu unterscheiden. " +
    "Bekannte Essentials-Demo-/Test-Maps werden ausgeschlossen (siehe parseMapLocations.ts EXCLUDED_MAP_IDS).";
  sheet.getCell(row, 1).font = NOTE_FONT;
  sheet.mergeCells(row, 1, row, maxCols);
  sheet.getRow(row).height = 60;
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };
  row += 2;

  row = writeGroupedSection(
    sheet,
    row,
    "Bereits verwendete Pokémon (Wildfang, Event, Geschenk, Tausch, Ei)",
    "Anzahl:",
    GENERATIONS,
    (gen) => `Generation ${gen}`,
    availableByGen,
    AVAILABLE_COLUMNS
  );
  row += 2;
  row = writeGroupedSection(
    sheet,
    row,
    "Noch nicht verwendete Pokémon/Formen",
    "Anzahl:",
    GENERATIONS,
    (gen) => `Generation ${gen}`,
    unavailableByGen,
    UNAVAILABLE_COLUMNS
  );
  row += 2;
  row = writeGroupedSection(
    sheet,
    row,
    `Mega-Entwicklungen (${megaDone} von ${megaRows.length} erledigt)`,
    "Anzahl:",
    GENERATIONS,
    (gen) => `Generation ${gen}`,
    megaByGen,
    MEGA_COLUMNS,
    (r) => (r.done ? MEGA_DONE_STYLE : null)
  );
  row += 2;
  writeGroupedSection(
    sheet,
    row,
    `Formen, die nur im Kampf entstehen (${battleDone} von ${battleRows.length} erledigt)`,
    "Anzahl:",
    GENERATIONS,
    (gen) => `Generation ${gen}`,
    battleByGen,
    BATTLE_FORM_COLUMNS,
    (r) => (r.done ? MEGA_DONE_STYLE : null)
  );

  await wb.xlsx.writeFile(OUT_PATH);
  return {
    used: availableTotal,
    unused: unavailableTotal,
    megaDone,
    megaTotal: megaRows.length,
    battleDone,
    battleTotal: battleRows.length,
    path: OUT_PATH,
  };
}
