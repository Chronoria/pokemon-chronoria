// Curated content categories for the items page's category dropdown - these cut across PBS
// "Pocket" boundaries, because pockets alone lump very different item kinds together (Pocket 1
// "Items" mixes held battle gear, evolution items, fossils and pure sell fodder; Pocket 2
// "Medizin" mixes HP/status healing, EV vitamins, PP items and EXP items). Every ID list below
// was hand-verified against the full E:\Test\PBS\items.txt (1001 items) - re-verify against the
// live file if items.txt gains new entries in one of these families.
//
// Deliberately NOT modeled here: TMs/Pokébälle/Beeren/Mega-Steine already have a clean,
// redundant-free 1:1 Pocket tab (4/3/5/6 - see src/lib/itemPockets.ts), so a duplicate category
// tab for them would be pointless. "Entwicklungs-Items" and "Sonstige Kampf-Items" are also not
// decided here: Entwicklungs-Items needs the parsed Pokémon evolution data (not available yet
// when items are parsed), and Sonstige Kampf-Items needs to know the FINAL category set
// (including Entwicklungs-Items) before it can correctly catch only genuinely uncategorized
// Pocket-1 items - both are added as a second pass in buildData.ts instead.
import type { Item } from "./dataModel.ts";

export const CATEGORY_IDS = {
  TRAININGS_ITEMS: "trainings-items",
  HEILUNG: "heilung",
  PP_ITEMS: "pp-items",
  ENTWICKLUNG: "entwicklung", // assigned in buildData.ts
  FOSSILIEN: "fossilien",
  TYPVERSTAERKER: "typverstaerker",
  TYP_JUWELEN: "typ-juwelen",
  ARCEUS_TAFELN: "arceus-tafeln",
  SILVALLY_DISKS: "silvally-disks",
  GENESECT_MODULE: "genesect-module",
  RAEUCHERWERK: "raeucherwerk",
  WAHL_ITEMS: "wahl-items",
  TERRAIN_SAMEN: "terrain-samen",
  VERKAUFSWARE: "verkaufsware",
  ZUTATEN: "zutaten",
  FORMWECHSEL: "formwechsel",
  SONSTIGE_KAMPF_ITEMS: "sonstige-kampf-items", // assigned in buildData.ts
} as const;

// Vitamine (EVs), ihre schwächeren Feder-/Mochi-Äquivalente, EP-Bonbons/Sonderbonbon und die
// Fähigkeiten-Items - alles, was primär dem Trainieren/Verbessern des eigenen Pokémon dient statt
// dem Heilen. Nutzerentscheidung: mit den EP-Items zusammengelegt statt zwei separate Kategorien.
const TRAININGS_ITEMS = new Set([
  "PROTEIN", "IRON", "CALCIUM", "ZINC", "CARBOS", "HPUP",
  "HEALTHFEATHER", "MUSCLEFEATHER", "RESISTFEATHER", "GENIUSFEATHER", "CLEVERFEATHER", "SWIFTFEATHER",
  "HEALTHMOCHI", "MUSCLEMOCHI", "RESISTMOCHI", "GENIUSMOCHI", "CLEVERMOCHI", "SWIFTMOCHI", "FRESHSTARTMOCHI",
  "EXPCANDYXS", "EXPCANDYS", "EXPCANDYM", "EXPCANDYL", "EXPCANDYXL", "RARECANDY",
  "ABILITYCAPSULE", "ABILITYPATCH",
]);

const PP_ITEMS = new Set(["ETHER", "MAXETHER", "ELIXIR", "MAXELIXIR", "PPUP", "PPMAX"]);

// Klassische Typ-Verstärker (permanent haltbar, +Schaden auf einen Typ) - Metallmantel gehört
// bewusst auch hierher UND zu den Entwicklungs-Items (buildData.ts), ein Item darf in mehreren
// Kategorien stehen.
const TYPVERSTAERKER = new Set([
  "CHARCOAL", "MYSTICWATER", "MAGNET", "MIRACLESEED", "NEVERMELTICE", "BLACKBELT", "POISONBARB",
  "SOFTSAND", "SHARPBEAK", "TWISTEDSPOON", "SILVERPOWDER", "HARDSTONE", "SPELLTAG", "DRAGONFANG",
  "BLACKGLASSES", "SILKSCARF", "FAIRYFEATHER", "METALCOAT",
]);

