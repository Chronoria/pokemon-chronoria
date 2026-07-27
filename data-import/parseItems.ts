import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parsePbsBlocks, blockToRecord, splitList, type PbsBlock } from "./parsePbs.ts";
import { resolveInlineName, type TranslationContext } from "./translationContext.ts";
import { hashFile } from "./fileHash.ts";
import { classifyItem } from "./itemCategoryRules.ts";
import type { Item } from "./dataModel.ts";

const SOURCE_DIR = join(import.meta.dirname, "source", "PBS");
const ICONS_DIR = join(import.meta.dirname, "..", "public", "item-icons");

function load(file: string): string {
  return readFileSync(join(SOURCE_DIR, file), "utf-8");
}

function toNumberOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

/** Icon files are named exactly like the PBS internal id (case-sensitive), same convention
 *  as the Pokémon sprites. */
function loadIconIndex(): Map<string, string> {
  const index = new Map<string, string>();
  if (!existsSync(ICONS_DIR)) return index;
  for (const name of readdirSync(ICONS_DIR)) {
    index.set(name.replace(/\.png$/i, ""), name);
  }
  return index;
}

function blockToItem(block: PbsBlock, ctx: TranslationContext, icons: Map<string, string>): Item {
  const r = blockToRecord(block);
  const id = block.headerParts[0];
  const resolvedName = resolveInlineName(ctx.itemName, id, r.Name ?? id);
  const icon = icons.get(id) ?? null;
  const item: Item = {
    id,
    name: resolvedName.text,
    nameFallback: resolvedName.fallback,
    namePlural: r.NamePlural ?? null,
    description: r.Description ?? "",
    pocket: toNumberOrNull(r.Pocket),
    price: toNumberOrNull(r.Price),
    sellPrice: toNumberOrNull(r.SellPrice),
    fieldUse: r.FieldUse ?? null,
    flags: splitList(r.Flags),
    icon,
    iconVersion: icon ? hashFile(join(ICONS_DIR, icon)) : null,
    move: r.Move ?? null,
    // "entwicklung"/"sonstige-kampf-items" need cross-referenced Pokémon data that isn't parsed
    // yet at this point - buildData.ts appends those in a second pass.
    categories: [],
    locations: [],
  };
  item.categories = classifyItem(item);
  return item;
}

// Description is already hand-translated German directly in the base file and every
// expansion pack (except items_raid_bait.txt, a single custom item left in English). Name is
// only translated inline for about half of items.txt - resolveInlineName() prefers the
// ITEM_NAMES.txt name-anchor (covers ~74%) and falls back to the inline field.
const ITEM_FILES = ["items.txt", "items_Gen_9_Pack.txt", "items_MedalBox.txt", "items_raid_bait.txt"];

// Essentials models an item's "used/off/empty" state as its own separate PBS entry rather than
// a flag on the original - e.g. EXPALL ("EP-Teiler", distributes EXP) has a distinct EXPALLOFF
// ("EP-Solo") entry for its disabled state, and the four Fusion/Necrosol-style items have a
// "...USED" counterpart representing the already-fused pair. Only the active/useful state should
// ever show up on the wiki, so the counterpart is dropped entirely here (not just hidden in the
// UI) - confirmed against E:\Test\PBS\items.txt, every pair follows this exact OFF/EMPTY/USED
// suffix convention. KEYCARD/KEYCARD2 and KAEFERSAMMLERITEM/PROFIANGLERITEM look similar
// (identical name+description, no suffix pattern) but were confirmed with the project owner to
// be left alone - no suffix convention ties them together, so they might be genuinely separate.
const HIDDEN_DUPLICATE_ITEM_IDS = new Set([
  "EXPALLOFF", // duplicate of EXPALL ("EP-Teiler"), disabled state
  "EMPTYVIAL", // duplicate of VIAL ("Pokévial"), empty state
  "NSOLARIZERUSED", // duplicate of NSOLARIZER ("Necrosol"), already-fused state
  "NLUNARIZERUSED", // duplicate of NLUNARIZER ("Necrolun"), already-fused state
  "DNASPLICERSUSED", // duplicate of DNASPLICERS ("DNS-Keil"), already-fused state
  "REINSOFUNITYUSED", // duplicate of REINSOFUNITY ("Zügel des Bundes"), already-fused state
]);

export function parseItems(ctx: TranslationContext): Item[] {
  const icons = loadIconIndex();
  const items = new Map<string, Item>();
  for (const file of ITEM_FILES) {
    for (const block of parsePbsBlocks(load(file))) {
      const id = block.headerParts[0];
      if (HIDDEN_DUPLICATE_ITEM_IDS.has(id)) continue;
      items.set(id, blockToItem(block, ctx, icons));
    }
  }
  return [...items.values()];
}
