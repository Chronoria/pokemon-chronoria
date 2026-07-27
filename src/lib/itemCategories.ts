// Display labels + fixed dropdown order for the items page's category filter (see
// data-import/itemCategoryRules.ts for how items get assigned to these - IDs are imported from
// there rather than duplicated as string literals, so the two can't drift out of sync).
import { CATEGORY_IDS } from "../../data-import/itemCategoryRules.ts";

export const ITEM_CATEGORIES: { id: string; label: string }[] = [
  { id: CATEGORY_IDS.TRAININGS_ITEMS, label: "Trainings-Items" },
  { id: CATEGORY_IDS.HEILUNG, label: "LP-heilende Items" },
  { id: CATEGORY_IDS.PP_ITEMS, label: "PP-Items" },
  { id: CATEGORY_IDS.ENTWICKLUNG, label: "Entwicklungs-Items" },
  { id: CATEGORY_IDS.FOSSILIEN, label: "Fossilien" },
  { id: CATEGORY_IDS.TYPVERSTAERKER, label: "Typverstärker" },
  { id: CATEGORY_IDS.ARCEUS_TAFELN, label: "Arceus-Tafeln" },
  { id: CATEGORY_IDS.SILVALLY_DISKS, label: "Silvally-Disks" },
  { id: CATEGORY_IDS.TYP_JUWELEN, label: "Typ-Juwelen" },
  { id: CATEGORY_IDS.GENESECT_MODULE, label: "Genesect-Module" },
  { id: CATEGORY_IDS.RAEUCHERWERK, label: "Räucherwerk" },
  { id: CATEGORY_IDS.WAHL_ITEMS, label: "Wahl-Items" },
  { id: CATEGORY_IDS.TERRAIN_SAMEN, label: "Terrain-Samen" },
  { id: CATEGORY_IDS.VERKAUFSWARE, label: "Verkaufsware" },
  { id: CATEGORY_IDS.ZUTATEN, label: "Zutaten" },
  { id: CATEGORY_IDS.FORMWECHSEL, label: "Formwechsel" },
  { id: CATEGORY_IDS.SONSTIGE_KAMPF_ITEMS, label: "Sonstige Kampf-Items" },
];