const ARCEUS_TAFELN = new Set([
  "FLAMEPLATE", "SPLASHPLATE", "ZAPPLATE", "MEADOWPLATE", "ICICLEPLATE", "FISTPLATE", "TOXICPLATE",
  "EARTHPLATE", "SKYPLATE", "MINDPLATE", "INSECTPLATE", "STONEPLATE", "SPOOKYPLATE", "DRACOPLATE",
  "DREADPLATE", "IRONPLATE", "PIXIEPLATE", "LEGENDPLATE", "BLANKPLATE",
]);

const SILVALLY_DISKS = new Set([
  "FIREMEMORY", "WATERMEMORY", "ELECTRICMEMORY", "GRASSMEMORY", "ICEMEMORY", "FIGHTINGMEMORY",
  "POISONMEMORY", "GROUNDMEMORY", "FLYINGMEMORY", "PSYCHICMEMORY", "BUGMEMORY", "ROCKMEMORY",
  "GHOSTMEMORY", "DRAGONMEMORY", "DARKMEMORY", "STEELMEMORY", "FAIRYMEMORY",
]);

const GENESECT_MODULE = new Set(["DOUSEDRIVE", "SHOCKDRIVE", "BURNDRIVE", "CHILLDRIVE"]);

const RAEUCHERWERK = new Set([
  "LAXINCENSE", "FULLINCENSE", "LUCKINCENSE", "PUREINCENSE", "SEAINCENSE",
  "WAVEINCENSE", "ROSEINCENSE", "ODDINCENSE", "ROCKINCENSE",
]);

const WAHL_ITEMS = new Set(["CHOICEBAND", "CHOICESPECS", "CHOICESCARF"]);

// Nicht per Suffix ("*SEED") erkennbar, weil MIRACLESEED (Typverstärker) sonst fälschlich
// mitgezogen würde - deshalb eine explizite Liste statt eines Musters.
const TERRAIN_SAMEN = new Set(["ELECTRICSEED", "GRASSYSEED", "MISTYSEED", "PSYCHICSEED"]);

// Fossil-Flag deckt die klassischen Fossilien ab, aber nicht die vier modernen (Paldea-Stil) -
// die tragen in dieser items.txt gar kein Flag (nur eine Fling-Stufe), verifiziert am echten Text.
const UNFLAGGED_FOSSILS = new Set(["FOSSILIZEDBIRD", "FOSSILIZEDFISH", "FOSSILIZEDDRAKE", "FOSSILIZEDDINO"]);

// Reine Sammler-/Verkaufsware ohne Kampf- oder Feldnutzen. Altbernstein (OLDAMBER) ist bewusst
// NICHT hier gelistet, obwohl es oberflächlich passen würde - es trägt bereits das Fossil-Flag
// und landet dadurch in "Fossilien".
const VERKAUFSWARE = new Set([
  "REDSHARD", "YELLOWSHARD", "BLUESHARD", "GREENSHARD",
  "PEARL", "BIGPEARL", "PEARLSTRING",
  "STARDUST", "STARPIECE", "COMETSHARD",
  "NUGGET", "BIGNUGGET",
  "TINYMUSHROOM", "BIGMUSHROOM", "BALMMUSHROOM",
  "PRETTYFEATHER",
  "RELICCOPPER", "RELICSILVER", "RELICGOLD", "RELICVASE", "RELICBAND", "RELICSTATUE", "RELICCROWN",
  "SHOALSALT", "SHOALSHELL",
  "RAREBONE", "ODDKEYSTONE", "SLOWPOKETAIL",
]);

