// Deterministic, rule-based price-suggestion logic for the "Preise" sheet in
// Item-Uebersicht.xlsx (see exportItemPrices.ts). Every rule is derived from data already
// parsed elsewhere (Item.flags/pocket/price/sellPrice, Pokemon.evolutions) - nothing here is a
// hardcoded per-item value, so the suggestions stay in sync automatically whenever the PBS
// files or pokemon.txt evolutions change.
import type { Item, Pokemon } from "./dataModel.ts";

export type PriceCategory =
  | "KeyItem"
  | "UniqueFormItem"
  | "EvolutionStone"
  | "MegaStone"
  | "Beere"
  | "Medizin"
  | "Pokeball"
  | "Verkaufsware"
  | "Sonstiges";

const CATEGORY_LABELS: Record<PriceCategory, string> = {
  KeyItem: "Key Item",
  UniqueFormItem: "Einzigartig",
  EvolutionStone: "Entwicklungsstein",
  MegaStone: "Mega-Stein",
  Beere: "Beere",
  Medizin: "Medizin",
  Pokeball: "Pokéball",
  Verkaufsware: "Verkaufsware",
  Sonstiges: "Sonstiges",
};

export function categoryLabel(category: PriceCategory): string {
  return CATEGORY_LABELS[category];
}

// Threshold matching the handful of once-per-legendary form items (Adamant Crystal, Weiß-/
// Griseous-/Legend-Kristall for Dialga/Palkia/Giratina/Arceus): high Price, explicitly
// SellPrice = 0. Verified against the current data: no item in the base items.txt reaches this
// combination, it's exclusive to four items in items_Gen_9_Pack.txt. A KeyItem is checked first
// below, so this only ever fires for items that are technically purchasable/tradeable but
// deliberately worthless to sell back.
const UNIQUE_FORM_ITEM_MIN_PRICE = 15000;

export function classifyItem(item: Item): PriceCategory {
  if (item.flags.includes("KeyItem")) return "KeyItem";
  if ((item.price ?? 0) >= UNIQUE_FORM_ITEM_MIN_PRICE && item.sellPrice === 0) return "UniqueFormItem";
  if (item.flags.includes("EvolutionStone")) return "EvolutionStone";
  if (item.flags.includes("MegaStone") || item.pocket === 6) return "MegaStone";
  if (item.flags.includes("Berry")) return "Beere";
  if (item.pocket === 2) return "Medizin";
  if (item.pocket === 3) return "Pokeball";
  // No FieldUse means the item can't be used from the bag at all - the "nur zum Verkauf
  // geeignet" category (Scherben, Fossilien, Perlen, ...). Price = 0 items without FieldUse are
  // usually quest markers rather than sell fodder, so they fall through to "Sonstiges" instead.
  if (!item.fieldUse && (item.price ?? 0) > 0) return "Verkaufsware";
  return "Sonstiges";
}

// The Essentials evolution schema uses "Item" plus gender/time-locked variants ("ItemMale",
// "ItemFemale", "ItemDay", "ItemNight", ...) for every evolution method that consumes a held/
// used item - mirrors the method-name convention parsePokemon.ts already relies on for
// ZERO_PARAM_EVOLUTION_METHODS, just from the opposite direction (these methods always DO carry
// an item-id param).
function isItemEvolutionMethod(method: string): boolean {
  return method.startsWith("Item");
}

/** Counts, per item id, how many species evolutions (across pokemon.txt AND the Gen 9 pack,
 *  since parsePokemon.ts already merges both into one Pokemon[]) consume that item - e.g.
 *  Thunder Stone/Linking Cord currently sit at 7 uses each, while most single-purpose stones
 *  sit at 1. Branching evolution lines (e.g. Eevee-likes) contribute one count per branch. */
export function countEvolutionStoneUsage(pokemon: Pokemon[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of pokemon) {
    for (const evo of p.evolutions) {
      if (isItemEvolutionMethod(evo.method) && evo.param) {
        counts.set(evo.param, (counts.get(evo.param) ?? 0) + 1);
      }
    }
  }
  return counts;
}

/** Discrete tiers calibrated against the actual usage distribution in this project (top usage
 *  is 7, most stones sit at exactly 1). A stone with no evolution using it yet (usageCount 0)
 *  has no signal to reprice from, so it keeps its current price rather than guessing at one. */
function evolutionStoneSuggestedPrice(usageCount: number, currentPrice: number): number {
  if (usageCount <= 0) return currentPrice;
  if (usageCount >= 7) return 1000;
  if (usageCount >= 5) return 1500;
  if (usageCount >= 3) return 2000;
  if (usageCount === 2) return 2500;
  return 3000; // usageCount === 1
}

/** usageCount is only meaningful for EvolutionStone-category items; callers pass 0 for
 *  everything else, where it's simply ignored. */
export function suggestPrice(item: Item, category: PriceCategory, usageCount: number): number {
  const current = item.price ?? 0;
  switch (category) {
    case "KeyItem":
    case "UniqueFormItem":
      // Unsellable/unique by design - never suggest a change.
      return current;
    case "EvolutionStone":
      return evolutionStoneSuggestedPrice(usageCount, current);
    default:
      // No calibrated per-category band exists yet for Mega-Stein/Beere/Medizin/Pokeball/
      // Verkaufsware/Sonstiges - their current prices already fall in plausible ranges, so the
      // rule is to confirm rather than invent a number without evidence.
      return current;
  }
}
