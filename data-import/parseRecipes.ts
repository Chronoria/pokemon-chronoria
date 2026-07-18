// Reads PBS/recipes.txt (cooking/crafting recipes) to know which items are recipe ingredients
// vs. recipe results, for the "Items nach Tasche" sheet's color coding (exportItemsByPocket.ts).
// More precise than exportItemList.ts's isRecipeIngredient(), which only guesses from whether the
// item's description text happens to mention "Rezept".
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parsePbsBlocks, splitList } from "./parsePbs.ts";

const SOURCE_DIR = join(import.meta.dirname, "source", "PBS");
const FILE_PATH = join(SOURCE_DIR, "recipes.txt");

export interface RecipeData {
  resultItemIds: Set<string>;
  ingredientItemIds: Set<string>;
}

export function parseRecipes(): RecipeData {
  const resultItemIds = new Set<string>();
  const ingredientItemIds = new Set<string>();
  if (!existsSync(FILE_PATH)) return { resultItemIds, ingredientItemIds };

  const raw = readFileSync(FILE_PATH, "utf-8");
  for (const block of parsePbsBlocks(raw)) {
    for (const line of block.lines) {
      // recipes.txt writes "Key=Value" with no surrounding spaces, unlike most other PBS files -
      // parsePbsBlocks's line.key/value (which requires " = ") stays null here, so split raw ourselves.
      const eq = line.raw.indexOf("=");
      if (eq < 0) continue;
      const key = line.raw.slice(0, eq).trim();
      const value = line.raw.slice(eq + 1).trim();
      if (key === "Item") {
        resultItemIds.add(value);
      } else if (key === "Ingredients") {
        // Alternating "ID,quantity" pairs - every even-indexed entry is an item id.
        const parts = splitList(value);
        for (let i = 0; i < parts.length; i += 2) {
          if (parts[i]) ingredientItemIds.add(parts[i]);
        }
      }
    }
  }
  return { resultItemIds, ingredientItemIds };
}