// Items that change an already-existing Pokémon's form (not an evolution, and not the
// battle-only/reverts-after-battle Mega Evolution or Primal-Reversion-style transformations -
// those already have their own Mega-Steine pocket tab / Roter/Blauer Edelstein, deliberately not
// duplicated here). Verified against each item's own description text, not assumed from general
// Pokémon knowledge - e.g. UNREMARKABLETEACUP/MASTERPIECETEACUP mention a "form" too but are
// evolution items (see the Entwicklungs-Items cross-reference in buildData.ts), not form-changers.
const FORMWECHSEL = new Set([
  "METEORITE", // Deoxys
  "GRACIDEA", // Shaymin
  "REVEALGLASS", // Boreos/Voltolos/Demeteros/Cupidos
  "PRISONBOTTLE", // Hoopa
  "ZYGARDECUBE", // Zygarde
  "ADAMANTCRYSTAL", "LUSTROUSGLOBE", "GRISEOUSCORE", // Dialga/Palkia/Giratina
  "RUSTEDSWORD", "RUSTEDSHIELD", // Zacian/Zamazenta
  "WELLSPRINGMASK", "HEARTHFLAMEMASK", "CORNERSTONEMASK", "TEALMASK", // Ogerpon
  "DNASPLICERS", "NSOLARIZER", "NLUNARIZER", "REINSOFUNITY", // Kyurem/Necrozma/Coronospa fusions
]);

/**
 * Every category assignable purely from an item's own PBS fields (pocket/flags/id) - excludes
 * "Entwicklungs-Items" (needs cross-referenced Pokémon evolution data, added later in
 * buildData.ts) and "Sonstige Kampf-Items" (needs the final category set first, also added in
 * buildData.ts). An item can land in more than one category - no priority/first-match order.
 */
export function classifyItem(item: Item): string[] {
  const categories: string[] = [];

  // Pocket 2 ("Medizin") is fully partitioned by these three checks - Heilung is deliberately
  // the "everything else in this pocket" fallback rather than its own curated list, so it can't
  // silently miss a new healing item added to items.txt later.
  if (item.pocket === 2) {
    if (TRAININGS_ITEMS.has(item.id)) categories.push(CATEGORY_IDS.TRAININGS_ITEMS);
    else if (PP_ITEMS.has(item.id)) categories.push(CATEGORY_IDS.PP_ITEMS);
    else categories.push(CATEGORY_IDS.HEILUNG);
  }

  if (item.flags.includes("Fossil") || UNFLAGGED_FOSSILS.has(item.id)) categories.push(CATEGORY_IDS.FOSSILIEN);
  if (item.flags.includes("TypeGem")) categories.push(CATEGORY_IDS.TYP_JUWELEN);
  if (TYPVERSTAERKER.has(item.id)) categories.push(CATEGORY_IDS.TYPVERSTAERKER);
  if (ARCEUS_TAFELN.has(item.id)) categories.push(CATEGORY_IDS.ARCEUS_TAFELN);
  if (SILVALLY_DISKS.has(item.id)) categories.push(CATEGORY_IDS.SILVALLY_DISKS);
  if (GENESECT_MODULE.has(item.id)) categories.push(CATEGORY_IDS.GENESECT_MODULE);
  if (RAEUCHERWERK.has(item.id)) categories.push(CATEGORY_IDS.RAEUCHERWERK);
  if (WAHL_ITEMS.has(item.id)) categories.push(CATEGORY_IDS.WAHL_ITEMS);
  if (TERRAIN_SAMEN.has(item.id)) categories.push(CATEGORY_IDS.TERRAIN_SAMEN);
  if (VERKAUFSWARE.has(item.id)) categories.push(CATEGORY_IDS.VERKAUFSWARE);
  // "Rezepte" covers both "Rezept" and "Rezepte" (substring match) - Kochzutaten, both actual
  // Berry-flagged berries and the non-berry Pocket-5 items (butters/salt/oil), described this way.
  if (item.description.includes("Rezept")) categories.push(CATEGORY_IDS.ZUTATEN);
  if (FORMWECHSEL.has(item.id)) categories.push(CATEGORY_IDS.FORMWECHSEL);

  return categories;
}

// Essentials' evolution-method names all embed "Item" for every method that consumes an item id
// as its param - not just the obvious "Item"/"ItemMale"/"ItemFemale"/"ItemNight", but also
// "HoldItem"/"NightHoldItem"/"DayHoldItem" and "LevelDefeatItsKindWithItem". A plain
// startsWith("Item") check (as used elsewhere for a price-suggestion heuristic) misses the
// Hold-prefixed ones entirely, which would silently drop real evolution items like
// Verbindungsschnur/Scharfklaue/Scharfzahn/Ovaler Stein - confirmed against pokemon.txt's actual
// Evolutions lines, not assumed.
export function isItemEvolutionMethod(method: string): boolean {
  return method.includes("Item");
}
